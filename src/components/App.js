import React, { useState, Component } from 'react';
import Web3 from 'web3';
import Navi from './Navbar'
import Content from './Content'
import Leaderboard from '../abis/Leaderboard.json'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      leaderboard: '',
      username: '',
      score: 0,
      currentLevelNumber: 0,
      currentLevelAddress: '',
      leaderboardLength: 0,
      leaderboardList: [],
      playerLevels: []
    }

    this.loadWeb3 = this.loadWeb3.bind(this)
    this.loadBlockchainData = this.loadBlockchainData.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.registerUserLevel = this.registerUserLevel.bind(this)
    this.submitSolution = this.submitSolution.bind(this)
    this.updateLeaderboard = this.updateLeaderboard.bind(this)
    this.getPlayerLevels = this.getPlayerLevels.bind(this)
    
    // this.getLeaderboard = this.getLeaderboard.bind(this)
    
    
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {

    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Leaderboard.networks[networkId]

    if(networkData) {
      // Load contract
      const leaderboard = web3.eth.Contract(Leaderboard.abi, networkData.address)
      this.setState({ leaderboard })
      // Load username, if any
      if(this.state.username === '') {
        let username = await this.state.leaderboard.methods.getUsername(this.state.account).call()
        this.setState({ username })
      }

      if(this.state.score == 0) {
        let score = await this.state.leaderboard.methods.getScore(this.state.account).call()
        console.log(parseInt(score))
        this.setState({ score: parseInt(score) })
      }

      if(this.state.leaderboardList.length == 0){
        let leaderboardSize = await this.state.leaderboard.methods.listSize().call()
        leaderboardSize = parseInt(leaderboardSize)
        this.setState({leaderboardLength: leaderboardSize})
        let leaderboard = await this.state.leaderboard.methods.getTop(leaderboardSize).call()
        let ll = []
        for (let i in leaderboard) {
          let username = await this.state.leaderboard.methods.getUsername(leaderboard[i]).call()
          let score = await this.state.leaderboard.methods.getScore(leaderboard[i]).call()
          let player = {'address':leaderboard[i], 'username':username, 'score':parseInt(score)}
          ll.push(player)
        }
        this.setState({leaderboardList: ll})
      }

      this.getPlayerLevels()

    } else {
      window.alert('Leaderboard contract not deployed to detected network.')
    }
  }

  handleChange(evt) {
    const { name, value } = evt.target
    this.setState({
      [name]: value
    })
  }

  async updateLeaderboard() {
    // find the address pointing to this.state.account's new score and the address pointing to this.state.account's old score (if any)
    let leaderboardSize = await this.state.leaderboard.methods.listSize().call()
    leaderboardSize = parseInt(leaderboardSize)
    let oldPrevAddress // the address in the mapping that points to the current (prior updating leaderboard) score of the player
    let newPrevAddress = 'tmp' // the address in the mapping that points to the new (after updating leaderboard) score of the player
    let currentAddress = '0x0000000000000000000000000000000000000001' // This is the first address in the linked mapping list
    let nextAddress
    let nextScore
    
    let playerScore = await this.state.leaderboard.methods.getScore(this.state.account).call()
    for(let i=0; i<=leaderboardSize; i++) {
        nextAddress = await this.state.leaderboard.methods.linkedLeaderboard(currentAddress).call()
        nextScore = await this.state.leaderboard.methods.getScore(nextAddress).call()
        if(nextScore <= playerScore && newPrevAddress == 'tmp') {
            newPrevAddress = currentAddress
        }
        // continuously set oldPrevAddress to currentAddress,
        // if the player is new, at the end of the loop this will equal the last player in the leaderboard (which points to GUARD)
        // if the player already exist, this loop will break before it gets updated
        oldPrevAddress = currentAddress;
        if(nextAddress == this.state.account) {
            break
        }
        if(i == leaderboardSize && newPrevAddress == 'tmp') {
            newPrevAddress = currentAddress
        }
        currentAddress = nextAddress
    }
    console.log(newPrevAddress, oldPrevAddress)
    if(newPrevAddress=='tmp'){
      // i.e. if this is the very first player, hence the leaderboard is empty
      await this.state.leaderboard.methods.updateLeaderboard('0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001').send({ from: this.state.account })
    } else {
      await this.state.leaderboard.methods.updateLeaderboard(newPrevAddress, oldPrevAddress).send({ from: this.state.account })
    }
  }

  setUsername() {
    this.state.leaderboard.methods.setUsername(this.state.username).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log('Username set to ' + this.state.username)
    })
  }

  submitSolution() {
    this.state.leaderboard.methods.submitSolution(this.state.currentLevelNumber).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log('Username set to ' + this.state.username)
    })
  }

  registerUserLevel() {
    this.state.leaderboard.methods.registerLevel(this.state.currentLevelAddress, this.state.currentLevelNumber).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log('Username set to ' + this.state.username)
    })
  }

  async getPlayerLevels() {
    let _playerLevels = []
    for (let i=0; i<10; i++){
        let _level = await this.state.leaderboard.methods.getPlayerLevels(this.state.account, i).call()
        let _solved = await this.state.leaderboard.methods.getPlayerSolved(this.state.account, i).call()
        if(_level != 0x0000000000000000000000000000000000000000){
          _playerLevels.push({ 'number':i, 'address':_level, 'isSolved':_solved })
        }
    }
    this.setState({ playerLevels: _playerLevels})
    
  }

  render() {
    return (
      <div>
        <Navi
          account={this.state.account}
          username={this.state.username}
        />
        <Content
          account={this.state.account}
          username={this.state.username}
          score={this.state.score}
          leaderboardList={this.state.leaderboardList}
          playerLevels={this.state.playerLevels}
          setUsername={this.setUsername}
          handleChange={this.handleChange}
          registerUserLevel={this.registerUserLevel}
          submitSolution={this.submitSolution}
          updateLeaderboard={this.updateLeaderboard}
        />
      </div>
    );
  }
}

export default App;