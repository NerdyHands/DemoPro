import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../api/blog';
import type { PostSummary } from '../api/blog';
import SEO from '../components/SEO';
import './Blog.css';

const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getUniqueTags = (posts: PostSummary[]) => {
  const tags = new Set<string>();
  posts.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

const Blog: React.FC = () => {
  const [posts, setPosts] = React.useState<PostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag') || '';

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPosts(tag || undefined)
      .then(data => {
        if (!active) return;
        setPosts(data.posts || []);
        setError(null);
      })
      .catch(err => {
        if (!active) return;
        setError(err.message || 'Failed to load posts');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tag]);

  const tags = getUniqueTags(posts);
  const featured = posts.filter(p => p.featured);
  const regular = posts.filter(p => !p.featured);

  const handleTagClick = (next?: string) => {
    if (next) {
      setSearchParams({ tag: next });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="blog-layout">
      <SEO
        title="Blog | Mr Demo Pro"
        description="Guides, tips, and updates from Mr Demo Pro."
        canonicalUrl="https://mrdemopro.com/blog"
        ogType="article"
      />
      <section className="blog-hero">
        <div>
          <p className="eyebrow">Insights & Updates</p>
          <h1>Mr Demo Pro Blog</h1>
          <p>Best practices, project stories, and how-tos for cleanouts and demolition.</p>
          <div className="tag-row">
            <button
              className={!tag ? 'tag active' : 'tag'}
              onClick={() => handleTagClick(undefined)}
              aria-pressed={!tag}
            >
              All
            </button>
            {tags.map(t => (
              <button
                key={t}
                className={tag === t ? 'tag active' : 'tag'}
                onClick={() => handleTagClick(t)}
                aria-pressed={tag === t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && <div className="blog-state">Loading posts…</div>}
      {error && <div className="blog-state error">{error}</div>}

      {!loading && !error && (
        <div className="blog-grid">
          {featured.length > 0 && (
            <div className="featured">
              {featured.map(post => (
                <article key={post.slug} className="card featured-card">
                  {post.coverUrl && (
                    <Link to={`/blog/${post.slug}`} aria-label={post.title}>
                      <img src={post.coverUrl} alt={post.title} loading="lazy" />
                    </Link>
                  )}
                  <div className="card-body">
                    <div className="meta">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                    </div>
                    <h2>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="excerpt">{post.excerpt}</p>
                    <div className="tags">
                      {(post.tags || []).map(t => (
                        <button key={t} className="pill" onClick={() => handleTagClick(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="grid">
            {regular.map(post => (
              <article key={post.slug} className="card">
                {post.coverUrl && (
                  <Link to={`/blog/${post.slug}`} aria-label={post.title}>
                    <img src={post.coverUrl} alt={post.title} loading="lazy" />
                  </Link>
                )}
                <div className="card-body">
                  <div className="meta">
                    <span>{formatDate(post.publishedAt)}</span>
                    {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                  </div>
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="excerpt">{post.excerpt}</p>
                  <div className="tags">
                    {(post.tags || []).map(t => (
                      <button key={t} className="pill" onClick={() => handleTagClick(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="blog-state">No posts available yet. Check back soon.</div>
      )}
    </div>
  );
};

export default Blog;
