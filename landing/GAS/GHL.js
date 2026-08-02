/**
 * Go High Level (GHL) integration — sync valid sheet rows to contacts.
 * Requires Config.js (SHEET_NAME, GHL_*), Make.js, and Menu.js (onOpen lives there).
 */

function onEdit(e) {
  handleSheetEdit_(e);
}

function onEditInstalled(e) {
  handleSheetEdit_(e);
}

function installOnEditTrigger() {
  var ss = SpreadsheetApp.getActive();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onEditInstalled') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('onEditInstalled')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert('GHL auto-send trigger installed.');
}

function sendSelectedRowToGHL() {
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

  var res = sendRowToGHL_(sheet, row);
  SpreadsheetApp.getUi().alert(res.message);
}

function handleSheetEdit_(e) {
  if (!e) return;

  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  // Avoid infinite loop when writing GHL status
  if (col === getGhlStatusColumnIndex_(sheet)) return;
  if (row === 1) return;

  sendRowToGHL_(sheet, row);
}

function sendRowToGHL_(sheet, row) {
  ensureGhlStatusColumn_(sheet);

  var lastCol = Math.max(sheet.getLastColumn(), SHEET_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  var record = buildRecord_(headers, values);

  var status = String(record['Status'] || '').trim();
  if (status && status.indexOf('Valid') !== 0) {
    return writeGhlStatus_(sheet, row, 'Skipped (not valid)');
  }

  var existing = String(record[GHL_STATUS_HEADER] || '').trim();
  if (existing.indexOf('Sent') === 0) {
    return { success: true, message: 'Already sent to GHL.' };
  }

  if (!hasRequiredGhlData_(record)) {
    return writeGhlStatus_(sheet, row, 'Missing required fields');
  }

  return sendToGHL_(sheet, row, record);
}

function sendToGHL_(sheet, row, record) {
  try {
    var parsed = parseLeadFromRecord_(record);

    if (!parsed.email && !parsed.phone) {
      return writeGhlStatus_(sheet, row, 'Missing email AND phone');
    }

    var tags = ['Google Sheet Lead'];
    if (parsed.serviceType) tags.push(parsed.serviceType);

    var payload = {
      locationId: GHL_LOCATION_ID,
      firstName: parsed.firstName || 'Unknown',
      lastName: parsed.lastName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      companyName: parsed.businessName || undefined,
      address1: parsed.address || undefined,
      source: 'Website Form',
      tags: tags
    };

    var res = UrlFetchApp.fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + getGhlApiKey_(),
        Version: '2021-07-28'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = res.getResponseCode();
    var body = res.getContentText();

    if (code >= 200 && code < 300) {
      return writeGhlStatus_(sheet, row, 'Sent ✅');
    }

    return writeGhlStatus_(sheet, row, 'Error ' + code + ': ' + body);
  } catch (err) {
    return writeGhlStatus_(sheet, row, 'Script Error: ' + err);
  }
}

function writeGhlStatus_(sheet, row, message) {
  var col = getGhlStatusColumnIndex_(sheet);
  sheet.getRange(row, col).setValue(message);

  try {
    sendRowToMake_(sheet, row);
  } catch (makeError) {
    console.error('Failed to send Make webhook after GHL update:', makeError);
  }

  return { success: message.indexOf('Sent') === 0, message: message };
}

function ensureGhlStatusColumn_(sheet) {
  var col = getGhlStatusColumnIndex_(sheet);
  var header = sheet.getRange(1, col).getValue();
  if (String(header).trim() !== GHL_STATUS_HEADER) {
    sheet.getRange(1, col).setValue(GHL_STATUS_HEADER);
  }
}

function getGhlStatusColumnIndex_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), SHEET_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === GHL_STATUS_HEADER) {
      return i + 1;
    }
  }

  return SHEET_HEADERS.length;
}

function buildRecord_(headers, values) {
  var obj = {};
  headers.forEach(function (h, i) {
    if (h) obj[String(h).trim()] = values[i];
  });
  return obj;
}

function hasRequiredGhlData_(record) {
  // New column layout
  if (record['Name'] !== undefined || record['Phone'] !== undefined) {
    return GHL_REQUIRED_FIELDS.every(function (field) {
      return String(record[field] || '').trim() !== '';
    });
  }

  // Legacy columns (pre-2025 form update)
  return String(record['Name/Address'] || '').trim() !== '' &&
    String(record['Contact'] || '').trim() !== '';
}

function parseLeadFromRecord_(record) {
  if (record['Name'] !== undefined || record['Phone'] !== undefined) {
    var name = String(record['Name'] || '').trim();
    var parts = name.split(/\s+/);

    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      email: extractEmailFromRecord_(record),
      phone: normalizePhone_(record['Phone'] || ''),
      businessName: String(record['Business Name'] || '').trim(),
      serviceType: String(record['Service Type'] || '').trim(),
      address: String(record['Address'] || '').trim()
    };
  }

  return parseLegacyLeadFromRecord_(record);
}

function parseLegacyLeadFromRecord_(record) {
  var nameAddress = String(record['Name/Address'] || '').trim();
  var contact = String(record['Contact'] || '').trim();
  var nameOnly = nameAddress.split(',')[0];
  var parts = nameOnly.split(' ');

  var email = '';
  var emailMatch = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) email = emailMatch[0];

  var phone = '';
  var phoneMatch = contact.match(/(\+?1?[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  if (phoneMatch) phone = normalizePhone_(phoneMatch[0]);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    email: email,
    phone: phone,
    businessName: '',
    serviceType: '',
    address: nameAddress
  };
}

function extractEmailFromRecord_(record) {
  var identifier = String(record['Identifier'] || '').trim();
  if (identifier.indexOf('@') !== -1) {
    var match = identifier.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (match) return match[0];
  }
  return '';
}

function normalizePhone_(phone) {
  var digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return digits ? '+' + digits : '';
}
