/**
 * Shared configuration for Mr Demo Pro Google Apps Script project.
 * Copy all .js files in this folder into one Apps Script project bound to the sheet.
 */

// Spreadsheet
var SHEET_ID = '16IbG2bRcoLGY8FUswtYLL-iX842EAo2jWWgppPB9NFI';
var SHEET_NAME = 'Form Submissions';

var SHEET_HEADERS = [
  'Timestamp',
  'Form Type',
  'Name',
  'Phone',
  'Business Name',
  'Service Type',
  'Address',
  'Message',
  'Identifier',
  'Status',
  'GHL Status'
];

// Company / notifications
var NOTIFICATION_EMAIL = 'info@mrdemopro.com';
var COMPANY_NAME = 'Mr Demo Pro';
var COMPANY_PHONE = '757-848-4559';

// Spam protection
// Note: duplicates are keyed by contact + service_type + address, so testing
// different services with the same phone is allowed. Rate limit only counts
// accepted Valid rows (not rejected spam attempts).
var RATE_LIMIT_MINUTES = 15;
var MAX_SUBMISSIONS_PER_WINDOW = 10;
var MIN_SUBMISSION_TIME_SECONDS = 3;
var DUPLICATE_CHECK_MINUTES = 5;

// reCAPTCHA v3 — secret key differs from the frontend site key
var RECAPTCHA_SECRET_KEY = '6LcmDkssAAAAAPUATFz-CjL4pCsH228ZRBBsztuL';
var RECAPTCHA_MIN_SCORE = 0.5;

// Make.com webhook
var MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/zkde6xrhdjxtzyy8csbcl7cujt4q52rp';

// Go High Level — prefer Script Properties in production (see getGhlApiKey_)
var GHL_API_KEY = 'pit-9c49a369-389c-449a-b5ec-be896e1d0513';
var GHL_LOCATION_ID = 'Y7TUqIGYCDeWE59oS1DS';
var GHL_STATUS_HEADER = 'GHL Status';
var GHL_REQUIRED_FIELDS = ['Name', 'Phone'];

/**
 * Optional: store GHL_API_KEY in Project Settings → Script properties as GHL_API_KEY
 */
function getGhlApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('GHL_API_KEY') || GHL_API_KEY;
}
