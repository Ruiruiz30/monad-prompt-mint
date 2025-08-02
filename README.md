# PromptMint

PromptMint is a Web3 application that allows users to generate AI images from text prompts and mint them as NFTs on Monad Testnet. The application combines AI image generation, IPFS storage, and smart contract functionality to provide a seamless experience from creative idea to NFT ownership.

## Features

- 🎨 **AI Image Generation**: Generate unique images from text prompts using Replicate API
- 🔗 **IPFS Storage**: Decentralized storage for images and metadata using Web3.Storage
- 🪙 **NFT Minting**: Mint generated images as ERC721 NFTs on Monad Testnet
- 🚫 **Duplicate Prevention**: Smart contract prevents duplicate prompts from being minted
- 💰 **Gas Optimized**: Efficient smart contract design with custom errors and optimizations
- 🔐 **Wallet Integration**: Connect with popular Web3 wallets using Wagmi

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Blockchain**: Solidity, Hardhat, OpenZeppelin
- **Web3 Integration**: Wagmi, Viem
- **AI**: Replicate API
- **Storage**: IPFS via Web3.Storage
- **Network**: Monad Testnet

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Monad Testnet MON tokens for minting

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-mint
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and configuration:
- `REPLICATE_API_TOKEN`: Your Replicate API token
- `WEB3_STORAGE_TOKEN`: Your Web3.Storage API token
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed contract address (see deployment section)

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Smart Contract Deployment

The PromptMint smart contract needs to be deployed to Monad Testnet before using the application.

### Quick Deployment

1. Get Monad Testnet tokens from the [faucet](https://testnet-faucet.monad.xyz)
2. Set your private key in `.env.local`:
```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
```
3. Deploy the contract:
```bash
npm run deploy:testnet
```
4. Update `.env.local` with the deployed contract address

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Contract Features

- **ERC721 Compliant**: Standard NFT functionality with URI storage
- **Duplicate Prevention**: Uses keccak256 hash of prompts to prevent duplicates
- **Gas Optimized**: Custom errors and efficient storage patterns
- **Reentrancy Protected**: Uses OpenZeppelin's ReentrancyGuard
- **Ownable**: Contract ownership for future upgrades

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Switch Network**: Ensure you're connected to Monad Testnet
3. **Enter Prompt**: Type a descriptive text prompt for image generation
4. **Generate Image**: Click "Generate" and wait for AI processing
5. **Mint NFT**: Once satisfied with the image, click "Mint" to create your NFT
6. **View Transaction**: Check your transaction on [Monad Explorer](https://testnet.monadexplorer.com)

## API Endpoints

- `POST /api/generate`: Generate AI image and upload to IPFS
  - Body: `{ prompt: string }`
  - Returns: `{ tokenURI: string, previewURL: string }`

## Smart Contract

The PromptMint contract is deployed on Monad Testnet with the following key functions:

- `mint(bytes32 promptHash, string tokenURI)`: Mint a new NFT
- `isPromptUsed(bytes32 promptHash)`: Check if a prompt has been used
- `tokenCounter()`: Get the current token counter
- `totalSupply()`: Get total number of minted tokens

## Testing

Run smart contract tests:
```bash
npm run test:contracts
```

Run frontend tests:
```bash
npm test
```

## Network Configuration

**Monad Testnet**
- RPC URL: https://testnet-rpc.monad.xyz
- Chain ID: 10143
- Currency: MON
- Explorer: https://testnet.monadexplorer.com
- Faucet: https://testnet-faucet.monad.xyz

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Check the [deployment guide](./DEPLOYMENT.md)
- Review the smart contract tests for usage examples
- Open an issue for bugs or feature requests

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Monad](https://monad.xyz/) for the high-performance blockchain
- [Replicate](https://replicate.com/) for AI image generation
- [Web3.Storage](https://web3.storage/) for decentralized storage
