const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class AmendmentPdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return '$' + Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  async generateAmendmentPdf(amendment, contract, customer) {
    return new Promise((resolve, reject) => {
      try {
        if (!amendment) {
          throw new Error('Amendment data is required');
        }
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
          amendment.clientName.replace(/\s+/g, '_') :
          amendment.clientName.replace(/\s+/g, '_');
        
        const dateStr = this.formatDate(amendment.createdAt || new Date()).replace(/\s+/g, '_');
        const fileName = `Contract_Amendment_${clientName}_${amendment.amendmentNumber}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Page 1: Amendment Details
        this.addAmendmentHeader(doc, amendment, contract);
        this.addPartiesSection(doc, amendment, customer, contract);
        this.addAmendmentDetails(doc, amendment);
        this.addLineItemChangesSection(doc, amendment);
        this.addFinancialSummarySection(doc, amendment);
        
        // Check if we need a new page for signatures
        if (doc.y > 600) {
          doc.addPage();
          doc.y = 50;
        }
        
        this.addSignatureSection(doc, amendment, customer);

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
        console.error('Error generating amendment PDF:', error);
        reject(error);
      }
    });
  }

  addAmendmentHeader(doc, amendment, contract) {
    // Initialize Y coordinate to a safe starting position
    if (typeof doc.y === 'undefined' || isNaN(doc.y)) {
      doc.y = 50;
    }
    
    // Set Y position for text content (no logo)
    doc.y = 50;
    
    // Center the contract title with modern styling
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Residential PICRA Repair Contract', { align: 'center' });
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('CONTRACT AMENDMENT', { align: 'center' });
    
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
    
    // Amendment and Contract numbers in a professional box
    const infoBoxY = doc.y;
    doc.rect(45, infoBoxY - 5, 505, 90)
       .fill('#f8f9fa')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    // Left border accent
    doc.rect(45, infoBoxY - 5, 4, 90)
       .fill('#08a171');
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333');
    
    let textY = infoBoxY + 5;
    doc.text(`Amendment Number: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(amendment.amendmentNumber);
    
    textY += 20;
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Contract Number: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(contract.contractNumber);
    
    textY += 20;
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Amendment Date: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .text(this.formatDate(amendment.createdAt));
    
    textY += 20;
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(`Effective Date: `, 60, textY, { continued: true })
       .font('Helvetica-Bold')
       .text(this.formatDate(amendment.effectiveDate));
    
    doc.y = infoBoxY + 100;
    doc.moveDown(1);
  }

  addPartiesSection(doc, amendment, customer, contract) {
    // Check if we need a new page
    if (doc.y > 500) {
      doc.addPage();
      doc.y = 50;
    }

    // Create parties section box with modern styling
    const boxTop = doc.y;
    const boxHeight = 150;
    
    // Background box
    doc.rect(45, boxTop - 10, 505, boxHeight)
       .fill('#f8f9fa')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    // Left border accent
    doc.rect(45, boxTop - 10, 4, boxHeight)
       .fill('#08a171');
    
    let currentY = boxTop + 10;
    
    // CONTRACTOR Section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('CONTRACTOR', 60, currentY);
    
    currentY += 20;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(contract.contractorName || 'Castleton Real Estate, LLC dba Mr Demo Pro', 70, currentY);
    
    currentY += 15;
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Class A - Residential Building Contractor, DPOR License #2705161677', 70, currentY);
    
    currentY += 12;
    
    doc.fontSize(10)
       .text(contract.contractorAddress || '24922 Castleton Dr Chantilly VA 20152', 70, currentY);
    
    currentY += 25;
    
    // CLIENT Section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('CLIENT', 60, currentY);
    
    currentY += 20;
    
    // Use customer data if available
    const clientName = customer ? 
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 
      amendment.clientName || 'N/A';
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(clientName, 70, currentY);
    
    currentY += 15;
    
    // Client address
    const clientAddress = amendment.clientAddress || (customer && customer.address ? customer.address : 'N/A');
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text(clientAddress, 70, currentY);
    
    // Property address (if different from client address)
    if (amendment.propertyAddress && amendment.propertyAddress !== clientAddress) {
      // Extract address - handle both string and object formats
      let propertyAddress = amendment.propertyAddress;
      if (typeof propertyAddress === 'object' && propertyAddress !== null) {
        propertyAddress = propertyAddress.full || JSON.stringify(propertyAddress);
      }
      
      currentY += 15;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Property: ${propertyAddress}`, 70, currentY);
    }

    doc.y = boxTop + boxHeight + 20;
  }

  addAmendmentDetails(doc, amendment) {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header with green accent
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('AMENDMENT DETAILS', 50, doc.y);
    
    // Add green left border
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    // Amendment title
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Title:', 60, doc.y);
    
    doc.fontSize(11)
       .font('Helvetica')
       .text(amendment.title, 60, doc.y, { width: 485 });
    
    doc.moveDown(0.8);

    // Reason for amendment
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Reason for Amendment:', 60, doc.y);
    
    doc.fontSize(11)
       .font('Helvetica')
       .text(amendment.reason, 60, doc.y, { width: 485 });
    
    doc.moveDown(0.8);

    // Description if available
    if (amendment.description) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Description:', 60, doc.y);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(amendment.description, 60, doc.y, { width: 485 });
    }

    doc.moveDown(1.5);
  }

  addLineItemChangesSection(doc, amendment) {
    if (!amendment.lineItemChanges || amendment.lineItemChanges.length === 0) {
      return;
    }

    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header with green accent
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('LINE ITEM CHANGES', 50, doc.y);
    
    // Add green left border
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    amendment.lineItemChanges.forEach((change, index) => {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 50;
      }

      const changeColor = change.changeType === 'added' ? '#28a745' : 
                         change.changeType === 'removed' ? '#dc3545' : '#ffc107';
      
      const changeText = change.changeType === 'added' ? 'NEW ITEM' : 
                        change.changeType === 'removed' ? 'REMOVED' : 'MODIFIED';

      // Change header
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(changeColor)
         .text(`${change.lineItemNumber} - ${changeText}`, 50, doc.y);
      
      doc.fillColor('#333333');
      doc.moveDown(0.3);

      if (change.changeType === 'added') {
        this.addLineItemDetails(doc, 'New', change.updated);
      } else if (change.changeType === 'removed') {
        this.addLineItemDetails(doc, 'Original', change.original);
      } else if (change.changeType === 'modified') {
        this.addLineItemDetails(doc, 'Original', change.original);
        doc.moveDown(0.3);
        this.addLineItemDetails(doc, 'Updated', change.updated);
      }

      // Cost impact
      const impactColor = change.costImpact >= 0 ? '#28a745' : '#dc3545';
      const impactSign = change.costImpact >= 0 ? '+' : '';
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(impactColor)
         .text(`Cost Impact: ${impactSign}${this.formatCurrency(change.costImpact)}`, 50, doc.y);
      
      doc.fillColor('#333333');
      doc.moveDown(1);
    });

    doc.moveDown(0.5);
  }

  addLineItemDetails(doc, label, lineItem) {
    if (!lineItem) return;

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#555555')
       .text(label + ':', 60, doc.y);
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .text(lineItem.description, 60, doc.y, { width: 480 });
    
    doc.text(`Quantity: ${lineItem.quantity}  |  Unit Price: ${this.formatCurrency(lineItem.unitPrice)}  |  Total: ${this.formatCurrency(lineItem.totalPrice)}`, 
             60, doc.y, { width: 480 });
    
    doc.moveDown(0.3);
  }

  addFinancialSummarySection(doc, amendment) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header with green accent
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('FINANCIAL SUMMARY', 50, doc.y);
    
    // Add green left border
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    const summaryY = doc.y;
    const boxHeight = 120;
    
    // Draw box with green border
    doc.rect(45, summaryY - 5, 505, boxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();

    doc.fillColor('#333333');
    
    // Financial details
    const leftX = 60;
    const rightX = 350;
    let currentY = summaryY + 10;

    doc.fontSize(11)
       .font('Helvetica')
       .text('Original Contract Amount:', leftX, currentY);
    doc.font('Helvetica-Bold')
       .text(this.formatCurrency(amendment.originalContractAmount), rightX, currentY, { align: 'right', width: 180 });

    currentY += 20;
    doc.font('Helvetica')
       .text('Added Items:', leftX, currentY);
    doc.fillColor('#08a171')
       .font('Helvetica-Bold')
       .text('+' + this.formatCurrency(amendment.addedItemsTotal), rightX, currentY, { align: 'right', width: 180 });

    currentY += 20;
    doc.fillColor('#333333')
       .font('Helvetica')
       .text('Removed Items:', leftX, currentY);
    doc.fillColor('#dc3545')
       .font('Helvetica-Bold')
       .text(this.formatCurrency(amendment.removedItemsTotal), rightX, currentY, { align: 'right', width: 180 });

    currentY += 20;
    doc.fillColor('#333333')
       .font('Helvetica')
       .text('Modified Items Impact:', leftX, currentY);
    const modColor = amendment.modifiedItemsImpact >= 0 ? '#08a171' : '#dc3545';
    const modSign = amendment.modifiedItemsImpact >= 0 ? '+' : '';
    doc.fillColor(modColor)
       .font('Helvetica-Bold')
       .text(modSign + this.formatCurrency(amendment.modifiedItemsImpact), rightX, currentY, { align: 'right', width: 180 });

    // Horizontal line
    currentY += 25;
    doc.strokeColor('#08a171')
       .lineWidth(2)
       .moveTo(leftX, currentY)
       .lineTo(530, currentY)
       .stroke();

    currentY += 10;
    doc.fillColor('#333333')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('New Contract Amount:', leftX, currentY);
    
    doc.fillColor('#08a171')
       .fontSize(16)
       .text(this.formatCurrency(amendment.newContractAmount), rightX, currentY, { align: 'right', width: 180 });

    doc.fillColor('#333333');
    doc.y = summaryY + boxHeight + 10;
    doc.moveDown(1);
  }

  addSignatureSection(doc, amendment, customer) {
    // Check if we need a new page for signatures
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    // Section header with green accent
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('SIGNATURES', 50, doc.y);
    
    // Add green left border
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('By signing below, both parties acknowledge and accept the terms of this amendment to the original contract.', 
             50, doc.y, { width: 485, align: 'justify' });

    doc.moveDown(1.5);

    // Signature boxes container
    const signatureBoxTop = doc.y;
    const signatureBoxHeight = 150;
    const boxWidth = 220;
    const leftBoxX = 60;
    const rightBoxX = 315;
    
    // Client signature box
    doc.rect(leftBoxX, signatureBoxTop, boxWidth, signatureBoxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('CLIENT SIGNATURE', leftBoxX + 10, signatureBoxTop + 15);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Client Name:', leftBoxX + 10, signatureBoxTop + 35);
    
    const clientName = customer ? 
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || amendment.clientName : 
      amendment.clientName || '_________________';
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(clientName, leftBoxX + 10, signatureBoxTop + 50);
    
    // Signature line at bottom of box
    doc.strokeColor('#333333')
       .lineWidth(1)
       .moveTo(leftBoxX + 10, signatureBoxTop + signatureBoxHeight - 30)
       .lineTo(leftBoxX + boxWidth - 10, signatureBoxTop + signatureBoxHeight - 30)
       .stroke();
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Client Signature', leftBoxX + 10, signatureBoxTop + signatureBoxHeight - 25);
    
    // Company signature box
    doc.rect(rightBoxX, signatureBoxTop, boxWidth, signatureBoxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('CONTRACTOR SIGNATURE', rightBoxX + 10, signatureBoxTop + 15);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Company Name:', rightBoxX + 10, signatureBoxTop + 35);
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Castleton Real Estate, LLC', rightBoxX + 10, signatureBoxTop + 50);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('dba Mr Demo Pro', rightBoxX + 10, signatureBoxTop + 65);
    
    // Signature line at bottom of box
    doc.strokeColor('#333333')
       .lineWidth(1)
       .moveTo(rightBoxX + 10, signatureBoxTop + signatureBoxHeight - 30)
       .lineTo(rightBoxX + boxWidth - 10, signatureBoxTop + signatureBoxHeight - 30)
       .stroke();
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Contractor Signature', rightBoxX + 10, signatureBoxTop + signatureBoxHeight - 25);
    
    doc.y = signatureBoxTop + signatureBoxHeight + 20;
    doc.moveDown(1);
    
    // Footer note
    doc.fontSize(8)
       .fillColor('#666666')
       .font('Helvetica-Oblique')
       .text('This amendment becomes effective upon signature by both parties and forms an integral part of the original contract.', 
             50, doc.y, { width: 485, align: 'center' });
  }
}

module.exports = AmendmentPdfService;

