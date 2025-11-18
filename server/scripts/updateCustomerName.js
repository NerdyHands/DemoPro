require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezpicra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateCustomerName = async () => {
  try {
    console.log('🔍 Testing customer name update...');
    
    // Get the existing customer
    const customer = await Customer.findOne({});
    if (!customer) {
      console.log('❌ No customer found in database');
      return;
    }
    
    console.log('👤 Current customer data:');
    console.log(`   - ID: ${customer._id}`);
    console.log(`   - Name: ${customer.firstName} ${customer.lastName}`);
    console.log(`   - Email: ${customer.email}`);
    
    // Update the customer name
    const newFirstName = 'Updated';
    const newLastName = 'Customer Name';
    
    console.log(`\n🔄 Updating customer name to: ${newFirstName} ${newLastName}`);
    
    customer.firstName = newFirstName;
    customer.lastName = newLastName;
    await customer.save();
    
    console.log('✅ Customer name updated successfully');
    
    // Get the updated customer
    const updatedCustomer = await Customer.findById(customer._id);
    console.log('👤 Updated customer data:');
    console.log(`   - ID: ${updatedCustomer._id}`);
    console.log(`   - Name: ${updatedCustomer.firstName} ${updatedCustomer.lastName}`);
    console.log(`   - Email: ${updatedCustomer.email}`);
    
    // Get all estimates with populated customer data
    const estimates = await Estimate.find().populate('customer', 'firstName lastName email customerId');
    console.log(`\n📊 Found ${estimates.length} estimates`);
    
    estimates.forEach((estimate, index) => {
      console.log(`📋 Estimate ${index + 1}:`);
      console.log(`   - ID: ${estimate._id}`);
      console.log(`   - Number: ${estimate.estimateNumber}`);
      console.log(`   - Title: ${estimate.title}`);
      console.log(`   - Customer Reference: ${estimate.customer}`);
      
      if (estimate.customer) {
        console.log(`   - Customer Name: ${estimate.customer.firstName} ${estimate.customer.lastName}`);
        console.log(`   - Customer Email: ${estimate.customer.email}`);
        console.log(`   - Customer customerId: ${estimate.customer.customerId}`);
      } else {
        console.log(`   - Customer: NULL (not populated)`);
      }
    });
    
    console.log('\n✅ Test completed. The estimate should now show the updated customer name.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

// Run the test
if (require.main === module) {
  connectDB().then(() => {
    updateCustomerName();
  });
}

module.exports = { updateCustomerName };
