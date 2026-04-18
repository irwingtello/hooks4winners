const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying contracts to Monad Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MON\n");

  // Deploy ContentNFT
  console.log("📦 Deploying ContentNFT...");
  const ContentNFT = await hre.ethers.getContractFactory("ContentNFT");
  const nft = await ContentNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ ContentNFT deployed to:", nftAddress);

  // Deploy NFTMarketplace
  console.log("\n📦 Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ NFTMarketplace deployed to:", marketplaceAddress);

  // Save addresses to file
  const addresses = {
    network: "monad-testnet",
    chainId: 10143,
    nftContract: nftAddress,
    marketplaceContract: marketplaceAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\n📝 Addresses saved to deployed-addresses.json");

  // Update backend .env file
  const envPath = path.join(__dirname, "../../backend/.env");
  let envContent = fs.readFileSync(envPath, "utf8");

  envContent = envContent.replace(
    /NFT_CONTRACT_ADDRESS=.*/,
    `NFT_CONTRACT_ADDRESS=${nftAddress}`
  );
  envContent = envContent.replace(
    /MARKETPLACE_CONTRACT_ADDRESS=.*/,
    `MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("📝 Backend .env updated with contract addresses");

  // Verify on block explorer (if supported)
  console.log("\n⏳ Waiting for block confirmations...");
  await nft.deploymentTransaction().wait(5);
  await marketplace.deploymentTransaction().wait(5);

  console.log("\n🎉 Deployment complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄 Contract Addresses:");
  console.log("   ContentNFT:", nftAddress);
  console.log("   NFTMarketplace:", marketplaceAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return {
    nftAddress,
    marketplaceAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });