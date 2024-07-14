import { viem } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployContract() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount, thirdAccount] = await viem.getWalletClients();
  const eternalChatContract = await viem.deployContract("EternalChat");
  return {
    publicClient,
    deployer,
    otherAccount,
    eternalChatContract,
    thirdAccount,
  };
}

describe("EternalChat", function () {
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { eternalChatContract, deployer } = await loadFixture(deployContract);
      const owner = await eternalChatContract.read.owner();
      expect(owner.toLowerCase()).to.equal(deployer.account.address);
    });
  });

  describe("addCID", function () {
    it("Should add a new CID", async function () {
      const { eternalChatContract, deployer } = await loadFixture(deployContract);
      const cid = "Qmtehyidolsjj367282";
      await eternalChatContract.write.addCID([cid]);
      const readCid = await eternalChatContract.read.addressToCID([deployer.account.address]);
      expect(readCid).to.equal(cid);
    });

    it("Should revert if CID already added", async function () {
      const { eternalChatContract, deployer } = await loadFixture(deployContract);
      const cid = "Qmtehyidolsjj367282";
      await eternalChatContract.write.addCID([cid]);
      await expect(eternalChatContract.write.addCID([cid])).to.be.rejectedWith("CID already added");
    });
  });

  describe("transferOwnership", function () {
    it("Should transfer ownership", async function () {
      const { eternalChatContract, deployer, otherAccount } = await loadFixture(deployContract);
      await eternalChatContract.write.transferOwnership([deployer.account.address], { account: otherAccount.account });

      expect((await eternalChatContract.read.owner()).toLowerCase()).to.equal(deployer.account.address);
    });

    it("Should revert if non-owner tries to transfer ownership", async function () {
      const { eternalChatContract, deployer, otherAccount, thirdAccount } = await loadFixture(deployContract);

      await expect(
        eternalChatContract.write.transferOwnership([otherAccount.account.address], { account: deployer.account }),
      ).to.be.rejectedWith("You are not the owner");
    });
  });
});
