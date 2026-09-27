import type {CSSProperties} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {trackPhoneClick} from '../config/gtm';
import {
  HOME_QUOTE_LINK,
  HOME_SECTION_LINKS,
  LEGAL_LINKS
} from '../config/siteStructure';

const headingStyle: CSSProperties = {
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '1.25rem',
  marginBottom: '1rem',
  borderBottom: '2px solid #ffffff',
  paddingBottom: '0.5rem',
  display: 'inline-block'
};

const linkStyle: CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  fontSize: '0.95rem',
  fontWeight: 500
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const socialStyle: CSSProperties = {
  color: '#ffffff',
  backgroundColor: 'transparent',
  border: '2px solid #ffffff',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  fontSize: '1rem'
};

const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

const FooterLink = ({to, label}: {to: string; label: string}) => (
  <li style={{marginBottom: '0.5rem'}}>
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={e => {
        (e.target as HTMLElement).style.color = '#ffd700';
      }}
      onMouseLeave={e => {
        (e.target as HTMLElement).style.color = '#fff';
      }}
    >
      {label}
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer
      style={{
        background: '#252525',
        color: '#fff',
        padding: '40px 0 20px 0',
        marginTop: 'auto'
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col lg={4} md={6} sm={12} className="mb-4 text-center text-lg-start">
            <nav aria-label="Footer navigation">
              <h3 style={headingStyle}>Explore</h3>
              <ul style={listStyle}>
                {[...HOME_SECTION_LINKS, HOME_QUOTE_LINK].map(link => (
                  <FooterLink key={link.path} to={link.path} label={link.label} />
                ))}
              </ul>
            </nav>
          </Col>

          <Col lg={4} md={6} sm={12} className="mb-4 text-center">
            <img
              src="/footer-logo.webp"
              alt="Mr Demo Pro - Professional Demolition Services Logo"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              style={{
                width: '96px',
                height: 'auto',
                maxWidth: '100%',
                marginBottom: '0.75rem'
              }}
            />
            <address
              style={{
                fontStyle: 'normal',
                color: '#ccc',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            >
              <strong style={{color: '#fff'}}>Mr Demo Pro</strong>
              <br />
              Demolition, Junk Removal, and Cleanouts
              <br />
              <a
                href="tel:757-848-4559"
                style={{color: '#ccc'}}
                onClick={() =>
                  trackPhoneClick({
                    cta_location: 'site_footer',
                    cta_label: 'Footer phone'
                  })
                }
              >
                757-848-4559
              </a>
            </address>
            <button
              type="button"
              onClick={scrollTop}
              style={{
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontWeight: 600
              }}
            >
              Back to Top
            </button>
          </Col>

          <Col lg={4} md={12} sm={12} className="mb-4 text-center text-lg-end">
            <h3 style={headingStyle}>Follow Us</h3>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}
              className="justify-content-center justify-content-lg-end"
            >
              <a
                className="social-link"
                href="https://www.facebook.com/mrdemopro"
                aria-label="Follow Mr Demo Pro on Facebook"
                target="_blank"
                rel="noopener noreferrer"
                style={socialStyle}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                className="social-link"
                href="https://www.instagram.com/mrdemopro"
                aria-label="Follow Mr Demo Pro on Instagram"
                target="_blank"
                rel="noopener noreferrer"
                style={socialStyle}
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </Col>
        </Row>

        <Row style={{marginTop: '1rem'}}>
          <Col xs={12} style={{textAlign: 'center'}}>
            <div
              style={{
                borderTop: '1px solid #444',
                paddingTop: '1.5rem'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#ccc'
                }}
              >
                &copy; <span>{new Date().getFullYear()}</span> Mr Demo Pro. All
                Rights Reserved.
              </p>
              <p style={{margin: '0.5rem 0 0', fontSize: '0.8rem'}}>
                {LEGAL_LINKS.map((link, index) => (
                  <span key={link.path}>
                    {index > 0 && <span style={{color: '#666'}}> | </span>}
                    <Link to={link.path} style={{color: '#aaa'}}>
                      {link.label}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
