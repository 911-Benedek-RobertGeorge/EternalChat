// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract EternalChat {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    mapping(address => string) public addressToCID;
    mapping(string => bool) private cidAdded;

    event CIDadded(address indexed user, string cid);
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    function addCID(string memory newCid) public {
        require(!cidAdded[newCid], "CID already added");

        addressToCID[msg.sender] = newCid;
        cidAdded[newCid] = true;

        emit CIDadded(msg.sender, newCid);
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender != owner, "You are not the owner");
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }
}
