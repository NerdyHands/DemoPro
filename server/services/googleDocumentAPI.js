const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleDocumentAPIService {
  constructor() {
    this.docs = google.docs({ version: 'v1' });
    this.drive = google.drive({ version: 'v3' });
    
    // Only initialize in development mode
    if (process.env.NODE_ENV === 'development') {
      this.initializeAuth();
    }
  }

  // Initialize Google API authentication
  initializeAuth() {
    try {
      const keyFilePath = process.env.GOOGLE_CLOUD_KEY_FILE || path.join(__dirname, '../config/google-credentials.json');
      
      if (!fs.existsSync(keyFilePath)) {
        console.log('⚠️  Google credentials file not found. Document API features will be disabled.');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      console.log('✅ Google Document API initialized for development mode');
    } catch (error) {
      console.error('❌ Error initializing Google Document API:', error);
    }
  }

  // Check if Document API is available
  isAvailable() {
    return process.env.NODE_ENV === 'development' && this.auth;
  }

  // Create a new Google Document
  async createDocument(title, content = '') {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      // Create document
      const document = await this.docs.documents.create({
        auth: authClient,
        requestBody: {
          title: title
        }
      });

      const documentId = document.data.documentId;

      // Add content if provided
      if (content) {
        await this.updateDocumentContent(documentId, content);
      }

      return {
        documentId: documentId,
        title: title,
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error creating Google Document:', error);
      throw error;
    }
  }

  // Update document content
  async updateDocumentContent(documentId, content) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      await this.docs.documents.batchUpdate({
        auth: authClient,
        documentId: documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1
                },
                text: content
              }
            }
          ]
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Error updating document content:', error);
      throw error;
    }
  }

  // Get document content
  async getDocumentContent(documentId) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      const document = await this.docs.documents.get({
        auth: authClient,
        documentId: documentId
      });

      // Extract text content from document
      const content = this.extractTextFromDocument(document.data);
      
      return {
        documentId: documentId,
        title: document.data.title,
        content: content,
        url: `https://docs.google.com/document/d/${documentId}/edit`
      };
    } catch (error) {
      console.error('❌ Error getting document content:', error);
      throw error;
    }
  }

  // Extract text content from Google Document
  extractTextFromDocument(document) {
    let text = '';
    
    if (document.body && document.body.content) {
      document.body.content.forEach(element => {
        if (element.paragraph) {
          element.paragraph.elements.forEach(element => {
            if (element.textRun) {
              text += element.textRun.content;
            }
          });
        }
      });
    }
    
    return text.trim();
  }

  // Create document from uploaded file (PDF/DOC)
  async createDocumentFromFile(file, title) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      // Upload file to Google Drive first
      const fileMetadata = {
        name: title,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root']
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      };

      const uploadedFile = await this.drive.files.create({
        auth: authClient,
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink'
      });

      // Convert to Google Document if it's a supported format
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' ||
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        
        const convertedFile = await this.drive.files.copy({
          auth: authClient,
          fileId: uploadedFile.data.id,
          requestBody: {
            name: `${title} (Converted)`,
            mimeType: 'application/vnd.google-apps.document'
          }
        });

        // Delete the original uploaded file
        await this.drive.files.delete({
          auth: authClient,
          fileId: uploadedFile.data.id
        });

        return {
          documentId: convertedFile.data.id,
          title: convertedFile.data.name,
          url: convertedFile.data.webViewLink,
          originalFile: file.originalname,
          convertedAt: new Date().toISOString()
        };
      }

      return {
        fileId: uploadedFile.data.id,
        title: uploadedFile.data.name,
        url: uploadedFile.data.webViewLink,
        originalFile: file.originalname,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error creating document from file:', error);
      throw error;
    }
  }

  // Share document with specific users
  async shareDocument(documentId, email, role = 'reader') {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      await this.drive.permissions.create({
        auth: authClient,
        fileId: documentId,
        requestBody: {
          role: role,
          type: 'user',
          emailAddress: email
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Error sharing document:', error);
      throw error;
    }
  }

  // Get document permissions
  async getDocumentPermissions(documentId) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      const permissions = await this.drive.permissions.list({
        auth: authClient,
        fileId: documentId,
        fields: 'permissions(id,emailAddress,role,displayName)'
      });

      return permissions.data.permissions || [];
    } catch (error) {
      console.error('❌ Error getting document permissions:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(documentId) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      await this.drive.files.delete({
        auth: authClient,
        fileId: documentId
      });

      return true;
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }

  // Search documents
  async searchDocuments(query, maxResults = 10) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not available in production mode');
    }

    try {
      const authClient = await this.auth.getClient();
      
      const files = await this.drive.files.list({
        auth: authClient,
        q: `name contains '${query}' and mimeType='application/vnd.google-apps.document'`,
        pageSize: maxResults,
        fields: 'files(id,name,webViewLink,createdTime,modifiedTime)'
      });

      return files.data.files || [];
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      throw error;
    }
  }
}

module.exports = GoogleDocumentAPIService; 