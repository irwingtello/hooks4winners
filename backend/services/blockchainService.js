const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (simplified for key functions)
const ContentNFTABI = require('../abis/ContentNFT.json');
const NFTMarketplaceABI = require('../abis/NFTMarketplace.json');

class BlockchainService {
  constructor() {
    this.rpcUrl = (process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz').trim();
    this.chainId = parseInt(process.env.MONAD_CHAIN_ID) || 10143;
    // Trim addresses to remove any whitespace/newlines
    this.nftContractAddress = (process.env.NFT_CONTRACT_ADDRESS || '').trim();
    this.marketplaceContractAddress = (process.env.MARKETPLACE_CONTRACT_ADDRESS || '').trim();
    this.deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();
    
    this.provider = null;
    this.wallet = null;
    this.nftContract = null;
    this.marketplaceContract = null;
    this.nftInterface = null;
    this.marketplaceInterface = null;
    
    this.init();
  }

  init() {
    try {
      // Create interfaces for encoding/decoding only
      this.nftInterface = new ethers.Interface(ContentNFTABI.abi || ContentNFTABI);
      this.marketplaceInterface = new ethers.Interface(NFTMarketplaceABI.abi || NFTMarketplaceABI);
      
      // DON'T create ethers provider - use direct RPC calls to avoid ENS issues
      // We only need the interfaces for encoding/decoding
      
      console.log('🔗 Blockchain service initialized');
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
    }
  }

  /**
   * Make a direct RPC call to avoid ENS issues
   */
  async _rpcCall(method, params = []) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      })
    });
    const data = await response.json();
    if (data.error) {
      console.error('RPC Error:', data.error);
      throw new Error(data.error.message || 'RPC Error');
    }
    return data.result;
  }

  /**
   * Make a direct eth_call to a contract
   */
  async _ethCall(to, data) {
    // Ensure to is a valid address
    if (!to || !ethers.isAddress(to)) {
      throw new Error(`Invalid contract address: ${to}`);
    }
    // Ensure data is a valid hex string
    if (!data || !data.startsWith('0x')) {
      throw new Error(`Invalid call data: ${data}`);
    }
    console.log(`eth_call to: ${to}, data: ${data.substring(0, 20)}...`);
    return await this._rpcCall('eth_call', [{ to, data }, 'latest']);
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
   * Get NFT metadata from blockchain - using direct RPC call
   */
  async getNFTMetadata(tokenId) {
    try {
      const callData = this.nftInterface.encodeFunctionData('getMetadata', [tokenId]);
      const result = await this._ethCall(this.nftContractAddress, callData);
      const decoded = this.nftInterface.decodeFunctionResult('getMetadata', result);
      const metadata = decoded[0];
      
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
   * Execute a read-only contract call, handling ENS errors
   */
  async _callContract(contract, methodName, ...args) {
    try {
      const result = await contract[methodName](...args);
      return result;
    } catch (error) {
      // If it's an ENS error, try using staticCall
      if (error.code === 'UNSUPPORTED_OPERATION' || error.message?.includes('ENS')) {
        console.log(`Retrying ${methodName} with direct call...`);
        try {
          // Use call directly to bypass ENS
          const callData = contract.interface.encodeFunctionData(methodName, args);
          const result = await this.provider.call({
            to: contract.target || contract.address,
            data: callData
          });
          const decoded = contract.interface.decodeFunctionResult(methodName, result);
          return decoded.length === 1 ? decoded[0] : decoded;
        } catch (e) {
          console.error(`Error in ${methodName} fallback:`, e);
          throw e;
        }
      }
      throw error;
    }
  }

  /**
   * Get total NFT supply - using direct RPC call
   */
  async getTotalSupply() {
    try {
      const callData = this.nftInterface.encodeFunctionData('totalSupply');
      const result = await this._ethCall(this.nftContractAddress, callData);
      const decoded = this.nftInterface.decodeFunctionResult('totalSupply', result);
      return Number(decoded[0]);
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  /**
   * Get NFTs by creator - using direct RPC call
   */
  async getNFTsByCreator(creatorAddress) {
    try {
      const callData = this.nftInterface.encodeFunctionData('getTokensByCreator', [creatorAddress]);
      const result = await this._ethCall(this.nftContractAddress, callData);
      const decoded = this.nftInterface.decodeFunctionResult('getTokensByCreator', result);
      return decoded[0].map(id => Number(id));
    } catch (error) {
      console.error('Error getting NFTs by creator:', error);
      throw error;
    }
  }

  /**
   * Get NFT owner - using direct RPC call
   */
  async getNFTOwner(tokenId) {
    try {
      const callData = this.nftInterface.encodeFunctionData('ownerOf', [tokenId]);
      const result = await this._ethCall(this.nftContractAddress, callData);
      const decoded = this.nftInterface.decodeFunctionResult('ownerOf', result);
      return decoded[0];
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
    return this.nftInterface.encodeFunctionData('mintNFT', [
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
    const priceInWei = ethers.parseEther(priceInEther.toString());
    return this.marketplaceInterface.encodeFunctionData('listNFT', [
      nftContractAddress,
      tokenId,
      priceInWei
    ]);
  }

  /**
   * Prepare buy NFT transaction data
   */
  prepareBuyNFTData(listingId) {
    return this.marketplaceInterface.encodeFunctionData('buyNFT', [listingId]);
  }

  /**
   * Prepare cancel listing transaction data
   */
  prepareCancelListingData(listingId) {
    return this.marketplaceInterface.encodeFunctionData('cancelListing', [listingId]);
  }

  /**
   * Prepare approve NFT for marketplace
   */
  prepareApproveNFTData(marketplaceAddress) {
    return this.nftInterface.encodeFunctionData('setApprovalForAll', [
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