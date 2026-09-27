const { groupLineItemsByCategory } = require('../data/houseDemolitionCategories');
const {
  HOUSE_DEMO_SCOPE,
  PAYMENT_SCHEDULE,
  getCategoryContent,
  summaryCategoryLabel,
  stripCategoryNotes,
  parseTermsSections,
  parseExclusionBullets,
} = require('../data/houseDemolitionProposalContent');

const BRAND = {
  legalName: 'Castleton Real Estate, LLC dba Mr Demo Pro',
  license: 'Class A - Residential Building Contractor, DPOR License #2705161677',
  addressLine: '24922 Castleton Dr Chantilly VA 20152 · 757-848-4559',
  brandName: 'Mr Demo Pro',
  phone: '757-848-4559',
};

function formatMoney(amount, { cents = false } = {}) {
  const number = typeof amount === 'number' ? amount : parseFloat(amount);
  if (Number.isNaN(number)) return '$0';
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

function itemDetailText(item, categoryId) {
  const meta = getCategoryContent(categoryId);
  const notes = stripCategoryNotes(item.notes)
    .filter((note) => {
      const trimmed = String(note || '').trim();
      if (!trimmed) return false;
      if (trimmed === (meta.footnote || '').trim()) return false;
      if (meta.footnote && trimmed.includes(meta.footnote)) return false;
      return true;
    });

  if (meta.tableType === 'concrete_driveway') {
    return notes[0] || item.description;
  }

  return notes.join(' ');
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getTableColumns(meta) {
  if (meta.tableType === 'tree_removal') {
    return [
      { label: 'Qty.', width: 50 },
      { label: 'Description', width: 292 },
      { label: 'Unit Price', width: 85 },
      { label: 'Total', width: 85 },
    ];
  }
  if (meta.tableType === 'concrete_driveway') {
    return [
      { label: 'Qty.', width: 70 },
      { label: 'Description', width: 272 },
      { label: 'Estimated Unit Price', width: 85 },
      { label: 'Estimated Total', width: 85 },
    ];
  }
  return [
    { label: 'Line Item', width: 150 },
    { label: 'Description', width: 282 },
    { label: 'Amount', width: 80 },
  ];
}

function getRowValues(item, group, meta) {
  if (meta.tableType === 'tree_removal') {
    const detail = itemDetailText(item, group.id) || item.description;
    return [
      String(item.quantity || 1),
      detail,
      `${formatMoney(item.unitPrice || 0)} each`,
      formatMoney(item.totalPrice || 0),
    ];
  }
  if (meta.tableType === 'concrete_driveway') {
    const detail = itemDetailText(item, group.id) || item.description;
    return [
      `${Number(item.quantity || 0).toLocaleString('en-US')} SF`,
      detail,
      `${formatMoney(item.unitPrice || 0, { cents: true })}/SF`,
      formatMoney(item.totalPrice || 0),
    ];
  }
  return [
    item.description,
    itemDetailText(item, group.id),
    formatMoney(item.totalPrice || 0),
  ];
}

function renderHouseDemolitionProposal(doc, estimate, options = {}) {
  const primary = options.primaryColor || '#F58220';
  const margin = 50;
  const contentWidth = 512;
  const pageBottomY = (doc.page?.height || 792) - (doc.page?.margins?.bottom || 50) - 20;

  const textHeight = (text, fontSize, width = contentWidth, font = 'Helvetica') => {
    if (!text) return 0;
    doc.fontSize(fontSize).font(font);
    return doc.heightOfString(String(text), { width, lineGap: 1 });
  };

  const startNewPage = () => {
    doc.addPage();
    doc.y = margin;
  };

  const ensureSpace = (needed = 40) => {
    if (doc.y + needed > pageBottomY) {
      startNewPage();
    }
  };

  const ensureSectionFits = (needed) => {
    if (doc.y + needed > pageBottomY) {
      startNewPage();
    }
  };

  const writeParagraph = (text, opts = {}) => {
    if (!text) return 0;
    const fontSize = opts.fontSize || 10;
    const width = opts.width || contentWidth;
    const height = textHeight(text, fontSize, width, opts.bold ? 'Helvetica-Bold' : 'Helvetica');
    ensureSpace(height + (opts.gap || 6));
    doc.fontSize(fontSize)
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fillColor(opts.color || '#333333')
      .text(text, margin, doc.y, { width, align: opts.align || 'left', lineGap: opts.lineGap ?? 1 });
    doc.y += opts.after ?? 6;
    return height;
  };

  const writeSectionHeading = (text, { size = 11, after = 10 } = {}) => {
    ensureSpace(22);
    doc.fontSize(size)
      .font('Helvetica-Bold')
      .fillColor(primary)
      .text(text, margin, doc.y, { width: contentWidth });
    doc.y += after;
  };

  const measureRowHeight = (columns, values) => {
    const heights = values.map((value, index) => textHeight(String(value || ''), 9, columns[index].width - 12));
    return Math.max(...heights, 12) + 8;
  };

  const drawTableHeader = (columns) => {
    const top = doc.y;
    const height = 18;
    doc.rect(margin, top, contentWidth, height).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
    let x = margin;
    columns.forEach((col) => {
      doc.fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#1a202c')
        .text(col.label, x + 5, top + 4, { width: col.width - 10 });
      x += col.width;
    });
    doc.y = top + height + 2;
    return height + 2;
  };

  const drawTableRow = (columns, values, { boldLast = false } = {}) => {
    const rowHeight = measureRowHeight(columns, values);
    const top = doc.y;
    doc.rect(margin, top, contentWidth, rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

    let x = margin;
    values.forEach((value, index) => {
      const isAmountCol = index === values.length - 1 && boldLast;
      doc.fontSize(9)
        .font(isAmountCol ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor('#333333')
        .text(String(value || ''), x + 5, top + 4, { width: columns[index].width - 10, lineGap: 0.5 });
      x += columns[index].width;
    });
    doc.y = top + rowHeight + 1;
    return rowHeight + 1;
  };

  const estimateGroupHeight = (group, meta) => {
    const columns = getTableColumns(meta);
    let height = 22 + 10; // heading + padding

    if (meta.intro) {
      height += textHeight(meta.intro, 9.5, contentWidth) + 8;
    }

    height += 20; // table header

    group.items.forEach((item) => {
      height += measureRowHeight(columns, getRowValues(item, group, meta)) + 1;
    });

    height += 16; // subtotal
    if (meta.footnote) {
      height += textHeight(meta.footnote, 8.5, contentWidth) + 8;
    } else {
      height += 4;
    }

    return height;
  };

  const renderCategoryGroup = (group) => {
    const meta = getCategoryContent(group.id);
    const columns = getTableColumns(meta);

    ensureSectionFits(estimateGroupHeight(group, meta));

    writeSectionHeading(group.label, { size: 11, after: 8 });
    if (meta.intro) {
      writeParagraph(meta.intro, { fontSize: 9.5, color: '#4a5568', after: 6, gap: 4 });
    }

    drawTableHeader(columns);
    group.items.forEach((item) => {
      drawTableRow(columns, getRowValues(item, group, meta), { boldLast: true });
    });

    const subtotal = group.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    doc.fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor('#1a202c')
      .text(`${meta.subtotalLabel}: ${formatMoney(subtotal)}`, margin, doc.y, { width: contentWidth, align: 'right' });
    doc.y += 12;

    if (meta.footnote) {
      writeParagraph(meta.footnote, { fontSize: 8.5, color: '#64748b', after: 8, gap: 4 });
    } else {
      doc.y += 2;
    }

    return { id: group.id, label: summaryCategoryLabel(group.id), amount: subtotal };
  };

  // --- First page header (compact) ---
  doc.y = margin;

  const logoPath = options.logoPath;
  if (logoPath) {
    try {
      const fs = require('fs');
      if (fs.existsSync(logoPath)) {
        const logoWidth = 64;
        doc.image(logoPath, margin + (contentWidth - logoWidth) / 2, doc.y, { width: logoWidth });
        doc.y += 52;
      }
    } catch {
      // ignore logo failures
    }
  }

  doc.fontSize(10.5)
    .font('Helvetica-Bold')
    .fillColor(primary)
    .text(BRAND.legalName, margin, doc.y, { width: contentWidth, align: 'center', lineGap: 0.5 });
  doc.y += 13;

  doc.fontSize(8.5)
    .font('Helvetica')
    .fillColor('#4a5568')
    .text(BRAND.license, margin, doc.y, { width: contentWidth, align: 'center', lineGap: 0.5 });
  doc.y += 11;

  doc.fontSize(8.5)
    .font('Helvetica')
    .fillColor('#4a5568')
    .text(BRAND.addressLine, margin, doc.y, { width: contentWidth, align: 'center', lineGap: 0.5 });
  doc.y += 14;

  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#1a202c')
    .text('HOUSE DEMOLITION PROPOSAL', margin, doc.y, { width: contentWidth, align: 'center' });
  doc.y += 18;

  const customerName = (() => {
    if (estimate.customer) {
      const parts = [estimate.customer.firstName || '', estimate.customer.lastName || ''].filter(Boolean);
      if (parts.length) return parts.join(' ');
    }
    return estimate.customerName || '';
  })();

  const { resolveEstimateAddress } = require('./documentOutputs/formatters');
  const customerAddress = resolveEstimateAddress(estimate);

  if (customerName || customerAddress) {
    writeParagraph(
      [customerName, customerAddress, `Proposal #: ${estimate.estimateNumber || 'N/A'}`, `Date: ${formatDate(estimate.createdAt || estimate.updatedAt)}`]
        .filter(Boolean)
        .join('\n'),
      { fontSize: 9.5, color: '#4a5568', after: 8, gap: 4, lineGap: 0.5 }
    );
  }

  writeSectionHeading('Scope of Work', { size: 11, after: 6 });
  writeParagraph(
    (typeof estimate.description === 'string' && estimate.description.trim()) || HOUSE_DEMO_SCOPE,
    { fontSize: 9.5, align: 'justify', after: 10, gap: 4, lineGap: 0.5 }
  );

  const groups = groupLineItemsByCategory(estimate.lineItems || []);
  const categoryTotals = groups.map((group) => renderCategoryGroup(group));

  // Estimated Contract Amount — keep summary block together
  const summaryHeight = 22 + 20 + (categoryTotals.length + 1) * 22 + 40;
  ensureSectionFits(summaryHeight);

  writeSectionHeading('Estimated Contract Amount', { size: 11, after: 8 });
  const summaryColumns = [
    { label: 'Category', width: 382 },
    { label: 'Amount', width: 130 },
  ];
  drawTableHeader(summaryColumns);
  categoryTotals.forEach((row) => {
    drawTableRow(summaryColumns, [row.label, formatMoney(row.amount)], { boldLast: true });
  });

  const total = estimate.totalAmount || categoryTotals.reduce((sum, row) => sum + row.amount, 0);
  drawTableRow(summaryColumns, ['ESTIMATED TOTAL', formatMoney(total)], { boldLast: true });

  doc.fontSize(10.5)
    .font('Helvetica-Bold')
    .fillColor(primary)
    .text(`Estimated Contract Price: ${formatMoney(total)}`, margin, doc.y + 4, { width: contentWidth, align: 'center' });
  doc.y += 16;

  writeParagraph(
    'The contract amount is based upon the assumptions and allowances stated above and is subject to final site verification.',
    { fontSize: 8.5, color: '#64748b', align: 'center', after: 10, gap: 4 }
  );

  // Payment schedule — keep entire block on one page when possible
  const paymentBlockHeight = PAYMENT_SCHEDULE.reduce((sum, payment) => {
    let h = 34;
    h += textHeight(payment.due, 8.5, contentWidth) + 4;
    if (payment.covers) h += textHeight(payment.covers, 8.5, contentWidth) + 8;
    else h += 4;
    return sum + h;
  }, 30);
  ensureSectionFits(paymentBlockHeight);

  writeSectionHeading('Payment Schedule', { size: 11, after: 8 });
  PAYMENT_SCHEDULE.forEach((payment) => {
    const amount = total * payment.percent;
    doc.fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor('#1a202c')
      .text(payment.label, margin, doc.y, { width: contentWidth });
    doc.y += 11;
    doc.fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor(primary)
      .text(`${(payment.percent * 100).toFixed(0)}% — ${formatMoney(amount)}`, margin, doc.y, { width: contentWidth });
    doc.y += 11;
    writeParagraph(payment.due, { fontSize: 8.5, color: '#4a5568', after: 3, gap: 3 });
    if (payment.covers) {
      writeParagraph(payment.covers, { fontSize: 8.5, color: '#64748b', after: 6, gap: 3 });
    } else {
      doc.y += 2;
    }
  });

  doc.fontSize(9.5)
    .font('Helvetica-Bold')
    .fillColor('#1a202c')
    .text(`Total Payments: ${formatMoney(total)}`, margin, doc.y, { width: contentWidth, align: 'right' });
  doc.y += 12;

  const termsSections = parseTermsSections(estimate.notes);
  termsSections.forEach((section) => {
    let sectionHeight = 24;
    if (/EXCLUSIONS/i.test(section.title)) {
      const parsed = parseExclusionBullets(section.body);
      sectionHeight += textHeight(parsed.intro, 9, contentWidth) + 6;
      sectionHeight += parsed.bullets.length * 12;
      if (parsed.closing) sectionHeight += textHeight(parsed.closing, 9, contentWidth) + 8;
    } else {
      const body = section.body.replace(
        /The contract amount is based upon the assumptions and allowances stated above and is subject to final site verification\.?\s*$/i,
        ''
      ).trim();
      sectionHeight += textHeight(body, 9, contentWidth) + 10;
    }
    ensureSectionFits(sectionHeight);

    writeSectionHeading(section.title, { size: 11, after: 6 });

    if (/EXCLUSIONS/i.test(section.title)) {
      const parsed = parseExclusionBullets(section.body);
      writeParagraph(parsed.intro, { fontSize: 9, after: 4, gap: 3 });
      parsed.bullets.forEach((bullet) => {
        writeParagraph(`• ${bullet}`, { fontSize: 8.5, after: 1, gap: 2, lineGap: 0.5 });
      });
      if (parsed.closing) {
        writeParagraph(parsed.closing, { fontSize: 8.5, after: 8, gap: 3 });
      }
    } else {
      const body = section.body.replace(
        /The contract amount is based upon the assumptions and allowances stated above and is subject to final site verification\.?\s*$/i,
        ''
      ).trim();
      writeParagraph(body, { fontSize: 8.5, after: 8, gap: 3 });
    }
  });

  ensureSpace(12);
  doc.moveTo(margin, doc.y)
    .lineTo(margin + contentWidth, doc.y)
    .strokeColor('#e2e8f0')
    .lineWidth(0.5)
    .stroke();
  doc.y += 8;
  writeParagraph(`${BRAND.brandName} · ${BRAND.phone}`, { fontSize: 8, color: '#94a3b8', align: 'center', after: 0, gap: 2 });
}

module.exports = {
  renderHouseDemolitionProposal,
  formatMoney,
};
