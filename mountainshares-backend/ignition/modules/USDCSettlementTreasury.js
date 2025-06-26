const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("USDCSettlementTreasury", (m) => {
  // Your existing governance contract address
  const governanceContract = "0x57fC62371582F9Ba976887658fd44AE86fa0298a";

  // Deploy the USDC Settlement Treasury contract with governance contract address as constructor argument
  const usdcSettlementTreasury = m.contract("USDCSettlementTreasury", [governanceContract]);

  return { usdcSettlementTreasury };
});
