// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContentNFT
 * @dev NFT contract for verified content marketplace
 * @author hooksforwinners
 */
contract ContentNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // NFT Content Structure
    struct ContentMetadata {
        string name;
        string description;
        string externalUrl;
        string image;
        string genre;
        uint256 durationSeconds;
        uint256 publicationDate;
        uint256 lastUpdate;
        uint256 visits;
        uint256 likes;
        uint256 subscribers;
        uint256 clickRate;
        uint256 conversions;
        string contentType;
        string platform;
        address creator;
        uint256 mintedAt;
        bool exists;
    }

    // Mapping from token ID to metadata
    mapping(uint256 => ContentMetadata) public tokenMetadata;

    // Mapping from creator to their token IDs
    mapping(address => uint256[]) public creatorTokens;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string contentType
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        uint256 visits,
        uint256 likes,
        uint256 subscribers
    );

    constructor() ERC721("ContentNFT", "CNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new NFT with content metadata
     */
    function mintNFT(
        string memory _name,
        string memory _description,
        string memory _externalUrl,
        string memory _image,
        string memory _genre,
        uint256 _durationSeconds,
        uint256 _publicationDate,
        uint256 _visits,
        uint256 _likes,
        uint256 _subscribers,
        uint256 _clickRate,
        uint256 _conversions,
        string memory _contentType,
        string memory _platform
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _tokenIdCounter++;

        tokenMetadata[tokenId] = ContentMetadata({
            name: _name,
            description: _description,
            externalUrl: _externalUrl,
            image: _image,
            genre: _genre,
            durationSeconds: _durationSeconds,
            publicationDate: _publicationDate,
            lastUpdate: block.timestamp,
            visits: _visits,
            likes: _likes,
            subscribers: _subscribers,
            clickRate: _clickRate,
            conversions: _conversions,
            contentType: _contentType,
            platform: _platform,
            creator: msg.sender,
            mintedAt: block.timestamp,
            exists: true
        });

        creatorTokens[msg.sender].push(tokenId);

        emit NFTMinted(tokenId, msg.sender, _name, _contentType);

        return tokenId;
    }

    /**
     * @dev Update metadata for a token (only creator or owner)
     */
    function updateMetadata(
        uint256 _tokenId,
        uint256 _visits,
        uint256 _likes,
        uint256 _subscribers,
        uint256 _clickRate,
        uint256 _conversions
    ) public {
        require(tokenMetadata[_tokenId].exists, "Token does not exist");
        require(
            ownerOf(_tokenId) == msg.sender ||
                tokenMetadata[_tokenId].creator == msg.sender,
            "Not authorized to update"
        );

        ContentMetadata storage metadata = tokenMetadata[_tokenId];
        metadata.visits = _visits;
        metadata.likes = _likes;
        metadata.subscribers = _subscribers;
        metadata.clickRate = _clickRate;
        metadata.conversions = _conversions;
        metadata.lastUpdate = block.timestamp;

        emit MetadataUpdated(_tokenId, _visits, _likes, _subscribers);
    }

    /**
     * @dev Get all tokens by creator
     */
    function getTokensByCreator(
        address _creator
    ) public view returns (uint256[] memory) {
        return creatorTokens[_creator];
    }

    /**
     * @dev Get metadata for a token
     */
    function getMetadata(
        uint256 _tokenId
    ) public view returns (ContentMetadata memory) {
        require(tokenMetadata[_tokenId].exists, "Token does not exist");
        return tokenMetadata[_tokenId];
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // Override functions
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenMetadata[tokenId].exists, "Token does not exist");

        ContentMetadata memory meta = tokenMetadata[tokenId];

        // Return the image URL as token URI (can be enhanced with base64 encoded JSON)
        return meta.image;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
