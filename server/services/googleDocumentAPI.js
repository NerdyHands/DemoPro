const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

const DRIVE_SETUP_HINT =
  'Service accounts have no personal Drive storage. Set GOOGLE_DRIVE_FOLDER_ID to a folder inside a Shared Drive (add the service account as Content manager), or set GOOGLE_DRIVE_IMPERSONATE_USER to a Workspace user with domain-wide delegation enabled.';

class GoogleDocumentAPIService {
  constructor() {
    this.docs = google.docs({ version: 'v1' });
    this.drive = google.drive({ version: 'v3' });
    this.impersonateUser = '';

    this.initializeAuth();
  }

  driveApiOptions() {
    return { supportsAllDrives: true };
  }

  wrapDriveApiError(error) {
    const parts = [
      error?.message,
      ...(error?.errors || []).map((e) => e.message),
      error?.response?.data?.error?.message
    ].filter(Boolean);
    const combined = parts.join(' ');
    if (/storage quota|shared drives|use oauth delegation/i.test(combined)) {
      return new Error(DRIVE_SETUP_HINT);
    }
    return error;
  }

  // Initialize Google API authentication
  initializeAuth() {
    try {
      const keyFilePath = process.env.GOOGLE_CLOUD_KEY_FILE || path.join(__dirname, '../config/google-credentials.json');

      let credentials = null;
      const envJson = process.env.GOOGLE_CLOUD_CREDENTIALS_JSON;

      if (envJson && typeof envJson === 'string' && envJson.trim().length > 0) {
        try {
          credentials = JSON.parse(envJson);
        } catch (e) {
          console.error('❌ Invalid GOOGLE_CLOUD_CREDENTIALS_JSON:', e.message);
        }
      }

      if (!credentials) {
        if (!fs.existsSync(keyFilePath)) {
          console.log('⚠️  Google credentials not found. Document API features will be disabled.');
          return;
        }
        credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
      }

      this.impersonateUser = (
        process.env.GOOGLE_DRIVE_IMPERSONATE_USER ||
        process.env.GOOGLE_WORKSPACE_IMPERSONATE_EMAIL ||
        ''
      ).trim();

      const authOptions = {
        credentials,
        scopes: DRIVE_SCOPES
      };

      if (this.impersonateUser) {
        authOptions.clientOptions = { subject: this.impersonateUser };
      }

      this.auth = new google.auth.GoogleAuth(authOptions);

      if (this.impersonateUser) {
        console.log(`✅ Google Document API initialized (impersonating ${this.impersonateUser})`);
      } else {
        const saEmail = credentials.client_email || 'unknown';
        console.log(`✅ Google Document API initialized (service account: ${saEmail})`);
        console.log('   Google Doc uploads require GOOGLE_DRIVE_FOLDER_ID on a Shared Drive (see .env.development)');
      }
    } catch (error) {
      console.error('❌ Error initializing Google Document API:', error);
    }
  }

  // Check if Document API is available
  isAvailable() {
    return Boolean(this.auth);
  }

  usesImpersonation() {
    return Boolean(this.impersonateUser);
  }

  /**
   * Resolve Drive parent folder for uploads.
   * Service accounts must upload into a Shared Drive folder (not My Drive).
   * With impersonation, an optional folder in the user's Drive may be used.
   */
  async resolveDriveParents(authClient) {
    const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();
    const impersonating = this.usesImpersonation();

    if (!folderId || folderId === 'root') {
      if (impersonating) {
        return [];
      }
      throw new Error(`GOOGLE_DRIVE_FOLDER_ID is required. ${DRIVE_SETUP_HINT}`);
    }

    try {
      const { data } = await this.drive.files.get({
        auth: authClient,
        fileId: folderId,
        fields: 'id,name,mimeType,trashed,driveId',
        ...this.driveApiOptions()
      });

      if (data.trashed) {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID points to a trashed folder.');
      }
      if (data.mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID must be a folder ID.');
      }
      if (!impersonating && !data.driveId) {
        throw new Error(
          'GOOGLE_DRIVE_FOLDER_ID must be a folder on a Shared Drive (not My Drive). ' +
            'Create a Shared Drive, add the service account as Content manager, and use a folder inside it.'
        );
      }

      return [folderId];
    } catch (error) {
      if (error.message?.startsWith('GOOGLE_DRIVE_FOLDER_ID')) {
        throw error;
      }
      const notFound = error.code === 404 || error.response?.status === 404;
      throw new Error(
        notFound
          ? `GOOGLE_DRIVE_FOLDER_ID (${folderId}) was not found or is not shared with the service account. ${DRIVE_SETUP_HINT}`
          : `Cannot access GOOGLE_DRIVE_FOLDER_ID (${folderId}): ${error.message}`
      );
    }
  }

