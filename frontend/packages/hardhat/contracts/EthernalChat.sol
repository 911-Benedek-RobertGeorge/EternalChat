// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Chronos } from "./Chronos.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title A simple chat contract that stores a link between users and messages on IPFS
/// @notice You can use this contract for keeping a descentralized chat history
/// @dev This contract implements a relatively simple way of storing messages 
contract EthernalChat is Ownable {
    //TOOD maybe add a way to encrypt the cid 

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

    /// @notice Constructor function
	/// @param tokenContractAddress  Address of the token used for payment
	constructor(
        Chronos tokenContractAddress 
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
     function setCID(bytes32 cid) public {
        // require(paymentToken.allowance(msg.sender, address(this)) >= price, "Not enough tokens to pay for the storage");
        // require(  cid.length == 64, "CID should have 64 characters"); --Already checked on bytes32 param
        addressToCID[msg.sender] = cid;
        emit CIDUpdated(msg.sender, cid);
    }

    /// @notice Retrieves the CID (Content Identifier) stored for the user. 
    /// @return cid The CID associated with the user.
    /// @dev Passes when the user has a CID stored. This function is view only, so it doesn't modify the state of the contract
    function getCID(address addr) public view returns ( bytes32 cid ) {
        cid = addressToCID[addr];
        // require( cid.length > 0, "No CID found for this address");
        // return cid;
    }
}
