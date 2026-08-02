/**
 * Make.com webhook — forward sheet row data to a Make scenario.
 * Requires Config.js (MAKE_WEBHOOK_URL, SHEET_HEADERS).
 */

function sendSelectedRowToMake() {
  var sheet = SpreadsheetApp.getActiveSheet();

  if (sheet.getName() !== SHEET_NAME) {
    SpreadsheetApp.getUi().alert('Select a row on "' + SHEET_NAME + '".');
    return;
  }

  var row = sheet.getActiveRange().getRow();
  if (row === 1) {
    SpreadsheetApp.getUi().alert('Select a data row (not the header).');
    return;
  }

  var res = sendRowToMake_(sheet, row);
  SpreadsheetApp.getUi().alert(res.message);
}

function sendRowToMake_(sheet, row) {
  var lastCol = Math.max(sheet.getLastColumn(), SHEET_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  var record = buildRecord_(headers, values);

  return sendRecordToMake_(record);
}

function sendRecordToMake_(record) {
  if (!MAKE_WEBHOOK_URL) {
    return { success: false, message: 'Make webhook URL not configured.' };
  }

  try {
    var payload = buildMakePayload_(record);

    var res = UrlFetchApp.fetch(MAKE_WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = res.getResponseCode();
    var body = res.getContentText();

    if (code >= 200 && code < 300) {
      console.log('Make webhook sent successfully', { code: code });
      return { success: true, message: 'Sent to Make ✅' };
    }

    console.error('Make webhook error', { code: code, body: body });
    return { success: false, message: 'Make error ' + code + ': ' + body };
  } catch (err) {
    console.error('Make webhook script error', err);
    return { success: false, message: 'Script Error: ' + err };
  }
}

function buildMakePayload_(record) {
  var payload = {};

  SHEET_HEADERS.forEach(function (header) {
    payload[header] = formatMakeFieldValue_(record[header]);
  });

  return payload;
}

function formatMakeFieldValue_(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  return String(value).trim();
}

function testMakeWebhook() {
  var result = sendRecordToMake_({
    'Timestamp': new Date(),
    'Form Type': 'quote_request',
    'Name': 'Test User',
    'Phone': '7575551234',
    'Business Name': 'Test Business',
    'Service Type': 'Shed Removal',
    'Address': '123 Test St, Hampton, VA',
    'Message': 'Test Make webhook',
    'Identifier': '7575551234',
    'Status': 'Valid',
    'GHL Status': ''
  });

  console.log('Make test result:', result.message);
  SpreadsheetApp.getUi().alert(result.message);
}
