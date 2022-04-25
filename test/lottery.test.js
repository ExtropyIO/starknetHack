var Lottery = artifacts.require("./Lottery.sol");
// const { ether } = require('../helpers/utils');
var instance;

const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Lottery', ([deployer, account1]) => {

    it("should initialise lottery", function() {
        return Lottery.deployed().then(function(instance) {
            return instance.initialiseLottery.sendTransaction(4); // initialize with seed 4
        });
    });

    it("should register team", function() {
        return Lottery.deployed().then(function(instance1) {
            instance = instance1;
            return instance.initialiseLottery.sendTransaction(4);
        }).then(function(TxID) {
            // console.log(TxID);
            return instance.registerTeam(deployer, "Team Rocket", "Password01", {from: deployer, value: ether(2)});
        }).then(function(response) {
            var registered = false;
            for (var i = 0; i < response.logs.length; i++) {
                var log = response.logs[i];
                if (log.event == "LogTeamRegistered") {
                    registered = true;
                }
            }
            assert.ok(registered);
        });
    });

    it("should get team count", function() {
        return Lottery.deployed().then(function(instance1) {
            instance = instance1;
            return instance.initialiseLottery.sendTransaction(4);
        }).then(function(TxID) {
            // console.log(TxID);
            return instance.getTeamCount.call();
        }).then(function(result) {
            assert.equal(1, result.toNumber());
        })
    });

    it("should get team name", function() {
        return Lottery.deployed().then(function(instance1) {
          instance = instance1;
          return instance.initialiseLottery.sendTransaction(4);
        }).then(function(TxID) {
            // console.log(TxID);
            return instance.getTeamDetails.call(0);
        }).then(function(result) {
            assert.equal("Default Team", result[0]); // team name
        })
    });

    it("should get team address", function() {
        return Lottery.deployed().then(function(instance1) {
          instance = instance1;
          return instance.initialiseLottery.sendTransaction(4);
        }).then(function(TxID) {
            // console.log(TxID);
            return instance.getTeamDetails.call(0);
        }).then(function(result) {
          assert.equal("0x0000000000000000000000000000000000000000", result[1]); // team address
        })
    });

    it("should get team score", function() {
        return Lottery.deployed().then(function(instance1) {
          instance = instance1;
          return instance.initialiseLottery.sendTransaction(4);
        }).then(function(TxID) {
            // console.log(TxID);
            return instance.getTeamDetails.call(0);
        }).then(function(result) {
            assert.equal(5, result[2].toNumber()); // team points
        })
    });


});
