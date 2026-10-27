import {Link} from 'react-router-dom';
import {Container} from 'react-bootstrap';
import SEO from './SEO';

type NotFoundPageProps = {
  /** Optional context for soft 404s (e.g. missing blog slug). */
  detail?: string;
};

/**
 * Shared 404 UI + metadata. Intentionally omits canonical/og:url so crawlers
 * do not inherit homepage identity when hosting returns a soft error shell.
 */
const NotFoundPage = ({detail}: NotFoundPageProps) => {
  return (
    <>
      <SEO
        title="404 - Page Not Found | Mr Demo Pro"
        description="The page you're looking for doesn't exist. Explore our demolition services or contact us for assistance."
        keywords="404, page not found, demolition services, Mr Demo Pro"
        noIndex={true}
      />
      <div
        style={{
          paddingTop: '100px',
          minHeight: '50vh',
          textAlign: 'center'
        }}
      >
        <Container>
          <h1
            style={{
              color: 'var(--color-primary)',
              marginBottom: '1rem'
            }}
          >
            404 - Page Not Found
          </h1>
          <p style={{fontSize: '1.2rem', marginBottom: '1rem'}}>
            {detail || "The page you're looking for doesn't exist."}
          </p>
          <div>
            <Link to="/" className="btn btn-primary me-3">
              Go Home
            </Link>
            <Link to="/blog/" className="btn btn-outline-primary me-3">
              View Blog
            </Link>
            <Link to="/services/" className="btn btn-outline-primary">
              View Services
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
};

export default NotFoundPage;
