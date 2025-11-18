# BoldSign API Integration Guide

## Overview

This guide explains how to set up and use the BoldSign API integration for digital signatures on contracts in the ezPICRA system.

## Features

- **Client Initials**: Automatically placed on the bottom right of each page (pages 1-5)
- **Client Signature**: Placed on the last page (page 5) with date field
- **Contractor Signature**: Placed on the last page (page 5) with date field
- **Hardcoded Positions**: All signature fields have fixed positions for consistency
- **Status Tracking**: Real-time tracking of signature status
- **Document Management**: Download signed documents and manage signature requests

## Setup Instructions

### 1. Get BoldSign API Key

1. Sign up for a BoldSign account at [https://www.boldsign.com/](https://www.boldsign.com/)
2. Navigate to your account settings
3. Generate an API key
4. Copy the API key for use in your environment variables

### 2. Environment Variables

Add the following to your `.env` file:

```env
# BoldSign Configuration
BOLDSIGN_API_KEY=your_boldsign_api_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies

The required dependencies are already included in `package.json`:
- `axios` - For API requests

## API Endpoints

### Send Contract for Signature
```http
POST /api/contracts/:id/send-for-signature
```

**Request Body:**
```json
{
  "contractorName": "Contractor Name",
  "contractorEmail": "contractor@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contract sent for signature successfully",
  "contract": {
    "boldSignDocumentId": "document_id",
    "boldSignMessageId": "message_id",
    "signatureStatus": "Sent",
    "signatureSentAt": "2024-01-01T12:00:00Z",
    "signerUrls": ["url1", "url2"]
  },
  "signatureInfo": {
    "documentId": "document_id",
    "messageId": "message_id",
    "signerUrls": ["url1", "url2"]
  }
}
```

### Get Signature Status
```http
GET /api/contracts/:id/signature-status
```

**Response:**
```json
{
  "success": true,
  "signatureStatus": {
    "documentId": "document_id",
    "status": "Completed",
    "createdDate": "2024-01-01T12:00:00Z",
    "expiryDate": "2024-02-01T12:00:00Z",
    "signers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "status": "Signed"
      }
    ],
    "isCompleted": true,
    "isDeclined": false,
    "isExpired": false
  },
  "contractStatus": "Completed"
}
```

### Download Signed Document
```http
GET /api/contracts/:id/signed-document
```

Returns the signed PDF document as a blob.

### Resend Signature Request
```http
POST /api/contracts/:id/resend-signature
```

**Request Body:**
```json
{
  "signerEmail": "signer@example.com"
}
```

### Cancel Signature Request
```http
POST /api/contracts/:id/cancel-signature
```

## Signature Field Positions

The following signature fields are automatically placed on the contract:

### Client Initials (Pages 1-5)
- **Position**: Bottom right of each page
- **Coordinates**: X: 500, Y: 750
- **Size**: 50x30 pixels
- **Required**: Yes

### Client Signature (Page 5)
- **Position**: Left side of last page
- **Coordinates**: X: 100, Y: 600
- **Size**: 200x60 pixels
- **Required**: Yes

### Contractor Signature (Page 5)
- **Position**: Right side of last page
- **Coordinates**: X: 350, Y: 600
- **Size**: 200x60 pixels
- **Required**: Yes

### Date Fields (Page 5)
- **Client Date**: X: 100, Y: 680, Size: 100x30
- **Contractor Date**: X: 350, Y: 680, Size: 100x30

## Client-Side Usage

### Send for Signature
```javascript
import { contractApi } from '../services/contractsApi';

const sendForSignature = async (contractId) => {
  try {
    const contractorInfo = {
      name: 'Contractor Name',
      email: 'contractor@example.com'
    };
    
    const response = await contractApi.sendForSignature(contractId, contractorInfo);
    console.log('Signature request sent:', response);
  } catch (error) {
    console.error('Error sending for signature:', error);
  }
};
```

### Check Status
```javascript
const checkStatus = async (contractId) => {
  try {
    const response = await contractApi.getSignatureStatus(contractId);
    console.log('Signature status:', response.signatureStatus);
  } catch (error) {
    console.error('Error checking status:', error);
  }
};
```

### Download Signed Document
```javascript
const downloadSigned = async (contractId) => {
  try {
    const blob = await contractApi.downloadSignedDocument(contractId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signed_contract_${contractNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading signed document:', error);
  }
};
```

## Signature Status Values

- **Not Sent**: Contract hasn't been sent for signature
- **Sent**: Signature request has been sent
- **In Progress**: At least one signer has started signing
- **Completed**: All signers have completed signing
- **Declined**: One or more signers declined to sign
- **Expired**: Signature request has expired
- **Cancelled**: Signature request was cancelled

## Error Handling

The BoldSign service includes comprehensive error handling:

- **API Key Missing**: Returns error if BoldSign API key is not configured
- **Network Errors**: Handles API request failures gracefully
- **Document Generation**: Handles PDF generation errors
- **File Operations**: Manages temporary file cleanup

## Security Considerations

1. **API Key Security**: Store BoldSign API key in environment variables
2. **Authentication**: All endpoints require user authentication
3. **Document Access**: Only contract owners can access signature functionality
4. **Temporary Files**: Generated PDFs are cleaned up after processing

## Troubleshooting

### Common Issues

1. **"BoldSign API not configured"**
   - Ensure `BOLDSIGN_API_KEY` is set in your environment variables
   - Restart the server after adding the environment variable

2. **"Failed to send contract for signature"**
   - Check that the contract and customer data are valid
   - Verify the contractor email is valid
   - Ensure the BoldSign API key has proper permissions

3. **"Failed to get signature status"**
   - Verify the document ID exists in BoldSign
   - Check that the API key has read permissions

4. **"Failed to download signed document"**
   - Ensure the document is fully signed
   - Check that the document hasn't expired
   - Verify file permissions for the uploads directory

### Debug Mode

Enable debug logging by setting the environment variable:
```env
DEBUG_BOLDSIGN=true
```

This will log detailed information about API requests and responses.

## Support

For BoldSign API support:
- [BoldSign API Documentation](https://www.boldsign.com/help/api/)
- [BoldSign Support](https://www.boldsign.com/support/)

For ezPICRA integration support:
- Check the server logs for detailed error messages
- Verify all environment variables are correctly set
- Ensure the contract data is properly formatted
