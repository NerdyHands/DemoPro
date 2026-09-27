const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');

class PaymentReceiptPdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads/receipts');
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

  formatPrice(price) {
    if (!price && price !== 0) return "$0";
    const number = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(number)) return "$0";
    return number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  async generatePaymentReceipt(payment, contract, customer, milestone) {
    return new Promise((resolve, reject) => {
      try {
        if (!payment || !contract) {
          throw new Error('Payment and contract data are required');
        }

        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Initialize document position
        doc.y = 50;

        // Generate filename
        const clientNameForFile = customer ? 
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim().replace(/\s+/g, '_') || 
          contract.clientName?.replace(/\s+/g, '_') || 'Client' :
          contract.clientName?.replace(/\s+/g, '_') || 'Client';
        
        const paymentDate = payment.date ? new Date(payment.date) : new Date();
        const dateStr = paymentDate.toISOString().slice(0, 10).replace(/-/g, '');
        const receiptNumber = `REC-${contract.contractNumber || contract._id}-${Date.now()}`;
        const fileName = `Payment_Receipt_${clientNameForFile}_${receiptNumber}_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
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

        doc.moveDown(2);

        // Receipt Title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text('PAYMENT RECEIPT', { align: 'center' });

        doc.moveDown(1.5);

        // Receipt Number and Date
        const receiptInfoTop = doc.y;
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Receipt Number:', 50, receiptInfoTop)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text(receiptNumber, 180, receiptInfoTop);

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Date:', 400, receiptInfoTop)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text(this.formatDate(payment.date || new Date()), 430, receiptInfoTop);

        doc.moveDown(2);

        // Client Information Box
        const clientBoxTop = doc.y;
        const clientBoxHeight = 100;
        
        doc.rect(50, clientBoxTop - 5, 495, clientBoxHeight)
           .fill('#f8f9fa')
           .strokeColor('#08a171')
           .lineWidth(1)
           .stroke();
        
        doc.rect(50, clientBoxTop - 5, 4, clientBoxHeight)
           .fill('#08a171');

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text('Client Information', 70, clientBoxTop + 10);

        const clientName = customer ? 
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
          contract.clientName || 'N/A' :
          contract.clientName || 'N/A';

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`Name: ${clientName}`, 70, clientBoxTop + 30);

        if (contract.contractNumber) {
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#333333')
             .text(`Contract Number: ${contract.contractNumber}`, 70, clientBoxTop + 50);
        }

        if (contract.propertyAddress) {
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#333333')
             .text(`Property: ${contract.propertyAddress}`, 70, clientBoxTop + 70, { width: 450 });
        }

        doc.y = clientBoxTop + clientBoxHeight + 20;

        // Payment Details Box
        const paymentBoxTop = doc.y;
        const paymentBoxHeight = 150;
        
        doc.rect(50, paymentBoxTop - 5, 495, paymentBoxHeight)
           .fill('#f8f9fa')
           .strokeColor('#08a171')
           .lineWidth(1)
           .stroke();
        
        doc.rect(50, paymentBoxTop - 5, 4, paymentBoxHeight)
           .fill('#08a171');

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text('Payment Details', 70, paymentBoxTop + 10);

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Amount Paid:', 70, paymentBoxTop + 35)
           .font('Helvetica-Bold')
           .fillColor('#08a171')
           .fontSize(18)
           .text(this.formatPrice(payment.amount), 200, paymentBoxTop + 30);

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Payment Method:', 70, paymentBoxTop + 60)
           .font('Helvetica-Bold')
           .fillColor('#333333')
           .text(payment.method || 'N/A', 200, paymentBoxTop + 60);

        if (payment.transactionId) {
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Transaction ID:', 70, paymentBoxTop + 85)
             .font('Helvetica-Bold')
             .fillColor('#333333')
             .text(payment.transactionId, 200, paymentBoxTop + 85);
        }

        if (payment.notes) {
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Notes:', 70, paymentBoxTop + 110)
             .font('Helvetica')
             .fillColor('#333333')
             .text(payment.notes, 200, paymentBoxTop + 110, { width: 320 });
        }

        doc.y = paymentBoxTop + paymentBoxHeight + 20;

        // Contract Summary
        if (contract.totalAmount) {
          const summaryBoxTop = doc.y;
          const summaryBoxHeight = 80;
          
          doc.rect(50, summaryBoxTop - 5, 495, summaryBoxHeight)
             .fill('#f3f4f6')
             .strokeColor('#08a171')
             .lineWidth(1)
             .stroke();
          
          doc.rect(50, summaryBoxTop - 5, 4, summaryBoxHeight)
             .fill('#08a171');

          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor('#333333')
             .text('Contract Summary', 70, summaryBoxTop + 10);

          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Total Contract Amount:', 70, summaryBoxTop + 35)
             .font('Helvetica-Bold')
             .fillColor('#333333')
             .text(this.formatPrice(contract.totalAmount), 250, summaryBoxTop + 35);

          // Calculate totals from milestone if available
          let totalPaid = payment.amount;
          if (milestone && milestone.payment && milestone.payment.partialPayments) {
            totalPaid = milestone.payment.partialPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          }

          const remainingBalance = contract.totalAmount - totalPaid;

          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Amount Paid to Date:', 70, summaryBoxTop + 55)
             .font('Helvetica-Bold')
             .fillColor('#28a745')
             .text(this.formatPrice(totalPaid), 250, summaryBoxTop + 55);

          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Remaining Balance:', 300, summaryBoxTop + 55)
             .font('Helvetica-Bold')
             .fillColor(remainingBalance > 0 ? '#856404' : '#0c5460')
             .text(this.formatPrice(remainingBalance), 450, summaryBoxTop + 55);
        }

        doc.moveDown(2);

        // Footer
        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .fillColor('#666666')
           .text('This is an official receipt for payment received. Please retain for your records.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          console.log(`✅ Payment receipt PDF generated: ${fileName}`);
          resolve({
            fileName,
            filePath,
            fileUrl: `/uploads/receipts/${fileName}`
          });
        });

        stream.on('error', (error) => {
          console.error('❌ Payment receipt PDF generation stream error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Payment receipt PDF generation error:', error);
        reject(error);
      }
    });
  }

  async convertPdfToPng(pdfPath, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        // For now, we'll use a simpler approach - return the PDF path
        // and let the client handle conversion, or we can use a library like pdf-poppler
        // For simplicity, we'll create an endpoint that serves the PDF
        // and the client can convert it using pdf.js
        
        // Alternative: Use pdfjs-dist to render to canvas (requires canvas package)
        // For now, we'll return the PDF path and handle conversion client-side
        resolve(pdfPath);
      } catch (error) {
        console.error('❌ Error converting PDF to PNG:', error);
        reject(error);
      }
    });
  }
}

module.exports = PaymentReceiptPdfService;

