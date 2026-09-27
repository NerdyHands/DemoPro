/**
 * Google Docs Service for ezPICRA Blog
 * Fetches content from Google Docs with fallback handling
 */

const { google } = require('googleapis');

// Configuration
const API_KEY = process.env.GOOGLE_DOCS_API_KEY || process.env.GOOGLE_SHEETS_API_KEY;

/**
 * Extract Google Doc ID from URL
 */
function extractGoogleDocId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Handle various Google Docs URL formats
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch content from Google Docs
 */
async function fetchGoogleDocContent(docUrl, format = 'html') {
  try {
    if (!docUrl || !docUrl.includes('docs.google.com')) {
      throw new Error('Invalid Google Docs URL');
    }

    console.log('📄 Fetching Google Doc content...');
    console.log('🔗 URL:', docUrl.substring(0, 100) + '...');

    const docId = extractGoogleDocId(docUrl);
    if (!docId) {
      throw new Error('Could not extract document ID from URL');
    }

    console.log('🆔 Document ID:', docId);

    // Try Google Docs API first (if API key available)
    if (API_KEY) {
      try {
        return await fetchViaDocsAPI(docId, format);
      } catch (apiError) {
        console.warn('⚠️ Google Docs API failed, trying public export:', apiError.message);
      }
    }

    // Fallback to public export URL
    return await fetchViaPublicExport(docId, format);

  } catch (error) {
    console.error('❌ Error fetching Google Doc content:', error);
    throw error;
  }
}

/**
 * Fetch via Google Docs API (requires authentication)
 */
async function fetchViaDocsAPI(docId, format) {
  try {
    const docs = google.docs({ version: 'v1', auth: API_KEY });
    
    const response = await docs.documents.get({
      documentId: docId,
    });

    const document = response.data;
    
    // Extract text content from the document structure
    let content = '';
    
    if (document.body && document.body.content) {
      content = extractTextFromDocument(document.body.content);
    }

    console.log(`✅ Fetched ${content.length} characters via Docs API`);
    
    return format === 'html' ? convertToHTML(content) : content;

  } catch (error) {
    console.error('❌ Google Docs API error:', error);
    throw error;
  }
}

/**
 * Fetch via public export URL (requires public access)
 */
async function fetchViaPublicExport(docId, format) {
  try {
    // Dynamically import fetch for Node.js compatibility
    const { default: fetch } = await import('node-fetch');
    
    const exportFormat = format === 'html' ? 'html' : 'txt';
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=${exportFormat}`;
    
    console.log('🌐 Fetching via public export URL...');
    console.log('📤 Export URL:', exportUrl);

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ezPICRA-Blog-Sync/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();

    if (!content || content.length < 10) {
      throw new Error('Document appears to be empty or inaccessible');
    }

    console.log(`✅ Fetched ${content.length} characters via public export`);
    
    return content;

  } catch (error) {
    console.error('❌ Public export error:', error);
    throw error;
  }
}

/**
 * Extract text from Google Docs API document structure
 */
function extractTextFromDocument(content) {
  let text = '';
  
  function extractFromElement(element) {
    if (element.paragraph) {
      // Handle paragraphs
      if (element.paragraph.elements) {
        element.paragraph.elements.forEach(elem => {
          if (elem.textRun && elem.textRun.content) {
            text += elem.textRun.content;
          }
        });
      }
      text += '\n';
    } else if (element.table) {
      // Handle tables
      element.table.tableRows.forEach(row => {
        row.tableCells.forEach(cell => {
          if (cell.content) {
            cell.content.forEach(extractFromElement);
          }
        });
      });
    } else if (element.tableOfContents) {
      // Skip table of contents
      return;
    }
  }
  
  content.forEach(extractFromElement);
  
  return text.trim();
}

/**
 * Convert plain text to basic HTML
 */
function convertToHTML(text) {
  if (!text) return '';
  
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  // Convert to HTML paragraphs
  const htmlParagraphs = paragraphs.map(para => {
    const trimmed = para.trim().replace(/\n/g, '<br>');
    
    // Basic heading detection
    if (trimmed.length < 100 && !trimmed.includes('.')) {
      return `<h3>${trimmed}</h3>`;
    }
    
    return `<p>${trimmed}</p>`;
  });
  
  return htmlParagraphs.join('\n');
}

/**
 * Test Google Docs access
 */
async function testGoogleDocsAccess(docUrl) {
  try {
    const content = await fetchGoogleDocContent(docUrl, 'txt');
    
    return {
      success: true,
      contentLength: content.length,
      preview: content.substring(0, 200) + '...',
      method: API_KEY ? 'Google Docs API' : 'Public Export'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate Google Docs URL
 */
function isValidGoogleDocsUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return url.includes('docs.google.com') && extractGoogleDocId(url) !== null;
}

module.exports = {
  fetchGoogleDocContent,
  extractGoogleDocId,
  testGoogleDocsAccess,
  isValidGoogleDocsUrl
};
