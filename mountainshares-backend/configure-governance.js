const { inspectGovernanceContract, configureGovernanceDistribution } = require('./contract-inspector');

async function setupGovernance() {
    console.log('🏛️ HARMONY FOR HOPE GOVERNANCE CONFIGURATION');
    console.log('===========================================');
    
    // First inspect the current state
    await inspectGovernanceContract();
    
    console.log('\n⚙️ Configuring distribution...');
    const result = await configureGovernanceDistribution();
    
    if (result.success) {
        console.log('🎉 SUCCESS! All 5 wallets now configured for fee distribution');
        console.log('💰 Next purchase will distribute to all governance wallets');
    } else {
        console.log('❌ Auto-configuration failed. Manual setup needed.');
        console.log('🌐 Go to: https://arbiscan.io/address/0x76ff8359879a8d1e456538b5cd6075a12025e88f#writeContract');
    }
}

setupGovernance();
