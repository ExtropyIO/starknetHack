import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
 
function Level_1_Reentrancy(props) {

    return (
      <div>
        <h2 style={{backgroundColor: "lightblue"}}>Level 2 - Reentrancy</h2>
        <br></br>
        <p style={{border: "1px dashed coral"}}>
            This level requires you to exploit a reentrancy bug in this simplified ERC20 token contract, in order to drain it from all its funds.
            <br></br>

        </p>
        <br></br>

        <h5>1.  Register deployed level</h5>

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
            <Form.Text className="text-muted">
              The level number is the integer corresponding to the level number of the deployed contract.
            </Form.Text>
          </Form.Group>
          <Button variant="primary" value="Submit" type="submit">
            Register Level
          </Button>
        </Form>
        <br></br><br></br>
        
        <h5>2. Submit solution</h5>
        <Form onSubmit={props.submitSolution}>
          <Form.Group controlId="formRegisterUserLevel">
            <Form.Control
                name="currentLevelNumber"
                type="text"
                placeholder='Level number, e.g. 1'
                onChange={props.handleChange}
            />
            <Form.Text className="text-muted">
              Before clicking on 'Submit Solution' below, you must call the hacked smart contract's <code>completeLevel()</code> function which sets the <code>levelComplete</code> boolean to <code>true</code>.
            </Form.Text>
          </Form.Group>
          <Button variant="primary" value="Submit" type="submit">
            Sumbit Solution
          </Button>
        </Form>
        <br></br><br></br>

        <h5>3. Update leaderboard</h5>
        <Button onClick={props.updateLeaderboard} variant="primary">Update Leaderboard</Button>{' '}
        
        <br></br><br></br><br></br><br></br>
        <hr></hr>
        
      </div>
    );
  
}
 
export default Level_2_Reentrancy;