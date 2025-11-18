import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBlogPostsFromSheets } from '../services/googleSheetsService';
import './BlogHome.css';

const BlogHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts from Google Sheets
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await fetchBlogPostsFromSheets();
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Get unique categories and tags from posts
  const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];
  const allTags = posts.flatMap(post => post.tags || []).filter(Boolean);
  const tags = ['All', ...new Set(allTags)];

  // Filter posts based on category, tag, and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag));
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesTag && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Fix date parsing to prevent "one day off" issue by using UTC parsing
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  if (loading) {
    return (
      <div className="blog-home">
        <div className="container">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <h2>Loading blog posts...</h2>
            <p>Fetching the latest content from ezPICRA database.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-home">
        <div className="container">
          <div className="error-section">
            <h2>Error Loading Blog</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              ezPICRA Blog
            </h1>
            <p className="hero-subtitle">
              Professional PICRA repairs and home inspection repair services across Hampton, Newport News, Yorktown, and Norfolk, VA. Same-day estimates and fast turnaround times for real estate professionals and homeowners.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Filters Section */}
        <section className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <div className="category-filters">
              <span className="filter-label">Categories:</span>
              <button
                className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All
              </button>
              {categories.slice(1).map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="tag-filters">
              <span className="filter-label">Tags:</span>
              <button
                className={`filter-btn ${selectedTag === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedTag('All')}
              >
                All
              </button>
              {tags.slice(1, 9).map(tag => (
                <button
                  key={tag}
                  className={`filter-btn ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="featured-posts section">
            <h2 className="section-title">Featured Articles</h2>
            <div className="featured-grid">
              {featuredPosts.map(post => (
                <article key={post.id} className="featured-post">
                  <div className="post-meta">
                    <span className="post-category">{post.category}</span>
                    <span className="post-date">{formatDate(post.publishDate)}</span>
                  </div>
                  <h3 className="post-title">
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-footer">
                    <span className="post-author">By {post.author}</span>
                    <span className="post-read-time">{post.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="all-posts section">
          <h2 className="section-title">All Articles</h2>
          <div className="posts-grid">
            {regularPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-meta">
                  <span className="post-category">{post.category}</span>
                  <span className="post-date">{formatDate(post.publishDate)}</span>
                </div>
                <h3 className="post-title">
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-tags">
                  {post.tags && post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="post-tag">{tag}</span>
                  ))}
                </div>
                <div className="post-footer">
                  <span className="post-author">By {post.author}</span>
                  <span className="post-read-time">{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <section className="no-results section">
            <h3>No articles found</h3>
            <p>Try adjusting your search criteria or browse all articles.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedTag('All');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogHome;
