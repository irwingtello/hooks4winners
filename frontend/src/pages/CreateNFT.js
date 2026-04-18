import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';
import { ethers } from 'ethers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreateNFT = () => {
  const { account, contracts, signer } = useWeb3();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    externalUrl: '',
    genre: 'General',
    durationSeconds: 60,
    publicationDate: Math.floor(Date.now() / 1000),
    visits: 0,
    likes: 0,
    subscribers: 0,
    clickRate: 0,
    conversions: 0,
    contentType: 'Video',
    platform: 'Video',
  });

  const steps = ['Detalles del NFT', 'Métricas', 'Imagen', 'Crear'];

  const genres = ['General', 'Comedia', 'Drama', 'Terror', 'Acción', 'Documental', 'Educativo', 'Entretenimiento'];
  const contentTypes = ['Video', 'Audio', 'Texto', 'Imagen', 'Guion', 'Curso'];
  const platforms = ['Video', 'YouTube', 'TikTok', 'Instagram', 'Podcast', 'Blog'];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!account) {
      setError('Por favor conecta tu wallet primero');
      return;
    }

    if (!contracts.nft) {
      setError('Contrato NFT no disponible');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('nftData', JSON.stringify(nftData));

      const response = await axios.post(`${API_URL}/nft/create-full`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { imageUrl, txData, nftContract } = response.data.data;

      const tx = await signer.sendTransaction({
        to: nftContract,
        data: txData,
      });

      setTxHash(tx.hash);
      setSuccess('¡NFT creado exitosamente! La transacción está siendo procesada.');

      // Reset form
      setTimeout(() => {
        setActiveStep(0);
        setNftData({
          name: '',
          description: '',
          externalUrl: '',
          genre: 'General',
          durationSeconds: 60,
          publicationDate: Math.floor(Date.now() / 1000),
          visits: 0,
          likes: 0,
          subscribers: 0,
          clickRate: 0,
          conversions: 0,
          contentType: 'Video',
          platform: 'Video',
        });
        setImageFile(null);
        setImagePreview(null);
      }, 3000);
    } catch (err) {
      console.error('Error creating NFT:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear el NFT');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del NFT"
                name="name"
                value={nftData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: Guion de Video Premium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={nftData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                placeholder="Describe tu contenido..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Externa"
                name="externalUrl"
                value={nftData.externalUrl}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/contenido"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select name="genre" value={nftData.genre} label="Género" onChange={handleInputChange}>
                  {genres.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Contenido</InputLabel>
                <Select name="contentType" value={nftData.contentType} label="Tipo de Contenido" onChange={handleInputChange}>
                  {contentTypes.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Métricas del contenido (pueden actualizarse después)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Duración (segundos)"
                name="durationSeconds"
                type="number"
                value={nftData.durationSeconds}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Visitas"
                name="visits"
                type="number"
                value={nftData.visits}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Likes"
                name="likes"
                type="number"
                value={nftData.likes}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Suscriptores"
                name="subscribers"
                type="number"
                value={nftData.subscribers}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tasa de Clics (%)"
                name="clickRate"
                type="number"
                value={nftData.clickRate}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 100 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Conversiones"
                name="conversions"
                type="number"
                value={nftData.conversions}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Plataforma</InputLabel>
                <Select name="platform" value={nftData.platform} label="Plataforma" onChange={handleInputChange}>
                  {platforms.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Sube una imagen para tu NFT (opcional)
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'rgba(99, 102, 241, 0.3)',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12 }}
                  />
                  <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                    <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Imagen lista para subir
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra y suelta una imagen'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    o haz clic para seleccionar (JPG, PNG, GIF, WEBP - máx 50MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen del NFT
            </Typography>
            <Card sx={{ p: 3, mb: 3, background: 'rgba(99, 102, 241, 0.05)' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                  <Typography variant="body1" fontWeight={600}>{nftData.name || 'Sin nombre'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                  <Typography variant="body2">{nftData.description || 'Sin descripción'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Género</Typography>
                  <Chip label={nftData.genre} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                  <Chip label={nftData.contentType} size="small" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Métricas</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2">👁 {nftData.visits} visitas</Typography>
                    <Typography variant="body2">❤️ {nftData.likes} likes</Typography>
                    <Typography variant="body2">👥 {nftData.subscribers} suscriptores</Typography>
                    <Typography variant="body2">📊 {nftData.clickRate}% CTR</Typography>
                  </Stack>
                </Grid>
                {imagePreview && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Imagen</Typography>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: 100, borderRadius: 8, mt: 1 }} />
                  </Grid>
                )}
              </Grid>
            </Card>
            <Alert severity="info">
              Al crear este NFT, estás tokenizando tu contenido verificado en Monad Testnet.
            </Alert>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={800} className="gradient-text" gutterBottom>
            Crear NFT
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tokeniza tu contenido verificado con métricas reales
          </Typography>
        </Box>

        {!account && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Por favor conecta tu wallet para crear un NFT
          </Alert>
        )}

        <Card sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
              {txHash && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </Typography>
              )}
            </Alert>
          )}

          <Box sx={{ minHeight: 300 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Atrás
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!account || loading || !nftData.name}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {loading ? 'Creando...' : 'Crear NFT'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && !nftData.name}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default CreateNFT;