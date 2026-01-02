# Google Sheets Integration Setup

This blog now uses Google Sheets as a database for blog articles. Follow these steps to set up the integration:

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Google Sheets API only for security

## 3. Configure Environment Variables

Create a `.env` file in the blog directory with your API key:

```env
REACT_APP_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
```

## 4. Google Sheets Structure

The blog expects your Google Sheets to have the following columns (A-J):

| Column | Header | Description |
|--------|--------|-------------|
| A | Company | Company name or category |
| B | Title | Blog post title |
| C | Slug | URL-friendly version of title |
| D | CoverImageURL | Image URL for the post |
| E | Author | Author name |
| F | Tags | Comma-separated tags |
| G | MetaDescription | SEO description |
| H | PublishDate | Publication date (YYYY-MM-DD) |
| I | Status | "Published" or "Draft" |
| J | Content | HTML content of the post |

## 5. Current Spreadsheet

The blog is configured to use this spreadsheet:
- **ID**: `1LDWH71YJSiqtxxokCaEMw0j91mC8_XkeKQXnwwuMhcA`
- **URL**: https://docs.google.com/spreadsheets/d/1LDWH71YJSiqtxxokCaEMw0j91mC8_XkeKQXnwwuMhcA/edit?gid=0#gid=0

## 6. Fallback Data

If the API key is not configured or the API fails, the blog will use fallback data based on the sample content from the spreadsheet.

## 7. Testing

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. The blog should load with data from Google Sheets
4. Check the browser console for any API-related messages

## Troubleshooting

- **"API key not found"**: Make sure your `.env` file is in the blog directory and contains the correct API key
- **"No posts found"**: Check that your spreadsheet has data in the correct format and the Status column contains "Published"
- **CORS errors**: The Google Sheets API should work without CORS issues, but if you encounter problems, check your API key restrictions

## Security Notes

- Never commit your `.env` file to version control
- Consider restricting your API key to specific domains/IPs
- The API key is only used for reading data, so it's relatively safe to use in client-side code
