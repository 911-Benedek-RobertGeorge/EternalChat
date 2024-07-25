import { expect } from "chai";
import { ethers } from "hardhat";
import { EthernalChatIncentivized } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CID } from "multiformats";
import { fromHex, toHex } from "viem";
import * as jsonCodec from "multiformats/codecs/json";
import * as crypto from "crypto";
import { keccak256 } from "ethers";
const Hash = require("ipfs-only-hash");

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


describe("EthernalChatIncentivized", function () {
  async function getCidAndData(data: any, numChunks?: bigint, chunkSize?: bigint) {
    const dataJson = JSON.stringify(data);
    const size = BigInt(new Blob([dataJson]).size);
    if (!chunkSize && numChunks) {
      chunkSize = size / numChunks;
    } else if (chunkSize) {
      numChunks = size / chunkSize;
      if (size % chunkSize != 0n) {
        numChunks += 1n;
      }
    } else {
      throw Error("numChunks or ChunkSize should be specified");
    }

    const { numChunks: newNumChunks, merkleRoot } = generateProof(data, Number(chunkSize));

    const cidHash = await Hash.of(dataJson);
    const cid = CID.parse(cidHash);

    const cidBytes = CidToBytes(cid);


    return {
      cidBytes,
      cid,
      merkleRoot: toHex(merkleRoot),
      chunkSize,
      numChunks: BigInt(newNumChunks.toString()),
    };
  }

  describe("SetCID", function () {
    it("should properly add a CID for the first time", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const data = [{"test":1}];
      const numChunksInit = 2n;
      const { cidBytes, merkleRoot, chunkSize, cid, numChunks } = await getCidAndData(data, numChunksInit);

      const response = await ethernalChatAcc1.setCID(cidBytes, numChunks, chunkSize, merkleRoot);
      response.wait();
      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      const storedCid = bytesToCid(storedCidString);
      expect(cid.multihash.bytes).to.eqls(storedCid.multihash.bytes);
    });

    it("should add new CID when appending data", async function () {
      const { ethernalChat, acc1 } = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1);
      const data = [{ test: 1 }];
      const data2 = [{ test: 1 }, { test2: 2 }];
      const numChunksInit = 2n;
      const { cidBytes, merkleRoot, chunkSize, numChunks } = await getCidAndData(data, numChunksInit);
      const { cidBytes: cidBytes2, merkleRoot: mr2, chunkSize: chunkSize2, numChunks: numChunks2 } = await getCidAndData(data2, numChunksInit);
      await ethernalChatAcc1.setCID(cidBytes, numChunks, chunkSize, merkleRoot);
      await ethernalChatAcc1.setCID(cidBytes2, numChunks2, chunkSize2, mr2);

      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      expect(cidBytes2).to.eqls(storedCidString);
    });

    it("should add new CID when modifying data", async function () {
      const { ethernalChat, acc1 } = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1);
      const data = [{ test: 1 }];
      const data2 = [{ test1: 1 }];
      const numChunksInit = 2n;
      const { cidBytes, merkleRoot, chunkSize, numChunks } = await getCidAndData(data, numChunksInit);
      const { cidBytes: cidBytes2, merkleRoot: mr2, chunkSize: chunkSize2, numChunks:numChunks2 } = await getCidAndData(data2, numChunksInit);
      await ethernalChatAcc1.setCID(cidBytes, numChunks, chunkSize, merkleRoot);
      await ethernalChatAcc1.setCID(cidBytes2, numChunks2, chunkSize2, mr2);

      const storedCidString = await ethernalChatAcc1.getCID(acc1.address);
      expect(cidBytes2).to.eqls(storedCidString);
    });

    it("Should set storage provider", async function () {
      const { ethernalChat, acc1, acc2 } = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1);
      await ethernalChatAcc1.setStorageProvider(acc2.address);
      const storageProvider = await ethernalChatAcc1.getStorageProvider(acc1.address);
      expect(storageProvider).to.equal(acc2.address);
    });

    it("Should add funds for storage", async function () {
      const { ethernalChat, acc1, acc2 } = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1);
      const data = [{ test: 1 }];
      const numChunksInit = 2n;
      const { cidBytes, merkleRoot, chunkSize, cid, numChunks } = await getCidAndData(data, numChunksInit);
      await ethernalChatAcc1.connect(acc1).setCID(cidBytes, numChunks, chunkSize, merkleRoot);
      await ethernalChatAcc1.connect(acc1).addFundsForStorage({ value: ethers.parseEther("1") });
      const ethAllocated = await ethernalChatAcc1.getAllocatedEthToStorageProvider(acc1.address);
      expect(ethAllocated).to.equal(ethers.parseEther("1"));
    });
  });


  describe("Challenge and Proof", function () {
    it("shouldn't allow for getting challenges two times", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const ethernalChatAcc2 = ethernalChat.connect(acc2)
      const data = [{"test":1},{"test":2},{"test":3},{"test":4},{"test":"It doesn't make sense it is just data"}];
      const numChunksInit = 10n;
      const {cidBytes,merkleRoot, chunkSize, cid, numChunks} = await getCidAndData(data,numChunksInit)

      await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
      await ethernalChatAcc1.setStorageProvider(acc2.address);

      await ethernalChatAcc2.getChallenge(acc1.address);
      await expect(ethernalChatAcc2.getChallenge(acc1.address)).to.be.rejectedWith("You already asked for a challenge");
    });

    // it("get Challenge should give a valid challenge", async function () {
    //   const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
    //   const ethernalChatAcc1 = ethernalChat.connect(acc1)
    //   const ethernalChatAcc2 = ethernalChat.connect(acc2)
    //   const data = [{"test":1},{"test":2},{"test":3},{"test":4},{"test":"It doesn't make sense it is just data"}];
    //   const dataJson = JSON.stringify(data);
    //   const numChunks = 10n;
    //   const {cidBytes,merkleRoot, chunkSize, cid} = await getCidAndData(data,numChunks)

    //   await ethernalChatAcc1.setCID(cidBytes,numChunks,chunkSize,merkleRoot);
    //   const tx = await ethernalChatAcc1.setStorageProvider(acc2.address);
    //   tx.wait()
    //   const tx2 = await ethernalChatAcc1.setStorageProvider(acc2.address);
    //   tx2.wait()
    //   const tx3 = await ethernalChatAcc1.setStorageProvider(acc2.address);
    //   tx3.wait()
    //   const tx4 = await ethernalChatAcc1.setStorageProvider(acc2.address);
    //   tx4.wait()



    //   await ethernalChatAcc2.getChallenge(acc1.address);
    //   const index = await ethernalChatAcc2.test(acc1.address);
    //   console.log(index);
      
      // const tx2 = await ethernalChatAcc2.getChallenge(acc1.address).then((val) => console.log(val));

      
      // const index = Number(BigInt(tx.data));
      // const {proofHashes,chunkData} = getProofHashesFromJson(dataJson,Number(chunkSize),index);
      // const tx2 = await ethernalChatAcc2.getStorageReward(acc1.address,chunkData,proofHashes);
    // });

    it("should validate a valid proof", async function () {
      const {ethernalChat, acc1, acc2} = await loadFixture(deployContract);
      const ethernalChatAcc1 = ethernalChat.connect(acc1)
      const ethernalChatAcc2 = ethernalChat.connect(acc2)
      const data = [{"test":1},{"test":2},{"test":3},{"test":4},{"test":"It doesn't make sense it is just data"}];
      const dataJson = JSON.stringify(data);
      const numChunksInit = 10n;
      const {cidBytes, merkleRoot, chunkSize, cid, numChunks} = await getCidAndData(data,numChunksInit)

      await ethernalChatAcc1.setCID(cidBytes,chunkSize,numChunks,merkleRoot);
      const num = await ethernalChatAcc1.getNumberOfChunks(acc1.address);
      console.log(num);
      
      await ethernalChatAcc1.setStorageProvider(acc2.address);
      await ethernalChatAcc1.addFundsForStorage({ value: ethers.parseEther("0.01") });

      const tx = await ethernalChatAcc2.getChallenge(acc1.address);
      tx.wait()
      const index = await ethernalChatAcc2.getChallengeIndex(acc1.address);



      const { chunkData, proof, merkleRoot: mr2 } = generateProof(data, Number(chunkSize), Number(index));

      console.log('Chunk Data:', chunkData?.toString('hex'));
      console.log('Proof:', proof?.map(p => p.toString('hex')));
      console.log('Merkle Root:', mr2.toString('hex'));

      expect(chunkData).to.not.be.undefined;
      expect(proof).to.not.be.undefined;

      const proofHashes = proof?.map(p => toHex(p));

      const tx2 = await ethernalChatAcc2.getStorageReward(acc1.address,toHex(chunkData as Buffer),proofHashes as string[]);

      

    });
  });
});



