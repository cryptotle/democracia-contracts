// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  DEMOCRACIA_MAINNET_ADDRESS = "0x69e3a362ffD379cB56755B142c2290AFbE5A6Cc8";

  const Democracia = await ethers.getContractFactory("Democracia");
  const DemocraciaContract = await Democracia.attach(DEMOCRACIA_MAINNET_ADDRESS);

  console.log("Owner          : ", await DemocraciaContract.owner());
  console.log("PaymentsAccount: ", await DemocraciaContract.paymentsAccount());
  console.log("Total Assets   : ", await DemocraciaContract.totalAssets());
  console.log("Total Shares   : ", await DemocraciaContract.totalSupply());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
