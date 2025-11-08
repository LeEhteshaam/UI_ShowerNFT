// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ShowerNFT - Proof of Lather
 * @dev NFT that proves you showered, valid for 24 hours
 * Part of the Groom Protocol - Because hygiene should be verifiable
 */
contract ShowerNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    // 24 hours in seconds
    uint256 public constant VALIDITY_PERIOD = 24 hours;
    
    // Events
    event ShowerVerified(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event NFTExpired(uint256 indexed tokenId, uint256 expiryTime);
    
    constructor() ERC721("Proof of Lather", "CLEAN") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }
    
    /**
     * @dev Mint a new Shower NFT
     * Anyone can mint for themselves
     * @param to Address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        mintTimestamp[tokenId] = block.timestamp;
        
        emit ShowerVerified(to, tokenId, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Check if an NFT is still valid (within 24 hours)
     * @param tokenId The token ID to check
     * @return bool True if the NFT is still valid
     */
    function isValid(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return block.timestamp <= mintTimestamp[tokenId] + VALIDITY_PERIOD;
    }
    
    /**
     * @dev Get time remaining until NFT expires (in seconds)
     * @param tokenId The token ID to check
     * @return uint256 Seconds remaining until expiry (0 if already expired)
     */
    function timeRemaining(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 expiryTime = mintTimestamp[tokenId] + VALIDITY_PERIOD;
        
        if (block.timestamp >= expiryTime) {
            return 0;
        }
        
        return expiryTime - block.timestamp;
    }
    
    /**
     * @dev Get the expiry timestamp for a token
     * @param tokenId The token ID to check
     * @return uint256 Unix timestamp when the NFT expires
     */
    function expiryTime(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return mintTimestamp[tokenId] + VALIDITY_PERIOD;
    }
    
    /**
     * @dev Override tokenURI to show expired status
     * In production, this would return proper JSON metadata
     * @param tokenId The token ID
     * @return string The token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        bool valid = isValid(tokenId);
        string memory status = valid ? "CLEAN" : "STINKY";
        
        // TODO: Replace with actual metadata server
        return string(abi.encodePacked("https://api.showernft.xyz/metadata/", status, "/", uint2str(tokenId)));
    }
    
    /**
     * @dev Get total supply of NFTs minted
     * @return uint256 Total number of NFTs ever minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
