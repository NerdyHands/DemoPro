const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['login', 'registration', 'password-reset'],
    default: 'login'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Index for better query performance
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && 
         this.attempts < 5 && 
         this.expiresAt > new Date();
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Static method to generate OTP - generates random 6-digit code
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP for email
otpSchema.statics.createForEmail = async function(email, type = 'login') {
  try {
    // Invalidate any existing OTPs for this email and type
    await this.updateMany(
      { email, type, isUsed: false },
      { isUsed: true }
    );
    
    const otp = this.generateOTP();
    const otpDoc = new this({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    const savedOTP = await otpDoc.save();
    
    // Log OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(50));
      console.log('🔐 [DEV] OTP CREATED SUCCESSFULLY');
      console.log('📧 Email:', email);
      console.log('🔢 OTP Code:', otp);
      console.log('📝 Type:', type);
      console.log('⏰ Expires:', savedOTP.expiresAt.toLocaleString());
      console.log('🆔 OTP ID:', savedOTP._id);
      console.log('='.repeat(50) + '\n');
    }
    
    return savedOTP;
  } catch (error) {
    console.error('❌ Error creating OTP:', error);
    throw error;
  }
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type = 'login') {
  try {
    const otpDoc = await this.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 5 }
    });
    
    if (!otpDoc) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }
    
    if (otpDoc.otp !== otp) {
      await otpDoc.incrementAttempts();
      return { valid: false, message: 'Invalid OTP' };
    }
    
    await otpDoc.markAsUsed();
    return { valid: true, otpDoc };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    throw error;
  }
};

module.exports = mongoose.model('OTP', otpSchema); 