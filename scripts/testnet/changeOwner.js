// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  DEMOCRACIA_GOERLI_ADDRESS = "0x69e3a362ffD379cB56755B142c2290AFbE5A6Cc8";

  SAFE_GOERLI_WALLET = "0xeaCB53F1C1C8691fC5057724322e455b0f98C956"

  const Democracia = await ethers.getContractFactory("Democracia");
  const DemocraciaContract = await Democracia.attach(DEMOCRACIA_GOERLI_ADDRESS);
  const [ admin ] = await ethers.getSigners();

  console.log("Current Owner: ", await DemocraciaContract.owner());
  const request = await DemocraciaContract.connect(admin).transferOwnership(
    SAFE_GOERLI_WALLET
  );
  await request.wait();
  console.log("NEW Owner: ", await DemocraciaContract.owner());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
