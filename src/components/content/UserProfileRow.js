import React from "react"

function UserProfileRow(props) {
	console.log(props.playerLevel)

	const styles = {
	    color: '#000000'
	 }
  
	  if (props.playerLevel.isSolved == true) {
	    styles.color = "#ADFF2F"
	  } else {
	    styles.color = "#FFFFFF"
	  }
    return (
        <tr>
          <td>{props.playerLevel.number}</td>
          <td>{props.playerLevel.address}</td>
          <td style={styles}><b>{props.playerLevel.isSolved ? 'LEVEL COMPLETE' : 'TRY HARDER'}</b></td>
        </tr>
    )
}

export default UserProfileRow