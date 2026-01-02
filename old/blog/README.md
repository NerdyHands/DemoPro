# ezPICRA Blog

A modern, responsive blog built with React that looks exactly like the Onigiri blog design. This blog is specifically designed for ezPICRA content and is super easy to update.

## Features

- 🎨 **Modern Design**: Clean, professional design matching the Onigiri blog aesthetic
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🔍 **Advanced Filtering**: Filter by categories, tags, and search functionality
- ⚡ **Fast Performance**: Built with React for optimal performance
- 📝 **Easy Content Management**: Simple data structure for adding new blog posts
- 🎯 **SEO Friendly**: Proper meta tags and semantic HTML structure
- 🔗 **Social Sharing**: Built-in social media sharing buttons
- 📊 **Related Posts**: Automatic related post suggestions

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the blog directory:
   ```bash
   cd blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## How to Update Content

### Adding New Blog Posts

The blog content is managed through the `src/data/blogPosts.js` file. To add a new blog post:

1. Open `src/data/blogPosts.js`
2. Add a new post object to the `blogPosts` array:

```javascript
{
  id: 6, // Unique ID (increment from the last one)
  slug: 'your-post-slug', // URL-friendly slug (no spaces, use hyphens)
  title: 'Your Post Title',
  excerpt: 'A brief description of your post that appears in the preview.',
  content: `
    <h2>Your Content Here</h2>
    <p>You can use HTML tags in the content field.</p>
    <ul>
      <li>Bullet points</li>
      <li>More content</li>
    </ul>
  `,
  author: 'Author Name',
  publishDate: '2025-01-20', // YYYY-MM-DD format
  category: 'Property Inspection', // Must match one of the categories
  tags: ['PICRA', 'Real Estate', 'Your Tag'], // Array of tags
  readTime: '5 min read',
  featured: false // Set to true to feature on homepage
}
```

### Updating Categories

To add or modify categories, update the `categories` array in `src/data/blogPosts.js`:

```javascript
export const categories = [
  'Property Inspection',
  'Real Estate',
  'Legal',
  'Guides',
  'Your New Category'
];
```

### Updating Tags

To add or modify tags, update the `tags` array in `src/data/blogPosts.js`:

```javascript
export const tags = [
  'PICRA',
  'Property Inspection',
  'Real Estate',
  'Legal',
  'Guides',
  'Your New Tag'
];
```

## Content Guidelines

### Blog Post Structure

- **Title**: Keep it clear and descriptive (50-60 characters)
- **Excerpt**: Brief summary (100-150 characters)
- **Content**: Use HTML tags for formatting
- **Category**: Choose from existing categories
- **Tags**: Use relevant tags for better discoverability

### HTML Content Tips

You can use these HTML tags in your content:

```html
<h2>Section Headers</h2>
<h3>Subsection Headers</h3>
<p>Regular paragraphs</p>
<ul>
  <li>Bullet points</li>
</ul>
<ol>
  <li>Numbered lists</li>
</ol>
<strong>Bold text</strong>
<em>Italic text</em>
<a href="https://example.com">Links</a>
<table>
  <tr><th>Header</th></tr>
  <tr><td>Data</td></tr>
</table>
```

## Customization

### Changing Colors

The color scheme can be modified in the CSS files:

- Primary color: `#007bff` (blue)
- Secondary color: `#6c757d` (gray)
- Background colors: `#f9fafb`, `#fff`
- Text colors: `#1f2937`, `#374151`, `#6b7280`

### Modifying Layout

The layout is controlled by CSS Grid and Flexbox. Main layout files:

- `src/components/Header.css` - Navigation and header
- `src/pages/BlogHome.css` - Homepage layout
- `src/pages/BlogPost.css` - Individual post layout

### Adding New Features

The blog is built with React components, making it easy to add new features:

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.js`

## Deployment

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

### Deployment Options

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder to an S3 bucket
- **Traditional hosting**: Upload files to your web server

## File Structure

```
blog/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── Footer.js
│   │   └── Footer.css
│   ├── pages/
│   │   ├── BlogHome.js
│   │   ├── BlogHome.css
│   │   ├── BlogPost.js
│   │   └── BlogPost.css
│   ├── data/
│   │   └── blogPosts.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **Posts not showing up**: Check that the `id` is unique and the `slug` is URL-friendly
2. **Styling issues**: Make sure all CSS files are properly imported
3. **Build errors**: Check for syntax errors in the `blogPosts.js` file

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify that all dependencies are installed
3. Ensure the data structure in `blogPosts.js` is correct

## Contributing

To contribute to the blog:

1. Make your changes in a new branch
2. Test thoroughly
3. Submit a pull request with a clear description of changes

## License

This project is part of the ezPICRA application and follows the same licensing terms.
