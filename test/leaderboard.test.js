const Leaderboard = artifacts.require("./Leaderboard.sol");
const TestLevel = artifacts.require("./levels/Level_0_Practice.sol");
// const TestPlayerLevel = artifacts.require("./TestPlayerLevel.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should()

// Helpers
const EVM_REVERT = 'VM Exception while processing transaction: revert';
const NULL =  '0x0000000000000000000000000000000000000000'
const GUARD = '0x0000000000000000000000000000000000000001'

contract('Leaderboard', ([deployer, player1, player2, player3]) => {

    let leaderboard
    let testOwnerLevel
    let testPlayer1Level1


    beforeEach(async () => {
        leaderboard = await Leaderboard.new()
        testOwnerLevel = await TestLevel.new()
        testPlayer1Level1 = await TestLevel.new()
    })


    describe('deployment', () => {
        it('tracks the owner', async () =>{
            // the token name should be My Name
            const result = await leaderboard.owner()
            result.should.equal(deployer)
        })
        it('tracks the GUARD address', async () =>{
            // the token name should be My Name
            const result = await leaderboard.linkedLeaderboard(GUARD)
            result.should.equal(GUARD)
        })
    })

    describe('creating official leaderboard levels', () => {
        beforeEach(async () => {
             await leaderboard.editLevel("Lottery", 1, 100, testOwnerLevel.address)
        })

        it('tracks the name, points and hash', async () => {
            
            var level1 = await leaderboard.levels(1);

            level1[0].should.equal("Lottery")
            level1[1].toString().should.equal("100")
            
            const level1Bytes = await web3.eth.getCode(testOwnerLevel.address)
            // Will calculate the sha3 of given input parameters in the same way solidity would.
            // This means arguments will be ABI converted and tightly packed before being hashed.
            const level1Hash = await web3.utils.soliditySha3(level1Bytes)

            level1[2].should.equal(level1Hash)

        })

        it('registers the level after creating it', async () => {
            var levelRegistered = await leaderboard.levelsRegistered(testOwnerLevel.address)
            levelRegistered.should.equal(deployer) // it was registered by player 1
        })

    })

    describe('Changing players username', () => {
        it('tracks player username', async () => {
            await leaderboard.setUsername('Cosimo', {from: player1})
            const user = await leaderboard.players(player1)
            user['username'].should.equal("Cosimo")
        })
    })

    describe('registering a newly deployed player level', () => {

        describe('success', () => {
            
            beforeEach(async () => {
                // player1 registers
                await leaderboard.setUsername   ('Cosimo', {from: player1})
                // Owner adds a new challenge contract and sets it as level 1
                await leaderboard.editLevel("Lottery", 1, 100, testOwnerLevel.address)
                // player1 deploys his own copy of level 1 and registers it
                // registerLevel will compare the hashes of this contract with the owner deployed one
                await leaderboard.registerLevel(testPlayer1Level1.address, 1, {from: player1})
            })

            it('tracks level address', async () => {
                // global 'levels' mapping, i.e. check that it has been written to mapping so that no one else can register it again
                var levelRegistered = await leaderboard.levelsRegistered(testPlayer1Level1.address)
                levelRegistered.should.equal(player1) // it was registered by player 1

                // check that it is written to _Player mapping so that player1 can submit their solution
                var playerLevel = await leaderboard.getPlayerLevels(player1, 1)
                // the address returned should equal the same as deployed by the player
                playerLevel.should.equal(testPlayer1Level1.address)
            })
        })

        describe('failure', () => {
            
            beforeEach(async () => {
                await leaderboard.setUsername   ('Cosimo', {from: player1})
                await leaderboard.editLevel("Lottery", 1, 100, testOwnerLevel.address)
            })

            it('fails to register an already registered address', async () => {
                // player1 tries to register the owners contract address but fails
                await leaderboard.registerLevel(testOwnerLevel.address, 1, {from: player1}).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails to register a contract level if the ABI differs from the official one', async () => {
                // player1 tries to register a malicious contract, for this test we reuse the ABI of Leaderboard so we don't deploy a new contract
                await leaderboard.registerLevel(leaderboard.address, 1, {from: player1}).should.be.rejectedWith(EVM_REVERT)
            })
        })

    })

    describe('Submitting player solutions', () => {

        describe('success', () => {
            
            beforeEach(async () => {
                await leaderboard.setUsername('Cosimo', {from: player1})
                await leaderboard.editLevel("Lottery", 1, 100, testOwnerLevel.address)
                await leaderboard.registerLevel(testPlayer1Level1.address, 1, {from: player1})
            })

            it('submits a correctly solved level', async () => {
                let complete
                complete = await testPlayer1Level1.levelComplete()
                complete.should.equal(false)
                // 'complete' the level
                await testPlayer1Level1.completeLevel(42)
                complete = await testPlayer1Level1.levelComplete()
                complete.should.equal(true)
                // submits solution for level 1
                await leaderboard.submitSolution(1, {from: player1})
                // check whether the player struct has solved the level,
                // i.e. check that completeLevel() updated the user struct correctly
                var solved = await leaderboard.getPlayerSolved(player1, 1)
                solved.should.equal(true)
                // player1 should have 100 points
                var playa = await leaderboard.players(player1)
                playa['score'].toString().should.equal("100")
                // update the leaderboard using player1's new score
                await leaderboard.updateLeaderboard(GUARD, GUARD, {from: player1})
                // check ranking array length
                var rank = await leaderboard.listSize()
                rank.toString().should.equal('1')
                // check that player one is after GUARD
                var firstPlayer = await leaderboard.linkedLeaderboard(GUARD)
                firstPlayer.should.equal(player1)
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await leaderboard.editLevel("Lottery", 1, 100, testOwnerLevel.address)
                await leaderboard.registerLevel(testPlayer1Level1.address, 1, {from: player1})
            })
            it('reverts if player submits an unsolved level', async () => {
                let complete
                complete = await testPlayer1Level1.levelComplete()
                complete.should.equal(false)
                // 'complete' the level
                // await testPlayer1Level1.completeLevel(42)
                // submits solution for level 1
                await leaderboard.submitSolution(1, {from: player1}).should.be.rejected
            })

        })

    })

    describe('Sorting the Leaderboard', () => {

        describe('success', () => {

            let testOwnerLevel2
            let testOwnerLevel3

            let testPlayer1Level2
            let testPlayer1Level3

            let testPlayer2Level1
            let testPlayer2Level2
            let testPlayer2Level3

            let testPlayer3Level1
            let testPlayer3Level2
            let testPlayer3Level3
            
            beforeEach(async () => {

                // more levels needed to get points for the leaderboard
                testOwnerLevel2 = await TestLevel.new()
                testOwnerLevel3 = await TestLevel.new()

                // creating the levels
                await leaderboard.editLevel("Level1", 1, 100, testOwnerLevel.address)
                await leaderboard.editLevel("Level2", 2, 200, testOwnerLevel2.address)
                await leaderboard.editLevel("Level3", 3, 300, testOwnerLevel3.address)

                // need different levels for each player as levels cannot be registered twice with the same address
                // levels for player1
                testPlayer1Level2 = await TestLevel.new()
                testPlayer1Level3 = await TestLevel.new()

                // levels for player2
                testPlayer2Level1 = await TestLevel.new()
                testPlayer2Level2 = await TestLevel.new()
                testPlayer2Level3 = await TestLevel.new()

                // player 3 level
                testPlayer3Level1 = await TestLevel.new()
                testPlayer3Level2 = await TestLevel.new()
                testPlayer3Level3 = await TestLevel.new()

                // 'register' the 3 players, i.e. just assign them a username
                await leaderboard.setUsername('P1', {from: player1})
                await leaderboard.setUsername('P2', {from: player2})
                await leaderboard.setUsername('P3', {from: player3})
            
                // initializing the leaderboard with 3 players each with different points
                // player1 solves 3 levels, i.e. 600 points
                await leaderboard.registerLevel(testPlayer1Level1.address, 1, {from: player1})
                await leaderboard.registerLevel(testPlayer1Level2.address, 2, {from: player1})
                await leaderboard.registerLevel(testPlayer1Level3.address, 3, {from: player1})
                // completeLevel just sets 'levelComplete' bool to true
                await testPlayer1Level1.completeLevel(42,{from: player1})
                await testPlayer1Level2.completeLevel(42,{from: player1})
                await testPlayer1Level3.completeLevel(42,{from: player1})
                
                // submit the solution, this only updates user score but not the leaderboard
                await leaderboard.submitSolution(1, {from: player1})
                await leaderboard.submitSolution(2, {from: player1})
                await leaderboard.submitSolution(3, {from: player1})

                // find the address pointing to player1's new score and the address pointing to player1's old score (if any)
                let leaderboardSize1 = await leaderboard.listSize()
                // let leaderboard = []
                let oldPrevAddress1 // the address in the mapping that points to the current (prior updating leaderboard) score of the player
                let newPrevAddress1 = 'tmp' // the address in the mapping that points to the new (after updating leaderboard) score of the player
                let currentAddress1 = GUARD
                let nextAddress1
                let nextScore1
                
                let player1Score = await leaderboard.getScore(player1)
                for(let i=0; i<=leaderboardSize1; i++) {
                    nextAddress1 = await leaderboard.linkedLeaderboard(currentAddress1)
                    nextScore1 = await leaderboard.getScore(nextAddress1)
                    if(nextScore1 <= player1Score && newPrevAddress1 == 'tmp') {
                        newPrevAddress1 = currentAddress1
                    }
                    // continuously set oldPrevAddress1 to currentAddress1,
                    // if the player is new, at the end of the loop this will equal the last player in the leaderboard (which points to GUARD)
                    // if the player already exist, this loop will break before it gets updated
                    oldPrevAddress1 = currentAddress1;
                    if(nextAddress1 == player1) {
                        break
                    }
                    if(i == leaderboardSize1 && newPrevAddress1 == 'tmp') {
                        newPrevAddress1 = currentAddress1
                    }
                    currentAddress1 = nextAddress1
                }
                await leaderboard.updateLeaderboard(newPrevAddress1, oldPrevAddress1, {from: player1})

                // player3 solves 1 level, i.e. 100 points
                await leaderboard.registerLevel(testPlayer3Level1.address, 1, {from: player3})
                await testPlayer3Level1.completeLevel(42,{from: player3})
                await leaderboard.submitSolution(1, {from: player3})

                // find the address pointing to player1's new score and the address pointing to player1's old score (if any)
                let leaderboardSize3 = await leaderboard.listSize()
                // let leaderboard = []
                let oldPrevAddress3 // the address in the mapping that points to the current (prior updating leaderboard) score of the player
                let newPrevAddress3 = 'tmp' // the address in the mapping that points to the new (after updating leaderboard) score of the player
                let currentAddress3 = GUARD
                let nextAddress3
                let nextScore3
                
                let player3Score = await leaderboard.getScore(player3)
                for(let i=0; i<=leaderboardSize3; i++) {
                    nextAddress3 = await leaderboard.linkedLeaderboard(currentAddress3)
                    nextScore3 = await leaderboard.getScore(nextAddress3)
                    if(nextScore3 <= player3Score && newPrevAddress3 == 'tmp') {
                        newPrevAddress3 = currentAddress3
                    }
                    // continuously set oldPrevAddress3 to currentAddress3,
                    // if the player is new, at the end of the loop this will equal the last player in the leaderboard (which points to GUARD)
                    // if the player already exist, this loop will break before it gets updated
                    oldPrevAddress3 = currentAddress3;
                    if(nextAddress3 == player3) {
                        break
                    }
                    if(i == leaderboardSize3 && newPrevAddress3 == 'tmp') {
                        newPrevAddress3 = currentAddress3
                    }
                    currentAddress3 = nextAddress3
                }
                await leaderboard.updateLeaderboard(newPrevAddress3, oldPrevAddress3, {from: player3})

                // player2 solves first 2 levels, i.e. 300 points
                await leaderboard.registerLevel(testPlayer2Level1.address, 1, {from: player2})
                await leaderboard.registerLevel(testPlayer2Level2.address, 2, {from: player2})
                await testPlayer2Level1.completeLevel(42,{from: player2})
                await testPlayer2Level2.completeLevel(42,{from: player2})
                await leaderboard.submitSolution(1, {from: player2})
                await leaderboard.submitSolution(2, {from: player2})

                // find the address pointing to player1's new score and the address pointing to player1's old score (if any)
                let leaderboardSize2 = await leaderboard.listSize()
                // let leaderboard = []
                let oldPrevAddress2 // the address in the mapping that points to the current (prior updating leaderboard) score of the player
                let newPrevAddress2 = 'tmp' // the address in the mapping that points to the new (after updating leaderboard) score of the player
                let currentAddress2 = GUARD
                let nextAddress2
                let nextScore2
                
                let player2Score = await leaderboard.getScore(player2)
                for(let i=0; i<=leaderboardSize2; i++) {
                    nextAddress2 = await leaderboard.linkedLeaderboard(currentAddress2)
                    nextScore2 = await leaderboard.getScore(nextAddress2)
                    if(nextScore2 <= player2Score && newPrevAddress2 == 'tmp') {
                        newPrevAddress2 = currentAddress2
                    }
                    // continuously set oldPrevAddress2 to currentAddress2,
                    // if the player is new, at the end of the loop this will equal the last player in the leaderboard (which points to GUARD)
                    // if the player already exist, this loop will break before it gets updated
                    oldPrevAddress2 = currentAddress2;
                    if(nextAddress2 == player2) {
                        break
                    }
                    if(i == leaderboardSize2 && newPrevAddress2 == 'tmp') {
                        newPrevAddress2 = currentAddress2
                    }
                    currentAddress2 = nextAddress2
                }
                await leaderboard.updateLeaderboard(newPrevAddress2, oldPrevAddress2, {from: player2})

            })

            it('tracks the players points', async () => {
                let playa
                playa = await leaderboard.players(player1)
                playa['score'].toString().should.equal("600")
                playa = await leaderboard.players(player2)
                playa['score'].toString().should.equal("300")
                playa = await leaderboard.players(player3)
                playa['score'].toString().should.equal("100")
            })

            it('tracks the scoreboard sorting algorithm', async () => {
                let leaderboardSize = await leaderboard.listSize()
                // rank = await leaderboard.getRanking(0)
                // rank.should.equal(deployer)
                let currentPlayer = GUARD
                let nextPlayer
                for (var i=0; i<=leaderboardSize;i++) {
                    
                    nextPlayer = await leaderboard.linkedLeaderboard(currentPlayer)
                    console.log(i, currentPlayer, nextPlayer)
                    switch(i) {
                        case 1:
                            currentPlayer.should.equal(player1)
                            // console.log(i, currentPlayer)
                            break
                        case 2:
                            currentPlayer.should.equal(player2)
                            // console.log(i, currentPlayer)
                            break
                        case 3:
                            currentPlayer.should.equal(player3)
                            // console.log(i, currentPlayer)
                            break
                    }

                    currentPlayer = nextPlayer
                }

            })

        })

        describe('failure', () => {
            // TODO
        })
    })


});