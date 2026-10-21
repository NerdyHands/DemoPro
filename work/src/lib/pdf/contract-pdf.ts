import PDFDocument from 'pdfkit';
import type { Contract, Customer, Estimate, LineItem, PaymentScheduleItem } from '@/lib/crm/types';
import { asDrawScheduleType, prefillPaymentSchedule } from '@/lib/crm/payment-schedule';
import { lineItemTotal, sumLineItems } from '@/lib/crm/line-items';

export const COMPANY_NAME = 'Castleton Real Estate, LLC dba Mr Demo Pro';
export const COMPANY_LICENSE = 'Class A - Residential Building Contractor, DPOR License #2705161677';
export const COMPANY_ADDRESS = '24922 Castleton Dr Chantilly VA 20152';
const ACCENT = '#f58220';

type PdfDoc = InstanceType<typeof PDFDocument>;

function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function formatPrice(price: number | string | null | undefined): string {
  const number = typeof price === 'number' ? price : parseFloat(String(price ?? ''));
  if (!Number.isFinite(number)) return '$0';
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function sanitizeForFilename(str?: string | null): string {
  if (!str) return '';
  return (
    str
      .replace(/[\r\n]+/g, ' ')
      .replace(/[^A-Za-z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .trim() || 'Unknown'
  );
}

function cleanHeading(text = ''): string {
  let result = text.trim();
  if (!result) return '';
  const prefixPattern = /^(contract|estimate)\s+for\s+/i;
  while (prefixPattern.test(result)) {
    result = result.replace(prefixPattern, '').trim();
  }
  return result;
}

function addressToString(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') {
    const trimmed = address.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as { full?: string; street?: string };
        return parsed.full || parsed.street || trimmed;
      } catch {
        const fullMatch = trimmed.match(/full:\s*'([^']+)'/);
        return fullMatch?.[1] || trimmed;
      }
    }
    return trimmed;
  }
  if (typeof address === 'object') {
    const record = address as { full?: string; street?: string };
    return record.full || record.street || '';
  }
  return '';
}

function resolveClientName(contract: Contract, customer: Customer | null): string {
  const fromContract = contract.clientName?.trim() || contract.customerName?.trim();
  if (fromContract) return fromContract;
  if (!customer) return 'N/A';
  return (
    customer.name?.trim() ||
    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
    'N/A'
  );
}

function resolveClientAddress(contract: Contract, customer: Customer | null): string {
  const fromContract = addressToString(contract.clientAddress);
  if (fromContract) return fromContract;
  const fromCustomer = addressToString(customer?.address);
  return fromCustomer || 'Address not provided';
}

function extractPartialAddress(contract: Contract, customer: Customer | null): string {
  let address = resolveClientAddress(contract, customer);
  if (address === 'Address not provided') address = contract.propertyAddress || '';
  if (!address) return 'Unknown_Address';

  let cleanAddress = address
    .replace(
      /,\s*(Avenue|Ave|Street|St|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Terrace|Ter|Circle|Cir|Highway|Hwy|Parkway|Pkwy)/gi,
      ''
    )
    .replace(/,\s*[A-Z]{2}\s*\d{5}(-\d{4})?/gi, '')
    .replace(/,\s*[A-Za-z\s]+,\s*[A-Z]{2}/gi, '')
    .replace(/^[^0-9]*/, '')
    .trim()
    .substring(0, 20)
    .replace(/[,\s]+$/, '');

  return cleanAddress || 'Unknown_Address';
}

function mergeLineItems(contract: Contract, estimate: Estimate | null): LineItem[] {
  if (contract.lineItems?.length) {
    return contract.lineItems.map((item, index) => {
      const estimateItem = estimate?.lineItems?.[index];
      const description =
        item.description?.trim() && item.description !== 'N/A'
          ? item.description
          : estimateItem?.description || 'N/A';
      const quantity = item.quantity != null && item.quantity > 0 ? item.quantity : estimateItem?.quantity ?? 1;
      const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : estimateItem?.unitPrice ?? 0;
      return {
        description,
        quantity,
        unitPrice,
        notes: item.notes?.length ? item.notes : estimateItem?.notes || []
      };
    });
  }
  return estimate?.lineItems ?? [];
}

