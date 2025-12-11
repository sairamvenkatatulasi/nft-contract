const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", () => {
  let nft;
  let owner, addr1, addr2, addrs;

  beforeEach(async () => {
    const NftCollection = await ethers.getContractFactory("NftCollection");
    nft = await NftCollection.deploy();
    await nft.waitForDeployment();
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("Should set the correct name and symbol", async () => {
      expect(await nft.name()).to.equal("NFT Collection");
      expect(await nft.symbol()).to.equal("NFT");
    });

    it("Should have correct initial values", async () => {
      expect(await nft.totalSupply()).to.equal(0);
      expect(await nft.maxSupply()).to.equal(10000);
      expect(await nft.paused()).to.equal(false);
    });

    it("Should set owner to deployer", async () => {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", () => {
    it("Should mint a token", async () => {
      await nft.mint(addr1.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should emit Transfer event on mint", async () => {
      await expect(nft.mint(addr1.address, 1))
        .to.emit(nft, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 1);
    });

    it("Should not allow non-owner to mint", async () => {
      await expect(nft.connect(addr1).mint(addr2.address, 1)).to.be.revertedWith("Only owner");
    });

    it("Should not mint to zero address", async () => {
      await expect(nft.mint(ethers.ZeroAddress, 1)).to.be.revertedWith("Invalid address");
    });

    it("Should prevent double-minting", async () => {
      await nft.mint(addr1.address, 1);
      await expect(nft.mint(addr2.address, 1)).to.be.revertedWith("Token already exists");
    });

    it("Should enforce max supply", async () => {
      for (let i = 0; i < 10000; i++) {
        await nft.mint(addr1.address, i);
      }
      await expect(nft.mint(addr1.address, 10000)).to.be.revertedWith("Max supply reached");
    });
  });

  describe("Transfers", () => {
    beforeEach(async () => {
      await nft.mint(owner.address, 1);
      await nft.mint(addr1.address, 2);
    });

    it("Should transfer token from owner", async () => {
      await nft.transferFrom(owner.address, addr2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      expect(await nft.balanceOf(owner.address)).to.equal(0);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should emit Transfer event", async () => {
      await expect(nft.transferFrom(owner.address, addr2.address, 1))
        .to.emit(nft, "Transfer")
        .withArgs(owner.address, addr2.address, 1);
    });

    it("Should not transfer non-existent token", async () => {
      await expect(nft.transferFrom(owner.address, addr2.address, 999)).to.be.revertedWith("Token does not exist");
    });

    it("Should not transfer to zero address", async () => {
      await expect(nft.transferFrom(owner.address, ethers.ZeroAddress, 1)).to.be.revertedWith("Invalid to address");
    });
  });

  describe("Approvals", () => {
    beforeEach(async () => {
      await nft.mint(owner.address, 1);
      await nft.mint(addr1.address, 2);
    });

    it("Should approve address for token", async () => {
      await nft.approve(addr2.address, 1);
      expect(await nft.getApproved(1)).to.equal(addr2.address);
    });

    it("Should emit Approval event", async () => {
      await expect(nft.approve(addr2.address, 1))
        .to.emit(nft, "Approval")
        .withArgs(owner.address, addr2.address, 1);
    });

    it("Should allow approved address to transfer", async () => {
      await nft.approve(addr2.address, 1);
      await nft.connect(addr2).transferFrom(owner.address, addr2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should clear approval on transfer", async () => {
      await nft.approve(addr2.address, 1);
      await nft.transferFrom(owner.address, addr2.address, 1);
      expect(await nft.getApproved(1)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Operator Approvals", () => {
    beforeEach(async () => {
      await nft.mint(owner.address, 1);
      await nft.mint(owner.address, 2);
    });

    it("Should set approval for all", async () => {
      await nft.setApprovalForAll(addr1.address, true);
      expect(await nft.isApprovedForAll(owner.address, addr1.address)).to.equal(true);
    });

    it("Should emit ApprovalForAll event", async () => {
      await expect(nft.setApprovalForAll(addr1.address, true))
        .to.emit(nft, "ApprovalForAll")
        .withArgs(owner.address, addr1.address, true);
    });

    it("Should allow operator to transfer multiple tokens", async () => {
      await nft.setApprovalForAll(addr1.address, true);
      await nft.connect(addr1).transferFrom(owner.address, addr2.address, 1);
      await nft.connect(addr1).transferFrom(owner.address, addr2.address, 2);
      expect(await nft.balanceOf(owner.address)).to.equal(0);
      expect(await nft.balanceOf(addr2.address)).to.equal(2);
    });

    it("Should revoke operator approval", async () => {
      await nft.setApprovalForAll(addr1.address, true);
      await nft.setApprovalForAll(addr1.address, false);
      expect(await nft.isApprovedForAll(owner.address, addr1.address)).to.equal(false);
    });
  });

  describe("Burning", () => {
    beforeEach(async () => {
      await nft.mint(addr1.address, 1);
    });

    it("Should burn token", async () => {
      await nft.connect(addr1).burn(1);
      await expect(nft.ownerOf(1)).to.be.revertedWith("Token does not exist");
      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Should emit Transfer event on burn", async () => {
      await expect(nft.connect(addr1).burn(1))
        .to.emit(nft, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, 1);
    });

    it("Should not allow unauthorized burn", async () => {
      await expect(nft.connect(addr2).burn(1)).to.be.revertedWith("Not authorized");
    });
  });

  describe("Metadata", () => {
    beforeEach(async () => {
      await nft.mint(owner.address, 1);
    });

    it("Should return correct tokenURI", async () => {
      const uri = await nft.tokenURI(1);
      expect(uri).to.include("1");
    });

    it("Should set custom tokenURI", async () => {
      await nft.setTokenURI(1, "custom-uri");
      expect(await nft.tokenURI(1)).to.equal("custom-uri");
    });

    it("Should set base URI", async () => {
      await nft.setBaseURI("https://example.com/");
      const uri = await nft.tokenURI(1);
      expect(uri).to.include("https://example.com/");
    });
  });

  describe("Pause/Unpause", () => {
    it("Should pause minting", async () => {
      await nft.pauseMinting();
      expect(await nft.paused()).to.equal(true);
      await expect(nft.mint(addr1.address, 1)).to.be.revertedWith("Contract paused");
    });

    it("Should unpause minting", async () => {
      await nft.pauseMinting();
      await nft.unpauseMinting();
      expect(await nft.paused()).to.equal(false);
      await nft.mint(addr1.address, 1);
      expect(await nft.totalSupply()).to.equal(1);
    });
  });
});
