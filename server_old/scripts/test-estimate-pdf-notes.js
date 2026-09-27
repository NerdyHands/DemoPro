/**
 * Quick smoke test for Estimate PDF generation to ensure `estimate.notes`
 * is rendered (and not accidentally mapped to `estimate.description`).
 *
 * Run:
 *   node server/scripts/test-estimate-pdf-notes.js
 *
 * Optional env:
 *   TEST_ESTIMATE_NOTES="your notes text"
 */
const fs = require('fs');
const path = require('path');
const EstimatePdfService = require('../services/estimatePdfService');
const PDFTextExtractor = require('../services/pdfTextExtractor');

async function main() {
  const notes = process.env.TEST_ESTIMATE_NOTES
    || 'Notes\nEXCLUSIONS Electrical, data, or low-voltage disconnections';

  const estimate = {
    _id: 'test_estimate_id',
    estimateNumber: 'EST-TEST-0001',
    title: 'Test Estimate PDF Notes',
    status: 'Draft',
    createdAt: new Date(),
    customer: { firstName: 'Test', lastName: 'Customer', email: 'test@example.com' },
    description: 'This is a description field (should show under Description).',
    notes,
    totalAmount: 1234,
    lineItems: [
      { description: 'Demo work', quantity: 1, unitPrice: 1234, totalPrice: 1234, notes: ['Line item note 1'] }
    ]
  };

  const pdfService = new EstimatePdfService();
  const { filePath, fileName } = await pdfService.generateEstimatePdf(estimate);

  console.log('✅ Generated PDF:', fileName);
  console.log('📄 Path:', filePath);

  const extractor = new PDFTextExtractor();
  const text = await extractor.extractText(filePath);

  const hasNotesLabel = /Notes:/i.test(text);
  const hasNotesText = text.includes('EXCLUSIONS') || text.includes(notes.split('\n')[0]);
  const hasDescriptionLabel = /Description:/i.test(text);

  console.log('🔎 Extracted text length:', text.length);
  console.log('🔎 Found "Description:" label:', hasDescriptionLabel);
  console.log('🔎 Found "Notes:" label:', hasNotesLabel);
  console.log('🔎 Found expected notes content:', hasNotesText);

  if (!hasNotesLabel || !hasNotesText) {
    console.error('❌ Smoke test failed: Notes content not found in extracted PDF text.');
    process.exitCode = 1;
  } else {
    console.log('✅ Smoke test passed: Notes content appears in the PDF.');
  }

  // Keep the file around for manual inspection if needed
  const outDir = path.join(__dirname, '..', 'uploads', 'smoke-tests');
  fs.mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, fileName);
  try {
    fs.renameSync(filePath, dest);
    console.log('📦 Saved PDF to:', dest);
  } catch (e) {
    // If rename fails (e.g., cross-device), just copy
    fs.copyFileSync(filePath, dest);
    console.log('📦 Copied PDF to:', dest);
  }
}

main().catch((err) => {
  console.error('❌ Smoke test error:', err);
  process.exitCode = 1;
});


