// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface INFT_PRE_Sale {
    event SuccessBuy(
        address paymentToken,
        uint256 receivedAmount,
        address investor
    );
    function erc20address() external view returns (address);

    function treasuryAddress() external view returns (address);

    function setTreasuryAddress(address _treasuryAddress) external;

    function nftHolderAddress() external view returns (address);

    function setNftHolderAddress(address _nftHolderAddress) external;

    function stakingNFT() external view returns (address);

    function tokenIdCounter() external view returns (uint256);

    function setTokenIdCounter(uint256 price) external;

    function defaultPrice() external view returns (uint256);

    function setDefaultPrice(uint256 _price) external;

    function maximumBuyAmount() external view returns (uint256);

    function setMaximumBuyAmount(uint256 _amount) external;

    function hasNFT(address _account) external view returns(bool);

     function setERC20Address(address _erc20) external;
}
