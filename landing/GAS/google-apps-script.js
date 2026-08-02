/**
 * Form submission web app — doPost / doGet, spam protection, email alerts.
 * Shared config: Config.js | Menu: Menu.js | GHL sync: GHL.js | Make webhook: Make.js
 */

/**
 * Normalize phone for validation (digits only, min 10)
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Resolve contact identifier for rate limiting / duplicate checks
 */
function getContactIdentifier(formData, ipAddress) {
  const phone = formData.phone || '';
  const email = formData.email || '';
  const legacyContact = formData.contact || '';
  return (phone || email || legacyContact || ipAddress || 'anonymous').toLowerCase().trim();
}

/**
 * Extract row fields from form submission
 */
function extractSubmissionFields(formData) {
  if (formData.form_type === 'quote_request') {
    const phone = formData.phone || (formData.contact && !formData.contact.includes('@') ? formData.contact : '') || '';
    const legacyEmail = formData.contact && formData.contact.includes('@') ? formData.contact : '';
    return {
      name: formData.name || '',
      phone: phone,
      businessName: formData.business_name || '',
      serviceType: formData.service_type || '',
      address: formData.address || '',
      message: 'Quote Request',
      contactField: phone || legacyEmail || formData.contact || ''
    };
  }

  if (formData.form_type === 'contact_form') {
    return {
      name: formData.name || '',
      phone: formData.phone || '',
      businessName: formData.business_name || '',
      serviceType: formData.service_type || '',
      address: formData.address || '',
      message: formData.message || '',
      contactField: formData.email || formData.phone || ''
    };
  }

  return {
    name: formData.name || formData.address || '',
    phone: formData.phone || '',
    businessName: formData.business_name || '',
    serviceType: formData.service_type || '',
    address: formData.address || '',
    message: formData.message || 'Form Submission',
    contactField: formData.phone || formData.email || formData.contact || ''
  };
}

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
    const contactIdentifier = getContactIdentifier(formData, ipAddress);
    
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
      if (formData.phone) {
        if (!isValidPhone(formData.phone)) {
          console.log('SPAM DETECTED: Invalid phone', { ipAddress, phone: formData.phone });
          return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: 'Invalid phone number' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
        if (!formData.name || formData.name.trim().length < 2) {
          console.log('SPAM DETECTED: Invalid name', { ipAddress, name: formData.name });
          return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: 'Invalid name' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } else if (formData.contact) {
        const isEmail = formData.contact.includes('@');
        const isPhone = isValidPhone(formData.contact);
        if (!isEmail && !isPhone) {
          console.log('SPAM DETECTED: Invalid contact info', { ipAddress, contact: formData.contact });
          return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: 'Invalid contact information' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } else {
        console.log('SPAM DETECTED: Missing phone', { ipAddress });
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Phone number is required' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ========== VALIDATION PASSED - PROCESS SUBMISSION ==========
    
    // Create headers if they don't exist
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
    }

    const fields = extractSubmissionFields(formData);
    
    // Add data to sheet (mark as valid submission)
    sheet.appendRow([
      timestamp,
      formData.form_type || 'unknown',
      fields.name,
      fields.phone,
      fields.businessName,
      fields.serviceType,
      fields.address,
      fields.message,
      contactIdentifier,
      'Valid',
      ''
    ]);
    
    // Record submission for rate limiting
    recordSubmission(contactIdentifier, fields.contactField, timestamp);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, SHEET_HEADERS.length);
    
    // Send email notification (non-blocking - won't fail form submission if email fails)
    try {
      sendLeadNotification({
        formType: formData.form_type || 'unknown',
        nameField: fields.name,
        phoneField: fields.phone,
        businessName: fields.businessName,
        serviceType: fields.serviceType,
        addressField: fields.address,
        contactField: fields.contactField,
        messageField: fields.message,
        timestamp: timestamp
      });
    } catch (emailError) {
      // Log error but don't fail the form submission
      console.error('Failed to send email notification:', emailError);
    }

    // Send to Make.com webhook (non-blocking)
    try {
      sendRecordToMake_({
        'Timestamp': timestamp,
        'Form Type': formData.form_type || 'unknown',
        'Name': fields.name,
        'Phone': fields.phone,
        'Business Name': fields.businessName,
        'Service Type': fields.serviceType,
        'Address': fields.address,
        'Message': fields.message,
        'Identifier': contactIdentifier,
        'Status': 'Valid',
        'GHL Status': ''
      });
    } catch (makeError) {
      console.error('Failed to send Make webhook:', makeError);
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
  sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
  sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Form Type
  sheet.setColumnWidth(3, 160); // Name
  sheet.setColumnWidth(4, 140); // Phone
  sheet.setColumnWidth(5, 180); // Business Name
  sheet.setColumnWidth(6, 180); // Service Type
  sheet.setColumnWidth(7, 220); // Address
  sheet.setColumnWidth(8, 260); // Message
  sheet.setColumnWidth(9, 160); // Identifier
  sheet.setColumnWidth(10, 150); // Status
  sheet.setColumnWidth(11, 180); // GHL Status
  
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
                ${leadData.nameField ? `<p><strong>👤 Name:</strong> ${leadData.nameField}</p>` : ''}
                <p><strong>📞 Phone:</strong> ${leadData.phoneField || leadData.contactField || 'Not provided'}</p>
                ${leadData.businessName ? `<p><strong>🏢 Business Name:</strong> ${leadData.businessName}</p>` : ''}
                ${leadData.serviceType ? `<p><strong>🛠️ Type of Work:</strong> ${leadData.serviceType}</p>` : ''}
                <p><strong>📍 Property Address:</strong> ${leadData.addressField || 'Not provided'}</p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0;"><strong>⚡ Action Required:</strong> Contact this lead as soon as possible!</p>
              </div>
              
              <p style="margin-top: 30px;">
                <a href="tel:${(leadData.phoneField || leadData.contactField || '').replace(/\D/g, '')}" style="background-color: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  📞 Call Lead
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
    const fields = extractSubmissionFields(formData);
    const spamMessage = fields.message + ' [SPAM: ' + reason + ']';

    sheet.appendRow([
      timestamp,
      formData.form_type || 'unknown',
      fields.name,
      fields.phone,
      fields.businessName,
      fields.serviceType,
      fields.address,
      spamMessage,
      identifier,
      'Spam: ' + reason,
      ''
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
      name: 'Jane Doe',
      phone: '7575551234',
      business_name: 'Acme Properties',
      service_type: 'Shed Removal',
      address: '123 Test Street, Hampton, VA',
      IP_ADDRESS: '127.0.0.1',
      form_load_time: (Date.now() - 10000).toString()
    }
  };
  
  const result = doPost(testData);
  console.log('Test result:', result.getContent());
}

// Function to test email notification
function testEmailNotification() {
  sendLeadNotification({
    formType: 'quote_request',
    nameField: 'Jane Doe',
    phoneField: '7575551234',
    businessName: 'Acme Properties',
    serviceType: 'Shed Removal',
    addressField: '123 Test Street, Hampton, VA',
    contactField: '7575551234',
    messageField: 'Test quote request',
    timestamp: new Date()
  });
  console.log('Test email notification sent!');
}
