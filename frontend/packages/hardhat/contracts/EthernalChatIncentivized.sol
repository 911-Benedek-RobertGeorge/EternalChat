// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title A simple chat contract that stores a link between users and messages on IPFS
/// @notice You can use this contract for keeping a descentralized chat history
/// @dev This contract implements a relatively simple way of storing messages
contract EthernalChatIncentivized is Ownable {
	struct DataInfo {
		bytes32 cid;
		// Below is needed for the simple proof of storage done here
		bytes32 merkleRoot; // Root of the merkle tree
		uint64 sizeOfChunks; // Help checking the size of the data during proof verification
		uint64 numberOfChunks;
		//  Address of the storage provider we want to incentivize
		address storageProvider; // This could be a list but for now only one
		uint64 lastChallengeIndex;
		uint256 lastTimeRewardRedeemed; // Represent the last time the storageProvider redeemed a reward with a challenge
		uint256 allocatedEth;
		uint256 ethSpent; // total eth earned by storage providers (spent by the user)
	}

	struct ProviderInfo {
		uint256 totalEthEarned;
		uint256 lastWithdrawTime;
	}

	/// @notice Amount of eth earned for storing files per day
	uint256 public constant PRICE_PER_DAY = 0.0001 ether;
	/// @notice Mapping of CID/DataInfo of the stored messages for each account
	mapping(address => DataInfo) private mapDataInfo;

	/// @notice Mapping of the storage providers rewards info
	mapping(address => ProviderInfo) private mapProviderInfo;

	/// @notice Amount of tokens required for storing a message
	event CIDUpdated(address indexed user, bytes32 cid);

	modifier OnlyStorageProvider(address addr) {
		require(
			msg.sender == mapDataInfo[addr].storageProvider,
			"You need to be the storage provider for this address"
		);
		_;
	}

	/// @notice Constructor function
	constructor() Ownable(msg.sender) {}

	/// @notice Sets the CID (Content Identifier) for the sender of the transaction.
	/// @param cid The CID to set for the user.
	/// @param sizeOfChunks The size of each chunks. (Padding need to be applied for the last chunk if necessary)
	/// @param numberOfChunks The number of chunks we divided the data for the storage proof. (Total number of chunks)
	/// @param newMerkleRoot The calculated merkle root corresponding of the hash of each chunks, then the hash of each chunk concatenated 2-by-2...
	function setCID(
		bytes32 cid,
		uint64 sizeOfChunks,
		uint64 numberOfChunks,
		bytes32 newMerkleRoot
	) public {
		require(cid != bytes32(0), "Invalid CID");
		require(newMerkleRoot != bytes32(0), "Invalid Merkle Root");
		DataInfo storage dataInfo = mapDataInfo[msg.sender];

		dataInfo.cid = cid;
		dataInfo.sizeOfChunks = sizeOfChunks;
		dataInfo.numberOfChunks = numberOfChunks;
		dataInfo.merkleRoot = newMerkleRoot;

		emit CIDUpdated(msg.sender, cid);
	}

	// Set Storage Provider (or update it)

	// /// @notice Adds or updates a user's storage provider
	/// @param addr Address of the account you are trying to set as a storage provider.
	// /// @dev
	function setStorageProvider(address addr) public {
		ProviderInfo storage providerInfo = mapProviderInfo[addr];
		mapDataInfo[msg.sender].storageProvider = addr;
		if (providerInfo.lastWithdrawTime == 0) {
			providerInfo.lastWithdrawTime = block.timestamp;
			providerInfo.totalEthEarned = 0 ether;
		}
		providerInfo.lastWithdrawTime = providerInfo.lastWithdrawTime;
		providerInfo.totalEthEarned = providerInfo.totalEthEarned;
	}

	/// @notice Add funds to an existing DataInfo by sending tokens and updating
	/// @dev Make sure the DataInfo is non zero (has been already created)
	function addFundsForStorage() public payable {
		DataInfo storage dataInfo = mapDataInfo[msg.sender];
		require(dataInfo.cid != bytes32(0), "DataInfo not found");
		dataInfo.allocatedEth += msg.value;
	}

	/// @notice Retrieves the CID (Content Identifier) stored for the user.
	/// @param addr Address of the account you are trying to access the data from
	/// @return The CID associated with the user.
	/// @dev Passes when the user has a CID stored. This function is view only, so it doesn't modify the state of the contract
	function getCID(address addr) public view returns (bytes32) {
		DataInfo memory dataInfo = mapDataInfo[addr];
		require(dataInfo.cid != bytes32(0), "No CID found for this address");
		return dataInfo.cid;
	}

	// Storage Provider functions

	/// @notice Get the challenger for the proof of Storage to use with getStorageReward.
	/// @param addr Address of the account you are trying to get a challenge from.
	/// @return index that represent the provider needs to reveal the data from.
	function getChallenge(
		address addr
	) public OnlyStorageProvider(addr) returns (uint64 index) {
		DataInfo storage dataInfo = mapDataInfo[addr];
		require(
			dataInfo.cid != bytes32(0),
			"No DataInfo found for this address"
		);
		require(
			dataInfo.lastChallengeIndex == 0,
			"You already asked for a challenge"
		);
		index = uint64(block.prevrandao) % dataInfo.numberOfChunks;
		dataInfo.lastChallengeIndex = index;
	}

	function verifyStorageProof(
		uint index,
		bytes32 merkleRoot,
		bytes memory chunkData,
		bytes32[] memory hashes
	) internal pure returns (bool) {
		bytes32 chunkHash = keccak256(chunkData);
		for (uint i = 0; i < hashes.length; i++) {
			if (index % 2 == 0) {
				chunkHash = keccak256(abi.encodePacked(chunkHash, hashes[i]));
			} else {
				chunkHash = keccak256(abi.encodePacked(hashes[i], chunkHash));
			}
			index = index / 2;
		}
		return chunkHash == merkleRoot;
	}

	/// @notice Allows storage to reedem a partial amount of reward in token by answering to the challenge. They can do it only once per day.
	/// The full reedmed amount can be withdraw after a month (30days) since lastWithdrawTime see withdrawRewards()
	/// @param addr Address of the account you are trying to get the reward from.
	/// @param hashes Array of hashes allowing the proof : it should be ordered by the level in the merkle tree from the leafs.
	///  it should allow the proof to pass.
	function getStorageReward(
		address addr,
		bytes memory chunkData,
		bytes32[] memory hashes
	) public OnlyStorageProvider(addr) {
		DataInfo storage dataInfo = mapDataInfo[addr];
		ProviderInfo storage providerInfo = mapProviderInfo[
			dataInfo.storageProvider
		];
		require(
			mapDataInfo[addr].cid != bytes32(0),
			"No DataInfo store by this address"
		);
		require(
			block.timestamp >= dataInfo.lastTimeRewardRedeemed + 1 days,
			"Not Enough time has passed"
		);

		require(
			dataInfo.ethSpent + PRICE_PER_DAY <= dataInfo.allocatedEth,
			"The user hasn't allocated enough eth"
		);

		require(
			2 ** (hashes.length) ==
				dataInfo.numberOfChunks + (dataInfo.numberOfChunks % 2),
			"The number of hashes necessary for the proof is not matching ceil[log2(numberOfChunks)]"
		);

		require(
			verifyStorageProof(
				dataInfo.lastChallengeIndex,
				dataInfo.merkleRoot,
				chunkData,
				hashes
			),
			"The proof of Storage is incorrect"
		);

		dataInfo.lastTimeRewardRedeemed = block.timestamp;
		dataInfo.lastChallengeIndex = 0;
		dataInfo.ethSpent += PRICE_PER_DAY;

		providerInfo.totalEthEarned += PRICE_PER_DAY;
	}

	/// @notice Take out all the rewards in Eth based on the amount of tokens the address holds
	function withdrawRewards() public {
		ProviderInfo storage provider = mapProviderInfo[msg.sender];
		uint256 amount = provider.totalEthEarned;
		require(amount > 0, "No rewards available");
		require(
			block.timestamp >= provider.lastWithdrawTime + 30 days,
			"Not Enough time has passed"
		);
		provider.totalEthEarned = 0;
		(bool success, ) = payable(msg.sender).call{ value: amount }("");
		require(success);
	}

	function getStorageProvider(address addr) public view returns (address) {
		return mapDataInfo[addr].storageProvider;
	}

	function getAllocatedEthToStorageProvider(
		address addr
	) public view returns (uint256) {
		return mapDataInfo[addr].allocatedEth;
	}
    function getTotalEthToStorageProvider(
		address addr
	) public view returns (uint256) {
		return mapProviderInfo[addr].totalEthEarned;
	}
}
