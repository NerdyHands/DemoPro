const GoogleDocumentAIService = require('./googleDocumentAI');
const OpenAIService = require('./openaiService');
const StorageManager = require('./storageManager');
const PICRAValidationService = require('./picraValidationService');
const PICRAProcessing = require('../models/PICRAProcessing');
const Report = require('../models/Report');
const Project = require('../models/Project');

class PICRAProcessingService {
  constructor() {
    this.documentAI = new GoogleDocumentAIService();
    this.openAI = new OpenAIService();
    this.storageManager = new StorageManager();
    this.picraValidator = new PICRAValidationService();
  }

  async processPICRADocument(file, userId, projectId, reportId, additionalMetadata = {}) {
    console.log('🚀 Starting PICRA document processing workflow...');
    
    // Create processing record with enhanced metadata
    const processingRecord = new PICRAProcessing({
      reportId,
      projectId,
      uploadedBy: userId,
      status: 'pending',
      metadata: {
        processingStartTime: new Date(),
        fileType: additionalMetadata.fileType || 'unknown',
        title: additionalMetadata.title,
        description: additionalMetadata.description,
        uploadedBy: additionalMetadata.uploadedBy || userId,
        ...additionalMetadata
      },
      fileInfo: {
        originalName: file.originalname,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadDate: new Date(),
        fileType: additionalMetadata.fileType || 'unknown',
        title: additionalMetadata.title,
        description: additionalMetadata.description
      }
    });

    await processingRecord.save();
    console.log('✅ Processing record created:', processingRecord._id);

    try {
      // Step 0: Validate PICRA document
      const validationResult = await this.step0ValidatePICRA(file, processingRecord);
      
      // If validation fails, stop processing
      if (!validationResult.isValid) {
        processingRecord.status = 'validation_failed';
        processingRecord.metadata.processingEndTime = new Date();
        processingRecord.metadata.validationResult = validationResult;
        processingRecord.metadata.processingNote = `Validation failed: ${validationResult.reason}`;
        await processingRecord.save();
        
        return {
          success: false,
          processingId: processingRecord._id,
          validationResult,
          error: 'Document validation failed - not a valid PICRA document'
        };
      }
      
      // Step 1: Upload to storage (GCS or local)
      await this.step1UploadToGCS(file, processingRecord);
      
      // Step 2: Process with Google Document AI (OCR)
      const documentAIResults = await this.step2ProcessWithDocumentAI(file.path, processingRecord);
      
      // Step 3: Process with OpenAI
      const openAIResults = await this.step3ProcessWithOpenAI(documentAIResults, processingRecord);
      
      // Step 4: Generate Quote
      const quoteResults = await this.step4GenerateQuote(openAIResults, processingRecord);
      
      // Update final status
      processingRecord.status = 'completed';
      processingRecord.metadata.processingEndTime = new Date();
      processingRecord.metadata.processingNote = 'All processing steps completed successfully';
      processingRecord.metadata.currentStep = 4;
      processingRecord.metadata.stepsCompleted = ['documentUpload', 'documentAI', 'openAI', 'quoteGeneration'];
      await processingRecord.save();
      
      console.log('🎉 All processing steps completed successfully!');
      
      return {
        success: true,
        processingId: processingRecord._id,
        documentAIResults,
        openAIResults,
        quoteResults,
        processingRecord
      };
      
    } catch (error) {
      console.error('❌ Error in PICRA processing workflow:', error);
      
      // Update processing record with error
      processingRecord.status = 'failed';
      processingRecord.metadata.processingEndTime = new Date();
      processingRecord.metadata.lastError = error.message;
      await processingRecord.save();
      
      throw error;
    }
  }

  async step0ValidatePICRA(file, processingRecord) {
    console.log('🔍 Step 0: Validating PICRA document...');
    console.log('📁 File path:', file.path);
    console.log('📄 File mimetype:', file.mimetype);
    console.log('📄 File originalname:', file.originalname);
    console.log('📊 File size:', file.size);
    
    try {
      const startTime = Date.now();
      const validationResult = await this.picraValidator.validatePICRADocument(file.path, file.mimetype);
      const processingTime = Date.now() - startTime;
      
      console.log('🔍 Validation result received:');
      console.log('  - isValid:', validationResult.isValid);
      console.log('  - confidence:', validationResult.confidence);
      console.log('  - reason:', validationResult.reason);
      console.log('  - extractedTextLength:', validationResult.extractedTextLength);
      console.log('  - sampleText:', validationResult.sampleText?.substring(0, 100) + '...');
      
      // Update processing record with validation results
      processingRecord.validationResults = {
        isValid: validationResult.isValid,
        confidence: validationResult.confidence,
        reason: validationResult.reason,
        details: validationResult.details,
        processingTime,
        extractedTextLength: validationResult.extractedTextLength,
        sampleText: validationResult.sampleText
      };
      
      processingRecord.updateProcessingStep('validation', true);
      await processingRecord.save();
      
      console.log('✅ PICRA validation completed');
      console.log('📊 Confidence Score:', validationResult.confidence);
      console.log('✅ Is Valid PICRA:', validationResult.isValid);
      console.log('📝 Reason:', validationResult.reason);
      
      return validationResult;
      
    } catch (error) {
      console.error('❌ PICRA validation failed:', error);
      processingRecord.updateProcessingStep('validation', false, error.message);
      await processingRecord.save();
      throw error;
    }
  }

