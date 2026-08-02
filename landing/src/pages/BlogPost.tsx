import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { fetchPost, fetchRelated, sendBlogEvent } from '../api/blog';
import type { PostDetail, PostSummary } from '../api/blog';
import SEO from '../components/SEO';
import {trackEmailClick} from '../config/gtm';
import { blogIndexPath, blogPostCanonical, blogPostPath, blogTagPath } from '../utils/blogPaths';
import './Blog.css';

type TocItem = { id: string; text: string; level: number };

const formatDate = (value?: string) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const enhanceHtmlWithAnchors = (html: string): { html: string; toc: TocItem[] } => {
  if (!html) return { html: '', toc: [] };
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3')) as HTMLHeadingElement[];
  const toc: TocItem[] = [];

  headings.forEach(h => {
    const text = h.textContent || '';
    const id = slugify(text);
    h.id = id;
    const level = Number(h.tagName.replace('H', '')) || 2;
    toc.push({ id, text, level });
  });

  return { html: doc.body.innerHTML, toc };
};

const ShareButtons: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return (
    <div className="share-row" aria-label="Share this post">
      <a
        href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on LinkedIn
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on Facebook
      </a>
    </div>
  );
};

export const BlogPostTrailingRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return <Navigate to={blogIndexPath()} replace />;
  }
  return <Navigate to={blogPostPath(slug)} replace />;
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = React.useState<PostDetail | null>(null);
  const [related, setRelated] = React.useState<PostSummary[]>([]);
  const [html, setHtml] = React.useState('');
  const [toc, setToc] = React.useState<TocItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sentScrollDepth, setSentScrollDepth] = React.useState<number>(0);

  React.useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    fetchPost(slug)
      .then(data => {
        if (!active) return;
        const { html: enhanced, toc: headings } = enhanceHtmlWithAnchors(data.contentHtml || '');
        setPost(data);
        setHtml(enhanced);
        setToc(headings);
        setError(null);
        sendBlogEvent('page_view', slug);
        fetchRelated(slug)
          .then(r => active && setRelated(r.posts || []))
          .catch(() => {});
      })
      .catch(err => {
        if (!active) return;
        setError(err.message || 'Failed to load post');
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug]);

  React.useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const percent = Math.round((doc.scrollTop / total) * 100);
      const milestones = [25, 50, 75, 90];
      const next = milestones.find(m => percent >= m && m > sentScrollDepth);
      if (next && slug) {
        setSentScrollDepth(next);
        sendBlogEvent('scroll_depth', slug, next);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, sentScrollDepth]);

  if (loading) {
    return <div className="blog-state">Loading post…</div>;
  }
  if (error || !post) {
    return <div className="blog-state error">{error || 'Post not found'}</div>;
  }

  const canonical = post.canonicalUrl || blogPostCanonical(post.slug);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : canonical;

  return (
    <div className="blog-post-layout">
      <SEO
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        canonicalUrl={canonical}
        ogImage={post.coverUrl}
        ogType="article"
        structuredData={post.structuredData}
      />

      <article className="blog-article">
        <Link to={blogIndexPath()} className="back-to-blog">
          ← Back to Blog
        </Link>
        <p className="eyebrow">Blog</p>
        <h1>{post.title}</h1>
        <div className="meta">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
        </div>
        {post.coverUrl && (
          <div className="hero-img">
            <img src={post.coverUrl} alt={post.title} loading="lazy" />
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="tags">
            {post.tags.map(t => (
              <Link key={t} to={blogTagPath(t)} className="pill">
                {t}
              </Link>
            ))}
          </div>
        )}

        {toc.length > 0 && (
          <aside className="toc" aria-label="Table of contents">
            <strong>Table of contents</strong>
            <ul>
              {toc.map(item => (
                <li key={item.id} className={`level-${item.level}`}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
          aria-label="Post content"
        />

        <ShareButtons url={shareUrl} title={post.title} />

        <section className="cta">
          <div>
            <h3>Want more insights?</h3>
            <p>Reach out for a consultation or subscribe to our updates.</p>
          </div>
          <div className="cta-actions">
            <Link to="/contact/" className="btn primary">
              Contact us
            </Link>
            <a
              href="mailto:info@mrdemopro.com"
              className="btn ghost"
              onClick={() =>
                trackEmailClick({
                  email_address: 'info@mrdemopro.com',
                  cta_location: 'blog_post_cta',
                  cta_label: 'Email the team',
                  page_type: 'blog'
                })
              }
            >
              Email the team
            </a>
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="related">
          <h2>Related posts</h2>
          <div className="grid">
            {related.map(r => (
              <article key={r.slug} className="card">
                {r.coverUrl && (
                  <Link to={blogPostPath(r.slug)} aria-label={r.title}>
                    <img src={r.coverUrl} alt={r.title} loading="lazy" />
                  </Link>
                )}
                <div className="card-body">
                  <div className="meta">
                    <span>{formatDate(r.publishedAt)}</span>
                    {r.readingTime ? <span>{r.readingTime} min read</span> : null}
                  </div>
                  <h3>
                    <Link to={blogPostPath(r.slug)}>{r.title}</Link>
                  </h3>
                  <p className="excerpt">{r.excerpt}</p>
                  <div className="tags">
                    {(r.tags || []).map(t => (
                      <Link key={t} to={blogTagPath(t)} className="pill">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
