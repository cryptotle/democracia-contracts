const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { parseEther } = require("ethers/lib/utils");

const {
  democraciaFixture
} = require("./setup");


describe("Democracia Contract", function () {
  describe("Deployment", function () {
    it("Should be correct for all contracts initial parameters.", async function () {
      const {
        WEthContract,
        MpEthContract,
        DemocraciaContract,
        admin,
        alice
      } = await loadFixture(democraciaFixture);

      expect(await MpEthContract.totalSupply()).to.equal(ethers.utils.parseEther("40"));
      expect(await MpEthContract.totalAssets()).to.equal(ethers.utils.parseEther("40"));
      expect(await DemocraciaContract.totalSupply()).to.equal(0);
      expect(await DemocraciaContract.totalAssets()).to.equal(0);

      expect(await WEthContract.balanceOf(admin.address)).to.equal(ethers.utils.parseEther("90"));
      expect(await WEthContract.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("90"));
      expect(await MpEthContract.balanceOf(admin.address)).to.equal(ethers.utils.parseEther("20"));
      expect(await MpEthContract.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("20"));
    });
  });

  describe("Deposits", function () {
    it("Should allow depositETH and direct send eth transaction.", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        admin,
        alice
      } = await loadFixture(democraciaFixture);

      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal(0);
      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      )
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("1"));

      const tx = await alice.sendTransaction({
        to: DemocraciaContract.address,
        value: ethers.utils.parseEther("1")
      });

      // Wait for the transaction to be confirmed
      await tx.wait();
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.totalSupply()).to.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.totalAssets()).to.equal(ethers.utils.parseEther("2"));

      // mpeth increases value
      await MpEthContract.connect(admin).burn(ethers.utils.parseEther("1"));

      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      )
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal("2976190476190476190");
      expect(await DemocraciaContract.totalSupply()).to.equal(await DemocraciaContract.totalAssets());

      // mpeth increases value AGAIN
      await MpEthContract.connect(admin).burn(ethers.utils.parseEther("10"));

      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      )
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal("3719822812846068659");
      expect(await DemocraciaContract.totalSupply()).to.equal(await DemocraciaContract.totalAssets());
    });

    it("Deposit mpeth directly to the Democracia contract.", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        admin
      } = await loadFixture(democraciaFixture);

      expect(await DemocraciaContract.balanceOf(admin.address)).to.be.equal(0);
      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await DemocraciaContract.connect(admin).deposit(
        ethers.utils.parseEther("1"),
        admin.address
      );
      expect(await DemocraciaContract.balanceOf(admin.address)).to.be.equal(ethers.utils.parseEther("1"));

      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await DemocraciaContract.connect(admin).mint(
        ethers.utils.parseEther("1"),
        admin.address
      );
      expect(await DemocraciaContract.balanceOf(admin.address)).to.be.equal(ethers.utils.parseEther("2"));
    });

    it("Deposits from multiple users.", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        admin,
        alice
      } = await loadFixture(democraciaFixture);

      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      )

      const tx = await alice.sendTransaction({
        to: DemocraciaContract.address,
        value: ethers.utils.parseEther("1")
      });

      // Wait for the transaction to be confirmed
      await tx.wait();

      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await DemocraciaContract.connect(admin).deposit(
        ethers.utils.parseEther("1"),
        admin.address
      );

      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await DemocraciaContract.connect(admin).mint(
        ethers.utils.parseEther("1"),
        admin.address
      );

      expect(await DemocraciaContract.balanceOf(admin.address)).to.be.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.totalSupply()).to.equal(ethers.utils.parseEther("4"));
      expect(await DemocraciaContract.totalAssets()).to.equal(ethers.utils.parseEther("4"));
    });

    it("Deposits are available only during donation period", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        admin,
        alice
      } = await loadFixture(democraciaFixture);

      await time.increaseTo(await DemocraciaContract.stopDonationsTimestamp());

      await expect(
        DemocraciaContract.connect(alice).depositETH(
          alice.address,
          { value: ethers.utils.parseEther("1") }
        )
      ).to.be.revertedWithCustomError(DemocraciaContract, "DonationsNotAvailable");

      await expect(
        alice.sendTransaction({
          to: DemocraciaContract.address,
          value: ethers.utils.parseEther("1")
        })
      ).to.be.revertedWithCustomError(DemocraciaContract, "DonationsNotAvailable");

      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await expect(
        DemocraciaContract.connect(admin).deposit(
          ethers.utils.parseEther("1"),
          admin.address
        )
      ).to.be.revertedWithCustomError(DemocraciaContract, "DonationsNotAvailable");

      await MpEthContract.connect(admin).approve(DemocraciaContract.address, ethers.utils.parseEther("1"));
      await expect(
        DemocraciaContract.connect(admin).mint(
          ethers.utils.parseEther("1"),
          admin.address
        )
      ).to.be.revertedWithCustomError(DemocraciaContract, "DonationsNotAvailable");

      expect(await DemocraciaContract.balanceOf(admin.address)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await DemocraciaContract.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await DemocraciaContract.totalSupply()).to.equal(ethers.utils.parseEther("0"));
      expect(await DemocraciaContract.totalAssets()).to.equal(ethers.utils.parseEther("0"));
    });
  });

  describe("Withdraw with successful campaign 🏦.", function () {
    it("Sending funds to the trusted account not available during donations period.", async function () {
      const {
        DemocraciaContract,
        admin
      } = await loadFixture(democraciaFixture);

      await expect(
        DemocraciaContract.connect(admin).transferDonations(ethers.utils.parseEther("1"))
      ).to.be.revertedWithCustomError(DemocraciaContract, "DonationPeriodStillOpen");
    });

    it("Transferring assets to trusted account and stop any DDAO redemption.", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        admin,
        alice,
        trustedAccount
      } = await loadFixture(democraciaFixture);

      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      );

      const tx = await alice.sendTransaction({
        to: DemocraciaContract.address,
        value: ethers.utils.parseEther("1")
      });

      // Wait for the transaction to be confirmed
      await tx.wait();

      await time.increaseTo(await DemocraciaContract.stopDonationsTimestamp());

      expect(await DemocraciaContract.totalAssets()).to.be.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.totalSupply()).to.be.equal(ethers.utils.parseEther("2"));
      expect(await MpEthContract.balanceOf(trustedAccount.address)).to.be.equal(0);

      await expect(
        DemocraciaContract.connect(admin).transferDonations(ethers.utils.parseEther("2"))
      ).to.be.revertedWithCustomError(DemocraciaContract, "InvalidZeroAccount");

      await DemocraciaContract.connect(admin).updatePaymentsAccount(trustedAccount.address);
      await DemocraciaContract.connect(admin).transferDonations(ethers.utils.parseEther("2"));

      expect(await DemocraciaContract.totalAssets()).to.be.equal(0);
      expect(await DemocraciaContract.totalSupply()).to.be.equal(ethers.utils.parseEther("2"));
      expect(await MpEthContract.balanceOf(trustedAccount.address)).to.be.equal(ethers.utils.parseEther("2"));

      await time.increaseTo(await DemocraciaContract.returnDonationsTimestamp());
    });
  });

  describe("Withdraw with not-successful campaign ⚠️.", function () {
    it("Sending funds to the trusted account not available after return donations period.", async function () {
      const {
        DemocraciaContract,
        admin
      } = await loadFixture(democraciaFixture);

      await time.increaseTo(await DemocraciaContract.returnDonationsTimestamp());

      await expect(
        DemocraciaContract.connect(admin).transferDonations(ethers.utils.parseEther("1"))
      ).to.be.revertedWithCustomError(DemocraciaContract, "FundsWillBeReturnedToContributors");
    });

    it("Transferring assets back to contributors.", async function () {
      const {
        MpEthContract,
        DemocraciaContract,
        alice
      } = await loadFixture(democraciaFixture);

      await DemocraciaContract.connect(alice).depositETH(
        alice.address,
        { value: ethers.utils.parseEther("1") }
      );

      const tx = await alice.sendTransaction({
        to: DemocraciaContract.address,
        value: ethers.utils.parseEther("1")
      });

      // Wait for the transaction to be confirmed
      await tx.wait();

      await time.increaseTo(await DemocraciaContract.stopDonationsTimestamp());

      await expect(
        DemocraciaContract.connect(alice).withdraw(
          ethers.utils.parseEther("2"),
          alice.address,
          alice.address
        )
      ).to.be.revertedWithCustomError(DemocraciaContract, "WithdrawNotAvailable");

      expect(await DemocraciaContract.totalAssets()).to.be.equal(ethers.utils.parseEther("2"));
      expect(await DemocraciaContract.totalSupply()).to.be.equal(ethers.utils.parseEther("2"));
      const aliceCurrentBalance = await MpEthContract.balanceOf(alice.address);

      await time.increaseTo(await DemocraciaContract.returnDonationsTimestamp());

      await DemocraciaContract.connect(alice).withdraw(
        ethers.utils.parseEther("2"),
        alice.address,
        alice.address
      );

      expect(await DemocraciaContract.totalAssets()).to.be.equal(ethers.utils.parseEther("0"));
      expect(await DemocraciaContract.totalSupply()).to.be.equal(ethers.utils.parseEther("0"));
      expect(
        await MpEthContract.balanceOf(alice.address)
      ).to.be.equal(aliceCurrentBalance.add(ethers.utils.parseEther("2")));
    });
  });
});