  buildUploadMetadata(title, parents) {
    const metadata = { name: title };
    if (Array.isArray(parents) && parents.length > 0) {
      metadata.parents = parents;
    } else if (!this.usesImpersonation()) {
      throw new Error(DRIVE_SETUP_HINT);
    }
    return metadata;
  }

  // Create a new Google Document (via Drive so Shared Drive parents apply)
  async createDocument(title, content = '') {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not configured');
    }

    try {
      const authClient = await this.auth.getClient();
      const parents = await this.resolveDriveParents(authClient);

      const created = await this.drive.files.create({
        auth: authClient,
        requestBody: {
          name: title,
          mimeType: 'application/vnd.google-apps.document',
          ...(parents.length > 0 ? { parents } : {})
        },
        fields: 'id,name,webViewLink',
        ...this.driveApiOptions()
      });

      const documentId = created.data.id;

      if (content) {
        await this.updateDocumentContent(documentId, content);
      }

      return {
        documentId,
        title: created.data.name || title,
        url: created.data.webViewLink || `https://docs.google.com/document/d/${documentId}/edit`,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error creating Google Document:', error);
      throw this.wrapDriveApiError(error);
    }
  }

  // Update document content
  async updateDocumentContent(documentId, content) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not configured');
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
      throw new Error('Google Document API not configured');
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
      throw new Error('Google Document API not configured');
    }

    try {
      const authClient = await this.auth.getClient();
      const parents = await this.resolveDriveParents(authClient);

      const fileMetadata = this.buildUploadMetadata(title, parents);

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      };

      const driveOpts = this.driveApiOptions();
      const uploadedFile = await this.drive.files.create({
        auth: authClient,
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink',
        ...driveOpts
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
          },
          fields: 'id,name,webViewLink',
          ...driveOpts
        });

        // Delete the original uploaded file
        await this.drive.files.delete({
          auth: authClient,
          fileId: uploadedFile.data.id,
          ...driveOpts
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
      throw this.wrapDriveApiError(error);
    }
  }

  // Share document with specific users
  async shareDocument(documentId, email, role = 'reader') {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not configured');
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
        },
        supportsAllDrives: true,
        sendNotificationEmail: false
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
      throw new Error('Google Document API not configured');
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
      throw new Error('Google Document API not configured');
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
      throw new Error('Google Document API not configured');
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

  /**
   * Upload a buffer as a file to Drive, optionally convert it to a Google Doc.
   * Returns { fileId, documentId, url, title } depending on conversion.
   */
  async uploadBufferAsGoogleDoc({ buffer, title, mimeType }) {
    if (!this.isAvailable()) {
      throw new Error('Google Document API not configured');
    }
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Buffer is required');
    }
    if (!title) {
      throw new Error('Title is required');
    }
    if (!mimeType) {
      throw new Error('mimeType is required');
    }

    try {
      const authClient = await this.auth.getClient();
      const parents = await this.resolveDriveParents(authClient);
      const fileMetadata = this.buildUploadMetadata(title, parents);
      const driveOpts = this.driveApiOptions();

      const media = {
        mimeType,
        body: Readable.from(buffer)
      };

      const uploadedFile = await this.drive.files.create({
        auth: authClient,
        requestBody: fileMetadata,
        media,
        fields: 'id,name,webViewLink',
        ...driveOpts
      });

      const shouldConvert =
        mimeType === 'application/pdf' ||
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (!shouldConvert) {
        return {
          fileId: uploadedFile.data.id,
          title: uploadedFile.data.name,
          url: uploadedFile.data.webViewLink
        };
      }

      const convertedFile = await this.drive.files.copy({
        auth: authClient,
        fileId: uploadedFile.data.id,
        requestBody: {
          name: `${title} (Google Doc)`,
          mimeType: 'application/vnd.google-apps.document'
        },
        fields: 'id,name,webViewLink',
        ...driveOpts
      });

      await this.drive.files.delete({
        auth: authClient,
        fileId: uploadedFile.data.id,
        ...driveOpts
      });

      return {
        documentId: convertedFile.data.id,
        title: convertedFile.data.name,
        url: convertedFile.data.webViewLink
      };
    } catch (error) {
      console.error('❌ Error uploading Google Doc:', error);
      throw this.wrapDriveApiError(error);
    }
  }
}

module.exports = GoogleDocumentAPIService; 