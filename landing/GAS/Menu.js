/**
 * Spreadsheet custom menu — single onOpen entry point for the whole project.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Mr Demo Pro')
    .addItem('Setup / Reset Sheet Headers', 'setupSpreadsheet')
    .addSeparator()
    .addItem('Test Form Submission', 'testFormSubmission')
    .addItem('Test Email Notification', 'testEmailNotification')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('GHL')
        .addItem('Send Selected Row', 'sendSelectedRowToGHL')
        .addItem('Install Auto-Send on Edit', 'installOnEditTrigger')
    )
    .addSubMenu(
      ui.createMenu('Make')
        .addItem('Send Selected Row', 'sendSelectedRowToMake')
        .addItem('Test Webhook', 'testMakeWebhook')
    )
    .addToUi();
}
