import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useWeb3 } from '../context/Web3Context';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useWeb3();

  const features = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Contenido Verificado',
      description: 'Cada NFT incluye estadísticas comprobadas del rendimiento real del contenido.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Autenticidad Garantizada',
      description: 'Tokenización en blockchain que garantiza la propiedad y procedencia del contenido.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Métricas Reales',
      description: 'Visitas, likes, suscriptores y tasas de conversión verificadas en cadena.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Monad Powered',
      description: 'Transacciones ultra rápidas con costos mínimos gracias a Monad Testnet.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'NFTs Creados' },
    { value: '5K+', label: 'Usuarios Activos' },
    { value: '100K+', label: 'MON Transaccionado' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const benefits = [
    'Acceso a asesorías especializadas tokenizadas',
    'Optimiza tu presupuesto sin perder calidad',
    'Contenido sectorizado y validado',
    'Sin intermediarios, directo al valor',
    'Propiedad intelectual monetizable',
    'Métricas transparentes y verificables',
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(217, 119, 6, 0.1) 0%, transparent 50%)',
        }}
        className="hero-bg"
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip
                  label="🚀 Powered by Monad Testnet"
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  El Futuro del{' '}
                  <span className="gradient-text">Contenido Tokenizado</span>
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
                  Marketplace de contenido verificado y especializado. Sin basura, solo valor. 
                  Compra, vende y monetiza contenido premium con métricas reales.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {!account ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AccountBalanceWalletIcon />}
                      onClick={connectWallet}
                      disabled={isConnecting}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                        },
                      }}
                    >
                      {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RocketLaunchIcon />}
                      onClick={() => navigate('/marketplace')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      Explorar Marketplace
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<StorefrontIcon />}
                    onClick={() => navigate('/create')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    Crear NFT
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {/* Floating NFT Cards */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 500,
                      height: 500,
                    }}
                  >
                    {/* Main Card */}
                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', top: 0, left: '10%', width: '80%', zIndex: 2 }}
                    >
                      <Card
                        sx={{
                          background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
                          border: '2px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: 200,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AutoGraphIcon sx={{ fontSize: 80, color: 'white' }} />
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            Guion de Video Premium
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label="Comedia" size="small" />
                            <Chip label="60s" size="small" />
                            <Chip label="Video" size="small" />
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Box>
                              <Typography variant="caption" color="text.secondary">Visitas</Typography>
                              <Typography variant="h6" fontWeight={700}>1,697</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Likes</Typography>
                              <Typography variant="h6" fontWeight={700}>17</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">CTR</Typography>
                              <Typography variant="h6" fontWeight={700}>3%</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Secondary Cards */}
                    <motion.div
                      animate={{ y: [0, 15, 0], rotate: [-5, -5, -5] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', top: 100, left: 0, width: '40%', zIndex: 1 }}
                    >
                      <Card sx={{ p: 2, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <Typography variant="body2" fontWeight={600}>📊 Verificado</Typography>
                        <Typography variant="caption" color="text.secondary">Métricas reales</Typography>
                      </Card>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -15, 0], rotate: [5, 5, 5] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ position: 'absolute', top: 150, right: 0, width: '40%', zIndex: 1 }}
                    >
                      <Card sx={{ p: 2, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <Typography variant="body2" fontWeight={600}>💎 Premium</Typography>
                        <Typography variant="caption" color="text.secondary">Contenido de valor</Typography>
                      </Card>
                    </motion.div>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box textAlign="center">
                    <Typography variant="h2" fontWeight={800} className="gradient-text">
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h2" textAlign="center" gutterBottom className="gradient-text">
            ¿Por qué Hooks4Winners?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
            Resolvemos el problema del exceso de contenido basura y la falta de valor real.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ py: 12, background: 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.05) 100%)' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" textAlign="center" gutterBottom className="gradient-text">
              Ventajas Clave
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
              Contenido sectorizado, validado y con rendimiento probado.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Typography variant="h3" gutterBottom className="gradient-text">
              ¿Listo para empezar?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Únete al marketplace de contenido verificado más innovador.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                startIcon={<StorefrontIcon />}
                onClick={() => navigate('/marketplace')}
                sx={{ py: 2, px: 4, fontSize: '1.1rem' }}
              >
                Ver Marketplace
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/create')}
                sx={{ py: 2, px: 4, fontSize: '1.1rem', borderColor: 'rgba(99, 102, 241, 0.5)' }}
              >
                Crear mi primer NFT
              </Button>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;