# 🏆 Hooks4Winners - NFT Marketplace

<div align="center">

![Monad](https://img.shields.io/badge/Powered%20by-Monad%20Testnet-f59e0b?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Smart%20Contracts-Solidity-363636?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge)

**Marketplace de Contenido Verificado y Tokenizado en Monad Testnet**

[Ver Contratos en Explorer](#-contratos-desplegados) · [Reportar Bug](https://github.com/irwingtello/hooks4winners/issues) · [Solicitar Feature](https://github.com/irwingtello/hooks4winners/issues)

</div>

---

## 📖 Descripción

**Hooks4Winners** es un marketplace de NFTs enfocado en contenido verificado y especializado. Cada NFT representa contenido digital con métricas reales y comprobadas, permitiendo a creadores monetizar su trabajo y a compradores acceder a contenido de calidad probada.

### ¿Por qué Hooks4Winners?

- ✅ **Contenido Verificado**: Métricas reales de visitas, likes, CTR y conversiones
- ✅ **Sin Intermediarios**: Conexión directa entre creadores y compradores
- ✅ **Transparencia Total**: Datos verificables en blockchain
- ✅ **Monetización Real**: Los creadores pueden vender su contenido tokenizado
- ✅ **Privacidad Garantizada**: Metadatos almacenados en Fileverse para acceso privado post-compra
- ✅ **Colaboración en Tiempo Real**: Los compradores pueden colaborar con el contenido después de la adquisición

---

## 🚀 Características

| Característica               | Descripción                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| 🎨 **NFTs ERC721**           | Tokens estándar compatibles con cualquier wallet                        |
| 📊 **Métricas Verificadas**  | Visitas, likes, suscriptores, CTR y conversiones                        |
| 🏪 **Marketplace Integrado** | Compra y venta directa en la plataforma                                 |
| 💰 **Pagos en MON**          | Transacciones en la moneda nativa de Monad                              |
| 🔒 **Fileverse Storage**     | Metadatos privados con acceso post-compra y colaboración en tiempo real |
| 📖 **Human Readable**        | Contenido legible y editable directamente en Fileverse                  |
| 🌐 **Monad Explorer**        | Verificación de contratos y transacciones                               |

---

## 📁 Estructura del Proyecto

```
Monad/
├── 📂 contracts/              # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── ContentNFT.sol       # Contrato NFT ERC721
│   │   └── NFTMarketplace.sol   # Contrato Marketplace
│   ├── scripts/
│   │   ├── deploy.js            # Script de despliegue
│   │   └── mintFirstNFT.js      # Script para mintear NFT inicial
│   └── artifacts/               # Compilaciones
│
├── 📂 backend/                # API Server (Node.js + Express)
│   ├── routes/
│   │   ├── nftRoutes.js         # Rutas para NFTs
│   │   └── marketplaceRoutes.js # Rutas del marketplace
│   ├── services/
│   │   ├── pinataService.js     # Servicio IPFS/Pinata
│   │   └── blockchainService.js # Servicio de blockchain
│   └── abis/                    # ABIs de los contratos
│
└── 📂 frontend/               # React App (Material UI)
    └── src/
        ├── components/          # Componentes reutilizables
        ├── context/             # Web3 Context
        ├── pages/               # Páginas de la app
        └── abis/                # ABIs para frontend
```

---

## 🛠️ Instalación

### Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- MetaMask u otra wallet Web3
- MON en Monad Testnet (obtener del [faucet](https://faucet.monad.xyz))

### 1. Clonar el repositorio

```bash
git clone git@github.com:irwingtello/hooks4winners.git
cd hooks4winners
```

### 2. Instalar dependencias

```bash
# Contratos
cd contracts && npm install

# Backend
cd ../backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

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
REACT_APP_CONTENT_NFT_ADDRESS=0x662635F3C1332e1227a02E73970fA344D596B9A1
REACT_APP_MARKETPLACE_ADDRESS=0xAB56D16876BBb5cEeF8707ecfb1Da207A43c5e69
REACT_APP_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
```

### 4. Desplegar Contratos

```bash
cd contracts
npx hardhat run scripts/deploy.js --network monad
```

### 5. Iniciar la aplicación

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🔧 Configuración de Monad Testnet

Agrega Monad Testnet a MetaMask:

| Parámetro          | Valor                             |
| ------------------ | --------------------------------- |
| **Network Name**   | Monad Testnet                     |
| **RPC URL**        | https://testnet-rpc.monad.xyz     |
| **Chain ID**       | 10143 (0x279f)                    |
| **Symbol**         | MON                               |
| **Block Explorer** | https://testnet.monadexplorer.com |

---

## 📝 Contratos Desplegados

| Contrato           | Dirección                                    | Explorer                                                                                                |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **ContentNFT**     | `0x662635F3C1332e1227a02E73970fA344D596B9A1` | [Ver en Explorer](https://testnet.monadexplorer.com/address/0x662635F3C1332e1227a02E73970fA344D596B9A1) |
| **NFTMarketplace** | `0xAB56D16876BBb5cEeF8707ecfb1Da207A43c5e69` | [Ver en Explorer](https://testnet.monadexplorer.com/address/0xAB56D16876BBb5cEeF8707ecfb1Da207A43c5e69) |

---

## 🎮 Uso

### Conectar Wallet

1. Haz clic en "Conectar Wallet" en la barra de navegación
2. Acepta la conexión en MetaMask

### Crear NFT

1. Navega a "Crear NFT"
2. Completa la información del contenido:
   - Nombre y descripción
   - Métricas (visitas, likes, CTR, etc.)
   - Categoría y tipo de contenido
   - Imagen (opcional)
3. Confirma la transacción

### Comprar/Vender

- Los propietarios pueden poner sus NFTs en venta
- Los compradores pueden adquirir NFTs directamente con MON

---

## 🔒 Almacenamiento con Fileverse

**Fileverse** es la solución de almacenamiento de metadatos que garantiza privacidad y colaboración en tiempo real:

### ¿Por qué Fileverse?

| Beneficio                          | Descripción                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| 🔐 **Privacidad**                  | El contenido solo es accesible después de la compra del NFT  |
| 📖 **Human Readable**              | Contenido legible directamente, sin necesidad de decodificar |
| 🤝 **Colaboración en Tiempo Real** | Compradores y creadores pueden colaborar en el contenido     |
| 🔄 **Actualizaciones**             | El contenido puede ser actualizado por el propietario        |

### Flujo de Trabajo

1. **Creación**: El creador sube el contenido a Fileverse y obtiene una URL privada
2. **Mint**: Se crea el NFT con la URL de Fileverse como metadato
3. **Compra**: Al comprar el NFT, el nuevo propietario obtiene acceso al contenido
4. **Colaboración**: El propietario puede editar y colaborar en el contenido en tiempo real

### Ejemplo de URL Fileverse

```
https://fileverse.io/d/QmXxxx...xxx
```

---

## 🎨 Formato de Metadatos NFT

```json
{
	"name": "Guion de Video Premium",
	"description": "Guion verificado con alto rendimiento",
	"external_url": "https://ejemplo.com/contenido",
	"image": "ipfs://Qm...",
	"attributes": [
		{ "trait_type": "Género", "value": "Comedia" },
		{ "trait_type": "Tipo", "value": "Video" },
		{ "trait_type": "Plataforma", "value": "YouTube" },
		{ "trait_type": "Visitas", "value": 1697, "display_type": "number" },
		{ "trait_type": "Likes", "value": 17, "display_type": "number" },
		{ "trait_type": "CTR", "value": 3, "display_type": "boost_percentage" }
	]
}
```

---

## 🛣️ Roadmap

- [x] Smart Contracts (ContentNFT + NFTMarketplace)
- [x] Frontend React con Material UI
- [x] Backend API con Express
- [x] Integración con Monad Testnet
- [x] Monad Explorer links
- [ ] Sistema de ofertas/bids
- [ ] Royalties para creadores
- [ ] Colecciones de NFTs
- [ ] Gobernanza DAO

---

## 🔐 Seguridad

⚠️ **Importante:**

- Nunca compartas tu `PRIVATE_KEY`
- Usa variables de entorno para información sensible
- Los contratos están desplegados en testnet
- Verifica siempre las transacciones antes de firmar

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 👤 Autor

**Irwing Tello**

- GitHub: [@irwingtello](https://github.com/irwingtello)

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ para la comunidad de Monad**

[⬆ Volver arriba](#-hooks4winners---nft-marketplace)

</div>
