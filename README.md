# NFT Collection Smart Contract

An ERC-721 compatible NFT smart contract with comprehensive automated test suite and Docker containerization.

## Features

- **ERC-721 Compliance**: Full implementation of the ERC-721 standard for non-fungible tokens
- **Core Functionality**:
  - Token minting with authorization checks
  - Safe token transfers between addresses
  - Approval and operator management
  - Metadata support via tokenURI
  - Balance tracking per address
  - Ownership management

- **Business Rules**:
  - Maximum supply enforcement
  - Configurable tokenId ranges
  - Pause/unpause minting capability
  - Owner-based access control

- **Security**:
  - Input validation and parameter checks
  - Atomic state changes
  - Clear error handling with revert messages
  - Prevents re-entrancy issues

- **Testing**:
  - Comprehensive test suite covering all operations
  - Tests for edge cases and invalid scenarios
  - Event emission verification
  - Gas optimization checks

- **Docker Support**:
  - Complete containerized environment
  - Automated test execution
  - Reproducible builds

## Project Structure

```
nft-contract/
├── contracts/
│   └── NftCollection.sol       # Main ERC-721 contract
├── test/
│   └── NftCollection.test.js   # Comprehensive test suite
├── package.json                # Node.js dependencies
├── hardhat.config.js          # Hardhat configuration
├── Dockerfile                  # Docker containerization
├── .dockerignore               # Docker build optimization
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker (for containerized execution)

### Installation

```bash
# Clone the repository
git clone https://github.com/sairamvenkatatulasi/nft-contract.git
cd nft-contract

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run with coverage report
npx hardhat coverage

# Run specific test file
npx hardhat test test/NftCollection.test.js
```

## Docker Usage

### Building the Docker Image

```bash
docker build -t nft-contract .
```

### Running Tests in Docker

```bash
docker run nft-contract
```

The container will automatically compile the contract and run the complete test suite.

## Contract Details

### NftCollection Contract

The main smart contract that implements the ERC-721 standard with additional features:

#### State Variables
- `name`: Collection name
- `symbol`: Collection symbol
- `maxSupply`: Maximum number of tokens
- `totalSupply`: Current total minted tokens
- `owner`: Contract owner/admin
- `paused`: Minting pause flag

#### Key Functions

**Minting & Management**
- `mint(to, tokenId)`: Mint a new NFT
- `burn(tokenId)`: Burn an NFT
- `tokenURI(tokenId)`: Get metadata URI for a token

**Transfer & Approval**
- `transferFrom(from, to, tokenId)`: Transfer a token
- `safeTransferFrom(from, to, tokenId, data)`: Safe transfer with callback
- `approve(to, tokenId)`: Approve an address for a specific token
- `setApprovalForAll(operator, approved)`: Grant/revoke operator permissions

**Query Functions**
- `balanceOf(owner)`: Get balance of an address
- `ownerOf(tokenId)`: Get owner of a token
- `getApproved(tokenId)`: Get approved address for a token
- `isApprovedForAll(owner, operator)`: Check operator approval

**Admin Functions**
- `pauseMinting()`: Pause token minting
- `unpauseMinting()`: Resume token minting
- `setBaseURI(uri)`: Update base metadata URI

## Test Coverage

The test suite includes comprehensive coverage for:

1. **Basic Operations**
   - Minting and ownership
   - Token transfers
   - Balance tracking

2. **Approvals**
   - Single token approvals
   - Operator approvals
   - Revocation of approvals

3. **Metadata**
   - URI retrieval
   - Metadata consistency

4. **Security**
   - Unauthorized access prevention
   - Invalid token handling
   - Zero-address protection

5. **Edge Cases**
   - Maximum supply enforcement
   - Double-minting prevention
   - Re-entrance protection

6. **Events**
   - Transfer event emission
   - Approval event emission
   - ApprovalForAll event emission

## Gas Optimization

The contract is optimized for gas efficiency:
- Minimal storage operations
- Efficient data structures (mappings)
- Predictable complexity for common operations
- Optimized loops and conditionals

## Configuration

### Hardhat Configuration

The `hardhat.config.js` file configures:
- Solidity compiler version (0.8.0+)
- Network settings
- Gas reporters
- Test timeouts

### Environment Variables

Create a `.env` file if needed for network deployments:
```
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key_here
```

## Development

### Running Hardhat Node

```bash
npx hardhat node
```

This starts a local blockchain for development and testing.

### Compiling Contracts

```bash
npx hardhat compile
```

### Flattening Contract

```bash
npx hardhat flatten contracts/NftCollection.sol
```

## Common Issues

### Docker Build Fails
- Ensure Docker is installed and running
- Check available disk space
- Verify Node.js version compatibility

### Tests Fail
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Hardhat cache: `npx hardhat clean`
- Check Solidity compiler version in hardhat.config.js

### Gas Limit Issues
- Reduce test data size
- Optimize contract storage operations
- Check for infinite loops in contract logic

## Security Considerations

1. **Access Control**: Only the owner can perform admin operations
2. **Input Validation**: All addresses and values are validated
3. **State Atomicity**: All state changes are atomic
4. **Event Logging**: All significant actions are logged via events
5. **Reentrancy Protection**: No external calls in state-modifying functions

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please open an issue on GitHub.
