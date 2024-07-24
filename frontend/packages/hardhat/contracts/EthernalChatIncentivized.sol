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
		uint256 lastTimeRewardRedeemed;
		uint256 totalEthEarned; // total eth earned per stored messages for each account
		uint256 allocatedEth;
		uint256 lastWithdrawTime;
	}
	/// @notice Amount of eth earned for storing a message
	uint256 public constant ETH_PER_CID = 0.01 ether;
	/// @notice Mapping of CID/DataInfo of the stored messages for each account
	mapping(address => DataInfo) private mapDataInfo;

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

		if(dataInfo.lastWithdrawTime == 0){
			dataInfo.lastWithdrawTime = block.timestamp;
		}

		emit CIDUpdated(msg.sender, cid);
	}


    // Set Storage Provider (or update it)

	// /// @notice
	// /// @dev 
	// function setStorageProvider() public payable {
	// 	DataInfo storage dataInfo = mapDataInfo[msg.sender];
	// 	require(dataInfo.cid != bytes32(0), "DataInfo not found");
	// 	dataInfo.allocatedEth += msg.value;
	// }

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

	function getChallenge(
		address addr
	) public view OnlyStorageProvider(addr) returns (uint64 index) {
		require(
			mapDataInfo[addr].cid != bytes32(0),
			"No DataInfo found for this address"
		);
		index = uint64(block.prevrandao) % mapDataInfo[addr].numberOfChunks;
	}

	/// @notice Allows storage to get a partial amount of reward in token, if it hasn't been already taken in this amount of time
	function getStorageReward(address addr) public {
		DataInfo storage dataInfo = mapDataInfo[addr];
		require(
			block.timestamp >= dataInfo.lastTimeRewardRedeemed + 1 days,
			"Not Enough time has passed"
		);
		require(
			mapDataInfo[addr].cid != bytes32(0),
			"No DataInfo store by this address"
		);
		//require the proofOfChallenge
		dataInfo.lastTimeRewardRedeemed = block.timestamp;
		dataInfo.totalEthEarned += ETH_PER_CID / 30;
	}

	/// @notice Take out all the rewards in Eth based on the amount of tokens the address holds
	function withdrawRewards() public {
		DataInfo storage dataInfo = mapDataInfo[msg.sender];
		uint256 amount = dataInfo.totalEthEarned;
		require(amount > 0, "No rewards available");
		require(
			block.timestamp >= dataInfo.lastWithdrawTime + 30 days,
			"Not Enough time has passed"
		);
		dataInfo.totalEthEarned = 0;
		(bool success, ) = payable(msg.sender).call{ value: amount }("");
		require(success);
	}
    
}
