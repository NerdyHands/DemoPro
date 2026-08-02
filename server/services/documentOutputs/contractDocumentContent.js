const { formatDate, customerDisplayName, addressToString, safeTrim } = require('./formatters');

const COMPANY_NAME = 'Castleton Real Estate, LLC dba Mr Demo Pro';
const COMPANY_LICENSE = 'Class A - Residential Building Contractor, DPOR License #2705161677';
const COMPANY_ADDRESS = '24922 Castleton Dr Chantilly VA 20152';

function formatPriceWhole(price) {
  if (price == null && price !== 0) return '$0';
  const number = typeof price === 'number' ? price : parseFloat(price);
  if (Number.isNaN(number)) return '$0';
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function resolveClientAddress(contract, customer) {
  let clientAddress = customer?.address
    ? customer.address
    : contract?.clientAddress || contract?.customerAddress || 'N/A';

  if (typeof clientAddress === 'string' && clientAddress.startsWith('{')) {
    try {
      const parsed = JSON.parse(clientAddress);
      clientAddress = parsed.full || clientAddress;
    } catch {
      const fullMatch = clientAddress.match(/full:\s*'([^']+)'/);
      if (fullMatch) clientAddress = fullMatch[1];
    }
  }
  if (typeof clientAddress === 'object' && clientAddress !== null) {
    clientAddress = clientAddress.full || JSON.stringify(clientAddress);
  }
  const text = typeof clientAddress === 'string' ? clientAddress.trim() : '';
  return text.length > 0 ? text : 'Address not provided';
}

function resolveClientName(contract, customer) {
  const contractName = safeTrim(contract?.clientName || contract?.customerName);
  if (contractName) return contractName;
  const fromCustomer = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : '';
  return fromCustomer || 'N/A';
}

function cleanHeading(text = '') {
  let result = text.trim();
  if (!result) return '';
  const prefixPattern = /^(contract|estimate)\s+for\s+/i;
  while (prefixPattern.test(result)) {
    result = result.replace(prefixPattern, '').trim();
  }
  return result;
}

function estimateSummarySubtitle(contract, customer, estimate) {
  const clientNameVariants = new Set(
    [
      contract?.clientName,
      contract?.customerName,
      customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : null,
      customer?.firstName,
      customer?.lastName
    ]
      .filter(Boolean)
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0)
  );
  const isClientName = (value) => {
    if (!value) return false;
    return clientNameVariants.has(value.trim().toLowerCase());
  };

  if (contract?.title?.trim()) {
    const cleaned = cleanHeading(contract.title);
    if (cleaned && !isClientName(cleaned)) return cleaned;
  }
  if (contract?.propertyAddress?.trim()) {
    return `Property: ${contract.propertyAddress.trim()}`;
  }
  if (estimate?.estimateNumber) return `Estimate #${estimate.estimateNumber}`;
  if (estimate?.title?.trim()) {
    const cleaned = cleanHeading(estimate.title);
    if (cleaned && !isClientName(cleaned)) return cleaned;
  }
  return 'PICRA Repair Estimate';
}

function mergeLineItems(contract, estimate) {
  const lineItems = contract?.lineItems;
  if (lineItems?.length > 0) {
    return lineItems.map((contractItem, index) => {
      const estimateItem = estimate?.lineItems?.[index];
      const description =
        contractItem.description?.trim() && contractItem.description !== 'N/A'
          ? contractItem.description
          : estimateItem?.description || 'N/A';
      const quantity =
        contractItem.quantity != null && contractItem.quantity > 0
          ? contractItem.quantity
          : estimateItem?.quantity ?? 1;
      const unitPrice =
        typeof contractItem.unitPrice === 'number'
          ? contractItem.unitPrice
          : estimateItem?.unitPrice ?? 0;
      const totalPrice =
        typeof contractItem.totalPrice === 'number'
          ? contractItem.totalPrice
          : quantity * unitPrice;
      const notes =
        contractItem.notes?.length > 0 ? contractItem.notes : estimateItem?.notes || [];
      return { description, quantity, unitPrice, totalPrice, notes };
    });
  }
  if (estimate?.lineItems?.length > 0) return estimate.lineItems;
  return [];
}

