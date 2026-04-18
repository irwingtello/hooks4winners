import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
  Skeleton,
  Alert,
  Divider,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MONAD_EXPLORER = process.env.REACT_APP_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com';
const CONTENT_NFT_ADDRESS = process.env.REACT_APP_CONTENT_NFT_ADDRESS;

const NFTDetail = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { account, contracts, signer, formatAddress } = useWeb3();
  const [nft, setNft] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(null);

  useEffect(() => {
    fetchNFTData();
  }, [tokenId, account]);

  const fetchNFTData = async () => {
    try {
      setLoading(true);
      const metadataResponse = await axios.get(`${API_URL}/nft/metadata/${tokenId}`);
      const nftData = metadataResponse.data.data;
      
      // Get owner
      const ownerResponse = await axios.get(`${API_URL}/nft/owner/${tokenId}`);
      nftData.owner = ownerResponse.data.data.owner;
      
      setNft(nftData);
      
      // Check if listed
      try {
        const listingResponse = await axios.get(`${API_URL}/marketplace/listing/${tokenId}`);
        setListing(listingResponse.data.data);
      } catch (e) {
        setListing(null);
      }
      
      // Check if current user is owner
      if (account && nftData.owner?.toLowerCase() === account.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching NFT:', err);
      setError('No se pudo cargar el NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = async () => {
    if (!account || !contracts.marketplace || !listPrice) return;
    
    setTxLoading(true);
    setTxSuccess(null);
    
    try {
      // First approve marketplace
      const approveTx = await contracts.nft.setApprovalForAll(contracts.marketplace.target, true);
      await approveTx.wait();
      
      // Then list
      const priceInWei = ethers.parseEther(listPrice);
      const listTx = await contracts.marketplace.listNFT(
        contracts.nft.target,
        tokenId,
        priceInWei
      );
      await listTx.wait();
      
      setTxSuccess('NFT listado exitosamente');
      setListDialogOpen(false);
      fetchNFTData();
    } catch (err) {
      console.error('Error listing NFT:', err);
      setError('Error al listar el NFT: ' + err.message);
    } finally {
      setTxLoading(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!account || !contracts.marketplace || !listing) return;
    
    setTxLoading(true);
    setTxSuccess(null);
    
    try {
      const priceInWei = ethers.parseEther(listing.price);
      const buyTx = await contracts.marketplace.buyNFT(listing.listingId, {
        value: priceInWei
      });
      await buyTx.wait();
      
      setTxSuccess('NFT comprado exitosamente');
      fetchNFTData();
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError('Error al comprar el NFT: ' + err.message);
    } finally {
      setTxLoading(false);
    }
  };

  const handleCancelListing = async () => {
    if (!account || !contracts.marketplace || !listing) return;
    
    setTxLoading(true);
    setTxSuccess(null);
    
    try {
      const cancelTx = await contracts.marketplace.cancelListing(listing.listingId);
      await cancelTx.wait();
      
      setTxSuccess('Listado cancelado');
      fetchNFTData();
    } catch (err) {
      console.error('Error canceling listing:', err);
      setError('Error al cancelar el listado: ' + err.message);
    } finally {
      setTxLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error && !nft) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/marketplace')} sx={{ mt: 2 }}>
          Volver al Marketplace
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {txSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {txSuccess}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <Box
                sx={{
                  height: 400,
                  background: nft?.image
                    ? `url(${nft.image}) center/cover`
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!nft?.image && (
                  <Typography variant="h1" sx={{ opacity: 0.3 }}>
                    {nft?.contentType?.charAt(0) || 'NFT'}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Title and Tags */}
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {nft?.genre && <Chip label={nft.genre} color="primary" />}
                  {nft?.contentType && <Chip label={nft.contentType} variant="outlined" />}
                  {nft?.platform && <Chip label={nft.platform} variant="outlined" />}
                </Stack>
                <Typography variant="h3" fontWeight={800} className="gradient-text" gutterBottom>
                  {nft?.name || `NFT #${tokenId}`}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {nft?.description || 'Contenido tokenizado verificado'}
                </Typography>
              </Box>

              {/* Creator & Owner */}
              <Card sx={{ p: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Creador</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatAddress(nft?.creator || 'Unknown')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Propietario</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatAddress(nft?.owner || 'Unknown')}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Price */}
              {listing && listing.active && (
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Typography variant="subtitle2" color="text.secondary">Precio</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {listing.price} MON
                  </Typography>
                </Card>
              )}

              {/* Actions */}
              <Stack direction="row" spacing={2}>
                {isOwner ? (
                  <>
                    {listing && listing.active ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelListing}
                        disabled={txLoading}
                      >
                        {txLoading ? <CircularProgress size={20} /> : 'Cancelar Listado'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<SellIcon />}
                        onClick={() => setListDialogOpen(true)}
                        disabled={txLoading}
                      >
                        Poner en Venta
                      </Button>
                    )}
                  </>
                ) : (
                  listing && listing.active && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={txLoading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                      onClick={handleBuyNFT}
                      disabled={!account || txLoading}
                    >
                      Comprar por {listing.price} MON
                    </Button>
                  )
                )}
              </Stack>

              {/* Metrics */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Métricas Verificadas
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Visitas</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {nft?.visits?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FavoriteIcon color="error" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Likes</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {nft?.likes || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Suscriptores</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {nft?.subscribers || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="success" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">CTR</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {nft?.clickRate || 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Conversiones</Typography>
                    <Typography variant="body1">{nft?.conversions || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Duración</Typography>
                    <Typography variant="body1">{nft?.durationSeconds || 0}s</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Token ID</Typography>
                    <Typography variant="body1">#{tokenId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Fecha Publicación</Typography>
                    <Typography variant="body1">
                      {nft?.publicationDate ? new Date(nft.publicationDate * 1000).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* External URL */}
              {nft?.externalUrl && (
                <Button
                  variant="outlined"
                  endIcon={<OpenInNewIcon />}
                  href={nft.externalUrl}
                  target="_blank"
                >
                  Ver Contenido Original
                </Button>
              )}
              
              {/* Monad Explorer Links */}
              <Card sx={{ p: 2, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom className="gradient-text">
                  Ver en Monad Explorer
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<OpenInNewIcon />}
                    href={`${MONAD_EXPLORER}/address/${CONTENT_NFT_ADDRESS}`}
                    target="_blank"
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  >
                    Contrato NFT
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<OpenInNewIcon />}
                    href={`${MONAD_EXPLORER}/token/${CONTENT_NFT_ADDRESS}?a=${tokenId}`}
                    target="_blank"
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  >
                    Token #{tokenId}
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </motion.div>

      {/* List Dialog */}
      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)}>
        <DialogTitle>Poner en Venta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Precio (MON)"
            type="number"
            fullWidth
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            InputProps={{
              inputProps: { min: 0, step: 0.001 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleListNFT}
            disabled={!listPrice || txLoading}
          >
            {txLoading ? <CircularProgress size={20} /> : 'Listar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NFTDetail;