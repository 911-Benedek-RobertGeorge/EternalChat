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


// Function to generate proof hashes for a given index
function getProofHashesFromJson(json: string, chunkSize: number, index: number): {proofHashes: string[],chunkData:string} {
  const chunks = chunkString(json, chunkSize);
  const hashes = chunks.map(hashChunk);

  let proofHashes: string[] = [];
  const N = hashes.length;
  const numProofHashes = Math.ceil(Math.log2(N));

  let currentLayer = hashes;
  let idx = index;

  for (let i = 0; i < numProofHashes; i++) {
      const nextLayer: string[] = [];
      for (let j = 0; j < currentLayer.length; j += 2) {
          const left = currentLayer[j];
          const right = currentLayer[j + 1] || left; // Handle odd number of elements

          const combinedHash = keccak256(left + right);
          nextLayer.push(combinedHash);

          if (j === idx || j + 1 === idx) {
              proofHashes.push(j === idx ? right : left);
              idx = Math.floor(j / 2);
          }
      }
      currentLayer = nextLayer;
  }

  return {proofHashes, chunkData: chunks[index]};
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
  
    const cidHash  = await Hash.of(dataJson);
    const cid = CID.parse(cidHash);
    
    const cidBytes = CidToBytes(cid);
  
    const merkleRoot = getMerkleRootFromJson(dataJson,Number(chunkSize));

    return {
      cidBytes,
      cid,
      merkleRoot,
      chunkSize,
      numChunks
    }
  }

  describe("SetCID", function () {
    it("should properly add a CID for the first time", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const numChunks = 2n;
      const {cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

      const response = await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      response.wait();
      const storedCidString = await ethernalChatAcc1.getCID(acc1.address) 
      const storedCid= bytesToCid(storedCidString);
      expect(cid.multihash.bytes).to.eqls(storedCid.multihash.bytes);
    });

    it("should add new CID when appending data", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const data2 = [{"test":1},{"test2":2}]
      const numChunks = 2n;
      const {cidBytes,merkleRoot,chunkSize} = await getCidAndData(data,numChunks)
      const {cidBytes: cidBytes2,merkleRoot: mr2,chunkSize: chunkSize2} = await getCidAndData(data2,numChunks)
      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      await ethernalChatAcc1.setCID(cidBytes2,numChunks,chunkSize2,mr2);

      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      expect(cidBytes2).to.eqls(storedCidString);
    });

    it("should add new CID when modifying data", async function () {
      const {ethernalChat, acc1} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const data2 = [{"test1":1}]
      const numChunks = 2n;
      const {cidBytes,merkleRoot,chunkSize} = await getCidAndData(data,numChunks)
      const {cidBytes: cidBytes2,merkleRoot: mr2,chunkSize: chunkSize2} = await getCidAndData(data2,numChunks)
      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      await ethernalChatAcc1.setCID(cidBytes2,numChunks,chunkSize2,mr2);

      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      expect(cidBytes2).to.eqls(storedCidString);
    });

  });


  describe("Challenge and Proof", function () {
    it("shouldn't allow for getting challenges two times", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const ethernalChatAcc2 = ethernalChat.connect(acc2)
      const data = [{"test":1},{"test":2},{"test":3},{"test":4},{"test":"It doesn't make sense it is just data"}];
      const numChunks = 10n;
      const {cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      await ethernalChatAcc1.setStorageProvider(acc2.address);

      await ethernalChatAcc2.getChallenge(acc1.address);
      await expect(ethernalChatAcc2.getChallenge(acc1.address)).to.be.rejectedWith("You already asked for a challenge");
    });

    it("should validate a valid proof", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const ethernalChatAcc2 = ethernalChat.connect(acc2)
      const data = [{"test":1},{"test":2},{"test":3},{"test":4},{"test":"It doesn't make sense it is just data"}];
      const dataJson = JSON.stringify(data);
      const numChunks = 10n;
      const {cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      await ethernalChatAcc1.setStorageProvider(acc2.address);

      const tx = await ethernalChatAcc2.getChallenge(acc1.address);
      const index = Number(BigInt(tx.data));
      const {proofHashes,chunkData} = getProofHashesFromJson(dataJson,Number(chunkSize),index);
      await expect(ethernalChatAcc2.getStorageReward(acc1.address,chunkData,proofHashes)).to.not.be.rejected;
    });
  });
});