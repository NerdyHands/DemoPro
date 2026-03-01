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
};

export type PostDetail = PostSummary & {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  contentHtml?: string;
  contentJson?: unknown;
  updatedAt?: string;
  syncedAt?: string;
  lastNotionEditedTime?: string;
  structuredData?: object;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_STATIC_DATA = import.meta.env.VITE_USE_STATIC_BLOG_DATA !== 'false'; // Default to true
const S3_BLOG_DATA_BASE = import.meta.env.VITE_S3_BLOG_DATA_BASE || 'https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data';

/**
 * Fetch data from S3 JSON files (generated during sync)
 * Falls back to API if static files are not available
 */
async function fetchStaticJson<T>(file: string): Promise<T | null> {
  try {
    // Try S3 first
    const s3Url = `${S3_BLOG_DATA_BASE}/${file}`;
    const res = await fetch(s3Url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors' // Explicitly request CORS
    });
    
    if (res.ok) {
      return res.json() as Promise<T>;
    }
    
    // Log specific error details
    if (res.status === 403) {
      console.warn(`⚠️  S3 access denied (403) for ${file} - check bucket policy and CORS configuration`);
    } else if (res.status === 404) {
      console.warn(`⚠️  S3 file not found (404) for ${file}`);
    }
    
    // Fallback to local if S3 fails (for development)
    try {
      const localUrl = `/blog-data/${file}`;
      const localRes = await fetch(localUrl);
      if (localRes.ok) {
        console.warn(`⚠️  Using local fallback for ${file} (S3 status: ${res.status})`);
        return localRes.json() as Promise<T>;
      }
    } catch {
      // Ignore fallback errors
    }
    
    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a CORS error
    if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
      console.warn(`⚠️  CORS error accessing S3 for ${file}. Please configure CORS on your S3 bucket.`);
      console.warn(`   See server/S3_SETUP.md for CORS configuration instructions.`);
    }
    
    // Try local fallback on network errors
    try {
      const localUrl = `/blog-data/${file}`;
      const localRes = await fetch(localUrl);
      if (localRes.ok) {
        console.warn(`⚠️  Using local fallback for ${file} (S3 error: ${errorMessage})`);
        return localRes.json() as Promise<T>;
      }
    } catch {
      // Ignore fallback errors
    }
    return null;
  }
}

/**
 * Fallback to API if static files are not available
 */
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPosts(tag?: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<{ posts: PostSummary[] }>('posts.json');
    if (staticData) {
      if (tag) {
        return {
          posts: staticData.posts.filter(post => 
            post.tags && post.tags.includes(tag)
          )
        };
      }
      return staticData;
    }
    // Fall back to API if static file not found
    console.warn('⚠️  Static blog data not found, falling back to API');
  }
  
  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return fetchJson<{ posts: PostSummary[] }>(`/blog${qs}`);
}

export async function fetchPost(slug: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<PostDetail & { related?: { posts: PostSummary[] } }>(`${slug}.json`);
    if (staticData) {
      // Extract related posts from the static file
      const { related, ...postData } = staticData;
      return postData as PostDetail;
    }
    // Fall back to API if static file not found
    console.warn(`⚠️  Static blog post "${slug}" not found, falling back to API`);
  }
  
  return fetchJson<PostDetail>(`/blog/${encodeURIComponent(slug)}`);
}

export async function fetchRelated(slug: string) {
  if (USE_STATIC_DATA) {
    const staticData = await fetchStaticJson<{ related?: { posts: PostSummary[] } }>(`${slug}.json`);
    if (staticData && staticData.related) {
      return staticData.related;
    }
    // Fall back to API if static file not found
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
      body: JSON.stringify({ type, slug, value, meta })
    });
  } catch {
    // best-effort, swallow errors
  }
}
