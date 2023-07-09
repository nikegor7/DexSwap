// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Interfaces/INFT_PRE_Sale.sol";
import "./Interfaces/INFT_token.sol";
import "../ERC20_Tokens/IERC-20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";

// Base NFT_PRE_Sale contract
contract NFT_PRE_Sale is INFT_PRE_Sale, Context {
    using SafeMath for uint256;

    address public override stakingNFT;
    address public override treasuryAddress;
    address public override nftHolderAddress;
    address public override erc20address;
    uint256 public override maximumBuyAmount;
    uint256 public override defaultPrice;
    uint256 public override tokenIdCounter;

    modifier validateInput(uint256 input) {
        require(input > 0, "NFT_PRE_Sale: INSUFFICIENT_INPUT_AMOUNT");
        _;
    }

    modifier onlyAdmin() virtual {
        require(
            INFT_token(stakingNFT).isAdmin(_msgSender()),
            "NFT_PRE_Sale: NOT_ADMIN"
        );
        _;
    }

    constructor(
        address _stakingNFT,
        address _nftHolderAddress,
        address _treasury,
        uint256 _defaultPrice,
        uint256 _maximumBuyAmount,
        address _erc20address
    ) {
        require(
            _stakingNFT != address(0) &&
                _nftHolderAddress != address(0) &&
                _treasury != address(0),
            "NFT_PRE_Sale: ZERO_ADDRESS"
        );
        stakingNFT = _stakingNFT;
        treasuryAddress = _treasury;
        nftHolderAddress = _nftHolderAddress;
        defaultPrice = _defaultPrice;
        maximumBuyAmount = _maximumBuyAmount;
        erc20address = _erc20address;
    }

    function hasNFT(address _account) external view override returns (bool) {
        require(
            _account != address(0),
            "NFT_NFT_PRE_Sale: INVALID_ACCOUNT_ADDRESS"
        );

        return IERC721(stakingNFT).balanceOf(_account) >= 1;
    }

    function setERC20Address(address _erc20address) external override onlyAdmin {
                require(
            _erc20address != address(0),
            "NFT_PRE_Sale: INVALID_ERC20Payment_ADDRESS"
        );
        erc20address = _erc20address;
    }

    function setNftHolderAddress(
        address _nftHolderAddress
    ) external override onlyAdmin {
        require(
            _nftHolderAddress != address(0),
            "NFT_PRE_Sale: INVALID_TREASURY_ADDRESS"
        );
        nftHolderAddress = _nftHolderAddress;
    }

    function setTreasuryAddress(
        address _treasuryAddress
    ) external override onlyAdmin {
        require(
            _treasuryAddress != address(0),
            "NFT_PRE_Sale: INVALID_TREASURY_ADDRESS"
        );
        treasuryAddress = _treasuryAddress;
    }

    function setDefaultPrice(
        uint256 price
    ) external override onlyAdmin validateInput(price) {
        defaultPrice = price;
    }

    function setTokenIdCounter(uint256 id) external override onlyAdmin {
        tokenIdCounter = id;
    }

    function setMaximumBuyAmount(uint256 amount) external override onlyAdmin {
        maximumBuyAmount = amount;
    }
}
