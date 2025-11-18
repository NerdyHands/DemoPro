const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/mls/pending
 * Fetch pending properties from Realtor API
 */
router.get('/pending', async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;

