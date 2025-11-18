# Admin Notification Email Setup

## Overview
Admin email notifications have been added to automatically notify administrators when new users sign up for ezPICRA.

## Features Implemented

### 1. New Email Service Method
**File**: `server/services/emailService.js`

Added `sendNewUserNotification(userData)` method that:
- Sends beautifully formatted HTML email to admin
- Includes all user registration details
- Shows registration method (Google OAuth or Email/OTP)
- Includes direct links to admin dashboard
- Provides user type badges (admin/client)
- Shows company information if provided

### 2. Integration with Registration Flows

#### Email/OTP Registration
**File**: `server/routes/auth.js` - `/api/auth/register`
- Sends admin notification after successful user creation
- Non-blocking (won't fail registration if email fails)
- Logs warnings if notification fails

#### Google OAuth Registration
**File**: `server/routes/auth.js` - `/api/auth/google`
- Sends admin notification for new Google OAuth users
- Only triggers for first-time users
- Non-blocking operation

### 3. Email Template Features

The admin notification email includes:
- 🎉 Eye-catching header with gradient design
- ⚡ Action alert box
- 📋 Complete user information grid:
  - Name
  - Email
  - Company (if provided)
  - User Type (with badge)
  - Registration Method (with badge)
  - Registration Date/Time
  - Google ID (for OAuth users)
- 🔗 Quick action buttons:
  - View Admin Dashboard
  - Manage Users
- 📝 Next steps checklist
- 📧 Professional footer with branding

## Configuration

### Required Environment Variable

Add to your `.env` files:

```bash
# Admin Notification Email
ADMIN_NOTIFICATION_EMAIL=admin@ezpicra.com
```

### Updated Environment Files

#### `.env.production`
```bash
# SendGrid Configuration
SENDGRID_ENABLED=true
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=no-reply@ezpicra.com
SENDGRID_FROM_NAME=ezPICRA

# Admin Notifications
ADMIN_NOTIFICATION_EMAIL=admin@ezpicra.com
CLIENT_URL=https://app.ezpicra.com
```

#### `.env.development`
```bash
# SendGrid Configuration
SENDGRID_ENABLED=false  # Set to true to test in development
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=no-reply@nerdyhands.com
SENDGRID_FROM_NAME=ezPICRA

# Admin Notifications
ADMIN_NOTIFICATION_EMAIL=youremail@example.com
CLIENT_URL=http://localhost:3000
```

## Email Preview

### Subject Line
```
🎉 New User Registration: John Doe
```

### Email Content
- Gradient orange header
- User information in organized grid
- Color-coded badges for user type and registration method
- Call-to-action buttons
- Professional footer

## Testing

### Manual Testing

1. **Enable SendGrid** (if not already enabled):
   ```bash
   SENDGRID_ENABLED=true
   ```

2. **Set Admin Email**:
   ```bash
   ADMIN_NOTIFICATION_EMAIL=your-admin-email@example.com
   ```

3. **Restart Server**:
   ```bash
   npm run dev
   ```

4. **Register a New User**:
   - Go to signup page
   - Complete registration
   - Check admin email inbox

### Test Scenarios

1. **Email/OTP Registration**
   - New user signs up with email
   - Completes OTP verification
   - Admin receives notification

2. **Google OAuth Registration**
   - New user signs up with Google
   - Admin receives notification with Google ID

3. **Existing User Login**
   - Existing user logs in
   - No admin notification sent (correct behavior)

## Email Delivery

### When Admin Notifications Are Sent

✅ **YES** - Send notification when:
- New user registers via Email/OTP
- New user registers via Google OAuth
- First-time user account creation

❌ **NO** - Don't send when:
- Existing user logs in
- User updates profile
- Password reset requested

### Error Handling

- Admin notifications are non-blocking
- Registration continues even if email fails
- Errors are logged but don't affect user experience
- Console shows warning if notification fails

## Monitoring

### Check SendGrid Dashboard

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Activity Feed**
3. Filter by recipient email (admin email)
4. View delivery status, opens, clicks

### Console Logs

Look for these messages:
```
✅ Registration successful: user@example.com
Admin notification email sent successfully for new user: user@example.com
```

If there's an error:
```
⚠️ Failed to send admin notification: [error message]
```

## Customization

### Change Admin Email

Update in `.env`:
```bash
ADMIN_NOTIFICATION_EMAIL=newadmin@ezpicra.com
```

### Multiple Admin Recipients

To send to multiple admins, modify `emailService.js`:
```javascript
to: [
  'admin1@ezpicra.com',
  'admin2@ezpicra.com',
  'admin3@ezpicra.com'
],
```

### Customize Email Template

Edit the HTML in `sendNewUserNotification()` method in `server/services/emailService.js`.

### Disable Notifications

Set in `.env`:
```bash
ADMIN_NOTIFICATION_EMAIL=  # Leave empty to disable
```

Or disable SendGrid entirely:
```bash
SENDGRID_ENABLED=false
```

## Security Considerations

- Admin email is stored in environment variable (not in code)
- Email uses SendGrid's secure delivery
- Click tracking and open tracking enabled for monitoring
- No sensitive user data (passwords) in email
- Links point to authenticated admin areas

## Troubleshooting

### Admin Not Receiving Emails

1. **Check SendGrid is enabled**:
   ```bash
   SENDGRID_ENABLED=true
   ```

2. **Verify API Key is set**:
   ```bash
   SENDGRID_API_KEY=SG.xxx...
   ```

3. **Check admin email is configured**:
   ```bash
   ADMIN_NOTIFICATION_EMAIL=admin@ezpicra.com
   ```

4. **Check spam/junk folder** in admin email

5. **Verify sender domain** in SendGrid is authenticated

6. **Check SendGrid Activity Feed** for delivery status

### Email Shows in Activity Feed But Not Received

- Check email filters and rules
- Verify email address spelling
- Check domain MX records
- Contact email provider

### Console Shows Warning

If you see:
```
⚠️ Failed to send admin notification: [error]
```

Check:
- SendGrid API key validity
- SendGrid account status
- Network connectivity
- SendGrid rate limits

## Files Modified

1. `server/services/emailService.js`
   - Added `adminEmail` to constructor
   - Created `sendNewUserNotification()` method

2. `server/routes/auth.js`
   - Added admin notification to `/api/auth/register`
   - Added admin notification to `/api/auth/google`

3. `server/ADMIN_NOTIFICATION_SETUP.md` (this file)
   - Complete documentation

## Next Steps

- [ ] Add `ADMIN_NOTIFICATION_EMAIL` to `.env.production`
- [ ] Add `ADMIN_NOTIFICATION_EMAIL` to `.env.development`
- [ ] Restart server
- [ ] Test registration flow
- [ ] Verify admin receives email
- [ ] Check SendGrid dashboard
- [ ] Monitor for any delivery issues

## Support

For issues or questions:
- SendGrid Support: https://support.sendgrid.com
- SendGrid Activity Feed: https://app.sendgrid.com/activity
- Email Logs: Check server console for warnings

## Changelog

### v1.0.0 (Current)
- ✅ Initial implementation
- ✅ HTML email template with ezPICRA branding
- ✅ Support for both Email/OTP and Google OAuth registrations
- ✅ Non-blocking email delivery
- ✅ Comprehensive error handling
- ✅ Badge system for user types and registration methods
- ✅ Direct links to admin dashboard

