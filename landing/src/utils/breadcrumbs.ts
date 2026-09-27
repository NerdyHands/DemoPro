import {
  CITY_LEAVES,
  findCityLeaf,
  findServiceLeaf,
  HUBS,
  normalizePath,
  SITE_BASE_URL,
  type SiteLink
} from '../config/siteStructure';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

const HOME: BreadcrumbItem = {name: 'Home', path: '/'};

function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path === '/' ? '/' : normalizePath(path);
  return `${SITE_BASE_URL}${normalized === '/' ? '/' : normalized}`;
}

/** Build BreadcrumbList JSON-LD from trail items. */
export function toBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path)
    }))
  };
}

/**
 * Resolve a breadcrumb trail for a pathname.
 * Returns null when no hierarchical trail applies (home, thank-you, etc.).
 */
export function getBreadcrumbsForPath(
  pathname: string,
  options?: {blogPostTitle?: string}
): BreadcrumbItem[] | null {
  const path = normalizePath(pathname);

  if (path === '/') return null;

  const service = findServiceLeaf(path);
  if (service) {
    return [HOME, {name: HUBS.services.label, path: HUBS.services.path}, {name: service.label, path: service.path}];
  }

  const city = findCityLeaf(path);
  if (city) {
    return [
      HOME,
      {name: HUBS.serviceAreas.label, path: HUBS.serviceAreas.path},
      {name: city.label, path: city.path}
    ];
  }

  if (path === HUBS.services.path) {
    return [HOME, {name: HUBS.services.label, path: HUBS.services.path}];
  }

  if (path === HUBS.serviceAreas.path) {
    return [HOME, {name: HUBS.serviceAreas.label, path: HUBS.serviceAreas.path}];
  }

  if (path === HUBS.blog.path) {
    return [HOME, {name: HUBS.blog.label, path: HUBS.blog.path}];
  }

  // /blog/{slug}/ (not /blog/tag/...)
  const blogPostMatch = path.match(/^\/blog\/([^/]+)\/$/);
  if (blogPostMatch && blogPostMatch[1] !== 'tag') {
    const slug = decodeURIComponent(blogPostMatch[1]);
    const title = options?.blogPostTitle || slug.replace(/-/g, ' ');
    return [
      HOME,
      {name: HUBS.blog.label, path: HUBS.blog.path},
      {name: title, path}
    ];
  }

  // /blog/tag/{tag}/
  const blogTagMatch = path.match(/^\/blog\/tag\/([^/]+)\/$/);
  if (blogTagMatch) {
    const tag = decodeURIComponent(blogTagMatch[1]);
    return [
      HOME,
      {name: HUBS.blog.label, path: HUBS.blog.path},
      {name: `Tag: ${tag}`, path}
    ];
  }

  return null;
}

/** City leaves for hubs that need the list without importing locationCluster separately. */
export function getCityLeaves(): SiteLink[] {
  return CITY_LEAVES;
}
