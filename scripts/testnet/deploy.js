// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  MPETH_GOERLI_ADDRESS = "0x748c905130CC15b92B97084Fd1eEBc2d2419146f";

  // Epoch timestamp: 1694790000
  // Date and time (GMT): Friday, September 15, 2023 3:00:00 PM
  // Argentina time: Noon - September 15, 2023

  const _returnDonationsTimestamp = 1794790000; //// BAD-TIME

  const Democracia = await ethers.getContractFactory("Democracia");
  const [ admin ] = await ethers.getSigners();

  console.log("Step 1. Deploying Democracia...")
  const DemocraciaContract = await Democracia.connect(admin).deploy(
    MPETH_GOERLI_ADDRESS,
    "DemocraciaDAO Test Tokens",
    "DDAO",
    _returnDonationsTimestamp
  );
  await DemocraciaContract.deployed();
  console.log(" ...done in %s!", DemocraciaContract.address);

  console.log("Addresses of the deployed contracts:")
  console.log(" - mpETH Token:           %s", MPETH_GOERLI_ADDRESS);
  console.log(" - DemocraciaContract: %s", DemocraciaContract.address);
  console.log(" - Admin-deployer: %s", admin.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});