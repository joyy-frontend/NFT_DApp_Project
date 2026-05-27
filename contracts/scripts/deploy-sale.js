const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const deploymentsPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const mintAnimalTokenAddress = deployment.mintAnimalTokenAddress;

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deploying SaleAnimalToken with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Using MintAnimalToken:", mintAnimalTokenAddress);

  const SaleAnimalToken = await hre.ethers.getContractFactory("SaleAnimalToken");
  const saleAnimalToken = await SaleAnimalToken.deploy(mintAnimalTokenAddress);
  await saleAnimalToken.waitForDeployment();
  const saleAnimalTokenAddress = await saleAnimalToken.getAddress();
  console.log("SaleAnimalToken deployed:", saleAnimalTokenAddress);

  const MintAnimalToken = await hre.ethers.getContractFactory("MintAnimalToken");
  const mintAnimalToken = MintAnimalToken.attach(mintAnimalTokenAddress);
  const setSaleTx = await mintAnimalToken.setSaleAnimalToken(saleAnimalTokenAddress);
  await setSaleTx.wait();
  console.log("MintAnimalToken linked to new SaleAnimalToken.");

  const nextDeployment = {
    ...deployment,
    saleAnimalTokenAddress,
  };
  fs.writeFileSync(deploymentsPath, JSON.stringify(nextDeployment, null, 2));

  console.log("");
  console.log("Update frontend/.env:");
  console.log(`REACT_APP_SALE_ANIMAL_TOKEN_ADDRESS=${saleAnimalTokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
