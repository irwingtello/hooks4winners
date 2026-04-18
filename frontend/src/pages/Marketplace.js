import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MONAD_EXPLORER = process.env.REACT_APP_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com';
const CONTENT_NFT_ADDRESS = process.env.REACT_APP_CONTENT_NFT_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_ADDRESS;

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Fetch all NFTs created (not just listed ones)
      const [allNftsResponse, listingsResponse] = await Promise.all([
        axios.get(`${API_URL}/nft/all`),
        axios.get(`${API_URL}/marketplace/listings`)
      ]);
      
      const allNfts = allNftsResponse.data.data || [];
      const listings = listingsResponse.data.data || [];
      
      // Create a map of listed NFTs by tokenId
      const listingMap = {};
      listings.forEach(listing => {
        listingMap[listing.tokenId] = listing;
      });
      
      // Combine all NFTs with their listing info (if any)
      const combinedData = allNfts.map(nft => {
        const listing = listingMap[nft.tokenId];
        if (listing) {
          return {
            ...listing,
            nft: nft
          };
        }
        // NFT not listed - show with owner info
        return {
          tokenId: nft.tokenId,
          nft: nft,
          owner: nft.owner,
          isListed: false,
          price: null
        };
      });
      
      setListings(combinedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('No se pudieron cargar los NFTs. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (!listing.nft) return false;
    
    const matchesSearch = listing.nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.nft.contentType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = filterGenre === 'all' || listing.nft.genre?.toLowerCase() === filterGenre.toLowerCase();
    const matchesType = filterType === 'all' || listing.nft.contentType?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesType;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'popular':
        return (b.nft?.visits || 0) - (a.nft?.visits || 0);
      case 'newest':
      default:
        return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  const genres = ['all', 'Comedia', 'Drama', 'Terror', 'Acción', 'Documental', 'Educativo', 'Entretenimiento'];
  const contentTypes = ['all', 'Video', 'Audio', 'Texto', 'Imagen', 'Guion', 'Curso'];

  const NFTCard = ({ listing, index }) => (
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
        <CardActionArea onClick={() => navigate(`/nft/${listing.tokenId}`)}>
          {/* Image */}
          <Box
            sx={{
              height: 200,
              background: listing.nft?.image 
                ? `url(${listing.nft.image}) center/cover`
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {!listing.nft?.image && (
              <Typography variant="h3" sx={{ opacity: 0.5 }}>
                {listing.nft?.contentType?.charAt(0) || 'NFT'}
              </Typography>
            )}
            {/* Price/Status Badge */}
            <Chip
              label={listing.isListed === false ? 'No listado' : `${listing.price} MON`}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: listing.isListed === false 
                  ? 'rgba(139, 92, 246, 0.8)' 
                  : 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700,
              }}
            />
          </Box>

          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
              {listing.nft?.name || `NFT #${listing.tokenId}`}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
              {listing.nft?.description || 'Contenido tokenizado verificado'}
            </Typography>

            {/* Tags */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {listing.nft?.genre && (
                <Chip label={listing.nft.genre} size="small" sx={{ fontSize: '0.75rem' }} />
              )}
              {listing.nft?.contentType && (
                <Chip label={listing.nft.contentType} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
              )}
            </Stack>

            {/* Stats */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {listing.nft?.visits?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FavoriteIcon fontSize="small" color="error" />
                  <Typography variant="caption" color="text.secondary">
                    {listing.nft?.likes || 0}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                CTR: {listing.nft?.clickRate || 0}%
              </Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Card sx={{ height: 380 }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" width="80%" height={30} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" height={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} className="gradient-text" gutterBottom>
              Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Descubre contenido verificado y tokenizado. Cada NFT incluye métricas reales.
            </Typography>
          </Box>
          <Card sx={{ p: 2, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom className="gradient-text">
              Ver en Monad Explorer
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="text"
                endIcon={<OpenInNewIcon />}
                href={`${MONAD_EXPLORER}/address/${CONTENT_NFT_ADDRESS}`}
                target="_blank"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, fontSize: '0.75rem' }}
              >
                NFT Contract
              </Button>
              <Button
                size="small"
                variant="text"
                endIcon={<OpenInNewIcon />}
                href={`${MONAD_EXPLORER}/address/${MARKETPLACE_ADDRESS}`}
                target="_blank"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, fontSize: '0.75rem' }}
              >
                Marketplace
              </Button>
            </Stack>
          </Card>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, mb: 4, background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={filterGenre}
                label="Género"
                onChange={(e) => setFilterGenre(e.target.value)}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre === 'all' ? 'Todos' : genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filterType}
                label="Tipo"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'Todos' : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Más recientes</MenuItem>
                <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
                <MenuItem value="popular">Más populares</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={fetchListings}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* NFT Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : sortedListings.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No se encontraron NFTs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {listings.length === 0 
              ? 'Aún no hay NFTs en el marketplace. ¡Sé el primero en crear uno!'
              : 'Intenta ajustar los filtros de búsqueda'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sortedListings.map((listing, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId || index}>
              <NFTCard listing={listing} index={index} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Marketplace;