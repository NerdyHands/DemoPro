import {useEffect, useState} from 'react';
import {Container, Alert} from 'react-bootstrap';
import {useLocation} from 'react-router-dom';
import SEO from '../components/SEO';

const Blog = () => {
  const location = useLocation();
  const [blogPath, setBlogPath] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Extract the blog path from the current location
    // /blog -> '', /blog/post-1 -> /post-1
    const path = location.pathname.replace('/blog', '') || '/';
    setBlogPath(path);
    setLoadError(false);
  }, [location.pathname]);

  // Try http first since blog.mrdemopro.com has SSL issues
  // Note: Modern browsers may block mixed content (http in https page)
  // If that happens, you'll need to set up a server-side proxy
  const blogUrl = `http://blog.mrdemopro.com${blogPath}`;

  return (
    <>
      <SEO
        title="Blog - Demolition Tips & News | Mr Demo Pro"
        description="Read the latest demolition tips, news, and insights from Mr Demo Pro. Expert advice on shed removal, deck removal, and more."
        keywords="demolition blog, demolition tips, shed removal tips, deck removal advice, demolition news"
        canonicalUrl="https://mrdemopro.com/blog/"
      />
      <div style={{paddingTop: '100px', minHeight: '100vh'}}>
        {loadError ? (
          <Container style={{paddingTop: '2rem'}}>
            <Alert variant="warning">
              <Alert.Heading>Unable to Load Blog</Alert.Heading>
              <p>
                There was an issue loading the blog content. This may be due to
                SSL certificate issues on the blog subdomain.
              </p>
              <p>
                Please try accessing the blog directly at:{' '}
                <a href={blogUrl} target="_blank" rel="noopener noreferrer">
                  blog.mrdemopro.com
                </a>
              </p>
            </Alert>
          </Container>
        ) : (
          <Container fluid style={{padding: 0, height: 'calc(100vh - 100px)'}}>
            <iframe
              src={blogUrl}
              title="Mr Demo Pro Blog"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              onError={() => {
                setLoadError(true);
              }}
              onLoad={() => {
                setLoadError(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-top-navigation-by-user-activation"
            />
          </Container>
        )}
      </div>
    </>
  );
};

export default Blog;

