const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class FinalInvoicePdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      timeZone: "UTC"
    });
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      });
    } catch {
      return dateString;
    }
  }

  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return '$' + Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  async generateFinalInvoicePdf(contract, customer, amendments) {
    return new Promise((resolve, reject) => {
      try {
        if (!contract) {
          throw new Error('Contract data is required');
        }

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Initialize document position
        doc.y = 50;

        const clientName = customer ? 
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim().replace(/\s+/g, '_') || 
          contract.clientName?.replace(/\s+/g, '_') || 'Client' :
          contract.clientName?.replace(/\s+/g, '_') || 'Client';
        
        const dateStr = this.formatDate(new Date()).replace(/\s+/g, '_');
        const fileName = `Final_Invoice_${clientName}_${contract.contractNumber}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.addInvoiceHeader(doc, contract, customer);
        
        // Contract Summary
        this.addContractSummary(doc, contract);
        
        // Amendments Summary (if any)
        if (amendments && amendments.length > 0) {
          this.addAmendmentsSummary(doc, amendments);
        }
        
        // Final Total
        this.addFinalTotalSection(doc, contract, amendments);
        
        // Terms and Notes (moved up)
        this.addTermsSection(doc);
        
        // Payment History Section - Removed per user request
        // this.addPaymentHistorySection(doc, contract);

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            success: true
          });
        });

        stream.on('error', (err) => {
          reject(err);
        });

      } catch (error) {
        console.error('Error generating final invoice PDF:', error);
        reject(error);
      }
    });
  }

  addInvoiceHeader(doc, contract, customer) {
    // Initialize Y coordinate
    if (typeof doc.y === 'undefined' || isNaN(doc.y)) {
      doc.y = 50;
    }
    
    doc.y = 50;
    
    // Company Information
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('Castleton Real Estate, LLC dba Mr Demo Pro', { align: 'center' });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('24922 Castleton Dr Chantilly VA 20152 • 757-215-4066', { align: 'center' });
    
    doc.moveDown(0.8);
    
    // Center the invoice title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Residential PICRA Repair Contract', { align: 'center' });
    
    doc.fontSize(22)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('FINAL INVOICE', { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Professional • Reliable • Insured', { align: 'center' });
    
    // Add green line separator
    doc.moveDown(1);
    const currentY = doc.y || 150;
    doc.strokeColor('#08a171')
       .lineWidth(3)
       .moveTo(50, currentY)
       .lineTo(545, currentY)
       .stroke();
    
    doc.moveDown(1);
    
    // Invoice info box
    const infoBoxY = doc.y;
    doc.rect(45, infoBoxY - 5, 505, 80)
       .fill('#f8f9fa')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    // Left border accent
    doc.rect(45, infoBoxY - 5, 4, 80)
       .fill('#08a171');
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333');
    
    let textY = infoBoxY + 5;
    doc.text(`Invoice Date: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(this.formatDate(new Date()));
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Contract Number: `, 300, textY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(contract.contractNumber || 'N/A');
    
    textY += 20;
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Client Name: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .text(customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : contract.clientName || 'N/A');
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Status: `, 300, textY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(contract.status || 'Active');
    
    textY += 20;
    // Extract address - handle both string and object formats
    // Check contract addresses first, then fall back to customer address
    let propertyAddress = contract.propertyAddress || contract.clientAddress || contract.customerAddress || customer?.address || 'N/A';
    
    // If address is an object (e.g., { full: '...' }), extract the full property
    if (typeof propertyAddress === 'object' && propertyAddress !== null) {
      propertyAddress = propertyAddress.full || JSON.stringify(propertyAddress);
    }
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Property Address: `, 60, textY, { continued: true })
       .font('Helvetica')
       .text(propertyAddress, { width: 420 });
    
    doc.y = infoBoxY + 90;
    doc.moveDown(1);
  }

  addContractSummary(doc, contract) {
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('ORIGINAL CONTRACT', 50, doc.y);
    
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Original Contract Amount:', 60, doc.y, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(`  ${this.formatCurrency(contract.totalAmount || 0)}`);
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Contract Date: ${this.formatDate(contract.createdAt)}`, 60, doc.y);
    
    if (contract.startDate) {
      doc.text(`Start Date: ${this.formatDate(contract.startDate)}`, 60, doc.y);
    }
    
    if (contract.endDate) {
      doc.text(`Completion Date: ${this.formatDate(contract.endDate)}`, 60, doc.y);
    }

    doc.moveDown(1.5);
  }

  addAmendmentsSummary(doc, amendments) {
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('CONTRACT AMENDMENTS', 50, doc.y);
    
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    amendments.forEach((amendment, index) => {
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 50;
      }

      const boxY = doc.y;
      const boxHeight = 80;
      
      // Amendment box
      doc.rect(55, boxY - 5, 490, boxHeight)
         .fill('#f8f9fa')
         .strokeColor('#e9ecef')
         .lineWidth(1)
         .stroke();
      
      let currentY = boxY + 5;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text(`Amendment #${amendment.amendmentNumber}`, 70, currentY);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Date: ${this.formatDate(amendment.createdAt)}`, 350, currentY);
      
      currentY += 20;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Title: ${amendment.title}`, 70, currentY, { width: 460 });
      
      currentY += 15;
      
      doc.text(`Reason: ${amendment.reason}`, 70, currentY, { width: 460 });
      
      currentY += 20;
      
      const costImpactColor = amendment.totalCostChange >= 0 ? '#08a171' : '#dc3545';
      const costImpactSign = amendment.totalCostChange >= 0 ? '+' : '';
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Cost Impact: ', 70, currentY, { continued: true })
         .fillColor(costImpactColor)
         .text(`${costImpactSign}${this.formatCurrency(amendment.totalCostChange)}`);
      
      doc.y = boxY + boxHeight + 10;
      doc.moveDown(0.5);
    });

    doc.moveDown(1);
  }

  addFinalTotalSection(doc, contract, amendments) {
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Calculate final total
    let originalAmount = contract.totalAmount || 0;
    let totalAmendments = 0;
    
    if (amendments && amendments.length > 0) {
      totalAmendments = amendments.reduce((sum, amendment) => {
        return sum + (amendment.totalCostChange || 0);
      }, 0);
    }
    
    const finalTotal = originalAmount + totalAmendments;

    // Section header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('FINAL INVOICE TOTAL', 50, doc.y);
    
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    const summaryY = doc.y;
    const boxHeight = amendments && amendments.length > 0 ? 140 : 100;
    
    // Summary box
    doc.rect(45, summaryY - 5, 505, boxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(2)
       .stroke();

    const leftX = 60;
    const rightX = 350;
    let currentY = summaryY + 10;

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Original Contract Amount:', leftX, currentY);
    doc.font('Helvetica-Bold')
       .text(this.formatCurrency(originalAmount), rightX, currentY, { align: 'right', width: 180 });

    if (amendments && amendments.length > 0) {
      currentY += 25;
      const amendmentColor = totalAmendments >= 0 ? '#08a171' : '#dc3545';
      const amendmentSign = totalAmendments >= 0 ? '+' : '';
      
      doc.font('Helvetica')
         .fillColor('#333333')
         .text(`Total Amendments (${amendments.length}):`, leftX, currentY);
      doc.fillColor(amendmentColor)
         .font('Helvetica-Bold')
         .text(`${amendmentSign}${this.formatCurrency(totalAmendments)}`, rightX, currentY, { align: 'right', width: 180 });
    }

    currentY += 30;
    doc.strokeColor('#08a171')
       .lineWidth(2)
       .moveTo(leftX, currentY)
       .lineTo(530, currentY)
       .stroke();

    currentY += 15;
    doc.fillColor('#333333')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT DUE:', leftX, currentY);
    
    doc.fillColor('#08a171')
       .fontSize(20)
       .text(this.formatCurrency(finalTotal), rightX, currentY, { align: 'right', width: 180 });

    doc.fillColor('#333333');
    doc.y = summaryY + boxHeight + 10;
    doc.moveDown(1.5);
  }

  addPaymentHistorySection(doc, contract) {
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('PAYMENT DETAILS', 50, doc.y);
    
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    const depositAmount = contract.depositAmount || (contract.totalAmount * 0.3);
    const depositPercentage = contract.totalAmount > 0 ? 
      Math.round((depositAmount / contract.totalAmount) * 100) : 30;

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Deposit Required:', 60, doc.y, { continued: true })
       .font('Helvetica-Bold')
       .text(`  ${this.formatCurrency(depositAmount)} (${depositPercentage}%)`);
    
    doc.moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('Payment Method: Electronic card payments via Stripe or business checks', 60, doc.y, { width: 485 });

    doc.moveDown(1.5);
  }

  addTermsSection(doc) {
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('TERMS & CONDITIONS', 50, doc.y);
    
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text('This invoice represents the complete agreement including all approved amendments. Payment is due upon completion of work as outlined in the contract terms. All work is performed in accordance with Virginia Uniform Statewide Building Code and applicable regulations.', 
             60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);

    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('For questions regarding this invoice, please contact ezPICRA at 757-215-4066 or refer to the company information above.', 
             60, doc.y, { width: 485, align: 'center' });
    
    doc.moveDown(2);

    // Footer
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('Thank you for your business!', { align: 'center' });
  }
}

module.exports = FinalInvoicePdfService;

