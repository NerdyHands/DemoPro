const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class DemolitionPrepChecklistPdfService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generateDemolitionPrepChecklistPdf() {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'LETTER', 
          margin: 50, 
          bufferPages: false 
        });

        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const fileName = `Demolition_Prep_Checklist_${dateStr}.pdf`;
        const filePath = path.join(this.uploadsDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add company logo at top if available
        try {
          const logoPath = path.join(__dirname, '../../client/public/logo.png');
          if (fs.existsSync(logoPath)) {
            const logoWidth = 180;
            const xPosition = (612 - logoWidth) / 2; // Center horizontally
            doc.image(logoPath, xPosition, 30, { width: logoWidth });
            doc.y = 140; // Set Y position after logo
          } else {
            doc.y = 50;
          }
        } catch (error) {
          console.log('⚠️ Could not load logo:', error.message);
          doc.y = 50;
        }

        // Company name (if no logo, start here)
        if (doc.y === 50) {
          doc.fontSize(16)
             .font('Helvetica-Bold')
             .fillColor('#EC4100') // Brand orange
             .text('Castleton Real Estate, LLC dba Mr Demo Pro', { align: 'center' });
          
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#666666')
             .text('Class A - Residential Building Contractor, DPOR License #2705161677', { align: 'center' });
          
          doc.moveDown(1);
        } else {
          doc.moveDown(0.5);
        }

        // Main Title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#1a202c') // Dark gray for text
           .text('What to Do Before Any Demolition Project', { align: 'center' });

        doc.moveDown(1);

        // Subtitle/intro text
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#4a5568') // Medium gray
           .text('Demolition requires careful planning and attention to detail. This checklist helps ensure your project proceeds safely and legally.', { 
             align: 'center',
             width: 500,
             continued: false
           });

        doc.moveDown(1.2);

        // Section 1: Permits Needed
        this.addSection(doc, 
          '1. Permits Needed',
          [
            '• Research local building codes and zoning requirements',
            '• Obtain demolition permits from your city or county',
            '• Verify utility disconnect requirements (gas, electric, water, sewer)',
            '• Check for asbestos or lead paint testing requirements',
            '• Confirm property boundary surveys if needed',
            '• Understand permit processing timelines (often 2-4 weeks)'
          ],
          '#EC4100'
        );

        doc.moveDown(0.6);

        // Section 2: Neighbor Notifications
        this.addSection(doc, 
          '2. Neighbor Notifications',
          [
            '• Inform adjacent property owners 30 days in advance',
            '• Provide project timeline and expected duration',
            '• Share contractor contact information',
            '• Address noise and dust mitigation plans',
            '• Discuss potential impacts (parking, access, etc.)',
            '• Maintain open communication throughout the project'
          ],
          '#EC4100'
        );

        doc.moveDown(0.6);

        // Section 3: Safety Concerns
        this.addSection(doc, 
          '3. Safety Concerns',
          [
            '• Identify and mark utility lines (call 811 before digging)',
            '• Secure the work area with proper barriers and signage',
            '• Assess structural integrity before starting',
            '• Plan for hazardous material handling (asbestos, lead, etc.)',
            '• Ensure proper personal protective equipment (PPE)',
            '• Have emergency contacts and first aid supplies ready',
            '• Consider environmental factors (weather, stability)'
          ],
          '#d63500' // Slightly darker orange for emphasis
        );

        doc.moveDown(0.6);

        // Section 4: Waste Removal Planning
        this.addSection(doc, 
          '4. Waste Removal Planning',
          [
            '• Estimate volume and type of debris to be removed',
            '• Arrange for dumpster rental or hauling services',
            '• Identify recyclable materials (metal, concrete, wood)',
            '• Plan for proper disposal of hazardous waste',
            '• Schedule removal to avoid debris accumulation',
            '• Verify waste facility acceptance of demolition materials'
          ],
          '#EC4100'
        );

        doc.moveDown(0.9);

        // Professional Help Callout Box
        const boxY = doc.y;
        const boxHeight = 75;
        doc.rect(50, boxY, 512, boxHeight)
           .fillColor('#FFF4EC') // Light orange background
           .fill()
           .strokeColor('#EC4100')
           .lineWidth(2)
           .stroke();

        doc.y = boxY + 12;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#d63500')
           .text('Professional Help Recommended', {
             x: 60,
             width: 492
           });

        doc.y += 10;
        doc.fontSize(9.5)
           .font('Helvetica')
           .fillColor('#1a202c')
           .text('Demolition projects involve significant risks including structural collapse, utility hazards, and regulatory compliance. Professional demolition contractors have the experience, equipment, insurance, and knowledge to handle these challenges safely and efficiently.', {
             x: 60,
             width: 492,
             lineGap: 3
           });

        doc.y += 20;
        doc.fontSize(9.5)
           .font('Helvetica-Bold')
           .fillColor('#EC4100')
           .text('Contact Mr Demo Pro for a professional consultation:', {
             x: 60,
             width: 492
           });

        doc.y += 6;
        doc.fontSize(9.5)
           .font('Helvetica')
           .fillColor('#1a202c')
           .text('Phone: 757-848-4559  |  Website: mrdemopro.com', {
             x: 60,
             width: 492
           });

        doc.y = boxY + boxHeight + 10;

        // Footer
        doc.fontSize(7.5)
           .font('Helvetica')
           .fillColor('#718096') // Light gray
           .text('This checklist is for informational purposes only and does not constitute professional advice. Always consult with licensed professionals for your specific project.', {
             align: 'center',
             width: 512
           });

        doc.end();

        stream.on('finish', () => resolve({ fileName, filePath }));
        stream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  addSection(doc, title, items, accentColor) {
    // Section title
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor(accentColor)
       .text(title, {
         width: 512
       });

    doc.moveDown(0.35);

    // Section items
    items.forEach(item => {
      doc.fontSize(9.5)
         .font('Helvetica')
         .fillColor('#1a202c') // Dark gray
         .text(item, {
           width: 492,
           indent: 20,
           lineGap: 2.5
         });
    });
  }
}

module.exports = DemolitionPrepChecklistPdfService;
