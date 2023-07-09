// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Interfaces/INFT_Sale.sol";
import "./NFT_PRE_Sale.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NFT_Sale is INFT_Sale, NFT_PRE_Sale {
    using SafeMath for uint256;

    constructor(
        address _stakingNFT,
        address _nftHolderAddress,
        address _treasury,
        uint256 _defaultPrice,
        uint256 _maximumBuyAmount,
        address _erc20address
    )
        NFT_PRE_Sale(
            _stakingNFT,
            _nftHolderAddress,
            _treasury,
            _defaultPrice,
            _maximumBuyAmount,
            _erc20address
        )
    {}

    function buyNFT(
        // uint256 _investment,
        address _to,
        uint256 _amount,
        address _erc20address
    ) external {
        require(
            _amount > 0 &&
                IERC721(stakingNFT).balanceOf(_to) + _amount <=
                maximumBuyAmount,
            "NFT_Sale: INVALID_INVESTMENT"
        );
        require(
            IERC721(stakingNFT).isApprovedForAll(
                nftHolderAddress,
                address(this)
            ),
            "NFT_Sale: NFT_NOT_APPROVED"
        );

        address paymentToken = _erc20address;
        uint256 amountStableOut;
        uint256 neededAmount = defaultPrice * _amount;
        require(neededAmount > 0, "NFT_Sale: Not Enough tokens");
        {
            SafeERC20.safeTransferFrom(
                IERC20(paymentToken),
                msg.sender,
                treasuryAddress,
                neededAmount
            );
            amountStableOut = neededAmount;
        }

        {
            uint256 _tokenIdCounter = tokenIdCounter;
            uint256 _totalSupply = INFT_token(stakingNFT).totalSupply();
            uint256 amountSold;
            while (amountSold != _amount) {
                if (
                    IERC721(stakingNFT).ownerOf(_tokenIdCounter) ==
                    nftHolderAddress
                ) {
                    IERC721(stakingNFT).safeTransferFrom(
                        nftHolderAddress,
                        _to,
                        _tokenIdCounter
                    );
                    amountSold++;
                }
                _tokenIdCounter++;
                if (_tokenIdCounter == _totalSupply) {
                    break;
                }
            }
            require(amountSold == _amount, "NFT_Sale: NFTS_NOT_SOLD");
            tokenIdCounter = _tokenIdCounter;
        }
        emit SuccessBuy(paymentToken, _amount, _to);
    }
}
