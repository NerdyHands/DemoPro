import type {CSSProperties} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {trackPhoneClick} from '../config/gtm';
import {
  CITY_LEAVES,
  COMPANY_LINKS,
  FOOTER_SERVICE_LINKS,
  HUBS,
  LEGAL_LINKS
} from '../config/siteStructure';

const headingStyle: CSSProperties = {
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '1.1rem',
  marginBottom: '1rem',
  borderBottom: '2px solid #ffffff',
  paddingBottom: '0.5rem',
  display: 'inline-block'
};

const linkStyle: CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  fontSize: '0.9rem'
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

const FooterLink = ({to, label}: {to: string; label: string}) => (
  <li style={{marginBottom: '0.45rem'}}>
    <Link
      to={to}
      onClick={scrollTop}
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
        <Row>
          <Col lg={3} md={6} sm={12} className="mb-4">
            <nav aria-label="Footer services">
              <h3 style={headingStyle}>Services</h3>
              <ul style={listStyle}>
                {FOOTER_SERVICE_LINKS.map(link => (
                  <FooterLink key={link.path} to={link.path} label={link.label} />
                ))}
              </ul>
            </nav>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <nav aria-label="Footer service areas">
              <h3 style={headingStyle}>Service Areas</h3>
              <ul style={listStyle}>
                <FooterLink
                  to={HUBS.serviceAreas.path}
                  label="All Service Areas"
                />
                {CITY_LEAVES.map(city => (
                  <FooterLink
                    key={city.path}
                    to={city.path}
                    label={city.label}
                  />
                ))}
              </ul>
            </nav>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <nav aria-label="Footer company">
              <h3 style={headingStyle}>Company</h3>
              <ul style={listStyle}>
                {COMPANY_LINKS.map(link => (
                  <FooterLink key={link.path} to={link.path} label={link.label} />
                ))}
              </ul>
            </nav>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <nav aria-label="Footer legal">
              <h3 style={headingStyle}>Legal</h3>
              <ul style={listStyle}>
                {LEGAL_LINKS.map(link => (
                  <FooterLink key={link.path} to={link.path} label={link.label} />
                ))}
                <li style={{marginBottom: '0.45rem'}}>
                  <a
                    href="/sitemap.xml"
                    style={linkStyle}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.color = '#ffd700';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.color = '#fff';
                    }}
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </nav>

            <div style={{marginTop: '1.5rem'}}>
              <img
                src="/footer-logo.webp"
                alt="Mr Demo Pro - Professional Demolition Services Logo"
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                style={{
                  width: '96px',
                  height: '96px',
                  maxWidth: '100%',
                  marginBottom: '0.75rem'
                }}
              />
              <address
                style={{
                  fontStyle: 'normal',
                  color: '#ccc',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem'
                }}
              >
                <strong>Mr Demo Pro</strong>
                <br />
                Professional Demolition Services
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
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <a
                  className="social-link"
                  href="https://www.facebook.com/mrdemopro"
                  aria-label="Follow Mr Demo Pro on Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
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
                  }}
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  className="social-link"
                  href="https://www.instagram.com/mrdemopro"
                  aria-label="Follow Mr Demo Pro on Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
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
                  }}
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </Col>
        </Row>

        <Row style={{marginTop: '1.5rem'}}>
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
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
