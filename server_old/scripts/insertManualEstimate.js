const path = require('path');
const mongoose = require('mongoose');

// Ensure we can resolve project-local modules
process.chdir(path.join(__dirname, '..'));

// Load environment configuration (defaults to .env in server directory)
require('dotenv').config();

const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');
const { generateEstimateNumber } = require('../utils/documentNumbers');

/**
 * Helper to build the payload we want to insert.
 * Update this object if a new manual estimate needs to be added.
 */
const estimatePayload = {
  customer: '691316c43a15a7ab1beef6f8',
  title: 'Estimate for Chante Nichols',
  description: '',
  clientAddress: '403 W. Constance Road Suffolk VA',
  propertyAddress: '',
  notes: '',
  status: 'Draft',
  validUntil: '2025-11-21T12:00:00.000Z',
  lineItems: [
    {
      description: '-There is evidence of a current leak noted on the underside of the roof decking or rafters. Review and correction by a Qualified Licensed Roofing Contractor. (Located at rear right plumbing vent - Wet stain ceiling below) in left rear bedroom over closet. Lifted Shingles/Exposed Nails were located at one or more areas of the roof. To help prevent leaks and subsequent water damage to the underlying materials we recommend the application of proper sealants to needed areas and/or small defects by a Qualified Roofing Contractor. Replace plumbing vent and reseal lifted shingles. ',
      quantity: 1,
      unitPrice: 850,
      totalPrice: 850
    },
    {
      description: '-Bathroom faucet loose, low pressure - Replace with new faucet ',
      quantity: 1,
      unitPrice: 400,
      totalPrice: 400
    },
    {
      description: '-Dishwasher and Sink and Drain Lines: The kitchen sink drain line needs attention as it drains slowly. There may be some blockage either in the fixture or the drain line. We recommend further evaluation and correction by a Qualified Licensed Plumber prior to final walkthrough. (Both sinks drain slowly / Also sink almost overflowed when dishwasher discharged',
      quantity: 1,
      unitPrice: 450,
      totalPrice: 450
    },
    {
      description: '-Range Hood and Microwave not working - Replace range microwave hood with new similar unit',
      quantity: 1,
      unitPrice: 500,
      totalPrice: 500
    },
    {
      description: '-Bathroom Vent Some portion of the visible plumbing vent stack needs repair or replacement. The bathroom vent is improperly connected to roof vent & is leaking. We recommend further evaluation and correction by a Qualified Licensed Plumber prior to final walkthrough',
      quantity: 1,
      unitPrice: 450,
      totalPrice: 450
    },
    {
      description: '-The main service ground wire was not located, or the inspector was unable to verify it was intact. Further investigation is needed to verify its existence. A licensed electrician should be called to re-establish all proper grounding to the house. Grounds and neutrals were noted to be sharing the same bus bar in the sub panel. This is an improper connection and can present a potential electrical shock hazard. Other repairs to breaker box noted.\nOutlets in laundry room not working. GFCI outlet not working in bathroom.',
      quantity: 1,
      unitPrice: 950,
      totalPrice: 950
    }
  ]
};

async function createEstimateNumber(payload, customer) {
  return generateEstimateNumber(Estimate, {
    propertyAddress: payload.propertyAddress,
    clientAddress: payload.clientAddress,
    customer,
    title: payload.title,
  });
}

async function insertEstimate() {
  const { customer: customerId, title } = estimatePayload;

  console.log('🔍 Checking for customer', customerId);
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error(`Customer ${customerId} not found. Cannot create estimate.`);
  }

  console.log('🔍 Looking for existing estimate with same title and customer…');
  const existingEstimate = await Estimate.findOne({
    customer: customerId,
    title
  });

  if (existingEstimate) {
    console.log('ℹ️ Estimate already exists:', existingEstimate.estimateNumber);
    return existingEstimate;
  }

  const estimateNumber = await createEstimateNumber(estimatePayload, customer);
  console.log('🆕 Generated estimate number', estimateNumber);

  const estimateData = {
    ...estimatePayload,
    estimateNumber,
    validUntil: estimatePayload.validUntil
      ? new Date(estimatePayload.validUntil)
      : undefined,
    source: 'manual'
  };

  const estimate = new Estimate(estimateData);
  const saved = await estimate.save();
  await saved.populate('customer', 'firstName lastName email');

  console.log('✅ Estimate inserted successfully');
  console.log(JSON.stringify({
    id: saved._id,
    estimateNumber: saved.estimateNumber,
    totalAmount: saved.totalAmount,
    customer: saved.customer
  }, null, 2));

  return saved;
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured. Please check your environment.');
  }

  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000
  });

  try {
    await insertEstimate();
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main().catch(error => {
  console.error('❌ Failed to insert estimate');
  console.error(error);
  process.exit(1);
});


