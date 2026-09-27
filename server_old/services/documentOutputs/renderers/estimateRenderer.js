const { formatCurrency, formatDate, customerDisplayName, resolveEstimateAddress, safeTrim } = require('../formatters');

function renderEstimateDocx(estimate) {
  const estimateNumber = safeTrim(estimate?.estimateNumber) || safeTrim(estimate?.estimateId) || safeTrim(estimate?._id) || 'N/A';
  const title = safeTrim(estimate?.title) || `Estimate ${estimateNumber}`;
  const customerName = customerDisplayName(estimate?.customer) || safeTrim(estimate?.customerName) || 'Customer';
  const address = resolveEstimateAddress(estimate) || 'N/A';

  const blocks = [];
  blocks.push({ type: 'p', text: `Estimate Number: ${estimateNumber}` });
  blocks.push({ type: 'p', text: `Customer: ${customerName}` });
  blocks.push({ type: 'p', text: `Address: ${address}` });
  blocks.push({ type: 'p', text: `Status: ${safeTrim(estimate?.status) || 'N/A'}` });
  blocks.push({ type: 'p', text: `Date: ${formatDate(estimate?.createdAt || estimate?.updatedAt)}` });

  if (safeTrim(estimate?.description)) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Description', bold: true });
    blocks.push({ type: 'p', text: safeTrim(estimate.description) });
  }

  const lineItems = Array.isArray(estimate?.lineItems) ? estimate.lineItems : [];
  blocks.push({ type: 'p', text: '' });
  blocks.push({ type: 'p', text: 'Line Items', bold: true });
  const rows = [['#', 'Description', 'Qty', 'Unit', 'Total']];
  lineItems.forEach((li, idx) => {
    rows.push([
      String(idx + 1),
      safeTrim(li.description) || 'N/A',
      li.quantity != null ? String(li.quantity) : '1',
      formatCurrency(li.unitPrice || 0),
      formatCurrency(li.totalPrice || 0)
    ]);
  });
  blocks.push({ type: 'table', rows, columnWidths: [6, 54, 10, 15, 15] });

  blocks.push({ type: 'p', text: '' });
  blocks.push({ type: 'p', text: `Total Amount: ${formatCurrency(estimate?.totalAmount || 0)}`, bold: true });

  if (safeTrim(estimate?.notes)) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Notes', bold: true });
    blocks.push({ type: 'p', text: safeTrim(estimate.notes) });
  }

  return { title, blocks };
}

module.exports = { renderEstimateDocx };

