const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CompletePaymentProcessor", (m) => {
  // Deployed contract addresses
  const mountainSharesToken = "0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D";
  const governanceContract = "0x57fC62371582F9Ba976887658fd44AE86fa0298a";
  const settlementTreasury = "0x5574A3EcCFd6e9Af35F0B204f148D021be5b9C95";
  
  // Deploy the Complete Payment Processor
  const completePaymentProcessor = m.contract("CompleteUSDCPaymentProcessor", [
    mountainSharesToken,
    governanceContract,
    settlementTreasury
  ]);
  
  return { completePaymentProcessor };
});
