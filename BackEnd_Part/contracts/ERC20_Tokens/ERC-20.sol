// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC-20.sol";

contract ERC20 is IERC_20{
    address public owner;
    uint public totalTokens;
    string _name;
    string _symbol;
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowances;

    modifier OnlyOwner() {
        require(msg.sender == owner, "You're not a owner");
    _;
    }

    modifier EnoughTokens(address _from, uint _amount){
        require(balanceOf(_from) >= _amount,"You have not enough tokens");
        require(msg.sender != address(0), "Not permited");
        _;
    }

  
   // basic function with name, symbol, etc.

    function name() external view override returns(string memory){
        return _name;
    }

    function symbol() external view override returns(string memory){
        return _symbol;
    }

    function decimals() external pure override returns(uint){
        return 18;
    }

    function totalSuply() external view override returns(uint){
        return totalTokens; 
    }

  constructor(string memory name_, string memory symbol_ ){
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
    }

    function balanceOf(address account) public view override returns(uint){
        return balances[account];
    }

    function transfer(address to, uint amount) public override EnoughTokens(msg.sender, amount) {
        balances[msg.sender] -= amount;
        unchecked {
            balances[to] += amount;
        }
        emit Transfer(msg.sender, to, amount);
    }

    function approve(address spender, uint amount) public override {
        _approve(msg.sender, spender, amount);
    }

    function _approve(address sender, address spender, uint amount) internal virtual{
        allowances[sender][spender] = amount;
        emit Approve(msg.sender, spender, amount);
    }

    function allowance(address _owner, address spender) public view override returns(uint){
        return allowances[_owner][spender];
    }

    function transferFrom(address sender, address recipient, uint amount) public override EnoughTokens(sender, amount){
        balances[sender] -= amount;
        allowances[sender][recipient] -= amount;
        balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint amount) public virtual {
        totalTokens += amount;
         unchecked {
        balances[account] +=amount;
         }
        emit Transfer(address(0),account, amount);
    }

    function _burn(address _from, uint amount) public virtual EnoughTokens(_from, amount){
        balances[_from] -= amount;
         unchecked {
        totalTokens -= amount;
         }
        emit Transfer(_from, address(0), amount);
    }


}
