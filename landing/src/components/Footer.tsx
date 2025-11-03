import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      background: '#252525', 
      color: '#fff',
      padding: '40px 0 20px 0',
      marginTop: 'auto'
    }}>
      <Container>
        <Row className="align-items-center">
          {/* Important Links Section */}
          <Col lg={4} md={6} sm={12} className="mb-4 mb-md-0">
            <div className="footer-section">
              <h3 style={{ 
                color: '#ffffff', 
                fontWeight: '600',
                fontSize: '1.25rem',
                marginBottom: '1rem',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '0.5rem',
                display: 'inline-block'
              }}>
                Important Links
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/services" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Our Services
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/contact" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Contact Us
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/faqs" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    FAQs
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/terms" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Terms and Conditions
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/privacy" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </Col>

          {/* Logo and Back to Top Section */}
          <Col lg={4} md={6} sm={12} className="mb-4 mb-md-0">
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/footer-logo.png" 
                alt="Mr Demo Pro footer logo"
                style={{
                  width: '120px',
                  height: '120px',
                  maxWidth: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  marginBottom: '1rem'
                }}
              />
              <div>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ 
                    fontWeight: '600', 
                    color: '#fff', 
                    textDecoration: 'none',
                    background: 'transparent',
                    border: '2px solid #fff',
                    borderRadius: '25px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = '#fff';
                    (e.target as HTMLElement).style.color = '#252525';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'transparent';
                    (e.target as HTMLElement).style.color = '#fff';
                  }}
                >
                  Back to Top
                </button>
              </div>
            </div>
          </Col>

          {/* Social Media Section */}
          <Col lg={4} md={12} sm={12}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: '#ffffff', 
                fontWeight: '600',
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '0.5rem',
                display: 'inline-block'
              }}>
                Follow Us
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <a 
                  className="social-link" 
                  href="https://facebook.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '1.2rem'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#1877f2';
                    (e.target as HTMLElement).style.borderColor = '#1877f2';
                    (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.borderColor = '#ffffff';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  className="social-link" 
                  href="https://instagram.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '1.2rem'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#e4405f';
                    (e.target as HTMLElement).style.borderColor = '#e4405f';
                    (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.borderColor = '#ffffff';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a 
                  className="social-link" 
                  href="https://www.linkedin.com/company/linkedin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '1.2rem'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#0077b5';
                    (e.target as HTMLElement).style.borderColor = '#0077b5';
                    (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.borderColor = '#ffffff';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Copyright Section */}
        <Row style={{ marginTop: '2rem' }}>
          <Col xs={12} style={{ textAlign: 'center' }}>
            <div style={{ 
              borderTop: '1px solid #444',
              paddingTop: '1.5rem'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: '0.9rem',
                color: '#ccc'
              }}>
                &copy; <span>{new Date().getFullYear()}</span> Mr Demo Pro. All Rights Reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
