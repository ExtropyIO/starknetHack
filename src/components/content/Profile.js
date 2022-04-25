import React from "react";
import Table from 'react-bootstrap/Table';
import UserProfileRow from "./UserProfileRow"
 
function Profile(props) {
  let myRank;
  for (let i = 0; i<props.leaderboardList.length; i++) {
    if (props.leaderboardList[i]["address"] == props.account){
      myRank = i+1
    }
  }
  console.log(Object.entries(props.playerLevels))
  const row = props.playerLevels.map((playerLevel, i) => <UserProfileRow key={i} playerLevel={playerLevel} />)
  props.playerLevels.map((playerLevel) => console.log(playerLevel) )
  
  return (
    <div>
      <h2>User Profile</h2>
      <br></br>
      <p>Hi, <b>{props.username ? props.username : props.account}</b></p>
      
      <form onSubmit={props.setUsername}>
        <input
            id="username"
            name="username"
            type="text"
            onChange={props.handleChange}
            placeholder="Change your handle"
        />
        <input type="submit" value="Submit" className="btn-small btn-primary"/>
      </form>
    <br></br>
    <p>Player Score: <b>{props.score}</b> </p>
    <p>Leaderboard Rank : <b>{myRank ? myRank : 0}</b></p>
    <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Level Deployed</th>
            <th>Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {row}
        </tbody>
      </Table>

    </div>

  );
}
 
export default Profile;
