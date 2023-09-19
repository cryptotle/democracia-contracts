const { expect } = require("chai");
const { ethers } = require("hardhat");

async function democraciaFixture() {
  // Get the ContractFactory and Signers here.
  const Democracia = await ethers.getContractFactory("Democracia");
  const WEth = await ethers.getContractFactory("WrappedETH");
  const MpEth = await ethers.getContractFactory("MetaPoolETH");

  const [ admin, alice, trustedAccount ] = await ethers.getSigners();

  const WEthContract = await WEth.connect(admin).deploy();
  await WEthContract.deployed();

  // Convert eth to weth
  await WEthContract.connect(admin).deposit(
    admin.address,
    { value: ethers.utils.parseEther("100") }
  );

  await WEthContract.connect(alice).deposit(
    alice.address,
    { value: ethers.utils.parseEther("100") }
  );

  const MpEthContract = await MpEth.connect(admin).deploy(
    WEthContract.address
  );
  await MpEthContract.deployed();

  // 1st deposit in ETH
  await MpEthContract.connect(admin).depositETH(
    admin.address,
    { value: ethers.utils.parseEther("10") }
  );

  // 2nd deposit in wETH
  await WEthContract.connect(admin).approve(MpEthContract.address, ethers.utils.parseEther("10"));
  await MpEthContract.connect(admin).deposit(
    ethers.utils.parseEther("10"),
    admin.address
  )

  // 3st deposit in ETH
  await MpEthContract.connect(alice).depositETH(
    alice.address,
    { value: ethers.utils.parseEther("10") }
  );

  // 4nd deposit in wETH
  await WEthContract.connect(alice).approve(MpEthContract.address, ethers.utils.parseEther("10"));
  await MpEthContract.connect(alice).deposit(
    ethers.utils.parseEther("10"),
    alice.address
  );

  const now = await MpEthContract.tellMeTheTime();
  const stop = now.add(1 * 24 * 60 * 60);
  const retu = now.add(3 * 24 * 60 * 60);

  const DemocraciaContract = await Democracia.connect(admin).deploy(
    MpEthContract.address,
    "DemocraciaDAO Test Tokens",
    "DDAO",
    stop, // 1 day to receive donations
    retu  // 3 days to set campaign as successful
  );
  await DemocraciaContract.deployed();

  return {
    WEthContract,
    MpEthContract,
    DemocraciaContract,
    admin,
    alice,
    trustedAccount
  };
}

module.exports = {
  democraciaFixture
};