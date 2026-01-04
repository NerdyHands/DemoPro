const mongoose = require('mongoose');

const blogEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, index: true },
    slug: { type: String, required: true, index: true },
    value: { type: Number },
    meta: { type: Object, default: {} },
    userAgent: { type: String },
    ip: { type: String }
  },
  { timestamps: true, collection: 'blog_events' }
);

blogEventSchema.index({ createdAt: -1 });
blogEventSchema.index({ slug: 1, eventType: 1, createdAt: -1 });

const BlogEvent = mongoose.models.BlogEvent || mongoose.model('BlogEvent', blogEventSchema);

module.exports = BlogEvent;
