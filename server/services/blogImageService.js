const S3Service = require('./s3Service');
const crypto = require('crypto');

class BlogImageService {
  constructor() {
    try {
      this.s3Service = new S3Service();
      this.enabled = true;
    } catch (error) {
      console.warn('⚠️  [BLOG IMAGES] S3 service not available:', error.message);
      console.warn('   Images will use Notion URLs (may expire)');
      this.enabled = false;
    }
    
    // Cache to avoid re-uploading the same image
    this.urlCache = new Map(); // originalUrl -> s3Url
  }

  /**
   * Generate a hash from URL to track unique images
   */
  getImageHash(url) {
    // Extract the base URL without query params for hashing
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
      return crypto.createHash('md5').update(baseUrl).digest('hex').substring(0, 12);
    } catch {
      return crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
    }
  }

  /**
   * Process a single image URL - download from Notion and upload to S3
   * @param {string} originalUrl - Original Notion image URL
   * @param {string} postSlug - Blog post slug for organizing images
   * @param {number} index - Image index for naming
   * @returns {Promise<string>} S3 URL or original URL if S3 is disabled
   */
  async processImage(originalUrl, postSlug, index = 0) {
    if (!this.enabled || !originalUrl) {
      return originalUrl;
    }

    // Check cache first
    if (this.urlCache.has(originalUrl)) {
      return this.urlCache.get(originalUrl);
    }

    try {
      // Check if we've already uploaded this image
      const imageHash = this.getImageHash(originalUrl);
      const existingKey = `blog-images/${postSlug}/.cache/${imageHash}`;
      
      if (await this.s3Service.objectExists(existingKey)) {
        // Image already uploaded, use existing URL
        const existingUrl = `${this.s3Service.publicUrlPrefix}/${existingKey}`;
        this.urlCache.set(originalUrl, existingUrl);
        return existingUrl;
      }

      // Download image from Notion
      console.log(`  📥 [BLOG IMAGES] Downloading image ${index + 1} for "${postSlug}"...`);
      const { buffer, contentType } = await this.s3Service.downloadImage(originalUrl);

      // Generate S3 key
      const s3Key = this.s3Service.generateImageKey(postSlug, originalUrl, index);

      // Upload to S3
      console.log(`  📤 [BLOG IMAGES] Uploading to S3: ${s3Key}...`);
      const s3Url = await this.s3Service.uploadImage(buffer, s3Key, contentType, true);

      // Also create a cache entry for future reference
      try {
        await this.s3Service.uploadImage(buffer, existingKey, contentType, true);
      } catch (cacheError) {
        // Cache upload failure is not critical
        console.warn(`  ⚠️  [BLOG IMAGES] Failed to cache image: ${cacheError.message}`);
      }

      this.urlCache.set(originalUrl, s3Url);
      console.log(`  ✅ [BLOG IMAGES] Image uploaded: ${s3Url}`);
      
      return s3Url;
    } catch (error) {
      console.error(`  ❌ [BLOG IMAGES] Failed to process image: ${error.message}`);
      console.error(`     Original URL: ${originalUrl.substring(0, 100)}...`);
      // Return original URL as fallback
      return originalUrl;
    }
  }

  /**
   * Process cover image URL
   */
  async processCoverImage(coverUrl, postSlug) {
    if (!coverUrl) return '';
    return this.processImage(coverUrl, postSlug, 'cover');
  }

  /**
   * Process all images in HTML content
   * Finds all <img> tags and replaces src URLs with S3 URLs
   */
  async processContentImages(html, postSlug) {
    if (!this.enabled || !html) {
      return html;
    }

    // Find all image tags
    const imgRegex = /<img([^>]+)src="([^"]+)"([^>]*)>/gi;
    const images = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push({
        fullMatch: match[0],
        beforeSrc: match[1],
        src: match[2],
        afterSrc: match[3],
        index: images.length
      });
    }

    if (images.length === 0) {
      return html;
    }

    console.log(`  🖼️  [BLOG IMAGES] Processing ${images.length} images in content...`);

    // Process all images
    const processedImages = await Promise.all(
      images.map(img => 
        this.processImage(img.src, postSlug, img.index).then(s3Url => ({
          ...img,
          s3Url
        }))
      )
    );

    // Replace URLs in HTML
    let processedHtml = html;
    for (const img of processedImages) {
      if (img.s3Url !== img.src) {
        const newImgTag = `<img${img.beforeSrc}src="${img.s3Url}"${img.afterSrc}>`;
        processedHtml = processedHtml.replace(img.fullMatch, newImgTag);
      }
    }

    return processedHtml;
  }
}

module.exports = BlogImageService;