  async step1UploadToGCS(file, processingRecord) {
    console.log('📤 Step 1: Uploading file to storage...');
    
    try {
      const uploadResult = await this.storageManager.uploadFile(file, 'picra');
      
      // Update processing record
      processingRecord.fileInfo.gcsFileName = uploadResult.gcsFileName || uploadResult.fileName;
      processingRecord.fileInfo.gcsUrl = uploadResult.fileUrl;
      processingRecord.updateProcessingStep('documentUpload', true);
      await processingRecord.save();
      
      // Clean up original file after successful upload
      if (file.path && require('fs').existsSync(file.path)) {
        require('fs').unlinkSync(file.path);
        console.log('✅ Original file cleaned up');
      }
      
      console.log('✅ File uploaded to storage:', uploadResult.fileName);
      return uploadResult;
      
    } catch (error) {
      console.error('❌ Storage upload failed:', error);
      processingRecord.updateProcessingStep('documentUpload', false, error.message);
      await processingRecord.save();
      throw error;
    }
  }

  async step2ProcessWithDocumentAI(filePath, processingRecord) {
    console.log('🔍 Step 2: Processing with Google Document AI...');
    
    try {
      const startTime = Date.now();
      const results = await this.documentAI.processPICRADocument(filePath);
      const processingTime = Date.now() - startTime;
      
      // Update processing record with Document AI results
      processingRecord.documentAIResults = {
        extractedText: results.text,
        customSchemeOfRepairs: results.customSchemeOfRepairs,
        propertyAddress: results.propertyAddress,
        structuredData: results.structuredData,
        entities: results.entities,
        processingTime,
        confidence: results.confidence || 0.8
      };
      
      processingRecord.updateProcessingStep('documentAI', true);
      await processingRecord.save();
      
      console.log('✅ Document AI processing completed');
      console.log('📄 Extracted text length:', results.text?.length || 0);
      console.log('🏠 Property Address:', results.propertyAddress || 'Not found');
      console.log('🔧 Custom Scheme of Repairs found:', !!results.customSchemeOfRepairs);
      
      return results;
      
    } catch (error) {
      console.error('❌ Document AI processing failed:', error);
      processingRecord.updateProcessingStep('documentAI', false, error.message);
      await processingRecord.save();
      throw error;
    }
  }

  async step3ProcessWithOpenAI(documentAIResults, processingRecord) {
    console.log('🤖 Step 3: Processing with OpenAI...');
    
    try {
      const startTime = Date.now();
      
      // Extract the relevant text for OpenAI processing
      const extractedText = documentAIResults.customSchemeOfRepairs || documentAIResults.text;
      const propertyAddress = documentAIResults.propertyAddress;
      
      if (!extractedText) {
        throw new Error('No text content available for OpenAI processing');
      }
      
      const results = await this.openAI.processPICRASection(extractedText, propertyAddress);
      const processingTime = Date.now() - startTime;
      
      if (!results.success) {
        throw new Error(`OpenAI processing failed: ${results.error}`);
      }
      
      // Update processing record with OpenAI results
      processingRecord.openAIResults = {
        summary: results.data.summary,
        totalEstimatedCost: results.data.totalEstimatedCost,
        repairItems: results.data.repairItems,
        recommendations: results.data.recommendations,
        timeline: results.data.timeline,
        riskAssessment: results.data.riskAssessment,
        processingTime,
        modelUsed: 'gpt-4',
        rawResponse: results.rawResponse
      };
      
      processingRecord.updateProcessingStep('openAI', true);
      await processingRecord.save();
      
      console.log('✅ OpenAI processing completed');
      console.log('💰 Total estimated cost:', results.data.totalEstimatedCost);
      console.log('🔧 Repair items found:', results.data.repairItems?.length || 0);
      
      return results.data;
      
    } catch (error) {
      console.error('❌ OpenAI processing failed:', error);
      processingRecord.updateProcessingStep('openAI', false, error.message);
      await processingRecord.save();
      throw error;
    }
  }

