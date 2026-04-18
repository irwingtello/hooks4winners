# ContentNFT - Marketplace de Contenido Verificado

Marketplace de NFTs para contenido verificado y especializado en Monad Testnet.

## 🚀 Características

- **Contenido Verificado**: Cada NFT incluye métricas reales (visitas, likes, CTR, conversiones)
- **Monad Testnet**: Transacciones ultra rápidas con costos mínimos
- **Estándar ERC721**: NFTs compatibles con cualquier wallet
- **Marketplace Integrado**: Compra y venta de NFTs directamente en la plataforma
- **IPFS Storage**: Metadatos almacenados de forma descentralizada via Pinata

## 📁 Estructura del Proyecto

```
Monad/
├── contracts/          # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── ContentNFT.sol      # Contrato NFT ERC721
│   │   └── NFTMarketplace.sol  # Contrato Marketplace
│   └── scripts/
│       └── deploy.js           # Script de despliegue
│
├── backend/            # API Server (Node.js + Express)
│   ├── routes/
│   │   ├── nftRoutes.js
│   │   └── marketplaceRoutes.js
│   ├── services/
│   │   ├── pinataService.js
│   │   └── blockchainService.js
│   └── abis/
│       ├── ContentNFT.json
│       └── NFTMarketplace.json
│
└── frontend/           # React App (Material UI)
    └── src/
        ├── components/
        ├── context/
        └── pages/
```

## 🛠️ Instalación

### 1. Clonar y configurar el proyecto

```bash
# Instalar dependencias de contratos
cd contracts
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

#### Backend (`backend/.env`)

```env
PORT=5000
PRIVATE_KEY=tu_private_key_de_monad
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NFT_CONTRACT_ADDRESS=
MARKETPLACE_CONTRACT_ADDRESS=
PINATA_API_KEY=tu_pinata_api_key
PINATA_SECRET_KEY=tu_pinata_secret_key
JWT_SECRET=tu_jwt_secret
```

#### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Desplegar Contratos en Monad Testnet

```bash
cd contracts
npx hardhat run scripts/deploy.js --network monad
```

Copia las direcciones de los contratos desplegados al archivo `.env` del backend.

### 4. Iniciar los Servicios

```bash
# Iniciar Backend (puerto 5000)
cd backend
npm start

# En otra terminal, iniciar Frontend (puerto 3000)
cd frontend
npm start
```

## 🔧 Configuración de Monad Testnet

Agrega Monad Testnet a MetaMask:

- **Network Name**: Monad Testnet
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Chain ID**: 10143 (0x279f)
- **Symbol**: MON
- **Block Explorer**: https://testnet-explorer.monad.xyz/

## 📝 Uso

1. **Conectar Wallet**: Haz clic en "Conectar Wallet" en la barra de navegación
2. **Crear NFT**: Ve a "Crear NFT" y completa la información del contenido
3. **Ver Marketplace**: Explora NFTs disponibles para comprar
4. **Comprar/Vender**: Los propietarios pueden poner sus NFTs en venta

## 🎨 Formato de Metadatos NFT

```json
{
	"name": "Título del Contenido",
	"description": "Descripción del contenido",
	"external_url": "https://ejemplo.com/contenido",
	"image": "ipfs://...",
	"attributes": [
		{ "trait_type": "Género", "value": "Comedia" },
		{ "trait_type": "Visitas", "value": 1697, "display_type": "number" },
		{ "trait_type": "Likes", "value": 17, "display_type": "number" },
		{
			"trait_type": "Tasa de Clics",
			"value": 3,
			"display_type": "boost_percentage"
		}
	]
}
```

## 🔐 Seguridad

- Nunca compartas tu `PRIVATE_KEY`
- Usa variables de entorno para información sensible
- Los contratos están diseñados para testnet

## 👤 Autor

**hooksforwinners** - ContentNFT Marketplace

## 📜 Licencia

MIT License
