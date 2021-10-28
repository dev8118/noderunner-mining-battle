require('dotenv').config();

const Battle = artifacts.require("Battle");
const NDR_ABI = require('../abis/Ndr_abi.json');
const UNISWAP_ABI = require('../abis/Uniswap_abi.json');
const LPSTAKING_ABI = require('../abis/LpStaking_abi.json');
const NFT_ABI = require('../abis/Nft_abi.json');
const { web3, assert } = require('hardhat');

// Traditional Truffle test
contract("Battle", accounts => {
  const UNI_SWAP_V2_ROUTER02 = process.env.UNI_SWAP_V2_ROUTER02;
  const WETHAddress = process.env.WETH_ADDRESS;
  const NDRAddress = process.env.NDR_ADDRESS;
  const NFTAddress = process.env.NFT_ADDRESS;
  const LP_STAKING_ADDRESS = process.env.LP_STAKING_ADDRESS;

  let lpContract;
  let nftContract;
  let ndr;
  let uniswap;
  let battle;

  before(async function () {
    battle = await Battle.new(NDRAddress, NFTAddress);
    lpContract = new web3.eth.Contract(LPSTAKING_ABI, LP_STAKING_ADDRESS);
    nftContract = new web3.eth.Contract(NFT_ABI, NFTAddress);
    ndr = new web3.eth.Contract(NDR_ABI, NDRAddress);
    uniswap = new web3.eth.Contract(UNISWAP_ABI, UNI_SWAP_V2_ROUTER02);
  });

  it("Start a battle", async function() {
    await battle.startBattle({from: accounts[0]});
    let startTime = await battle.startTime();
    assert.notEqual(startTime, 0);
  });

  it("Select teamId. (account1, account2 select team 1 and account3, account4 select team 2)", async function() {
    await battle.selectTeam(1, {from: accounts[1]});
    await battle.selectTeam(1, {from: accounts[2]});
    await battle.selectTeam(2, {from: accounts[3]});
    await battle.selectTeam(2, {from: accounts[4]});
    let teamIdAccount1 = await battle.teamIdPerUser(accounts[1]);
    let teamIdAccount2 = await battle.teamIdPerUser(accounts[2]);
    let teamIdAccount3 = await battle.teamIdPerUser(accounts[3]);
    let teamIdAccount4 = await battle.teamIdPerUser(accounts[4]);
    assert.equal(teamIdAccount1, 1);
    assert.equal(teamIdAccount2, 1);
    assert.equal(teamIdAccount3, 2);
    assert.equal(teamIdAccount4, 2);
  });

  it("Buy NDR token on Uniswap", async function() {
    let amountBuyNDR = web3.utils.toBN(100 * 10 ** 18);
    let amountETH = web3.utils.toBN(30 * 10 ** 18);
    await uniswap.methods.swapETHForExactTokens(amountBuyNDR.toString(), [WETHAddress, NDRAddress], accounts[1], '9600952122').send({from:accounts[1], value:amountBuyNDR.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await uniswap.methods.swapETHForExactTokens(amountBuyNDR.toString(), [WETHAddress, NDRAddress], accounts[2], '9600952122').send({from:accounts[2], value:amountBuyNDR.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await uniswap.methods.swapETHForExactTokens(amountBuyNDR.toString(), [WETHAddress, NDRAddress], accounts[3], '9600952122').send({from:accounts[3], value:amountBuyNDR.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await uniswap.methods.swapETHForExactTokens(amountBuyNDR.toString(), [WETHAddress, NDRAddress], accounts[4], '9600952122').send({from:accounts[4], value:amountBuyNDR.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    let balance1 = await ndr.methods.balanceOf(accounts[1]).call();
    let balance2 = await ndr.methods.balanceOf(accounts[2]).call();
    let balance3 = await ndr.methods.balanceOf(accounts[3]).call();
    let balance4 = await ndr.methods.balanceOf(accounts[4]).call();

    assert.equal(balance1.toString(), amountBuyNDR.toString());
    assert.equal(balance2.toString(), amountBuyNDR.toString());
    assert.equal(balance3.toString(), amountBuyNDR.toString());
    assert.equal(balance4.toString(), amountBuyNDR.toString());
  });

  it("Approve NDR tokens to the battle contract", async function() {
    let approveAmount = web3.utils.toBN(100 * 10 ** 18);
    await ndr.methods.approve(battle.address, approveAmount.toString()).send({from:accounts[1], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await ndr.methods.approve(battle.address, approveAmount.toString()).send({from:accounts[2], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await ndr.methods.approve(battle.address, approveAmount.toString()).send({from:accounts[3], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await ndr.methods.approve(battle.address, approveAmount.toString()).send({from:accounts[4], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  });

  it("Stake NDR tokens to the battle contract", async function() {
    let stakeAmount_1 = web3.utils.toBN(5 * 10 ** 18);
    let stakeAmount_2 = web3.utils.toBN(5 * 10 ** 18);
    let stakeAmount_3 = web3.utils.toBN(5 * 10 ** 18);
    let stakeAmount_4 = web3.utils.toBN(5 * 10 ** 18);

    await battle.stakeNDR(stakeAmount_1, {from : accounts[1]});
    await battle.stakeNDR(stakeAmount_2, {from : accounts[2]});
    await battle.stakeNDR(stakeAmount_3, {from : accounts[3]});
    await battle.stakeNDR(stakeAmount_4, {from : accounts[4]});

    let ndrAmountStaked_1 = await battle.totalNDRAmountPerUser(accounts[1]);
    let ndrAmountStaked_2 = await battle.totalNDRAmountPerUser(accounts[2]);
    let ndrAmountStaked_3 = await battle.totalNDRAmountPerUser(accounts[3]);
    let ndrAmountStaked_4 = await battle.totalNDRAmountPerUser(accounts[4]);

    assert.equal(stakeAmount_1.toString(), ndrAmountStaked_1.toString());
    assert.equal(stakeAmount_2.toString(), ndrAmountStaked_2.toString());
    assert.equal(stakeAmount_3.toString(), ndrAmountStaked_3.toString());
    assert.equal(stakeAmount_4.toString(), ndrAmountStaked_4.toString());
  });

  it("Check team NDR Amount", async function() {
    let ndrAmountStaked_team_1 = await battle.totalNDRAmountPerTeam(1);
    let ndrAmountStaked_team_2 = await battle.totalNDRAmountPerTeam(2);

    let ndrAmountStaked_1 = await battle.totalNDRAmountPerUser(accounts[1]);
    let ndrAmountStaked_2 = await battle.totalNDRAmountPerUser(accounts[2]);

    console.log(ndrAmountStaked_team_1.toString());

    let ndr_team_1 = await battle.getTeamNDRAmount(1);

    console.log(ndr_team_1.toString());
    assert.equal(ndrAmountStaked_team_1.toString(), ndr_team_1);
    console.log(ndrAmountStaked_team_2.toString());
  });

  it("Buy NFT(which tokenId is 1) cards", async function() {
    let amountBuy = web3.utils.toBN(2 * 10 ** 18);
    await lpContract.methods.buy(1).send({from:accounts[1], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[2], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[3], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[4], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});

    let nftBalance_account_1 = await nftContract.methods.balanceOf(accounts[1], 1).call();
    let nftBalance_account_2 = await nftContract.methods.balanceOf(accounts[2], 1).call();
    let nftBalance_account_3 = await nftContract.methods.balanceOf(accounts[3], 1).call();
    let nftBalance_account_4 = await nftContract.methods.balanceOf(accounts[4], 1).call();

    assert.equal(nftBalance_account_1, 1);
    assert.equal(nftBalance_account_2, 1);
    assert.equal(nftBalance_account_3, 1);
    assert.equal(nftBalance_account_4, 1);
  });

  it("Approve NFT to the battle contract", async function() {
    await nftContract.methods.setApprovalForAll(battle.address, true).send({from:accounts[1], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await nftContract.methods.setApprovalForAll(battle.address, true).send({from:accounts[2], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await nftContract.methods.setApprovalForAll(battle.address, true).send({from:accounts[3], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await nftContract.methods.setApprovalForAll(battle.address, true).send({from:accounts[4], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  });

  it("Set Acceptable tokenID for each team", async function() {
    await battle.setSupportedIds([1,2,3], 1, {from: accounts[0]});
    await battle.setSupportedIds([1,2,3], 2, {from: accounts[0]});
  });

  it("deposit NFT", async function() {
    await battle.stakeNFT([1], [1], {from: accounts[1]});
    await battle.stakeNFT([1], [1], {from: accounts[2]});
    await battle.stakeNFT([1], [1], {from: accounts[3]});
    await battle.stakeNFT([1], [1], {from: accounts[4]});

    let strength_account_1 = await battle.totalNFTStrengthPerUser(accounts[1]);
    let strength_account_2 = await battle.totalNFTStrengthPerUser(accounts[2]);
    let strength_account_3 = await battle.totalNFTStrengthPerUser(accounts[3]);
    let strength_account_4 = await battle.totalNFTStrengthPerUser(accounts[4]);

    assert.equal(strength_account_1.toString(), 40000);
    assert.equal(strength_account_2.toString(), 40000);
    assert.equal(strength_account_3.toString(), 40000);
    assert.equal(strength_account_4.toString(), 40000);

  });

  it("Check team total nft strength and users nft strength", async function() {
    let totalStrength_team_1 = await battle.getTeamTotalNFTStrength(1);
    let totalStrength_team_2 = await battle.getTeamTotalNFTStrength(2);

    let totalStrength_account_1 = await battle.getUserTotalNFTStrength(accounts[1]);
    let totalStrength_account_2 = await battle.getUserTotalNFTStrength(accounts[2]);
    let totalStrength_account_3 = await battle.getUserTotalNFTStrength(accounts[3]);
    let totalStrength_account_4 = await battle.getUserTotalNFTStrength(accounts[4]);

    let dayHash_team_1 = await battle.getTeamDayHash(1);
    let dayHash_team_2 = await battle.getTeamDayHash(2);

    let dayHash_account_1 = await battle.getUserDayHash(accounts[1]);
    let dayHash_account_2 = await battle.getUserDayHash(accounts[2]);
    let dayHash_account_3 = await battle.getUserDayHash(accounts[3]);
    let dayHash_account_4 = await battle.getUserDayHash(accounts[4]);

    console.log(totalStrength_team_1.toString());
    console.log(totalStrength_team_2.toString());

    console.log(totalStrength_account_1.toString());
    console.log(totalStrength_account_2.toString());
    console.log(totalStrength_account_3.toString());
    console.log(totalStrength_account_4.toString());

    console.log(dayHash_team_1.toString());
    console.log(dayHash_team_2.toString());

    console.log(dayHash_account_1.toString());
    console.log(dayHash_account_2.toString());
    console.log(dayHash_account_3.toString());
    console.log(dayHash_account_4.toString());
  });

  it("Check team total hash", async function() {
    let amountBuy = web3.utils.toBN(2 * 10 ** 18);
    await lpContract.methods.buy(1).send({from:accounts[1], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[2], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[3], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
    await lpContract.methods.buy(1).send({from:accounts[4], value:amountBuy, gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});

    let nftBalance_account_1 = await nftContract.methods.balanceOf(accounts[1], 1).call();
    let nftBalance_account_2 = await nftContract.methods.balanceOf(accounts[2], 1).call();
    let nftBalance_account_3 = await nftContract.methods.balanceOf(accounts[3], 1).call();
    let nftBalance_account_4 = await nftContract.methods.balanceOf(accounts[4], 1).call();

    assert.equal(nftBalance_account_1, 1);
    assert.equal(nftBalance_account_2, 1);
    assert.equal(nftBalance_account_3, 1);
    assert.equal(nftBalance_account_4, 1);
    
    await battle.stakeNFT([1], [1], {from: accounts[1]});
    await battle.stakeNFT([1], [1], {from: accounts[2]});
    await battle.stakeNFT([1], [1], {from: accounts[3]});
    await battle.stakeNFT([1], [1], {from: accounts[4]});

    let strength_account_1 = await battle.totalNFTStrengthPerUser(accounts[1]);
    let strength_account_2 = await battle.totalNFTStrengthPerUser(accounts[2]);
    let strength_account_3 = await battle.totalNFTStrengthPerUser(accounts[3]);
    let strength_account_4 = await battle.totalNFTStrengthPerUser(accounts[4]);

    assert.equal(strength_account_1.toString(), 80000);
    assert.equal(strength_account_2.toString(), 80000);
    assert.equal(strength_account_3.toString(), 80000);
    assert.equal(strength_account_4.toString(), 80000);
    
    // const time = now + 86400
    // await ethers.provider.send('evm_setNextBlockTimestamp', [now]);
    // await network.provider.send("evm_increaseTime", [3600])
    // await network.provider.send("evm_mine")

    let totalHash_team_1 = await battle.getTeamHashResult(1);
    let totalHash_team_2 = await battle.getTeamHashResult(2);

    console.log(totalHash_team_1.toString());
    console.log(totalHash_team_2.toString());
  });

  // it("deposit NDR", async function() {

  //   let amountDeposit = web3.utils.toBN(100 * 10 ** 18);
  //   await uniswap.methods.swapETHForExactTokens(amountDeposit.toString(), [WETHAddress, NDRAddress], accounts[0], '9600952122').send({from:accounts[0], value:amountDeposit.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await uniswap.methods.swapETHForExactTokens(amountDeposit.toString(), [WETHAddress, NDRAddress], accounts[1], '9600952122').send({from:accounts[1], value:amountDeposit.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await uniswap.methods.swapETHForExactTokens(amountDeposit.toString(), [WETHAddress, NDRAddress], accounts[1], '9600952122').send({from:accounts[2], value:amountDeposit.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await uniswap.methods.swapETHForExactTokens(amountDeposit.toString(), [WETHAddress, NDRAddress], accounts[1], '9600952122').send({from:accounts[3], value:amountDeposit.toString(), gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});


  //   await ndr.methods.approve(battle.address, amountDeposit.toString()).send({from:accounts[0], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await ndr.methods.approve(battle.address, amountDeposit.toString()).send({from:accounts[1], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await ndr.methods.approve(battle.address, amountDeposit.toString()).send({from:accounts[2], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});
  //   await ndr.methods.approve(battle.address, amountDeposit.toString()).send({from:accounts[3], gas: 3000000, gasPrice: web3.utils.toWei("1", "gwei")});

  //   let stakeAmount0 = web3.utils.toBN(5 * 10 ** 18);
  //   let stakeAmount1 = web3.utils.toBN(7 * 10 ** 18);
  //   await battle.stakeNDR(stakeAmount0, {from : accounts[0]});
  //   await battle.stakeNDR(stakeAmount1, {from : accounts[1]});
  //   let balance0 = await ndr.methods.balanceOf(accounts[0]).call();
  //   let balance1 = await ndr.methods.balanceOf(accounts[1]).call();
  //   let teamBalance = await battle.getTeamNDRAmount(teamId);
  //   console.log(teamBalance.toString());
  //   console.log(balance0.toString());
  //   console.log(balance1.toString());
  //   await battle.withdrawNDR({from : accounts[0]});
  //   await battle.withdrawNDR({from : accounts[1]});
  //   let balance0afterwithdraw = await ndr.methods.balanceOf(accounts[0]).call();
  //   let balance1afterwithdraw = await ndr.methods.balanceOf(accounts[1]).call();
  //   console.log(balance0afterwithdraw.toString());
  //   console.log(balance1afterwithdraw.toString());
  //   // console.log(battle.address);
  // });
});