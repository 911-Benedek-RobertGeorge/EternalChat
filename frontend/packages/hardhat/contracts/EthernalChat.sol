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
    mapping(address => string) private addressToCID; 
    // maybe change it to string[] to allow multiple CIDs per address
    // however this would require multiple fetching from ipfs, so maybe not a good idea

	/// @notice Address of the token used as payment for storing the messages
    IERC20 public paymentToken;

    /// @notice Amount of tokens required for storing a message
    event CIDUpdated(address indexed user, string cid);

    /// @notice Constructor function
	/// @param tokenContractAddress  Address of the token used for payment
	constructor(
        address tokenContractAddress 
	) Ownable(msg.sender) {
        paymentToken = IERC20(tokenContractAddress);
	}


    function setCID(string memory cid) public {
        require( bytes(cid).length == 46, "CID should have 46 characters");
        addressToCID[msg.sender] = cid;
        emit CIDUpdated(msg.sender, cid);
    }

    function getCID() public view returns (string memory) {
        string memory cid = addressToCID[msg.sender];
        require(bytes(cid).length > 0, "No CID found for this address");
        return cid;
    }
}
