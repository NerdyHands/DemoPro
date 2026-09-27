const { formatDate, safeTrim } = require('../formatters');

function renderClientReportDocx(report) {
  const reportNumber = safeTrim(report?.reportNumber) || safeTrim(report?._id) || 'N/A';
  const title = safeTrim(report?.title) || `Client Report ${reportNumber}`;

  const blocks = [];
  blocks.push({ type: 'p', text: `Report Number: ${reportNumber}` });
  blocks.push({ type: 'p', text: `Report Date: ${formatDate(report?.reportDate)}` });
  blocks.push({ type: 'p', text: `Status: ${safeTrim(report?.status) || 'N/A'}` });
  blocks.push({ type: 'p', text: `Customer: ${safeTrim(report?.customerName) || 'N/A'}` });
  if (safeTrim(report?.propertyAddress)) {
    blocks.push({ type: 'p', text: `Property: ${safeTrim(report.propertyAddress)}` });
  }
  if (report?.contractId) {
    const contractRef = typeof report.contractId === 'object'
      ? (safeTrim(report.contractId.contractNumber) || safeTrim(report.contractId.title) || safeTrim(report.contractId._id))
      : safeTrim(report.contractId);
    if (contractRef) {
      blocks.push({ type: 'p', text: `Contract: ${contractRef}` });
    }
  }

  const tasks = Array.isArray(report?.tasks) ? report.tasks : [];
  if (tasks.length > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Tasks', bold: true });
    const rows = [['#', 'Description', 'Status', 'Notes']];
    tasks.forEach((t) => {
      rows.push([
        safeTrim(t?.taskNumber) || '',
        safeTrim(t?.description) || '',
        safeTrim(t?.status) || '',
        safeTrim(t?.notes) || ''
      ]);
    });
    blocks.push({ type: 'table', rows, columnWidths: [8, 52, 15, 25] });
  }

  const lineItems = Array.isArray(report?.lineItems) ? report.lineItems : [];
  if (lineItems.length > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Line Items', bold: true });
    const rows = [['#', 'Description', 'Status', 'Notes']];
    lineItems.forEach((li) => {
      rows.push([
        safeTrim(li?.lineItemNumber) || '',
        safeTrim(li?.description) || '',
        safeTrim(li?.inspectionStatus) || '',
        safeTrim(li?.inspectionNotes) || ''
      ]);
    });
    blocks.push({ type: 'table', rows, columnWidths: [8, 52, 15, 25] });
  }

  const recommendations = Array.isArray(report?.recommendations) ? report.recommendations : [];
  if (recommendations.length > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Recommendations', bold: true });
    recommendations.forEach((r, idx) => {
      const line = `${idx + 1}. ${safeTrim(r?.description) || ''}${safeTrim(r?.priority) ? ` (Priority: ${safeTrim(r.priority)})` : ''}`;
      blocks.push({ type: 'p', text: line });
    });
  } else if (safeTrim(report?.futureWork)) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Recommendations', bold: true });
    blocks.push({ type: 'p', text: safeTrim(report.futureWork) });
  }

  return { title, blocks };
}

module.exports = { renderClientReportDocx };

