function formatCurrency(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return '$0.00';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatDate(value) {
  if (!value) return 'N/A';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function safeTrim(value) {
  if (value == null) return '';
  return String(value).trim();
}

function customerDisplayName(customer) {
  if (!customer) return '';
  const person = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  return customer.businessName || person || customer.email || '';
}

function addressToString(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') return address.full || address.street || JSON.stringify(address);
  return String(address);
}

/** Job-site address first (property), then mailing (client), then customer record. */
function resolveEstimateAddress(estimate) {
  const sources = [
    estimate?.propertyAddress,
    estimate?.clientAddress,
    addressToString(estimate?.customer?.address)
  ];
  const match = sources.map(safeTrim).find((value) => value.length > 0);
  return match || '';
}

module.exports = {
  formatCurrency,
  formatDate,
  safeTrim,
  customerDisplayName,
  addressToString,
  resolveEstimateAddress
};

