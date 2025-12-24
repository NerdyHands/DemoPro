# Email Notifications Setup for Form Submissions

## Overview
The Google Apps Script now sends email notifications whenever a new lead is received through the website forms.

## Setup Instructions

### 1. Update Email Address
Open `google-apps-script.js` and update the notification email address:

```javascript
const NOTIFICATION_EMAIL = 'info@mrdemopro.com'; // Change this to your email
```

Replace `info@mrdemopro.com` with the email address where you want to receive lead notifications.

### 2. Deploy the Updated Script
1. Open your Google Apps Script project in Google Apps Script editor
2. Copy the updated code from `google-apps-script.js`
3. Paste it into your Google Apps Script editor
4. Save the project
5. Deploy as a web app (if not already deployed):
   - Click "Deploy" → "New deployment"
   - Select type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the web app URL (this is your script URL)

### 3. Test Email Notifications
You can test the email notification function by:
1. Running the `testEmailNotification()` function in the Google Apps Script editor
2. Or submitting a test form on your website

## What You'll Receive

### Quote Request Notifications
When someone requests a quote, you'll receive an email with:
- 📅 Date and time of submission
- 📍 Property address
- 📞 Contact information (email or phone)
- 🛠️ Service type (if specified)
- Quick reply button

### Contact Form Notifications
When someone submits the contact form, you'll receive an email with:
- 📅 Date and time of submission
- 👤 Name
- 📧 Email address
- 💬 Full message
- Quick reply button

## Email Format
Notifications are sent as HTML emails with:
- Professional formatting
- Clear action items
- Quick reply links
- Company branding

## Troubleshooting

### Emails Not Being Sent
1. **Check Script Execution Logs**: In Google Apps Script editor, go to "Executions" to see if there are any errors
2. **Verify Email Address**: Make sure `NOTIFICATION_EMAIL` is set correctly
3. **Check Permissions**: The Google account running the script needs permission to send emails
4. **Review Quotas**: Google Apps Script has daily email sending limits (100 emails/day for free accounts)

### Script Errors
- Check the execution logs in Google Apps Script editor
- Make sure the script has permission to send emails
- Verify that `SHEET_ID` is set correctly

## Configuration Options

You can customize the notification email by editing the `sendLeadNotification()` function in `google-apps-script.js`:

- **Company Name**: Update `COMPANY_NAME` constant
- **Phone Number**: Update `COMPANY_PHONE` constant
- **Email Template**: Modify the HTML in the `sendLeadNotification()` function

## Notes
- Email notifications are **non-blocking** - if email sending fails, the form submission will still succeed and be saved to Google Sheets
- Email errors are logged to the console but won't prevent form submissions
- You'll receive one email per form submission

