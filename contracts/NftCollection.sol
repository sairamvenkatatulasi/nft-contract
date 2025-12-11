// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NftCollection {
    string public name = "NFT Collection";
    string public symbol = "NFT";
    uint256 public maxSupply = 10000;
    uint256 public totalSupply = 0;
    address public owner;
    bool public paused = false;
    string public baseURI = "ipfs://";

    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public approvedAddresses;
    mapping(address => mapping(address => bool)) public operatorApprovals;
    mapping(uint256 => string) public tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(tokenOwner[tokenId] != address(0), "Token does not exist");
        return tokenOwner[tokenId];
    }

    function mint(address to, uint256 tokenId) public onlyOwner notPaused {
        require(to != address(0), "Invalid address");
        require(tokenOwner[tokenId] == address(0), "Token already exists");
        require(totalSupply < maxSupply, "Max supply reached");
        require(tokenId < maxSupply, "Invalid token ID");

        tokenOwner[tokenId] = to;
        balanceOf[to]++;
        totalSupply++;
        emit Transfer(address(0), to, tokenId);
    }

    function burn(uint256 tokenId) public {
        address owner_addr = tokenOwner[tokenId];
        require(owner_addr != address(0), "Token does not exist");
        require(msg.sender == owner_addr, "Not authorized");

        balanceOf[owner_addr]--;
        totalSupply--;
        delete tokenOwner[tokenId];
        delete approvedAddresses[tokenId];
        emit Transfer(owner_addr, address(0), tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address owner_addr = tokenOwner[tokenId];
        require(owner_addr != address(0), "Token does not exist");
        require(from == owner_addr, "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(
            msg.sender == owner_addr || msg.sender == approvedAddresses[tokenId] || operatorApprovals[owner_addr][msg.sender],
            "Not authorized"
        );

        balanceOf[from]--;
        balanceOf[to]++;
        tokenOwner[tokenId] = to;
        delete approvedAddresses[tokenId];
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public {
        address owner_addr = tokenOwner[tokenId];
        require(owner_addr != address(0), "Token does not exist");
        require(msg.sender == owner_addr || operatorApprovals[owner_addr][msg.sender], "Not authorized");
        approvedAddresses[tokenId] = to;
        emit Approval(owner_addr, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve yourself");
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(tokenOwner[tokenId] != address(0), "Token does not exist");
        return approvedAddresses[tokenId];
    }

    function isApprovedForAll(address owner_addr, address operator) public view returns (bool) {
        return operatorApprovals[owner_addr][operator];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(tokenOwner[tokenId] != address(0), "Token does not exist");
        if (bytes(tokenURIs[tokenId]).length > 0) {
            return tokenURIs[tokenId];
        }
        return string(abi.encodePacked(baseURI, toString(tokenId)));
    }

    function setBaseURI(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(tokenOwner[tokenId] != address(0), "Token does not exist");
        tokenURIs[tokenId] = uri;
    }

    function pauseMinting() public onlyOwner {
        paused = true;
    }

    function unpauseMinting() public onlyOwner {
        paused = false;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
