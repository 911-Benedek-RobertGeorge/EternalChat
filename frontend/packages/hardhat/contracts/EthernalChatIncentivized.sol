// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Chronos } from "./Chronos.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title A simple chat contract that stores a link between users and messages on IPFS
/// @notice You can use this contract for keeping a descentralized chat history
/// @dev This contract implements a relatively simple way of storing messages 
contract EthernalChatIncentivized is Ownable {
    
    struct DataInfo{
        bytes32 cid;
        // Below is needed for the simple proof of storage done here
        bytes32 merkleRoot; // Root of the merkle tree
        uint64 numberOfChunks;
        uint64 sizeOfChunks; // Help checking the size of the data during proof verification
        //  Address of the storage provider we want to incentivize
        address storageProvider;  // This could be a list
        uint256 allocatedTokens;
    }

    /// @notice Mapping of CID/DataInfo of the stored messages for each account
    mapping(address => DataInfo) private mapDataInfo;

    /// @notice Amount of tokens required for storing a message
    event CIDUpdated(address indexed user, bytes32 cid);

    modifier OnlyStorageProvider(address addr){
        require(msg.sender == mapDataInfo[addr].storageProvider, "You need to be the storage provider for this address");
        _;
    }

    /// @notice Constructor function
	/// @param tokenContractAddress  Address of the token used for payment
	constructor(
        address tokenContractAddress 
	) Ownable(msg.sender) {

	}

    
     /// @notice Sets the CID (Content Identifier) for the sender of the transaction. 
     /// @param cid The CID to set for the user.
     /// @param numberOfChunks The number of chunks we divided the data for the storage proof.
     /// @param sizeOfChunks The size of each chunks. (Padding need to be applied for the last chunk if necessary)
     /// @param newMerkleRoot The calculated merkle root corresponding of the hash of each chunks, then the hash of each chunk concatenated 2-by-2...
     /// @param merkleRootOfAppendedData This is to verify we only append new data: for the first time this would be equals to newMerkleRoot
     /// @dev Make sure the data is always greater than the previous one as we don't allow deletion of data.
     /// @dev To prevent data modification (only adding new data to the previous one) we have to make sure the hash of the concatenated merkleRoots (old one and appended data) match the one provided
     /// @dev Make sure the cid != 0x0... to prevent "deleting" all the data and start pushing new data instead
     function setCID(bytes32 cid, uint64 numberOfChunks, uint64 sizeOfChunks, bytes32 newMerkleRoot, bytes32 merkleRootOfAppendedData) public {
        // TO IMPLEMENT
        emit CIDUpdated(msg.sender, cid);
    }

    /// @notice Add funds to an existing DataInfo by sending tokens and updating 
    /// @param newPrice The new price in tokens
    /// @dev Make sure the DataInfo is non zero (has been already created)
    function addFundsForStorage(uint256 newPrice) public {
        // TO IMPLEMENT
    }

    /// @notice Retrieves the CID (Content Identifier) stored for the user. 
    /// @return The CID associated with the user.
    /// @dev Passes when the user has a CID stored. This function is view only, so it doesn't modify the state of the contract
    function getCID() public view returns (bytes32) {
        // bytes32 cid = addressToCID[msg.sender];
        // require( cid.length > 0, "No CID found for this address");
        // return cid;
    }

    // function getChallenge(address addr) public view returns ( uint64 index ) OnlyStorageProvider { // return index
    // // require ..
    //     index = 0 ; // random;
    // }


    /// @notice Allows storage to get a partial amount of reward in token, if it hasn't been already taken in this amount of time 
    function getStorageReward() public view returns (bytes32) {
        // bytes32 cid = addressToCID[msg.sender];
        // require( cid.length > 0, "No CID found for this address");
        // // Check if the chunk size given correspond to the expected size
        // return cid;
    }

    /// @notice Take out all the rewards in Eth based on the amount of tokens the address holds
    function withdrawRewards() public view returns (bytes32) {
        // bytes32 cid = addressToCID[msg.sender];
        // require( cid.length > 0, "No CID found for this address");
        // return cid;
    }

}
