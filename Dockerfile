FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Compile contracts
RUN npx hardhat compile

# Run tests as default command
CMD ["npx", "hardhat", "test"]
