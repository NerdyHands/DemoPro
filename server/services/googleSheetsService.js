/**
 * Google Sheets Service for ezPICRA Blog
 * Fetches blog articles directly from Google Sheets API
 */

const { google } = require('googleapis');

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_BLOG_ID || '1YourSpreadsheetIdHere';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const RANGE = 'Sheet1!A:M'; // Adjust based on your columns

/**
 * Fetch blog articles from Google Sheets
 */
async function fetchBlogArticles() {
  try {
    if (!API_KEY) {
      throw new Error('Google Sheets API key not configured');
    }

    console.log('📊 Fetching blog articles from Google Sheets...');
    console.log(`📋 Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`📍 Range: ${RANGE}`);

    const sheets = google.sheets({ version: 'v4', auth: API_KEY });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length < 2) {
      console.log('⚠️ No data found in Google Sheets');
      return [];
    }

    // First row contains headers
    const headers = rows[0].map(header => header.toLowerCase().trim());
    console.log('📋 Found headers:', headers);

    // Map rows to objects
    const articles = rows.slice(1).map((row, index) => {
      const article = {};
      
      headers.forEach((header, columnIndex) => {
        const value = row[columnIndex] || '';
        
        // Map common header variations to standard fields
        switch (header) {
          case 'company':
            article.company = value.trim();
            break;
          case 'title':
            article.title = value.trim();
            break;
          case 'slug':
            article.slug = value.trim();
            break;
          case 'coverimageur':
          case 'coverimageurl':
          case 'images':
          case 'image':
            article.images = value.trim();
            break;
          case 'author':
            article.author = value.trim();
            break;
          case 'tags':
            article.tags = value.trim();
            break;
          case 'metadescription':
          case 'meta_description':
          case 'description':
            article.metaDescription = value.trim();
            break;
          case 'excerpt':
            article.excerpt = value.trim();
            break;
          case 'publishdate':
          case 'publish_date':
          case 'date':
            article.publishDate = value.trim();
            break;
          case 'status':
            article.status = value.trim();
            break;
          case 'content':
          case 'googledocurl':
          case 'google_doc_url':
          case 'docurl':
          case 'doc_url':
            article.content = value.trim();
            article.googleDocUrl = value.trim();
            break;
          case 'category':
            article.category = value.trim();
            break;
          case 'featured':
            article.featured = value.trim();
            break;
          default:
            // Store unknown headers as-is
            article[header] = value.trim();
        }
      });

      // Generate ID if not provided
      if (!article.id) {
        article.id = `article-${index + 1}`;
      }

      return article;
    });

    // Filter out completely empty rows
    const validArticles = articles.filter(article => 
      article.title && article.title.length > 0
    );

    console.log(`✅ Successfully fetched ${validArticles.length} articles from Google Sheets`);
    
    // Log sample article for debugging
    if (validArticles.length > 0) {
      console.log('📄 Sample article:', {
        title: validArticles[0].title,
        slug: validArticles[0].slug,
        status: validArticles[0].status,
        company: validArticles[0].company,
        hasContent: !!validArticles[0].content
      });
    }

    return validArticles;

  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    
    // Provide more specific error messages
    if (error.code === 400) {
      throw new Error('Invalid Google Sheets configuration. Check spreadsheet ID and range.');
    } else if (error.code === 403) {
      throw new Error('Access denied to Google Sheets. Check API key permissions.');
    } else if (error.code === 404) {
      throw new Error('Google Sheets spreadsheet not found. Check spreadsheet ID.');
    } else {
      throw new Error(`Google Sheets API error: ${error.message}`);
    }
  }
}

/**
 * Test Google Sheets connection
 */
async function testGoogleSheetsConnection() {
  try {
    console.log('🧪 Testing Google Sheets connection...');
    
    if (!API_KEY) {
      return {
        success: false,
        error: 'Google Sheets API key not configured'
      };
    }

    if (!SPREADSHEET_ID) {
      return {
        success: false,
        error: 'Google Sheets spreadsheet ID not configured'
      };
    }

    const sheets = google.sheets({ version: 'v4', auth: API_KEY });
    
    // Test with a simple range to check connectivity
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A1:A1',
    });

    return {
      success: true,
      message: 'Google Sheets connection successful',
      spreadsheetId: SPREADSHEET_ID,
      hasData: !!(response.data.values && response.data.values.length > 0)
    };

  } catch (error) {
    console.error('❌ Google Sheets connection test failed:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Get spreadsheet metadata
 */
async function getSpreadsheetInfo() {
  try {
    if (!API_KEY) {
      throw new Error('Google Sheets API key not configured');
    }

    const sheets = google.sheets({ version: 'v4', auth: API_KEY });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const spreadsheet = response.data;
    
    return {
      title: spreadsheet.properties.title,
      sheets: spreadsheet.sheets.map(sheet => ({
        title: sheet.properties.title,
        id: sheet.properties.sheetId,
        gridProperties: sheet.properties.gridProperties
      }))
    };

  } catch (error) {
    console.error('❌ Error getting spreadsheet info:', error);
    throw error;
  }
}

module.exports = {
  fetchBlogArticles,
  testGoogleSheetsConnection,
  getSpreadsheetInfo
};
