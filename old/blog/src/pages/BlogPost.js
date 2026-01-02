import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogPostBySlug, fetchBlogPostsFromSheets } from '../services/googleSheetsService';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await fetchBlogPostBySlug(slug);
        
        if (!fetchedPost) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        setPost(fetchedPost);
        
        // Load related posts
        const allPosts = await fetchBlogPostsFromSheets();
        const related = allPosts
          .filter(p => p.category === fetchedPost.category && p.slug !== slug)
          .slice(0, 3);
        setRelatedPosts(related);
        
        setError(null);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Fix date parsing to prevent "one day off" issue by using UTC parsing
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="blog-post">
        <div className="container">
          <div className="loading-section">
            <h2>Loading article...</h2>
            <p>Fetching content from eZPICRA database.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post">
        <div className="container">
          <div className="not-found">
            <h1>Post Not Found</h1>
            <p>{error || 'The blog post you\'re looking for doesn\'t exist.'}</p>
            <Link to="/" className="btn btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Blog</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/category/${post.category.toLowerCase().replace(' ', '-')}`}>
            {post.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{post.title}</span>
        </nav>

        {/* Article Header */}
        <article className="article">
          <header className="article-header">
            <div className="article-meta">
              <span className="article-category">{post.category}</span>
              <span className="article-date">{formatDate(post.publishDate)}</span>
            </div>
            <h1 className="article-title">{post.title}</h1>
            <p className="article-excerpt">{post.excerpt}</p>
            <div className="article-author">
              <span>By {post.author}</span>
              <span className="article-read-time">{post.readTime}</span>
            </div>
          </header>

          {/* Article Content */}
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Article Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="article-tags">
              <h3>Tags:</h3>
              <div className="tags-list">
                {post.tags.map(tag => (
                  <span key={tag} className="article-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="article-share">
            <h3>Share this article:</h3>
            <div className="share-buttons">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Check out this article: ${window.location.href}`)}`}
                className="share-btn email"
              >
                Email
              </a>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="related-posts">
            <h2>Related Articles</h2>
            <div className="related-grid">
              {relatedPosts.map(relatedPost => (
                <article key={relatedPost.id} className="related-post">
                  <div className="related-post-meta">
                    <span className="related-post-category">{relatedPost.category}</span>
                    <span className="related-post-date">{formatDate(relatedPost.publishDate)}</span>
                  </div>
                  <h3 className="related-post-title">
                    <Link to={`/post/${relatedPost.slug}`}>{relatedPost.title}</Link>
                  </h3>
                  <p className="related-post-excerpt">{relatedPost.excerpt}</p>
                  <div className="related-post-footer">
                    <span className="related-post-author">By {relatedPost.author}</span>
                    <span className="related-post-read-time">{relatedPost.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="back-to-blog">
          <Link to="/" className="btn btn-secondary">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
