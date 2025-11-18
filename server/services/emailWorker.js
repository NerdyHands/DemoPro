const emailService = require('./emailService');
const LandingPage = require('../models/LandingPage');

class EmailWorker {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  }

  // Start the worker
  start() {
    if (this.isRunning) {
      console.log('Email worker is already running');
      return;
    }

    if (!emailService.isEnabled) {
      console.log('Email service is disabled. Email worker will not start.');
      return;
    }

    console.log('Starting email worker...');
    this.isRunning = true;
    
    // Check immediately
    this.processPendingEmails();
    
    // Set up interval
    this.interval = setInterval(() => {
      this.processPendingEmails();
    }, this.checkInterval);
  }

  // Stop the worker
  stop() {
    if (!this.isRunning) {
      console.log('Email worker is not running');
      return;
    }

    console.log('Stopping email worker...');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Process pending welcome emails
  async processPendingEmails() {
    try {
      if (!emailService.isEnabled) {
        console.log('Email service is disabled. Skipping email processing.');
        return;
      }

      console.log('Processing pending welcome emails...');
      
      // Find users who haven't received welcome emails yet
      const pendingUsers = await LandingPage.find({
        welcomeEmailSent: { $ne: true },
        status: 'active',
        isSubscribed: true
      }).limit(10); // Process 10 at a time to avoid overwhelming

      if (pendingUsers.length === 0) {
        console.log('No pending welcome emails to process');
        return;
      }

      console.log(`Found ${pendingUsers.length} pending welcome emails`);

      // Process each user
      for (const user of pendingUsers) {
        try {
          console.log(`Processing welcome email for: ${user.email}`);
          
          const result = await emailService.sendWelcomeEmail({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          });

          if (result.success) {
            // Update user record
            user.welcomeEmailSent = true;
            user.welcomeEmailSentDate = new Date();
            user.emailSentCount = (user.emailSentCount || 0) + 1;
            user.lastEmailSent = new Date();
            await user.save();

            console.log(`Welcome email sent successfully to: ${user.email}`);
          } else {
            console.error(`Failed to send welcome email to ${user.email}:`, result.reason);
          }

          // Add delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`Error processing welcome email for ${user.email}:`, error);
        }
      }

      console.log('Email processing completed');

    } catch (error) {
      console.error('Error in email worker:', error);
    }
  }

  // Manually trigger email processing
  async triggerProcessing() {
    if (!this.isRunning) {
      console.log('Email worker is not running. Starting it first...');
      this.start();
      return;
    }

    console.log('Manually triggering email processing...');
    await this.processPendingEmails();
  }

  // Get worker status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isEnabled: emailService.isEnabled,
      lastCheck: this.lastCheck,
      checkInterval: this.checkInterval
    };
  }

  // Update check interval
  updateInterval(newInterval) {
    if (newInterval < 60000) { // Minimum 1 minute
      throw new Error('Check interval must be at least 1 minute');
    }

    this.checkInterval = newInterval;
    
    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
  }
}

// Create singleton instance
const emailWorker = new EmailWorker();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down email worker...');
  emailWorker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down email worker...');
  emailWorker.stop();
  process.exit(0);
});

module.exports = emailWorker;
