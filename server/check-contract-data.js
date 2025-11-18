/**
 * Check what's actually stored in the contract
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

async function checkContract() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    const Contract = mongoose.model('Contract', new mongoose.Schema({}, { strict: false }));
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));

    const contractId = '68e71efbb1e19858f6347724';
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      console.error('❌ Contract not found!');
      process.exit(1);
    }

    console.log('\n📋 CONTRACT DATA:');
    console.log('   Contract #:', contract.contractNumber);
    console.log('   Customer Name:', contract.clientName || contract.customerName);
    console.log('   propertyAddress:', JSON.stringify(contract.propertyAddress));
    console.log('   clientAddress:', JSON.stringify(contract.clientAddress));
    console.log('   customerAddress:', JSON.stringify(contract.customerAddress));

    // Check customer data
    if (contract.customerId || contract.customer) {
      const customerId = contract.customerId || contract.customer;
      const customer = await Customer.findById(customerId);
      
      if (customer) {
        console.log('\n👤 CUSTOMER DATA:');
        console.log('   Customer Name:', customer.firstName, customer.lastName);
        console.log('   customer.address:', JSON.stringify(customer.address));
      }
    }

    console.log('\n🔍 FALLBACK CHAIN (what PDF uses):');
    const propertyAddress = contract.propertyAddress || contract.customerId?.address || contract.clientAddress || contract.customerAddress || 'N/A';
    console.log('   Result:', propertyAddress);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected');
  }
}

checkContract();

