const { formatCurrency, formatDate, customerDisplayName, addressToString, safeTrim } = require('../formatters');

function renderFinalInvoiceDocx(contract, customer, amendments = []) {
  const contractNumber = safeTrim(contract?.contractNumber) || safeTrim(contract?._id) || 'N/A';
  const title = `Final Invoice - ${contractNumber}`;
  const clientName = customerDisplayName(customer) || safeTrim(contract?.clientName) || 'Client';
  const address = safeTrim(contract?.propertyAddress) || addressToString(customer?.address) || safeTrim(contract?.clientAddress) || 'N/A';

  const originalAmount = Number(contract?.totalAmount) || 0;
  const totalAmendments = Array.isArray(amendments)
    ? amendments.reduce((sum, a) => sum + (Number(a?.totalCostChange) || 0), 0)
    : 0;
  const finalTotal = originalAmount + totalAmendments;

  const blocks = [];
  blocks.push({ type: 'p', text: `Invoice Date: ${formatDate(new Date())}` });
  blocks.push({ type: 'p', text: `Contract Number: ${contractNumber}` });
  blocks.push({ type: 'p', text: `Client: ${clientName}` });
  blocks.push({ type: 'p', text: `Property: ${address}` });
  blocks.push({ type: 'p', text: `Contract Status: ${safeTrim(contract?.status) || 'N/A'}` });

  blocks.push({ type: 'p', text: '' });
  blocks.push({ type: 'p', text: 'Summary', bold: true });
  blocks.push({ type: 'p', text: `Original Contract Amount: ${formatCurrency(originalAmount)}` });
  blocks.push({ type: 'p', text: `Total Amendments: ${formatCurrency(totalAmendments)}` });
  blocks.push({ type: 'p', text: `Total Amount Due: ${formatCurrency(finalTotal)}`, bold: true });

  if (Array.isArray(amendments) && amendments.length > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Approved Amendments', bold: true });
    const rows = [['Amendment #', 'Title', 'Date', 'Impact']];
    amendments.forEach((a) => {
      rows.push([
        safeTrim(a?.amendmentNumber) || safeTrim(a?._id) || 'N/A',
        safeTrim(a?.title) || 'N/A',
        formatDate(a?.createdAt),
        formatCurrency(a?.totalCostChange || 0)
      ]);
    });
    blocks.push({ type: 'table', rows, columnWidths: [18, 52, 15, 15] });
  }

  return { title, blocks };
}

module.exports = { renderFinalInvoiceDocx };

