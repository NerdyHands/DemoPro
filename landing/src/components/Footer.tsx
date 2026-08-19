import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { trackPhoneClick } from "../config/gtm";

const Footer = () => {
  return (
    <footer
      style={{
        background: "#252525",
        color: "#fff",
        padding: "40px 0 20px 0",
        marginTop: "auto",
      }}
    >
      <Container>
        <Row className="align-items-center">
          {/* Important Links Section */}
          <Col lg={4} md={6} sm={12} className="mb-4 mb-md-0">
            <nav
              className="footer-section text-center text-md-start"
              aria-label="Footer navigation"
            >
              <h3
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "1.25rem",
                  marginBottom: "1rem",
                  borderBottom: "2px solid #ffffff",
                  paddingBottom: "0.5rem",
                  display: "inline-block",
                }}
              >
                Important Links
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/services/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Our Services
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/services/house-demolition/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    House Demolition
                  </Link>
                </li>
                {[
                  {
                    to: "/residential-demolition/",
                    label: "Residential Demolition"
                  },
                  {
                    to: "/commercial-demolition/",
                    label: "Commercial Demolition"
                  },
                  {
                    to: "/building-demolition/",
                    label: "Building Demolition"
                  },
                  {
                    to: "/tenant-clean-out/",
                    label: "Tenant Clean-Out"
                  },
                  {
                    to: "/demolition-services/",
                    label: "Demolition Services"
                  },
                  {
                    to: "/concrete-demolition/",
                    label: "Concrete Demolition"
                  },
                  {
                    to: "/diy-vs-pro-demolition/",
                    label: "DIY vs Pro Demolition"
                  }
                ].map(item => (
                  <li key={item.to} style={{ marginBottom: "0.5rem" }}>
                    <Link
                      to={item.to}
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      style={{
                        color: "#fff",
                        textDecoration: "none",
                        transition: "color 0.3s ease",
                        fontSize: "0.95rem",
                      }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = "#ffd700")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = "#fff")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/service-area/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Service areas (Hampton Roads)
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/demolition-contractor-hampton-va/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Demolition Contractor Hampton, VA
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/demolition-contractor-newport-news-va/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Demolition Contractor Newport News, VA
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/demolition-contractor-norfolk-va/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Demolition Contractor Norfolk, VA
                  </Link>
                </li>
                {[
                  {
                    to: '/demolition-contractor-virginia-beach-va/',
                    label: 'Demolition Contractor Virginia Beach, VA'
                  },
                  {
                    to: '/demolition-contractor-chesapeake-va/',
                    label: 'Demolition Contractor Chesapeake, VA'
                  },
                  {
                    to: '/demolition-contractor-portsmouth-va/',
                    label: 'Demolition Contractor Portsmouth, VA'
                  },
                  {
                    to: '/demolition-contractor-suffolk-va/',
                    label: 'Demolition Contractor Suffolk, VA'
                  }
                ].map(item => (
                  <li key={item.to} style={{ marginBottom: "0.5rem" }}>
                    <Link
                      to={item.to}
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      style={{
                        color: "#fff",
                        textDecoration: "none",
                        transition: "color 0.3s ease",
                        fontSize: "0.95rem",
                      }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = "#ffd700")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = "#fff")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/contact/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Contact Us
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/about/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/faqs/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    FAQs
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/blog/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Blog
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/demolition-cost-virginia/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Demolition Cost Guide
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/terms/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Terms and Conditions
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/privacy/"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a
                    href="/sitemap.xml"
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#fff")
                    }
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </nav>
          </Col>

          {/* Logo and Back to Top Section */}
          <Col lg={4} md={6} sm={12} className="mb-4 mb-md-0">
            <div style={{ textAlign: "center" }}>
              <img
                src="/footer-logo.webp"
                alt="Mr Demo Pro - Professional Demolition Services Logo"
                width={120}
                height={120}
                loading="lazy"
                decoding="async"
                style={{
                  width: "120px",
                  height: "120px",
                  maxWidth: "100%",
             
                  marginBottom: "1rem",
                }}
              />

              <address
                style={{
                  fontStyle: "normal",
                  color: "#ccc",
                  fontSize: "0.9rem",
                }}
              >
                <strong>Mr Demo Pro</strong>
                <br />
                Professional Demolition Services
                <br />
               
                <a
                  href="tel:757-848-4559"
                  style={{ color: "#ccc" }}
                  onClick={() =>
                    trackPhoneClick({
                      cta_location: "site_footer",
                      cta_label: "Footer phone"
                    })
                  }
                >
                  757-848-4559
                </a>
              </address>

              <div>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  style={{
                    fontWeight: "600",
                    color: "#fff",
                    textDecoration: "none",
                    background: "transparent",
                    border: "2px solid #fff",
                    borderRadius: "25px",
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = "#fff";
                    (e.target as HTMLElement).style.color = "#252525";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "transparent";
                    (e.target as HTMLElement).style.color = "#fff";
                  }}
                >
                  Back to Top
                </button>
              </div>
            </div>
          </Col>

          {/* Social Media Section */}
          <Col lg={4} md={12} sm={12}>
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "1.25rem",
                  marginBottom: "1.5rem",
                  borderBottom: "2px solid #ffffff",
                  paddingBottom: "0.5rem",
                  display: "inline-block",
                }}
              >
                Follow Us
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  className="social-link"
                  href="https://www.facebook.com/mrdemopro"
                  aria-label="Follow Mr Demo Pro on Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#ffffff",
                    backgroundColor: "transparent",
                    border: "2px solid #ffffff",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "1.2rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = "#1877f2";
                    (e.target as HTMLElement).style.borderColor = "#1877f2";
                    (e.target as HTMLElement).style.transform =
                      "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      "transparent";
                    (e.target as HTMLElement).style.borderColor = "#ffffff";
                    (e.target as HTMLElement).style.transform = "translateY(0)";
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
                    color: "#ffffff",
                    backgroundColor: "transparent",
                    border: "2px solid #ffffff",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "1.2rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = "#e4405f";
                    (e.target as HTMLElement).style.borderColor = "#e4405f";
                    (e.target as HTMLElement).style.transform =
                      "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      "transparent";
                    (e.target as HTMLElement).style.borderColor = "#ffffff";
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Copyright Section */}
        <Row style={{ marginTop: "2rem" }}>
          <Col xs={12} style={{ textAlign: "center" }}>
            <div
              style={{
                borderTop: "1px solid #444",
                paddingTop: "1.5rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "#ccc",
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
