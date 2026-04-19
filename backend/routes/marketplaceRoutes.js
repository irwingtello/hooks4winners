const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

/**
 * @route   GET /api/marketplace/listings
 * @desc    Get all active marketplace listings
 */
router.get('/listings', async (req, res) => {
  try {
    const listings = await blockchainService.getActiveListings();
    
    // Get NFT metadata for each listing
    const listingsWithMetadata = await Promise.all(
      listings.map(async (listing) => {
        try {
          const metadata = await blockchainService.getNFTMetadata(listing.tokenId);
          return {
            ...listing,
            nft: metadata
          };
        } catch (e) {
          return {
            ...listing,
            nft: null
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: listingsWithMetadata
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/listing/:listingId
 * @desc    Get listing by ID
 */
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await blockchainService.getListingById(listingId);
    
    // Get NFT metadata
    try {
      const metadata = await blockchainService.getNFTMetadata(listing.tokenId);
      listing.nft = metadata;
    } catch (e) {
      listing.nft = null;
    }
    
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/seller/:address
 * @desc    Get listings by seller address
 */
router.get('/seller/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const listings = await blockchainService.getListingsBySeller(address);
    
    // Get NFT metadata for each listing
    const listingsWithMetadata = await Promise.all(
      listings.map(async (listing) => {
        try {
          const metadata = await blockchainService.getNFTMetadata(listing.tokenId);
          return {
            ...listing,
            nft: metadata
          };
        } catch (e) {
          return {
            ...listing,
            nft: null
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: listingsWithMetadata
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/token/:nftContract/:tokenId
 * @desc    Get listing by NFT contract and token ID
 */
router.get('/token/:nftContract/:tokenId', async (req, res) => {
  try {
    const { nftContract, tokenId } = req.params;
    const listing = await blockchainService.getListingByToken(nftContract, tokenId);
    
    // Get NFT metadata
    try {
      const metadata = await blockchainService.getNFTMetadata(listing.tokenId);
      listing.nft = metadata;
    } catch (e) {
      listing.nft = null;
    }
    
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/fee
 * @desc    Get marketplace fee
 */
router.get('/fee', async (req, res) => {
  try {
    const fee = await blockchainService.getMarketplaceFee();
    res.json({
      success: true,
      data: {
        fee: fee,
        feePercent: fee / 100
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/total
 * @desc    Get total number of listings
 */
router.get('/total', async (req, res) => {
  try {
    const total = await blockchainService.getTotalListings();
    res.json({
      success: true,
      data: { totalListings: total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/marketplace/prepare-list
 * @desc    Prepare list NFT transaction data
 */
router.post('/prepare-list', (req, res) => {
  try {
    const { nftContract, tokenId, price } = req.body;
    
    if (!nftContract || tokenId === undefined || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nftContract, tokenId, price'
      });
    }
    
    const txData = blockchainService.prepareListNFTData(nftContract, tokenId, price);
    
    res.json({
      success: true,
      data: {
        txData: txData,
        marketplaceContract: blockchainService.marketplaceContractAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/marketplace/prepare-buy
 * @desc    Prepare buy NFT transaction data
 */
router.post('/prepare-buy', (req, res) => {
  try {
    const { listingId, price } = req.body;
    
    if (listingId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: listingId'
      });
    }
    
    const txData = blockchainService.prepareBuyNFTData(listingId);
    const { ethers } = require('ethers');
    
    res.json({
      success: true,
      data: {
        txData: txData,
        marketplaceContract: blockchainService.marketplaceContractAddress,
        value: price ? ethers.parseEther(price.toString()).toString() : '0'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/marketplace/prepare-cancel
 * @desc    Prepare cancel listing transaction data
 */
router.post('/prepare-cancel', (req, res) => {
  try {
    const { listingId } = req.body;
    
    if (listingId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: listingId'
      });
    }
    
    const txData = blockchainService.prepareCancelListingData(listingId);
    
    res.json({
      success: true,
      data: {
        txData: txData,
        marketplaceContract: blockchainService.marketplaceContractAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/marketplace/prepare-update-price
 * @desc    Prepare update price transaction data
 */
router.post('/prepare-update-price', (req, res) => {
  try {
    const { listingId, newPrice } = req.body;
    
    if (listingId === undefined || !newPrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listingId, newPrice'
      });
    }
    
    const contract = blockchainService.getMarketplaceContract();
    const { ethers } = require('ethers');
    const priceInWei = ethers.parseEther(newPrice.toString());
    const txData = contract.interface.encodeFunctionData('updatePrice', [listingId, priceInWei]);
    
    res.json({
      success: true,
      data: {
        txData: txData,
        marketplaceContract: blockchainService.marketplaceContractAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/gas-price
 * @desc    Get current gas price
 */
router.get('/gas-price', async (req, res) => {
  try {
    const gasPrice = await blockchainService.getGasPrice();
    const { ethers } = require('ethers');
    
    res.json({
      success: true,
      data: {
        gasPrice: gasPrice.toString(),
        gasPriceGwei: ethers.formatUnits(gasPrice, 'gwei')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/marketplace/tx/:txHash
 * @desc    Get transaction receipt
 */
router.get('/tx/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const receipt = await blockchainService.getTransactionReceipt(txHash);
    
    res.json({
      success: true,
      data: {
        status: receipt?.status,
        blockNumber: receipt?.blockNumber,
        transactionHash: receipt?.hash,
        from: receipt?.from,
        to: receipt?.to,
        gasUsed: receipt?.gasUsed?.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/marketplace/wait/:txHash
 * @desc    Wait for transaction confirmation
 */
router.post('/wait/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { confirmations } = req.body;
    
    const receipt = await blockchainService.waitForTransaction(txHash, confirmations || 1);
    
    res.json({
      success: true,
      data: {
        status: receipt?.status,
        blockNumber: receipt?.blockNumber,
        transactionHash: receipt?.hash,
        gasUsed: receipt?.gasUsed?.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;