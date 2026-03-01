const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const axios = require('axios');

class S3Service {
  constructor() {
    const region = process.env.AWS_REGION || process.env.AWS_S3_REGION || 'us-east-1';
    // Trim whitespace from credentials (common issue with .env files)
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are required. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }

    // Validate credential format
    if (accessKeyId.length < 16) {
      throw new Error(`Invalid AWS_ACCESS_KEY_ID format (too short: ${accessKeyId.length} chars)`);
    }
    if (secretAccessKey.length < 40) {
      throw new Error(`Invalid AWS_SECRET_ACCESS_KEY format (too short: ${secretAccessKey.length} chars)`);
    }

    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is required');
    }

    this.bucketUrl = process.env.AWS_S3_BUCKET_URL || `https://${this.bucketName}.s3.${region}.amazonaws.com`;
    this.publicUrlPrefix = process.env.AWS_S3_PUBLIC_URL || this.bucketUrl;
  }

  /**
   * Download an image from a URL
   */
  async downloadImage(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogSync/1.0)'
        }
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      return { buffer, contentType };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to download image: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Failed to download image: No response from server`);
      } else {
        throw new Error(`Failed to download image: ${error.message}`);
      }
    }
  }

  /**
   * Upload an image to S3
   * @param {Buffer} buffer - Image buffer
   * @param {string} key - S3 object key (path)
   * @param {string} contentType - MIME type
   * @param {boolean} publicRead - Whether to make the object publicly readable (requires bucket policy if ACLs disabled)
   * @returns {string} Public URL of the uploaded image
   */
  async uploadImage(buffer, key, contentType = 'image/jpeg', publicRead = true) {
    try {
      const commandParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable' // Cache for 1 year
        // Note: ACL not set - relying on bucket policy for public access
      };

      const command = new PutObjectCommand(commandParams);
      await this.client.send(command);
      console.log(`✅ [S3] Uploaded ${key} (relying on bucket policy for public access)`);
      
      // Construct public URL
      const publicUrl = `${this.publicUrlPrefix}/${key}`;
      return publicUrl;
    } catch (error) {
      console.error(`❌ [S3] Failed to upload ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if an object exists in S3
   */
  async objectExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Generate S3 key for a blog image
   * Format: blog-images/{postSlug}/{imageFilename}
   */
  generateImageKey(postSlug, imageUrl, index = 0) {
    // Extract filename from URL or generate one
    let filename;
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      filename = pathParts[pathParts.length - 1] || `image-${index}`;
      
      // Remove query parameters from filename
      filename = filename.split('?')[0];
      
      // Ensure filename has extension
      if (!filename.match(/\.[a-z]{2,4}$/i)) {
        // Try to get extension from content type or default to jpg
        filename = `${filename}.jpg`;
      }
    } catch {
      // If URL parsing fails, generate filename
      filename = `image-${index}-${Date.now()}.jpg`;
    }

    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    
    return `blog-images/${postSlug}/${filename}`;
  }

  /**
   * Upload JSON data to S3
   * @param {object|string} data - JSON object or stringified JSON
   * @param {string} key - S3 object key (path)
   * @param {boolean} publicRead - Whether to make the object publicly readable
   * @returns {string} Public URL of the uploaded file
   */
  async uploadJSON(data, key, publicRead = true) {
    try {
      // Convert to JSON string if object
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');

      const commandParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'application/json',
        CacheControl: 'public, max-age=300, must-revalidate' // Cache for 5 minutes, must revalidate
        // Note: ACL not set - relying on bucket policy for public access
      };

      const command = new PutObjectCommand(commandParams);
      await this.client.send(command);
      console.log(`✅ [S3] Uploaded JSON: ${key} (relying on bucket policy for public access)`);
      
      // Construct public URL
      const publicUrl = `${this.publicUrlPrefix}/${key}`;
      return publicUrl;
    } catch (error) {
      console.error(`❌ [S3] Failed to upload JSON ${key}:`, error.message);
      throw error;
    }
  }
}

module.exports = S3Service;
