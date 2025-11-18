const mongoose = require('mongoose');
const Counter = require('../models/Counter');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezpicra');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize counters
const initCounters = async () => {
  try {
    console.log('🔧 Initializing counters...');
    
    // Initialize estimate counter
    const estimateCounter = await Counter.findOneAndUpdate(
      { name: 'estimates' },
      { 
        name: 'estimates',
        sequence: 0,
        prefix: '',
        format: '0000'
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Estimate counter initialized:', estimateCounter);
    
    console.log('🎉 All counters initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing counters:', error);
  }
};

// Run initialization
const run = async () => {
  await connectDB();
  await initCounters();
  process.exit(0);
};

run();
