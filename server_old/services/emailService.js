const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.isEnabled = process.env.SENDGRID_ENABLED === 'true';
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ezpicra.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'ezPICRA';
    this.adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@ezpicra.com';
    
    if (this.isEnabled && this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  async sendWelcomeEmail(userData) {
    if (!this.isEnabled) {
      console.log('Email service is disabled. Skipping welcome email for:', userData.email);
      return { success: false, reason: 'Email service disabled' };
    }

    if (!this.apiKey) {
      console.error('SendGrid API key not configured');
      return { success: false, reason: 'API key not configured' };
    }

    try {
      // Read the welcome email template
      const templatePath = path.join(__dirname, '../templates/welcome.html');
      let htmlContent = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      htmlContent = this.replacePlaceholders(htmlContent, userData);
      
      const msg = {
        to: userData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: 'Welcome to ezPICRA - Fast, Reliable PICRA Estimates & Repairs!',
        html: htmlContent,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true
          },
          openTracking: {
            enable: true
          }
        }
      };

      const response = await sgMail.send(msg);
      
      console.log('Welcome email sent successfully to:', userData.email);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: false,
        reason: error.message,
        error: error
      };
    }
  }

  replacePlaceholders(html, userData) {
    let content = html;
    
    // Replace user-specific placeholders
    if (userData.firstName) {
      content = content.replace(/Hi there,/g, `Hi ${userData.firstName},`);
    }
    
    // Replace unsubscribe link placeholder
    const unsubscribeLink = `${process.env.CLIENT_URL || 'https://app.ezpicra.com'}/unsubscribe?email=${encodeURIComponent(userData.email)}`;
    content = content.replace(/{unsubscribe_link}/g, unsubscribeLink);
    
    return content;
  }

  async sendBulkWelcomeEmails(users) {
    if (!this.isEnabled) {
      console.log('Email service is disabled. Skipping bulk welcome emails');
      return { success: false, reason: 'Email service disabled' };
    }

    const results = [];
    
    for (const user of users) {
      try {
        const result = await this.sendWelcomeEmail(user);
        results.push({
          email: user.email,
          ...result
        });
        
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          email: user.email,
          success: false,
          reason: error.message
        });
      }
    }
    
    return {
      total: users.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // Test method to verify email service configuration
  async testConnection() {
    if (!this.isEnabled) {
      return { success: false, reason: 'Email service disabled' };
    }

    if (!this.apiKey) {
      return { success: false, reason: 'API key not configured' };
    }

    try {
      // Test with a real email address (use the from email as recipient for testing)
      const msg = {
        to: this.fromEmail, // Send to ourselves for testing
        from: this.fromEmail,
        subject: 'Test Email - ezPICRA',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p>'
      };

      const response = await sgMail.send(msg);
      
      // Check if we got a successful response
      if (response && response[0] && response[0].statusCode === 202) {
        return { 
          success: true, 
          message: 'SendGrid connection successful',
          messageId: response[0].headers['x-message-id']
        };
      } else {
        return { success: false, reason: 'Unexpected response from SendGrid' };
      }
      
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        const errorMessage = error.response.body.errors[0].message;
        return { success: false, reason: errorMessage };
      }
      return { success: false, reason: error.message };
    }
  }

  async sendNewUserNotification(userData) {
    if (!this.isEnabled) {
      console.log('Email service is disabled. Skipping admin notification for:', userData.email);
      return { success: false, reason: 'Email service disabled' };
    }

    if (!this.apiKey) {
      console.error('SendGrid API key not configured');
      return { success: false, reason: 'API key not configured' };
    }

    try {
      const userType = userData.userType || userData.role || 'client';
      const registrationMethod = userData.isGoogleUser ? 'Google OAuth' : 'Email/OTP';
      const registrationDate = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #F58220 0%, #E6710D 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .alert-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .alert-box p {
      margin: 0;
      color: #856404;
      font-weight: 500;
    }
    .info-grid {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #495057;
      min-width: 160px;
    }
    .info-value {
      color: #212529;
      flex: 1;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-admin {
      background: #ffd700;
      color: #856404;
    }
    .badge-client {
      background: #d1ecf1;
      color: #0c5460;
    }
    .badge-google {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-email {
      background: #e3f2fd;
      color: #1565c0;
    }
    .action-buttons {
      margin: 30px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #F58220 0%, #E6710D 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 5px;
      transition: transform 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #6c757d;
    }
    .stats-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 20px 0;
    }
    .stats-box h3 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stats-number {
      font-size: 36px;
      font-weight: 700;
      color: #F58220;
      margin: 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      color: #6c757d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New User Registration</h1>
      <p>A new user has signed up for ezPICRA</p>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <p>⚡ Action may be required: Review and approve the new user account.</p>
      </div>

      <div class="info-grid">
        <div class="info-row">
          <div class="info-label">👤 Name:</div>
          <div class="info-value"><strong>${userData.firstName} ${userData.lastName}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">📧 Email:</div>
          <div class="info-value">${userData.email}</div>
        </div>
        <div class="info-row">
          <div class="info-label">🏢 Company:</div>
          <div class="info-value">${userData.company || 'Not provided'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">👥 User Type:</div>
          <div class="info-value">
            <span class="badge ${userType === 'admin' ? 'badge-admin' : 'badge-client'}">
              ${userType}
            </span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">🔐 Registration Method:</div>
          <div class="info-value">
            <span class="badge ${userData.isGoogleUser ? 'badge-google' : 'badge-email'}">
              ${registrationMethod}
            </span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">📅 Registration Date:</div>
          <div class="info-value">${registrationDate}</div>
        </div>
        ${userData.googleId ? `
        <div class="info-row">
          <div class="info-label">🆔 Google ID:</div>
          <div class="info-value">${userData.googleId}</div>
        </div>
        ` : ''}
      </div>

      <div class="action-buttons">
        <a href="${process.env.CLIENT_URL || 'https://app.ezpicra.com'}/admin" class="btn">
          View Admin Dashboard
        </a>
        <a href="${process.env.CLIENT_URL || 'https://app.ezpicra.com'}/admin/users" class="btn btn-secondary">
          Manage Users
        </a>
      </div>

      <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
        <strong>Next Steps:</strong><br>
        • Review the user's account details<br>
        • Verify the user's email and information<br>
        • Assign appropriate permissions if needed<br>
        • Welcome the user to ezPICRA
      </p>
    </div>

    <div class="footer">
      <p>This is an automated notification from ezPICRA</p>
      <p>© ${new Date().getFullYear()} ezPICRA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;

      const msg = {
        to: this.adminEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `🎉 New User Registration: ${userData.firstName} ${userData.lastName}`,
        html: htmlContent,
        text: `New User Registration\n\nName: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nCompany: ${userData.company || 'Not provided'}\nUser Type: ${userType}\nRegistration Method: ${registrationMethod}\nDate: ${registrationDate}`,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true
          },
          openTracking: {
            enable: true
          }
        }
      };

      const response = await sgMail.send(msg);
      
      console.log('Admin notification email sent successfully for new user:', userData.email);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return {
        success: false,
        reason: error.message,
        error: error
      };
    }
  }
}

module.exports = new EmailService();
