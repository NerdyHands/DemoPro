const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../utils/emailService');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes in milliseconds
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP with expiry
  storeOTP(email, otp, type) {
    const key = `${email}:${type}`;
    const expiry = Date.now() + this.otpExpiry;
    
    this.otpStore.set(key, {
      otp,
      expiry,
      attempts: 0,
      maxAttempts: 3
    });

    // Clean up expired OTPs
    this.cleanupExpiredOTPs();
  }

  // Verify OTP
  verifyOTP(email, otp, type) {
    const key = `${email}:${type}`;
    const storedData = this.otpStore.get(key);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiry) {
      this.otpStore.delete(key);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    // Check if max attempts exceeded
    if (storedData.attempts >= storedData.maxAttempts) {
      this.otpStore.delete(key);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Increment attempts
    storedData.attempts++;

    // Verify OTP
    if (storedData.otp === otp) {
      // OTP is valid - remove it from store
      this.otpStore.delete(key);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      // Update attempts in store
      this.otpStore.set(key, storedData);
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [key, data] of this.otpStore.entries()) {
      if (now > data.expiry) {
        this.otpStore.delete(key);
      }
    }
  }

  // Send OTP via email
  async sendOTP(email, type) {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      
      // Store OTP
      this.storeOTP(email, otp, type);
      
      // Send email
      const emailResult = await emailService.sendOTP(email, otp, type);
      
      if (emailResult.success) {
        return {
          success: true,
          message: 'OTP sent successfully',
          note: emailResult.note || null,
          // Include OTP in response for development mode
          ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP email',
          error: emailResult.error
        };
      }
    } catch (error) {
      console.error('❌ OTP sending failed:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      };
    }
  }

  // Get OTP from store (for development/debugging)
  getOTP(email, type) {
    const key = `${email}:${type}`;
    const storedData = this.otpStore.get(key);
    
    if (!storedData) {
      return null;
    }

    // Check if expired
    if (Date.now() > storedData.expiry) {
      this.otpStore.delete(key);
      return null;
    }

    return storedData.otp;
  }

  // Check if user exists (for login vs registration)
  async checkUserExists(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return {
        exists: !!user,
        user: user
      };
    } catch (error) {
      console.error('❌ Error checking user existence:', error);
      throw error;
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Rate limiting for OTP requests
  isRateLimited(email, type) {
    const key = `${email}:${type}:rate`;
    const now = Date.now();
    const rateLimitWindow = 60 * 1000; // 1 minute
    const maxRequests = 3; // Max 3 requests per minute

    const rateData = this.otpStore.get(key);
    
    if (!rateData) {
      this.otpStore.set(key, {
        count: 1,
        windowStart: now
      });
      return false;
    }

    // Reset window if expired
    if (now - rateData.windowStart > rateLimitWindow) {
      this.otpStore.set(key, {
        count: 1,
        windowStart: now
      });
      return false;
    }

    // Check if limit exceeded
    if (rateData.count >= maxRequests) {
      return true;
    }

    // Increment count
    rateData.count++;
    this.otpStore.set(key, rateData);
    return false;
  }
}

module.exports = new OTPService();
