// const Lottery = artifacts.require("Lottery");
// const Attacker = artifacts.require("Attacker");
// const Leaderboard = artifacts.require("Leaderboard");
const Level_0_Practice = artifacts.require("levels/Level_0_Practice");
const Level_1_Brute_Force = artifacts.require("levels/Level_1_Brute_Force");
const Level_2_Reentrancy = artifacts.require("levels/Level_2_Reentrancy");
const Level_3_Global_Functions = artifacts.require("levels/Level_3_Global_Functions");

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts()

  // const seed = 13
  // await deployer.deploy(Lottery, seed);
  // await deployer.deploy(Attacker);

  // await deployer.deploy(Leaderboard);

  await deployer.deploy(Level_0_Practice);
  await deployer.deploy(Level_1_Brute_Force);
  await deployer.deploy(Level_2_Reentrancy, { value: 1000000000000000000 });
  await deployer.deploy(Level_3_Global_Functions);
};