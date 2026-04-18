const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class PinataService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.secretKey = process.env.PINATA_SECRET_KEY;
    this.jwt = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.jwt}`
    };
  }

  /**
   * Upload JSON metadata to Pinata
   */
  async uploadJSON(metadata) {
    try {
      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: this.getHeaders()
        }
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload file to Pinata
   */
  async uploadFile(filePath, name) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('pinataMetadata', JSON.stringify({ name }));

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders()
          }
        }
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading file to Pinata:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload image from buffer
   */
  async uploadImageBuffer(buffer, filename) {
    try {
      const formData = new FormData();
      formData.append('file', buffer, filename);
      formData.append('pinataMetadata', JSON.stringify({ name: filename }));

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders()
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading image buffer to Pinata:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create and upload NFT metadata
   */
  async createNFTMetadata(nftData) {
    const metadata = {
      name: nftData.name,
      description: nftData.description,
      external_url: nftData.externalUrl || '',
      image: nftData.image,
      attributes: [
        {
          trait_type: "Género",
          value: nftData.genre || "General"
        },
        {
          trait_type: "Duracion en Segundos",
          value: parseInt(nftData.durationSeconds) || 60,
          display_type: "number"
        },
        {
          trait_type: "Fecha Publicación",
          value: parseInt(nftData.publicationDate) || Math.floor(Date.now() / 1000),
          display_type: "date"
        },
        {
          trait_type: "Última Actualización",
          value: Math.floor(Date.now() / 1000),
          display_type: "date"
        },
        {
          trait_type: "Visitas",
          value: parseInt(nftData.visits) || 0,
          display_type: "number"
        },
        {
          trait_type: "Likes",
          value: parseInt(nftData.likes) || 0,
          display_type: "number"
        },
        {
          trait_type: "Suscriptores",
          value: parseInt(nftData.subscribers) || 0,
          display_type: "number"
        },
        {
          trait_type: "Tasa de Clics",
          value: parseFloat(nftData.clickRate) || 0,
          display_type: "boost_percentage"
        },
        {
          trait_type: "Conversiones",
          value: parseInt(nftData.conversions) || 0,
          display_type: "number"
        },
        {
          trait_type: "Tipo de Contenido",
          value: nftData.contentType || "Contenido"
        },
        {
          trait_type: "Plataforma",
          value: nftData.platform || "Video"
        }
      ]
    };

    return await this.uploadJSON(metadata);
  }

  /**
   * Get files from Pinata
   */
  async getFiles() {
    try {
      const response = await axios.get(
        `${this.baseURL}/data/pinList`,
        {
          headers: this.getHeaders()
        }
      );

      return response.data.rows;
    } catch (error) {
      console.error('Error getting files from Pinata:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Unpin file from Pinata
   */
  async unpin(ipfsHash) {
    try {
      await axios.delete(
        `${this.baseURL}/pinning/unpin/${ipfsHash}`,
        {
          headers: this.getHeaders()
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error unpinning file from Pinata:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new PinataService();