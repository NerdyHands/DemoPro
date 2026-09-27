const GoogleDocumentAPIService = require('../googleDocumentAPI');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

class GoogleDocsPublisher {
  constructor() {
    this.docService = new GoogleDocumentAPIService();
  }

  isAvailable() {
    return this.docService.isAvailable();
  }

  /**
   * Upload a DOCX buffer and convert it into a Google Doc.
   */
  async publishDocxAsGoogleDoc({ buffer, title }) {
    return await this.docService.uploadBufferAsGoogleDoc({
      buffer,
      title,
      mimeType: DOCX_MIME
    });
  }

  async shareDocument(documentId, email, role = 'reader') {
    return await this.docService.shareDocument(documentId, email, role);
  }
}

module.exports = {
  GoogleDocsPublisher,
  DOCX_MIME
};