function estimateSubtitle(contract: Contract, customer: Customer | null, estimate: Estimate | null): string {
  const clientNameVariants = new Set(
    [
      contract.clientName,
      contract.customerName,
      customer?.name,
      customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : null,
      customer?.firstName,
      customer?.lastName
    ]
      .filter(Boolean)
      .map(name => String(name).trim().toLowerCase())
      .filter(name => name.length > 0)
  );
  const isClientName = (value?: string) => Boolean(value && clientNameVariants.has(value.trim().toLowerCase()));

  if (contract.title?.trim()) {
    const cleaned = cleanHeading(contract.title);
    if (cleaned && !isClientName(cleaned)) return cleaned;
  }
  if (contract.propertyAddress?.trim()) return `Property: ${contract.propertyAddress.trim()}`;
  if (estimate?.estimateNumber) return `Estimate #${estimate.estimateNumber}`;
  if (estimate?.title?.trim()) {
    const cleaned = cleanHeading(estimate.title);
    if (cleaned && !isClientName(cleaned)) return cleaned;
  }
  return 'PICRA Repair Estimate';
}

function buildDraws(
  contract: Contract,
  totalAmount: number
): Array<{ label: string; pct: number; amount: number }> {
  const source =
    contract.paymentSchedule?.length > 0
      ? contract.paymentSchedule
      : prefillPaymentSchedule(asDrawScheduleType(contract.drawScheduleType), totalAmount, contract.deposit);

  return source
    .filter((item: PaymentScheduleItem) => item.title)
    .map(item => {
      const amount = Number(item.amount) || 0;
      return {
        label: item.title,
        amount,
        pct: totalAmount > 0 ? amount / totalAmount : 0
      };
    });
}

function drawScheduleNote(contract: Contract): string {
  if (contract.paymentSchedule?.length > 0) {
    return 'Note: Payment milestones are invoiced upon completion of each listed milestone. Variations in scope or unforeseen conditions may adjust the schedule proportionally upon written agreement.';
  }
  return asDrawScheduleType(contract.drawScheduleType) === 'demolition'
    ? 'Note: Draws are invoiced upon completion of each listed milestone. Variations in scope or unforeseen conditions may adjust the schedule proportionally upon written agreement.'
    : 'Note: The deposit is required before work begins. The final payment is due upon project completion and client satisfaction.';
}

function safeSetY(doc: PdfDoc, y: number): number {
  const safeY = Number.isFinite(y) ? y : 50;
  doc.y = safeY;
  return safeY;
}

function addSectionHeader(doc: PdfDoc, title: string, sectionNumber: string) {
  if (doc.y > 650) doc.addPage();
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text(`${sectionNumber}. ${title}`, 50, doc.y);
  doc.rect(45, doc.y - 5, 4, 20).fill(ACCENT);
  doc.moveDown(1);
}

