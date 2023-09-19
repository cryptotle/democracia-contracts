// import { ethers } from "hardhat";
const { ethers, upgrades } = require("hardhat");

async function main() {

  DEMOCRACIA_MAINNET_ADDRESS = "0x69e3a362ffD379cB56755B142c2290AFbE5A6Cc8";

  SAFE_MAINNET_WALLET = "0x24c3Af57BDa2406614dc40151f888f97d6c534Bb"

  const Democracia = await ethers.getContractFactory("Democracia");
  const DemocraciaContract = await Democracia.attach(DEMOCRACIA_MAINNET_ADDRESS);
  const [ admin ] = await ethers.getSigners();

  console.log("Current Owner: ", await DemocraciaContract.owner());
  const request = await DemocraciaContract.connect(admin).transferOwnership(
    SAFE_MAINNET_WALLET
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
