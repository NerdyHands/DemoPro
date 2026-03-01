const express = require('express');
const { recordEvent } = require('../repos/blogEventsRepo');

const router = express.Router();
const ALLOWED_EVENTS = new Set(['page_view', 'scroll_depth', 'outbound_click']);

router.post('/', async (req, res) => {
  try {
    const { type, slug, value, meta } = req.body || {};
    if (!type || !ALLOWED_EVENTS.has(type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    if (!slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    await recordEvent({
      eventType: type,
      slug,
      value: typeof value === 'number' ? value : undefined,
      meta,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('❌ Failed to record blog event', error);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

module.exports = router;
