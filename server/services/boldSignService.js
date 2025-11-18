const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BoldSignService {
  constructor() {
    this.apiKey = process.env.BOLDSIGN_API_KEY;
    this.baseURL = 'https://api.boldsign.com/v1';
    this.isAvailable = !!this.apiKey;
  }

  // Check if BoldSign is available
  isServiceAvailable() {
    return this.isAvailable;
  }

  // Create a signature request
  async createSignatureRequest(contract, customer, contractorInfo) {
    if (!this.isServiceAvailable()) {
      throw new Error('BoldSign API key not configured');
    }

    try {
      // Generate contract PDF first
      const ContractPdfService = require('./contractPdfService');
      const pdfService = new ContractPdfService();
      const pdfResult = await pdfService.generateContractPdf(contract, customer);

      // Read the PDF file
      const pdfBuffer = fs.readFileSync(pdfResult.filePath);

      // Prepare signature request data
      const signatureRequest = {
        Title: `Contract: ${contract.title}`,
        Message: `Please review and sign the contract for ${contract.title}`,
        Subject: `Contract Signature Required - ${contract.contractNumber}`,
        Content: `You are receiving this contract for electronic signature. Please review the document and sign where indicated.`,
        EnableSigningOrder: false,
        EnableReassign: false,
        HideDocumentView: false,
        SendViewOption: 0,
        ShowToolbar: true,
        ShowNavigationBar: true,
        ShowPoweredBy: false,
        RedirectUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/contracts/${contract._id}`,
        RedirectUrlDecline: `${process.env.CLIENT_URL || 'http://localhost:3000'}/contracts/${contract._id}?status=declined`,
        CustomField: `Contract ID: ${contract.contractNumber}`,
        ExpiryDays: 30,
        FormFields: this.generateFormFields(contract),
        Signers: [
          {
            Name: `${customer.firstName} ${customer.lastName}`,
            EmailAddress: customer.email,
            SignerType: 0, // Signer
            SignerOrder: 1
          },
          {
            Name: contractorInfo.name || 'Contractor',
            EmailAddress: contractorInfo.email || 'contractor@example.com',
            SignerType: 0, // Signer
            SignerOrder: 2
          }
        ]
      };

      // Create the signature request
      const response = await axios.post(
        `${this.baseURL}/document/send`,
        signatureRequest,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      // Clean up the temporary PDF file
      fs.unlinkSync(pdfResult.filePath);

      return {
        success: true,
        documentId: response.data.DocumentId,
        messageId: response.data.MessageId,
        signerUrls: response.data.SignerUrls || []
      };

    } catch (error) {
      console.error('❌ Error creating BoldSign signature request:', error);
      throw error;
    }
  }

  // Generate form fields for signature placement
  generateFormFields(contract) {
    const fields = [];

    // Client initials on each page (bottom right)
    // We'll add initials fields for pages 1-5 (typical contract length)
    for (let page = 1; page <= 5; page++) {
      fields.push({
        FieldType: 'Initials',
        PageNumber: page,
        X: 500, // Bottom right X position
        Y: 750, // Bottom right Y position
        Width: 50,
        Height: 30,
        IsRequired: true,
        Signer: 1, // Client
        Name: `Client_Initials_Page_${page}`
      });
    }

    // Client signature on last page
    fields.push({
      FieldType: 'Signature',
      PageNumber: 5, // Last page
      X: 100,
      Y: 600,
      Width: 200,
      Height: 60,
      IsRequired: true,
      Signer: 1, // Client
      Name: 'Client_Signature'
    });

    // Contractor signature on last page
    fields.push({
      FieldType: 'Signature',
      PageNumber: 5, // Last page
      X: 350,
      Y: 600,
      Width: 200,
      Height: 60,
      IsRequired: true,
      Signer: 2, // Contractor
      Name: 'Contractor_Signature'
    });

    // Date fields for both signers
    fields.push({
      FieldType: 'Date',
      PageNumber: 5,
      X: 100,
      Y: 680,
      Width: 100,
      Height: 30,
      IsRequired: true,
      Signer: 1,
      Name: 'Client_Date'
    });

    fields.push({
      FieldType: 'Date',
      PageNumber: 5,
      X: 350,
      Y: 680,
      Width: 100,
      Height: 30,
      IsRequired: true,
      Signer: 2,
      Name: 'Contractor_Date'
    });

    return fields;
  }

  // Get signature request status
  async getSignatureStatus(documentId) {
    if (!this.isServiceAvailable()) {
      throw new Error('BoldSign API key not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/document/details?documentId=${documentId}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          }
        }
      );

      return {
        documentId: response.data.DocumentId,
        status: response.data.Status,
        createdDate: response.data.CreatedDate,
        expiryDate: response.data.ExpiryDate,
        signers: response.data.Signers || [],
        isCompleted: response.data.Status === 'Completed',
        isDeclined: response.data.Status === 'Declined',
        isExpired: response.data.Status === 'Expired'
      };

    } catch (error) {
      console.error('❌ Error getting BoldSign status:', error);
      throw error;
    }
  }

  // Get signed document
  async getSignedDocument(documentId) {
    if (!this.isServiceAvailable()) {
      throw new Error('BoldSign API key not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/document/download?documentId=${documentId}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      // Save the signed document
      const fileName = `signed_contract_${documentId}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      fs.writeFileSync(filePath, response.data);

      return {
        fileName,
        filePath,
        fileSize: response.data.length
      };

    } catch (error) {
      console.error('❌ Error downloading signed document:', error);
      throw error;
    }
  }

  // Cancel signature request
  async cancelSignatureRequest(documentId) {
    if (!this.isServiceAvailable()) {
      throw new Error('BoldSign API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/document/cancel`,
        { DocumentId: documentId },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Signature request cancelled successfully'
      };

    } catch (error) {
      console.error('❌ Error cancelling BoldSign request:', error);
      throw error;
    }
  }

  // Resend signature request
  async resendSignatureRequest(documentId, signerEmail) {
    if (!this.isServiceAvailable()) {
      throw new Error('BoldSign API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/document/resend`,
        {
          DocumentId: documentId,
          SignerEmail: signerEmail
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Signature request resent successfully'
      };

    } catch (error) {
      console.error('❌ Error resending BoldSign request:', error);
      throw error;
    }
  }
}

module.exports = BoldSignService;
