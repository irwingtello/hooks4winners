const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pinataService = require('../services/pinataService');
const blockchainService = require('../services/blockchainService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'nft-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mp3|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

/**
 * @route   GET /api/nft/network
 * @desc    Get network information
 */
router.get('/network', (req, res) => {
  try {
    const networkInfo = blockchainService.getNetworkInfo();
    res.json({
      success: true,
      data: networkInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/total-supply
 * @desc    Get total NFT supply
 */
router.get('/total-supply', async (req, res) => {
  try {
    const supply = await blockchainService.getTotalSupply();
    res.json({
      success: true,
      data: { totalSupply: supply }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/metadata/:tokenId
 * @desc    Get NFT metadata by token ID
 */
router.get('/metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const metadata = await blockchainService.getNFTMetadata(tokenId);
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/owner/:tokenId
 * @desc    Get NFT owner by token ID
 */
router.get('/owner/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const owner = await blockchainService.getNFTOwner(tokenId);
    res.json({
      success: true,
      data: { owner }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/creator/:address
 * @desc    Get NFTs by creator address
 */
router.get('/creator/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const tokenIds = await blockchainService.getNFTsByCreator(address);
    
    // Get metadata for each token
    const nfts = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const metadata = await blockchainService.getNFTMetadata(tokenId);
          return { tokenId, ...metadata };
        } catch (e) {
          return { tokenId, error: 'Could not fetch metadata' };
        }
      })
    );
    
    res.json({
      success: true,
      data: nfts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/nft/upload-image
 * @desc    Upload image to IPFS via Pinata
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await pinataService.uploadFile(req.file.path, req.file.originalname);
    
    // Clean up local file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      data: {
        ipfsHash: result.ipfsHash,
        url: result.url
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/nft/upload-metadata
 * @desc    Upload NFT metadata to IPFS
 */
router.post('/upload-metadata', async (req, res) => {
  try {
    const nftData = req.body;
    const result = await pinataService.createNFTMetadata(nftData);
    
    res.json({
      success: true,
      data: {
        ipfsHash: result.ipfsHash,
        url: result.url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/nft/prepare-mint
 * @desc    Prepare mint NFT transaction data
 */
router.post('/prepare-mint', async (req, res) => {
  try {
    const nftData = req.body;
    
    // First upload metadata to IPFS
    const metadataResult = await pinataService.createNFTMetadata(nftData);
    
    // Prepare transaction data
    const txData = blockchainService.prepareMintNFTData({
      ...nftData,
      image: metadataResult.url
    });
    
    res.json({
      success: true,
      data: {
        metadataUrl: metadataResult.url,
        metadataHash: metadataResult.ipfsHash,
        txData: txData,
        nftContract: blockchainService.nftContractAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/nft/create-full
 * @desc    Create NFT with image upload and metadata
 */
router.post('/create-full', upload.single('image'), async (req, res) => {
  try {
    const nftData = JSON.parse(req.body.nftData || '{}');
    
    // Upload image to IPFS
    let imageUrl = nftData.image;
    if (req.file) {
      const imageResult = await pinataService.uploadFile(req.file.path, req.file.originalname);
      imageUrl = imageResult.url;
      // Clean up local file
      fs.unlinkSync(req.file.path);
    }
    
    // Upload metadata to IPFS
    const metadataResult = await pinataService.createNFTMetadata({
      ...nftData,
      image: imageUrl
    });
    
    // Prepare mint transaction data
    const txData = blockchainService.prepareMintNFTData({
      ...nftData,
      image: imageUrl
    });
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        metadataUrl: metadataResult.url,
        metadataHash: metadataResult.ipfsHash,
        txData: txData,
        nftContract: blockchainService.nftContractAddress
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/check-approval/:address
 * @desc    Check if NFT is approved for marketplace
 */
router.get('/check-approval/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const isApproved = await blockchainService.isNFTApprovedForMarketplace(address);
    res.json({
      success: true,
      data: { isApproved }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/prepare-approve
 * @desc    Prepare approve NFT for marketplace transaction
 */
router.get('/prepare-approve', (req, res) => {
  try {
    const txData = blockchainService.prepareApproveNFTData();
    res.json({
      success: true,
      data: {
        txData: txData,
        nftContract: blockchainService.nftContractAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/nft/all
 * @desc    Get all NFTs with metadata
 */
router.get('/all', async (req, res) => {
  try {
    const totalSupply = await blockchainService.getTotalSupply();
    const nfts = [];
    
    for (let i = 0; i < totalSupply; i++) {
      try {
        const metadata = await blockchainService.getNFTMetadata(i);
        const owner = await blockchainService.getNFTOwner(i);
        nfts.push({
          tokenId: i,
          ...metadata,
          owner
        });
      } catch (e) {
        console.error(`Error fetching NFT ${i}:`, e);
      }
    }
    
    res.json({
      success: true,
      data: nfts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;