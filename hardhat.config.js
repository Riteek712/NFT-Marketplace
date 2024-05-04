require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
const PRIVATE_KEY = "6c96d1da0bf690ba8824405e17b2e0b23f1b10f6e75de83be21b5c09c157916b"
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url:  "https://eth-sepolia.g.alchemy.com/v2/pTuCuemkINLjIARnhNgnpCq88nUSCGfk",
      accounts:  [`0x${PRIVATE_KEY}`]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};