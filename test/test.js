const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe('NFTFreezeContract Initialization', function () {
  let NFTFreezeContract, owner, addr1, newOwner, anotherAccount, nftOwner
  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

  before(async function () {
    // Getting the ContractFactory and Signers
    NFTFreezeContract = await ethers.getContractFactory('NFTFreezeContract')
    ;[owner, addr1, newOwner, anotherAccount, nftOwner] =
      await ethers.getSigners()
  })

  describe('Initialization', function () {
    // Attempting to initialize with a zero NFT address should fail

    it("should revert with 'E01' when NFT address is zero", async function () {
      await expect(
        upgrades.deployProxy(NFTFreezeContract, [ADDRESS_ZERO, owner.address], {
          initializer: 'initialize'
        })
      ).to.be.revertedWith('E01')
    })

    // Deploying as an upgradeable contract and initializing it

    it('should successfully initialize with non-zero addresses and set initial owner', async function () {
      const contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [addr1.address, owner.address],
        { initializer: 'initialize' }
      )
      await contractInstance.waitForDeployment()

      // Verifying that the contract was initialized with the correct addresses
      expect(await contractInstance.nftAddress()).to.equal(addr1.address)

      // Verifying that the initial owner is set correctly
      expect(await contractInstance.owner()).to.equal(owner.address)
    })
    // Deploy and initialize the contract and check for Reinitit.

    it('should prevent re-initialization', async function () {
      const contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [addr1.address, owner.address],
        { initializer: 'initialize' }
      )
      await contractInstance.waitForDeployment()

      // Attempting to re-initialize the contract should fail
      await expect(contractInstance.initialize(addr1.address, owner.address)).to
        .be.reverted // Assuming your initialize function has a modifier or check to prevent re-initialization
    })
  })

  describe('Ownership Transfer', function () {
    this.beforeEach(async function () {
      // Deploying the contract instance for ownership transfer tests
      contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [addr1.address, owner.address],
        { initializer: 'initialize' }
      )
      await contractInstance.waitForDeployment()
    })

    it('should revert when trying to transfer ownership to the zero address', async function () {
      // Attempting to transfer ownership to the zero address should fail
      await expect(
        contractInstance.transferOwnership(ADDRESS_ZERO)
      ).to.be.revertedWith('E01')
    })

    it('should transfer ownership to a new account when called by the current owner', async function () {
      // Transferring ownership to newOwner

      await contractInstance.transferOwnership(newOwner.address)

      // Verifying that newOwner is now the owner
      expect(await contractInstance.owner()).to.equal(newOwner.address)
    })

    it('should revert if an unauthorized account attempts to transfer ownership', async function () {
      // Attempting to transfer ownership by an account that is not the current owner should fail

      await expect(
        contractInstance
          .connect(anotherAccount)
          .transferOwnership(anotherAccount.address)
      ).to.be.reverted // This assumes your contract uses OpenZeppelin's Ownable, which reverts without a specific error message for unauthorized access
    })
    it('should emit an OwnershipTransferred event on successful ownership transfer', async function () {
      // Listen for the OwnershipTransferred event
      await expect(contractInstance.transferOwnership(newOwner.address))
        .to.emit(contractInstance, 'OwnershipTransferred')
        .withArgs(owner.address, newOwner.address)
    })
  })

  describe('Upgrade process', function () {
    // Deploy the initial contract version and perform the upgrade in beforeEach to ensure a fresh environment for each test
    beforeEach(async function () {
      contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [addr1.address, owner.address],
        { initializer: 'initialize' }
      )
      await contractInstance.waitForDeployment()

      // Simulate state change in the original contract

      await contractInstance.transferOwnership(newOwner.address)
      expect(await contractInstance.owner()).to.equal(newOwner.address)

      // Upgrading to the new version of the contract
      let UpgradeNFTFreezeContract = await ethers.getContractFactory(
        'UpgradeNFTFreezeContract',
        owner // shows clearly that Proxy Admin and Ownable ownership are 2 different things
      )

      upgradeContractInstance = await upgrades.upgradeProxy(
        await contractInstance.getAddress(),
        UpgradeNFTFreezeContract
      )
      await upgradeContractInstance.waitForDeployment()
    })

    it('should retain the state after an upgrade', async function () {
      // Verifying that the state (ownership) is retained after the upgrade
      expect(await upgradeContractInstance.owner()).to.equal(newOwner.address)
    })
  })

  describe('Bulk Freeze Functionality', function () {
    let mockNFT, contractInstance

    before(async function () {
      // Deploy MockNFT and NFTFreezeContract
      const MockNFT = await ethers.getContractFactory('MockNFT')
      mockNFT = await MockNFT.deploy(nftOwner.address)
      await mockNFT.waitForDeployment()
      contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [await mockNFT.getAddress(), owner.address],
        { initializer: 'initialize' }
      )

      await contractInstance.waitForDeployment()

      // Setup: Mint NFTs to nftOwner and approve NFTFreezeContract to manage them
      await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '1')
      await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '2')
      await mockNFT
        .connect(nftOwner)
        .setApprovalForAll(await contractInstance.getAddress(), true)
    })

    describe('Require conditions', function () {
      it('should revert with E02 if tokenIds array is empty', async function () {
        // Assuming nftOwner is the owner of some NFTs and has approved the contract
        await expect(
          contractInstance.connect(nftOwner).bulkNFTFreeze([])
        ).to.be.revertedWith('E02')
      })

      it('should revert  if the caller does not own the NFT', async function () {
        // Assuming anotherAccount does not own any NFTs, but tries to transfer an NFT
        await mockNFT
          .connect(anotherAccount)
          .setApprovalForAll(await contractInstance.getAddress(), true)

        await expect(
          contractInstance.connect(anotherAccount).bulkNFTFreeze(['1']) // Assuming tokenId 1 exists but is owned by nftOwner
        ).to.be.reverted
        await mockNFT
          .connect(anotherAccount)
          .setApprovalForAll(await contractInstance.getAddress(), false)
      })
    })

    describe('Bulk Freeze Functionality', function () {
      it('should complete the transfer if all conditions are met', async function () {
        // Mint additional NFTs to nftOwner and approve the contract
        await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '3')
        // Perform the bulk transfer
        await expect(
          contractInstance.connect(nftOwner).bulkNFTFreeze(['1', '2', '3'])
        )
          .to.emit(contractInstance, 'BulkNFTFreezeCompleted')
          .withArgs(nftOwner.address, 3) // Assuming 3 NFTs are transferred successfully
        // Verify the NFTs have been transferred to the staking contract
        expect(await mockNFT.ownerOf('1')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('2')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('3')).to.equal(
          await contractInstance.getAddress()
        )
      })
      it('should handle incomplete transfers correctly', async function () {
        // Mint an NFT to another account to simulate an incomplete transfer scenario
        await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '4')
        await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '5')

        // Attempt to transfer NFTs, including one not owned by nftOwner
        await expect(contractInstance.connect(nftOwner).bulkNFTFreeze(['4'])) // NFT with ID 5 not owned by nftOwner
          .to.emit(contractInstance, 'BulkNFTFreezeIncomplete')
          .withArgs(nftOwner.address, 1) // Assuming 1 NFT remains due to ownership issue

        // Verify the owned NFTs were transferred but the one not requested not.
        expect(await mockNFT.ownerOf('1')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('2')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('3')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('4')).to.equal(
          await contractInstance.getAddress()
        )
        expect(await mockNFT.ownerOf('5')).to.equal(nftOwner.address)
      })
      it('should emit Transfer event on successful NFT transfer', async function () {
        // Assuming setup has already minted NFTs to nftOwner and approved contractInstance

        await expect(contractInstance.connect(nftOwner).bulkNFTFreeze(['5']))
          .to.emit(mockNFT, 'Transfer')
          .withArgs(nftOwner.address, await contractInstance.getAddress(), '5')
      })
    })
  })

  describe('transferNFTsToRecipient', function () {
    let mockNFT, contractInstance

    before(async function () {
      // Deploy MockNFT and NFTFreezeContract
      const MockNFT = await ethers.getContractFactory('MockNFT')
      mockNFT = await MockNFT.deploy(nftOwner.address)
      await mockNFT.waitForDeployment()
      contractInstance = await upgrades.deployProxy(
        NFTFreezeContract,
        [await mockNFT.getAddress(), owner.address],
        { initializer: 'initialize' }
      )

      await contractInstance.waitForDeployment()

      // Setup: Mint NFTs to nftOwner and approve NFTFreezeContract to manage them
      await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '1')
      await mockNFT.connect(nftOwner).safeMint(nftOwner.address, '2')
      await mockNFT
        .connect(nftOwner)
        .setApprovalForAll(await contractInstance.getAddress(), true)
    })

    describe('transferNFTsToRecipient', function () {
      it('should revert if the caller is not the owner', async function () {
        // Attempting to unlock NFTs by an account that is not the owner should fail
        await expect(
          contractInstance
            .connect(anotherAccount)
            .transferNFTsToRecipient(nftOwner.address, ['1'])
        ).to.be.reverted
      })

      it('should revert if the NFTs are not frozen', async function () {
        // Attempting to unlock NFTs that are not frozen should fail
        await expect(
          contractInstance
            .connect(owner)
            .transferNFTsToRecipient(nftOwner.address, [])
        ).to.be.revertedWith('E02')
      })

      it('should complete the unlock if all conditions are met', async function () {
        await expect(
          contractInstance.connect(nftOwner).bulkNFTFreeze(['1', '2'])
        )
          .to.emit(contractInstance, 'BulkNFTFreezeCompleted')
          .withArgs(nftOwner.address, 2)

        // Perform the bulk unlock
        await expect(
          contractInstance
            .connect(owner)
            .transferNFTsToRecipient(nftOwner.address, ['1'])
        )
          .to.emit(mockNFT, 'Transfer')
          .withArgs(await contractInstance.getAddress(), nftOwner.address, '1')

        // Assuming 2 NFTs are unlocked successfully
        // Verify the NFTs have been transferred to the staking contract
        expect(await mockNFT.ownerOf('1')).to.equal(nftOwner.address)
      })
    })
  })
})
