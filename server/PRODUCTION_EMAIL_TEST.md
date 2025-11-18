# Production OTP Email Test - Quick Guide

## Overview

This test verifies that SendGrid OTP emails are working correctly in your production environment by sending a test email to davis.t.wayne@gmail.com.

## Prerequisites

Before running the test, ensure:

1. ✅ SendGrid account is set up
2. ✅ Sender email (noreply@ezpicra.com) is verified in SendGrid
3. ✅ SendGrid API key is generated
4. ✅ Environment variables are configured in `.env`

## Required Environment Variables

Make sure your `.env.production` file has these variables set:

```bash
NODE_ENV=production
SENDGRID_ENABLED=true
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@ezpicra.com
SENDGRID_FROM_NAME=ezPICRA
```

## Running the Test

### Simple Command

```bash
cd server
node test-otp-production.js
```

**Note:** This script is hard-coded to always use `.env.production` file.

### Alternative: Make it executable (Linux/Mac)

```bash
chmod +x server/test-otp-production.js
./server/test-otp-production.js
```

## What the Test Does

1. **Validates Configuration**
   - Checks if SendGrid is enabled
   - Verifies API key is present
   - Confirms sender email is configured

2. **Sends Test Email**
   - Sends a registration OTP email to davis.t.wayne@gmail.com
   - Uses OTP code: 123456
   - Includes full email template with branding

3. **Reports Results**
   - Shows success/failure status
   - Displays message ID (if successful)
   - Provides troubleshooting steps (if failed)

## Expected Output

### Success Output:

```
📁 Loading environment from: .env.production

======================================================================
    ezPICRA Production OTP Email Test
======================================================================
    Using: .env.production
======================================================================

📋 Current Configuration:
   Environment: production
   SendGrid Enabled: true
   SendGrid API Key: ✅ Configured
   From Email: noreply@ezpicra.com
   From Name: ezPICRA

✅ Configuration looks good!

📧 Sending Test Email:
   Recipient: davis.t.wayne@gmail.com
   OTP Type: Registration (Welcome)
   Test OTP: 123456

⏳ Sending email via SendGrid...

======================================================================
✅ SUCCESS! Email sent successfully
======================================================================

📨 Message ID: [SendGrid Message ID]

📬 Check your inbox:
   Email: davis.t.wayne@gmail.com
   Subject: "Welcome to ezPICRA - Verify Your Email"
   ⚠️  Don't forget to check your spam/junk folder!

📊 What to verify in the email:
   ✓ Professional ezPICRA branding
   ✓ Large, readable OTP code (123456)
   ✓ Security warning message
   ✓ 10-minute expiration notice
   ✓ Contact support link
   ✓ Mobile-responsive design

======================================================================
    Test Summary
======================================================================

✅ Production OTP email test PASSED

📝 Next steps:
   1. Check email inbox for the test message
   2. Verify email formatting and content
   3. Check SendGrid dashboard for delivery stats
   4. If everything looks good, your system is ready!
```

## What to Check in the Email

When you receive the test email, verify:

1. **Sender Information**
   - From: ezPICRA <noreply@ezpicra.com>
   - Subject: "Welcome to ezPICRA - Verify Your Email"

2. **Email Content**
   - Professional gradient header (purple/blue)
   - ezPICRA logo and tagline
   - Large OTP code: **123456**
   - Security warning with lock emoji
   - 10-minute expiration notice
   - Support contact link
   - Footer with copyright

3. **Design Quality**
   - Responsive design (test on mobile)
   - Colors and fonts look professional
   - All images/icons display correctly
   - Links work properly

## Troubleshooting

### Issue: "SendGrid is not enabled"

**Solution:**
```bash
# In your .env file:
SENDGRID_ENABLED=true
```

### Issue: "SendGrid API key is not configured"

**Solution:**
1. Log in to SendGrid dashboard
2. Go to Settings > API Keys
3. Create new API key with Mail Send permissions
4. Copy the key and add to .env:
```bash
SENDGRID_API_KEY=SG.your_key_here
```

### Issue: "401 Unauthorized" error

**Cause:** Invalid or expired API key

**Solution:**
1. Generate a new API key in SendGrid
2. Update SENDGRID_API_KEY in .env
3. Restart the server
4. Run test again

### Issue: Email not received

**Check:**
1. Spam/junk folder
2. SendGrid dashboard Email Activity
3. Sender email verification status
4. SendGrid account status (not suspended)

### Issue: "Sender email not verified"

**Solution:**
1. Go to SendGrid > Settings > Sender Authentication
2. Verify your sender email address
3. Check email for verification link
4. Wait for approval (usually instant)

## SendGrid Dashboard

Monitor the email in SendGrid:

1. Go to: https://app.sendgrid.com/email_activity
2. Search for: davis.t.wayne@gmail.com
3. Check status: Delivered, Opened, etc.
4. View any error messages

## Additional Test Variations

### Test Different OTP Types

Edit the test file to try different email types:

```javascript
// Change line with 'registration' to:
await emailService.sendOTP(testEmail, testOTP, 'login');
// or
await emailService.sendOTP(testEmail, testOTP, 'password-reset');
```

### Test Different Email Address

Edit the test file:

```javascript
// Change the testEmail line to:
const testEmail = 'your-other-email@example.com';
```

## Production Checklist

After successful test:

- [ ] Test email received and looks professional
- [ ] OTP code is clearly visible
- [ ] All links work correctly
- [ ] Email displays properly on mobile
- [ ] SendGrid dashboard shows successful delivery
- [ ] No errors in server logs
- [ ] Ready to use in production!

## Support

- **Setup Guide:** `server/OTP_EMAIL_SETUP.md`
- **Implementation Details:** `server/SENDGRID_OTP_IMPLEMENTATION.md`
- **SendGrid Support:** https://support.sendgrid.com
- **SendGrid Docs:** https://docs.sendgrid.com

## Quick Commands

```bash
# Run production test (uses .env.production)
node server/test-otp-production.js

# Check server logs
tail -f server.log

# View SendGrid activity
open https://app.sendgrid.com/email_activity

# Test general email service
node server/test-email.js
```

---

**Note:** This test uses a real email address and will send an actual email. Make sure your SendGrid account is properly configured and has available email credits.

