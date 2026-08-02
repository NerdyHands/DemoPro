const SITE_ORIGIN = 'https://mrdemopro.com';

export const blogIndexPath = () => '/blog/';

export const blogPostPath = (slug: string) =>
  `/blog/${encodeURIComponent(slug)}/`;

export const blogTagPath = (tag: string) =>
  `/blog/tag/${encodeURIComponent(tag)}/`;

export const blogPostCanonical = (slug: string) =>
  `${SITE_ORIGIN}${blogPostPath(slug)}`;

export const blogTagCanonical = (tag: string) =>
  `${SITE_ORIGIN}${blogTagPath(tag)}`;
