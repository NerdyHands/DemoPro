const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ContractPdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Contract-specific condensed estimate page. Fits on a single page, no extra pages.
  addEstimatePageForContract(doc, contract, customer, estimate) {
    // Header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('ESTIMATE SUMMARY', { align: 'center' });
    
    const cleanHeading = (text = '') => {
      let result = text.trim();
      if (!result) return '';
      const prefixPattern = /^(contract|estimate)\s+for\s+/i;
      while (prefixPattern.test(result)) {
        result = result.replace(prefixPattern, '').trim();
      }
      return result;
    };

    const clientNameVariants = new Set(
      [
        contract?.clientName,
        contract?.customerName,
        customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : null,
        customer?.firstName,
        customer?.lastName
      ]
        .filter(Boolean)
        .map(name => name.trim().toLowerCase())
        .filter(name => name.length > 0)
    );

    const isClientName = (value) => {
      if (!value) return false;
      const normalized = value.trim().toLowerCase();
      if (!normalized) return false;
      return clientNameVariants.has(normalized);
    };

    const summarySubtitle = (() => {
      if (contract?.title && contract.title.trim().length > 0) {
        const cleanedTitle = cleanHeading(contract.title);
        if (cleanedTitle.length > 0 && !isClientName(cleanedTitle)) {
          return cleanedTitle;
        }
      }
      if (contract?.propertyAddress && contract.propertyAddress.trim().length > 0) {
        return `Property: ${contract.propertyAddress.trim()}`;
      }
      if (estimate?.estimateNumber) {
        return `Estimate #${estimate.estimateNumber}`;
      }
      if (estimate?.title) {
        const cleaned = cleanHeading(estimate.title);
        if (cleaned && !isClientName(cleaned)) {
          return cleaned;
        }
      }
      return 'PICRA Repair Estimate';
    })();
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(summarySubtitle, { align: 'center' });
    
    doc.moveDown(1.5);

    doc.moveDown(0.75);

    // Table setup
    const colWidths = [50, 260, 70, 80, 80];
    const colX = [50, 100, 360, 430, 510];
    const minRowHeight = 22;
    const rowPaddingY = 6;
    const descriptionWidth = colWidths[1] - 10;
    const pageBottomY = (doc.page && doc.page.height && doc.page.margins)
      ? (doc.page.height - doc.page.margins.bottom - 20)
      : 740;
    
    // Section label
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Line Items (condensed):', 50, doc.y);
    doc.moveDown(0.6);
    
    const drawHeaderRowContract = () => {
      const headerTop = doc.y;
      doc.rect(50, headerTop - 5, 490, 22)
         .fill('#08a171')
         .strokeColor('#08a171')
         .stroke();
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text('Item', colX[0], headerTop)
         .text('Description', colX[1], headerTop)
         .text('Qty', colX[2], headerTop)
         .text('Unit', colX[3], headerTop)
         .text('Total', colX[4], headerTop);
      return headerTop + 26;
    };
    
    let rowY = drawHeaderRowContract();
    let truncated = false;
    const reserveForTotalsAndNotes = 120; // keep space for totals and optional notes
    
    const measureRowHeight = (text) => {
      doc.fontSize(9).font('Helvetica');
      const descriptionHeight = doc.heightOfString(text, { width: descriptionWidth });
      return Math.max(minRowHeight, descriptionHeight + rowPaddingY * 2);
    };
    
    if (estimate.lineItems && estimate.lineItems.length > 0) {
      for (let i = 0; i < estimate.lineItems.length; i++) {
        const item = estimate.lineItems[i];
        const descriptionText = item.description || 'N/A';
        const rowHeight = measureRowHeight(descriptionText);
        // ensure we don't spill; do not add new pages in contract view
        if (rowY + rowHeight > pageBottomY - reserveForTotalsAndNotes) {
          truncated = true;
          break;
        }
        const bgColor = i % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(50, rowY, 490, rowHeight)
           .fill(bgColor)
           .strokeColor('#e9ecef')
           .lineWidth(0.5)
           .stroke();
        const textY = rowY + rowPaddingY;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`#${i + 1}`, colX[0], textY, {
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
      }
    } else {
      const emptyRowHeight = minRowHeight;
      doc.rect(50, rowY, 490, emptyRowHeight)
         .fill('#f8f9fa')
         .strokeColor('#e9ecef')
         .lineWidth(0.5)
         .stroke();
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No detailed line items available', colX[1], rowY + rowPaddingY, {
           width: descriptionWidth,
           height: emptyRowHeight - rowPaddingY * 2
         });
      rowY += emptyRowHeight;
    }
    
    // Totals box centered
    doc.y = rowY + 10;
    let totalsY = doc.y + 8;
    const totalsBoxWidth = 200;
    const totalsBoxHeight = 52;
    if (totalsY + totalsBoxHeight > pageBottomY) {
      totalsY = pageBottomY - totalsBoxHeight - 10;
    }
    const centerX = 295;
    const totalsBoxX = centerX - (totalsBoxWidth / 2);
    doc.rect(totalsBoxX, totalsY - 8, totalsBoxWidth, totalsBoxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('TOTAL:', totalsBoxX + 10, totalsY + 12)
       .text(this.formatPrice(estimate.totalAmount || 0), totalsBoxX + totalsBoxWidth - 10, totalsY + 12, { align: 'right' });
    
    // Truncation note if needed
    if (truncated) {
      doc.moveDown(1);
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor('#666666')
         .text('Additional line items omitted for brevity in the contract. Please refer to the standalone Estimate PDF for the full list.', 50, totalsY + totalsBoxHeight + 6, { width: 490, align: 'center' });
    }
  }

  // Helper method to extract partial address for filename
  extractPartialAddress(contract, customer) {
    let address = '';
    
    // Try to get address from customer first (most up-to-date)
    if (customer && customer.address) {
      address = customer.address;
    } else if (contract.clientAddress) {
      address = contract.clientAddress;
    } else if (contract.customerAddress) {
      address = contract.customerAddress;
    } else if (contract.address) {
      address = contract.address;
    }
    
    // If address is an object, try to extract the full property
    if (typeof address === 'object' && address !== null) {
      address = address.full || address.street || JSON.stringify(address);
    }
    
    // If it's a string that looks like an object, try to parse it
    if (typeof address === 'string' && address.startsWith('{')) {
      try {
        const parsedAddress = JSON.parse(address);
        address = parsedAddress.full || parsedAddress.street || address;
      } catch (e) {
        // If JSON parsing fails, try regex extraction for the specific format
        const fullMatch = address.match(/full:\s*'([^']+)'/);
        if (fullMatch) {
          address = fullMatch[1];
        }
      }
    }
    
    // Extract partial address (first part before comma or common separators)
    if (address && typeof address === 'string') {
      // Remove common suffixes and clean up
      let cleanAddress = address
        .replace(/,\s*(Avenue|Ave|Street|St|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Terrace|Ter|Circle|Cir|Highway|Hwy|Parkway|Pkwy)/gi, '')
        .replace(/,\s*[A-Z]{2}\s*\d{5}(-\d{4})?/gi, '') // Remove ZIP codes
        .replace(/,\s*[A-Za-z\s]+,\s*[A-Z]{2}/gi, '') // Remove city, state
        .replace(/^[^0-9]*/, '') // Remove any text before the first number
        .trim();
      
      // Take first 20 characters and clean up
      cleanAddress = cleanAddress.substring(0, 20).trim();
      
      // Remove any trailing punctuation
      cleanAddress = cleanAddress.replace(/[,\s]+$/, '');
      
      return cleanAddress || 'Unknown_Address';
    }
    
    return 'Unknown_Address';
  }

  async generateContractPdf(contract, customer, estimate) {
    return new Promise((resolve, reject) => {
      try {
        // Validate inputs
        if (!contract) {
          throw new Error('Contract data is required');
        }

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Initialize document position
        doc.y = 50;

        // Extract partial address for filename
        const partialAddress = this.extractPartialAddress(contract, customer);
        const resolvedContractName = (contract.clientName || contract.customerName || '').trim();
        const resolvedCustomerName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : '';
        const clientNameSource = resolvedContractName || resolvedCustomerName || 'Contract';
        const clientName = clientNameSource.replace(/\s+/g, '_');
        const dateStr = this.formatDate(contract.createdAt || new Date()).replace(/\s+/g, '_');
        
        const fileName = `Painting_Contract_${clientName}_${partialAddress}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Page 1: Estimate overview (condensed) when an estimate is linked
        if (estimate) {
          this.addEstimatePageForContract(doc, contract, customer, estimate);
          doc.addPage();
          doc.y = 50;
        }

        // Modern Header with Logo (transplant style)
        this.addModernHeader(doc, contract);
        
        // Parties Section (transplant style)
        this.addPartiesSection(doc, contract, customer);
        
        // Section 1: Scope of Work
        this.addScopeOfWorkSection(doc, contract);
        
        // Section 2: Consultation and Estimate
        this.addConsultationSection(doc, contract);
        
        // Section 3: Payment Terms
        this.addPaymentTermsSection(doc, contract);
        
        // Section 4: Project Timeline
        this.addProjectTimelineSection(doc, contract);
        
        // Section 5: Change Orders and Modifications
        this.addChangeOrdersSection(doc, contract);
        
        // Section 6: Permits and Compliance
        this.addPermitsSection(doc, contract);
        
        // Section 7: Liability and Insurance
        this.addLiabilitySection(doc, contract);
        
        // Section 8: Contract Termination
        this.addTerminationSection(doc, contract);
        
        // Section 9: Dispute Resolution
        this.addDisputeResolutionSection(doc, contract);
        
        // Section 10: Governing Law
        this.addGoverningLawSection(doc, contract);
        
        // Section 11: Entire Agreement
        this.addEntireAgreementSection(doc, contract);
        
        // Section 12: Signatures
        this.addSignatureSection(doc, contract, customer);

        doc.end();

        stream.on('finish', () => {
          console.log(`✅ PDF generated: ${fileName}`);
          resolve({
            fileName,
            filePath,
            fileUrl: `/uploads/${fileName}`
          });
        });

        stream.on('error', (error) => {
          console.error('❌ PDF generation stream error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ PDF generation error:', error);
        reject(error);
      }
    });
  }

  // Helper method to format dates
  formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      timeZone: "UTC"
    });
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      // Use UTC to avoid timezone shifting dates
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

  // Helper method to format price
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

  // Helper method to calculate deposit amount
  calculateDepositAmount(contract) {
    const totalAmount = contract.totalAmount || 0;
    const depositAmount = contract.depositAmount || (totalAmount * 0.3);
    return this.formatPrice(depositAmount);
  }

  // Helper method to calculate deposit percentage
  calculateDepositPercentage(contract) {
    const totalAmount = contract.totalAmount || 0;
    const depositAmount = contract.depositAmount || (totalAmount * 0.3);
    if (totalAmount > 0) {
      const percentage = (depositAmount / totalAmount) * 100;
      return Math.round(percentage);
    }
    return 30;
  }

  // Helper method to format deposit display with both amount and percentage
  formatDepositDisplay(contract) {
    const depositAmount = this.calculateDepositAmount(contract);
    const depositPercentage = this.calculateDepositPercentage(contract);
    return `${depositAmount} (${depositPercentage}% of total contract amount)`;
  }

  // Helper method to safely set Y coordinate
  safeSetY(doc, y) {
    const safeY = isNaN(y) || y === undefined ? 50 : y;
    doc.y = safeY;
    return safeY;
  }

  addModernHeader(doc, contract) {
    // Initialize Y coordinate to a safe starting position
    if (typeof doc.y === 'undefined' || isNaN(doc.y)) {
      doc.y = 50;
    }
    
    // Set Y position for text content (no logo)
    doc.y = 50;
    
    // Company name and licensing (centered, matching estimate styling)
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
    
    doc.moveDown(1);
    
    // Contract title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Residential', { align: 'center' });
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('PICRA Repair Contract', { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Professional • Reliable • Insured', { align: 'center' });
    
    // Add green line separator
    doc.moveDown(1);
    const currentY = doc.y || 200; // Ensure we have a valid Y coordinate
    doc.strokeColor('#08a171')
       .lineWidth(3)
       .moveTo(50, currentY)
       .lineTo(545, currentY)
       .stroke();
    
    doc.moveDown(1.5);

    // 3.5 Draw Schedule (Demolition)
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('3.5 Draw Schedule (Demolition)', 60, doc.y);

    doc.moveDown(0.5);

    // Calculate amounts based on total
    const totalContractAmount = Number(contract.totalAmount) || 0;
    const draws = [
      { label: 'Deposit/ Before Work Begins ', pct: 0.15 },
      { label: 'Structure Disassembly Completion (primary demo complete)', pct: 0.45 },
      { label: 'Debris Removal and Disposal', pct: 0.30 },
      { label: 'Final Site Clean and Client Sign-off', pct: 0.10 },
    ];

    // Draw schedule box
    const scheduleTop = doc.y;
    const lineHeight = 18;
    const boxPaddingY = 10;
    const boxRowCount = draws.length + 1; // header + items
    const scheduleBoxHeight = boxRowCount * lineHeight + boxPaddingY * 2;

    doc.rect(55, scheduleTop - 5, 490, scheduleBoxHeight)
       .fill('#f8f9fa')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();

    // Left accent
    doc.rect(55, scheduleTop - 5, 4, scheduleBoxHeight)
       .fill('#08a171');

    // Column positions
    const colXLabel = 70;
    const colXPct = 415;
    const colXAmt = 485;

    // Header row
    let cursorY = scheduleTop + boxPaddingY;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Milestone', colXLabel, cursorY, { width: 320 })
       .text('%', colXPct, cursorY, { width: 50, align: 'right' })
       .text('Amount', colXAmt, cursorY, { width: 60, align: 'right' });

    cursorY += lineHeight;

    // Items
    doc.font('Helvetica');
    draws.forEach((d, idx) => {
      const amount = totalContractAmount * d.pct;
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f3f4f6';
      // row background
      doc.rect(59, cursorY - 4, 486, lineHeight)
         .fill(bgColor)
         .strokeColor('#e9ecef')
         .lineWidth(0.5)
         .stroke();

      doc.fillColor('#333333')
         .text(d.label, colXLabel, cursorY, { width: 320 })
         .text(`${Math.round(d.pct * 100)}%`, colXPct, cursorY, { width: 50, align: 'right' })
         .text(this.formatPrice(amount), colXAmt, cursorY, { width: 60, align: 'right' });

      cursorY += lineHeight;
    });

    doc.y = scheduleTop + scheduleBoxHeight + 12;

    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('Note: Draws are invoiced upon completion of each listed milestone. Variations in scope or unforeseen conditions may adjust the schedule proportionally upon written agreement.', 60, doc.y, { width: 485, align: 'justify' });

    doc.moveDown(1.5);
  }

  addPartiesSection(doc, contract, customer) {
    // Check if we need a new page
    if (doc.y > 500) {
      doc.addPage();
    }

    // Create parties section box with modern styling
    const boxTop = this.safeSetY(doc, doc.y);
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
    
    // Use customer data if available, otherwise fall back to contract data
    const contractClientName = (contract.clientName || contract.customerName || '').trim();
    const customerClientName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : '';
    const clientName = contractClientName || customerClientName || 'N/A';
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(clientName, 70, currentY);
    
    currentY += 15;
    
    // Handle address that might be an object or string
    let clientAddress = customer && customer.address ? customer.address : 
      (contract.clientAddress || contract.customerAddress || 'N/A');
    
    // If it's already a string that looks like an object, try to parse it
    if (typeof clientAddress === 'string' && clientAddress.startsWith('{')) {
      try {
        const parsedAddress = JSON.parse(clientAddress);
        clientAddress = parsedAddress.full || clientAddress;
      } catch (e) {
        // If JSON parsing fails, try regex extraction for the specific format
        const fullMatch = clientAddress.match(/full:\s*'([^']+)'/);
        if (fullMatch) {
          clientAddress = fullMatch[1];
        }
        // If all parsing fails, use as-is
      }
    }
    
    // If it's an object, extract the full property
    if (typeof clientAddress === 'object' && clientAddress !== null) {
      clientAddress = clientAddress.full || JSON.stringify(clientAddress);
    }
     
    const clientAddressText = (typeof clientAddress === 'string' && clientAddress.trim().length > 0)
      ? clientAddress.trim()
      : 'Address not provided';
    const clientAddressOptions = { width: 420, align: 'left' };
    const clientAddressHeight = doc.heightOfString(clientAddressText, clientAddressOptions);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text(clientAddressText, 70, currentY, clientAddressOptions);
    
    currentY += Math.max(15, clientAddressHeight + 5);
    
    // Property address (if different from client address)
    if (contract.propertyAddress && contract.propertyAddress !== clientAddressText) {
      const propertyAddressText = `Property: ${contract.propertyAddress}`;
      const propertyOptions = { width: 420, align: 'left' };
      const propertyHeight = doc.heightOfString(propertyAddressText, propertyOptions);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(propertyAddressText, 70, currentY, propertyOptions);
      currentY += Math.max(12, propertyHeight + 5);
    }

    this.safeSetY(doc, boxTop + boxHeight + 20);
  }

  // Helper method to add section header
  addSectionHeader(doc, title, sectionNumber) {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(`${sectionNumber}. ${title}`, 50, doc.y);
    
    // Add green left border
    const headerY = doc.y - 5;
    doc.rect(45, headerY, 4, 20)
       .fill('#08a171');
    
    doc.moveDown(1);
  }

  addScopeOfWorkSection(doc, contract) {
    this.addSectionHeader(doc, 'Scope of Work', '1');
    
    // 1.1 Services Overview
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('1.1 Services Overview', 60, doc.y);
    
    doc.moveDown(0.5);
    
         doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Contractor agrees to perform residential repair services at the client\'s property as outlined in the PICRA document and detailed in the written price estimate. All work will be completed in a professional manner consistent with industry standards and in accordance with the agreed-upon inspection report items.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);
    
         // 1.2 Services Typically Include
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('1.2 Services Typically Include', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Repairs will be performed according to generally accepted residential construction practices, in compliance with applicable codes — including the Virginia Uniform Statewide Building Code (VUSBC) and the International Residential Code (IRC) as adopted by Virginia — and in alignment with the NAHB Residential Construction Performance Guidelines.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1);
     
           doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Work will include:', 60, doc.y);
     
     doc.moveDown(0.5);
     
           // Create a background box for the list
      const listTop = doc.y;
      const listHeight = 100; // Increased height for better spacing
      
      doc.rect(55, listTop - 5, 490, listHeight)
         .fill('#f8f9fa')
         .strokeColor('#08a171')
         .lineWidth(1)
         .stroke();
      
      // Add left border accent
      doc.rect(55, listTop - 5, 4, listHeight)
         .fill('#08a171');
      
      const services = [
        'Completing the specific repairs, replacements, or adjustments listed in the Property Inspection Contingency Removal Addendum (PICRA) and written estimate.',
        'Cleaning work areas after repairs are complete so the property is ready for re-inspection or closing.'
      ];
      
      let currentY = listTop + 15; // Increased top margin
      services.forEach((service, index) => {
        // Add bullet point with better positioning
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#08a171')
           .text('•', 70, currentY + 2);
        
        // Add service text with better formatting
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#333333')
           .text(service, 85, currentY, { width: 440, align: 'justify' });
        
        currentY += 35; // Increased spacing between items
      });
      
      doc.y = listTop + listHeight + 20;
  }

  addConsultationSection(doc, contract) {
    this.addSectionHeader(doc, 'Consultation and Estimate', '2');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('2.1 Professional Consultation Service', 60, doc.y);
    
    doc.moveDown(0.5);
    
         doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Contractor may provide a comprehensive in-home assessment and repair consultation, including review of the PICRA, and/or a detailed walkthrough of the property. If the client does not proceed with the contracted work, any applicable consultation fee will be non-refundable unless otherwise agreed in writing.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1.5);
  }

  addPaymentTermsSection(doc, contract) {
    this.addSectionHeader(doc, 'Payment Terms', '3');
    
    // Create total contract amount box
    const boxTop = doc.y;
    const boxHeight = 60;
    
    doc.rect(55, boxTop - 5, 490, boxHeight)
       .fill('#f3f4f6')
       .strokeColor('#08a171')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('3.1 Total Contract Amount', 70, boxTop + 10);
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(this.formatPrice(contract.totalAmount), 70, boxTop + 30);
    
    doc.y = boxTop + boxHeight + 20;
    
    // 3.2 Deposit Requirement
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('3.2 Deposit Requirement', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`A ${this.formatDepositDisplay(contract)} is required upon contract signing to secure project scheduling and ensure material allocation. This deposit confirms the client's commitment to the project.`, 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(0.8);
    
    // Add initial box for zero deposit option
    const zeroDepositBoxY = doc.y;
    doc.rect(70, zeroDepositBoxY, 12, 12)
       .lineWidth(1)
       .strokeColor('#333333')
       .stroke();
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Initial here if deposit is waived/zero: ______ (Client Initials)', 90, zeroDepositBoxY + 2, { width: 450 });
    
    doc.moveDown(1);
    
    // 3.3 Final Payment
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('3.3 Final Payment', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('The remaining balance is due immediately upon project completion and client satisfaction. Payment should be made using the same method provided for the deposit unless alternative arrangements have been made in advance.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);
    
    // 3.4 Accepted Payment Methods
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('3.4 Accepted Payment Methods', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('We accept electronic card payments through our secure Stripe payment system, as well as personal or business checks made payable to the contractor.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(0.8);
    
    // Add initial box for payment at closing option
    const closingPaymentBoxY = doc.y;
    doc.rect(70, closingPaymentBoxY, 12, 12)
       .lineWidth(1)
       .strokeColor('#333333')
       .stroke();
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Initial here if payment will be made at closing: ______ (Client Initials)', 90, closingPaymentBoxY + 2, { width: 450 });
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('Note: If payment is to be made at closing, contractor may require documentation confirming closing date and funds availability.', 90, doc.y, { width: 450, align: 'justify' });
    
    doc.moveDown(1.5);
  }

  addProjectTimelineSection(doc, contract) {
    this.addSectionHeader(doc, 'Project Timeline', '4');
    
    // 4.1 Project Start Date
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('4.1 Project Start Date', 60, doc.y);
    
    doc.moveDown(0.5);
    
    const startDate = contract.startDate ? this.formatDate(contract.startDate) : '[Insert Start Date]';
    const endDate = contract.endDate ? this.formatDate(contract.endDate) : '[Insert End Date]';
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`Work is scheduled to commence on or around: `, 60, doc.y, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text(startDate);
    
    doc.moveDown(0.5);
    
    if (contract.endDate) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`Projected completion date: `, 60, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#08a171')
         .text(endDate);
      
      doc.moveDown(0.5);
    }
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('The contractor will make every reasonable effort to complete the project within the estimated timeframe discussed during consultation.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);
    
    // 4.2 Timeline Considerations
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('4.2 Timeline Considerations', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Project completion dates are subject to weather conditions, material availability, and any unforeseen circumstances. The contractor will communicate any delays or changes to the schedule promptly and work with the client to minimize disruption.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1.5);
  }

     addLiabilitySection(doc, contract) {
     this.addSectionHeader(doc, 'Liability and Insurance', '7');
    
    // 7.1 Insurance Coverage
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('7.1 Insurance Coverage', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Contractor maintains comprehensive general liability insurance with minimum coverage of ', 60, doc.y, { continued: true, width: 485 })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('$1,000,000', { continued: true })
       .font('Helvetica')
       .fillColor('#333333')
       .text(' to protect both parties during the course of work.');
    
    doc.moveDown(1);
    
    // 7.2 Contractor Liability
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('7.2 Contractor Liability', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('The contractor agrees to indemnify and hold the client harmless against any claims or damages resulting from contractor negligence or failure to perform work according to this agreement.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);
    
    // 7.3 Client Acknowledgment
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('7.3 Client Acknowledgment', 60, doc.y);
    
    doc.moveDown(0.5);
    
         doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('The client acknowledges that renovation work may involve inherent risks and agrees to hold the contractor harmless for pre-existing conditions, hidden defects, or unforeseen issues discovered within the property during the course of work.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1);
     
     // 7.4 Virginia Contractor Transaction Recovery Fund
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('7.4 Virginia Contractor Transaction Recovery Fund', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('The Virginia Contractor Transaction Recovery Fund may provide recovery for losses suffered by homeowners due to poor workmanship or failure to perform by licensed contractors. For information about filing a claim, contact the Virginia Department of Professional and Occupational Regulation (DPOR) at (804) 367-8511 or visit www.dpor.virginia.gov.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1.5);
  }

     addTerminationSection(doc, contract) {
     this.addSectionHeader(doc, 'Contract Termination', '8');
    
    // 8.1 Termination Notice
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('8.1 Termination Notice', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Either party may terminate this contract by providing ', 60, doc.y, { continued: true, width: 485 })
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('three (3) days written notice', { continued: true })
       .font('Helvetica')
       .fillColor('#333333')
       .text(' to the other party.');
    
    doc.moveDown(0.8);
    
    // Add initial box to waive termination notice
    const waiveNoticeBoxY = doc.y;
    doc.rect(70, waiveNoticeBoxY, 12, 12)
       .lineWidth(1)
       .strokeColor('#333333')
       .stroke();
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Initial here to waive the 3-day termination notice requirement: ______ (Client Initials)', 90, waiveNoticeBoxY + 2, { width: 450 });
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('Note: By initialing above, client agrees they will not have the standard three day waiting period and may will be repsonsible for cost associated with the termination of the contract immediately. Contractor will provide list of cost incurrend with 2 business days of contract termination.', 90, doc.y, { width: 450, align: 'justify' });
   
    doc.moveDown(1);
    
    // 8.2 Termination by Client
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('8.2 Termination by Client', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`If the client terminates the contract after work has begun, any deposit will be forfeited. Additionally, any work completed up to the termination point will be invoiced separately and is due upon termination.`, 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1.5);
  }

     addDisputeResolutionSection(doc, contract) {
     this.addSectionHeader(doc, 'Dispute Resolution', '9');
    
    // 9.1 Good Faith Negotiation
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('9.1 Good Faith Negotiation', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Any disputes arising from this contract will first be addressed through direct, good-faith negotiation between the parties.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1);
    
    // 9.2 Mediation Process
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('9.2 Mediation Process', 60, doc.y);
    
    doc.moveDown(0.5);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('If direct negotiation fails to resolve the dispute, the matter will be submitted to professional mediation in accordance with the rules of the Virginia Mediation Network or another mutually agreed-upon mediation organization.', 60, doc.y, { width: 485, align: 'justify' });
    
         doc.moveDown(1.5);
   }
   
   addChangeOrdersSection(doc, contract) {
     this.addSectionHeader(doc, 'Change Orders and Modifications', '5');
     
     // 5.1 Change Order Requirements
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('5.1 Change Order Requirements', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Any modifications to the scope of work, cost, materials, or timeline must be detailed in a written change order signed by both parties before work begins. Verbal agreements or modifications are not binding and will not be recognized as valid amendments to this contract.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1);
     
     // 5.2 Change Order Process
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('5.2 Change Order Process', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Change orders must include: (1) detailed description of the modification, (2) impact on project timeline, (3) adjusted cost, (4) any additional materials required, and (5) signatures of both parties. Work on change orders will not commence until the signed change order is received.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1.5);
   }
   
   addPermitsSection(doc, contract) {
     this.addSectionHeader(doc, 'Permits and Compliance', '6');
     
     // 6.1 Permits and Inspections
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('6.1 Permits and Inspections', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('The contractor will obtain and pay for all required permits and inspections necessary for the completion of this project. The contractor will ensure all work complies with applicable building codes, zoning regulations, and local ordinances.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1);
     
     // 6.2 Code Compliance
     doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('6.2 Code Compliance', 60, doc.y);
     
     doc.moveDown(0.5);
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('All work performed under this contract will comply with the Virginia Uniform Statewide Building Code and any applicable local building codes, zoning ordinances, and regulations. The contractor is responsible for ensuring code compliance and obtaining final inspections.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1.5);
   }
   
      addGoverningLawSection(doc, contract) {
     this.addSectionHeader(doc, 'Governing Law', '10');
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#333333')
       .text('This contract shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia. Any legal proceedings related to this contract shall be conducted in Virginia courts.', 60, doc.y, { width: 485, align: 'justify' });
    
    doc.moveDown(1.5);
  }
  
           addEntireAgreementSection(doc, contract) {
      this.addSectionHeader(doc, 'Entire Agreement', '11');
     
     doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('This document represents the complete and entire agreement between the parties and supersedes all prior negotiations, discussions, or agreements, whether written or verbal. Only written modifications signed by both parties constitute binding amendments to this contract. Verbal agreements or modifications are not enforceable.', 60, doc.y, { width: 485, align: 'justify' });
     
     doc.moveDown(1.5);
   }

  addSignatureSection(doc, contract, customer) {
    // Check if we need a new page for signatures
    if (doc.y > 600) {
      doc.addPage();
    }

    this.addSectionHeader(doc, 'Signatures', '12');
    
    doc.moveDown(1);
    
         // Signature boxes container
     const signatureBoxTop = doc.y;
     const signatureBoxHeight = 150; // Increased from 120 to 150 (25% increase)
     const boxWidth = 220;
     const leftBoxX = 60;
     const rightBoxX = 325;
    
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
    
    const signatureClientName = (() => {
      const contractName = (contract.clientName || contract.customerName || '').trim();
      if (contractName.length > 0) {
        return contractName;
      }
      if (customer) {
        const combined = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (combined.length > 0) {
          return combined;
        }
      }
      return '_________________';
    })();
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(signatureClientName, leftBoxX + 10, signatureBoxTop + 50);
    
    
    
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
       .text('Castleton Real Estate, LLC dba Mr Demo ProezPICRA', rightBoxX + 10, signatureBoxTop + 50);
    
    
    
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
      
      doc.moveDown(2);
   }

   addEstimatePage(doc, contract, customer, estimate) {
     // Estimate Header
     doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('DETAILED ESTIMATE', { align: 'center' });
     
     const detailedSubtitle = (() => {
       const cleanHeading = (text = '') => {
         let result = text.trim();
         if (!result) return '';
         const prefixPattern = /^(contract|estimate)\s+for\s+/i;
         while (prefixPattern.test(result)) {
           result = result.replace(prefixPattern, '').trim();
         }
         return result;
       };
       const clientNameVariants = new Set(
         [
           contract?.clientName,
           contract?.customerName,
           customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : null,
           customer?.firstName,
           customer?.lastName
         ]
           .filter(Boolean)
           .map(name => name.trim().toLowerCase())
           .filter(name => name.length > 0)
       );
       const isClientName = (value) => {
         if (!value) return false;
         const normalized = value.trim().toLowerCase();
         if (!normalized) return false;
         return clientNameVariants.has(normalized);
       };
       if (contract?.title && contract.title.trim().length > 0) {
         const cleanedTitle = cleanHeading(contract.title);
         if (cleanedTitle.length > 0 && !isClientName(cleanedTitle)) {
           return cleanedTitle;
         }
       }
       if (contract?.propertyAddress && contract.propertyAddress.trim().length > 0) {
         return `Property: ${contract.propertyAddress.trim()}`;
       }
       if (estimate?.estimateNumber) {
         return `Estimate #${estimate.estimateNumber}`;
       }
       if (estimate?.title) {
         const cleaned = cleanHeading(estimate.title);
         if (cleaned && !isClientName(cleaned)) {
           return cleaned;
         }
       }
       return 'PICRA Repair Estimate';
     })();

     doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#08a171')
        .text(detailedSubtitle, { align: 'center' });
     
     doc.moveDown(2);
     
    // Line Items Table Header
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Detailed Line Items:', 50, doc.y);
    
    doc.moveDown(1);
    
    // Table geometry/constants
    const colWidths = [50, 250, 80, 80, 80]; // Item #, Description, Qty, Unit Price, Total
    const colX = [50, 100, 350, 430, 510];
    const minRowHeight = 24;
    const rowPaddingY = 6;
    const descriptionWidth = colWidths[1] - 10;
    const pageBottomY = (doc.page && doc.page.height && doc.page.margins)
      ? (doc.page.height - doc.page.margins.bottom - 20)
      : 740; // safe fallback
    
    // Helper to draw the header row (for first page and subsequent pages)
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
    
    // Draw initial header
    const tableTop = doc.y;
    let rowY = drawHeaderRow();
    
    // Ensure space for a row; if not, add a page and redraw the header
    const ensureSpaceForRow = (neededHeight) => {
      const heightNeeded = neededHeight || minRowHeight;
      if (rowY + heightNeeded > pageBottomY) {
        doc.addPage();
        // reset cursor and redraw header on new page
        doc.y = 50;
        rowY = drawHeaderRow();
      }
    };
     
     // Line items
    if (estimate.lineItems && estimate.lineItems.length > 0) {
      estimate.lineItems.forEach((item, index) => {
        const descriptionText = item.description || 'N/A';
        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        const descriptionHeight = doc.heightOfString(descriptionText, { width: descriptionWidth });
        const rowHeight = Math.max(minRowHeight, descriptionHeight + rowPaddingY * 2);
        
        ensureSpaceForRow(rowHeight);
        
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(50, rowY, 490, rowHeight)
           .fill(bgColor)
           .strokeColor('#e9ecef')
           .lineWidth(0.5)
           .stroke();
        
        const textY = rowY + rowPaddingY;
        doc.text(`#${index + 1}`, colX[0], textY, {
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
       ensureSpaceForRow(emptyRowHeight);
       doc.rect(50, rowY, 490, emptyRowHeight)
          .fill('#f8f9fa')
          .strokeColor('#e9ecef')
          .lineWidth(0.5)
          .stroke();
       
       doc.fontSize(9)
          .font('Helvetica')
          .fillColor('#666666')
          .text('No detailed line items available', colX[1], rowY + rowPaddingY, {
            width: descriptionWidth,
            height: emptyRowHeight - rowPaddingY * 2
          });
       
       rowY += emptyRowHeight;
     }
     
    // After table, align doc.y to end of table for subsequent sections
    doc.y = rowY + 10;
    
    // Totals section - centered on page, showing only TOTAL in green
    let totalsY = doc.y + 10;
    
    // Ensure totals box fits on the current page
    const totalsBoxWidth = 200;
    const totalsBoxHeight = 60; // Reduced height since we're only showing total
    if (totalsY + totalsBoxHeight > pageBottomY) {
      doc.addPage();
      doc.y = 50;
      totalsY = doc.y + 10;
    }
     const centerX = 295; // Center of page (595/2)
     const totalsBoxX = centerX - (totalsBoxWidth / 2);
     
     doc.rect(totalsBoxX, totalsY - 10, totalsBoxWidth, totalsBoxHeight)
        .fill('#f3f4f6')
        .strokeColor('#08a171')
        .lineWidth(1)
        .stroke();
     
     // Total only - in green
     doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#08a171')
        .text('TOTAL:', totalsBoxX + 10, totalsY + 20)
        .text(this.formatPrice(estimate.totalAmount || 0), totalsBoxX + totalsBoxWidth - 10, totalsY + 20, { align: 'right' });
     
     // Estimate notes
    if (estimate.description) {
      // Ensure space for notes title and a bit of content
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
     
     // Page footer
     doc.moveDown(2);
     doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text('This estimate is valid for 30 days from the date of issue. Please contact us for any questions or clarifications.', { align: 'center' });
   }
 }
 
 module.exports = ContractPdfService;