const fs = require('fs');

class PDFTextExtractor {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if PDF.js is available
   * @returns {boolean} True if PDF.js is available
   */
  checkAvailability() {
    try {
      require('pdfjs-dist');
      return true;
    } catch (error) {
      console.warn('⚠️ PDF.js not available, using fallback text extraction');
      return false;
    }
  }

  /**
   * Extract text from PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractText(filePath) {
    try {
      console.log('📄 PDF Text Extractor - Starting extraction...');
      console.log('📄 PDF.js available:', this.isAvailable);
      
      let result;
      if (this.isAvailable) {
        console.log('📄 Using PDF.js for extraction...');
        result = await this.extractTextWithPDFJS(filePath);
      } else {
        console.log('📄 Using fallback extraction...');
        result = await this.extractTextFallback(filePath);
      }
      
      console.log('✅ PDF extraction completed, result length:', result?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text using PDF.js library
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextWithPDFJS(filePath) {
    try {
      const pdfjsLib = require('pdfjs-dist');
      
      // Set up PDF.js worker
      if (typeof window === 'undefined') {
        // Node.js environment
        const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      }

      const data = new Uint8Array(fs.readFileSync(filePath));
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      console.log(`📄 Processing PDF with ${pdf.numPages} pages`);
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
          
          console.log(`✅ Extracted text from page ${i}/${pdf.numPages}`);
        } catch (pageError) {
          console.warn(`⚠️ Failed to extract text from page ${i}:`, pageError.message);
          fullText += `[Page ${i} - Text extraction failed]\n`;
        }
      }
      
      return fullText.trim();
    } catch (error) {
      console.warn('⚠️ PDF.js extraction failed, trying fallback:', error.message);
      return await this.extractTextFallback(filePath);
    }
  }

  /**
   * Fallback text extraction method
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFallback(filePath) {
    try {
      console.log('📄 Fallback extraction - reading file as text...');
      // Try to read the file as text (works for some PDFs that contain text)
      const buffer = fs.readFileSync(filePath);
      const text = buffer.toString('utf8');
      
      console.log('📄 Fallback text length:', text.length);
      console.log('📄 First 200 chars:', text.substring(0, 200));
      
      // Check if we got meaningful text content
      if (text.length > 100 && this.containsReadableText(text)) {
        console.log('✅ Fallback text extraction successful');
        return text;
      }
      
      console.log('📄 Text not readable, trying binary extraction...');
      // If no readable text, try to extract from binary content
      return this.extractTextFromBinary(buffer);
    } catch (error) {
      console.error('❌ Fallback extraction failed:', error.message);
      throw new Error('Unable to extract text from PDF using fallback methods');
    }
  }

  /**
   * Check if text contains readable content
   * @param {string} text - Text to check
   * @returns {boolean} True if text contains readable content
   */
  containsReadableText(text) {
    // Check for common readable characters and patterns
    const readablePatterns = [
      /[a-zA-Z]{3,}/,  // At least 3 consecutive letters
      /[0-9]{2,}/,     // At least 2 consecutive numbers
      /\s/,            // Contains whitespace
      /[.,!?;:]/,      // Contains punctuation
    ];
    
    return readablePatterns.every(pattern => pattern.test(text));
  }

  /**
   * Extract text from binary PDF content
   * @param {Buffer} buffer - PDF file buffer
   * @returns {string} Extracted text
   */
  extractTextFromBinary(buffer) {
    try {
      console.log('📄 Binary extraction - converting buffer to string...');
      // Convert buffer to string and look for text patterns
      const content = buffer.toString('latin1');
      
      console.log('📄 Binary content length:', content.length);
      console.log('📄 First 200 chars of binary content:', content.substring(0, 200));
      
      // Look for common text patterns in PDFs
      const textPatterns = [
        /\(([^)]{2,})\)/g,  // Text in parentheses
        /\[([^\]]{2,})\]/g, // Text in brackets
        /"([^"]{2,})"/g,    // Text in quotes
      ];
      
      let extractedText = '';
      
      textPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`📄 Pattern ${index + 1} found ${matches.length} matches`);
          matches.forEach(match => {
            // Clean up the extracted text
            const cleanText = match.replace(/[^\w\s.,!?;:()]/g, ' ').trim();
            if (cleanText.length > 5 && this.containsReadableText(cleanText)) {
              extractedText += cleanText + ' ';
            }
          });
        }
      });
      
      console.log('📄 Binary extraction result length:', extractedText.length);
      
      if (extractedText.length > 50) {
        console.log('✅ Binary text extraction successful');
        console.log('📄 Extracted text sample:', extractedText.substring(0, 200));
        return extractedText.trim();
      }
      
      console.log('❌ No readable text found in PDF binary content');
      throw new Error('No readable text found in PDF binary content');
    } catch (error) {
      console.error('❌ Binary text extraction failed:', error.message);
      throw new Error('Binary text extraction failed');
    }
  }

  /**
   * Get basic PDF information
   * @param {string} filePath - Path to PDF file
   * @returns {Object} PDF information
   */
  async getPDFInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const buffer = fs.readFileSync(filePath);
      
      return {
        fileSize: stats.size,
        fileName: filePath.split('/').pop(),
        hasText: this.containsReadableText(buffer.toString('utf8')),
        bufferLength: buffer.length
      };
    } catch (error) {
      throw new Error(`Failed to get PDF info: ${error.message}`);
    }
  }
}

module.exports = PDFTextExtractor;
