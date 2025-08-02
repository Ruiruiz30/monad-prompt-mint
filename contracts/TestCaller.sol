// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PromptMint.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title TestCaller
 * @dev Simple contract to test interactions with PromptMint from other contracts
 */
contract TestCaller is IERC721Receiver {
    function mintFromContract(
        address promptMintAddress,
        bytes32 promptHash,
        string memory tokenURI
    ) external {
        PromptMint promptMint = PromptMint(promptMintAddress);
        promptMint.mint(promptHash, tokenURI);
    }
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}