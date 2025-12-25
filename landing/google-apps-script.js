/**
 * Google Apps Script for Mr Demo Pro Form Submissions
 * This script handles form submissions from the website and stores them in Google Sheets
 */

// Replace with your Google Sheet ID
const SHEET_ID = '16IbG2bRcoLGY8FUswtYLL-iX842EAo2jWWgppPB9NFI';
const SHEET_NAME = 'Form Submissions';

// Email notification settings
// Replace with the email address where you want to receive lead notifications
const NOTIFICATION_EMAIL = 'info@mrdemopro.com'; // Change this to your email
const COMPANY_NAME = 'Mr Demo Pro';
const COMPANY_PHONE = '757-848-4559';

function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Create headers if they don't exist
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 6).setValues([
        ['Timestamp', 'Form Type', 'Name/Address', 'Contact', 'Message', 'IP Address']
      ]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }
    
    // Get form data
    const formData = e.parameter;
    const timestamp = new Date();
    const ipAddress = e.parameter.IP_ADDRESS || 'Unknown';
    
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
    
    // Add data to sheet
    sheet.appendRow([
      timestamp,
      formData.form_type || 'unknown',
      nameField,
      contactField,
      messageField,
      ipAddress
    ]);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 6);
    
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
  sheet.getRange(1, 1, 1, 6).setValues([
    ['Timestamp', 'Form Type', 'Name/Address', 'Contact', 'Message', 'IP Address']
  ]);
  sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, 6);
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

// Function to test the form submission
function testFormSubmission() {
  const testData = {
    parameter: {
      form_type: 'quote_request',
      address: '123 Test Street, Hampton, VA',
      contact: 'test@example.com',
      service_type: 'shed_removal',
      IP_ADDRESS: '127.0.0.1'
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
