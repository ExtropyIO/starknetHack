import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
 
function Level_0_Practice(props) {

    return (
      <div>
        <h2 style={{backgroundColor: "lightblue"}}>Level 0 - Practice</h2>
        <br></br>
        <p style={{border: "1px dashed coral"}}>
            This level is to get you familiar with playing the game and to score some easy points.
        </p>
            You can also watch a walkthrough of this level <a href="https://www.youtube.com/" target="_blank">on YouTube</a>.
        <p>
        </p>
        <br></br>

        <h5>1. Set up Metamask</h5>
        <p>
            If you don't have it already, install the <a href="https://metamask.io/" target="_blank">MetaMask browser extension</a>. Set up the extension's wallet and use the network selector to point to the 'Rinkeby test network'.
        </p>
        <br></br>

        <h5>2. Get test ether</h5>
        <p>
            To play the game, you will need test ether. The easiest way to get some testnet ether is via the <a href="https://faucet.rinkeby.io/" target="_blank">Rinkeby faucet</a> or the <a href="https://faucet.metamask.io/" target="_blank">MetaMask faucet</a>.
        </p>
        <p>
            Once you see some ether in your balance, move on to the next step.
        </p>
        <br></br>

        <h5>3. Getting a level instance</h5>
        <p>
            When playing a level, you don't interact directly with the Extropy contract, instead you will be using the Remix online IDE in order to deploy a copy of the level that want to hack.
        </p>
        <p>
            Click on the button below in order to open and save all levels in Remix, then select level <code>Level_0_Practice.sol</code> and deploy it on the Rinkeby network. Make sure that you select the Solidity compiler version <code>0.6.0</code>. 
        </p>
        <p>
            You should be prompted by MetaMask to authorize the transaction. Note that this is deploying a new contract in the blockchain and might take a few seconds.
        </p>
        <Button variant="primary" href="https://remix.ethereum.org/#gist=2e6d2ea22cc2b7d1394faa8c10b024cd" target="_blank">
            Open Remix
        </Button>
        <br></br><br></br><br></br>

        <h5>4. Register the level</h5>
    	<p>
        Once deployed via Remix, copy the new level's address and paste it in the box below, you also need to specify the level number to which it corresponds, in this case enter <code>0</code>.
    	</p>
        <p>
        This step is needed in order save the deployed level's address to the main Extropy smart contract, so that it can keep track of the levels deployed by each player.
        </p>
        <p>
        Note, the original code of each level must not be modified prior deployment or else this transaction will fail, this is a security measure in order to prevent cheating.
        </p>
    	<Form onSubmit={props.registerUserLevel}>
		  <Form.Group controlId="formRegisterUserLevel">
		    <Form.Control
                name="currentLevelAddress"
                type="text"
                placeholder="Deployed address, e.g. 0xC21dF767a71fA3465685e7f5b9FcA093aB571582"
                onChange={props.handleChange}
            />
            <br></br>
            <Form.Control
                name="currentLevelNumber"
                type="text"
                placeholder='Level number, e.g. 1'
                onChange={props.handleChange}
            />
		  </Form.Group>
		  <Button variant="primary" value="Submit" type="submit">
		    Register Level
		  </Button>
		</Form>
        <br></br><br></br>
        
        <h5>5. Hack the level</h5>
        <p>
            This is the fun part. Every level has a public boolean variable called <code>levelComplete</code>, this variable is initialized to <code>false</code> and only changes to <code>true</code> once you solve a level. 
        </p>
        <p>
            You will solve a level by calling the <code>completeLevel()</code> function which, when given the correct parameters, will change the state of the <code>levelComplete</code> boolean to <code>true</code>.
        </p>
        <p>
            For level 0, <code>completeLevel()</code> requires being called with a number that is hardcoded in the smart contract, see if you can find it!
        </p>
        <p>
            You can check at any time whether you have solved a level by reading the public <code>levelComplete</code> variable without spending any Gas.
        </p>
        
        <br></br>

        <h5>6. Submit your solution</h5>
        <p>
            Enter the level number, <code>0</code>, in the box below and click on 'Submit Solution'.
        </p>
        <p>
            If the transaction succeeds, the main Ethereumxtropy smart contract awards you points and marks this level as solved by your player's Ethereum address.
        </p>
        <p>
            Note, you won't be able to submit this solution again once the level has been marked as solved. You can always check all the levels you have solved in your <a href="http://hack.extropy.io:3000/#/profile">user profile</a> page.
        </p>
        <Form onSubmit={props.submitSolution}>
          <Form.Group controlId="formRegisterUserLevel">
            <Form.Control
                name="currentLevelNumber"
                type="text"
                placeholder='Level number, e.g. 1'
                onChange={props.handleChange}
            />
          </Form.Group>
          <Button variant="primary" value="Submit" type="submit">
            Submit Solution
          </Button>
        </Form>
        <br></br><br></br>

        <h5>7. Update the leaderboard</h5>
        <p>
            Finally, although your score was increased in the previous step, you still need to tell the main Extropy smart contract to update its leaderboard based on your new score.
        </p>
        <Button onClick={props.updateLeaderboard} variant="primary">Update Leaderboard</Button>{' '}
        
        <br></br><br></br><br></br><br></br>
        <hr></hr>
        
      </div>
    );
  
}
 
export default Level_0_Practice;