function buildDrawSchedule(contract, milestones = []) {
  const totalContractAmount = Number(contract?.totalAmount) || 0;
  let draws = [];

  if (contract?.paymentSchedule?.length > 0) {
    contract.paymentSchedule.forEach((item) => {
      if (item.title && item.amount !== undefined) {
        const amount = Number(item.amount) || 0;
        const pct = totalContractAmount > 0 ? amount / totalContractAmount : 0;
        draws.push({ label: item.title, pct, amount });
      }
    });
  }

  if (draws.length === 0 && milestones?.length > 0) {
    milestones.forEach((milestone) => {
      if (milestone.type === 'Payment' && milestone.payment?.amount) {
        const amount = milestone.payment.amount;
        const pct = totalContractAmount > 0 ? amount / totalContractAmount : 0;
        draws.push({
          label: milestone.title || 'Payment Milestone',
          pct,
          amount
        });
      }
    });
  }

  if (draws.length === 0) {
    const drawScheduleType = contract?.drawScheduleType || 'regular';
    if (drawScheduleType === 'demolition') {
      draws = [
        { label: 'Deposit/ Before Work Begins ', pct: 0.15 },
        { label: 'Structure Disassembly Completion (primary demo complete)', pct: 0.45 },
        { label: 'Debris Removal and Disposal', pct: 0.3 },
        { label: 'Final Site Clean and Client Sign-off', pct: 0.1 }
      ];
    } else {
      const depositAmount = contract.depositAmount ?? totalContractAmount * 0.3;
      const depositPct = totalContractAmount > 0 ? depositAmount / totalContractAmount : 0.3;
      draws = [
        { label: 'Deposit/ Before Work Begins', pct: depositPct },
        { label: 'Final Payment Upon Completion', pct: 1 - depositPct }
      ];
    }
  }

  return draws.map((d) => {
    const amount = d.amount !== undefined ? d.amount : totalContractAmount * (d.pct || 0);
    const pct = d.pct !== undefined ? d.pct : totalContractAmount > 0 ? amount / totalContractAmount : 0;
    return { label: d.label, pct, amount };
  });
}

function drawScheduleNote(contract) {
  if (contract?.paymentSchedule?.length > 0) {
    return 'Note: Payment milestones are invoiced upon completion of each listed milestone. Variations in scope or unforeseen conditions may adjust the schedule proportionally upon written agreement.';
  }
  const drawScheduleType = contract?.drawScheduleType || 'regular';
  return drawScheduleType === 'demolition'
    ? 'Note: Draws are invoiced upon completion of each listed milestone. Variations in scope or unforeseen conditions may adjust the schedule proportionally upon written agreement.'
    : 'Note: The deposit is required before work begins. The final payment is due upon project completion and client satisfaction.';
}

function sectionHeader(number, title) {
  return [
    { type: 'spacer' },
    { type: 'h2', text: `${number}. ${title}` }
  ];
}

function subsection(title, body) {
  const blocks = [{ type: 'h3', text: title }];
  if (Array.isArray(body)) {
    body.forEach((line) => blocks.push({ type: 'p', text: line }));
  } else if (body) {
    blocks.push({ type: 'p', text: body });
  }
  return blocks;
}

/**
 * Build DOCX blocks mirroring contract PDF structure and legal copy.
 */
