// scripts/deployMockNFT.js

const hre = require('hardhat')

async function main () {
  // Compile your contracts
  await hre.run('compile')

  // Get the Contract Factory for MockNFT
  const MockNFT = await hre.ethers.getContractFactory('MockNFT')

  // Deploy MockNFT, passing the initial owner address to the constructor
  const initialOwner = '0xf17fc7200fa3265ff5e1d9c5d1d2f08cdafae8d9'
  const mockNFT = await MockNFT.deploy(initialOwner)

  await mockNFT.waitForDeployment()

  console.log('MockNFT deployed to:', await mockNFT.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
