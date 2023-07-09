// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./INFT_PRE_Sale.sol";

interface INFT_Sale is INFT_PRE_Sale {
    function buyNFT(
       // uint256 _investment,
        address _to,
        uint256 _amount,
        address _erc20tokenaddress
    ) external ;
}