  async step4GenerateQuote(openAIResults, processingRecord) {
    console.log('💰 Step 4: Generating quote...');
    
    try {
      const startTime = Date.now();
      
      if (!openAIResults.repairItems || openAIResults.repairItems.length === 0) {
        throw new Error('No repair items available for quote generation');
      }
      
      const results = await this.openAI.generateQuoteLineItems(openAIResults.repairItems);
      const processingTime = Date.now() - startTime;
      
      if (!results.success) {
        throw new Error(`Quote generation failed: ${results.error}`);
      }
      
      // Update processing record with quote results
      processingRecord.quoteResults = {
        quoteItems: results.data.quoteItems,
        subtotal: results.data.subtotal,
        tax: results.data.tax,
        total: results.data.total,
        paymentTerms: results.data.paymentTerms,
        validUntil: results.data.validUntil,
        termsAndConditions: results.data.termsAndConditions,
        processingTime,
        modelUsed: 'gpt-4',
        rawResponse: results.rawResponse
      };
      
      processingRecord.updateProcessingStep('quoteGeneration', true);
      await processingRecord.save();
      
      console.log('✅ Quote generation completed');
      console.log('💰 Quote total:', results.data.total);
      console.log('📋 Quote items:', results.data.quoteItems?.length || 0);
      
      return results.data;
      
    } catch (error) {
      console.error('❌ Quote generation failed:', error);
      processingRecord.updateProcessingStep('quoteGeneration', false, error.message);
      await processingRecord.save();
      throw error;
    }
  }

  // Get processing status
  async getProcessingStatus(processingId) {
    const processing = await PICRAProcessing.findById(processingId)
      .populate('reportId', 'title fileName')
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email');
    
    if (!processing) {
      throw new Error('Processing record not found');
    }
    
    return {
      processing,
      progress: processing.getProcessingProgress(),
      totalEstimatedCost: processing.getTotalEstimatedCost(),
      quoteTotal: processing.getQuoteTotal()
    };
  }

  // Get processing results
  async getProcessingResults(processingId) {
    const processing = await PICRAProcessing.findById(processingId)
      .populate('reportId', 'title fileName')
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email');
    
    if (!processing) {
      throw new Error('Processing record not found');
    }
    
    if (processing.status !== 'completed') {
      throw new Error('Processing not completed yet');
    }
    
    return {
      processing,
      documentAIResults: processing.documentAIResults,
      openAIResults: processing.openAIResults,
      quoteResults: processing.quoteResults,
      progress: processing.getProcessingProgress(),
      totalEstimatedCost: processing.getTotalEstimatedCost(),
      quoteTotal: processing.getQuoteTotal()
    };
  }

  // Get all processing records for a user
  async getUserProcessingRecords(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const records = await PICRAProcessing.find({ uploadedBy: userId, isActive: true })
      .populate('reportId', 'title fileName')
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PICRAProcessing.countDocuments({ uploadedBy: userId, isActive: true });
    
    return {
      records,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get all processing records for a project
  async getProjectProcessingRecords(projectId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const records = await PICRAProcessing.find({ projectId, isActive: true })
      .populate('reportId', 'title fileName')
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PICRAProcessing.countDocuments({ projectId, isActive: true });
    
    return {
      records,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Retry failed processing
  async retryProcessing(processingId) {
    const processing = await PICRAProcessing.findById(processingId);
    
    if (!processing) {
      throw new Error('Processing record not found');
    }
    
    if (processing.status !== 'failed') {
      throw new Error('Can only retry failed processing');
    }
    
    // Reset processing status
    processing.status = 'pending';
    processing.metadata.retryCount += 1;
    processing.metadata.lastError = null;
    processing.metadata.processingStartTime = new Date();
    
    // Reset all processing steps
    Object.keys(processing.processingSteps).forEach(step => {
      processing.processingSteps[step].completed = false;
      processing.processingSteps[step].completedAt = null;
      processing.processingSteps[step].error = null;
    });
    
    await processing.save();
    
    // Start processing again (this should be done asynchronously)
    console.log('🔄 Retrying processing for:', processingId);
    
    return processing;
  }

  // Delete processing record
  async deleteProcessingRecord(processingId, userId) {
    const processing = await PICRAProcessing.findById(processingId);
    
    if (!processing) {
      throw new Error('Processing record not found');
    }
    
    if (processing.uploadedBy.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }
    
    processing.isActive = false;
    await processing.save();
    
    return { success: true, message: 'Processing record deleted' };
  }
}

module.exports = PICRAProcessingService; 