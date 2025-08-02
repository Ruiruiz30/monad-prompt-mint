import hre from "hardhat";

const { ethers, run } = hre;

async function main() {
  console.log("Deploying PromptMint contract...");

  // Get the contract factory
  const PromptMint = await ethers.getContractFactory("PromptMint");

  // Deploy the contract
  const promptMint = await PromptMint.deploy();

  // Wait for deployment to complete
  await promptMint.waitForDeployment();

  const contractAddress = await promptMint.getAddress();
  console.log("PromptMint deployed to:", contractAddress);

  // Get deployment transaction details
  const deploymentTx = promptMint.deploymentTransaction();
  if (deploymentTx) {
    console.log("Deployment transaction hash:", deploymentTx.hash);
    console.log("Gas used:", deploymentTx.gasLimit.toString());
  }

  // Verify contract on explorer (if not on hardhat network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== BigInt(1337)) {
    console.log("Waiting for block confirmations...");
    await promptMint.deploymentTransaction()?.wait(5);
    
    console.log("Verifying contract on explorer...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log("Deployment completed successfully!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });