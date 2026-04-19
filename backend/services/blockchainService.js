const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (simplified for key functions)
const ContentNFTABI = require('../abis/ContentNFT.json');
const NFTMarketplaceABI = require('../abis/NFTMarketplace.json');

class BlockchainService {
  constructor() {
    this.rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
    this.chainId = parseInt(process.env.MONAD_CHAIN_ID) || 10143;
    this.nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
    this.marketplaceContractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
    this.deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
    
    this.provider = null;
    this.wallet = null;
    this.nftContract = null;
    this.marketplaceContract = null;
    
    this.init();
  }

  init() {
    try {
      // Create provider without any network detection
      // This avoids ENS lookup completely
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Initialize wallet for backend operations
      if (this.deployerPrivateKey) {
        this.wallet = new ethers.Wallet(this.deployerPrivateKey, this.provider);
      }
      
      // Initialize contracts
      if (this.nftContractAddress && ContentNFTABI) {
        this.nftContract = new ethers.Contract(
          this.nftContractAddress,
          ContentNFTABI.abi || ContentNFTABI,
          this.provider
        );
      }
      
      if (this.marketplaceContractAddress && NFTMarketplaceABI) {
        this.marketplaceContract = new ethers.Contract(
          this.marketplaceContractAddress,
          NFTMarketplaceABI.abi || NFTMarketplaceABI,
          this.provider
        );
      }
      
      console.log('🔗 Blockchain service initialized');
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
    }
  }

  /**
   * Get provider for read operations
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get signer for write operations (user's wallet)
   */
  getSigner(privateKey) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Get NFT contract instance
   */
  getNFTContract(signerOrProvider = this.provider) {
    return new ethers.Contract(
      this.nftContractAddress,
      ContentNFTABI.abi || ContentNFTABI,
      signerOrProvider
    );
  }

  /**
   * Get Marketplace contract instance
   */
  getMarketplaceContract(signerOrProvider = this.provider) {
    return new ethers.Contract(
      this.marketplaceContractAddress,
      NFTMarketplaceABI.abi || NFTMarketplaceABI,
      signerOrProvider
    );
  }

