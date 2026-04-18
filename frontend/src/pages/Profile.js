import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Stack,
  Button,
  Skeleton,
  Alert,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { account, formatAddress, disconnectWallet, networkInfo } = useWeb3();
  const [stats, setStats] = useState({
    nftsCreated: 0,
    nftsSold: 0,
    totalVolume: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (account) {
      fetchUserStats();
    }
  }, [account]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Fetch NFTs created
      const createdResponse = await axios.get(`${API_URL}/nft/creator/${account}`);
      const nftsCreated = createdResponse.data.data?.length || 0;
      
      // Fetch listings
      const listingsResponse = await axios.get(`${API_URL}/marketplace/seller/${account}`);
      const listings = listingsResponse.data.data || [];
      
      setStats({
        nftsCreated,
        nftsSold: listings.filter(l => !l.active).length,
        totalVolume: listings.reduce((acc, l) => acc + parseFloat(l.price || 0), 0),
        totalEarnings: listings.filter(l => !l.active).reduce((acc, l) => acc + parseFloat(l.price || 0), 0),
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setSnackbar({ open: true, message: 'Dirección copiada al portapapeles' });
    }
  };

  const viewOnExplorer = () => {
    if (account && networkInfo?.blockExplorerUrls?.[0]) {
      window.open(`${networkInfo.blockExplorerUrls[0]}/address/${account}`, '_blank');
    }
  };

  if (!account) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Por favor conecta tu wallet para ver tu perfil
        </Alert>
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
        {/* Profile Header */}
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <Box
            sx={{
              height: 120,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mt: -6 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  border: '4px solid',
                  borderColor: 'background.paper',
                }}
              >
                {account.slice(2, 4).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, pb: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  Perfil de Usuario
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {formatAddress(account)}
                  </Typography>
                  <IconButton size="small" onClick={copyAddress}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  {networkInfo?.blockExplorerUrls?.[0] && (
                    <IconButton size="small" onClick={viewOnExplorer}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Box>
              <Button variant="outlined" color="error" onClick={disconnectWallet}>
                Desconectar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <AutoGraphIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
              ) : (
                <Typography variant="h3" fontWeight={800} className="gradient-text">
                  {stats.nftsCreated}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                NFTs Creados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <StorefrontIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
              ) : (
                <Typography variant="h3" fontWeight={800} className="gradient-text">
                  {stats.nftsSold}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                NFTs Vendidos
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
              ) : (
                <Typography variant="h3" fontWeight={800} className="gradient-text">
                  {stats.totalVolume.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Volumen Total (MON)
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
              ) : (
                <Typography variant="h3" fontWeight={800} className="gradient-text">
                  {stats.totalEarnings.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Ganancias (MON)
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Network Info */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Información de Red
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Red</Typography>
              <Typography variant="body1">{networkInfo?.chainName || 'Monad Testnet'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Chain ID</Typography>
              <Typography variant="body1">{networkInfo?.chainId || 10143}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Contrato NFT</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {networkInfo?.nftContract ? formatAddress(networkInfo.nftContract) : 'No desplegado'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Contrato Marketplace</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {networkInfo?.marketplaceContract ? formatAddress(networkInfo.marketplaceContract) : 'No desplegado'}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Acciones Rápidas
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AutoGraphIcon />}
              onClick={() => window.location.href = '/create'}
            >
              Crear NFT
            </Button>
            <Button
              variant="outlined"
              startIcon={<StorefrontIcon />}
              onClick={() => window.location.href = '/marketplace'}
            >
              Ver Marketplace
            </Button>
          </Stack>
        </Box>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Profile;