function CidToBytes(newCid: CID): string {
  // const cidObj = CID.parse(newCid);
  const cidBytes = newCid.multihash.bytes.slice(2);

  if (cidBytes.length !== 32) {
    throw new Error("Invalid Cid");
  }
  const hexString = toHex(cidBytes);
  return hexString;
}

function bytesToCid(cidStored: string): CID {
  const bytes = fromHex(cidStored as `0x${string}`, {
    size: 32,
    to: "bytes",
  });

  const prefix = Buffer.from([18, 32]);
  const resultBuffer = Buffer.concat([prefix, Buffer.from(bytes)]);
  const _newCid = CID.decode(resultBuffer);
  const newCid = CID.createV1(jsonCodec.code, _newCid.multihash);
  return newCid;
}




interface ChunkResult {
  chunkData: Buffer | undefined;
  proof: Buffer[] | undefined;
  merkleRoot: Buffer;
  numChunks: Number;
}

// Function to chunk a Buffer into specified size
function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.slice(i, i + chunkSize));
  }
  return chunks;
}

// Function to build the Merkle tree
function buildMerkleTree(leaves: Buffer[]): Buffer[][] {
  let tree: Buffer[][] = [leaves];
  while (tree[tree.length - 1].length > 1) {
    const level: Buffer[] = [];
    const nodes = tree[tree.length - 1];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        const combined = Buffer.concat([nodes[i], nodes[i + 1]]);
        level.push(Buffer.from(keccak256(combined).slice(2), 'hex'));
      } else {
        level.push(nodes[i]); // Handle odd number of nodes
      }
    }
    tree.push(level);
  }
  return tree;
}

