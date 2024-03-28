// scripts/deploy-nftfreeze.js
const { ethers, upgrades } = require('hardhat')
async function main () {
  const NFTFreezeContract = await ethers.getContractFactory('NFTFreezeContract')
  const nftAddress = '0x45a15f0e1d32dda1183a04a84323995905acb1cd'
  const nftZeroAddress = '0x0000000000000000000000000000000000000000'

  const initialAddress = '0xf17fc7200fa3265ff5e1d9c5d1d2f08cdafae8d9'

  const nftFreezeContract = await upgrades.deployProxy(
    NFTFreezeContract,
    [nftAddress, initialAddress],
    { initializer: 'initialize' }
  )
  console.log(
    'NFTFreezeContract deployed to:',
    await nftFreezeContract.getAddress()
  )
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
  process.exit(1)
})
