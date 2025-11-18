const GoogleCloudStorageService = require('./googleCloudStorage');
const LocalStorageService = require('./localStorage');

class StorageManager {
  constructor() {
    this.useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';
    this.gcsService = null;
    this.localService = null;
    this.currentService = null;
    
    this.initialize();
  }

  async initialize() {
    if (this.useLocalStorage) {
      console.log('📁 Using local storage (configured)');
      this.localService = new LocalStorageService();
      this.currentService = this.localService;
    } else {
      try {
        console.log('☁️  Attempting to use Google Cloud Storage...');
        this.gcsService = new GoogleCloudStorageService();
        await this.gcsService.initializeBucket();
        this.currentService = this.gcsService;
        console.log('✅ Google Cloud Storage initialized successfully');
      } catch (error) {
        console.log('⚠️  Google Cloud Storage unavailable, falling back to local storage');
        console.log('ℹ️  Error:', error.message);
        this.localService = new LocalStorageService();
        this.currentService = this.localService;
      }
    }
  }

  // Get the current storage service
  getService() {
    if (!this.currentService) {
      throw new Error('Storage service not initialized');
    }
    return this.currentService;
  }

  // Get storage type
  getStorageType() {
    if (this.currentService === this.gcsService) {
      return 'google-cloud';
    } else if (this.currentService === this.localService) {
      return 'local';
    }
    return 'unknown';
  }

  // Upload file (delegates to current service)
  async uploadFile(file, folder = 'reports') {
    const service = this.getService();
    return await service.uploadFile(file, folder);
  }

  // Upload buffer (for memory uploads from multer)
  async uploadBuffer(buffer, filename, mimeType) {
    const service = this.getService();
    
    // GCS supports buffer upload
    if (this.currentService === this.gcsService) {
      const blob = this.gcsService.bucket.file(filename);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: mimeType
        },
        resumable: false
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
          console.error('❌ Upload error:', error);
          reject(error);
        });

        blobStream.on('finish', async () => {
          try {
            const [signedUrl] = await blob.getSignedUrl({
              version: 'v4',
              action: 'read',
              expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
            });
            
            resolve({
              fileName: filename.split('/').pop(),
              fileUrl: signedUrl,
              gcsFileName: filename,
              fileSize: buffer.length,
              mimeType: mimeType
            });
          } catch (error) {
            reject(error);
          }
        });

        blobStream.end(buffer);
      });
    }
    
    // Local storage - write buffer to file
    if (this.currentService === this.localService) {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../uploads');
      
      const filePath = path.join(uploadsDir, filename);
      
      // Create all parent directories if they don't exist
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, buffer);
      
      return {
        fileName: filename.split('/').pop(),
        fileUrl: `/uploads/${filename}`,
        gcsFileName: filename,
        fileSize: buffer.length,
        mimeType: mimeType
      };
    }
    
    throw new Error('Storage service not available');
  }

  // Download file (delegates to current service)
  async downloadFile(fileName, folder = 'reports') {
    const service = this.getService();
    return await service.downloadFile(fileName, folder);
  }

  // Delete file (delegates to current service)
  async deleteFile(fileName, folder = 'reports') {
    const service = this.getService();
    return await service.deleteFile(fileName, folder);
  }

  // List files (delegates to current service)
  async listFiles(folder = 'reports', maxResults = 100) {
    const service = this.getService();
    return await service.listFiles(folder, maxResults);
  }

  // Get file metadata (delegates to current service)
  async getFileMetadata(fileName, folder = 'reports') {
    const service = this.getService();
    return await service.getFileMetadata(fileName, folder);
  }

  // Generate file URL (delegates to current service)
  generateFileUrl(fileName, folder = 'reports') {
    const service = this.getService();
    if (service.generateFileUrl) {
      return service.generateFileUrl(fileName, folder);
    }
    // Fallback for GCS service
    if (this.currentService === this.gcsService) {
      return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME || 'ezpicra-reports'}/${folder}/${fileName}`;
    }
    return null;
  }

  // Get storage status
  getStatus() {
    return {
      type: this.getStorageType(),
      configured: !!this.currentService,
      useLocalStorage: this.useLocalStorage,
      gcsAvailable: !!this.gcsService,
      localAvailable: !!this.localService
    };
  }
}

module.exports = StorageManager; 