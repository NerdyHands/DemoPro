# Google Places API Setup Guide

This guide explains how to set up Google Places API for address autocomplete functionality in the ezPICRA application.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Cloud project
3. Billing enabled on your Google Cloud project

## Setup Steps

### 1. Enable Google Places API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Places API"
5. Click on "Places API" and then click "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 3. Restrict API Key (Recommended)

1. Click on the API key you just created
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - For development: `http://localhost:3000/*`
   - For production: `https://yourdomain.com/*`
4. Under "API restrictions", select "Restrict key"
5. Select "Places API" from the dropdown
6. Click "Save"

### 4. Configure Environment Variables

#### Development Environment

Edit `client/.env.development`:
```
REACT_APP_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

#### Production Environment

Edit `client/.env.production`:
```
REACT_APP_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

### 5. Restart Development Server

After adding the API key, restart your development server:

```bash
cd client
npm start
```

## Features

The Google Places API integration provides:

- **Address Autocomplete**: Real-time address suggestions as users type
- **Address Validation**: Ensures addresses are valid and complete
- **Geocoding**: Provides latitude/longitude coordinates for selected addresses
- **US Address Restriction**: Currently limited to US addresses for compliance

## Usage

The AddressAutocomplete component is used in the document upload form:

```jsx
import AddressAutocomplete from '../../components/AddressAutocomplete';

<AddressAutocomplete
  value={propertyAddress}
  onChange={setPropertyAddress}
  placeholder="Start typing to see address suggestions..."
  required
  onAddressSelect={handleAddressSelect}
/>
```

## Troubleshooting

### API Key Not Working

1. Verify the API key is correct
2. Check that Places API is enabled
3. Ensure billing is enabled on your Google Cloud project
4. Check API key restrictions (domain, API restrictions)

### No Address Suggestions

1. Check browser console for errors
2. Verify Google Places API script is loading
3. Ensure you have a valid API key
4. Check network connectivity

### CORS Issues

If you encounter CORS issues:
1. Add your domain to the API key restrictions
2. Ensure you're using HTTPS in production
3. Check that the domain matches exactly

## Cost Considerations

- Google Places API has usage-based pricing
- Typical cost is around $0.017 per 1000 autocomplete requests
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific domains and APIs
2. **Environment Variables**: Never commit API keys to version control
3. **Monitor Usage**: Regularly check API usage in Google Cloud Console
4. **Rotate Keys**: Consider rotating API keys periodically

## Support

For issues with Google Places API:
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Cloud Support](https://cloud.google.com/support) 