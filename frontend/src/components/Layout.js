import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Chip,
  Link,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import CollectionsIcon from '@mui/icons-material/Collections';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';

const MONAD_EXPLORER = process.env.REACT_APP_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com';
const CONTENT_NFT_ADDRESS = process.env.REACT_APP_CONTENT_NFT_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_ADDRESS;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { account, connectWallet, disconnectWallet, isConnecting, formatAddress } = useWeb3();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navItems = [
    { label: 'Inicio', path: '/', icon: <HomeIcon /> },
    { label: 'Marketplace', path: '/marketplace', icon: <StoreIcon /> },
    { label: 'Crear NFT', path: '/create', icon: <AddCircleIcon /> },
    { label: 'Mis NFTs', path: '/my-nfts', icon: <CollectionsIcon /> },
    { label: 'Perfil', path: '/profile', icon: <PersonIcon /> },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={800} className="gradient-text">
          Hooks4Winners
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Marketplace de Contenido Verificado
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 2,
              borderRadius: 2,
              mb: 1,
              bgcolor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: location.pathname === item.path ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
              }}
            >
              <Typography variant="h6" fontWeight={800}>H</Typography>
            </Box>
            <Typography variant="h6" fontWeight={800} className="gradient-text">
              Hooks4Winners
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    bgcolor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Wallet Connection */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {account ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={formatAddress(account)}
                  onDelete={disconnectWallet}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'white',
                  }}
                />
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={connectWallet}
                disabled={isConnecting}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                  },
                }}
              >
                {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            borderLeft: '1px solid rgba(99, 102, 241, 0.2)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ pt: '80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 8,
          py: 4,
          borderTop: '1px solid rgba(245, 158, 11, 0.2)',
          background: 'rgba(10, 10, 10, 0.5)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} className="gradient-text">
                Hooks4Winners
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Marketplace de contenido verificado y especializado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © 2024 Hooks4Winners. Powered by Monad.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom className="gradient-text">
                Ver Contratos en Explorer
              </Typography>
              <Stack direction="column" spacing={1}>
                <Link
                  href={`${MONAD_EXPLORER}/address/${CONTENT_NFT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  ContentNFT <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
                <Link
                  href={`${MONAD_EXPLORER}/address/${MARKETPLACE_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  NFTMarketplace <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;