# PICRA Processing Workflow Guide

## Overview

The PICRA (Property Inspection and Condition Report Analysis) processing workflow is a comprehensive AI-powered system that automatically processes uploaded PICRA documents to extract structured data, analyze repair requirements, and generate detailed quotes.

## Workflow Steps

### Step 1: Document Upload & Storage
- **Upload**: User uploads PICRA document (PDF/DOC/DOCX)
- **Storage**: File is securely stored in Google Cloud Storage
- **Metadata**: Document information is saved to MongoDB
- **Access Control**: Only the uploading user can access their documents

### Step 2: Google Document AI Processing
- **Text Extraction**: Extracts all text content from the document
- **Section Detection**: Identifies and extracts the "Custom Scheme of Repairs" section
- **Property Address**: Extracts property address information
- **Structured Data**: Identifies form fields and structured data
- **Confidence Scoring**: Provides confidence levels for extracted data

### Step 3: OpenAI Analysis
- **Content Analysis**: Analyzes extracted repair requirements
- **Cost Estimation**: Provides detailed cost estimates for each repair item
- **Priority Assessment**: Categorizes repairs by priority (high/medium/low)
- **Risk Assessment**: Identifies safety concerns and immediate risks
- **Recommendations**: Generates practical recommendations

### Step 4: Quote Generation
- **Line Items**: Converts repair items into detailed quote line items
- **Pricing**: Provides realistic market-based pricing
- **Specifications**: Includes detailed specifications and materials
- **Terms**: Generates payment terms and conditions
- **Timeline**: Estimates project completion timeline

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` files:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Google Document AI Configuration
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-document-ai-processor-id
```

### 2. Google Cloud Setup

#### Document AI Processor Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Document AI** > **Processors**
3. Create a new processor:
   - **Processor Type**: Document OCR
   - **Location**: Choose your preferred region
   - **Name**: `picra-document-processor`
4. Copy the Processor ID and add it to your environment variables

#### Required Permissions
Ensure your service account has the following roles:
- **Document AI API User**
- **Storage Object Admin**
- **Storage Object Viewer**

### 3. OpenAI API Setup
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add the key to your environment variables

### 4. Install Dependencies

```bash
npm install @google-cloud/documentai openai
```

## API Endpoints

### Upload and Process PICRA Document
```http
POST /api/picra-processing/upload
Content-Type: multipart/form-data

{
  "file": "picra-document.pdf",
  "projectId": "project-id",
  "title": "PICRA Report - Property Inspection",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "message": "PICRA document processing started successfully",
  "processingId": "processing-id",
  "status": "processing",
  "estimatedTime": "2-5 minutes"
}
```

### Get Processing Status
```http
GET /api/picra-processing/status/:processingId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "processing": {
    "_id": "processing-id",
    "status": "processing",
    "uploadedBy": "user-id",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "progress": {
    "total": 4,
    "completed": 2,
    "percentage": 50,
    "currentStep": "openAI"
  },
  "totalEstimatedCost": 0,
  "quoteTotal": 0
}
```

### Get Processing Results
```http
GET /api/picra-processing/results/:processingId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "processing": { /* processing record */ },
  "documentAIResults": {
    "extractedText": "Full document text",
    "customSchemeOfRepairs": "Repairs section content",
    "propertyAddress": "123 Main St, City, State",
    "processingTime": 2500,
    "confidence": 0.85
  },
  "openAIResults": {
    "summary": "Property condition summary",
    "totalEstimatedCost": 15000,
    "repairItems": [
      {
        "category": "Roofing",
        "description": "Replace damaged shingles",
        "priority": "high",
        "estimatedCost": 5000,
        "materials": "Asphalt shingles, underlayment",
        "laborHours": 16,
        "notes": "Urgent repair needed"
      }
    ],
    "recommendations": ["Schedule roof inspection"],
    "timeline": "4-6 weeks",
    "riskAssessment": "Moderate risk due to roof damage"
  },
  "quoteResults": {
    "quoteItems": [
      {
        "itemNumber": "Q-001",
        "description": "Roof shingle replacement",
        "quantity": "1 EA",
        "unitPrice": 5000,
        "totalPrice": 5000,
        "specifications": "High-quality asphalt shingles",
        "materials": "Shingles, underlayment, nails",
        "labor": "16 hours",
        "warranty": "20-year warranty"
      }
    ],
    "subtotal": 15000,
    "tax": 1275,
    "total": 16275,
    "paymentTerms": "Net 30",
    "validUntil": "30 days",
    "termsAndConditions": "Standard terms apply"
  },
  "totalEstimatedCost": 15000,
  "quoteTotal": 16275
}
```

### Get User Processing Records
```http
GET /api/picra-processing/user?page=1&limit=10
Authorization: Bearer <token>
```

### Get Project Processing Records
```http
GET /api/picra-processing/project/:projectId?page=1&limit=10
Authorization: Bearer <token>
```

### Retry Failed Processing
```http
POST /api/picra-processing/retry/:processingId
Authorization: Bearer <token>
```

### Delete Processing Record
```http
DELETE /api/picra-processing/:processingId
Authorization: Bearer <token>
```

### Get Processing Statistics
```http
GET /api/picra-processing/stats
Authorization: Bearer <token>
```

## Database Schema

