// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INFT_token is IERC721 {
    function baseURI() external view returns (string memory);

    function setBaseURI(string memory) external;

    function mint(address _account) external;

    function batchMint(uint256 _amount, address _account) external;

    function isAdmin(address _account) external view returns (bool);

    function totalSupply() external view returns (uint256);

    function getNFTIdsByAccount(address _account) external view returns (uint256[] memory);

    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);

}
