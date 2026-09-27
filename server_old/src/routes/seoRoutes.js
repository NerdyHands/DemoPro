const express = require('express');
const { getAllPublishedPostsForSitemap } = require('../repos/postsRepo');

const router = express.Router();
const CACHE_SECONDS = 300;

const setCache = (res, seconds = CACHE_SECONDS) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
};

const getSiteUrl = (req) => process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = getSiteUrl(req);
    const posts = await getAllPublishedPostsForSitemap();
    const urls = posts
      .map(
        (post) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}/</loc>
    <lastmod>${(post.updatedAt || post.publishedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${urls}
</urlset>`;

    setCache(res, 600);
    res.type('application/xml').send(xml.trim());
  } catch (error) {
    console.error('❌ Failed to generate sitemap.xml', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/robots.txt', (req, res) => {
  const siteUrl = getSiteUrl(req);
  setCache(res, 600);
  res.type('text/plain').send(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
});

module.exports = router;
