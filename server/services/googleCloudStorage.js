const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

class GoogleCloudStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || path.join(__dirname, '../config/google-credentials.json')
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'ezpicra-reports';
    this.bucket = this.storage.bucket(this.bucketName);
  }

  // Initialize bucket if it doesn't exist
  async initializeBucket() {
    try {
      // First, try to check if bucket exists
      const [exists] = await this.bucket.exists();
      if (!exists) {
        try {
          await this.bucket.create({
            location: process.env.GOOGLE_CLOUD_REGION || 'US-CENTRAL1',
            uniformBucketLevelAccess: {
              enabled: true
            }
          });
          console.log(`✅ Created bucket: ${this.bucketName}`);
        } catch (createError) {
          if (createError.code === 403) {
            console.log(`⚠️  Cannot create bucket ${this.bucketName} - insufficient permissions`);
            console.log(`ℹ️  Please create bucket '${this.bucketName}' manually in Google Cloud Console`);
            console.log(`ℹ️  Or grant 'Storage Admin' role to your service account`);
            throw new Error('Bucket creation failed - insufficient permissions');
          } else {
            throw createError;
          }
        }
      } else {
        console.log(`✅ Using existing bucket: ${this.bucketName}`);
      }
    } catch (error) {
      if (error.code === 403) {
        console.log(`⚠️  Cannot access bucket ${this.bucketName} - insufficient permissions`);
        console.log(`ℹ️  Please ensure bucket '${this.bucketName}' exists and service account has access`);
        console.log(`ℹ️  Grant 'Storage Object Admin' role to: ${this.storage.authClient.email || 'your service account'}`);
        throw new Error('Bucket access denied - insufficient permissions');
      } else {
        console.error('❌ Error initializing bucket:', error);
        throw error;
      }
    }
  }

  // Upload file to Google Cloud Storage
  async uploadFile(file, folder = 'reports') {
    try {
      // Check if bucket is accessible
      const [bucketExists] = await this.bucket.exists();
      if (!bucketExists) {
        throw new Error('Bucket not accessible');
      }

      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const fileBuffer = fs.readFileSync(file.path);
      
      const blob = this.bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString()
          }
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
            // Generate signed URL for secure access (works with uniform bucket-level access)
            const [signedUrl] = await blob.getSignedUrl({
              version: 'v4',
              action: 'read',
              expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
            
            // Don't delete original file here - let the calling code handle it
            // fs.unlinkSync(file.path);
            
            resolve({
              fileName: file.originalname,
              fileUrl: signedUrl,
              gcsFileName: fileName,
              fileSize: file.size,
              mimeType: file.mimetype
            });
          } catch (error) {
            reject(error);
          }
        });

        blobStream.end(fileBuffer);
      });
    } catch (error) {
      console.error('❌ Error uploading to GCS:', error);
      console.log('⚠️  Falling back to local storage');
      throw error;
    }
  }

  // Download file from Google Cloud Storage
  async downloadFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error('File not found in GCS');
      }

      const [buffer] = await file.download();
      return buffer;
    } catch (error) {
      console.error('❌ Error downloading from GCS:', error);
      throw error;
    }
  }

  // Delete file from Google Cloud Storage
  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      
      if (exists) {
        await file.delete();
        console.log(`✅ Deleted file: ${fileName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error deleting from GCS:', error);
      throw error;
    }
  }

  // Generate signed URL for private access
  async generateSignedUrl(fileName, expirationMinutes = 60) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error('File not found in GCS');
      }

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000
      });

      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      throw error;
    }
  }

  // List files in a folder
  async listFiles(folder = 'reports', maxResults = 100) {
    try {
      const [files] = await this.bucket.getFiles({
        prefix: folder,
        maxResults: maxResults
      });

      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        createdAt: file.metadata.timeCreated,
        updatedAt: file.metadata.updated
      }));
    } catch (error) {
      console.error('❌ Error listing files:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      
      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        createdAt: metadata.timeCreated,
        updatedAt: metadata.updated,
        metadata: metadata.metadata || {}
      };
    } catch (error) {
      console.error('❌ Error getting file metadata:', error);
      throw error;
    }
  }
}

module.exports = GoogleCloudStorageService; 