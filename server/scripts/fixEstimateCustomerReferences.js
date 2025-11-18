require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('🔌 Using URI:', process.env.MONGODB_URI ? 'Remote MongoDB' : 'Local MongoDB');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezpicra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixEstimateCustomerReferences = async () => {
  try {
    console.log('🔧 Starting estimate customer reference fix...');
    
    // Find all estimates
    console.log('🔍 Fetching all estimates from database...');
    const estimates = await Estimate.find({});
    console.log(`📊 Found ${estimates.length} estimates to process`);
    
    if (estimates.length === 0) {
      console.log('ℹ️ No estimates found in database. Migration complete.');
      return;
    }
    
    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const estimate of estimates) {
      try {
        console.log(`\n🔍 Processing estimate: ${estimate.estimateNumber || estimate._id}`);
        console.log(`   - Has customerId: ${!!estimate.customerId}`);
        console.log(`   - Has customer: ${!!estimate.customer}`);
        console.log(`   - customerId value: ${estimate.customerId}`);
        console.log(`   - customer value: ${estimate.customer}`);
        
        // Check if estimate has the old customerId field but no proper customer reference
        if (estimate.customerId && !estimate.customer) {
          console.log(`   🔧 Estimate needs fixing - has customerId but no customer reference`);
          
          // Try to find customer by customerId string
          let customer = await Customer.findOne({ customerId: estimate.customerId });
          
          if (!customer) {
            console.log(`   🔍 Customer not found by customerId: ${estimate.customerId}`);
            // If not found by customerId, try to find by _id if customerId looks like an ObjectId
            if (mongoose.Types.ObjectId.isValid(estimate.customerId)) {
              console.log(`   🔍 Trying to find customer by ObjectId: ${estimate.customerId}`);
              customer = await Customer.findById(estimate.customerId);
            }
          }
          
          if (customer) {
            console.log(`   ✅ Found customer: ${customer.firstName} ${customer.lastName} (${customer._id})`);
            // Update the estimate to use the proper customer reference
            estimate.customer = customer._id;
            estimate.customerId = undefined; // Remove the old field
            await estimate.save();
            
            console.log(`   ✅ Fixed estimate ${estimate.estimateNumber} - now references customer: ${customer.firstName} ${customer.lastName}`);
            fixedCount++;
          } else {
            console.log(`   ⚠️ Could not find customer for estimate ${estimate.estimateNumber} with customerId: ${estimate.customerId}`);
            errorCount++;
          }
        } else if (estimate.customer && !estimate.customerId) {
          // This estimate is already properly structured
          console.log(`   ✅ Estimate already has proper customer reference`);
          skippedCount++;
        } else if (estimate.customerId && estimate.customer) {
          console.log(`   ⚠️ Estimate has both customerId and customer - this is unexpected`);
          errorCount++;
        } else {
          console.log(`   ⚠️ Estimate has neither customerId nor customer - this is invalid`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing estimate ${estimate.estimateNumber || estimate._id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Fixed: ${fixedCount} estimates`);
    console.log(`⏭️ Skipped (already correct): ${skippedCount} estimates`);
    console.log(`❌ Errors: ${errorCount} estimates`);
    console.log(`📊 Total processed: ${estimates.length} estimates`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

// Run the migration
if (require.main === module) {
  connectDB().then(() => {
    fixEstimateCustomerReferences();
  });
}

module.exports = { fixEstimateCustomerReferences };