  /**
   * Get NFT metadata from blockchain
   */
  async getNFTMetadata(tokenId) {
    try {
      const contract = this.getNFTContract();
      const metadata = await contract.getMetadata(tokenId);
      
      return {
        name: metadata.name,
        description: metadata.description,
        externalUrl: metadata.externalUrl,
        image: metadata.image,
        genre: metadata.genre,
        durationSeconds: Number(metadata.durationSeconds),
        publicationDate: Number(metadata.publicationDate),
        lastUpdate: Number(metadata.lastUpdate),
        visits: Number(metadata.visits),
        likes: Number(metadata.likes),
        subscribers: Number(metadata.subscribers),
        clickRate: Number(metadata.clickRate),
        conversions: Number(metadata.conversions),
        contentType: metadata.contentType,
        platform: metadata.platform,
        creator: metadata.creator,
        mintedAt: Number(metadata.mintedAt),
        exists: metadata.exists
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Get total NFT supply
   */
  async getTotalSupply() {
    try {
      const contract = this.getNFTContract();
      const supply = await contract.totalSupply();
      return Number(supply);
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  /**
   * Get NFTs by creator
   */
  async getNFTsByCreator(creatorAddress) {
    try {
      const contract = this.getNFTContract();
      const tokenIds = await contract.getTokensByCreator(creatorAddress);
      return tokenIds.map(id => Number(id));
    } catch (error) {
      console.error('Error getting NFTs by creator:', error);
      throw error;
    }
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId) {
    try {
      const contract = this.getNFTContract();
      return await contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting NFT owner:', error);
      throw error;
    }
  }

  /**
   * Get all active marketplace listings
   */
  async getActiveListings() {
    try {
      const contract = this.getMarketplaceContract();
      const listings = await contract.getActiveListings();
      
      return listings.map(listing => ({
        listingId: Number(listing.listingId),
        tokenId: Number(listing.tokenId),
        nftContract: listing.nftContract,
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        priceWei: listing.price.toString(),
        active: listing.active,
        createdAt: Number(listing.createdAt)
      }));
    } catch (error) {
      console.error('Error getting active listings:', error);
      throw error;
    }
  }

  /**
   * Get listings by seller
   */
  async getListingsBySeller(sellerAddress) {
    try {
      const contract = this.getMarketplaceContract();
      const listings = await contract.getListingsBySeller(sellerAddress);
      
      return listings.map(listing => ({
        listingId: Number(listing.listingId),
        tokenId: Number(listing.tokenId),
        nftContract: listing.nftContract,
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        priceWei: listing.price.toString(),
        active: listing.active,
        createdAt: Number(listing.createdAt)
      }));
    } catch (error) {
      console.error('Error getting listings by seller:', error);
      throw error;
    }
  }

  /**
   * Get listing by token
   */
  async getListingByToken(nftContractAddress, tokenId) {
    try {
      const contract = this.getMarketplaceContract();
      const listing = await contract.getListingByToken(nftContractAddress, tokenId);
      
      return {
        listingId: Number(listing.listingId),
        tokenId: Number(listing.tokenId),
        nftContract: listing.nftContract,
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        priceWei: listing.price.toString(),
        active: listing.active,
        createdAt: Number(listing.createdAt)
      };
    } catch (error) {
      console.error('Error getting listing by token:', error);
      throw error;
    }
  }

  /**
   * Get marketplace fee
   */
  async getMarketplaceFee() {
    try {
      const contract = this.getMarketplaceContract();
      const fee = await contract.marketplaceFee();
      return Number(fee);
    } catch (error) {
      console.error('Error getting marketplace fee:', error);
      throw error;
    }
  }

  /**
   * Prepare mint NFT transaction data
   */
  prepareMintNFTData(nftData) {
    const contract = this.getNFTContract();
    return contract.interface.encodeFunctionData('mintNFT', [
      nftData.name || 'Untitled NFT',
      nftData.description || '',
      nftData.externalUrl || '',
      nftData.image || '',
      nftData.genre || 'General',
      nftData.durationSeconds || 60,
      nftData.publicationDate || Math.floor(Date.now() / 1000),
      nftData.visits || 0,
      nftData.likes || 0,
      nftData.subscribers || 0,
      nftData.clickRate || 0,
      nftData.conversions || 0,
      nftData.contentType || 'Contenido',
      nftData.platform || 'Video'
    ]);
  }

  /**
   * Prepare list NFT transaction data
   */
  prepareListNFTData(nftContractAddress, tokenId, priceInEther) {
    const contract = this.getMarketplaceContract();
    const priceInWei = ethers.parseEther(priceInEther.toString());
    return contract.interface.encodeFunctionData('listNFT', [
      nftContractAddress,
      tokenId,
      priceInWei
    ]);
  }

  /**
   * Prepare buy NFT transaction data
   */
  prepareBuyNFTData(listingId) {
    const contract = this.getMarketplaceContract();
    return contract.interface.encodeFunctionData('buyNFT', [listingId]);
  }

  /**
   * Prepare cancel listing transaction data
   */
  prepareCancelListingData(listingId) {
    const contract = this.getMarketplaceContract();
    return contract.interface.encodeFunctionData('cancelListing', [listingId]);
  }

  /**
   * Prepare approve NFT for marketplace
   */
  prepareApproveNFTData(marketplaceAddress) {
    const contract = this.getNFTContract();
    return contract.interface.encodeFunctionData('setApprovalForAll', [
      marketplaceAddress || this.marketplaceContractAddress,
      true
    ]);
  }

  /**
   * Check if NFT is approved for marketplace
   */
  async isNFTApprovedForMarketplace(ownerAddress) {
    try {
      const contract = this.getNFTContract();
      return await contract.isApprovedForAll(ownerAddress, this.marketplaceContractAddress);
    } catch (error) {
      console.error('Error checking NFT approval:', error);
      throw error;
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      rpcUrl: this.rpcUrl,
      chainId: this.chainId,
      chainName: 'Monad Testnet',
      nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
      },
      blockExplorerUrls: ['https://testnet-explorer.monad.xyz/'],
      nftContract: this.nftContractAddress,
      marketplaceContract: this.marketplaceContractAddress
    };
  }
}

module.exports = new BlockchainService();