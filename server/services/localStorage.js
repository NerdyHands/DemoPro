const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LocalStorageService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.reportsDir = path.join(this.uploadsDir, 'reports');
    this.tempDir = path.join(this.uploadsDir, 'temp');
    this.picraDir = path.join(this.uploadsDir, 'picra');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.uploadsDir, this.reportsDir, this.tempDir, this.picraDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Upload file to local storage
  async uploadFile(file, folder = 'reports') {
    try {
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const fileName = `${timestamp}-${randomId}-${file.originalname}`;
      const destinationDir = path.join(this.uploadsDir, folder);
      const filePath = path.join(destinationDir, fileName);
      
      // Ensure destination directory exists
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }
      
      // Verify source file exists before copying
      if (!fs.existsSync(file.path)) {
        throw new Error(`Source file not found: ${file.path}`);
      }
      
      // Copy file to destination
      fs.copyFileSync(file.path, filePath);
      
      // Don't delete original file here - let the calling code handle it
      // fs.unlinkSync(file.path);
      
      // Create a local URL (for development)
      const localUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${folder}/${fileName}`;
      
      return {
        fileName: file.originalname,
        fileUrl: localUrl,
        localFileName: fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageType: 'local'
      };
    } catch (error) {
      console.error('❌ Error uploading to local storage:', error);
      throw error;
    }
  }

  // Download file from local storage
  async downloadFile(fileName, folder = 'reports') {
    try {
      const filePath = path.join(this.uploadsDir, folder, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found in local storage');
      }

      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('❌ Error downloading from local storage:', error);
      throw error;
    }
  }

  // Delete file from local storage
  async deleteFile(fileName, folder = 'reports') {
    try {
      const filePath = path.join(this.uploadsDir, folder, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted local file: ${fileName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error deleting from local storage:', error);
      throw error;
    }
  }

  // List files in a folder
  async listFiles(folder = 'reports', maxResults = 100) {
    try {
      const folderPath = path.join(this.uploadsDir, folder);
      
      if (!fs.existsSync(folderPath)) {
        return [];
      }

      const files = fs.readdirSync(folderPath)
        .filter(file => {
          const filePath = path.join(folderPath, file);
          return fs.statSync(filePath).isFile();
        })
        .slice(0, maxResults)
        .map(file => {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            updatedAt: stats.mtime
          };
        });

      return files;
    } catch (error) {
      console.error('❌ Error listing local files:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(fileName, folder = 'reports') {
    try {
      const filePath = path.join(this.uploadsDir, folder, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found in local storage');
      }

      const stats = fs.statSync(filePath);
      
      return {
        name: fileName,
        size: stats.size,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        storageType: 'local'
      };
    } catch (error) {
      console.error('❌ Error getting local file metadata:', error);
      throw error;
    }
  }

  // Generate a local URL for file access
  generateFileUrl(fileName, folder = 'reports') {
    return `http://localhost:${process.env.PORT || 5000}/uploads/${folder}/${fileName}`;
  }
}

module.exports = LocalStorageService; 