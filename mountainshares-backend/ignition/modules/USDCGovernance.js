const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("USDCGovernanceModule", (m) => {
  // MountainShares token address
  const mountainSharesToken = "0xE8A9c6fFE6b2344147D886EcB8608C5F7863B20D";
  
  // Deploy the USDC Governance contract
  const usdcGovernance = m.contract("USDCGovernanceFeeDistributor", [mountainSharesToken]);
  
  return { usdcGovernance };
});