function buildContractDocxBlocks(contract, customer, estimate, milestones = []) {
  const blocks = [];
  const clientName = resolveClientName(contract, customer);
  const clientAddressText = resolveClientAddress(contract, customer);
  const propertyAddress = safeTrim(contract?.propertyAddress);
  const contractorName = safeTrim(contract?.contractorName) || COMPANY_NAME;
  const contractorAddress = safeTrim(contract?.contractorAddress) || COMPANY_ADDRESS;

  // Header (matches PDF addModernHeader)
  blocks.push({ type: 'center', text: COMPANY_NAME, bold: true });
  blocks.push({ type: 'center', text: COMPANY_LICENSE });
  blocks.push({ type: 'center', text: COMPANY_ADDRESS });
  blocks.push({ type: 'spacer' });
  blocks.push({ type: 'center', text: 'Residential', bold: true });
  blocks.push({ type: 'center', text: 'Demolition Contract', bold: true });
  blocks.push({ type: 'center', text: 'Professional • Reliable • Insured', bold: true });
  blocks.push({ type: 'spacer' });

  const lineItems = mergeLineItems(contract, estimate);
  const totalAmount =
    contract?.totalAmount != null
      ? contract.totalAmount
      : estimate?.totalAmount ?? 0;

  if (lineItems.length > 0) {
    blocks.push({ type: 'h1', text: 'ESTIMATE SUMMARY' });
    blocks.push({ type: 'center', text: estimateSummarySubtitle(contract, customer, estimate), bold: true });
    blocks.push({ type: 'spacer' });
    blocks.push({ type: 'h3', text: 'Line Items:' });

    const rows = [['Item', 'Description', 'Qty', 'Unit', 'Total']];
    lineItems.forEach((item, i) => {
      let desc = safeTrim(item.description) || 'N/A';
      const validNotes = (item.notes || []).filter((n) => n && safeTrim(n));
      if (validNotes.length > 0) {
        desc += '\n' + validNotes.map((n) => `• ${safeTrim(n)}`).join('\n');
      }
      rows.push([
        `#${i + 1}`,
        desc,
        String(item.quantity ?? 1),
        formatPriceWhole(item.unitPrice || 0),
        formatPriceWhole(item.totalPrice || 0)
      ]);
    });
    blocks.push({ type: 'table', rows, columnWidths: [8, 52, 10, 15, 15] });
    blocks.push({ type: 'spacer' });
    blocks.push({ type: 'p', text: `TOTAL: ${formatPriceWhole(totalAmount)}`, bold: true });
    blocks.push({ type: 'spacer' });
  }

  // Parties (matches PDF addPartiesSection)
  blocks.push({ type: 'h2', text: 'CONTRACTOR' });
  blocks.push({ type: 'p', text: contractorName, bold: true });
  blocks.push({ type: 'p', text: COMPANY_LICENSE });
  blocks.push({ type: 'p', text: contractorAddress });
  blocks.push({ type: 'spacer' });
  blocks.push({ type: 'h2', text: 'CLIENT' });
  blocks.push({ type: 'p', text: clientName, bold: true });
  blocks.push({ type: 'p', text: clientAddressText });
  if (propertyAddress && propertyAddress !== clientAddressText) {
    blocks.push({ type: 'p', text: `Property: ${propertyAddress}` });
  }
  blocks.push({ type: 'spacer' });

  // Section 1: Scope of Work
  blocks.push(...sectionHeader('1', 'Scope of Work'));
  blocks.push(
    ...subsection('1.1 Services Overview', [
      "Contractor agrees to perform demolition services at the client's property as outlined in the demolition contract and detailed in the written price estimate. All work will be completed in a professional manner consistent with industry standards and in accordance with the agreed-upon inspection report items."
    ])
  );
  blocks.push({ type: 'spacer' });
  blocks.push(
    ...subsection('1.2 Services Typically Include', [
      'Demolition will be performed according to generally accepted demolition practices, in compliance with applicable codes — including the Virginia Uniform Statewide Building Code (VUSBC) and the International Residential Code (IRC) as adopted by Virginia — and in alignment with the NAHB Residential Construction Performance Guidelines.',
      'Work will include:'
    ])
  );
  blocks.push({
    type: 'bullets',
    items: [
      'Completing the agreed-upon demolition and removal as outlined in the project scope or estimate',
      'Protecting adjacent areas, surfaces, and fixtures as needed to prevent damage during demolition',
      'Disposing of all debris, materials, and waste in accordance with local requirements',
      'Cleaning and organizing the jobsite after work is finished to ensure it is safe, presentable, and ready for the next phase of the project.'
    ]
  });

  // Section 2
  blocks.push(...sectionHeader('2', 'Consultation and Estimate'));
  blocks.push(
    ...subsection('2.1 Professional Consultation Service', [
      'Contractor may provide a comprehensive on-site demolition assessment and project consultation, including a review of the demolition scope and a detailed walkthrough of the areas to be removed or affected. If the client chooses not to proceed with the proposed demolition work, any applicable assessment or consultation fee will be non-refundable unless otherwise agreed in writing.'
    ])
  );

  // Section 3: Payment Terms
  blocks.push(...sectionHeader('3', 'Payment Terms'));
  blocks.push(...subsection('3.1 Total Contract Amount', [formatPriceWhole(contract?.totalAmount)]));
  blocks.push({ type: 'spacer' });

  blocks.push({ type: 'h3', text: '3.2 Draw Schedule' });
  const draws = buildDrawSchedule(contract, milestones);
  const drawRows = [['Milestone', '%', 'Amount']];
  draws.forEach((d) => {
    drawRows.push([
      d.label,
      `${Math.round((d.pct || 0) * 100)}%`,
      formatPriceWhole(d.amount)
    ]);
  });
  blocks.push({ type: 'table', rows: drawRows, columnWidths: [60, 15, 25] });
  blocks.push({ type: 'p', text: drawScheduleNote(contract), italic: true });
  blocks.push({ type: 'spacer' });

  blocks.push(
    ...subsection('3.3 Final Payment', [
      'The remaining balance is due immediately upon project completion and client satisfaction. Payment should be made using the same method provided for the deposit unless alternative arrangements have been made in advance.'
    ])
  );
  blocks.push(
    ...subsection('3.4 Accepted Payment Methods', [
      'We accept electronic card payments through our secure Stripe payment system, as well as personal or business checks made payable to the contractor.',
      'Initial here if payment will be made at closing: ______ (Client Initials)',
      'Note: If payment is to be made at closing, contractor may require documentation confirming closing date and funds availability.'
    ])
  );

  // Section 4
  blocks.push(...sectionHeader('4', 'Project Timeline'));
  const startDate = contract?.startDate ? formatDate(contract.startDate) : '[Insert Start Date]';
  const endDate = contract?.endDate ? formatDate(contract.endDate) : '[Insert End Date]';
  blocks.push(
    ...subsection('4.1 Project Start Date', [
      `Work is scheduled to commence on or around: ${startDate}`,
      ...(contract?.endDate ? [`Projected completion date: ${endDate}`] : []),
      'The contractor will make every reasonable effort to complete the project within the estimated timeframe discussed during consultation.'
    ])
  );
  blocks.push(
    ...subsection('4.2 Timeline Considerations', [
      'Project completion dates are subject to weather conditions, material availability, and any unforeseen circumstances. The contractor will communicate any delays or changes to the schedule promptly and work with the client to minimize disruption.'
    ])
  );

  // Section 5
  blocks.push(...sectionHeader('5', 'Change Orders and Modifications'));
  blocks.push(
    ...subsection('5.1 Change Order Requirements', [
      'Any modifications to the scope of work, cost, materials, or timeline must be detailed in a written change order signed by both parties before work begins. Verbal agreements or modifications are not binding and will not be recognized as valid amendments to this contract.'
    ])
  );
  blocks.push(
    ...subsection('5.2 Change Order Process', [
      'Change orders must include: (1) detailed description of the modification, (2) impact on project timeline, (3) adjusted cost, (4) any additional materials required, and (5) signatures of both parties. Work on change orders will not commence until the signed change order is received.'
    ])
  );

  // Section 6
  blocks.push(...sectionHeader('6', 'Permits and Compliance'));
  blocks.push(
    ...subsection('6.1 Permits and Inspections', [
      'The contractor will obtain and pay for all required permits and inspections necessary for the completion of this project. The contractor will ensure all work complies with applicable building codes, zoning regulations, and local ordinances.'
    ])
  );
  blocks.push(
    ...subsection('6.2 Code Compliance', [
      'All work performed under this contract will comply with the Virginia Uniform Statewide Building Code and any applicable local building codes, zoning ordinances, and regulations. The contractor is responsible for ensuring code compliance and obtaining final inspections.'
    ])
  );

  // Section 7
  blocks.push(...sectionHeader('7', 'Liability and Insurance'));
  blocks.push(
    ...subsection('7.1 Insurance Coverage', [
      'Contractor maintains comprehensive general liability insurance with minimum coverage of $1,000,000 to protect both parties during the course of work.'
    ])
  );
  blocks.push(
    ...subsection('7.2 Contractor Liability', [
      'The contractor agrees to indemnify and hold the client harmless against any claims or damages resulting from contractor negligence or failure to perform work according to this agreement.'
    ])
  );
  blocks.push(
    ...subsection('7.3 Client Acknowledgment', [
      'The client acknowledges that renovation work may involve inherent risks and agrees to hold the contractor harmless for pre-existing conditions, hidden defects, or unforeseen issues discovered within the property during the course of work.'
    ])
  );
  blocks.push(
    ...subsection('7.4 Virginia Contractor Transaction Recovery Fund', [
      'The Virginia Contractor Transaction Recovery Fund may provide recovery for losses suffered by homeowners due to poor workmanship or failure to perform by licensed contractors. For information about filing a claim, contact the Virginia Department of Professional and Occupational Regulation (DPOR) at (804) 367-8511 or visit www.dpor.virginia.gov.'
    ])
  );

  // Section 8
  blocks.push(...sectionHeader('8', 'Contract Termination'));
  blocks.push(
    ...subsection('8.1 Termination Notice', [
      'Either party may terminate this contract by providing three (3) days written notice to the other party.',
      'Initial here to waive the 3-day termination notice requirement: ______ (Client Initials)',
      'Note: By initialing above, client agrees they will not have the standard three day waiting period and may will be repsonsible for cost associated with the termination of the contract immediately. Contractor will provide list of cost incurrend with 2 business days of contract termination.'
    ])
  );
  blocks.push(
    ...subsection('8.2 Termination by Client', [
      'If the client terminates the contract after work has begun, any deposit will be forfeited. Additionally, any work completed up to the termination point will be invoiced separately and is due upon termination.'
    ])
  );

  // Section 9
  blocks.push(...sectionHeader('9', 'Dispute Resolution'));
  blocks.push(
    ...subsection('9.1 Good Faith Negotiation', [
      'Any disputes arising from this contract will first be addressed through direct, good-faith negotiation between the parties.'
    ])
  );
  blocks.push(
    ...subsection('9.2 Mediation Process', [
      'If direct negotiation fails to resolve the dispute, the matter will be submitted to professional mediation in accordance with the rules of the Virginia Mediation Network or another mutually agreed-upon mediation organization.'
    ])
  );

  // Section 10
  blocks.push(...sectionHeader('10', 'Governing Law'));
  blocks.push({
    type: 'p',
    text:
      'This contract shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia. Any legal proceedings related to this contract shall be conducted in Virginia courts.'
  });

  // Section 11
  blocks.push(...sectionHeader('11', 'Entire Agreement'));
  blocks.push({
    type: 'p',
    text:
      'This document represents the complete and entire agreement between the parties and supersedes all prior negotiations, discussions, or agreements, whether written or verbal. Only written modifications signed by both parties constitute binding amendments to this contract. Verbal agreements or modifications are not enforceable.'
  });

  // Section 12: Signatures
  blocks.push(...sectionHeader('12', 'Signatures'));
  blocks.push({ type: 'spacer' });
  blocks.push({ type: 'h3', text: 'CLIENT SIGNATURE' });
  blocks.push({ type: 'p', text: `Client Name: ${clientName}` });
  blocks.push({ type: 'p', text: 'Date: _________________________' });
  blocks.push({ type: 'p', text: 'Client Signature: _________________________' });
  blocks.push({ type: 'spacer' });
  blocks.push({ type: 'h3', text: 'CONTRACTOR SIGNATURE' });
  blocks.push({ type: 'p', text: `Company Name: ${COMPANY_NAME}` });
  blocks.push({ type: 'p', text: 'Date: _________________________' });
  blocks.push({ type: 'p', text: 'Contractor Signature: _________________________' });

  if (safeTrim(contract?.terms)) {
    blocks.push({ type: 'spacer' });
    blocks.push({ type: 'h2', text: 'Additional Terms' });
    blocks.push({ type: 'p', text: safeTrim(contract.terms) });
  }
  if (safeTrim(contract?.notes)) {
    blocks.push({ type: 'spacer' });
    blocks.push({ type: 'h2', text: 'Notes' });
    blocks.push({ type: 'p', text: safeTrim(contract.notes) });
  }

  const contractNumber = safeTrim(contract?.contractNumber) || safeTrim(contract?._id) || 'N/A';
  const title = safeTrim(contract?.title) || `Residential Demolition Contract ${contractNumber}`;

  return { title, blocks };
}

module.exports = {
  buildContractDocxBlocks,
  COMPANY_NAME,
  formatPriceWhole
};