### PICRAProcessing Model
```javascript
{
  reportId: ObjectId,           // Reference to Report
  projectId: ObjectId,          // Reference to Project
  uploadedBy: ObjectId,         // Reference to User
  status: String,               // 'pending', 'processing', 'completed', 'failed'
  processingSteps: {
    documentUpload: { completed: Boolean, completedAt: Date, error: String },
    documentAI: { completed: Boolean, completedAt: Date, error: String },
    openAI: { completed: Boolean, completedAt: Date, error: String },
    quoteGeneration: { completed: Boolean, completedAt: Date, error: String }
  },
  documentAIResults: {
    extractedText: String,
    customSchemeOfRepairs: String,
    propertyAddress: String,
    structuredData: Mixed,
    entities: Array,
    processingTime: Number,
    confidence: Number
  },
  openAIResults: {
    summary: String,
    totalEstimatedCost: Number,
    repairItems: Array,
    recommendations: Array,
    timeline: String,
    riskAssessment: String,
    processingTime: Number,
    modelUsed: String,
    rawResponse: String
  },
  quoteResults: {
    quoteItems: Array,
    subtotal: Number,
    tax: Number,
    total: Number,
    paymentTerms: String,
    validUntil: String,
    termsAndConditions: String,
    processingTime: Number,
    modelUsed: String,
    rawResponse: String
  },
  fileInfo: {
    originalName: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadDate: Date,
    gcsFileName: String,
    gcsUrl: String
  },
  metadata: {
    processingStartTime: Date,
    processingEndTime: Date,
    totalProcessingTime: Number,
    retryCount: Number,
    lastError: String,
    processingNotes: String
  }
}
```

## Client Integration

### React Component Example
```javascript
import React, { useState } from 'react';
import apiService from '../services/api';

const PICRAUpload = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);

  const handleUpload = async () => {
    setIsProcessing(true);
    setProcessingStatus('Starting upload...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', 'project-id');
      formData.append('title', `PICRA Report - ${file.name}`);

      const result = await apiService.uploadPICRAForProcessing(formData);
      
      // Poll for status updates
      pollProcessingStatus(result.processingId);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsProcessing(false);
    }
  };

  const pollProcessingStatus = async (processingId) => {
    const poll = async () => {
      try {
        const status = await apiService.getPICRAProcessingStatus(processingId);
        setProcessingStatus(`Processing: ${status.progress.percentage}% complete`);

        if (status.processing.status === 'completed') {
          const results = await apiService.getPICRAProcessingResults(processingId);
          console.log('Results:', results);
          setIsProcessing(false);
        } else if (status.processing.status === 'failed') {
          setIsProcessing(false);
        } else {
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
        setTimeout(poll, 5000);
      }
    };
    poll();
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file || isProcessing}>
        {isProcessing ? 'Processing...' : 'Upload PICRA'}
      </button>
      {isProcessing && <p>{processingStatus}</p>}
    </div>
  );
};
```

## Error Handling

### Common Errors and Solutions

1. **Document AI Not Available**
   - Ensure Google Cloud credentials are properly configured
   - Check Document AI API is enabled
   - Verify processor ID is correct

2. **OpenAI API Errors**
   - Check API key is valid and has sufficient credits
   - Verify API key has access to GPT-4 model
   - Check rate limits

3. **File Upload Errors**
   - Ensure file is PDF, DOC, or DOCX format
   - Check file size limits (10MB default)
   - Verify Google Cloud Storage permissions

4. **Processing Timeout**
   - Default timeout is 5 minutes
   - Large documents may take longer
   - Check server logs for detailed error information

## Monitoring and Logging

### Server Logs
The system provides detailed logging for each processing step:
```
🚀 Starting PICRA document processing workflow...
✅ Processing record created: processing-id
📤 Step 1: Uploading file to Google Cloud Storage...
✅ File uploaded to GCS: filename.pdf
🔍 Step 2: Processing with Google Document AI...
✅ Document AI processing completed
🤖 Step 3: Processing with OpenAI...
✅ OpenAI processing completed
💰 Step 4: Generating quote...
✅ Quote generation completed
🎉 PICRA processing workflow completed successfully!
```

### Status Tracking
Each processing step is tracked with:
- Completion status
- Processing time
- Error messages (if any)
- Timestamps

## Security Considerations

1. **File Access Control**: Only the uploading user can access their documents
2. **API Key Security**: Store API keys in environment variables, never in code
3. **Data Encryption**: All data is encrypted in transit and at rest
4. **Input Validation**: All file uploads are validated for type and size
5. **Rate Limiting**: API endpoints are rate-limited to prevent abuse

## Performance Optimization

1. **Async Processing**: Document processing runs asynchronously
2. **Status Polling**: Clients poll for status updates instead of blocking
3. **Caching**: Processing results are cached in MongoDB
4. **Error Recovery**: Failed processing can be retried
5. **Resource Management**: Processing timeouts prevent resource exhaustion

## Troubleshooting

### Development Mode
- Check server console for detailed error messages
- Verify all environment variables are set
- Test individual services (Document AI, OpenAI) separately

### Production Mode
- Monitor server logs for errors
- Check Google Cloud Console for API usage
- Verify OpenAI API quota and billing
- Monitor MongoDB connection and performance

## Support

For issues or questions:
1. Check server logs for error details
2. Verify environment configuration
3. Test with sample documents
4. Review API documentation for each service 