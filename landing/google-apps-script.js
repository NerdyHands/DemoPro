/**
 * Google Apps Script for Mr Demo Pro Form Submissions
 * This script handles form submissions from the website and stores them in Google Sheets
 */

// Replace with your Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Form Submissions';

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
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Form submitted successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
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

// Function to test the form submission
function testFormSubmission() {
  const testData = {
    parameter: {
      form_type: 'quote_request',
      address: '123 Test Street, Hampton, VA',
      contact: 'test@example.com',
      IP_ADDRESS: '127.0.0.1'
    }
  };
  
  const result = doPost(testData);
  console.log('Test result:', result.getContent());
}
