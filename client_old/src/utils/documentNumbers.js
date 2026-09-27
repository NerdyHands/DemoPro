function normalizeAddressText(address) {
  if (!address) return '';
  if (typeof address === 'string') return address.trim();
  if (typeof address === 'object') {
    return String(address.full || address.street || address.line1 || '').trim();
  }
  return '';
}

function extractStreetNumber(address) {
  const text = normalizeAddressText(address);
  if (!text) return null;
  const match = text.match(/^(\d+[A-Za-z]?)/);
  return match ? match[1] : null;
}

function extractStreetName(address) {
  const text = normalizeAddressText(address);
  if (!text) return null;

  let rest = text.replace(/^\d+[A-Za-z]?\s+/, '').trim();
  if (!rest) return null;

  if (rest.includes(',')) {
    rest = rest.split(',')[0].trim();
  } else {
    rest = rest.replace(/\s+[A-Z]{2}\s+\d{5}(-\d{4})?$/i, '').trim();
  }

  return rest || null;
}

function slugifyStreetName(streetName) {
  if (!streetName) return 'Street';
  return streetName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function resolveStreetNumber({ propertyAddress, clientAddress, customer, title } = {}) {
  return (
    extractStreetNumber(propertyAddress)
    || extractStreetNumber(clientAddress)
    || extractStreetNumber(customer?.address)
    || extractStreetNumber(title)
    || '000'
  );
}

function resolveStreetName({ propertyAddress, clientAddress, customer, title } = {}) {
  const streetName = (
    extractStreetName(propertyAddress)
    || extractStreetName(clientAddress)
    || extractStreetName(customer?.address)
    || extractStreetName(title)
  );

  if (streetName) return slugifyStreetName(streetName);

  const fallback = normalizeAddressText(propertyAddress)
    || normalizeAddressText(clientAddress)
    || normalizeAddressText(customer?.address)
    || normalizeAddressText(title);

  if (fallback) {
    const withoutNumber = fallback.replace(/^\d+[A-Za-z]?\s+/, '').split(',')[0].trim();
    if (withoutNumber) return slugifyStreetName(withoutNumber);
  }

  return 'Street';
}

export function previewDocumentNumber(prefix, { propertyAddress, clientAddress, customer, title } = {}) {
  const streetNumber = resolveStreetNumber({ propertyAddress, clientAddress, customer, title });
  const streetNameSlug = resolveStreetName({ propertyAddress, clientAddress, customer, title });
  return `${prefix}-${streetNumber}-${streetNameSlug}`;
}

export function previewEstimateNumber(context) {
  return previewDocumentNumber('EST', context);
}

export function previewContractNumber(context, estimateNumber) {
  if (estimateNumber && /^EST-/i.test(estimateNumber)) {
    return estimateNumber.replace(/^EST-/i, 'CON-');
  }
  return previewDocumentNumber('CON', context);
}
