pragma solidity ^0.5.0;
// WARNING THIS CODE IS AWFUL, NEVER DO ANYTHING LIKE THIS
contract Oracle{
	// default visibility for state variables is "internal"
	// readable with web3.eth.getStorageAt()
	uint8 private seed; // Hide seed value!!
	constructor(uint8 _seed) public {
		seed = _seed;
	}

	function getRandomNumber() external view returns (uint256){
		return block.number % seed;
	}

}

// WARNING THIS CODE IS AWFUL, NEVER DO ANYTHING LIKE THIS

contract Lottery {

	struct Team {
		string name;
		string password;
		uint256 points;
	}

	address public owner;
	// <address>.balance is globally available variable, this overwrites it which is redundant and causes problems when calling this.balance
	uint public balance;
	mapping(address => bool) public admins;

	Oracle private oracle;
	uint256 public endTime;

	// public keyword (!!!), i.e. read passwords
	mapping(address => Team) public teams;
	address[] public teamAddresses;

	event LogTeamRegistered(string name);
	event LogGuessMade(address teamAddress);
	event LogTeamCorrectGuess(string name);
	event LogAddressPaid(address sender, uint256 amount);
	event LogResetOracle(uint8 _newSeed);

	modifier onlyOwner(){
		if (msg.sender==owner) {
			_;
		}
	}

	modifier onlyAdmins() {
		require (admins[msg.sender],"Function is admin only");
		_;
	}

	modifier needsReset() {
		if (teamAddresses.length > 0) {
			delete teamAddresses;
		}
		_;
	}


	// Constructor - set admins etc.
	constructor(uint8 _seed) public {

		owner = msg.sender;
		admins[owner] = true;

		admins[0x2a614d42323681E470087992Df29aeee7263D55C] = true;
		admins[0x7F65E7A5079Ed0A4469Cbd4429A616238DCb0985] = true;
		admins[0x142563a96D55A57E7003F82a05f2f1FEe420cf98] = true;
		admins[0xE60c14bd115958Ed5429aF7591E25E5dD992fBd3] = true;
		admins[0x627306090abaB3A6e1400e9345bC60c78a8BEf57] = true;
		admins[0x52faCd14353E4F9926E0cf6eeAC71bc6770267B8] = true;

		initialiseLottery(_seed);
	}


	// initialise the oracle and lottery end time
	function initialiseLottery(uint8 seed) public onlyAdmins needsReset {
		oracle = new Oracle(seed);
		endTime = now + 7 days;
		teams[address(0x0)] = Team("Default Team", "Password", 5);
		teamAddresses.push(address(0x0));
	}

	// reset the lottery
	function reset(uint8 _newSeed) public {
		endTime = now + 7 days;
		// why is _newSeed? this is just logging, ain't setting anything
	    emit LogResetOracle(_newSeed);
	}

	// register a team
	function registerTeam(address _walletAddress, string calldata _teamName, string calldata _password) external payable {
		// 2 ether deposit to register a team
		require(msg.value == 2 ether,"you must pay 2 ether to register a team");
		// add to mapping as well as another array
		teams[_walletAddress] = Team(_teamName, _password, 5);
		teamAddresses.push(_walletAddress);
		emit LogTeamRegistered(_teamName);
	}

	// make your guess , return a success flag
	function makeAGuess(address _team,uint256 _guess) external returns (bool) {
	
		emit LogGuessMade(_team);
		// get a random number
		uint256 random = oracle.getRandomNumber();
		if(random==_guess){
			// give 100 points
			teams[_team].points += 100;
			emit LogTeamCorrectGuess(teams[_team].name);
	        return true;
		}
		else{
			// take away a point for incorrect guess
		    teams[_team].points -= 1;
			return false;
		}
	}

	// once the lottery has finished pay out the best teams
	function payoutWinningTeam() external returns (bool) {

		// if you are a winning team you get paid double the deposit (4 ether)
	    for (uint ii=0; ii<teamAddresses.length; ii++) {
	        if (teams[teamAddresses[ii]].points>=100) {
				teamAddresses[ii].call.value(4 ether)("");
				teams[teamAddresses[ii]].points = 0;
			}
	    }
	    return true;
	}

	function getTeamCount() public view returns (uint256){
		return teamAddresses.length;
	}

	function getTeamDetails(uint256 _num) public view returns(string memory,address,uint256){
		Team storage team = teams[teamAddresses[_num]];
		return(team.name,teamAddresses[_num],team.points);
	}

	function resetOracle(uint8 _newSeed) internal {
	    oracle = new Oracle(_newSeed);
	}

	// catch any ether sent to the contract
	function() external payable {
		balance += msg.value;
		emit LogAddressPaid(msg.sender,msg.value);
	}

	function addAdmin(address _adminAddress) public onlyAdmins {
		admins[_adminAddress] = true;
	}

}