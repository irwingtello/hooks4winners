// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev Marketplace for buying and selling NFTs
 * @author hooksforwinners
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    // Listing structure
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool active;
        uint256 createdAt;
    }

    // Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;

    // Mapping from NFT contract to token ID to listing ID
    mapping(address => mapping(uint256 => uint256)) public tokenToListing;

    // Mapping from seller to their listing IDs
    mapping(address => uint256[]) public sellerListings;

    // Counter for listing IDs
    uint256 private _listingIdCounter;

    // Marketplace fee (2.5%)
    uint256 public marketplaceFee = 250; // basis points (250 = 2.5%)

    // Maximum fee (10%)
    uint256 public constant MAX_FEE = 1000;

    // Events
    event Listed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event Sold(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId, address indexed seller);

    event PriceUpdated(
        uint256 indexed listingId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev List an NFT for sale
     */
    function listNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant returns (uint256) {
        require(_price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(_nftContract);

        // Check ownership and approval
        require(nft.ownerOf(_tokenId) == msg.sender, "Not owner of NFT");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(_tokenId) == address(this),
            "NFT not approved for marketplace"
        );

        // Check if already listed
        require(
            tokenToListing[_nftContract][_tokenId] == 0 ||
                !listings[tokenToListing[_nftContract][_tokenId]].active,
            "NFT already listed"
        );

        uint256 listingId = ++_listingIdCounter;

        listings[listingId] = Listing({
            tokenId: _tokenId,
            nftContract: _nftContract,
            seller: msg.sender,
            price: _price,
            active: true,
            createdAt: block.timestamp
        });

        tokenToListing[_nftContract][_tokenId] = listingId;
        sellerListings[msg.sender].push(listingId);

        // Transfer NFT to marketplace
        nft.transferFrom(msg.sender, address(this), _tokenId);

        emit Listed(listingId, _nftContract, _tokenId, msg.sender, _price);

        return listingId;
    }

    /**
     * @dev Buy an NFT
     */
    function buyNFT(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];

        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        listing.active = false;

        // Calculate fee
        uint256 fee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        // Transfer payment to seller
        (bool successSeller, ) = payable(listing.seller).call{
            value: sellerProceeds
        }("");
        require(successSeller, "Payment to seller failed");

        // Transfer fee to owner
        if (fee > 0) {
            (bool successFee, ) = payable(owner()).call{value: fee}("");
            require(successFee, "Fee transfer failed");
        }

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool successRefund, ) = payable(msg.sender).call{
                value: msg.value - listing.price
            }("");
            require(successRefund, "Refund failed");
        }

        emit Sold(
            _listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];

        require(listing.active, "Listing not active");
        require(
            msg.sender == listing.seller || msg.sender == owner(),
            "Not authorized"
        );

        listing.active = false;

        // Return NFT to seller
        IERC721(listing.nftContract).transferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );

        emit ListingCancelled(_listingId, listing.seller);
    }

    /**
     * @dev Update listing price
     */
    function updatePrice(
        uint256 _listingId,
        uint256 _newPrice
    ) external nonReentrant {
        Listing storage listing = listings[_listingId];

        require(listing.active, "Listing not active");
        require(msg.sender == listing.seller, "Not seller");
        require(_newPrice > 0, "Price must be greater than 0");

        uint256 oldPrice = listing.price;
        listing.price = _newPrice;

        emit PriceUpdated(_listingId, oldPrice, _newPrice);
    }

    /**
     * @dev Update marketplace fee
     */
    function updateFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");

        uint256 oldFee = marketplaceFee;
        marketplaceFee = _newFee;

        emit FeeUpdated(oldFee, _newFee);
    }

    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }

        return activeListings;
    }

    /**
     * @dev Get listings by seller
     */
    function getListingsBySeller(
        address _seller
    ) external view returns (Listing[] memory) {
        uint256[] memory sellerListingIds = sellerListings[_seller];
        Listing[] memory result = new Listing[](sellerListingIds.length);

        for (uint256 i = 0; i < sellerListingIds.length; i++) {
            result[i] = listings[sellerListingIds[i]];
        }

        return result;
    }

    /**
     * @dev Get listing by NFT contract and token ID
     */
    function getListingByToken(
        address _nftContract,
        uint256 _tokenId
    ) external view returns (Listing memory) {
        uint256 listingId = tokenToListing[_nftContract][_tokenId];
        return listings[listingId];
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get total number of listings
     */
    function totalListings() external view returns (uint256) {
        return _listingIdCounter;
    }
}
