// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  DEMOCRACIA_GOERLI_ADDRESS = "0xe21aAB0a5A55c3AA5754D7c3c88010188616b5D4";

  const Democracia = await ethers.getContractFactory("Democracia");
  const DemocraciaContract = await Democracia.attach(DEMOCRACIA_GOERLI_ADDRESS);
  const [ admin ] = await ethers.getSigners();

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
