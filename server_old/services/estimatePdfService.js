const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { renderHouseDemolitionProposal } = require('./houseDemolitionPdfRenderer');
const { sanitizeFilename } = require('./documentOutputs/sendDocxResponse');

const BRAND = {
  legalName: 'Castleton Real Estate, LLC dba Mr Demo Pro',
  brandName: 'Mr Demo Pro',
  license: 'Class A - Residential Building Contractor, DPOR License #2705161677',
  address: '24922 Castleton Dr Chantilly VA 20152',
  phone: '757-848-4559',
};

class EstimatePdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  isHouseDemolition(estimate) {
    return estimate?.templateType === 'house_demolition'
      || /house\s+demolition/i.test(estimate?.title || '');
  }

  brandColor(estimate) {
    return this.isHouseDemolition(estimate) ? '#F58220' : '#08a171';
  }

  formatPrice(price) {
    if (!price && price !== 0) return "$0";
    const number = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(number)) return "$0";
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatDate(value) {
    if (!value) {
      return 'N/A';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  drawCompanyHeader(doc, estimate) {
    if (this.isHouseDemolition(estimate)) {
      // House demolition proposals render their own compact header.
      return;
    }

    const primary = this.brandColor(estimate);
    const logoPath = path.join(__dirname, '../../client/public/logo.png');

    try {
      if (fs.existsSync(logoPath)) {
        const logoWidth = 110;
        const xPosition = (612 - logoWidth) / 2;
        doc.image(logoPath, xPosition, doc.y, { width: logoWidth });
        doc.y += 95;
      }
    } catch (error) {
      console.log('⚠️ Could not load logo for estimate PDF:', error.message);
    }

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primary)
       .text(BRAND.legalName, { align: 'center' });

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1a202c')
       .text(BRAND.brandName, { align: 'center' });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(BRAND.license, { align: 'center' });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`${BRAND.address} · ${BRAND.phone}`, { align: 'center' });

    doc.moveDown(1);
  }

  async generateEstimatePdf(estimate) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: false });

        const docNumber = estimate.estimateNumber || String(estimate._id);
        const prefix = this.isHouseDemolition(estimate) ? 'HouseDemoProposal' : 'Estimate';
        const fileName = `${sanitizeFilename(`${prefix}_${docNumber}`)}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        this.drawCompanyHeader(doc, estimate);

        if (this.isHouseDemolition(estimate)) {
          renderHouseDemolitionProposal(doc, estimate, {
            primaryColor: this.brandColor(estimate),
            logoPath: path.join(__dirname, '../../client/public/logo.png'),
          });
        } else {
          this.addEstimatePage(doc, estimate);
        }

        doc.end();

        stream.on('finish', () => resolve({ fileName, filePath }));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  addEstimatePage(doc, estimate) {
    const primary = this.brandColor(estimate);
    // Estimate title (company info already added above)
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primary)
       .text(estimate.title || 'PICRA Repair Estimate', { align: 'center' });

    doc.moveDown(1.25);

    // Estimate metadata (number, status, date)
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(`Estimate #: ${estimate.estimateNumber || estimate.estimateId || estimate._id || 'N/A'}`, {
         align: 'left'
       });

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#555555')
       .text(`Status: ${estimate.status || 'Draft'}`, { align: 'left' });

    doc.text(`Date: ${this.formatDate(estimate.createdAt || estimate.updatedAt || new Date())}`, {
      align: 'left'
    });

    doc.moveDown(1);

    // Customer information block
    const customerName = (() => {
      if (estimate.customer) {
        const parts = [
          estimate.customer.firstName || '',
          estimate.customer.lastName || ''
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(' ');
        }
      }
      return estimate.customerName || 'Customer';
    })();

    const customerAddress = (() => {
      const { resolveEstimateAddress } = require('./documentOutputs/formatters');
      const address = resolveEstimateAddress(estimate);
      return address || null;
    })();

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(customerName, { align: 'left' });

    if (customerAddress) {
      doc.moveDown(0.25);
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#555555')
         .text(customerAddress, {
           width: 490,
           align: 'left'
         });
    }

    doc.moveDown(1);

    // Table constants
    const colWidths = [50, 250, 80, 80, 80];
    const colX = [50, 100, 350, 430, 510];
    const minRowHeight = 24;
    const rowPaddingY = 6;
    const descriptionWidth = colWidths[1] - 10;
    const pageBottomY = (doc.page && doc.page.height && doc.page.margins)
      ? (doc.page.height - doc.page.margins.bottom - 20)
      : 740;

    const drawHeaderRow = () => {
      const headerTop = doc.y;
      doc.rect(50, headerTop - 5, 490, 25)
         .fill(primary)
         .strokeColor(primary)
         .stroke();
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text('Item #', colX[0], headerTop)
         .text('Description', colX[1], headerTop)
         .text('Qty', colX[2], headerTop)
         .text('Unit Price', colX[3], headerTop)
         .text('Total', colX[4], headerTop);
      return headerTop + 30;
    };

    // Header label
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Detailed Line Items:', 50, doc.y);
    doc.moveDown(1);

    let rowY = drawHeaderRow();

    const ensureSpaceForRow = (neededHeight) => {
      const heightNeeded = neededHeight || minRowHeight;
      if (rowY + heightNeeded > pageBottomY) {
        doc.addPage();
        doc.y = 50;
        rowY = drawHeaderRow();
      }
    };

    if (estimate.lineItems && estimate.lineItems.length > 0) {
      estimate.lineItems.forEach((item, index) => {
        const descriptionText = item.description || 'N/A';
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        const descriptionHeight = doc.heightOfString(descriptionText, {
          width: descriptionWidth
        });
        
        // Calculate notes height if notes exist
        let notesHeight = 0;
        const notes = item.notes || [];
        const validNotes = notes.filter(note => note && note.trim());
        if (validNotes.length > 0) {
          doc.fontSize(9).font('Times-Italic');
          const notesText = validNotes.map((note) => `• ${note.trim()}`).join('\n');
          notesHeight = doc.heightOfString(notesText, {
            width: descriptionWidth
          }) + rowPaddingY;
          doc.fontSize(9).font('Helvetica'); // Reset font
        }
        
        const rowHeight = Math.max(minRowHeight, descriptionHeight + notesHeight + rowPaddingY * 2);

        ensureSpaceForRow(rowHeight + 4);

        const rowTop = rowY;
        const textY = rowTop + rowPaddingY;
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

        doc.rect(50, rowTop, 490, rowHeight)
           .fill(bgColor)
           .strokeColor('#e9ecef')
           .lineWidth(0.5)
           .stroke();

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`#${index + 1}`, colX[0], textY, {
             width: colWidths[0] - 10,
             height: rowHeight - rowPaddingY * 2
           });
        
        // Description
        let currentY = textY;
        doc.text(descriptionText, colX[1], currentY, {
          width: descriptionWidth,
          height: descriptionHeight
        });
        
        // Notes below description
        if (validNotes.length > 0) {
          currentY += descriptionHeight + 4;
          doc.fontSize(9)
             .font('Times-Italic')
             .fillColor('#666666');
          const notesText = validNotes.map((note) => `• ${note.trim()}`).join('\n');
          doc.text(notesText, colX[1], currentY, {
            width: descriptionWidth,
            height: notesHeight
          });
        }
        
        // Quantity, Unit Price, Total (aligned to top)
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333')
           .text(item.quantity?.toString() || '1', colX[2], textY, {
             width: colWidths[2] - 10,
             height: rowHeight - rowPaddingY * 2
           })
           .text(this.formatPrice(item.unitPrice || 0), colX[3], textY, {
             width: colWidths[3] - 10,
             height: rowHeight - rowPaddingY * 2
           })
           .text(this.formatPrice(item.totalPrice || 0), colX[4], textY, {
             width: colWidths[4] - 10,
             height: rowHeight - rowPaddingY * 2
           });

        rowY += rowHeight;
      });
    } else {
      const emptyRowHeight = minRowHeight;
      ensureSpaceForRow(emptyRowHeight + 4);
      const textY = rowY + rowPaddingY;
      doc.rect(50, rowY, 490, emptyRowHeight)
         .fill('#f8f9fa')
         .strokeColor('#e9ecef')
         .lineWidth(0.5)
         .stroke();
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No detailed line items available', colX[1], textY, {
           width: descriptionWidth,
           height: emptyRowHeight - rowPaddingY * 2
         });
      rowY += emptyRowHeight;
    }

    doc.y = rowY + 10;

    // Totals box
    let totalsY = doc.y + 10;
    const totalsBoxWidth = 200;
    const totalsBoxHeight = 60;
    if (totalsY + totalsBoxHeight > pageBottomY) {
      doc.addPage();
      doc.y = 50;
      totalsY = doc.y + 10;
    }
    const centerX = 295;
    const totalsBoxX = centerX - (totalsBoxWidth / 2);
    doc.rect(totalsBoxX, totalsY - 10, totalsBoxWidth, totalsBoxHeight)
       .fill('#f3f4f6')
       .strokeColor(primary)
       .lineWidth(1)
       .stroke();
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primary)
       .text('TOTAL:', totalsBoxX + 10, totalsY + 20)
       .text(this.formatPrice(estimate.totalAmount || 0), totalsBoxX + totalsBoxWidth - 10, totalsY + 20, { align: 'right' });

    // Description + Notes (distinct fields)
    const descriptionText = typeof estimate.description === 'string' ? estimate.description.trim() : '';
    const notesText = typeof estimate.notes === 'string' ? estimate.notes.trim() : '';

    const addTextSection = (label, text) => {
      if (!text) return;
      const minSectionHeight = 60;
      if (doc.y + minSectionHeight > pageBottomY) {
        doc.addPage();
        doc.y = 50;
      }
      doc.moveDown(2);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text(`${label}:`, 50, doc.y);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333')
         .text(text, 50, doc.y + 15, { width: 490, align: 'justify' });
    };

    // Keep the PDF consistent with the UI: Description is description, Notes is notes
    addTextSection('Description', descriptionText);
    addTextSection('Notes', notesText);

    doc.moveDown(2);
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('This estimate is valid for 30 days from the date of issue. Please contact us for any questions or clarifications.', { align: 'center' });
  }
}

module.exports = EstimatePdfService;
