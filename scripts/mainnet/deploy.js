// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  MPETH_MAINNET_ADDRESS = "0x48AFbBd342F64EF8a9Ab1C143719b63C2AD81710";

  /// Epoch timestamp: 1711940400
  /// Date and time (GMT): Monday, April 1, 2024 3:00:00 AM
  const _returnDonationsTimestamp = 1711940400;

  /// Receiving donations will be stopped.
  /// Epoch timestamp: 1703991600
  /// Date and time (GMT): Sunday, December 31, 2023 3:00:00 AM
  const _stopDonationsTimestamp = 1703991600;

  const Democracia = await ethers.getContractFactory("Democracia");
  const [ admin ] = await ethers.getSigners();

  console.log("Step 1. Deploying Democracia...")
  const DemocraciaContract = await Democracia.connect(admin).deploy(
    MPETH_MAINNET_ADDRESS,
    "Democracia DAO Token",
    "DDAO",
    _stopDonationsTimestamp,
    _returnDonationsTimestamp
  );
  await DemocraciaContract.deployed();
  console.log(" ...done in %s!", DemocraciaContract.address);

  console.log("Addresses of the deployed contracts:")
  console.log(" - mpETH Token:           %s", MPETH_MAINNET_ADDRESS);
  console.log(" - DemocraciaContract: %s", DemocraciaContract.address);
  console.log(" - Admin-deployer: %s", admin.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});