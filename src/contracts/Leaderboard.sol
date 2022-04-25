pragma solidity ^0.6.0; // TODO change this to v 0.6 by upgrading compiler version in truffle-config.js

import "@openzeppelin/contracts/access/Ownable.sol";
// import "openzeppelin-contracts/contracts/ownership/Ownable.sol"; // was manually git cloned

contract Leaderboard is Ownable {
    // levelsRegistered's key address is the level while the value address is the user's, useed to check if level already exists and its owner (player)
    // i.e. contains all deployed contracts, used to check that the submitted level's address belongs to the user
    mapping(address => address) public levelsRegistered;
    mapping(uint8 => _Level) public levels; // levels deployed by Owner, i.e. 'official' levels containing challenge
    mapping(address => _Player) public players;
    mapping(address => address) public linkedLeaderboard;
    uint256 public listSize;
    address constant GUARD = address(1);
    address constant NULL = address(0);
    struct _Player {
        string username;
        uint256 score;
        mapping(uint8 => address) playerLevels; // contains the address of the latest deployed contract for each level number
        mapping(uint8 => bool) solved; // use to check the user can't submit solution twice, true if solved
    }
    struct _Level {
        string levelName;
        uint256 levelPoints;
        bytes32 levelBytesHash; // used in registerLevel() to check the user is deoloying the right contract, i.e. not cheating.
        address levelAddress;
    }

    constructor() public {
        linkedLeaderboard[GUARD] = GUARD;
        // players[msg.sender].username = 'Extropy';
    }

    // https://solidity.readthedocs.io/en/v0.5.3/assembly.html#example
    function at(address _addr) public view returns(bytes memory o_code) {
        assembly {
            // retrieve the size of the code, this needs assembly
            let size := extcodesize(_addr)
            // allocate output byte array - this could also be done without assembly
            // by using o_code = new bytes(size)
            o_code := mload(0x40)
            // new "memory end" including padding
            mstore(0x40, add(o_code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
            // store length in memory
            mstore(o_code, size)
            // actually retrieve the code, this needs assembly
            extcodecopy(_addr, add(o_code, 0x20), 0, size)
        }
    }

    function setUsername(string calldata _username) external {
        players[msg.sender].username = _username;
        // TODO (optional) only allow unique usernames
    }

    function registerLevel(address _deployedAt, uint8 _levelNumber) public {
        // public because called internally as well
        // submitting a solution requires registering a level so that user's can't submit others' solutions
        require(levelsRegistered[_deployedAt] == NULL); // cannot be registered already
        // the ABI bytecode hashes of the original and deployed contracts must match
        require(levels[_levelNumber].levelBytesHash == keccak256(at(_deployedAt)));
        // register globally so that player's can't register it and submit each others' solutions
        levelsRegistered[_deployedAt] = msg.sender;
        // register to _Player struct so that _levelNumber can be used to call submitSolution()
        players[msg.sender].playerLevels[_levelNumber] = _deployedAt;
    }

    function verifyIndex(address prevPlayer, uint256 newValue, address nextPlayer) internal view returns(bool) {
        return (prevPlayer == GUARD || players[prevPlayer].score >= newValue) &&
            (nextPlayer == GUARD || newValue > players[nextPlayer].score);
    }

    function addPlayer(address _newPrevPlayer) internal {
        // this function adds a new player to the sorted mapping, i.e. it 
        // The previous player must exist
        require(linkedLeaderboard[_newPrevPlayer] != NULL);
        // _newPrevPlayer is the player whose score is immediately greater or equal to the current player.
        // this means that looping through the list must be done client side by web3 and it will be possible to insert the player using linked lists
        // only if it passes the check by verifyIndex.
        require(verifyIndex(_newPrevPlayer, players[msg.sender].score, linkedLeaderboard[_newPrevPlayer]));
        // point msg.sender to whatever addr _newPrevPlayer was pointing to
        linkedLeaderboard[msg.sender] = linkedLeaderboard[_newPrevPlayer];
        // point _newPrevPlayer to msg.sender
        // i.e. msg.sender is now after _newPrevPlayer in the scores, sorted in descending order
        linkedLeaderboard[_newPrevPlayer] = msg.sender;
        listSize++;
    }

    function updateScore(
        address oldCandidatePlayer,
        address newCandidatePlayer
    ) internal {
        // the msg.sender must already exist
        require(linkedLeaderboard[msg.sender] != NULL);
        require(linkedLeaderboard[oldCandidatePlayer] != NULL);
        require(linkedLeaderboard[newCandidatePlayer] != NULL);
        if (oldCandidatePlayer == newCandidatePlayer) {
            require(linkedLeaderboard[oldCandidatePlayer] == msg.sender); // require(_isPrevStudent(msg.sender, oldCandidatePlayer));
            require(verifyIndex(newCandidatePlayer, players[msg.sender].score, linkedLeaderboard[newCandidatePlayer]));
            // players[msg.sender] = newScore;
        } else {
            removePlayer(oldCandidatePlayer);
            addPlayer(newCandidatePlayer);
        }
    }

    function removePlayer(address candidatePlayer) internal {
        require(linkedLeaderboard[msg.sender] != NULL);
        require(linkedLeaderboard[candidatePlayer] == msg.sender); // require(_isPrevStudent(msg.sender, candidateStudent));
        linkedLeaderboard[candidatePlayer] = linkedLeaderboard[msg.sender];
        linkedLeaderboard[msg.sender] = NULL;
        listSize--;
    }

    function getTop(uint256 k) public view returns(address[] memory) {
        // TODO needs to be deprecated as it is cheaper to do this client side
    	require(k <= listSize);
    	address[] memory playerLists = new address[](k);
    	address currentAddress = linkedLeaderboard[GUARD];
    	for(uint256 i = 0; i < k; ++i) {
      		playerLists[i] = currentAddress;
    		currentAddress = linkedLeaderboard[currentAddress];
    	}
    	return playerLists;
  	}
    
    function submitSolution(uint8 _levelNumber) external {
        address _registeredLevel = players[msg.sender].playerLevels[_levelNumber];
        // level must be registered by user first
        require(_registeredLevel != NULL);
        // checks that it hasn't been solved yet
        require(players[msg.sender].solved[_levelNumber] == false);
        // check return value of public var from deployed contract's instance
        (bool _success, bytes memory _result) = address(_registeredLevel).call(abi.encodeWithSignature("levelComplete()"));
        (bool levelSolved) = abi.decode(_result, (bool));
        require(levelSolved);
        players[msg.sender].solved[_levelNumber] = true; // mark the level as solved
        // Add the points to the Player
        players[msg.sender].score += levels[_levelNumber].levelPoints;
        // now that points have been added, check the new score on the frontend and then call updateLeaderboard()
    }

    // @param _newPrevPlayer is the player with the score immediately higher than or equal to the current player's new score (after submitting a solution)
    // @param _oldPrevPlayer is the player pointing to the current player's old score which needs to be updated with new score
    //                       if the player is not in the leaderboard yet, _oldPrevPlayer will not be used, i.e. pass in 0x0 for simplicity
    function updateLeaderboard(address _newPrevPlayer, address _oldPrevPlayer) external {
        // there is no need to check for players[msg.sender].solved[_levelNumber] since verifyIndex takes care of checking the provided leaderboard index matches the player's score
        if (linkedLeaderboard[msg.sender] == NULL) {
            // if the player is not in the leaderboard yet
            addPlayer(_newPrevPlayer);
        } else {
            // if linkedLeaderboard[msg.sender] is not null addr it means that is already in the scoreboard
            // _newPrevPlayer point to the new location on the scoreboard (another address), but we also need to remove the old instance first
            updateScore(_oldPrevPlayer, _newPrevPlayer);
        }
    }

    function editLevel(string calldata _levelName, uint8 _levelNumber, uint256 _levelPoints, address _levelAddress) external onlyOwner {
        // @note This will override a level's mapping if it already exists
        // @note We don't actually deploy any level, we just keep a struct with the details necessary to stop users from cheating
        // @dev technically we could calculate the hash of the level's bytes offline but providing a function to do so is more consistent,
        // @audit consider if disclosing (in call parameter) the address of others' levels could incentivise cheating or malicious behavior
        // @TODO (optional) create a public function to let users deploy their own level, and populate the list on the frontend, let users vote on others' levels
        bytes memory _byteCode = at(_levelAddress);
        bytes32 _levelBytesHash = keccak256(_byteCode);
        levels[_levelNumber] = _Level(_levelName, _levelPoints, _levelBytesHash, _levelAddress);
        // Finally call registerLevel as the owner so that users cannot use this deployed contract to submit their solution
        registerLevel(_levelAddress, _levelNumber);
    }

    function getUsername(address _account) public view returns(string memory) {
        // string memory usr = players[_account].username;
        return(players[_account].username);
    }

    function getScore(address _account) public view returns(uint256) {
        // string memory usr = players[_account].username;
        return(players[_account].score);
    }

    // I couldn't find a way to get the _Player mapping's value via web3, so I created getter functions
    function getPlayerLevels(address _p, uint8 _l) public view returns(address) {
        address _playerLevel = players[_p].playerLevels[_l];
        return _playerLevel;
    }

    function getPlayerSolved(address _p, uint8 _l) public view returns(bool) {
        // @audit is there any reason why we need address _p? i.e. why not use msg.sender
        bool _playerSolved = players[_p].solved[_l];
        return _playerSolved;
    }

}