function addEstimatePage(
  doc: PdfDoc,
  contract: Contract,
  customer: Customer | null,
  estimate: Estimate | null,
  lineItems: LineItem[],
  totalAmount: number
) {
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#333333').text('ESTIMATE SUMMARY', { align: 'center' });
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(ACCENT)
    .text(estimateSubtitle(contract, customer, estimate), { align: 'center' });
  doc.moveDown(2.25);

  const colWidths = [50, 260, 70, 80, 80];
  const colX = [50, 100, 360, 430, 510];
  const minRowHeight = 22;
  const rowPaddingY = 6;
  const descriptionWidth = colWidths[1] - 10;
  const pageBottomY = doc.page.height - doc.page.margins.bottom - 20;

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Line Items:', 50, doc.y);
  doc.moveDown(0.6);

  const headerTop = doc.y;
  doc.rect(50, headerTop - 5, 490, 22).fill(ACCENT).strokeColor(ACCENT).stroke();
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text('Item', colX[0], headerTop)
    .text('Description', colX[1], headerTop)
    .text('Qty', colX[2], headerTop)
    .text('Unit', colX[3], headerTop)
    .text('Total', colX[4], headerTop);

  let rowY = headerTop + 26;
  let truncated = false;
  const reserveForTotalsAndNotes = 120;

  if (lineItems.length > 0) {
    for (let i = 0; i < lineItems.length; i += 1) {
      const item = lineItems[i];
      const descriptionText = item.description?.trim() && item.description !== 'N/A' ? item.description : 'N/A';
      doc.fontSize(9).font('Helvetica').fillColor('#333333');
      const descriptionHeight = doc.heightOfString(descriptionText, { width: descriptionWidth });
      const validNotes = (item.notes || []).filter(note => note && note.trim());
      let notesHeight = 0;
      if (validNotes.length) {
        doc.fontSize(8).font('Times-Italic');
        notesHeight =
          doc.heightOfString(validNotes.map(note => `• ${note.trim()}`).join('\n'), { width: descriptionWidth }) +
          rowPaddingY;
        doc.fontSize(9).font('Helvetica');
      }
      const rowHeight = Math.max(minRowHeight, descriptionHeight + notesHeight + rowPaddingY * 2);
      if (rowY + rowHeight > pageBottomY - reserveForTotalsAndNotes) {
        truncated = true;
        break;
      }
      doc
        .rect(50, rowY, 490, rowHeight)
        .fill(i % 2 === 0 ? '#f8f9fa' : '#ffffff')
        .strokeColor('#e9ecef')
        .lineWidth(0.5)
        .stroke();
      const textY = rowY + rowPaddingY;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text(`#${i + 1}`, colX[0], textY, { width: colWidths[0] - 10 });
      doc.text(descriptionText, colX[1], textY, { width: descriptionWidth, height: descriptionHeight });
      if (validNotes.length) {
        doc
          .fontSize(8)
          .font('Times-Italic')
          .fillColor('#666666')
          .text(validNotes.map(note => `• ${note.trim()}`).join('\n'), colX[1], textY + descriptionHeight + 4, {
            width: descriptionWidth
          });
      }
      const total = lineItemTotal(item);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text(String(item.quantity ?? 1), colX[2], textY, { width: colWidths[2] - 10 })
        .text(formatPrice(item.unitPrice || 0), colX[3], textY, { width: colWidths[3] - 10 })
        .text(formatPrice(total), colX[4], textY, { width: colWidths[4] - 10 });
      rowY += rowHeight;
    }
  } else {
    doc.rect(50, rowY, 490, minRowHeight).fill('#f8f9fa').strokeColor('#e9ecef').lineWidth(0.5).stroke();
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text('No detailed line items available', colX[1], rowY + rowPaddingY, { width: descriptionWidth });
    rowY += minRowHeight;
  }

  doc.y = rowY + 10;
  let totalsY = doc.y + 8;
  const totalsBoxWidth = 200;
  const totalsBoxHeight = 52;
  if (totalsY + totalsBoxHeight > pageBottomY) totalsY = pageBottomY - totalsBoxHeight - 10;
  const totalsBoxX = 295 - totalsBoxWidth / 2;
  doc.rect(totalsBoxX, totalsY - 8, totalsBoxWidth, totalsBoxHeight).fill('#f3f4f6').strokeColor(ACCENT).lineWidth(1).stroke();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(ACCENT)
    .text('TOTAL:', totalsBoxX + 10, totalsY + 12)
    .text(formatPrice(totalAmount), totalsBoxX + totalsBoxWidth - 10, totalsY + 12, { align: 'right' });

  if (truncated) {
    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor('#666666')
      .text(
        'Additional line items omitted for brevity in the contract. Please refer to the standalone Estimate PDF for the full list.',
        50,
        totalsY + totalsBoxHeight + 6,
        { width: 490, align: 'center' }
      );
  }
}

