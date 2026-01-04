/* eslint-disable no-console */
require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const Post = require('../src/models/Post');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const post = await Post.findOne({ published: true }).lean();
  
  if (!post) {
    console.log('No published posts found');
    await mongoose.disconnect();
    return;
  }
  
  console.log('Sample Post:');
  console.log('Title:', post.title);
  console.log('Cover URL:', post.coverUrl || 'NONE');
  console.log('Cover URL type:', typeof post.coverUrl);
  
  if (post.contentHtml) {
    const imgMatches = post.contentHtml.match(/<img[^>]+src="([^"]+)"/g);
    console.log('\nImages in content HTML:', imgMatches ? imgMatches.length : 0);
    if (imgMatches) {
      console.log('First 3 image tags:');
      imgMatches.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}: ${match.substring(0, 100)}...`);
      });
    }
  }
  
  await mongoose.disconnect();
})();
