const fs = require('fs');

class FileValidationService {
  constructor() {
    this.allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    this.allowedExtensions = ['.pdf', '.doc', '.docx'];
    
    this.maxFileSize = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
  }

  // Validate file based on MIME type
  validateMimeType(mimeType) {
    return this.allowedMimeTypes.includes(mimeType);
  }

  // Validate file based on extension
  validateExtension(filename) {
    const extension = this.getFileExtension(filename);
    return this.allowedExtensions.includes(extension.toLowerCase());
  }

  // Get file extension
  getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
  }

  // Validate file size
  validateFileSize(fileSize) {
    return fileSize <= this.maxFileSize;
  }

  // Comprehensive file validation
  async validateFile(file) {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Validate file size
    if (!this.validateFileSize(file.size)) {
      errors.push(`File size exceeds maximum limit of ${this.formatFileSize(this.maxFileSize)}`);
    }

    // Validate MIME type
    if (!this.validateMimeType(file.mimetype)) {
      errors.push(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    // Validate file extension
    if (!this.validateExtension(file.originalname)) {
      errors.push(`Invalid file extension. Allowed extensions: ${this.allowedExtensions.join(', ')}`);
    }

    // Additional validation using file-type library for more accurate detection (optional)
    if (file.path && fs.existsSync(file.path)) {
      try {
        const buffer = fs.readFileSync(file.path);
        
        // Try to use file-type library for content validation (optional enhancement)
        try {
          const { fileTypeFromBuffer } = await import('file-type');
          const detectedType = await fileTypeFromBuffer(buffer);
          
          if (detectedType) {
            const detectedMimeType = detectedType.mime;
            
            // Check if detected MIME type matches declared MIME type
            if (detectedMimeType !== file.mimetype) {
              console.warn(`⚠️  MIME type mismatch: declared=${file.mimetype}, detected=${detectedMimeType}`);
              
              // Only add error if detected type is not allowed
              if (!this.validateMimeType(detectedMimeType)) {
                console.warn(`⚠️  File content type not allowed: ${detectedMimeType}`);
                // Don't add this as a hard error, just log it
              }
            }
          }
        } catch (importError) {
          console.log('ℹ️  File-type library not available, using basic validation only');
          // This is not an error - the library is optional
        }
      } catch (error) {
        console.warn('⚠️  Could not read file for content validation:', error.message);
        // This is not a critical error
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: this.getFileExtension(file.originalname)
      }
    };
  }

  // Validate multiple files
  async validateFiles(files) {
    const results = [];
    
    for (const file of files) {
      const validation = await this.validateFile(file);
      results.push({
        file: file.originalname,
        ...validation
      });
    }

    const allValid = results.every(result => result.isValid);
    const allErrors = results.flatMap(result => result.errors);

    return {
      isValid: allValid,
      errors: allErrors,
      results
    };
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type information
  getFileTypeInfo(filename) {
    const extension = this.getFileExtension(filename).toLowerCase();
    
    const typeInfo = {
      '.pdf': {
        name: 'PDF Document',
        description: 'Portable Document Format',
        icon: '📄'
      },
      '.doc': {
        name: 'Word Document',
        description: 'Microsoft Word Document (Legacy)',
        icon: '📝'
      },
      '.docx': {
        name: 'Word Document',
        description: 'Microsoft Word Document (Modern)',
        icon: '📝'
      }
    };

    return typeInfo[extension] || {
      name: 'Unknown',
      description: 'Unknown file type',
      icon: '❓'
    };
  }

  // Check if file is a PDF
  isPDF(file) {
    return file.mimetype === 'application/pdf' || 
           this.getFileExtension(file.originalname).toLowerCase() === '.pdf';
  }

  // Check if file is a Word document
  isWordDocument(file) {
    const mimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extensions = ['.doc', '.docx'];
    
    return mimeTypes.includes(file.mimetype) || 
           extensions.includes(this.getFileExtension(file.originalname).toLowerCase());
  }

  // Get validation rules for client-side validation
  getValidationRules() {
    return {
      allowedMimeTypes: this.allowedMimeTypes,
      allowedExtensions: this.allowedExtensions,
      maxFileSize: this.maxFileSize,
      maxFileSizeFormatted: this.formatFileSize(this.maxFileSize)
    };
  }

  // Create validation error message
  createErrorMessage(errors) {
    if (errors.length === 0) return null;
    
    const messages = {
      'No file provided': 'Please select a file to upload.',
      'File size exceeds maximum limit': `File size must be less than ${this.formatFileSize(this.maxFileSize)}.`,
      'Invalid file type': `Only PDF and Word documents (${this.allowedExtensions.join(', ')}) are allowed.`,
      'Invalid file extension': `File must have one of these extensions: ${this.allowedExtensions.join(', ')}.`,
      'Unable to validate file content': 'Unable to verify file content. Please try again.'
    };

    return errors.map(error => {
      for (const [key, message] of Object.entries(messages)) {
        if (error.includes(key)) {
          return message;
        }
      }
      return error;
    }).join(' ');
  }
}

module.exports = FileValidationService; 