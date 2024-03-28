// scripts/upgrade-nftfreeze.js
const { ethers, upgrades } = require('hardhat')
async function main () {
  const UpgradeNFTFreezeContract = await ethers.getContractFactory(
    'UpgradeNFTFreezeContract'
  ) // Your updated contract
  const proxyAddress = '0x9d6193995012925e15869a6ab7a2032a70176cc9' // Address of the already deployed proxy
  const upgraded = await upgrades.upgradeProxy(
    proxyAddress,
    UpgradeNFTFreezeContract
  )
  console.log('NFTFreezeContract upgraded')
}
main().catch(error => {
  console.error(error)
  process.exit(1)
})
