// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./Interfaces/INFT_token.sol";

// interface IERC721EnumerableToken is IERC721Enumerable {
//     function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
// }

contract NFT_token is ERC721, INFT_token, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIds_;
    string public override baseURI;
    mapping(address => mapping(uint256 => uint256)) private ownedTokens;

    constructor(
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _treasury
    ) ERC721(_name, _symbol) {
        require(_treasury != address(0), "StakeNFT: ZERO_ADDRESS");

        baseURI = _tokenURI;
        for (uint i = 0; i < _initialSupply; i++) {
            uint256 newItemId = tokenIds_.current();
            _mint(_treasury, newItemId);

            tokenIds_.increment();
        }
    }

    function mint(address _account) external override onlyOwner {
        require(_account != address(0), "StakeNFT: ZERO_ADDRESS");

        uint256 newItemId = tokenIds_.current();
        _mint(_account, newItemId);
        tokenIds_.increment();
    }

    function batchMint(
        uint256 _amount,
        address _account
    ) external override onlyOwner {
        require(_account != address(0), "StakeNFT: ZERO_ADDRESS");

        for (uint i = 0; i < _amount; i++) {
            uint256 newItemId = tokenIds_.current();
            _mint(_account, newItemId);
            tokenIds_.increment();
        }
    }

    function isAdmin(address _account) external view override returns (bool) {
        return _account == owner();
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return baseURI;
    }

    function totalSupply() external view override returns (uint256) {
        return tokenIds_.current();
    }

    function setBaseURI(string memory _tokenURI) external override onlyOwner {
        baseURI = _tokenURI;
    }

function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
    require(index < balanceOf(owner), "Invalid index");

    uint256 tokenId = 0;
    for (uint256 i = 0; i <= index; i++) {
        tokenId = _tokenOfOwnerByIndex(owner, i);
    }

    return tokenId;
}

function _tokenOfOwnerByIndex(address owner, uint256 index) internal view returns (uint256) {
    require(index < balanceOf(owner), "Invalid index");

    uint256 tokenCount = tokenIds_.current();
    for (uint256 tokenId = 0; tokenId < tokenCount; tokenId++) {
        if (ownerOf(tokenId) == owner) {
            if (index == 0) {
                return tokenId;
            }
            index--;
        }
    }

    revert("Token not found");
}

    function getNFTIdsByAccount(address account) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(account);
        uint256[] memory nftIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            nftIds[i] = tokenOfOwnerByIndex(account, i);
        }

        return nftIds;
    }

}
