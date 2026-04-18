import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Monad Testnet Configuration
const MONAD_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz/'],
};

const Web3Context = createContext(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [contracts, setContracts] = useState({
    nft: null,
    marketplace: null,
  });

  // Fetch network info from backend
  const fetchNetworkInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/nft/network`);
      setNetworkInfo(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching network info:', err);
      return null;
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Switch to Monad Testnet
  const switchToMonad = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_CONFIG.chainId }],
      });
      return true;
    } catch (switchError) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Monad network:', addError);
          throw new Error('Failed to add Monad network to MetaMask');
        }
      }
      throw switchError;
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Monad network
      await switchToMonad();

      // Create ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(accounts[0]);

      // Fetch network info
      const info = await fetchNetworkInfo();

      // Initialize contracts if addresses are available
      if (info && info.nftContract && info.marketplaceContract) {
        initializeContracts(ethersSigner, info);
      }

      return accounts[0];
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContracts({ nft: null, marketplace: null });
  };

  // Initialize contracts
  const initializeContracts = async (signerOrProvider, info) => {
    try {
      // Import ABIs
      const ContentNFTABI = require('../abis/ContentNFT.json');
      const NFTMarketplaceABI = require('../abis/NFTMarketplace.json');

      const nftContract = new ethers.Contract(
        info.nftContract,
        ContentNFTABI.abi,
        signerOrProvider
      );

      const marketplaceContract = new ethers.Contract(
        info.marketplaceContract,
        NFTMarketplaceABI.abi,
        signerOrProvider
      );

      setContracts({
        nft: nftContract,
        marketplace: marketplaceContract,
      });

      return { nftContract, marketplaceContract };
    } catch (err) {
      console.error('Error initializing contracts:', err);
      return null;
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        // Reinitialize with new account
        if (provider) {
          provider.getSigner().then((newSigner) => {
            setSigner(newSigner);
            if (networkInfo) {
              initializeContracts(newSigner, networkInfo);
            }
          });
        }
      }
    };

    const handleChainChanged = () => {
      // Reload on chain change
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(console.error);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    contracts,
    isConnecting,
    error,
    networkInfo,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToMonad,
    formatAddress,
    fetchNetworkInfo,
    initializeContracts,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;