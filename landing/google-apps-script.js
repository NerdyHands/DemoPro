/**
 * Google Apps Script for Mr Demo Pro Form Submissions
 * This script handles form submissions from the website and stores them in Google Sheets
 * Includes spam protection: rate limiting, duplicate detection, honeypot validation
 */

// Replace with your Google Sheet ID
const SHEET_ID = '16IbG2bRcoLGY8FUswtYLL-iX842EAo2jWWgppPB9NFI';
const SHEET_NAME = 'Form Submissions';

// Email notification settings
// Replace with the email address where you want to receive lead notifications
const NOTIFICATION_EMAIL = 'info@mrdemopro.com'; // Change this to your email
const COMPANY_NAME = 'Mr Demo Pro';
const COMPANY_PHONE = '757-848-4559';

// Spam protection settings
const RATE_LIMIT_MINUTES = 15; // Time window for rate limiting
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Max submissions per IP per time window
const MIN_SUBMISSION_TIME_SECONDS = 3; // Minimum time between form load and submission (anti-bot)
const DUPLICATE_CHECK_MINUTES = 5; // Check for duplicate submissions within this time

// reCAPTCHA v3 settings
// IMPORTANT: Replace with your reCAPTCHA secret key (get it from https://www.google.com/recaptcha/admin)
// The secret key is different from the site key used on the frontend
const RECAPTCHA_SECRET_KEY = '6LcmDkssAAAAAPUATFz-CjL4pCsH228ZRBBsztuL'; // Replace with your actual secret key
const RECAPTCHA_MIN_SCORE = 0.5; // Minimum score to accept (0.0 to 1.0)

/**
 * Verify reCAPTCHA v3 token
 * @param {string} token - The reCAPTCHA token from the form submission
 * @returns {boolean} - True if verification passes, false otherwise
 */
