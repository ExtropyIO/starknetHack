import React, { Component } from "react";
//import Lottery from '../Lottery.js';
import lottery_artifacts from '../../abis/Lottery.json'
import Web3 from 'web3';
//import $ from 'jquery'; 
//import contract from "truffle-contract";
//import Level1 from "./content/Level1"
 
class Level1 extends Component {

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
    const networkData = lottery_artifacts.networks[networkId]
    const contractAddress = networkData.address
    
    if(networkData) {
      // const Lottery = web3.eth.Contract(lottery_artifacts.abi, contractAddress)
      // this.setState({ Lottery })

      // let teamCount = await Lottery.methods.getTeamCount.call()
      // teamCount = teamCount.toString()
      // this.setState({ teamCount })
      // console.log(teamCount)
    //   // Load Posts
    //   for (var i = 1; i <= postCount; i++) {
    //     const post = await socialNetwork.methods.posts(i).call()
    //     this.setState({
    //       posts: [...this.state.posts, post]
    //     })
    //   }
    //   // Sort posts. Show highest tipped posts first
    //   this.setState({
    //     posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount )
    //   })
    //   this.setState({ loading: false})
    // } else {
    //   window.alert('SocialNetwork contract not deployed to detected network.')
    // For application bootstrapping, check out window.addEventListener below.

    /////

 


    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      Lottery: null,
      teamCount: ''
      // postCount: 0,
      // posts: [],
      // loading: true
    }
  }

  render() {
    return (
      <div id="widgets" class="container-fluid">
        <div class="row">
          <div id="input-forms" class="col">
            <div id="registration-container" class="container-fluid lottery-form p-30 border">
              <h3>Register Team {this.props.teamCount}</h3>
              <form id="registration-form" action="javascript:App.registerTeam();" novalidate>
                <div class="form-group">
                  <label for="registerNameInput">Team Name</label>
                  <input type="text" class="form-control" id="registerNameInput" placeholder="Name" required />
                </div>
                <div class="form-group">
                  <label for="registerAddressInput">Address</label>
                  <input type="text" class="form-control" id="registerAddressInput" placeholder="e.g. 0x93e66d9baea28c17d9fc393b53e3fbdd76899dae" pattern="^0x[0-9A-Za-z]{40}" required />
                  <div class="invalid-feedback">
                    Please provide a valid Ethereum wallet address.
                  </div>
                </div>
                <div class="form-group">
                  <label for="registerPasswordInput">Password</label>
                  <input type="password" class="form-control" id="registerPasswordInput" placeholder="Password" required />
                </div>
                <button id="register" type="submit">Register Team</button>
              </form>
            </div>
            <div id="guess-container" class="container-fluid lottery-form p-30 border">
              <h3>Make a Guess</h3>
              <form id="guess-form" action="javascript:App.makeGuess();" novalidate>
                <div class="form-group">
                  <label for="guessAddressInput">Address</label>
                  <input type="text" class="form-control" id="guessAddressInput" placeholder="e.g. 0x93e66d9baea28c17d9fc393b53e3fbdd76899dae" pattern="^0x[0-9A-Za-z]{40}" required />
                  <div class="invalid-feedback">
                    Please provide a valid Ethereum wallet address.
                  </div>
                </div>
                <div class="form-group">
                  <label for="guessInput">Guess</label>
                  <input type="number" class="form-control" id="guessInput" placeholder="e.g. 1" min="0" required />
                </div>
                <button id="makeGuess" type="submit">Make a guess</button>
              </form>
            </div>
          </div>
          <div id="table-of-users" class="col p-30 border">
            <h2>Team Scores</h2>
            <table id="lottery-results" class="table">
              <thead class="thead-inverse">
              <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>Address</th>
                <th>Score</th>
              </tr>
              </thead>
              <tbody id="team-data">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
 
export default Level1;
