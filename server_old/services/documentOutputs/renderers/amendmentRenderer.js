const { formatCurrency, formatDate, customerDisplayName, addressToString, safeTrim } = require('../formatters');

function renderAmendmentDocx(amendment, contract, customer) {
  const amendmentNumber = safeTrim(amendment?.amendmentNumber) || safeTrim(amendment?._id) || 'N/A';
  const contractNumber = safeTrim(contract?.contractNumber) || safeTrim(amendment?.contractNumber) || 'N/A';
  const title = safeTrim(amendment?.title) || `Amendment ${amendmentNumber}`;
  const clientName = safeTrim(amendment?.clientName) || customerDisplayName(customer) || 'Client';
  const address = safeTrim(amendment?.clientAddress) || addressToString(customer?.address) || safeTrim(amendment?.propertyAddress) || 'N/A';

  const blocks = [];
  blocks.push({ type: 'p', text: `Amendment Number: ${amendmentNumber}` });
  blocks.push({ type: 'p', text: `Contract Number: ${contractNumber}` });
  blocks.push({ type: 'p', text: `Client: ${clientName}` });
  blocks.push({ type: 'p', text: `Address: ${address}` });
  blocks.push({ type: 'p', text: `Created: ${formatDate(amendment?.createdAt)}` });
  blocks.push({ type: 'p', text: `Effective: ${formatDate(amendment?.effectiveDate)}` });

  if (safeTrim(amendment?.reason)) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Reason', bold: true });
    blocks.push({ type: 'p', text: safeTrim(amendment.reason) });
  }

  if (safeTrim(amendment?.description)) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Description', bold: true });
    blocks.push({ type: 'p', text: safeTrim(amendment.description) });
  }

  const changes = Array.isArray(amendment?.lineItemChanges) ? amendment.lineItemChanges : [];
  if (changes.length > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Line Item Changes', bold: true });
    const rows = [['#', 'Type', 'Description', 'Qty', 'Unit', 'Total', 'Impact']];
    changes.forEach((c) => {
      const li = c.updated || c.original || {};
      rows.push([
        safeTrim(c.lineItemNumber) || 'N/A',
        safeTrim(c.changeType) || 'N/A',
        safeTrim(li.description) || 'N/A',
        li.quantity != null ? String(li.quantity) : '1',
        formatCurrency(li.unitPrice || 0),
        formatCurrency(li.totalPrice || 0),
        formatCurrency(c.costImpact || 0)
      ]);
    });
    blocks.push({ type: 'table', rows, columnWidths: [6, 10, 38, 8, 12, 12, 14] });
  }

  blocks.push({ type: 'p', text: '' });
  blocks.push({ type: 'p', text: `Original Contract Amount: ${formatCurrency(amendment?.originalContractAmount || contract?.totalAmount || 0)}` });
  blocks.push({ type: 'p', text: `Total Change: ${formatCurrency(amendment?.totalCostChange || 0)}` });
  blocks.push({ type: 'p', text: `New Contract Amount: ${formatCurrency(amendment?.newContractAmount || 0)}`, bold: true });

  return { title, blocks };
}

module.exports = { renderAmendmentDocx };

