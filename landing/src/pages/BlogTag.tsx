import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import Blog from './Blog';
import { blogIndexPath, blogTagCanonical, blogTagPath } from '../utils/blogPaths';

export const BlogTagTrailingRedirect: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  if (!tag) {
    return <Navigate to={blogIndexPath()} replace />;
  }
  return <Navigate to={blogTagPath(tag)} replace />;
};

const BlogTag: React.FC = () => {
  const { tag: rawTag } = useParams<{ tag: string }>();
  const tag = rawTag ? decodeURIComponent(rawTag) : '';

  return (
    <>
      <SEO
        title={tag ? `${tag} | Blog | Mr Demo Pro` : 'Blog Tag | Mr Demo Pro'}
        description={
          tag
            ? `Browse demolition and cleanout posts tagged "${tag}" on the Mr Demo Pro blog.`
            : 'Browse posts by tag on the Mr Demo Pro blog.'
        }
        canonicalUrl={tag ? blogTagCanonical(tag) : 'https://mrdemopro.com/blog/'}
        noIndex={true}
      />
      <Blog activeTag={tag} />
    </>
  );
};

export default BlogTag;
