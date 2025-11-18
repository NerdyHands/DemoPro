const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ClientReportPdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.tempDir = path.join(__dirname, '../uploads/temp');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  async downloadImage(url) {
    try {
      // Check if it's a local file URL
      if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        // Local storage - read from filesystem
        const fs = require('fs');
        const path = require('path');
        
        // Remove leading slash and construct file path
        const relativePath = url.startsWith('/') ? url.substring(1) : url;
        const filePath = path.join(__dirname, '..', relativePath);
        
        console.log(`📁 Reading local image from: ${filePath}`);
        
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          console.log(`✅ Loaded local image, size: ${buffer.length} bytes`);
          return buffer;
        } else {
          console.error(`❌ Local image not found: ${filePath}`);
          return null;
        }
      } else {
        // Remote URL - download via HTTP
        console.log(`🌐 Downloading remote image from: ${url}`);
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        return Buffer.from(response.data);
      }
    } catch (error) {
      console.error('❌ Error loading image:', error.message);
      console.error('   URL:', url);
      return null;
    }
  }

  async generateClientReportPdf(report) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!report) {
          throw new Error('Report data is required');
        }

        const doc = new PDFDocument({
          size: 'LETTER',
          margin: 50,
          bufferPages: false // Changed to false to prevent blank pages
        });

        const customerName = report.customerName?.replace(/\s+/g, '_') || 'Client';
        const dateStr = this.formatDate(report.reportDate).replace(/\s+/g, '_');
        const fileName = `Client_Report_${customerName}_${report.reportNumber}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Cover Page
        await this.addCoverPage(doc, report);
        
        // Executive Summary
        // Executive Summary removed per user request

        // Determine if this is a pre-work inspection
        const isPreWork = report.reportType === 'Pre-Work Inspection' || 
                          (report.tasks && report.tasks.length > 0 && 
                           (!report.lineItems || report.lineItems.length === 0));

        // For pre-work: only show grouped tasks with photos (no Task Status table)
        if (isPreWork && report.tasks && report.tasks.length > 0) {
          doc.addPage();
          await this.addTasksWithPhotosSection(doc, report);
        }

        // For final reports: include task status table if tasks present
        if (!isPreWork && report.tasks && report.tasks.length > 0) {
          doc.addPage();
          await this.addTaskStatusSection(doc, report);
        }

        // Line Items Section (from contract/amendments)
        if (report.lineItems && report.lineItems.length > 0) {
          doc.addPage();
          await this.addLineItemsSection(doc, report);
        }

        // Work Details
        // Work Details removed per user request

        // Repair Pictures: for pre-work we already show photos under tasks; skip global grid
        if (!isPreWork && report.images && report.images.length > 0) {
          if (doc.y > 680) doc.addPage();
          await this.addRepairPicturesSection(doc, report);
        }

        // Recommendations
        if (report.recommendations && report.recommendations.length > 0) {
          // Only add new page if really needed (less than 100px left)
          if (doc.y > 700) doc.addPage();
          this.addRecommendationsSection(doc, report);
        }

        // Note: Footer removed to prevent blank pages
        // The bufferPages: false setting means we can't use switchToPage()
        // Footers can be added per-page if needed in the future

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
        console.error('Error generating client report PDF:', error);
        reject(error);
      }
    });
  }

  addCoverPage(doc, report) {
    // Determine if this is a pre-work inspection or final report
    const isPreWork = report.reportType === 'Pre-Work Inspection' || 
                      (report.tasks && report.tasks.length > 0 && 
                       (!report.lineItems || report.lineItems.length === 0));
    
    // Color scheme: purple for pre-work, green for final reports
    const primaryColor = isPreWork ? '#7b1fa2' : '#08a171';
    const reportTypeTitle = isPreWork ? 'PRE-WORK INSPECTION' : 'INSPECTION REPORT';
    const reportTypeSubtitle = isPreWork ? 'Initial Property Assessment & Findings' : 'Property Completion Documentation';
    
    // Add company logo at top (centered, large)
    try {
      const logoPath = path.join(__dirname, '../../client/public/logo.png');
      console.log('📷 Loading logo from:', logoPath);
      
      if (fs.existsSync(logoPath)) {
        // Large centered logo (page width 612, logo width 220)
        const logoWidth = 220;
        const xPosition = (612 - logoWidth) / 2; // Center horizontally
        doc.image(logoPath, xPosition, 50, { width: logoWidth });
        doc.y = 290; // Set Y position after large logo
        console.log('✅ Large logo added to cover page');
      } else {
        console.log('⚠️ Logo not found at:', logoPath);
        doc.y = 80; // Default Y if no logo
      }
    } catch (error) {
      console.log('⚠️ Could not load logo:', error.message);
      doc.y = 80; // Default Y if error
    }
    
    // Professional Header with Company Branding
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(reportTypeTitle, { align: 'center' });
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text(reportTypeSubtitle, { align: 'center' });
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#666666')
       .text('Professional • Detailed • Certified', { align: 'center' });
    
    // Add colored line separator
    doc.moveDown(1);
    const lineY = doc.y;
    doc.strokeColor(primaryColor)
       .lineWidth(3)
       .moveTo(50, lineY)
       .lineTo(562, lineY)
       .stroke();
    
    doc.moveDown(2);

    // Report Number Badge
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text(`REPORT #${report.reportNumber}`, { align: 'center' });

    doc.moveDown(2);

    // Project information box with modern styling
    const boxY = doc.y;
    doc.rect(80, boxY, 452, 320)
       .fillAndStroke('#f8f9fa', primaryColor);

    let infoY = boxY + 30;

    // Title
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text(report.title || (isPreWork ? 'Pre-Work Inspection Report' : 'Property Inspection Report'), 100, infoY, { width: 412, align: 'center' });

    infoY += 50;

    // Client Information Section
    const labelX = 120;
    const valueX = 240;

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('CLIENT:', labelX, infoY);
    doc.font('Helvetica')
       .fillColor('#1a1a1a')
       .text(report.customerName, valueX, infoY, { width: 270 });

    infoY += 25;

    doc.font('Helvetica-Bold')
       .fillColor('#333333')
       .text('REPORT DATE:', labelX, infoY);
    doc.font('Helvetica')
       .fillColor('#1a1a1a')
       .text(this.formatDate(report.reportDate), valueX, infoY);

    infoY += 25;

    if (report.propertyAddress) {
      // Extract address - handle both string and object formats
      let propertyAddress = report.propertyAddress;
      if (typeof propertyAddress === 'object' && propertyAddress !== null) {
        propertyAddress = propertyAddress.full || JSON.stringify(propertyAddress);
      }
      
      doc.font('Helvetica-Bold')
         .fillColor('#333333')
         .text('PROPERTY:', labelX, infoY);
      doc.font('Helvetica')
         .fillColor('#1a1a1a')
         .text(propertyAddress, valueX, infoY, { width: 270 });
      infoY += 40;
    }

    doc.font('Helvetica-Bold')
       .fillColor('#333333')
       .text('STATUS:', labelX, infoY);
    
    // Status badge
    const statusColors = {
      'Draft': '#856404',
      'In Review': '#004085',
      'Approved': '#155724',
      'Sent to Client': '#0c5460'
    };
    const statusColor = statusColors[report.status] || '#666666';
    
    doc.font('Helvetica-Bold')
       .fillColor(statusColor)
       .text(report.status, valueX, infoY);

    infoY += 30;

    // Stats - different for pre-work vs final reports
    if (isPreWork && report.tasks && report.tasks.length > 0) {
      // Pre-work: Show task count
      doc.font('Helvetica-Bold')
         .fillColor('#333333')
         .text('TASKS:', labelX, infoY);
      doc.font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(`${report.tasks.length} finding${report.tasks.length !== 1 ? 's' : ''} documented`, valueX, infoY);
    } else if (report.lineItems && report.lineItems.length > 0) {
      // Final report: Show completion percentage
      const completeCount = report.lineItems.filter(i => 
        i.inspectionStatus === 'Complete' || i.inspectionStatus === 'N/A'
      ).length;
      const total = report.lineItems.length;
      const percentage = Math.round((completeCount / total) * 100);
      
      doc.font('Helvetica-Bold')
         .fillColor('#333333')
         .text('COMPLETION:', labelX, infoY);
      doc.font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(`${percentage}% (${completeCount} of ${total} items)`, valueX, infoY);
    }

    // Company info at bottom
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('ezPICRA Solutions', 50, 700, { align: 'center' });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666');
    
    if (report.companyInfo?.phone) {
      doc.text(report.companyInfo.phone, { align: 'center' });
    }
    if (report.companyInfo?.email) {
      doc.text(report.companyInfo.email, { align: 'center' });
    }
  }


  async addTaskStatusSection(doc, report) {
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('TASK STATUS', 50, doc.y);

    doc.moveDown(1);

    if (!report.tasks || report.tasks.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No tasks recorded', 50, doc.y);
      return;
    }

    // Table header
    const tableTop = doc.y;
    const colWidths = {
      number: 40,
      description: 280,
      status: 120,
      date: 80
    };
    
    let currentX = 50;

    // Header background
    doc.rect(50, tableTop, 520, 25)
       .fillAndStroke('#f5f5f5', '#e0e0e0');

    // Headers
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333333');
    
    doc.text('#', currentX + 5, tableTop + 8, { width: colWidths.number });
    currentX += colWidths.number;
    doc.text('TASK DESCRIPTION', currentX + 5, tableTop + 8, { width: colWidths.description });
    currentX += colWidths.description;
    doc.text('STATUS', currentX + 5, tableTop + 8, { width: colWidths.status });
    currentX += colWidths.status;
    doc.text('COMPLETED', currentX + 5, tableTop + 8, { width: colWidths.date });

    doc.y = tableTop + 25;

    // Task rows
    report.tasks.forEach((task, index) => {
      if (doc.y > 720) {
        doc.addPage();
        doc.y = 50;
      }

      const rowY = doc.y;
      const rowHeight = 40;

      // Row background (alternating)
      if (index % 2 === 0) {
        doc.rect(50, rowY, 520, rowHeight)
           .fill('#fafafa');
      }

      // Border
      doc.rect(50, rowY, 520, rowHeight)
         .stroke('#e0e0e0');

      currentX = 50;

      // Task number
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text(task.taskNumber, currentX + 5, rowY + 12, { 
           width: colWidths.number,
           align: 'center'
         });
      currentX += colWidths.number;

      // Description
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#333333')
         .text(task.description, currentX + 5, rowY + 8, { 
           width: colWidths.description - 10,
           height: rowHeight - 10,
           ellipsis: true
         });
      currentX += colWidths.description;

      // Status badge
      const statusColors = {
        'Complete': { bg: '#4CAF50', text: '#ffffff' },
        'Needs Attention': { bg: '#f44336', text: '#ffffff' },
        'In Progress': { bg: '#ff9800', text: '#ffffff' },
        'Not Started': { bg: '#9e9e9e', text: '#ffffff' }
      };

      const colors = statusColors[task.status] || { bg: '#cccccc', text: '#000000' };
      
      doc.rect(currentX + 10, rowY + 10, colWidths.status - 20, 20)
         .fillAndStroke(colors.bg, colors.bg);

      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor(colors.text)
         .text(task.status.toUpperCase(), currentX + 10, rowY + 15, {
           width: colWidths.status - 20,
           align: 'center'
         });
      currentX += colWidths.status;

      // Completed date
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text(task.completedDate ? this.formatDate(task.completedDate).substring(0, 12) : '-', 
               currentX + 5, rowY + 15, { 
                 width: colWidths.date - 10,
                 align: 'center'
               });

      doc.y = rowY + rowHeight;
    });

    doc.moveDown(1);
  }


  async addRepairPicturesSection(doc, report) {
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('REPAIR PICTURES', 50, 50);

    doc.moveDown(1);

    if (!report.images || report.images.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No images available', 50, doc.y);
      return;
    }

    const imagesPerRow = 2;
    const imageWidth = 240;
    const imageHeight = 180;
    const imageSpacing = 20;
    const captionHeight = 40;

    let currentX = 50;
    let currentY = doc.y;
    let imagesInRow = 0;

    for (let i = 0; i < report.images.length; i++) {
      const image = report.images[i];

      // Check if we need a new page
      if (currentY + imageHeight + captionHeight > 720) {
        doc.addPage();
        currentY = 50;
        currentX = 50;
        imagesInRow = 0;
      }

      // Download and add image
      try {
        const imageBuffer = await this.downloadImage(image.gcsUrl);
        if (imageBuffer) {
          // Draw border
          doc.rect(currentX - 2, currentY - 2, imageWidth + 4, imageHeight + captionHeight + 4)
             .stroke('#cccccc');

          // Add image
          doc.image(imageBuffer, currentX, currentY, {
            fit: [imageWidth, imageHeight],
            align: 'center',
            valign: 'center'
          });

          // Category badge
          const categoryY = currentY + 5;
          const categoryX = currentX + 5;
          const categoryColor = this.getCategoryColor(image.category);
          
          doc.rect(categoryX, categoryY, 80, 18)
             .fillAndStroke(categoryColor, categoryColor);

          doc.fontSize(8)
             .font('Helvetica-Bold')
             .fillColor('#ffffff')
             .text(image.category.toUpperCase(), categoryX, categoryY + 5, {
               width: 80,
               align: 'center'
             });

          // Caption
          const captionY = currentY + imageHeight + 5;
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#333333')
             .text(image.caption || image.originalName || 'No caption', 
                   currentX, captionY, {
                     width: imageWidth,
                     height: captionHeight - 10,
                     ellipsis: true,
                     align: 'center'
                   });

          // Task reference
          if (image.taskNumber) {
            doc.fontSize(7)
               .fillColor('#999999')
               .text(`Task #${image.taskNumber}`, currentX, captionY + 25, {
                 width: imageWidth,
                 align: 'center'
               });
          }
        }
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        // Add placeholder
        doc.rect(currentX, currentY, imageWidth, imageHeight)
           .fillAndStroke('#f0f0f0', '#cccccc');
        doc.fontSize(10)
           .fillColor('#999999')
           .text('Image unavailable', currentX, currentY + imageHeight / 2, {
             width: imageWidth,
             align: 'center'
           });
      }

      imagesInRow++;

      if (imagesInRow >= imagesPerRow) {
        // Move to next row
        currentY += imageHeight + captionHeight + imageSpacing;
        currentX = 50;
        imagesInRow = 0;
      } else {
        // Move to next column
        currentX += imageWidth + imageSpacing;
      }
    }

    doc.y = currentY + imageHeight + captionHeight + 20;
  }

  addPageHeader(doc, report) {
    // Company header on each page (matching contract style)
    const headerY = 30;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('ezPICRA', 50, headerY);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Solutions', 50, headerY + 16);
    
    // Report info on right
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Report: ${report.reportNumber}`, 450, headerY, { align: 'right', width: 112 });
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#999999')
       .text(`${report.customerName}`, 450, headerY + 12, { align: 'right', width: 112 });
    
    // Thin line under header
    doc.strokeColor('#e0e0e0')
       .lineWidth(1)
       .moveTo(50, headerY + 30)
       .lineTo(562, headerY + 30)
       .stroke();
  }

  async addLineItemsSection(doc, report) {
    // Add company header
    this.addPageHeader(doc, report);
    
    // Professional Section Header (matching contract style)
    doc.y = 75; // Start below header
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('LINE ITEM INSPECTION REPORT', 50, 75);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Detailed status, photos, and notes for each contracted item', 50, doc.y + 5);
    
    // Add green line separator
    doc.moveDown(0.8);
    const lineY = doc.y;
    doc.strokeColor('#08a171')
       .lineWidth(2)
       .moveTo(50, lineY)
       .lineTo(562, lineY)
       .stroke();
    
    doc.moveDown(1.5);

    if (!report.lineItems || report.lineItems.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No line items found', 50, doc.y);
      return;
    }

    for (let i = 0; i < report.lineItems.length; i++) {
      const item = report.lineItems[i];

      // Check if we need a new page (only if really necessary)
      if (doc.y > 700) {
        doc.addPage();
        this.addPageHeader(doc, report);
        doc.y = 75; // Start below header
      }

      const itemStartY = doc.y;

      // Item number and description (clean, no box)
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#08a171')
         .text(`${item.lineItemNumber}.`, 50, itemStartY);

      // Item description (multi-line support)
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text(item.description, 80, itemStartY, { width: 350, align: 'left' });

      // Status badge (right-aligned)
      const statusColors = {
        'Complete': { bg: '#4CAF50', text: '#ffffff' },
        'Needs Attention': { bg: '#f44336', text: '#ffffff' },
        'In Progress': { bg: '#ff9800', text: '#ffffff' },
        'Not Started': { bg: '#9e9e9e', text: '#ffffff' },
        'N/A': { bg: '#cccccc', text: '#333333' }
      };

      const colors = statusColors[item.inspectionStatus] || { bg: '#cccccc', text: '#000000' };
      const statusX = 450;
      const statusWidth = 112;
      
      doc.roundedRect(statusX, itemStartY, statusWidth, 20, 3)
         .fillAndStroke(colors.bg, colors.bg);

      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(colors.text)
         .text(item.inspectionStatus.toUpperCase(), statusX, itemStartY + 6, {
           width: statusWidth,
           align: 'center'
         });

      doc.moveDown(1.2);

      // Item details
      const detailsY = doc.y;
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#666666');
      
      const detailsX = 60;
      let detailY = detailsY;

      if (item.quantity) {
        doc.text(`Quantity: ${item.quantity}`, detailsX, detailY);
        detailY += 15;
      }
      if (item.unitPrice) {
        doc.text(`Unit Price: $${item.unitPrice.toFixed(2)}`, detailsX, detailY);
        detailY += 15;
      }
      if (item.totalPrice) {
        doc.text(`Total Price: $${item.totalPrice.toFixed(2)}`, detailsX, detailY);
        detailY += 15;
      }
      if (item.sourceType === 'amendment' && item.amendmentNumber) {
        doc.fillColor('#856404')
           .text(`Source: Amendment ${item.amendmentNumber}`, detailsX, detailY);
        detailY += 15;
      }

      doc.y = Math.max(detailY, doc.y) + 5;

      // Inspection notes (clean, no box)
      if (item.inspectionNotes && item.inspectionNotes.trim().length > 0) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#08a171')
           .text('Notes: ', 60, doc.y, { continued: true })
           .font('Helvetica')
           .fillColor('#333333')
           .text(item.inspectionNotes.trim(), { width: 490, align: 'left' });
        
        doc.moveDown(0.5);
      }

      // Images - Handle both single image (legacy) and multiple images
      const imagesToRender = [];
      
      // Debug logging for images
      console.log(`Line item ${item.lineItemNumber} - Checking for images:`, {
        hasImagesArray: !!item.images,
        imagesLength: item.images?.length || 0,
        hasLegacyImage: !!item.image,
        legacyImageUrl: item.image?.gcsUrl
      });
      
      // New format: multiple images
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imagesToRender.push(...item.images);
        console.log(`Found ${item.images.length} images in images array`);
      } 
      // Legacy format: single image
      else if (item.image && item.image.gcsUrl) {
        imagesToRender.push(item.image);
        console.log('Found legacy single image');
      }

      // Render photos with header if we have images (thumbnail grid)
      if (imagesToRender.length > 0) {
        console.log(`Rendering ${imagesToRender.length} photos for line item ${item.lineItemNumber}`);
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#08a171')
           .text(`Photos (${imagesToRender.length}):`, 60, doc.y);
        
        doc.moveDown(0.5);
        
        // Consistent thumbnail dimensions
        const thumbWidth = 150;
        const thumbHeight = 112;
        const thumbsPerRow = 3;
        const spacing = 16;
        const startX = 60;
        let currentX = startX;
        let currentY = doc.y;
        let photosInRow = 0;
        
        // Render all images as consistent thumbnails
        for (let imgIndex = 0; imgIndex < imagesToRender.length; imgIndex++) {
          const img = imagesToRender[imgIndex];
          
          try {
            console.log(`Loading image ${imgIndex + 1}: ${img.gcsUrl}`);
            const imageBuffer = await this.downloadImage(img.gcsUrl);
            if (imageBuffer) {
              console.log(`✅ Loaded image ${imgIndex + 1}, size: ${imageBuffer.length} bytes`);
              
              // Check if we need a new row
              if (photosInRow >= thumbsPerRow) {
                currentX = startX;
                currentY += thumbHeight + spacing;
                photosInRow = 0;
              }

              // Check if we need a new page (only if really necessary)
              if (currentY + thumbHeight > 720) {
                doc.addPage();
                this.addPageHeader(doc, report);
                currentY = 75;
                currentX = startX;
                photosInRow = 0;
              }

              // Add image (no border, cleaner look)
              doc.image(imageBuffer, currentX, currentY, {
                fit: [thumbWidth, thumbHeight],
                align: 'center',
                valign: 'center'
              });

              // Image number badge (if multiple images)
              if (imagesToRender.length > 1) {
                doc.circle(currentX + 12, currentY + 12, 10)
                   .fillAndStroke('#08a171', '#08a171');
                
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .fillColor('#ffffff')
                   .text(`${imgIndex + 1}`, currentX + (imgIndex + 1 < 10 ? 9 : 6), currentY + 7);
              }

              currentX += thumbWidth + spacing;
              photosInRow++;
            } else {
              console.error(`Image ${imgIndex + 1} returned no buffer`);
            }
          } catch (error) {
            console.error(`Error adding line item image ${imgIndex + 1} to PDF:`, error);
            console.error('Image URL:', img.gcsUrl);
          }
        }
        
        // Move Y position past the last row of thumbnails
        doc.y = currentY + thumbHeight + 20;
      }

      // Simple separator between items (not on last item)
      if (i < report.lineItems.length - 1) {
        doc.moveDown(0.8);
        doc.strokeColor('#e0e0e0')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .stroke();

        doc.moveDown(1);
      }
    }
  }

  addRecommendationsSection(doc, report) {
    // Professional section header (matching contract style)
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#08a171')
       .text('RECOMMENDATIONS FOR FUTURE WORK', 50, doc.y);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Suggested maintenance and improvements', 50, doc.y + 5);
    
    doc.moveDown(0.5);
    const lineY = doc.y;
    doc.strokeColor('#08a171')
       .lineWidth(2)
       .moveTo(50, lineY)
       .lineTo(562, lineY)
       .stroke();

    doc.moveDown(1.2);

    if (!report.recommendations || report.recommendations.length === 0) {
      if (report.futureWork) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333333')
           .text(report.futureWork, 50, doc.y, { width: 512, align: 'justify' });
      }
      return;
    }

    report.recommendations.forEach((rec, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      const priorityColor = {
        'Critical': '#f44336',
        'High': '#ff9800',
        'Medium': '#2196F3',
        'Low': '#4CAF50'
      }[rec.priority] || '#999999';

      // Priority indicator
      doc.circle(58, doc.y + 5, 4)
         .fillAndStroke(priorityColor, priorityColor);

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text(`${index + 1}. ${rec.description}`, 70, doc.y, { width: 492 });

      if (rec.estimatedCost) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Estimated Cost: $${rec.estimatedCost.toFixed(2)}`, 70, doc.y);
      }

      doc.moveDown(0.8);
    });
  }

  getCategoryColor(category) {
    const colors = {
      'Before': '#2196F3',
      'During': '#ff9800',
      'After': '#4CAF50',
      'Issue': '#f44336',
      'Completed': '#4CAF50',
      'Documentation': '#9c27b0',
      'Other': '#757575'
    };
    return colors[category] || '#757575';
  }

  addPageFooter(doc, pageNumber, totalPages, report) {
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#999999');

    // Left side - Report info
    doc.text(`Report #${report.reportNumber}`, 50, 770);

    // Center - Date
    doc.text(this.formatDate(report.reportDate), 0, 770, {
      width: 612,
      align: 'center'
    });

    // Right side - Page number
    doc.text(`Page ${pageNumber} of ${totalPages}`, 0, 770, {
      width: 562,
      align: 'right'
    });
  }

  async addTasksWithPhotosSection(doc, report) {
    // Add company header
    this.addPageHeader(doc, report);
    
    doc.y = 80;
    
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('PRE-WORK TASKS & FINDINGS', 50, doc.y);

    doc.moveDown(0.5);
    
    // Add description line
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Detailed findings from pre-work inspection with supporting documentation', 50, doc.y);

    doc.moveDown(1.5);

    if (!report.tasks || report.tasks.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text('No tasks available', 50, doc.y);
      return;
    }

    // Group images by task number with robust parsing and collect unassigned
    const imagesByTask = {};
    const unassignedImages = [];
    const taskNumbersSet = new Set((report.tasks || []).map(t => Number(t.taskNumber)));

    const extractTaskNumber = (image) => {
      // Prefer explicit field
      if (image.taskNumber !== undefined && image.taskNumber !== null && image.taskNumber !== '') {
        const n = Number(image.taskNumber);
        if (!Number.isNaN(n)) return n;
      }
      // Fallback: parse from caption "Task #N"
      if (image.caption && typeof image.caption === 'string') {
        const m = image.caption.match(/Task\s*#(\d+)/i);
        if (m && m[1]) {
          const n = Number(m[1]);
          if (!Number.isNaN(n)) return n;
        }
      }
      return undefined;
    };

    (report.images || []).forEach((img) => {
      const tn = extractTaskNumber(img);
      if (!tn || !taskNumbersSet.has(tn)) {
        unassignedImages.push(img);
        return;
      }
      if (!imagesByTask[tn]) imagesByTask[tn] = [];
      imagesByTask[tn].push(img);
    });

    for (let i = 0; i < report.tasks.length; i++) {
      const task = report.tasks[i];

      // Check if we need a new page for the task header and details
      if (doc.y > 650) {
        doc.addPage();
        this.addPageHeader(doc, report);
        doc.y = 80;
      }

      // Task header with number badge
      const taskHeaderY = doc.y;
      
      // Task number badge (purple to distinguish from final reports)
      doc.roundedRect(50, taskHeaderY, 45, 24, 3)
         .fillAndStroke('#7b1fa2', '#7b1fa2');
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text(`#${task.taskNumber || i + 1}`, 50, taskHeaderY + 7, { 
           width: 45, 
           align: 'center' 
         });

      // Task description
      doc.fontSize(13)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text(task.description || 'Task Description', 105, taskHeaderY + 4, { width: 465 });

      doc.moveDown(0.3);

      // Task details box
      const boxTop = doc.y;
      const boxHeight = task.notes ? 70 : 50;
      
      // Background
      doc.rect(50, boxTop, 512, boxHeight)
         .fillAndStroke('#f8f9fa', '#e0e0e0');

      let detailY = boxTop + 12;

      // Status badge
      const statusColors = {
        'Complete': '#4CAF50',
        'Needs Attention': '#f44336',
        'In Progress': '#ff9800',
        'Not Started': '#9e9e9e'
      };
      const statusColor = statusColors[task.status] || '#9e9e9e';
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#666666')
         .text('STATUS:', 65, detailY);
      
      doc.roundedRect(115, detailY - 2, 90, 16, 2)
         .fillAndStroke(statusColor, statusColor);
      
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text((task.status || 'Not Started').toUpperCase(), 115, detailY + 2, { 
           width: 90, 
           align: 'center' 
         });

      // Quantity
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#666666')
         .text('QUANTITY:', 230, detailY);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#333333')
         .text(task.suggestedQuantity || '1', 295, detailY);

      // Completion date (if available)
      if (task.completedAt) {
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#666666')
           .text('COMPLETED:', 350, detailY);
        
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333')
           .text(this.formatDate(task.completedAt), 430, detailY);
      }

      detailY += 25;

      // Notes section (if available)
      if (task.notes) {
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#666666')
           .text('NOTES:', 65, detailY);
        
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#555555')
           .text(task.notes, 65, detailY + 14, { 
             width: 480, 
             height: 30,
             ellipsis: true 
           });
      }

      doc.y = boxTop + boxHeight + 15;

      // Task photos
      const photos = imagesByTask[Number(task.taskNumber)] || [];
      if (photos.length > 0) {
        // Photo count indicator
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#7b1fa2')
           .text(`${photos.length} Photo${photos.length !== 1 ? 's' : ''}:`, 50, doc.y);
        
        doc.moveDown(0.8);

        // Grid of photos under this task
        const imagesPerRow = 2;
        const imageWidth = 240;
        const imageHeight = 180;
        const imageSpacing = 20;
        const captionHeight = 40;

        let currentX = 50;
        let currentY = doc.y;
        let imagesInRow = 0;

        for (let p = 0; p < photos.length; p++) {
          // Check if we need a new page
          if (currentY + imageHeight + captionHeight > 700) {
            doc.addPage();
            this.addPageHeader(doc, report);
            doc.y = 80;
            
            // Continuation indicator
            doc.fontSize(9)
               .font('Helvetica-Oblique')
               .fillColor('#999999')
               .text(`Task #${task.taskNumber || i + 1} (continued)`, 50, doc.y);
            
            doc.moveDown(1);
            currentY = doc.y;
            currentX = 50;
            imagesInRow = 0;
          }

          try {
            const imageBuffer = await this.downloadImage(photos[p].gcsUrl);
            if (imageBuffer) {
              // Border around image and caption
              doc.rect(currentX - 2, currentY - 2, imageWidth + 4, imageHeight + captionHeight + 4)
                 .strokeColor('#d0d0d0')
                 .lineWidth(1)
                 .stroke();

              // Image
              doc.image(imageBuffer, currentX, currentY, { 
                fit: [imageWidth, imageHeight], 
                align: 'center', 
                valign: 'center' 
              });

              // Photo number badge
              doc.roundedRect(currentX + 5, currentY + 5, 30, 18, 2)
                 .fillAndStroke('#7b1fa2', '#7b1fa2');
              
              doc.fontSize(10)
                 .font('Helvetica-Bold')
                 .fillColor('#ffffff')
                 .text(`${p + 1}`, currentX + 5, currentY + 9, { 
                   width: 30, 
                   align: 'center' 
                 });

              // Caption
              const captionY = currentY + imageHeight + 5;
              doc.fontSize(9)
                 .font('Helvetica')
                 .fillColor('#333333')
                 .text(photos[p].caption || photos[p].originalName || 'No caption', currentX, captionY, {
                   width: imageWidth,
                   height: captionHeight - 10,
                   ellipsis: true,
                   align: 'center'
                 });
            }
          } catch (err) {
            // Placeholder for unavailable image
            doc.rect(currentX, currentY, imageWidth, imageHeight)
               .fillAndStroke('#f5f5f5', '#d0d0d0');
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#999999')
               .text('Image unavailable', currentX, currentY + imageHeight / 2, { 
                 width: imageWidth, 
                 align: 'center' 
               });
          }

          imagesInRow++;
          if (imagesInRow >= imagesPerRow) {
            currentY += imageHeight + captionHeight + imageSpacing;
            currentX = 50;
            imagesInRow = 0;
          } else {
            currentX += imageWidth + imageSpacing;
          }
        }
        
        // Update document Y position after all photos
        if (imagesInRow > 0) {
          // We're in the middle of a row
          doc.y = currentY + imageHeight + captionHeight;
        } else {
          // We completed a full row
          doc.y = currentY;
        }
      }

      // Separator line between tasks
      if (i < report.tasks.length - 1) {
        doc.moveDown(1.5);
        
        if (doc.y > 720) {
          doc.addPage();
          this.addPageHeader(doc, report);
          doc.y = 80;
        }
        
        doc.strokeColor('#e0e0e0')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .stroke();
        
        doc.moveDown(1.5);
      }
    }

    // Render any unassigned photos at the end so nothing is lost
    if (unassignedImages.length > 0) {
      if (doc.y > 650) {
        doc.addPage();
        this.addPageHeader(doc, report);
        doc.y = 80;
      }

      doc.moveDown(1);
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#7b1fa2')
         .text('UNASSIGNED PHOTOS', 50, doc.y);

      doc.moveDown(0.5);

      const imagesPerRow = 2;
      const imageWidth = 240;
      const imageHeight = 180;
      const imageSpacing = 20;
      const captionHeight = 40;

      let currentX = 50;
      let currentY = doc.y;
      let imagesInRow = 0;

      for (let i = 0; i < unassignedImages.length; i++) {
        if (currentY + imageHeight + captionHeight > 700) {
          doc.addPage();
          this.addPageHeader(doc, report);
          doc.y = 80;
          currentY = doc.y;
          currentX = 50;
          imagesInRow = 0;
        }
        try {
          const imageBuffer = await this.downloadImage(unassignedImages[i].gcsUrl);
          if (imageBuffer) {
            doc.rect(currentX - 2, currentY - 2, imageWidth + 4, imageHeight + captionHeight + 4)
               .strokeColor('#d0d0d0')
               .lineWidth(1)
               .stroke();
            doc.image(imageBuffer, currentX, currentY, { fit: [imageWidth, imageHeight], align: 'center', valign: 'center' });
            const captionY = currentY + imageHeight + 5;
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#333333')
               .text(unassignedImages[i].caption || unassignedImages[i].originalName || 'No caption', currentX, captionY, {
                 width: imageWidth,
                 height: captionHeight - 10,
                 ellipsis: true,
                 align: 'center'
               });
          }
        } catch (err) {
          doc.rect(currentX, currentY, imageWidth, imageHeight)
             .fillAndStroke('#f5f5f5', '#d0d0d0');
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#999999')
             .text('Image unavailable', currentX, currentY + imageHeight / 2, { width: imageWidth, align: 'center' });
        }

        imagesInRow++;
        if (imagesInRow >= imagesPerRow) {
          currentY += imageHeight + captionHeight + imageSpacing;
          currentX = 50;
          imagesInRow = 0;
        } else {
          currentX += imageWidth + imageSpacing;
        }
      }
    }
  }
}

module.exports = ClientReportPdfService;

