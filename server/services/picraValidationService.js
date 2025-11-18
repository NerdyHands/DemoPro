const fs = require('fs');
const path = require('path');

class PICRAValidationService {
  constructor() {
    // Define PICRA-specific keywords and patterns
    this.picraKeywords = {
      // Document title keywords
      titleKeywords: [
        'property inspection contingency removal addendum',
        'picra',
        'property inspection',
        'contingency removal',
        'addendum',
        'real estate information network',
        'rein'
      ],
      
      // Form field keywords
      formFields: [
        'buyer',
        'seller',
        'selling firm',
        'listing firm',
        'property address',
        'subject property',
        'inspection date',
        'contingency removal',
        'repair items',
        'requested repair items',
        'home inspection',
        'property inspection',
        'eifs',
        'lead-based paint',
        'moisture inspection',
        'well and septic'
      ],
      
      // Legal and real estate terms
      legalTerms: [
        'purchase agreement',
        'agreement dated',
        'subject to',
        'hereby removed',
        'attached',
        'applicable',
        'repairs are necessary',
        'seller agrees',
        'buyer reserves',
        'walk through',
        'evidence of payment',
        'workmanlike manner',
        'qualified professional',
        'licensed contractor',
        'licensed plumber',
        'licensed hvac contractor'
      ],
      
      // Repair-related keywords
      repairKeywords: [
        'repair',
        'replace',
        'secure',
        'support',
        'damage',
        'leak',
        'moisture',
        'trim',
        'fascia',
        'roof',
        'plumbing',
        'electrical',
        'hvac',
        'ductwork',
        'sink',
        'bathroom',
        'kitchen',
        'window',
        'door',
        'foundation',
        'structural',
        'safety',
        'code compliance'
      ],
      
      // Property inspection terms
      inspectionTerms: [
        'inspection',
        'inspector',
        'inspection report',
        'condition report',
        'property condition',
        'defects',
        'deficiencies',
        'issues',
        'problems',
        'concerns',
        'recommendations',
        'findings',
        'assessment',
        'evaluation'
      ]
    };

    // Define confidence scoring weights
    this.confidenceWeights = {
      titleMatch: 0.25,        // Document title contains PICRA keywords
      formFields: 0.30,        // Presence of standard form fields
      legalTerms: 0.20,        // Legal and real estate terminology
      repairContent: 0.15,     // Repair-related content
      inspectionTerms: 0.10    // Inspection-related terminology
    };

    // Minimum confidence threshold
    this.minConfidenceThreshold = 0.6;
  }

  /**
   * Validate if a document is a PICRA document
   * @param {string} filePath - Path to the document file
   * @param {string} mimeType - MIME type of the document
   * @returns {Object} Validation result with confidence score and details
   */
  async validatePICRADocument(filePath, mimeType = 'application/pdf') {
    try {
      console.log('🔍 Validating PICRA document:', path.basename(filePath));
      console.log('📁 File path:', filePath);
      console.log('📄 MIME type:', mimeType);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('❌ File does not exist:', filePath);
        return {
          isValid: false,
          confidence: 0,
          reason: 'File does not exist',
          details: { error: 'File not found' }
        };
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      console.log('📊 File size:', stats.size, 'bytes');
      
      // Extract text from the document
      console.log('🔤 Starting text extraction...');
      const extractedText = await this.extractTextFromDocument(filePath, mimeType);
      
      console.log('📝 Extracted text length:', extractedText?.length || 0);
      console.log('📝 First 200 characters:', extractedText?.substring(0, 200) || 'No text');
      console.log('📝 Last 200 characters:', extractedText?.substring(-200) || 'No text');
      
      if (!extractedText || extractedText.trim().length === 0) {
        console.error('❌ No text content extracted from document');
        return {
          isValid: false,
          confidence: 0,
          reason: 'No text content could be extracted from the document',
          details: {
            textLength: 0,
            titleMatch: false,
            formFieldsFound: 0,
            legalTermsFound: 0,
            repairContentFound: false,
            inspectionTermsFound: 0,
            fileSize: stats.size,
            extractionMethod: 'failed'
          }
        };
      }

      // Analyze the document content
      console.log('🔍 Analyzing document content...');
      const analysis = this.analyzeDocumentContent(extractedText);
      
      console.log('📊 Analysis results:');
      console.log('  - Title match:', analysis.titleMatch);
      console.log('  - Form fields found:', analysis.formFieldsFound, '/', analysis.totalFormFields);
      console.log('  - Legal terms found:', analysis.legalTermsFound, '/', analysis.totalLegalTerms);
      console.log('  - Repair content found:', analysis.repairContentFound);
      console.log('  - Inspection terms found:', analysis.inspectionTermsFound, '/', analysis.totalInspectionTerms);
      
      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(analysis);
      
      // Determine if document is valid PICRA
      const isValid = confidence >= this.minConfidenceThreshold;
      
      const result = {
        isValid,
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
        reason: this.generateValidationReason(analysis, confidence),
        details: {
          ...analysis,
          fileSize: stats.size,
          extractionMethod: 'success',
          textLength: extractedText.length
        },
        extractedTextLength: extractedText.length,
        sampleText: extractedText.substring(0, 500) + '...' // First 500 characters for debugging
      };

      console.log('✅ PICRA validation completed');
      console.log('📊 Confidence Score:', result.confidence);
      console.log('✅ Is Valid PICRA:', result.isValid);
      console.log('📝 Reason:', result.reason);
      console.log('📄 Sample text (first 500 chars):', result.sampleText);

      return result;

    } catch (error) {
      console.error('❌ Error validating PICRA document:', error);
      return {
        isValid: false,
        confidence: 0,
        reason: `Validation failed: ${error.message}`,
        details: {
          error: error.message
        }
      };
    }
  }

