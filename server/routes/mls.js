const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * OPTIONS /api/mls/pending
 * Handle preflight CORS requests
 */
router.options('/pending', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

/**
 * GET /api/mls/pending
 * Fetch pending properties from Realtor API
 */
router.get('/pending', async (req, res) => {
  try {
    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Check if RapidAPI key is configured
    if (!process.env.RAPIDAPI_KEY) {
      console.warn('⚠️ RAPIDAPI_KEY not configured - returning empty array');
      return res.json([]);
    }

    const response = await axios.get(
      'https://realtor.p.rapidapi.com/properties/v2/list-for-sale',
      {
        params: {
          city: 'Hampton',
          state_code: 'VA',
          status: 'pending',
          limit: '20',
          sort: 'newest',
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'realtor.p.rapidapi.com',
        },
      }
    );

    res.json(response.data.properties || []);
  } catch (err) {
    console.error('Error fetching MLS pending properties:', err.message);
    console.error('Error details:', err.response?.data || err.message);
    
    // Set CORS headers even on error
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Return empty array instead of error to prevent frontend issues
    res.status(200).json([]);
  }
});

module.exports = router;

