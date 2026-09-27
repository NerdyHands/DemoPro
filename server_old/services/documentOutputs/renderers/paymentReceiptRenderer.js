const { formatCurrency, formatDate, customerDisplayName, safeTrim } = require('../formatters');

function renderPaymentReceiptDocx(payment, contract, customer, milestone) {
  const contractNumber = safeTrim(contract?.contractNumber) || safeTrim(contract?._id) || 'N/A';
  const title = `Payment Receipt - ${contractNumber}`;
  const clientName = customerDisplayName(customer) || safeTrim(contract?.clientName) || 'Client';

  const blocks = [];
  blocks.push({ type: 'p', text: `Date: ${formatDate(payment?.date || new Date())}` });
  blocks.push({ type: 'p', text: `Client: ${clientName}` });
  blocks.push({ type: 'p', text: `Contract Number: ${contractNumber}` });
  if (safeTrim(contract?.propertyAddress)) {
    blocks.push({ type: 'p', text: `Property: ${safeTrim(contract.propertyAddress)}` });
  }
  if (safeTrim(milestone?.title)) {
    blocks.push({ type: 'p', text: `Milestone: ${safeTrim(milestone.title)}` });
  }

  blocks.push({ type: 'p', text: '' });
  blocks.push({ type: 'p', text: 'Payment Details', bold: true });
  blocks.push({ type: 'p', text: `Amount Paid: ${formatCurrency(payment?.amount || 0)}`, bold: true });
  blocks.push({ type: 'p', text: `Method: ${safeTrim(payment?.method) || 'N/A'}` });
  if (safeTrim(payment?.transactionId)) {
    blocks.push({ type: 'p', text: `Transaction ID: ${safeTrim(payment.transactionId)}` });
  }
  if (safeTrim(payment?.notes)) {
    blocks.push({ type: 'p', text: `Notes: ${safeTrim(payment.notes)}` });
  }

  const totalContract = Number(contract?.totalAmount) || 0;
  const totalPaid = (() => {
    if (milestone?.payment?.partialPayments && Array.isArray(milestone.payment.partialPayments)) {
      return milestone.payment.partialPayments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
    }
    return Number(payment?.amount) || 0;
  })();
  const remaining = totalContract - totalPaid;

  if (totalContract > 0) {
    blocks.push({ type: 'p', text: '' });
    blocks.push({ type: 'p', text: 'Contract Summary', bold: true });
    blocks.push({ type: 'p', text: `Total Contract Amount: ${formatCurrency(totalContract)}` });
    blocks.push({ type: 'p', text: `Total Paid To Date: ${formatCurrency(totalPaid)}` });
    blocks.push({ type: 'p', text: `Remaining Balance: ${formatCurrency(remaining)}` });
  }

  return { title, blocks };
}

module.exports = { renderPaymentReceiptDocx };