function addModernHeader(doc: PdfDoc) {
  doc.y = 50;
  doc.fontSize(16).font('Helvetica-Bold').fillColor(ACCENT).text(COMPANY_NAME, { align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor('#666666').text(COMPANY_LICENSE, { align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor('#333333').text(COMPANY_ADDRESS, { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#333333').text('Residential', { align: 'center' });
  doc.fontSize(20).font('Helvetica-Bold').fillColor(ACCENT).text('Demolition Contract', { align: 'center' });
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#666666').text('Professional • Reliable • Insured', { align: 'center' });
  doc.moveDown(1);
  const currentY = doc.y || 200;
  doc.strokeColor(ACCENT).lineWidth(3).moveTo(50, currentY).lineTo(545, currentY).stroke();
  doc.moveDown(1.5);
}

function addPartiesSection(doc: PdfDoc, contract: Contract, customer: Customer | null) {
  if (doc.y > 500) doc.addPage();
  const boxTop = safeSetY(doc, doc.y);
  const boxHeight = 150;
  doc.rect(45, boxTop - 10, 505, boxHeight).fill('#f8f9fa').strokeColor(ACCENT).lineWidth(1).stroke();
  doc.rect(45, boxTop - 10, 4, boxHeight).fill(ACCENT);

  let currentY = boxTop + 10;
  doc.fontSize(14).font('Helvetica-Bold').fillColor(ACCENT).text('CONTRACTOR', 60, currentY);
  currentY += 20;
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text(COMPANY_NAME, 70, currentY);
  currentY += 15;
  doc.fontSize(10).font('Helvetica').fillColor('#333333').text(COMPANY_LICENSE, 70, currentY);
  currentY += 12;
  doc.fontSize(10).text(COMPANY_ADDRESS, 70, currentY);
  currentY += 25;
  doc.fontSize(14).font('Helvetica-Bold').fillColor(ACCENT).text('CLIENT', 60, currentY);
  currentY += 20;

  const clientName = resolveClientName(contract, customer);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text(clientName, 70, currentY);
  currentY += 15;

  const clientAddressText = resolveClientAddress(contract, customer);
  const clientAddressHeight = doc.heightOfString(clientAddressText, { width: 420 });
  doc.fontSize(10).font('Helvetica').fillColor('#333333').text(clientAddressText, 70, currentY, { width: 420 });
  currentY += Math.max(15, clientAddressHeight + 5);

  if (contract.propertyAddress && contract.propertyAddress !== clientAddressText) {
    const propertyAddressText = `Property: ${contract.propertyAddress}`;
    const propertyHeight = doc.heightOfString(propertyAddressText, { width: 420 });
    doc.fontSize(10).fillColor('#666666').text(propertyAddressText, 70, currentY, { width: 420 });
    currentY += Math.max(12, propertyHeight + 5);
  }

  safeSetY(doc, boxTop + boxHeight + 20);
}

function addScopeOfWorkSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Scope of Work', '1');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('1.1 Services Overview', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      "Contractor agrees to perform demolition services at the client's property as outlined in the demolition contract and detailed in the written price estimate. All work will be completed in a professional manner consistent with industry standards and in accordance with the agreed-upon inspection report items.",
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('1.2 Services Typically Include', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Demolition will be performed according to generally accepted demolition practices, in compliance with applicable codes — including the Virginia Uniform Statewide Building Code (VUSBC) and the International Residential Code (IRC) as adopted by Virginia — and in alignment with the NAHB Residential Construction Performance Guidelines.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('Work will include:', 60, doc.y);
  doc.moveDown(0.5);

  const services = [
    'Completing the agreed-upon demolition and removal as outlined in the project scope or estimate',
    'Protecting adjacent areas, surfaces, and fixtures as needed to prevent damage during demolition',
    'Disposing of all debris, materials, and waste in accordance with local requirements',
    'Cleaning and organizing the jobsite after work is finished to ensure it is safe, presentable, and ready for the next phase of the project.'
  ];
  const listTop = doc.y;
  let totalTextHeight = 0;
  doc.fontSize(11).font('Helvetica');
  services.forEach(service => {
    totalTextHeight += Math.max(doc.heightOfString(service, { width: 440 }), 20) + 10;
  });
  const listHeight = totalTextHeight + 30;
  doc.rect(55, listTop - 5, 490, listHeight).fill('#f8f9fa').strokeColor(ACCENT).lineWidth(1.5).stroke();
  doc.rect(55, listTop - 5, 4, listHeight).fill(ACCENT);

  let currentY = listTop + 15;
  services.forEach(service => {
    doc.fontSize(11).font('Helvetica-Bold').fillColor(ACCENT).text('•', 70, currentY);
    doc.fontSize(11).font('Helvetica').fillColor('#333333').text(service, 85, currentY, { width: 440, align: 'justify' });
    currentY += Math.max(doc.heightOfString(service, { width: 440 }), 20) + 10;
  });
  doc.y = listTop + listHeight + 20;
}

function addConsultationSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Consultation and Estimate', '2');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('2.1 Professional Consultation Service', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Contractor may provide a comprehensive on-site demolition assessment and project consultation, including a review of the demolition scope and a detailed walkthrough of the areas to be removed or affected. If the client chooses not to proceed with the proposed demolition work, any applicable assessment or consultation fee will be non-refundable unless otherwise agreed in writing.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addPaymentTermsSection(doc: PdfDoc, contract: Contract, totalAmount: number) {
  addSectionHeader(doc, 'Payment Terms', '3');
  const boxTop = doc.y;
  const boxHeight = 60;
  doc.rect(55, boxTop - 5, 490, boxHeight).fill('#f3f4f6').strokeColor(ACCENT).lineWidth(1).stroke();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('3.1 Total Contract Amount', 70, boxTop + 10);
  doc.fontSize(16).font('Helvetica-Bold').fillColor(ACCENT).text(formatPrice(totalAmount), 70, boxTop + 30);
  doc.y = boxTop + boxHeight + 20;

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('3.2 Draw Schedule', 60, doc.y);
  doc.moveDown(0.5);

  const draws = buildDraws(contract, totalAmount);
  const scheduleTop = doc.y;
  const lineHeight = 18;
  const boxPaddingY = 10;
  const scheduleBoxHeight = (draws.length + 1) * lineHeight + boxPaddingY * 2;
  doc.rect(55, scheduleTop - 5, 490, scheduleBoxHeight).fill('#f8f9fa').strokeColor(ACCENT).lineWidth(1).stroke();
  doc.rect(55, scheduleTop - 5, 4, scheduleBoxHeight).fill(ACCENT);

  let cursorY = scheduleTop + boxPaddingY;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text('Milestone', 70, cursorY, { width: 320 })
    .text('%', 415, cursorY, { width: 50, align: 'right' })
    .text('Amount', 485, cursorY, { width: 60, align: 'right' });
  cursorY += lineHeight;
  doc.font('Helvetica');
  draws.forEach((draw, idx) => {
    doc
      .rect(59, cursorY - 4, 486, lineHeight)
      .fill(idx % 2 === 0 ? '#ffffff' : '#f3f4f6')
      .strokeColor('#e9ecef')
      .lineWidth(0.5)
      .stroke();
    doc
      .fillColor('#333333')
      .text(draw.label, 70, cursorY, { width: 320 })
      .text(`${Math.round(draw.pct * 100)}%`, 415, cursorY, { width: 50, align: 'right' })
      .text(formatPrice(draw.amount), 485, cursorY, { width: 60, align: 'right' });
    cursorY += lineHeight;
  });
  doc.y = scheduleTop + scheduleBoxHeight + 12;
  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666').text(drawScheduleNote(contract), 60, doc.y, {
    width: 485,
    align: 'justify'
  });
  doc.moveDown(1.5);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('3.3 Final Payment', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The remaining balance is due immediately upon project completion and client satisfaction. Payment should be made using the same method provided for the deposit unless alternative arrangements have been made in advance.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('3.4 Accepted Payment Methods', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'We accept electronic card payments through our secure Stripe payment system, as well as personal or business checks made payable to the contractor.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(0.8);
  const closingPaymentBoxY = doc.y;
  doc
    .fontSize(10)
    .text('Initial here if payment will be made at closing: ______ (Client Initials)', 90, closingPaymentBoxY + 2, {
      width: 450
    });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('#666666')
    .text(
      'Note: If payment is to be made at closing, contractor may require documentation confirming closing date and funds availability.',
      90,
      doc.y,
      { width: 450, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addProjectTimelineSection(doc: PdfDoc, contract: Contract) {
  addSectionHeader(doc, 'Project Timeline', '4');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('4.1 Project Start Date', 60, doc.y);
  doc.moveDown(0.5);
  const startDate = contract.startDate ? formatDate(contract.startDate) : '[Insert Start Date]';
  const endDate = contract.endDate ? formatDate(contract.endDate) : '[Insert End Date]';
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#333333')
    .text('Work is scheduled to commence on or around: ', 60, doc.y, { continued: true })
    .font('Helvetica-Bold')
    .fillColor(ACCENT)
    .text(startDate);
  doc.moveDown(0.5);
  if (contract.endDate) {
    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text('Projected completion date: ', 60, doc.y, { continued: true })
      .font('Helvetica-Bold')
      .fillColor(ACCENT)
      .text(endDate);
    doc.moveDown(0.5);
  }
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#333333')
    .text(
      'The contractor will make every reasonable effort to complete the project within the estimated timeframe discussed during consultation.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('4.2 Timeline Considerations', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Project completion dates are subject to weather conditions, material availability, and any unforeseen circumstances. The contractor will communicate any delays or changes to the schedule promptly and work with the client to minimize disruption.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addChangeOrdersSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Change Orders and Modifications', '5');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('5.1 Change Order Requirements', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Any modifications to the scope of work, cost, materials, or timeline must be detailed in a written change order signed by both parties before work begins. Verbal agreements or modifications are not binding and will not be recognized as valid amendments to this contract.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('5.2 Change Order Process', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Change orders must include: (1) detailed description of the modification, (2) impact on project timeline, (3) adjusted cost, (4) any additional materials required, and (5) signatures of both parties. Work on change orders will not commence until the signed change order is received.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addPermitsSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Permits and Compliance', '6');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('6.1 Permits and Inspections', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The contractor will obtain and pay for all required permits and inspections necessary for the completion of this project. The contractor will ensure all work complies with applicable building codes, zoning regulations, and local ordinances.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('6.2 Code Compliance', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'All work performed under this contract will comply with the Virginia Uniform Statewide Building Code and any applicable local building codes, zoning ordinances, and regulations. The contractor is responsible for ensuring code compliance and obtaining final inspections.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addLiabilitySection(doc: PdfDoc) {
  addSectionHeader(doc, 'Liability and Insurance', '7');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('7.1 Insurance Coverage', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Contractor maintains comprehensive general liability insurance with minimum coverage of ', 60, doc.y, {
      continued: true,
      width: 485
    })
    .font('Helvetica-Bold')
    .fillColor(ACCENT)
    .text('$1,000,000', { continued: true })
    .font('Helvetica')
    .fillColor('#333333')
    .text(' to protect both parties during the course of work.');
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('7.2 Contractor Liability', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The contractor agrees to indemnify and hold the client harmless against any claims or damages resulting from contractor negligence or failure to perform work according to this agreement.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('7.3 Client Acknowledgment', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The client acknowledges that renovation work may involve inherent risks and agrees to hold the contractor harmless for pre-existing conditions, hidden defects, or unforeseen issues discovered within the property during the course of work.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('7.4 Virginia Contractor Transaction Recovery Fund', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The Virginia Contractor Transaction Recovery Fund may provide recovery for losses suffered by homeowners due to poor workmanship or failure to perform by licensed contractors. For information about filing a claim, contact the Virginia Department of Professional and Occupational Regulation (DPOR) at (804) 367-8511 or visit www.dpor.virginia.gov.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addTerminationSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Contract Termination', '8');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('8.1 Termination Notice', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Either party may terminate this contract by providing ', 60, doc.y, { continued: true, width: 485 })
    .font('Helvetica-Bold')
    .fillColor(ACCENT)
    .text('three (3) days written notice', { continued: true })
    .font('Helvetica')
    .fillColor('#333333')
    .text(' to the other party.');
  doc.moveDown(0.8);
  const waiveNoticeBoxY = doc.y;
  doc
    .fontSize(10)
    .text('Initial here to waive the 3-day termination notice requirement: ______ (Client Initials)', 90, waiveNoticeBoxY + 2, {
      width: 450
    });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('#666666')
    .text(
      'Note: By initialing above, client agrees they will not have the standard three day waiting period and may will be repsonsible for cost associated with the termination of the contract immediately. Contractor will provide list of cost incurrend with 2 business days of contract termination.',
      90,
      doc.y,
      { width: 450, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('8.2 Termination by Client', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'If the client terminates the contract after work has begun, any deposit will be forfeited. Additionally, any work completed up to the termination point will be invoiced separately and is due upon termination.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addDisputeResolutionSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Dispute Resolution', '9');
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('9.1 Good Faith Negotiation', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'Any disputes arising from this contract will first be addressed through direct, good-faith negotiation between the parties.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('9.2 Mediation Process', 60, doc.y);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'If direct negotiation fails to resolve the dispute, the matter will be submitted to professional mediation in accordance with the rules of the Virginia Mediation Network or another mutually agreed-upon mediation organization.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addGoverningLawSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Governing Law', '10');
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#333333')
    .text(
      'This contract shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia. Any legal proceedings related to this contract shall be conducted in Virginia courts.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addEntireAgreementSection(doc: PdfDoc) {
  addSectionHeader(doc, 'Entire Agreement', '11');
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#333333')
    .text(
      'This document represents the complete and entire agreement between the parties and supersedes all prior negotiations, discussions, or agreements, whether written or verbal. Only written modifications signed by both parties constitute binding amendments to this contract. Verbal agreements or modifications are not enforceable.',
      60,
      doc.y,
      { width: 485, align: 'justify' }
    );
  doc.moveDown(1.5);
}

function addSignatureSection(doc: PdfDoc, contract: Contract, customer: Customer | null) {
  if (doc.y > 600) doc.addPage();
  addSectionHeader(doc, 'Signatures', '12');
  doc.moveDown(1);
  const signatureBoxTop = doc.y;
  const signatureBoxHeight = 150;
  const boxWidth = 220;
  const leftBoxX = 60;
  const rightBoxX = 325;
  const clientName = resolveClientName(contract, customer);

  doc.rect(leftBoxX, signatureBoxTop, boxWidth, signatureBoxHeight).fill('#f3f4f6').strokeColor(ACCENT).lineWidth(1).stroke();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('CLIENT SIGNATURE', leftBoxX + 10, signatureBoxTop + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Client Name:', leftBoxX + 10, signatureBoxTop + 35);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333').text(clientName, leftBoxX + 10, signatureBoxTop + 50);
  doc
    .strokeColor('#333333')
    .lineWidth(1)
    .moveTo(leftBoxX + 10, signatureBoxTop + signatureBoxHeight - 30)
    .lineTo(leftBoxX + boxWidth - 10, signatureBoxTop + signatureBoxHeight - 30)
    .stroke();
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#666666')
    .text('Client Signature', leftBoxX + 10, signatureBoxTop + signatureBoxHeight - 25);

  doc.rect(rightBoxX, signatureBoxTop, boxWidth, signatureBoxHeight).fill('#f3f4f6').strokeColor(ACCENT).lineWidth(1).stroke();
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text('CONTRACTOR SIGNATURE', rightBoxX + 10, signatureBoxTop + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Company Name:', rightBoxX + 10, signatureBoxTop + 35);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333').text(COMPANY_NAME, rightBoxX + 10, signatureBoxTop + 50);
  doc
    .strokeColor('#333333')
    .lineWidth(1)
    .moveTo(rightBoxX + 10, signatureBoxTop + signatureBoxHeight - 30)
    .lineTo(rightBoxX + boxWidth - 10, signatureBoxTop + signatureBoxHeight - 30)
    .stroke();
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#666666')
    .text('Contractor Signature', rightBoxX + 10, signatureBoxTop + signatureBoxHeight - 25);
}

export function contractPdfFilename(contract: Contract, customer: Customer | null): string {
  const clientName = sanitizeForFilename(resolveClientName(contract, customer)) || 'Contract';
  const partialAddress = sanitizeForFilename(extractPartialAddress(contract, customer)) || 'Address';
  const dateStr = sanitizeForFilename(formatDate(contract.createdTime || new Date().toISOString())) || 'Date';
  return `Demolition_Contract_${clientName}_${partialAddress}_${dateStr}.pdf`;
}

export function generateContractPdfBuffer(
  contract: Contract,
  customer: Customer | null,
  estimate: Estimate | null
): Promise<{ buffer: Buffer; fileName: string }> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          fileName: contractPdfFilename(contract, customer)
        });
      });
      doc.on('error', reject);

      doc.y = 50;
      const lineItems = mergeLineItems(contract, estimate);
      const totalAmount = contract.total || sumLineItems(lineItems) || estimate?.total || 0;

      if (lineItems.length > 0 || estimate) {
        addEstimatePage(doc, contract, customer, estimate, lineItems, totalAmount);
        doc.addPage();
        doc.y = 50;
      }

      addModernHeader(doc);
      addPartiesSection(doc, contract, customer);
      addScopeOfWorkSection(doc);
      addConsultationSection(doc);
      addPaymentTermsSection(doc, contract, totalAmount);
      addProjectTimelineSection(doc, contract);
      addChangeOrdersSection(doc);
      addPermitsSection(doc);
      addLiabilitySection(doc);
      addTerminationSection(doc);
      addDisputeResolutionSection(doc);
      addGoverningLawSection(doc);
      addEntireAgreementSection(doc);
      addSignatureSection(doc, contract, customer);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
