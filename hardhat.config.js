/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
      }
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      // accounts: ["35bd7b604364295b2c4c81d40a2c1b6fc80cc04e96abd2e3cec874b831314f3e"]
      accounts: ["398c3a9be9c74e8d92e8b7a4e2e1ea11e55aa152b6ba5dfb08113efc6831bf9a"]
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 999999
  },
  etherscan: {
    apiKey: "12IKYJ1C97KRAW3CAYA1ND334J8XUQKRRU"
  }
};