  /**
   * Extract text from document based on MIME type
   * @param {string} filePath - Path to the document
   * @param {string} mimeType - MIME type of the document
   * @returns {string} Extracted text content
   */
  async extractTextFromDocument(filePath, mimeType) {
    try {
      console.log('🔤 Extracting text from document...');
      console.log('📄 MIME type:', mimeType);
      
      let extractedText = '';
      
      if (mimeType === 'application/pdf') {
        console.log('📄 Processing as PDF...');
        extractedText = await this.extractTextFromPDF(filePath);
      } else if (mimeType.includes('word') || mimeType.includes('document')) {
        console.log('📄 Processing as Word document...');
        extractedText = await this.extractTextFromWordDocument(filePath);
      } else {
        console.log('📄 Processing as text file...');
        // For other file types, try to read as text
        extractedText = fs.readFileSync(filePath, 'utf8');
      }
      
      console.log('✅ Text extraction completed');
      console.log('📝 Extracted text length:', extractedText?.length || 0);
      
      return extractedText;
    } catch (error) {
      console.error('❌ Error extracting text from document:', error);
      throw new Error(`Failed to extract text from document: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {string} Extracted text
   */
  async extractTextFromPDF(filePath) {
    try {
      console.log('📄 Using PDF text extractor...');
      const PDFTextExtractor = require('./pdfTextExtractor');
      const extractor = new PDFTextExtractor();
      const text = await extractor.extractText(filePath);
      console.log('✅ PDF extraction successful, length:', text?.length || 0);
      return text;
    } catch (error) {
      console.warn('⚠️ PDF extraction failed, trying fallback method:', error.message);
      // Fallback: try to read as text (might work for some PDFs)
      try {
        console.log('📄 Trying fallback text extraction...');
        const text = fs.readFileSync(filePath, 'utf8');
        console.log('✅ Fallback extraction successful, length:', text?.length || 0);
        return text;
      } catch (fallbackError) {
        console.error('❌ Fallback extraction also failed:', fallbackError.message);
        throw new Error('Unable to extract text from PDF document');
      }
    }
  }

  /**
   * Extract text from Word document
   * @param {string} filePath - Path to Word document
   * @returns {string} Extracted text
   */
  async extractTextFromWordDocument(filePath) {
    try {
      // For Word documents, we'll use a simple text extraction
      // In production, you might want to use libraries like mammoth for .docx files
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error('Unable to extract text from Word document');
    }
  }

  /**
   * Analyze document content for PICRA indicators
   * @param {string} text - Extracted text content
   * @returns {Object} Analysis results
   */
  analyzeDocumentContent(text) {
    const normalizedText = text.toLowerCase();
    
    // Check for title keywords
    const titleMatch = this.picraKeywords.titleKeywords.some(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );

    // Count form fields found
    const formFieldsFound = this.picraKeywords.formFields.filter(field => 
      normalizedText.includes(field.toLowerCase())
    ).length;

    // Count legal terms found
    const legalTermsFound = this.picraKeywords.legalTerms.filter(term => 
      normalizedText.includes(term.toLowerCase())
    ).length;

    // Check for repair content
    const repairContentFound = this.picraKeywords.repairKeywords.some(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );

    // Count inspection terms found
    const inspectionTermsFound = this.picraKeywords.inspectionTerms.filter(term => 
      normalizedText.includes(term.toLowerCase())
    ).length;

    return {
      titleMatch,
      formFieldsFound,
      legalTermsFound,
      repairContentFound,
      inspectionTermsFound,
      totalFormFields: this.picraKeywords.formFields.length,
      totalLegalTerms: this.picraKeywords.legalTerms.length,
      totalInspectionTerms: this.picraKeywords.inspectionTerms.length
    };
  }

  /**
   * Calculate confidence score based on analysis
   * @param {Object} analysis - Document analysis results
   * @returns {number} Confidence score between 0 and 1
   */
  calculateConfidenceScore(analysis) {
    let score = 0;

    // Title match weight
    if (analysis.titleMatch) {
      score += this.confidenceWeights.titleMatch;
    }

    // Form fields weight (normalized by total possible fields)
    const formFieldsScore = Math.min(analysis.formFieldsFound / analysis.totalFormFields, 1);
    score += formFieldsScore * this.confidenceWeights.formFields;

    // Legal terms weight (normalized by total possible terms)
    const legalTermsScore = Math.min(analysis.legalTermsFound / analysis.totalLegalTerms, 1);
    score += legalTermsScore * this.confidenceWeights.legalTerms;

    // Repair content weight
    if (analysis.repairContentFound) {
      score += this.confidenceWeights.repairContent;
    }

    // Inspection terms weight (normalized by total possible terms)
    const inspectionTermsScore = Math.min(analysis.inspectionTermsFound / analysis.totalInspectionTerms, 1);
    score += inspectionTermsScore * this.confidenceWeights.inspectionTerms;

    return Math.min(score, 1); // Ensure score doesn't exceed 1
  }

  /**
   * Generate human-readable validation reason
   * @param {Object} analysis - Document analysis results
   * @param {number} confidence - Confidence score
   * @returns {string} Human-readable reason
   */
  generateValidationReason(analysis, confidence) {
    const reasons = [];

    if (confidence >= this.minConfidenceThreshold) {
      reasons.push('Document appears to be a valid PICRA document');
    } else {
      reasons.push('Document does not meet PICRA validation criteria');
    }

    if (analysis.titleMatch) {
      reasons.push('Contains PICRA-related title keywords');
    } else {
      reasons.push('Missing PICRA title keywords');
    }

    if (analysis.formFieldsFound > 0) {
      reasons.push(`Found ${analysis.formFieldsFound}/${analysis.totalFormFields} standard form fields`);
    } else {
      reasons.push('No standard PICRA form fields detected');
    }

    if (analysis.legalTermsFound > 0) {
      reasons.push(`Contains ${analysis.legalTermsFound} legal/real estate terms`);
    }

    if (analysis.repairContentFound) {
      reasons.push('Contains repair-related content');
    }

    if (analysis.inspectionTermsFound > 0) {
      reasons.push(`Contains ${analysis.inspectionTermsFound} inspection-related terms`);
    }

    return reasons.join('. ');
  }

  /**
   * Get detailed validation report
   * @param {string} filePath - Path to the document
   * @param {string} mimeType - MIME type of the document
   * @returns {Object} Detailed validation report
   */
  async getDetailedValidationReport(filePath, mimeType = 'application/pdf') {
    const validation = await this.validatePICRADocument(filePath, mimeType);
    
    return {
      ...validation,
      recommendations: this.generateRecommendations(validation),
      nextSteps: this.generateNextSteps(validation),
      processingRecommendation: this.getProcessingRecommendation(validation.confidence)
    };
  }

  /**
   * Generate recommendations based on validation results
   * @param {Object} validation - Validation results
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(validation) {
    const recommendations = [];

    if (validation.confidence >= 0.8) {
      recommendations.push('Document is highly likely to be a PICRA - proceed with full processing');
    } else if (validation.confidence >= 0.6) {
      recommendations.push('Document appears to be a PICRA - proceed with processing but review results carefully');
    } else if (validation.confidence >= 0.4) {
      recommendations.push('Document may be a PICRA but with low confidence - manual review recommended');
    } else {
      recommendations.push('Document is unlikely to be a PICRA - consider uploading a different document');
    }

    if (!validation.details.titleMatch) {
      recommendations.push('Consider checking if this is the correct document type');
    }

    if (validation.details.formFieldsFound < 3) {
      recommendations.push('Document may be missing standard PICRA form fields');
    }

    return recommendations;
  }

  /**
   * Generate next steps based on validation results
   * @param {Object} validation - Validation results
   * @returns {Array} Array of next steps
   */
  generateNextSteps(validation) {
    const nextSteps = [];

    if (validation.isValid) {
      nextSteps.push('Proceed with Google Document AI processing');
      nextSteps.push('Extract repair items and property information');
      nextSteps.push('Generate cost estimates and recommendations');
    } else {
      nextSteps.push('Review document content manually');
      nextSteps.push('Verify document type and format');
      nextSteps.push('Consider uploading a different document if needed');
    }

    return nextSteps;
  }

  /**
   * Get processing recommendation based on confidence score
   * @param {number} confidence - Confidence score
   * @returns {string} Processing recommendation
   */
  getProcessingRecommendation(confidence) {
    if (confidence >= 0.8) {
      return 'PROCEED_WITH_FULL_PROCESSING';
    } else if (confidence >= 0.6) {
      return 'PROCEED_WITH_CAUTION';
    } else if (confidence >= 0.4) {
      return 'MANUAL_REVIEW_REQUIRED';
    } else {
      return 'REJECT_DOCUMENT';
    }
  }
}

module.exports = PICRAValidationService;