// Function to generate the Merkle proof
function generateMerkleProof(tree: Buffer[][], index: number): Buffer[] {
  const proof: Buffer[] = [];
  for (let i = 0; i < tree.length - 1; i++) {
    const level = tree[i];
    const isRightNode = index % 2;
    const pairIndex = isRightNode ? index - 1 : index + 1;
    if (pairIndex < level.length) {
      proof.push(level[pairIndex]);
    }
    index = Math.floor(index / 2);
  }
  return proof;
}

// Main function to generate proof
export function generateProof(jsonData: object, chunkSize: number,index?: number): ChunkResult {
  // Convert JSON object to Buffer
  const jsonString = JSON.stringify(jsonData);
  const jsonBuffer = Buffer.from(jsonString, 'utf-8');

  // Chunk the Buffer into specified size
  const chunks = chunkBuffer(jsonBuffer, chunkSize);
  const numChunks = chunks.length

  // Hash each chunk
  const leaves = chunks.map(chunk => Buffer.from(keccak256(chunk).slice(2), 'hex'));

  // Build the Merkle tree
  const tree = buildMerkleTree(leaves);

  // Generate the Merkle proof
  let proof;
  let chunkData;
  if(index){
    proof = generateMerkleProof(tree, index);
    chunkData= chunks[index];;
  }


  // Get the Merkle root
  const merkleRoot = tree[tree.length - 1][0];

  return {
    chunkData,
    proof,
    merkleRoot,
    numChunks
  };
}

