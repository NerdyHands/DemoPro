const BlogEvent = require('../models/BlogEvent');

async function recordEvent({ eventType, slug, value, meta, userAgent, ip }) {
  return BlogEvent.create({
    eventType,
    slug,
    value,
    meta: meta || {},
    userAgent,
    ip
  });
}

module.exports = {
  recordEvent
};
