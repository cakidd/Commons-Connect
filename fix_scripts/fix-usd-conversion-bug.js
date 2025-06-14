const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Diagnosing USD Conversion Calculation Bug");
  console.log("===========================================");

  const mountainShares = await ethers.getContractAt("MountainSharesEnhanced", "0x863a838aEbC0eDef0C4Bf6dEEB011561c93D9C0f");
  const [deployer] = await ethers.getSigners();

  // Check the conversion rate and balances
  const [phase, rate, desc, crisis, treasury] = await mountainShares.getCurrentPhaseInfo();
  const earnedBalance = await mountainShares.earnedMSBalance(deployer.address);
  
  console.log(`📊 Current MS Rate: ${rate} cents per MS`);
  console.log(`💎 Earned MS (wei): ${earnedBalance.toString()}`);
  console.log(`💎 Earned MS (ether): ${ethers.formatEther(earnedBalance)}`);

  // Manual calculation check
  const earnedMSInEther = Number(ethers.formatEther(earnedBalance));
  const rateInCents = Number(rate);
  const fiftyPercentMS = earnedMSInEther / 2;
  const expectedUSDCents = fiftyPercentMS * rateInCents;
  const expectedUSDDollars = expectedUSDCents / 100;

  console.log("\n🧮 Manual Calculation:");
  console.log(`   Earned MS: ${earnedMSInEther} MS`);
  console.log(`   50% for USD: ${fiftyPercentMS} MS`);
  console.log(`   Rate: ${rateInCents} cents per MS`);
  console.log(`   Expected USD (cents): ${expectedUSDCents}`);
  console.log(`   Expected USD (dollars): $${expectedUSDDollars.toFixed(2)}`);

  // Check what the contract is actually calculating
  const [crisisActive, eligible, earnedBalanceCheck, usdConversion, rebuildingMS] = await mountainShares.getCrisisStatus(deployer.address);
  
  console.log("\n📊 Contract Calculation:");
  console.log(`   Contract USD (raw): ${usdConversion.toString()}`);
  console.log(`   Contract USD (formatted): $${(Number(usdConversion) / 100).toFixed(2)}`);
  console.log(`   Contract Rebuilding MS: ${ethers.formatEther(rebuildingMS)}`);

  // The issue is likely in the contract's calculation
  // Let's see the exact values
  console.log("\n🔍 Debugging Values:");
  console.log(`   earnedBalance (BigInt): ${earnedBalance.toString()}`);
  console.log(`   50% calculation: ${(earnedBalance * BigInt(50)) / BigInt(100)}`);
  console.log(`   Rate: ${rate}`);
  
  // Calculate what the contract should be doing
  const fiftyPercentInWei = (earnedBalance * BigInt(50)) / BigInt(100);
  const correctUSDCents = (Number(ethers.formatEther(fiftyPercentInWei)) * rateInCents);
  
  console.log(`   50% MS in wei: ${fiftyPercentInWei.toString()}`);
  console.log(`   50% MS in ether: ${ethers.formatEther(fiftyPercentInWei)}`);
  console.log(`   Correct USD cents: ${correctUSDCents}`);
  console.log(`   Correct USD dollars: $${(correctUSDCents / 100).toFixed(2)}`);
}

main().catch(console.error);
