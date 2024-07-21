// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Chronos } from "./Chronos.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title A simple chat contract that stores a link between users and messages on IPFS
/// @notice You can use this contract for keeping a descentralized chat history
/// @dev This contract implements a relatively simple way of storing messages 
contract EthernalChatIncentivized is Ownable {
    
    struct dataInfo{
        bytes32 cid;
        // Below is needed for the simple proof of storage done here
        bytes32 merkleRoot; // Root of the merkle tree
        uint64 numberOfChunks;
        uint64 sizeOfData;
        //  Address of the storage provider we want to incentivize
        address storageProvider;  // This could be a list
    }

    /// @notice Mapping of CID of the stored messages for each account
    mapping(address => bytes32) private addressToCID; 
    // maybe change it to string[] to allow multiple CIDs per address
    // however this would require multiple fetching from ipfs, so maybe not a good idea
    // maybe change it to bytes32 to save gas

	/// @notice Address of the token used as payment for storing the messages
    IERC20 public paymentToken;
    
    uint256 public price = 5 * 10 ** 18; // 5 tokens

    /// @notice Amount of tokens required for storing a message
    event CIDUpdated(address indexed user, bytes32 cid);

    // modifier OnlyStorageProvider(){

    // }

    /// @notice Constructor function
	/// @param tokenContractAddress  Address of the token used for payment
	constructor(
        address tokenContractAddress 
	) Ownable(msg.sender) {
        paymentToken = IERC20(tokenContractAddress);
	}

    /// @notice Sets the price for storing a message
    /// @param newPrice The new price in tokens
    function setPrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }

    
     /// @notice Sets the CID (Content Identifier) for the sender of the transaction. 
     /// @param cid The CID to set for the user.
     /// @dev Passes when the user has enough tokens to pay for the storage. This function modifies the state of the contract by storing the CID for the user
     function setCID(bytes32   cid) payable public {
        addressToCID[msg.sender] = cid;
        emit CIDUpdated(msg.sender, cid);
    }

    /// @notice Retrieves the CID (Content Identifier) stored for the user. 
    /// @return The CID associated with the user.
    /// @dev Passes when the user has a CID stored. This function is view only, so it doesn't modify the state of the contract
    function getCID() public view returns (bytes32) {
        bytes32 cid = addressToCID[msg.sender];
        require( cid.length > 0, "No CID found for this address");
        return cid;
    }

    function getChallenge() public view returns ( uint64 index ) { // return index
    // require ..
        index = 0 ; // random;
    }


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
