import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Blog from './Blog';

// Thin wrapper so /blog/tag/:tag can reuse Blog with query param
const BlogTag: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  // Convert route parameter to query parameter by redirecting
  React.useEffect(() => {
    if (tag) {
      navigate(`/blog?tag=${encodeURIComponent(tag)}`, { replace: true });
    }
  }, [tag, navigate]);

  return <Blog />;
};

export default BlogTag;
