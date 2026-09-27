const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  },
  prefix: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: '0000'
  }
}, {
  timestamps: true,
  collection: 'counters'
});

// Static method to get next sequence number
counterSchema.statics.getNextSequence = async function(name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence;
};

// Static method to generate formatted number
counterSchema.statics.generateNumber = async function(name, prefix = '', format = '0000') {
  const sequence = await this.getNextSequence(name);
  const formattedSequence = String(sequence).padStart(format.length, '0');
  return `${prefix}${formattedSequence}`;
};

module.exports = mongoose.model('Counter', counterSchema);
