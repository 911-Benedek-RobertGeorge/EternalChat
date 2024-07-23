import { expect } from "chai";
import { ethers } from "hardhat";
import { EthernalChatIncentivized } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CID } from "multiformats";
import { fromHex, toHex } from "viem";
import * as jsonCodec from 'multiformats/codecs/json'
import * as crypto from 'crypto';
import { keccak256 } from "ethers";
const Hash = require('ipfs-only-hash')


async function deployContract() {
  let ethernalChat: EthernalChatIncentivized;
  const [owner, acc1, acc2] = await ethers.getSigners();
  const yourContractFactory = await ethers.getContractFactory("EthernalChatIncentivized");
  ethernalChat = (await yourContractFactory.deploy()) as EthernalChatIncentivized;
  await ethernalChat.waitForDeployment();

  return {
    ethernalChat,
    owner,
    acc1,
    acc2,
  };
}

function CidToBytes(newCid: CID): string{
  // const cidObj = CID.parse(newCid);    
  const cidBytes = newCid.multihash.bytes.slice(2);

  if (cidBytes.length !== 32) {
      throw new Error('Invalid Cid');
  }
  const hexString = toHex(cidBytes);
  return hexString;

}

function bytesToCid(cidStored: string): CID {

  const bytes = fromHex(cidStored as `0x${string}`,{
    size: 32,
    to: 'bytes'
  });

    const prefix  = Buffer.from([18, 32]);
    const resultBuffer = Buffer.concat([prefix, Buffer.from(bytes)]);
    const _newCid = CID.decode(resultBuffer);
    const newCid = CID.createV1(jsonCodec.code,_newCid.multihash);                    
  return newCid    
}

function chunkString(str: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
}


function hashChunk(chunk: string): string {
  return keccak256(Buffer.from(chunk));
}

function calculateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newHashes: string[] = [];
  for (let i = 0; i < hashes.length; i += 2) {
    if (i + 1 < hashes.length) {
      // Concatenate the hashes and hash them again
      const combinedHash = keccak256(Buffer.concat([
        Buffer.from(hashes[i].slice(2), 'hex'),
        Buffer.from(hashes[i + 1].slice(2), 'hex')
      ]));
      newHashes.push(combinedHash);
    } else {
      // If there is an odd number of elements, push the last one
      newHashes.push(hashes[i]);
    }
  }

  return calculateMerkleRoot(newHashes);
}

function getMerkleRootFromJson(json: string, chunkSize: number): string {
  const chunks = chunkString(json, chunkSize);
  const hashes = chunks.map(hashChunk);
  return calculateMerkleRoot(hashes);
}

function preprocessData(jsonString: string, chunkSize: number, padChar = '~') {
  if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
      let preprocessed = jsonString.slice(1, -1);
      // Add padding to make the length a multiple of chunkSize
      const paddingLength = chunkSize - (preprocessed.length % chunkSize);
      if (paddingLength !== chunkSize) {
          preprocessed = preprocessed.padEnd(preprocessed.length + paddingLength, padChar);
      }
      return preprocessed;
  } else {
      throw new Error('Invalid JSON array format');
  }
}

function postprocessData(string: string, chunkSize: number, padChar = '~') {
  // Remove the padding before adding the brackets
  // This regex ensures that only the padding at the end is removed
  const trimmedString = string.replace(new RegExp(padChar + '+$'), '');
  return '[' + trimmedString + ']';
}

function chunkData(data:string, chunkSize: number, padChar = '~') {
  let chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
      let chunk = data.slice(i, i + chunkSize);
      if (chunk.length < chunkSize) {
          chunk = chunk.padEnd(chunkSize, padChar);
      }
      chunks.push(chunk);
  }
  return chunks;
}

function unchunkData(chunks: string[], padChar = '~') {
  let data = chunks.join('');
  // Remove the padding from the end
  // This regex ensures that only the padding at the end is removed
  return data.replace(new RegExp(padChar + '+$'), '');
}




describe("EthernalChatIncentivized", function () {

  async function getCidAndData(data: any,numChunks: bigint){

    const dataJson = JSON.stringify(data);
    const size = BigInt(new Blob([dataJson]).size);
    const chunkSize = size / numChunks;
    const processedData= preprocessData(dataJson,Number(chunkSize))
  
    const cidHash  = await Hash.of(processedData);
    const cid = CID.parse(cidHash);
    
    const cidBytes = CidToBytes(cid);
  
    const merkleRoot = getMerkleRootFromJson(processedData,Number(chunkSize));

    return {
      processedData,
      cidBytes,
      cid,
      merkleRoot,
      chunkSize
    }
  }
  


  describe("SetCID", function () {
    it("should properly add a CID for the first time", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const numChunks = 2n;
      const {processedData,cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

      const response = await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,merkleRoot);
      console.log(response.toJSON());
      console.log(acc1.address);
      
      response.wait();
      const storedCidString = await ethernalChatAcc1.getCID() 
      const storedCid= bytesToCid(storedCidString);
      expect(cid.multihash.bytes).to.eqls(storedCid.multihash.bytes);
    });

    it("should revert if the merkle roots doesn't match for the first time", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const data2 = [{"test":2}];
      const numChunks = 2n;
      const {processedData,cidBytes,merkleRoot, chunkSize} = await getCidAndData(data,numChunks)
      const {merkleRoot: fakeMerkleRoot} = await getCidAndData(data2,numChunks)
      expect(merkleRoot).to.not.equals(fakeMerkleRoot);
      await expect(ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,fakeMerkleRoot)).to.be.rejectedWith("MerkleRoot and MerkleRootOfAppendedData should be the same initially");
    });

    // it("should add new CID when appending data and check the hashes when appending", async function () {
    //   const {ethernalChat, jsonHelia, acc1} = await loadFixture(deployContract);
    //   const ethernalChatAcc1 = ethernalChat.connect(acc1)
    //   const data = {"test":1};
    //   const data2 = {"test":2};
    //   const numChunks = 2n;
    //   const {processedData,cidBytes,merkleRoot, chunkSize} = await getCidAndData(data,jsonHelia,numChunks)
    //   const {merkleRoot: fakeMerkleRoot} = await getCidAndData(data,jsonHelia,numChunks)

    //   await expect(ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,fakeMerkleRoot)).to.be.rejected;
    // });

    // it("should revert if the data has been modified", async function () {
    //   // expect(await ethernalChat.greeting()).to.equal("Building Unstoppable Apps!!!");
    // });

  });
});
