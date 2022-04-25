import React, { Component, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import LeaderboardRow from "./LeaderboardRow"
 
function Leaderboard(props) {
  // useEffect(() => {
  //   props.getLeaderboard()
  // }, [])
  const row = props.leaderboardList.map((player, i) => <LeaderboardRow key={i+1} rank={i+1} player={player} />)
  return (
    <div>
      <h2>Leaderboard</h2>
      <br></br>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Handle</th>
            <th>Account</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {row}
        </tbody>
      </Table>

    </div>

  );
}
 
export default Leaderboard;
