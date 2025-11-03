/**
 * Vite Plugin for SEO Files
 * Ensures sitemap.xml and robots.txt are properly handled during build
 */

import fs from 'fs';
import path from 'path';

export function seoPlugin() {
  return {
    name: 'seo-plugin',
    generateBundle(options, bundle) {
      // Ensure sitemap.xml and robots.txt are in the bundle
      const seoFiles = ['sitemap.xml', 'robots.txt'];
      
      seoFiles.forEach(fileName => {
        const publicPath = path.join(process.cwd(), 'public', fileName);
        const distPath = path.join(process.cwd(), 'dist', fileName);
        
        // Check if file exists in public directory
        if (fs.existsSync(publicPath)) {
          const content = fs.readFileSync(publicPath, 'utf8');
          
          // Add to bundle
          this.emitFile({
            type: 'asset',
            fileName: fileName,
            source: content
          });
          
          console.log(`📄 SEO file added to bundle: ${fileName}`);
        } else {
          console.warn(`⚠️  SEO file not found in public directory: ${fileName}`);
        }
      });
    },
    
    // Hook to run after build
    writeBundle(options, bundle) {
      console.log('🔍 Verifying SEO files in dist directory...');
      
      const seoFiles = ['sitemap.xml', 'robots.txt'];
      let allPresent = true;
      
      seoFiles.forEach(fileName => {
        const distPath = path.join(options.dir, fileName);
        if (fs.existsSync(distPath)) {
          const stats = fs.statSync(distPath);
          console.log(`✅ ${fileName} - ${stats.size} bytes`);
        } else {
          console.log(`❌ ${fileName} - Missing from dist`);
          allPresent = false;
        }
      });
      
      if (allPresent) {
        console.log('🎉 All SEO files present in dist directory');
      } else {
        console.log('⚠️  Some SEO files missing from dist directory');
      }
    }
  };
}

