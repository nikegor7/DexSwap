// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ERC-20.sol";
contract Token is ERC20{
    constructor(string memory name, string memory symbol, uint initialSuply) ERC20(name, symbol){  
        _mint(msg.sender, initialSuply); 
    }
}