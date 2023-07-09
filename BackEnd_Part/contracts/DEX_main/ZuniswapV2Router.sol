// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import "./interfaces/IZuniswapV2Factory.sol";
import "./interfaces/IZuniswapV2Pair.sol";
import "./ZuniswapV2Library.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../ERC20_Tokens/IERC-20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract ZuniswapV2Router {
    error ExcessiveInputAmount();
    error InsufficientAAmount();
    error InsufficientBAmount();
    error InsufficientOutputAmount();
    error SafeTransferFailed();

    IZuniswapV2Factory factory;
    address public nftAddress;
    constructor(address factoryAddress, address nftStakingAddress) {
        factory = IZuniswapV2Factory(factoryAddress);
        nftAddress = nftStakingAddress; 
    }

    modifier hasNFT(address account){
       require(IERC721(nftAddress).balanceOf(account) >= 1,"User doesn't have nft");
       _;
    
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    )
        public
        hasNFT(to)
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        if (factory.pairs(tokenA, tokenB) == address(0)) {
            factory.createPair(tokenA, tokenB);
        }

        (amountA, amountB) = _calculateLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        address pairAddress = ZuniswapV2Library.pairFor(
            address(factory),
            tokenA,
            tokenB
        );
        IERC_20(tokenA).transferFrom(msg.sender,pairAddress,amountA);
        IERC_20(tokenB).transferFrom(msg.sender,pairAddress,amountB);
        liquidity = IZuniswapV2Pair(pairAddress).mint(to);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) public returns (uint256 amountA, uint256 amountB) {
        address pair = ZuniswapV2Library.pairFor(
            address(factory),
            tokenA,
            tokenB
        );
        IERC_20(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = IZuniswapV2Pair(pair).burn(to);
        if (amountA < amountAMin) revert InsufficientAAmount();
        if (amountA < amountBMin) revert InsufficientBAmount();
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) public returns (uint256[] memory amounts) {
        amounts = ZuniswapV2Library.getAmountsOut(
            address(factory),
            amountIn,
            path
        );
        if (amounts[amounts.length - 1] < amountOutMin)
            revert InsufficientOutputAmount();
        IERC_20(path[0]).transferFrom(msg.sender, ZuniswapV2Library.pairFor(address(factory), path[0], path[1]), amounts[0] );
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to
    ) public returns (uint256[] memory amounts) {
        amounts = ZuniswapV2Library.getAmountsIn(
            address(factory),
            amountOut,
            path
        );
        if (amounts[amounts.length - 1] > amountInMax)
            revert ExcessiveInputAmount();
            IERC_20(path[0]).transferFrom(msg.sender, ZuniswapV2Library.pairFor(address(factory), path[0], path[1]), amounts[0]  );
        _swap(amounts, path, to);
    }

    //
    //
    //
    //  PRIVATE
    //
    //
    //
    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address to_
    ) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = ZuniswapV2Library.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? ZuniswapV2Library.pairFor(
                    address(factory),
                    output,
                    path[i + 2]
                )
                : to_;
            IZuniswapV2Pair(
                ZuniswapV2Library.pairFor(address(factory), input, output)
            ).swap(amount0Out, amount1Out, to, "");
        }
    }

    function _calculateLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) public returns (uint256 amountA, uint256 amountB) {
        (uint256 reserveA, uint256 reserveB) = ZuniswapV2Library.getReserves(
            address(factory),
            tokenA,
            tokenB
        );

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = ZuniswapV2Library.quote(
                amountADesired,
                reserveA,
                reserveB
            );
            if (amountBOptimal <= amountBDesired) {
                if (amountBOptimal <= amountBMin) revert InsufficientBAmount();
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = ZuniswapV2Library.quote(
                    amountBDesired,
                    reserveB,
                    reserveA
                );
                assert(amountAOptimal <= amountADesired);

                if (amountAOptimal <= amountAMin) revert InsufficientAAmount();
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint value
    ) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint)",
                from,
                to,
                value
            )
        );
        if (!success || (data.length != 0 && !abi.decode(data, (bool))))
            revert SafeTransferFailed();
    }
}
