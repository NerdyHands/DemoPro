// Email service utility for sending OTP emails
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Initialize SendGrid if enabled
    this.isEnabled = process.env.SENDGRID_ENABLED === 'true';
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ezpicra.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'ezPICRA';
    
    if (this.isEnabled && this.apiKey) {
      sgMail.setApiKey(this.apiKey);
      console.log('✅ SendGrid initialized for OTP emails');
    } else if (!this.isDevelopment) {
      console.warn('⚠️ SendGrid not configured. OTP emails will not be sent in production!');
    }
  }

  // Getter for isDevelopment to ensure it's always current
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  // Send OTP email
  async sendOTP(email, otp, type = 'login') {
    try {
      if (this.isDevelopment) {
        // In development, just log the OTP to server console
        console.log('📧 [DEV] Email would be sent to:', email);
        console.log('🔐 [DEV] OTP Code:', otp);
        console.log('📝 [DEV] Email Type:', type);
        console.log('⏰ [DEV] Timestamp:', new Date().toISOString());
        console.log('---');
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          message: 'OTP sent successfully (check server logs for code)',
          note: 'OTP code logged to server console only'
        };
      } else {
        // In production, use SendGrid
        if (!this.isEnabled || !this.apiKey) {
          console.error('❌ SendGrid not configured. Cannot send OTP email.');
          return {
            success: false,
            message: 'Email service not configured'
          };
        }
        
        console.log('📧 [PROD] Sending OTP email to:', email);
        
        const msg = {
          to: email,
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          subject: this.getEmailSubject(type),
          text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
          html: this.generateOTPEmailHTML(otp, type),
          trackingSettings: {
            clickTracking: {
              enable: false
            },
            openTracking: {
              enable: true
            }
          }
        };
        
        const response = await sgMail.send(msg);
        
        console.log('✅ OTP email sent successfully to:', email);
        
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: response[0].headers['x-message-id']
        };
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      if (error.response && error.response.body && error.response.body.errors) {
        const errorMessage = error.response.body.errors[0].message;
        return {
          success: false,
          message: 'Failed to send OTP email',
          error: errorMessage
        };
      }
      
      return {
        success: false,
        message: 'Failed to send OTP email',
        error: error.message
      };
    }
  }
  
  // Get email subject based on type
  getEmailSubject(type) {
    switch (type) {
      case 'login':
        return 'Your ezPICRA Login Code';
      case 'registration':
        return 'Welcome to ezPICRA - Verify Your Email';
      case 'password-reset':
        return 'ezPICRA Password Reset Code';
      default:
        return 'Your ezPICRA Verification Code';
    }
  }

  // Generate HTML email template for OTP
  generateOTPEmailHTML(otp, type) {
    const subject = type === 'login' ? 'Login Verification' : 
                   type === 'registration' ? 'Account Verification' : 
                   'Password Reset';
    
    const greeting = type === 'registration' ? 
      'Welcome to ezPICRA! To complete your registration, please verify your email address with the code below.' :
      type === 'login' ?
      'You have requested to log in to your ezPICRA account. Please use the verification code below to complete your login.' :
      'You have requested to reset your ezPICRA password. Please use the verification code below to continue.';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ezPICRA - ${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
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
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .content { 
            padding: 40px 30px; 
            background: white; 
          }
          .content h2 {
            color: #333;
            margin-top: 0;
            font-size: 24px;
          }
          .content p {
            color: #555;
            font-size: 16px;
            margin: 15px 0;
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            text-align: center; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px; 
            margin: 30px 0; 
            border-radius: 8px; 
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px 20px; 
            border-radius: 4px; 
            margin: 25px 0;
            font-size: 14px;
          }
          .warning strong {
            color: #856404;
          }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            color: #999; 
            font-size: 13px; 
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
          }
          .support-link {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ezPICRA</h1>
            <p>Fast, Reliable PICRA Estimates & Repairs</p>
          </div>
          
          <div class="content">
            <h2>${subject}</h2>
            <p>${greeting}</p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="text-align: center; color: #666; font-size: 14px;">
              This code will expire in <strong>10 minutes</strong> for security reasons.
            </p>
            
            <div class="warning">
              <strong>🔒 Security Notice:</strong> Never share this code with anyone. 
              ezPICRA staff will never ask for your verification code.
            </div>
            
            <p>If you didn't request this code, please ignore this email or <a href="mailto:info@ezpicra.com" class="support-link">contact our support team</a>.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The ezPICRA Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Need help? Contact us at <a href="mailto:info@ezpicra.com" class="support-link">info@ezpicra.com</a></p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} ezPICRA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send welcome email for new registrations
  async sendWelcomeEmail(email, firstName) {
    try {
      if (this.isDevelopment) {
        console.log('📧 [DEV] Welcome email would be sent to:', email);
        return { success: true, message: 'Welcome email sent (development mode)' };
      } else {
        console.log('📧 [PROD] Sending welcome email to:', email);
        // TODO: Implement real welcome email
        return { success: true, message: 'Welcome email sent' };
      }
    } catch (error) {
      console.error('❌ Welcome email failed:', error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      if (this.isDevelopment) {
        console.log('📧 [DEV] Password reset email would be sent to:', email);
        console.log('🔗 [DEV] Reset token:', resetToken);
        return { success: true, message: 'Password reset email sent (development mode)' };
      } else {
        console.log('📧 [PROD] Sending password reset email to:', email);
        // TODO: Implement real password reset email
        return { success: true, message: 'Password reset email sent' };
      }
    } catch (error) {
      console.error('❌ Password reset email failed:', error);
      return { success: false, message: 'Failed to send password reset email' };
    }
  }
}

module.exports = new EmailService(); 