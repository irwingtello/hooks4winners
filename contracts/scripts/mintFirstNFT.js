const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎯 Minting first NFT with metadata...\n");

  // Get contract addresses from deployed-addresses.json
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  const ContentNFT = await hre.ethers.getContractFactory("ContentNFT");
  const nftContract = ContentNFT.attach(addresses.nftContract);

  // First NFT metadata (from user request)
  const nftData = {
    name: "Título del Guion",
    description: "Sinopsis corta del guion y elementos clave",
    externalUrl: "https://docs.fileverse.io/d/0200010e0035#k=T0qZz-N4ptwOjWT5t3rNVNZrh2PQtNRCJZco4csVEBE",
    image: "https://ejemplo.com/imagen-guion.jpg",
    genre: "Comedia",
    durationSeconds: 60,
    publicationDate: 1684145400,
    visits: 1697,
    likes: 17,
    subscribers: 2,
    clickRate: 3,
    conversions: 3,
    contentType: "Guion",
    platform: "Video"
  };

  console.log("📦 NFT Data:");
  console.log(`   Name: ${nftData.name}`);
  console.log(`   Description: ${nftData.description}`);
  console.log(`   Genre: ${nftData.genre}`);
  console.log(`   Content Type: ${nftData.contentType}`);
  console.log(`   Platform: ${nftData.platform}`);
  console.log(`   Visits: ${nftData.visits}`);
  console.log(`   Likes: ${nftData.likes}`);
  console.log("");

  // Mint the NFT
  console.log("⏳ Minting NFT...");
  
  const tx = await nftContract.mintNFT(
    nftData.name,
    nftData.description,
    nftData.externalUrl,
    nftData.image,
    nftData.genre,
    nftData.durationSeconds,
    nftData.publicationDate,
    nftData.visits,
    nftData.likes,
    nftData.subscribers,
    nftData.clickRate,
    nftData.conversions,
    nftData.contentType,
    nftData.platform
  );

  const receipt = await tx.wait();
  
  // Get the tokenId from the event
  const event = receipt.logs.find(log => {
    try {
      const parsed = nftContract.interface.parseLog(log);
      return parsed.name === "NFTMinted";
    } catch {
      return false;
    }
  });

  let tokenId = 0;
  if (event) {
    const parsed = nftContract.interface.parseLog(event);
    tokenId = parsed.args.tokenId;
  }

  console.log("✅ NFT Minted Successfully!");
  console.log(`   Token ID: ${tokenId}`);
  console.log(`   Transaction Hash: ${receipt.hash}`);
  console.log(`   Contract: ${addresses.ContentNFT}`);
  
  // Get metadata from the contract
  console.log("\n📊 Verifying stored metadata...");
  const metadata = await nftContract.getMetadata(tokenId);
  console.log(`   Creator: ${metadata.creator}`);
  console.log(`   Total Supply: ${await nftContract.totalSupply()}`);

  console.log("\n🎉 First NFT minted successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });