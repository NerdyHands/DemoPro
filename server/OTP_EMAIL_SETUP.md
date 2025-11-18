# OTP Email Setup with SendGrid

This guide explains how to configure SendGrid for sending OTP (One-Time Password) verification emails in production.

## Overview

The ezPICRA application uses SendGrid to send OTP verification codes for:
- User login
- User registration
- Password reset

In **development mode**, OTP codes are logged to the server console.
In **production mode**, OTP codes are sent via email using SendGrid.

## Prerequisites

1. A SendGrid account (free tier available)
2. A verified sender email address
3. SendGrid API key

## Setup Instructions

### 1. Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com) and sign up for a free account
2. Verify your email address
3. Complete the account setup wizard

### 2. Verify Your Sender Email

SendGrid requires you to verify the email address you'll use as the sender:

1. In the SendGrid dashboard, go to **Settings** > **Sender Authentication**
2. Choose **Single Sender Verification**
3. Fill in your details:
   - From Name: `ezPICRA`
   - From Email Address: `noreply@ezpicra.com` (or your preferred email)
   - Reply To: Your support email (e.g., `info@ezpicra.com`)
4. Check your email and click the verification link
5. Wait for verification approval (usually instant)

**Note:** For production, consider setting up **Domain Authentication** for better deliverability.

### 3. Generate API Key

1. In the SendGrid dashboard, go to **Settings** > **API Keys**
2. Click **Create API Key**
3. Choose a name (e.g., "ezPICRA OTP Emails")
4. Select **Restricted Access**
5. Enable only the following permission:
   - **Mail Send** > **Mail Send** (Full Access)
6. Click **Create & View**
7. **IMPORTANT:** Copy the API key immediately (it won't be shown again)

### 4. Configure Environment Variables

Add the following to your `.env` file (or environment configuration):

```bash
# SendGrid Configuration
SENDGRID_ENABLED=true
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@ezpicra.com
SENDGRID_FROM_NAME=ezPICRA
```

**Environment Variables Explained:**
- `SENDGRID_ENABLED`: Set to `true` to enable SendGrid (use `false` for development)
- `SENDGRID_API_KEY`: Your SendGrid API key (starts with `SG.`)
- `SENDGRID_FROM_EMAIL`: The verified sender email address
- `SENDGRID_FROM_NAME`: The name that appears in the "From" field

### 5. Test the Configuration

You can test the OTP email functionality using the test script:

```bash
# Navigate to the server directory
cd server

# Run the OTP email test
node test-otp-email.js
```

Or test manually by:
1. Starting your server
2. Attempting to log in or register
3. Checking if the OTP email is received

## Email Template

The OTP emails include:

- **Subject Line:** Dynamic based on type (Login, Registration, or Password Reset)
- **Beautiful HTML Design:** Professional gradient header with ezPICRA branding
- **Large OTP Code:** Easy-to-read 6-digit code in monospace font
- **Security Warning:** Reminder not to share the code
- **Expiration Notice:** Code expires in 10 minutes
- **Support Contact:** Link to contact support if needed

### Example Email Subjects:
- Login: "Your ezPICRA Login Code"
- Registration: "Welcome to ezPICRA - Verify Your Email"
- Password Reset: "ezPICRA Password Reset Code"

## Production Checklist

Before deploying to production:

- [ ] SendGrid account created and verified
- [ ] Sender email address verified in SendGrid
- [ ] API key generated with Mail Send permissions
- [ ] Environment variables configured in production environment
- [ ] `SENDGRID_ENABLED=true` in production `.env`
- [ ] Test OTP sending from production environment
- [ ] Monitor SendGrid dashboard for delivery statistics
- [ ] Set up alerts for bounced/failed emails

## Monitoring

### SendGrid Dashboard

Monitor email delivery in the SendGrid dashboard:
1. Go to **Email Activity** to see all sent emails
2. Check delivery status, opens, and any issues
3. Review bounce rates and spam reports

### Server Logs

The server logs include:
- ✅ Successful email sends with message ID
- ❌ Failed email sends with error details
- 📧 Email sending attempts

Example logs:
```
✅ SendGrid initialized for OTP emails
📧 [PROD] Sending OTP email to: user@example.com
✅ OTP email sent successfully to: user@example.com
```

## Troubleshooting

### Common Issues

#### 1. "Email service not configured" Error

**Cause:** SendGrid is not enabled or API key is missing

**Solution:**
```bash
# Verify environment variables are set
SENDGRID_ENABLED=true
SENDGRID_API_KEY=SG.your_key_here
```

#### 2. Emails Not Being Received

**Possible Causes:**
- Sender email not verified in SendGrid
- Email in recipient's spam folder
- Invalid API key
- SendGrid account suspended

**Solutions:**
- Check SendGrid Email Activity dashboard
- Verify sender authentication in SendGrid
- Check spam/junk folder
- Verify API key is correct and active

#### 3. "401 Unauthorized" Error

**Cause:** Invalid or expired API key

**Solution:**
- Generate a new API key in SendGrid
- Update `SENDGRID_API_KEY` in your `.env`
- Restart the server

#### 4. High Bounce Rate

**Cause:** Invalid recipient email addresses

**Solution:**
- Validate email addresses before sending
- Clean up bounce list in SendGrid dashboard
- Consider implementing email verification on signup

## Development vs Production

### Development Mode
- `NODE_ENV=development`
- `SENDGRID_ENABLED=false` (optional)
- OTP codes logged to console
- No actual emails sent
- OTP code returned in API response

### Production Mode
- `NODE_ENV=production`
- `SENDGRID_ENABLED=true`
- OTP codes sent via email
- Secure delivery through SendGrid
- OTP code NOT returned in API response

## Security Best Practices

1. **API Key Security:**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate API keys periodically
   - Use restricted access keys (Mail Send only)

2. **Email Security:**
   - Use HTTPS for all API requests
   - Implement rate limiting on OTP requests
   - Log all OTP send attempts
   - Monitor for unusual patterns

3. **SendGrid Security:**
   - Enable 2FA on SendGrid account
   - Regularly review Email Activity logs
   - Set up alerts for suspicious activity
   - Use domain authentication for better security

## Rate Limits

**SendGrid Free Tier:**
- 100 emails per day
- Sufficient for testing and small deployments

**Paid Plans:**
- Start at $19.95/month for 50,000 emails
- Better deliverability and support
- Advanced features (templates, analytics, etc.)

## Support

For SendGrid-related issues:
- [SendGrid Documentation](https://docs.sendgrid.com)
- [SendGrid Support](https://support.sendgrid.com)

For ezPICRA-specific issues:
- Check server logs
- Review this documentation
- Contact development team

## Additional Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [Sender Authentication Guide](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

