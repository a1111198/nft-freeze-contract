# NFT Freeze Contract

## Overview

The NFT Freeze Contract is a Solidity project designed to enable the freezing of NFTs by transferring them to a designated staking contract. It leverages OpenZeppelin's Ownable contract for ownership management, ensuring that only the owner can perform critical actions such as initiating NFT transfers.

This project is set up to be used with Hardhat, a popular Ethereum development environment for testing, deploying, and interacting with smart contracts.

## Prerequisites

- Node.js (version 12.0 or higher)
- npm (Node Package Manager)

## Setting Up

To set up the project locally, follow these steps:

1. **Clone the Repository**

   Clone the project repository by running:

   ```bash
   git clone git clone https://akabansal@bitbucket.org/gath3rio/nft-contract.git
   cd nft-contract
   ```

2. **Install Dependencies**

   Install the necessary npm packages by running:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory of your project, and add the following content:

   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/API_KEY
   DEPLOYMENT_ACCOUNT_PRIVATE_KEY=PRIVATE_KEY
   ```

   Make sure to replace the placeholders with your actual Sepolia RPC URL and private key.

   **Note:** It's important to add `.env` to your `.gitignore` file to prevent committing sensitive information.

## Compilation

Compile the smart contracts using Hardhat:

```bash
npx hardhat compile
```

This command compiles your Solidity contracts and generates the necessary artifacts for deployment and testing.

## Testing

Execute predefined tests to ensure the contract behaves as expected:

```bash
npx hardhat test
```

This project includes tests for core functionalities of the NFT Freeze Contract, such as ownership transfer and bulk NFT transfers.

## Deployment

Deploy the NFT Freeze Contract to the Sepolia testnet by running:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Ensure your `.env` file is properly configured with your Sepolia RPC URL and private key before deployment.

## Interacting with the Contract

After deployment, you can interact with the contract through Hardhat's console or by integrating it into a frontend application using ethers.js or web3.js.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.
/Adding
