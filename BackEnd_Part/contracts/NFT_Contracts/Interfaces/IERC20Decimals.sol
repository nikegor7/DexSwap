// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IERC20Decimals {
    /**
     * @dev Returns the amount of token decimals.
     */
    function decimals() external view returns (uint8);
}
