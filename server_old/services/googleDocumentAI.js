const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const path = require('path');
const fs = require('fs');

class GoogleDocumentAIService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.GOOGLE_CLOUD_REGION || 'us';
    this.processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID;
    
    this.initializeClient();
  }

  initializeClient() {
    try {
      const keyFilePath = process.env.GOOGLE_CLOUD_KEY_FILE || path.join(__dirname, '../config/google-credentials.json');
      
      if (!fs.existsSync(keyFilePath)) {
        console.log('⚠️  Google credentials file not found. Document AI features will be disabled.');
        return;
      }

      this.client = new DocumentProcessorServiceClient({
        keyFilename: keyFilePath
      });

      console.log('✅ Google Document AI initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Document AI:', error);
    }
  }

  isAvailable() {
    return this.client && this.projectId && this.processorId;
  }

  async processDocument(filePath, mimeType = 'application/pdf') {
    if (!this.isAvailable()) {
      throw new Error('Google Document AI not available');
    }

    try {
      // Read the file into memory
      const imageFile = fs.readFileSync(filePath);
      const encodedImage = imageFile.toString('base64');

      // Configure the process request
      const request = {
        name: `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`,
        rawDocument: {
          content: encodedImage,
          mimeType: mimeType,
        },
      };

      // Process the document
      const [result] = await this.client.processDocument(request);
      const { document } = result;

      return this.extractStructuredData(document);
    } catch (error) {
      console.error('❌ Error processing document with Document AI:', error);
      throw error;
    }
  }

  extractStructuredData(document) {
    const extractedData = {
      text: document.text,
      pages: document.pages,
      entities: document.entities,
      customSchemeOfRepairs: null,
      propertyAddress: null,
      structuredData: {}
    };

    // Extract text content
    if (document.text) {
      extractedData.text = document.text;
    }

    // Extract entities (if any)
    if (document.entities) {
      extractedData.entities = document.entities.map(entity => ({
        type: entity.type,
        mentionText: entity.mentionText,
        confidence: entity.confidence,
        pageAnchor: entity.pageAnchor
      }));
    }

    // Extract specific sections
    extractedData.customSchemeOfRepairs = this.extractCustomSchemeOfRepairs(document.text);
    extractedData.propertyAddress = this.extractPropertyAddress(document.text);

    // Extract structured data from form fields
    if (document.pages) {
      extractedData.structuredData = this.extractFormFields(document.pages);
    }

    return extractedData;
  }

  extractCustomSchemeOfRepairs(text) {
    if (!text) return null;

    const patterns = [
      /Custom Scheme of Repairs[:\s]*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Z]|$)/i,
      /Scheme of Repairs[:\s]*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Z]|$)/i,
      /Repairs Required[:\s]*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Z]|$)/i,
      /Required Repairs[:\s]*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Z]|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  extractPropertyAddress(text) {
    if (!text) return null;

    const patterns = [
      /Property Address[:\s]*([^\n]+)/i,
      /Address[:\s]*([^\n]+)/i,
      /Location[:\s]*([^\n]+)/i,
      /Property[:\s]*([^\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  extractFormFields(pages) {
    const formFields = {};

    pages.forEach((page, pageIndex) => {
      if (page.formFields) {
        page.formFields.forEach(field => {
          const fieldName = field.fieldName?.textAnchor?.content || `field_${pageIndex}_${formFields.length}`;
          const fieldValue = field.fieldValue?.textAnchor?.content || '';
          
          if (fieldName && fieldValue) {
            formFields[fieldName.trim()] = fieldValue.trim();
          }
        });
      }
    });

    return formFields;
  }

  async processPICRADocument(filePath) {
    try {
      console.log('🔍 Processing PICRA document with Document AI...');
      
      const result = await this.processDocument(filePath);
      
      console.log('✅ Document AI processing completed');
      console.log('📄 Extracted text length:', result.text?.length || 0);
      console.log('🏠 Property Address found:', !!result.propertyAddress);
      console.log('🔧 Custom Scheme of Repairs found:', !!result.customSchemeOfRepairs);
      
      return result;
    } catch (error) {
      console.error('❌ Error processing PICRA document:', error);
      throw error;
    }
  }
}

module.exports = GoogleDocumentAIService; 