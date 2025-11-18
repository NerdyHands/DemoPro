# Email System Documentation

## Overview

The ezPICRA server includes a comprehensive email system for sending welcome emails to new customers. The system uses SendGrid for reliable email delivery and includes automatic email processing via a background worker.

## Features

- **Welcome Email Templates**: Customizable HTML templates for new customer onboarding
- **SendGrid Integration**: Professional email delivery service
- **Automatic Processing**: Background worker processes new signups automatically
- **Email Tracking**: Tracks when emails are sent and prevents duplicates
- **Bulk Operations**: Support for sending emails to multiple users
- **Rate Limiting**: Built-in delays to avoid API rate limits
- **Error Handling**: Comprehensive error handling and logging

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_ENABLED=false                    # Set to 'true' to enable email service
SENDGRID_API_KEY=your_api_key_here       # Your SendGrid API key
SENDGRID_FROM_EMAIL=noreply@ezpicra.com  # Sender email address
SENDGRID_FROM_NAME=ezPICRA               # Sender name
```

### SendGrid Setup

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Generate an API key with "Mail Send" permissions
3. Verify your sender domain or use a verified sender email
4. Add the API key to your environment variables

## Email Templates

### Welcome Email Template

The welcome email template is located at `server/templates/welcome.html` and includes:

- ezPICRA branding and messaging
- Service highlights and benefits
- Call-to-action buttons
- Social media links
- Unsubscribe functionality

### Template Customization

The template supports dynamic content replacement:

- `{firstName}` - User's first name
- `{unsubscribe_link}` - Unsubscribe link with user's email

## API Endpoints

### Email Routes

All email endpoints are prefixed with `/api/email`:

#### Test Connection
```
GET /api/email/test
```
Tests the SendGrid connection and configuration.

#### Send Welcome Email
```
POST /api/email/welcome
```
Sends a welcome email to a specific user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Bulk Welcome Emails
```
POST /api/email/welcome/bulk
```
Sends welcome emails to multiple users.

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "emails": ["user1@example.com", "user2@example.com"]
}
```

#### Email Statistics
```
GET /api/email/stats
```
Returns email sending statistics.

#### Resend Welcome Email
```
POST /api/email/welcome/resend
```
Resends a welcome email to a user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Background Worker

### Email Worker

The email worker automatically processes new signups and sends welcome emails:

- **Check Interval**: Every 5 minutes (configurable)
- **Batch Size**: Processes 10 emails at a time
- **Rate Limiting**: 200ms delay between emails
- **Auto-start**: Starts automatically when server starts (if enabled)

### Worker Control

```javascript
const emailWorker = require('./services/emailWorker');

// Start the worker
emailWorker.start();

// Stop the worker
emailWorker.stop();

// Get worker status
const status = emailWorker.getStatus();

// Manually trigger processing
await emailWorker.triggerProcessing();
```

## Database Schema Updates

The `LandingPage` model has been updated with new fields:

```javascript
{
  welcomeEmailSent: {
    type: Boolean,
    default: false
  },
  welcomeEmailSentDate: {
    type: Date
  }
}
```

## Testing

### Test Script

Run the email system test:

```bash
node test-email.js
```

This script will:
1. Check configuration status
2. Test SendGrid connection
3. Test welcome email sending
4. Verify worker functionality

### Manual Testing

1. **Enable Email Service**: Set `SENDGRID_ENABLED=true` in your `.env`
2. **Configure API Key**: Add your SendGrid API key
3. **Test Connection**: Use the `/api/email/test` endpoint
4. **Send Test Email**: Use the `/api/email/welcome` endpoint

## Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Rate Limiting**: Built-in delays prevent API abuse
- **Input Validation**: All email endpoints validate input data
- **Error Handling**: Sensitive information is not exposed in error messages

## Monitoring and Logging

### Logs

The email system provides comprehensive logging:

- Email service status and configuration
- Email sending attempts and results
- Worker activity and processing status
- Error details and troubleshooting information

### Health Checks

Monitor email service health via:

- `/api/email/stats` - Email statistics
- `/api/email/test` - Service connectivity
- Worker status logs

## Troubleshooting

### Common Issues

1. **Email Service Disabled**
   - Check `SENDGRID_ENABLED` environment variable
   - Verify API key configuration

2. **Authentication Errors**
   - Verify SendGrid API key is correct
   - Check sender email verification status

3. **Rate Limiting**
   - Reduce batch size in worker configuration
   - Increase delay between emails

4. **Template Errors**
   - Verify HTML template syntax
   - Check file permissions and paths

### Debug Mode

Enable detailed logging by setting `NODE_ENV=development` in your environment.

## Production Deployment

### Environment Configuration

1. Set `SENDGRID_ENABLED=true`
2. Configure production SendGrid API key
3. Verify sender domain/email
4. Set appropriate rate limits

### Monitoring

- Monitor email delivery rates
- Track bounce and spam reports
- Set up alerts for service failures
- Monitor worker performance

## Support

For issues or questions about the email system:

1. Check the logs for error details
2. Verify environment configuration
3. Test with the provided test script
4. Review SendGrid account status

## Changelog

### Version 1.0.0
- Initial email system implementation
- SendGrid integration
- Welcome email templates
- Background worker
- API endpoints
- Comprehensive testing and documentation
