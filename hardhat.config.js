require('@openzeppelin/hardhat-upgrades')
require('@nomicfoundation/hardhat-ethers')
require('@nomicfoundation/hardhat-verify')
require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const {
  API_URL,
  PRIVATE_KEY,
  PRIVATE_KEY2,
  MAINNET_FORK_API_URL,
  MAINNET_FORK_ACC_0,
  API_URL_HOLESKY
} = process.env

module.exports = {
  solidity: '0.8.24',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      // forking: {
      //   url: 'https://mainnet.infura.io/v3/769edce84fc04006b7383bc1ccefc813',
      //   blockNumber: 13134300
      // },
      // blockGasLimit: 12000000
    }
    // sepolia: {
    //   url: API_URL,
    //   accounts: [`0x${PRIVATE_KEY2}`]
    // },
    // holesky: {
    //   url: API_URL_HOLESKY,
    //   accounts: [`0x${PRIVATE_KEY2}`]
    // },
    // sepolia1: {
    //   url: API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`]
    // }
  },
  etherscan: {
    apiKey: {
      sepolia: 'T8VK6FI1ADA2XP5UXNBZ9WDNWMQF7F73MG'
    },
    apiKey: {
      holesky: 'T8VK6FI1ADA2XP5UXNBZ9WDNWMQF7F73MG'
    }
  }
}
