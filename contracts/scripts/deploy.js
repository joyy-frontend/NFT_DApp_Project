const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const MintAnimalToken = await hre.ethers.getContractFactory("MintAnimalToken");
  const mintAnimalToken = await MintAnimalToken.deploy();
  await mintAnimalToken.waitForDeployment();
  const mintAnimalTokenAddress = await mintAnimalToken.getAddress();
  console.log("MintAnimalToken deployed:", mintAnimalTokenAddress);

  const SaleAnimalToken = await hre.ethers.getContractFactory("SaleAnimalToken");
  const saleAnimalToken = await SaleAnimalToken.deploy(mintAnimalTokenAddress);
  await saleAnimalToken.waitForDeployment();
  const saleAnimalTokenAddress = await saleAnimalToken.getAddress();
  console.log("SaleAnimalToken deployed:", saleAnimalTokenAddress);

  const setSaleTx = await mintAnimalToken.setSaleAnimalToken(saleAnimalTokenAddress);
  await setSaleTx.wait();
  console.log("MintAnimalToken linked to SaleAnimalToken.");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, "sepolia.json"),
    JSON.stringify(
      {
        network: "sepolia",
        mintAnimalTokenAddress,
        saleAnimalTokenAddress,
      },
      null,
      2
    )
  );

  console.log("");
  console.log("Add these to frontend/.env:");
  console.log(`REACT_APP_MINT_ANIMAL_TOKEN_ADDRESS=${mintAnimalTokenAddress}`);
  console.log(`REACT_APP_SALE_ANIMAL_TOKEN_ADDRESS=${saleAnimalTokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
