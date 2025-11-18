const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class EstimatePdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
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

  async generateEstimatePdf(estimate) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: false });

        const customerName = estimate.customer ? `${estimate.customer.firstName || ''} ${estimate.customer.lastName || ''}`.trim().replace(/\s+/g, '_') : 'Client';
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const fileName = `Estimate_${customerName}_${estimate.estimateNumber || estimate._id}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);


        // Company name and title (centered)
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#08a171')
           .text('Castleton Real Estate, LLC dba Mr Demo Pro', { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Class A - Residential Building Contractor, DPOR License #2705161677', { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#333333')
           .text('24922 Castleton Dr Chantilly VA 20152', { align: 'center' });

        // Empty line after address
        doc.moveDown(1);




        // Render estimate page
        this.addEstimatePage(doc, estimate);

        doc.end();

        stream.on('finish', () => resolve({ fileName, filePath }));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  addEstimatePage(doc, estimate) {
    // Estimate title (company info already added above)
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
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
      const addressSources = [
        estimate.clientAddress,
        estimate.propertyAddress,
        typeof estimate.customer?.address === 'string' ? estimate.customer.address : null,
        estimate.customer?.address?.full,
        estimate.customer?.address?.street
      ];
      const address = addressSources.find(value => typeof value === 'string' && value.trim().length > 0);
      return address ? address.trim() : null;
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
         .fill('#08a171')
         .strokeColor('#08a171')
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
        const rowHeight = Math.max(minRowHeight, descriptionHeight + rowPaddingY * 2);

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
           })
           .text(descriptionText, colX[1], textY, {
             width: descriptionWidth,
             height: rowHeight - rowPaddingY * 2
           })
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
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('TOTAL:', totalsBoxX + 10, totalsY + 20)
       .text(this.formatPrice(estimate.totalAmount || 0), totalsBoxX + totalsBoxWidth - 10, totalsY + 20, { align: 'right' });

    // Notes
    if (estimate.description) {
      const minNotesHeight = 60;
      if (doc.y + minNotesHeight > pageBottomY) {
        doc.addPage();
        doc.y = 50;
      }
      doc.moveDown(2);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Notes:', 50, doc.y);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333')
         .text(estimate.description, 50, doc.y + 15, { width: 490, align: 'justify' });
    }

    // Footer note
    doc.moveDown(2);
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('This estimate is valid for 30 days from the date of issue. Please contact us for any questions or clarifications.', { align: 'center' });
    
  }
}

module.exports = EstimatePdfService;


