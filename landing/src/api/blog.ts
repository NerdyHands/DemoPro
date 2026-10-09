export type PostSummary = {
  title: string;
  slug: string;
  excerpt: string;
  coverUrl?: string;
  publishedAt?: string;
  tags?: string[];
  authors?: string[];
  featured?: boolean;
  readingTime?: number;
  updatedAt?: string;
};

export type PostDetail = PostSummary & {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  contentHtml?: string;
  contentJson?: unknown;
  syncedAt?: string;
  structuredData?: object;
  related?: { posts: PostSummary[] };
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_STATIC_DATA = import.meta.env.VITE_USE_STATIC_BLOG_DATA !== 'false';

/**
 * Fetch static blog JSON from public/blog-data.
 */
async function fetchStaticJson<T>(file: string): Promise<T | null> {
  try {
    const localUrl = `/blog-data/${file}`;
    const res = await fetch(localUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      return res.json() as Promise<T>;
    }
    if (res.status === 404) {
      console.warn(`⚠️  Blog data not found (404) for ${file}`);
    }
    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Failed to load blog data ${file}: ${errorMessage}`);
    return null;
  }
}

/**
 * Legacy API fallback (Mongo/Notion pipeline) if static files are unavailable.
 */
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function matchesTag(post: PostSummary, tag: string) {
  if (!tag) return true;
  const needle = tag.toLowerCase();
  return (post.tags || []).some((t) => t.toLowerCase() === needle);
}

export async function fetchPosts(tag?: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<{ posts: PostSummary[] }>('posts.json');
    if (staticData) {
      if (tag) {
        return {
          posts: staticData.posts.filter((post) => matchesTag(post, tag)),
        };
      }
      return staticData;
    }
    console.warn('⚠️  Static blog data not found, falling back to API');
  }

  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return fetchJson<{ posts: PostSummary[] }>(`/blog${qs}`);
}

export async function fetchPost(slug: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<PostDetail>(`${slug}.json`);
    if (staticData) {
      const { related: _related, ...postData } = staticData;
      return postData as PostDetail;
    }
    console.warn(`⚠️  Static blog post "${slug}" not found, falling back to API`);
  }

  return fetchJson<PostDetail>(`/blog/${encodeURIComponent(slug)}`);
}

export async function fetchRelated(slug: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<{ related?: { posts: PostSummary[] } }>(
      `${slug}.json`
    );
    if (staticData?.related) {
      return staticData.related;
    }
    console.warn(`⚠️  Static related posts for "${slug}" not found, falling back to API`);
  }

  return fetchJson<{ posts: PostSummary[] }>(
    `/blog/${encodeURIComponent(slug)}/related`
  );
}

export async function sendBlogEvent(
  type: 'page_view' | 'scroll_depth' | 'outbound_click',
  slug: string,
  value?: number,
  meta?: Record<string, unknown>
) {
  try {
    await fetch(`${API_BASE}/blog/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, slug, value, meta }),
    });
  } catch {
    // best-effort, swallow errors
  }
}
