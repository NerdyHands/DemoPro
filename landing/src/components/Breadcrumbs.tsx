import type {CSSProperties} from 'react';
import {Container} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import {
  getBreadcrumbsForPath,
  toBreadcrumbListSchema,
  type BreadcrumbItem
} from '../utils/breadcrumbs';

type BreadcrumbsProps = {
  /** Override auto-resolved trail (e.g. blog post with real title). */
  items?: BreadcrumbItem[] | null;
  /** Used when resolving /blog/{slug}/ without explicit items. */
  blogPostTitle?: string;
  className?: string;
  /** When true, wrap in a Bootstrap Container (global App placement). */
  withContainer?: boolean;
};

const navStyle: CSSProperties = {
  fontSize: '0.875rem',
  marginBottom: '1rem',
  color: 'var(--color-text-secondary, #4a5568)'
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.35rem',
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const linkStyle: CSSProperties = {
  color: 'var(--color-primary, rgb(236, 65, 0))',
  textDecoration: 'none',
  fontWeight: 500
};

const currentStyle: CSSProperties = {
  color: 'var(--color-text-primary, #1a202c)',
  fontWeight: 600
};

const Breadcrumbs = ({
  items,
  blogPostTitle,
  className,
  withContainer = false
}: BreadcrumbsProps) => {
  const location = useLocation();
  const trail =
    items !== undefined
      ? items
      : getBreadcrumbsForPath(location.pathname, {blogPostTitle});

  if (!trail || trail.length < 2) return null;

  const schema = toBreadcrumbListSchema(trail);

  const nav = (
    <nav className={className} aria-label="Breadcrumb" style={navStyle}>
      <ol style={listStyle}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li
              key={`${item.path}-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {index > 0 && (
                <span aria-hidden="true" style={{opacity: 0.5}}>
                  /
                </span>
              )}
              {isLast ? (
                <span style={currentStyle} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  style={linkStyle}
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      {withContainer ? (
        <Container className="pt-3 pb-0">{nav}</Container>
      ) : (
        nav
      )}
    </>
  );
};

export default Breadcrumbs;
