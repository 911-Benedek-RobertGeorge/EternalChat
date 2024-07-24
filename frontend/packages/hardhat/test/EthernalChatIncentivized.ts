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

// function calculateMerkleRoot(hashes: string[]): string {
//   if (hashes.length === 1) {
//     return hashes[0];
//   }

//   const newHashes: string[] = [];
//   for (let i = 0; i < hashes.length; i += 2) {
//     if (i + 1 < hashes.length) {
//       // Concatenate the hashes and hash them again
//       const combinedHash = keccak256(Buffer.concat([
//         Buffer.from(hashes[i].slice(2), 'hex'),
//         Buffer.from(hashes[i + 1].slice(2), 'hex')
//       ]));
//       newHashes.push(combinedHash);
//     } else {
//       // If there is an odd number of elements, push the last one
//       newHashes.push(hashes[i]);
//     }
//   }

//   return calculateMerkleRoot(newHashes);
// }

function  calculateMerkleRoot(hashes: string[]): string {
  while (hashes.length > 1) {
    const newHashes : string[]= [];
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
    hashes = newHashes;
  }
  return hashes[0];
}

function getMerkleRootFromJson(json: string, chunkSize: number): string {
  const chunks = chunkString(json, chunkSize);
  const hashes = chunks.map(hashChunk);
  return calculateMerkleRoot(hashes);
}

function preprocessData(jsonString: string, chunkSize: number, appending?: boolean, padChar = '~') {
  if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
      let preprocessed = jsonString.slice(1, -1);
      if(appending){
        // We need to add ','
        preprocessed = ',' + preprocessed;
      }
      // Add padding to make the length a multiple of chunkSize
      const paddingLength = chunkSize - (preprocessed.length % chunkSize);
      if (paddingLength !== chunkSize) {
          preprocessed = preprocessed.padEnd(preprocessed.length + paddingLength, padChar);
      }
      return preprocessed;
  } else {
      throw new Error(`Invalid JSON array format: ${jsonString}`);
  }
}

function postprocessData(string: string, chunkSize: number, padChar = '~') {
  // Remove the padding before adding the brackets
  // Use a regular expression to remove padding characters that appear after `}`
  const trimmedString = string.replace(new RegExp(`\\}${padChar}*`, 'g'), '}');
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

  async function getCidAndData(data: any,numChunks?: bigint, chunkSize?: bigint){

    const dataJson = JSON.stringify(data);
    const size = BigInt(new Blob([dataJson]).size);
    if (!chunkSize && numChunks){
      chunkSize = size / numChunks;
    } else if(chunkSize){
      numChunks = size / chunkSize ;
      if (size % chunkSize != 0n){
        numChunks += 1n
      }
    } else {
      throw Error("numChunks or ChunkSize should be specified")
    }
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
      chunkSize,
      numChunks
    }
  }

  async function appendData(prevData: any , data2: any, chunkSize: number) {
    // Preprocess the new data
    const data2Json = JSON.stringify(data2);
    const preprocessedData2 = preprocessData(data2Json, chunkSize, true);

    // Combine the previous processed data with the new preprocessed data
    const prevDataJson = JSON.stringify(prevData);
    const preprocessedData = preprocessData(prevDataJson, chunkSize);
    const combinedData = preprocessedData + preprocessedData2;

    // Chunk the combined data
    const combinedChunks = chunkData(combinedData, chunkSize);
    const numChunks = combinedChunks.length;

    // Calculate the new Merkle root
    const newHashes = combinedChunks.map(hashChunk);
    const newMerkleRoot = calculateMerkleRoot(newHashes);

    // Calculate the Merkle root of the appended data
    const appendedHashes = chunkData(preprocessedData2, chunkSize).map(hashChunk);
    const merkleRootOfAppendedData = calculateMerkleRoot(appendedHashes);

    const cidHash  = await Hash.of(combinedData);
    const cid = CID.parse(cidHash);
    
    const cidBytes = CidToBytes(cid);

  //    // Ensure the concatenation of the old Merkle root and the Merkle root of the new data matches the new Merkle root
  //    const combinedRootHash = keccak256(Buffer.concat([
  //     Buffer.from(prevMerkle.slice(2), 'hex'),
  //     Buffer.from(merkleRootOfAppendedData.slice(2), 'hex')
  // ]));

  // expect(newMerkleRoot).to.equal(combinedRootHash, "Data not appended correctly");

    return {
        combinedData,
        newMerkleRoot,
        merkleRootOfAppendedData,
        newCid: cidBytes,
        newNumChunks: numChunks
    };
}

  describe("SetCID", function () {
    it("should properly add a CID for the first time", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const numChunks = 2n;
      const {processedData,cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

      const response = await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,merkleRoot);
      response.wait();
      const storedCidString = await ethernalChatAcc1.getCID(acc1.address) 
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

    it("should add new CID when appending data and check the hashes when appending", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const appendedData = [{"test2":2}]
      const numChunks = 2n;
      const {processedData,cidBytes,merkleRoot, chunkSize} = await getCidAndData(data,numChunks)
      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,merkleRoot);

      const {combinedData, newMerkleRoot, merkleRootOfAppendedData, newCid, newNumChunks} = await appendData(data,appendedData,Number(chunkSize));

      await expect(ethernalChatAcc1.setCID(newCid,newNumChunks,chunkSize,newMerkleRoot,merkleRootOfAppendedData)).to.not.be.rejected;
      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      expect(newCid).to.eqls(storedCidString);

      expect(JSON.stringify([{"test":1},{"test2":2}])).to.equals(postprocessData(combinedData,Number(chunkSize)));

    });

    it("should revert if the data has been modified", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const modifiedData = [{"test":2}];
      const appendedData = [{"test2":2}]
      const numChunks = 2n;
      const {processedData,cidBytes,merkleRoot, chunkSize} = await getCidAndData(data,numChunks)
      
      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot,merkleRoot);

      const {combinedData, newMerkleRoot, merkleRootOfAppendedData, newCid, newNumChunks} = await appendData(modifiedData,appendedData,Number(chunkSize));

      await expect(ethernalChatAcc1.setCID(newCid,newNumChunks,chunkSize,newMerkleRoot,merkleRootOfAppendedData)).to.be.rejected;

    });

  });
});