function verifyRecaptcha(token) {
  try {
    if (!token || token.trim() === '') {
      return false;
    }
    
    // Skip verification if secret key is not configured
    if (!RECAPTCHA_SECRET_KEY || RECAPTCHA_SECRET_KEY === 'YOUR_RECAPTCHA_SECRET_KEY_HERE') {
      console.log('reCAPTCHA secret key not configured, skipping verification');
      return true; // Allow submission if not configured (backward compatibility)
    }
    
    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const payload = {
      'secret': RECAPTCHA_SECRET_KEY,
      'response': token
    };
    
    const options = {
      'method': 'post',
      'payload': payload
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.success) {
      // For reCAPTCHA v3, also check the score
      if (responseData.score !== undefined) {
        if (responseData.score >= RECAPTCHA_MIN_SCORE) {
          console.log('reCAPTCHA verification passed', { score: responseData.score });
          return true;
        } else {
          console.log('reCAPTCHA verification failed: score too low', { score: responseData.score, minScore: RECAPTCHA_MIN_SCORE });
          return false;
        }
      } else {
        // For reCAPTCHA v2, just check success
        console.log('reCAPTCHA verification passed');
        return true;
      }
    } else {
      console.log('reCAPTCHA verification failed', { errors: responseData['error-codes'] });
      return false;
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    // On error, allow submission to avoid blocking legitimate users
    return true;
  }
}

function doPost(e) {
  try {
    // Get form data
    const formData = e.parameter;
    const timestamp = new Date();
    
    // Get IP address from request
    // Note: Google Apps Script doesn't provide IP directly, so we use a combination
    // of contact info and timestamp for rate limiting instead
    const ipAddress = e.parameter.IP_ADDRESS || 'Unknown';
    
    // Use contact info for rate limiting if IP not available (more reliable in Google Apps Script)
    const contactIdentifier = (formData.email || formData.contact || ipAddress || 'anonymous').toLowerCase().trim();
    
    // ========== SPAM PROTECTION CHECKS ==========
    
    // 0. reCAPTCHA v3 verification (if secret key is configured)
    if (RECAPTCHA_SECRET_KEY && RECAPTCHA_SECRET_KEY !== 'YOUR_RECAPTCHA_SECRET_KEY_HERE') {
      const recaptchaToken = formData.recaptcha_token;
      if (!recaptchaToken) {
        console.log('SPAM DETECTED: Missing reCAPTCHA token', { ipAddress, email: formData.email || formData.contact });
        logSuspiciousSubmission(SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME), formData, timestamp, contactIdentifier, 'Missing reCAPTCHA token');
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'reCAPTCHA verification failed' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const recaptchaValid = verifyRecaptcha(recaptchaToken);
      if (!recaptchaValid) {
        console.log('SPAM DETECTED: reCAPTCHA verification failed', { ipAddress, email: formData.email || formData.contact });
        logSuspiciousSubmission(SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME), formData, timestamp, contactIdentifier, 'reCAPTCHA verification failed');
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'reCAPTCHA verification failed' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 1. Honeypot check - if honeypot field is filled, reject as spam
    if (formData.website && formData.website.trim() !== '') {
      console.log('SPAM DETECTED: Honeypot field filled', { ipAddress, email: formData.email || formData.contact });
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid submission' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet early so we can log suspicious submissions
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // 2. Time-based validation - check if form was submitted too quickly (likely bot)
    const formLoadTime = formData.form_load_time ? parseInt(formData.form_load_time) : 0;
    const currentTime = Date.now();
    const timeOnPage = (currentTime - formLoadTime) / 1000; // Convert to seconds
    
    if (formLoadTime > 0 && timeOnPage < MIN_SUBMISSION_TIME_SECONDS) {
      console.log('SPAM DETECTED: Form submitted too quickly', { 
        contactIdentifier, 
        timeOnPage: timeOnPage.toFixed(2) + 's',
        email: formData.email || formData.contact 
      });
      logSuspiciousSubmission(sheet, formData, timestamp, contactIdentifier, 'Submitted too quickly: ' + timeOnPage.toFixed(2) + 's');
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Please take your time filling out the form' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Rate limiting check (uses contact identifier for better tracking)
    if (!checkRateLimit(contactIdentifier)) {
      console.log('SPAM DETECTED: Rate limit exceeded', { contactIdentifier, email: formData.email || formData.contact });
      logSuspiciousSubmission(sheet, formData, timestamp, contactIdentifier, 'Rate limit exceeded');
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Too many submissions. Please try again later.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. Duplicate submission check
    if (isDuplicateSubmission(formData, contactIdentifier)) {
      console.log('SPAM DETECTED: Duplicate submission', { contactIdentifier, email: formData.email || formData.contact });
      logSuspiciousSubmission(sheet, formData, timestamp, contactIdentifier, 'Duplicate submission');
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Duplicate submission detected' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 5. Basic validation
    if (formData.form_type === 'contact_form') {
      if (!formData.email || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('SPAM DETECTED: Invalid email', { ipAddress, email: formData.email });
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Invalid email address' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (!formData.name || formData.name.trim().length < 2) {
        console.log('SPAM DETECTED: Invalid name', { ipAddress, name: formData.name });
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Invalid name' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else if (formData.form_type === 'quote_request') {
      if (!formData.contact || (!formData.contact.includes('@') && !formData.contact.match(/^[\+]?[1-9][\d]{0,15}$/))) {
        console.log('SPAM DETECTED: Invalid contact info', { ipAddress, contact: formData.contact });
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Invalid contact information' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ========== VALIDATION PASSED - PROCESS SUBMISSION ==========
    
    // Create headers if they don't exist (updated to include spam flag)
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Form Type', 'Name/Address', 'Contact', 'Message', 'IP Address', 'Status']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    
    // Determine form type and extract data accordingly
    let nameField, contactField, messageField;
    
    if (formData.form_type === 'quote_request') {
      nameField = formData.address || '';
      contactField = formData.contact || '';
      messageField = 'Quote Request';
    } else if (formData.form_type === 'contact_form') {
      nameField = formData.name || '';
      contactField = formData.email || '';
      messageField = formData.message || '';
    } else {
      // Fallback for other form types
      nameField = formData.name || formData.address || '';
      contactField = formData.email || formData.contact || '';
      messageField = formData.message || 'Form Submission';
    }
    
    // Add data to sheet (mark as valid submission)
    sheet.appendRow([
      timestamp,
      formData.form_type || 'unknown',
      nameField,
      contactField,
      messageField,
      contactIdentifier,
      'Valid'
    ]);
    
    // Record submission for rate limiting
    recordSubmission(contactIdentifier, contactField, timestamp);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 7);
    
    // Send email notification (non-blocking - won't fail form submission if email fails)
    try {
      sendLeadNotification({
        formType: formData.form_type || 'unknown',
        nameField: nameField,
        contactField: contactField,
        messageField: messageField,
        timestamp: timestamp,
        serviceType: formData.service_type || ''
      });
    } catch (emailError) {
      // Log error but don't fail the form submission
      console.error('Failed to send email notification:', emailError);
    }
    
    // Return success response
    // Note: CORS headers are handled automatically by Google Apps Script web apps
    // when deployed with "Who has access: Anyone"
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Form submitted successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    // Return error response
    // Note: CORS headers are handled automatically by Google Apps Script web apps
    // when deployed with "Who has access: Anyone"
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  // Note: CORS headers are handled automatically by Google Apps Script web apps
  // when deployed with "Who has access: Anyone"
  return ContentService
    .createTextOutput('Mr Demo Pro Form Handler is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Function to set up the spreadsheet (run this once manually)
function setupSpreadsheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  // Clear existing data and create headers
  sheet.clear();
  sheet.getRange(1, 1, 1, 7).setValues([
    ['Timestamp', 'Form Type', 'Name/Address', 'Contact', 'Message', 'IP Address', 'Status']
  ]);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, 7);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Form Type
  sheet.setColumnWidth(3, 200); // Name/Address
  sheet.setColumnWidth(4, 200); // Contact
  sheet.setColumnWidth(5, 300); // Message
  sheet.setColumnWidth(6, 120); // IP Address
  sheet.setColumnWidth(7, 150); // Status
  
  console.log('Spreadsheet setup completed!');
}

/**
 * Send email notification when a new lead is received
 */
function sendLeadNotification(leadData) {
  try {
    // Determine subject and content based on form type
    let subject, emailBody;
    
    if (leadData.formType === 'quote_request') {
      subject = `🔨 New Quote Request - ${COMPANY_NAME}`;
      emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #d9534f;">🔨 New Quote Request Received!</h2>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>📅 Date/Time:</strong> ${Utilities.formatDate(leadData.timestamp, Session.getScriptTimeZone(), 'MM/dd/yyyy hh:mm a')}</p>
                <p><strong>📍 Property Address:</strong> ${leadData.nameField || 'Not provided'}</p>
                <p><strong>📞 Contact Info:</strong> ${leadData.contactField || 'Not provided'}</p>
                ${leadData.serviceType ? `<p><strong>🛠️ Service Type:</strong> ${leadData.serviceType}</p>` : ''}
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0;"><strong>⚡ Action Required:</strong> Contact this lead as soon as possible!</p>
              </div>
              
              <p style="margin-top: 30px;">
                <a href="mailto:${leadData.contactField}" style="background-color: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  📧 Reply to Lead
                </a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 12px;">
                This is an automated notification from ${COMPANY_NAME}.<br>
                Phone: ${COMPANY_PHONE}
              </p>
            </div>
          </body>
        </html>
      `;
    } else if (leadData.formType === 'contact_form') {
      subject = `📧 New Contact Form Submission - ${COMPANY_NAME}`;
      emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #5bc0de;">📧 New Contact Form Submission</h2>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>📅 Date/Time:</strong> ${Utilities.formatDate(leadData.timestamp, Session.getScriptTimeZone(), 'MM/dd/yyyy hh:mm a')}</p>
                <p><strong>👤 Name:</strong> ${leadData.nameField || 'Not provided'}</p>
                <p><strong>📧 Email:</strong> ${leadData.contactField || 'Not provided'}</p>
                <p><strong>💬 Message:</strong></p>
                <div style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 10px;">
                  ${leadData.messageField || 'No message provided'}
                </div>
              </div>
              
              <p style="margin-top: 30px;">
                <a href="mailto:${leadData.contactField}" style="background-color: #5bc0de; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  📧 Reply to Message
                </a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 12px;">
                This is an automated notification from ${COMPANY_NAME}.<br>
                Phone: ${COMPANY_PHONE}
              </p>
            </div>
          </body>
        </html>
      `;
    } else {
      // Generic notification
      subject = `📝 New Form Submission - ${COMPANY_NAME}`;
      emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #5cb85c;">📝 New Form Submission</h2>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>📅 Date/Time:</strong> ${Utilities.formatDate(leadData.timestamp, Session.getScriptTimeZone(), 'MM/dd/yyyy hh:mm a')}</p>
                <p><strong>📋 Form Type:</strong> ${leadData.formType}</p>
                <p><strong>👤 Name/Address:</strong> ${leadData.nameField || 'Not provided'}</p>
                <p><strong>📞 Contact:</strong> ${leadData.contactField || 'Not provided'}</p>
                ${leadData.messageField ? `<p><strong>💬 Message:</strong> ${leadData.messageField}</p>` : ''}
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 12px;">
                This is an automated notification from ${COMPANY_NAME}.<br>
                Phone: ${COMPANY_PHONE}
              </p>
            </div>
          </body>
        </html>
      `;
    }
    
    // Send the email
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: emailBody
    });
    
    console.log('Lead notification email sent successfully to:', NOTIFICATION_EMAIL);
    
  } catch (error) {
    console.error('Error sending lead notification email:', error);
    throw error; // Re-throw so caller can handle it
  }
}

/**
 * Rate limiting: Check if identifier (contact/email/IP) has exceeded submission limit
 * Uses PropertiesService to store submission timestamps
 */
function checkRateLimit(identifier) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = 'rate_limit_' + identifier;
    const data = properties.getProperty(key);
    
    if (!data) {
      // First submission from this identifier
      properties.setProperty(key, JSON.stringify([Date.now()]));
      return true;
    }
    
    const submissions = JSON.parse(data);
    const now = Date.now();
    const windowMs = RATE_LIMIT_MINUTES * 60 * 1000;
    
    // Filter out submissions outside the time window
    const recentSubmissions = submissions.filter(time => (now - time) < windowMs);
    
    if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      return false; // Rate limit exceeded
    }
    
    // Add current submission and update storage
    recentSubmissions.push(now);
    properties.setProperty(key, JSON.stringify(recentSubmissions));
    
    // Clean up old entries periodically (keep only last 10 to prevent storage bloat)
    if (recentSubmissions.length > 10) {
      properties.setProperty(key, JSON.stringify(recentSubmissions.slice(-10)));
    }
    
    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow submission (fail open)
    return true;
  }
}

/**
 * Record a valid submission for rate limiting and duplicate detection
 */
function recordSubmission(identifier, contactInfo, timestamp) {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    // Store for rate limiting (already done in checkRateLimit, but keep for completeness)
    const rateLimitKey = 'rate_limit_' + identifier;
    const rateLimitData = properties.getProperty(rateLimitKey);
    if (rateLimitData) {
      const submissions = JSON.parse(rateLimitData);
      submissions.push(timestamp.getTime());
      properties.setProperty(rateLimitKey, JSON.stringify(submissions));
    }
    
    // Store for duplicate detection
    const duplicateKey = 'duplicate_' + identifier;
    const duplicateWindow = DUPLICATE_CHECK_MINUTES * 60 * 1000;
    properties.setProperty(duplicateKey, timestamp.getTime().toString(), duplicateWindow / 1000);
  } catch (error) {
    console.error('Error recording submission:', error);
  }
}

/**
 * Check if this is a duplicate submission
 */
function isDuplicateSubmission(formData, identifier) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const duplicateKey = 'duplicate_' + identifier;
    const lastSubmission = properties.getProperty(duplicateKey);
    
    if (!lastSubmission) {
      return false; // Not a duplicate
    }
    
    const lastSubmissionTime = parseInt(lastSubmission);
    const now = Date.now();
    const windowMs = DUPLICATE_CHECK_MINUTES * 60 * 1000;
    
    if ((now - lastSubmissionTime) < windowMs) {
      return true; // Duplicate detected
    }
    
    return false;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false; // On error, allow submission
  }
}

/**
 * Log suspicious submission to spreadsheet (in a separate sheet or same sheet with status)
 */
function logSuspiciousSubmission(sheet, formData, timestamp, identifier, reason) {
  try {
    // Append to same sheet with 'Spam' status
    let nameField, contactField, messageField;
    
    if (formData.form_type === 'quote_request') {
      nameField = formData.address || '';
      contactField = formData.contact || '';
      messageField = 'Quote Request [SPAM: ' + reason + ']';
    } else if (formData.form_type === 'contact_form') {
      nameField = formData.name || '';
      contactField = formData.email || '';
      messageField = (formData.message || '') + ' [SPAM: ' + reason + ']';
    } else {
      nameField = formData.name || formData.address || '';
      contactField = formData.email || formData.contact || '';
      messageField = formData.message || 'Form Submission [SPAM: ' + reason + ']';
    }
    
    sheet.appendRow([
      timestamp,
      formData.form_type || 'unknown',
      nameField,
      contactField,
      messageField,
      identifier,
      'Spam: ' + reason
    ]);
  } catch (error) {
    console.error('Error logging suspicious submission:', error);
  }
}

// Function to test the form submission
function testFormSubmission() {
  const testData = {
    parameter: {
      form_type: 'quote_request',
      address: '123 Test Street, Hampton, VA',
      contact: 'test@example.com',
      service_type: 'shed_removal',
      IP_ADDRESS: '127.0.0.1',
      form_load_time: (Date.now() - 10000).toString() // 10 seconds ago
    }
  };
  
  const result = doPost(testData);
  console.log('Test result:', result.getContent());
}

// Function to test email notification
function testEmailNotification() {
  sendLeadNotification({
    formType: 'quote_request',
    nameField: '123 Test Street, Hampton, VA',
    contactField: 'test@example.com',
    messageField: 'Test quote request',
    timestamp: new Date(),
    serviceType: 'shed_removal'
  });
  console.log('Test email notification sent!');
}
