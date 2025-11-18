# MLS API Endpoint

## Overview
This document describes the MLS (Multiple Listing Service) API endpoint for fetching real estate property data from the Realtor API via RapidAPI.

## Endpoint

### GET `/api/mls/pending`
Fetches pending properties for sale in Hampton, VA.

#### Response Format
```json
[
  {
    "address": {
      "line": "123 Main St",
      "city": "Hampton",
      "state_code": "VA"
    },
    "price": 250000,
    "beds": 3,
    "baths": 2,
    "status": "pending",
    // ... other property details
  }
]
```

#### Error Response
```json
{
  "error": "Failed to fetch data"
}
```

## Configuration

### Environment Variables
Make sure you have the following environment variable set in your `.env` file:

```
RAPIDAPI_KEY=your_rapidapi_key_here
```

To get a RapidAPI key:
1. Sign up at https://rapidapi.com
2. Subscribe to the Realtor API: https://rapidapi.com/apidojo/api/realtor
3. Copy your API key from the dashboard
4. Add it to your `.env` file

## Testing

### Manual Testing
Test the endpoint using curl:
```bash
curl http://localhost:5000/api/mls/pending
```

### Automated Testing
Run the included test script:
```bash
node server/test-mls.js
```

## API Parameters

The endpoint currently fetches properties with the following parameters:
- **city**: Hampton
- **state_code**: VA
- **status**: pending
- **limit**: 20
- **sort**: newest

## Future Enhancements

Potential improvements:
- [ ] Add query parameters to allow filtering by city, state, status
- [ ] Add pagination support
- [ ] Cache responses to reduce API calls
- [ ] Add authentication/authorization
- [ ] Create additional endpoints for different property statuses (for-sale, sold, etc.)

## Files Created

- `server/routes/mls.js` - Route handler
- `server/test-mls.js` - Test script
- `server/MLS_API_README.md` - This documentation

## Integration

The route has been registered in `server/server.js` and is available at:
```
http://localhost:5000/api/mls/pending
```

In production:
```
https://your-domain.com/api/mls/pending
```

