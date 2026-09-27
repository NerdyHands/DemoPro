const mongoose = require('mongoose');
const Contract = require('../models/Contract');
require('dotenv').config();

async function fixContractAddresses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezpicra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 Connected to MongoDB');
    
    // Find all contracts
    const contracts = await Contract.find({});
    console.log(`📋 Found ${contracts.length} contracts to check`);
    
    let updatedCount = 0;
    
    for (const contract of contracts) {
      let needsUpdate = false;
      let newAddress = contract.clientAddress;
      
      // Check if address is a JSON string that needs parsing
      if (typeof contract.clientAddress === 'string' && contract.clientAddress.startsWith('{')) {
        try {
          const parsedAddress = JSON.parse(contract.clientAddress);
          if (parsedAddress.full) {
            newAddress = parsedAddress.full;
            needsUpdate = true;
            console.log(`🔧 Contract ${contract.contractNumber}: Fixed address from "${contract.clientAddress}" to "${newAddress}"`);
          }
        } catch (e) {
          // Try to extract the address using regex if JSON parsing fails
          const fullMatch = contract.clientAddress.match(/full:\s*'([^']+)'/);
          if (fullMatch) {
            newAddress = fullMatch[1];
            needsUpdate = true;
            console.log(`🔧 Contract ${contract.contractNumber}: Fixed address from "${contract.clientAddress}" to "${newAddress}" (regex extraction)`);
          } else {
            console.log(`⚠️ Contract ${contract.contractNumber}: Could not parse address "${contract.clientAddress}"`);
          }
        }
      }
      
      // Check if address is an object that needs extracting
      if (typeof contract.clientAddress === 'object' && contract.clientAddress !== null) {
        if (contract.clientAddress.full) {
          newAddress = contract.clientAddress.full;
          needsUpdate = true;
          console.log(`🔧 Contract ${contract.contractNumber}: Fixed address from object to "${newAddress}"`);
        }
      }
      
      // Update the contract if needed
      if (needsUpdate) {
        await Contract.findByIdAndUpdate(contract._id, {
          clientAddress: newAddress
        });
        updatedCount++;
      }
    }
    
    console.log(`✅ Migration complete! Updated ${updatedCount} contracts`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  fixContractAddresses();
}

module.exports = fixContractAddresses;
