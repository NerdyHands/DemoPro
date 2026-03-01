const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    notionPageId: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' }, // Original Notion image URL
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    authors: { type: [String], default: [] },
    contentJson: { type: mongoose.Schema.Types.Mixed, default: null },
    contentHtml: { type: String, default: '' },
    lastNotionEditedTime: { type: Date },
    syncedAt: { type: Date },
    readingTime: { type: Number, default: 1 }
  },
  { timestamps: true, collection: 'posts' }
);

// Define indexes separately to avoid duplicates
postSchema.index({ published: 1, featured: -1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ notionPageId: 1 }, { unique: true });
postSchema.index({ published: 1 });
postSchema.index({ publishedAt: 1 });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = Post;
