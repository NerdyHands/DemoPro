import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../api/blog';
import type { PostSummary } from '../api/blog';
import { blogIndexPath, blogPostPath, blogTagPath } from '../utils/blogPaths';
import './Blog.css';

type BlogProps = {
  activeTag?: string;
};

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

const Blog: React.FC<BlogProps> = ({ activeTag }) => {
  const [posts, setPosts] = React.useState<PostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tag = activeTag ?? '';

  React.useEffect(() => {
    if (activeTag) return;
    const legacyTag = searchParams.get('tag');
    if (legacyTag) {
      navigate(blogTagPath(legacyTag), { replace: true });
    }
  }, [activeTag, navigate, searchParams]);

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

  return (
    <div className="blog-layout">
      <section className="blog-hero">
        <div>
          <p className="eyebrow">Insights & Updates</p>
          <h1>Mr Demo Pro Blog</h1>
          <p>Best practices, project stories, and how-tos for cleanouts and demolition.</p>
          <div className="tag-row">
            <Link
              to={blogIndexPath()}
              className={!tag ? 'tag active' : 'tag'}
              aria-current={!tag ? 'page' : undefined}
            >
              All
            </Link>
            {tags.map(t => (
              <Link
                key={t}
                to={blogTagPath(t)}
                className={tag === t ? 'tag active' : 'tag'}
                aria-current={tag === t ? 'page' : undefined}
              >
                {t}
              </Link>
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
                    <Link to={blogPostPath(post.slug)} aria-label={post.title}>
                      <img src={post.coverUrl} alt={post.title} loading="lazy" />
                    </Link>
                  )}
                  <div className="card-body">
                    <div className="meta">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                    </div>
                    <h2>
                      <Link to={blogPostPath(post.slug)}>{post.title}</Link>
                    </h2>
                    <p className="excerpt">{post.excerpt}</p>
                    <div className="tags">
                      {(post.tags || []).map(t => (
                        <Link key={t} to={blogTagPath(t)} className="pill">
                          {t}
                        </Link>
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
                  <Link to={blogPostPath(post.slug)} aria-label={post.title}>
                    <img src={post.coverUrl} alt={post.title} loading="lazy" />
                  </Link>
                )}
                <div className="card-body">
                  <div className="meta">
                    <span>{formatDate(post.publishedAt)}</span>
                    {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                  </div>
                  <h3>
                    <Link to={blogPostPath(post.slug)}>{post.title}</Link>
                  </h3>
                  <p className="excerpt">{post.excerpt}</p>
                  <div className="tags">
                    {(post.tags || []).map(t => (
                      <Link key={t} to={blogTagPath(t)} className="pill">
                        {t}
                      </Link>
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
