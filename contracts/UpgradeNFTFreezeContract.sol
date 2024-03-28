// SPDX-License-Identifier: MIT
//Using Error Codes to save Gas during contract deployemnt

// E01: address cannot be the zero address.
// E02: Must transfer at least one NFT.

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title NFT Freeze Contract
 * @dev This contract is designed to facilitate the freezing of NFTs by transferring them
 * to this contract. It is upgradeable and leverages OpenZeppelin's
 * Ownable and Initializable contracts for ownership management and safe initialization.
 */
contract UpgradeNFTFreezeContract is
    Initializable,
    OwnableUpgradeable,
    IERC721Receiver
{
    address public nftAddress;
    // Modifier to ensure the address is not the zero address
    modifier nonZeroAddress(address _address) {
        require(_address != address(0), "E01");
        _;
    }
    /**
     * @dev Initializes the contract with addresses for the NFT contract and the staking
     * contract, along with the initial owner. This replaces the constructor for upgradeable
     * contracts and ensures the contract can only be initialized once.
     *
     * @param _nftAddress Address of the NFT contract.
     
     * @param _initialOwner Address to be set as the initial owner of the contract.
     */
    function initialize(
        address _nftAddress,
        address _initialOwner
    ) public initializer nonZeroAddress(_nftAddress) {
        __Ownable_init(_initialOwner);
        nftAddress = _nftAddress;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (newOwner).
     * Can only be called by the current owner.
     * Ownership can't be transferred to 0 address.
     */

    function transferOwnership(
        address newOwner
    ) public override onlyOwner nonZeroAddress(newOwner) {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Handles the receipt of an ERC721 token, making the contract a compliant receiver.
     * This is a standard requirement for safely receiving ERC721 tokens to prevent them from
     * being locked in contracts without support for handling them. It's called by the ERC721
     * contract during a safeTransferFrom operation.
     *
     * In this implementation, the function simply returns its own function selector, indicating
     * successful receipt. It does not use the incoming parameters, but they must be present to
     * match the IERC721Receiver interface.
     *
     * @return bytes4 Returns the function selector, confirming the contract's ability to receive ERC721 tokens.
     */
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev Emitted when a bulk transfer of NFTs has been successfully completed.
     * Indicates that all specified NFTs have been transferred from the caller's
     * address to the this contract's address.
     * @param sender The address of the caller who initiated the bulk transfer.
     * @param tokenCount The total number of NFT tokens successfully transferred in the bulk operation.
     */

    event BulkNFTFreezeCompleted(address indexed sender, uint256 tokenCount);
    /**
     * @dev Emitted when a bulk transfer of NFTs has been partially completed, indicating
     * that not all NFTs have been transferred. This can occur  if the tokenIds did not contain some NFTs.
     * @param sender The address of the caller who attempted the bulk transfer.
     * @param remainingCount The number of NFTs that remain with the sender after attempting
     * the bulk transfer. This indicates the number of NFTs that were not transferred.
     */
    event BulkNFTFreezeIncomplete(
        address indexed sender,
        uint256 remainingCount
    );

    /**
     * @dev Freezes a bulk of NFTs by transferring them from the caller to this contract.
     * Each NFT's ownership is tracked, allowing for a potential future unfreeze.
     * @param tokenIds An array of token IDs that the caller wishes to freeze in the contract.
     */
    function bulkNFTFreeze(uint256[] calldata tokenIds) external {
        uint256 tokensCount = tokenIds.length;
        require(tokensCount > 0, "E02"); // Ensure at least one NFT to freeze.

        IERC721 nftContract = IERC721(nftAddress);

        --tokensCount;
        while (true) {
            nftContract.safeTransferFrom(
                msg.sender,
                address(this),
                tokenIds[tokensCount]
            );
            if (tokensCount == 0) break;
            --tokensCount;
        }

        // Emitting events to acknowledge the freeze operation.
        uint256 remainingBalance = nftContract.balanceOf(msg.sender);
        if (remainingBalance == 0) {
            emit BulkNFTFreezeCompleted(msg.sender, tokensCount);
        } else {
            emit BulkNFTFreezeIncomplete(msg.sender, remainingBalance);
        }
    }
    /**
     * @dev Transfers a list of NFTs owned by this contract to a specified recipient.
     * This function is designed for controlled use and can only be invoked by the contract owner.
     *
     * @param recipient The address of the recipient to whom the NFTs will be transferred.
     * @param tokenIds An array of token IDs to be transferred to the recipient.
     */
    function transferNFTsToRecipient(
        address recipient,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        uint256 tokensCount = tokenIds.length;

        require(tokensCount > 0, "E02"); // Ensures there are NFTs to transfer.

        IERC721 nftContract = IERC721(nftAddress);

        --tokensCount;
        while (true) {
            nftContract.safeTransferFrom(
                address(this),
                recipient,
                tokenIds[tokensCount]
            );
            if (tokensCount == 0) break;
            --tokensCount;
        }
    }
}
