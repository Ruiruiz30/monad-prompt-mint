import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("Testing deployment configuration...");

  // Check network configuration
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Check if we have a signer (would be from private key in real deployment)
  try {
    const signers = await ethers.getSigners();
    if (signers.length === 0) {
      console.log("❌ No signers available. Make sure PRIVATE_KEY is set in .env.local");
      return;
    }
    
    const deployer = signers[0];
    console.log("Deployer address:", await deployer.getAddress());
    
    // Check balance (would be MON tokens on testnet)
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === BigInt(0)) {
      console.log("⚠️  Deployer has zero balance. Make sure to fund the account with testnet MON tokens.");
    }

  } catch (error) {
    console.log("❌ Error getting signer:", error instanceof Error ? error.message : String(error));
    console.log("Make sure PRIVATE_KEY is set correctly in .env.local");
    return;
  }

  // Test contract compilation
  try {
    const PromptMint = await ethers.getContractFactory("PromptMint");
    console.log("✅ Contract factory created successfully");
    console.log("Contract bytecode length:", PromptMint.bytecode.length);
  } catch (error) {
    console.log("❌ Error creating contract factory:", error instanceof Error ? error.message : String(error));
    return;
  }

  console.log("\n🎉 Deployment configuration test completed!");
  console.log("\nTo deploy to Monad Testnet:");
  console.log("1. Make sure you have testnet MON tokens");
  console.log("2. Set PRIVATE_KEY in .env.local");
  console.log("3. Run: npm run deploy:testnet");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });