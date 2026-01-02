import axios from 'axios';
import { getFallbackBlogPosts, getFallbackBlogPostBySlug, getFallbackFeaturedPosts } from '../data/fallbackData';

// Google Sheets API configuration
const SPREADSHEET_ID = '1LDWH71YJSiqtxxokCaEMw0j91mC8_XkeKQXnwwuMhcA';
const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY; // You'll need to set this in .env
const RANGE = 'A:J'; // Columns A through J

// Convert Google Sheets data to blog post format
const transformSheetDataToBlogPosts = (values) => {
  if (!values || values.length < 2) return [];
  
  const headers = values[0];
  const dataRows = values.slice(1);
  
  return dataRows
    .filter(row => row.length > 0 && row[0]) // Filter out empty rows
    .map((row, index) => {
      const post = {};
      
      // Map columns based on the spreadsheet structure
      headers.forEach((header, colIndex) => {
        const value = row[colIndex] || '';
        
        switch (header.toLowerCase()) {
          case 'company':
            post.company = value;
            break;
          case 'title':
            post.title = value;
            break;
          case 'slug':
            post.slug = value;
            break;
          case 'coverimageurl':
            post.coverImageURL = value;
            break;
          case 'author':
            post.author = value;
            break;
          case 'tags':
            post.tags = value ? value.split(',').map(tag => tag.trim()) : [];
            break;
          case 'metadescription':
            post.metaDescription = value;
            break;
          case 'publishdate':
            post.publishDate = value;
            break;
          case 'status':
            post.status = value;
            break;
          case 'content':
            post.content = value;
            break;
          default:
            post[header.toLowerCase()] = value;
        }
      });
      
      // Add required fields with defaults
      post.id = index + 1;
      post.excerpt = post.metaDescription || post.title;
      post.category = post.company || 'eZPICRA';
      post.readTime = '5 min read';
      post.featured = post.status === 'Published';
      
      return post;
    })
    .filter(post => post.status === 'Published' && post.title && post.slug); // Only published posts
};

// Fetch data from Google Sheets
export const fetchBlogPostsFromSheets = async () => {
  try {
    if (!API_KEY) {
      console.warn('Google Sheets API key not found. Using fallback data.');
      return getFallbackBlogPosts();
    }
    
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    const values = response.data.values;
    const posts = transformSheetDataToBlogPosts(values);
    
    // If no posts found from API, use fallback
    if (posts.length === 0) {
      console.warn('No posts found from API. Using fallback data.');
      return getFallbackBlogPosts();
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return getFallbackBlogPosts();
  }
};

// Fetch a single blog post by slug
export const fetchBlogPostBySlug = async (slug) => {
  try {
    const posts = await fetchBlogPostsFromSheets();
    const post = posts.find(post => post.slug === slug);
    
    if (!post) {
      console.warn(`Post with slug "${slug}" not found. Using fallback data.`);
      return getFallbackBlogPostBySlug(slug);
    }
    
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return getFallbackBlogPostBySlug(slug);
  }
};

// Get featured posts
export const getFeaturedPosts = async () => {
  try {
    const posts = await fetchBlogPostsFromSheets();
    const featured = posts.filter(post => post.featured).slice(0, 3);
    
    if (featured.length === 0) {
      console.warn('No featured posts found. Using fallback data.');
      return getFallbackFeaturedPosts();
    }
    
    return featured;
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return getFallbackFeaturedPosts();
  }
};

// Get posts by category/company
export const getPostsByCategory = async (category) => {
  try {
    const posts = await fetchBlogPostsFromSheets();
    const categoryPosts = posts.filter(post => 
      post.category.toLowerCase() === category.toLowerCase() ||
      post.company.toLowerCase() === category.toLowerCase()
    );
    
    if (categoryPosts.length === 0) {
      console.warn(`No posts found for category "${category}". Using fallback data.`);
      return getFallbackBlogPosts().filter(post => 
        post.category.toLowerCase() === category.toLowerCase() ||
        post.company.toLowerCase() === category.toLowerCase()
      );
    }
    
    return categoryPosts;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return getFallbackBlogPosts().filter(post => 
      post.category.toLowerCase() === category.toLowerCase() ||
      post.company.toLowerCase() === category.toLowerCase()
    );
  }
};
