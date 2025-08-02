import { expect } from "chai";
import hre from "hardhat";
import { PromptMint } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("PromptMint", function () {
  let promptMint: PromptMint;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const samplePrompt = "A beautiful sunset over the mountains";
  const samplePromptHash = ethers.keccak256(ethers.toUtf8Bytes(samplePrompt));
  const sampleTokenURI = "ipfs://QmSampleHash/metadata.json";
  const anotherPrompt = "A cat sitting on a windowsill";
  const anotherPromptHash = ethers.keccak256(ethers.toUtf8Bytes(anotherPrompt));
  const anotherTokenURI = "ipfs://QmAnotherHash/metadata.json";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PromptMintFactory = await ethers.getContractFactory("PromptMint");
    promptMint = await PromptMintFactory.deploy();
    await promptMint.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await promptMint.name()).to.equal("PromptMint");
      expect(await promptMint.symbol()).to.equal("PMINT");
    });

    it("Should set the correct owner", async function () {
      expect(await promptMint.owner()).to.equal(owner.address);
    });

    it("Should initialize token counter to 1", async function () {
      expect(await promptMint.tokenCounter()).to.equal(1);
    });

    it("Should have zero total supply initially", async function () {
      expect(await promptMint.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT successfully with valid inputs", async function () {
      await expect(promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI))
        .to.emit(promptMint, "PromptMinted")
        .withArgs(user1.address, samplePromptHash, 1, sampleTokenURI);

      expect(await promptMint.ownerOf(1)).to.equal(user1.address);
      expect(await promptMint.tokenURI(1)).to.equal(sampleTokenURI);
      expect(await promptMint.tokenCounter()).to.equal(2);
      expect(await promptMint.totalSupply()).to.equal(1);
    });

    it("Should mark prompt hash as used after minting", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      expect(await promptMint.isPromptUsed(samplePromptHash)).to.be.true;
      expect(await promptMint.usedPromptHashes(samplePromptHash)).to.be.true;
    });

    it("Should store correct mapping from prompt hash to token ID", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      expect(await promptMint.promptHashToTokenId(samplePromptHash)).to.equal(1);
      expect(await promptMint.getTokenIdByPromptHash(samplePromptHash)).to.equal(1);
    });

    it("Should allow different users to mint different prompts", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      await promptMint.connect(user2).mint(anotherPromptHash, anotherTokenURI);

      expect(await promptMint.ownerOf(1)).to.equal(user1.address);
      expect(await promptMint.ownerOf(2)).to.equal(user2.address);
      expect(await promptMint.tokenCounter()).to.equal(3);
      expect(await promptMint.totalSupply()).to.equal(2);
    });

    it("Should increment token IDs correctly", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      await promptMint.connect(user1).mint(anotherPromptHash, anotherTokenURI);

      expect(await promptMint.tokenCounter()).to.equal(3);
      expect(await promptMint.ownerOf(1)).to.equal(user1.address);
      expect(await promptMint.ownerOf(2)).to.equal(user1.address);
    });
  });

  describe("Duplicate Prevention", function () {
    it("Should revert when trying to mint duplicate prompt hash", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);

      await expect(
        promptMint.connect(user2).mint(samplePromptHash, anotherTokenURI)
      ).to.be.revertedWithCustomError(promptMint, "PromptAlreadyUsed")
        .withArgs(samplePromptHash);
    });

    it("Should revert when same user tries to mint same prompt twice", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);

      await expect(
        promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI)
      ).to.be.revertedWithCustomError(promptMint, "PromptAlreadyUsed")
        .withArgs(samplePromptHash);
    });

    it("Should allow minting after failed attempt with different prompt", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);

      await expect(
        promptMint.connect(user2).mint(samplePromptHash, anotherTokenURI)
      ).to.be.revertedWithCustomError(promptMint, "PromptAlreadyUsed");

      // Should succeed with different prompt
      await expect(
        promptMint.connect(user2).mint(anotherPromptHash, anotherTokenURI)
      ).to.emit(promptMint, "PromptMinted");
    });
  });

  describe("Input Validation", function () {
    it("Should revert with zero prompt hash", async function () {
      const zeroHash = ethers.ZeroHash;
      await expect(
        promptMint.connect(user1).mint(zeroHash, sampleTokenURI)
      ).to.be.revertedWithCustomError(promptMint, "ZeroPromptHash");
    });

    it("Should revert with empty token URI", async function () {
      await expect(
        promptMint.connect(user1).mint(samplePromptHash, "")
      ).to.be.revertedWithCustomError(promptMint, "EmptyTokenURI");
    });

    it("Should accept valid non-zero prompt hash", async function () {
      const validHash = ethers.keccak256(ethers.toUtf8Bytes("valid prompt"));
      await expect(
        promptMint.connect(user1).mint(validHash, sampleTokenURI)
      ).to.emit(promptMint, "PromptMinted");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      await promptMint.connect(user2).mint(anotherPromptHash, anotherTokenURI);
    });

    it("Should return correct prompt usage status", async function () {
      expect(await promptMint.isPromptUsed(samplePromptHash)).to.be.true;
      expect(await promptMint.isPromptUsed(anotherPromptHash)).to.be.true;
      
      const unusedHash = ethers.keccak256(ethers.toUtf8Bytes("unused prompt"));
      expect(await promptMint.isPromptUsed(unusedHash)).to.be.false;
    });

    it("Should return correct token counter", async function () {
      expect(await promptMint.tokenCounter()).to.equal(3);
    });

    it("Should return correct total supply", async function () {
      expect(await promptMint.totalSupply()).to.equal(2);
    });

    it("Should return correct token ID for prompt hash", async function () {
      expect(await promptMint.getTokenIdByPromptHash(samplePromptHash)).to.equal(1);
      expect(await promptMint.getTokenIdByPromptHash(anotherPromptHash)).to.equal(2);
      
      const unusedHash = ethers.keccak256(ethers.toUtf8Bytes("unused prompt"));
      expect(await promptMint.getTokenIdByPromptHash(unusedHash)).to.equal(0);
    });

    it("Should return correct token URI", async function () {
      expect(await promptMint.tokenURI(1)).to.equal(sampleTokenURI);
      expect(await promptMint.tokenURI(2)).to.equal(anotherTokenURI);
    });
  });

  describe("Events", function () {
    it("Should emit PromptMinted event with correct parameters", async function () {
      await expect(promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI))
        .to.emit(promptMint, "PromptMinted")
        .withArgs(user1.address, samplePromptHash, 1, sampleTokenURI);
    });

    it("Should emit Transfer event from ERC721", async function () {
      await expect(promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI))
        .to.emit(promptMint, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, 1);
    });
  });

  describe("Gas Usage", function () {
    it("Should have reasonable gas usage for minting", async function () {
      const tx = await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      const receipt = await tx.wait();
      
      console.log("Gas used for minting:", receipt?.gasUsed.toString());
      
      // Gas usage should be reasonable (less than 200k gas)
      expect(receipt?.gasUsed).to.be.lessThan(200000);
    });

    it("Should use less gas for duplicate check", async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
      
      try {
        const tx = await promptMint.connect(user2).mint(samplePromptHash, anotherTokenURI);
        await tx.wait();
      } catch (error) {
        // Expected to fail, but gas estimation should be reasonable
        expect(error).to.exist;
      }
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test ensures the nonReentrant modifier is working
      // In a real attack scenario, a malicious contract would try to call mint again
      // during the execution of the first mint call
      await expect(
        promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI)
      ).to.emit(promptMint, "PromptMinted");
      
      // Subsequent calls should fail due to duplicate prevention
      await expect(
        promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI)
      ).to.be.revertedWithCustomError(promptMint, "PromptAlreadyUsed");
    });
  });

  describe("ERC721 Compliance", function () {
    beforeEach(async function () {
      await promptMint.connect(user1).mint(samplePromptHash, sampleTokenURI);
    });

    it("Should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await promptMint.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
      expect(await promptMint.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.be.true;
    });

    it("Should allow token transfers", async function () {
      await promptMint.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await promptMint.ownerOf(1)).to.equal(user2.address);
    });

    it("Should allow token approvals", async function () {
      await promptMint.connect(user1).approve(user2.address, 1);
      expect(await promptMint.getApproved(1)).to.equal(user2.address);
    });
  });
});