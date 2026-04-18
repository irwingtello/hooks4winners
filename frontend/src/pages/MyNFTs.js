import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Button,
  Skeleton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useWeb3 } from '../context/Web3Context';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MyNFTs = () => {
  const navigate = useNavigate();
  const { account, formatAddress } = useWeb3();
  const [createdNFTs, setCreatedNFTs] = useState([]);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (account) {
      fetchMyNFTs();
    }
  }, [account]);

  const fetchMyNFTs = async () => {
    try {
      setLoading(true);
      
      // Fetch NFTs created by user
      const createdResponse = await axios.get(`${API_URL}/nft/creator/${account}`);
      setCreatedNFTs(createdResponse.data.data || []);
      
      // Fetch user's listings
      const listingsResponse = await axios.get(`${API_URL}/marketplace/seller/${account}`);
      setListings(listingsResponse.data.data || []);
      
      // For owned NFTs, we would need an endpoint to get NFTs by owner
      // For now, we'll combine created NFTs
      setOwnedNFTs(createdResponse.data.data || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('No se pudieron cargar tus NFTs');
    } finally {
      setLoading(false);
    }
  };

  const NFTCard = ({ nft, index, listing }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        sx={{
          height: '100%',
          background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
          },
        }}
      >
        <CardActionArea onClick={() => navigate(`/nft/${nft.tokenId}`)}>
          <Box
            sx={{
              height: 180,
              background: nft?.image
                ? `url(${nft.image}) center/cover`
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {!nft?.image && (
              <Typography variant="h3" sx={{ opacity: 0.5 }}>
                {nft?.contentType?.charAt(0) || 'NFT'}
              </Typography>
            )}
            {listing && listing.active && (
              <Chip
                label={`${listing.price} MON`}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 700,
                }}
              />
            )}
          </Box>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
              {nft?.name || `NFT #${nft.tokenId}`}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              {nft?.genre && <Chip label={nft.genre} size="small" />}
              {nft?.contentType && <Chip label={nft.contentType} size="small" variant="outlined" />}
            </Stack>
            <Stack direction="row" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {nft?.visits?.toLocaleString() || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FavoriteIcon fontSize="small" color="error" />
                <Typography variant="caption" color="text.secondary">
                  {nft?.likes || 0}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );

  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Por favor conecta tu wallet para ver tus NFTs
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} className="gradient-text" gutterBottom>
          Mis NFTs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra tu contenido tokenizado
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={`Creados (${createdNFTs.length})`} />
          <Tab label={`En Venta (${listings.filter(l => l.active).length})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card sx={{ height: 300 }}>
                <Skeleton variant="rectangular" height={180} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {activeTab === 0 && (
            <>
              {createdNFTs.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Aún no has creado ningún NFT
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create')}
                    sx={{ mt: 2 }}
                  >
                    Crear mi primer NFT
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {createdNFTs.map((nft, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={nft.tokenId || index}>
                      <NFTCard nft={nft} index={index} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              {listings.filter(l => l.active).length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No tienes NFTs en venta
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/my-nfts')}
                    sx={{ mt: 2 }}
                  >
                    Ver mis NFTs
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {listings.filter(l => l.active).map((listing, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId || index}>
                      <NFTCard nft={listing.nft} index={index} listing={listing} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default MyNFTs;