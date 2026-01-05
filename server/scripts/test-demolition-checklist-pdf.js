const DemolitionPrepChecklistPdfService = require('../services/demolitionPrepChecklistPdfService');
const path = require('path');

async function testPdfGeneration() {
  try {
    console.log('🧪 Testing Demolition Prep Checklist PDF Generation...\n');
    
    const pdfService = new DemolitionPrepChecklistPdfService();
    const result = await pdfService.generateDemolitionPrepChecklistPdf();
    
    console.log('✅ PDF generated successfully!');
    console.log(`📄 File: ${result.fileName}`);
    console.log(`📁 Path: ${result.filePath}`);
    console.log(`\n💡 Open the file to review the PDF content.`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

testPdfGeneration();
