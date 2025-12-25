import {useState, useRef} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {trackFormSubmission} from '../config/gtm';
import {GOOGLE_APPS_SCRIPT_URL} from '../config/googleAppsScript';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const learnMoreRef = useRef<HTMLHRElement | null>(null);

  const handleScrollToLearnMore = () => {
    const headerOffset = 80;

    if (learnMoreRef.current) {
      const elementPosition = learnMoreRef.current.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scriptURL = GOOGLE_APPS_SCRIPT_URL;

      // Use URLSearchParams to encode form data
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('address', formData.address);
      formDataEncoded.append('contact', formData.contact);
      formDataEncoded.append('form_type', 'quote_request');

      // Submit using fetch with proper encoding
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script web apps handle CORS automatically
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataEncoded.toString(),
      });

      // With no-cors mode, we can't read the response, but the submission should succeed
      // Track successful form submission
      trackFormSubmission('quote_request', {
        address: formData.address,
        contact: formData.contact
      });

      // Navigate to thank you page
      navigate('/thank-you');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(
        'There was an error submitting your request. Please try again or call us at 757-848-4559.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Area Section - Two Block Layout */}
      <section
        id="hero-area"
        role="banner"
        aria-label="Hero section - Mr Demo Pro Demolition Services"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          // minHeight: "90vh",
          display: 'flex',
          alignItems: 'center',
          paddingTop: '1px',
          paddingBottom: '6px',
          padding: 'inherit',
          position: 'relative'
        }}
      >
        {/* Background Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))',
            zIndex: 1
          }}
        />

        <div
          className="hero-inner"
          style={{width: '100%', position: 'relative', zIndex: 2}}
        >
          <Container>
            <Row className="align-items-center">
              {/* Left Content Block - Company Information */}
              {/* <Col
                lg={7}
                md={12}
                style={{
                  padding: '40px 30px',
                  marginTop:"40px",
                  borderRadius: '16px'
                }}
              > */}
              <Col
                lg={7}
                md={12}
                className="mobile-spacing"
                style={{
                  borderRadius: '16px'
                }}
              >
                <motion.div
                  className="hero-left-block"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center'
                  }}
                  initial={{opacity: 0, x: -50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.8}}
                >
                  <h1
                    className="hero-main-title text-white"
                    style={{
                      marginBottom: '15px',
                      fontSize: '2rem',
                      fontWeight: '600',
                      lineHeight: '1.4',
                      fontFamily: 'var(--font-family-secondary)',
                      letterSpacing: '-0.025em'
                    }}
                  >
                    Mr Demo Pro Professional Demolition Services
                  </h1>

                  <div className="mb-3">
                    <img
                      src="/main-logo.webp"
                      alt="Mr Demo Pro logo – Professional Demolition Services"
                      width={240}
                      height={120}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      style={{
                        maxHeight: '120px',
                        width: 'auto'
                      }}
                    />
                  </div>

                  <h2
                    className="hero-subtitle text-white mb-3"
                    style={{
                      // marginBottom: '30px',
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      lineHeight: '1.3',
                      fontFamily: 'var(--font-family-secondary)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Your Demolition Experts in Hampton Roads!
                  </h2>

                  <p
                    className="hero-description text-white mb-4"
                    style={{
                      // marginBottom: '40px',
                      fontSize: '1rem',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    Professional demolition services in Hampton, Newport News,
                    Yorktown, and Norfolk, VA
                  </p>

                  <div className="mb-3">
                    <a
                      href="tel:757-848-4559"
                      title="Call Mr Demo Pro"
                      aria-label="Call Mr Demo Pro at 757-848-4559"
                      className="phone-link text-white text-decoration-none btn btn-primary"
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '18px 30px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-family-primary)',
                        lineHeight: '1.2'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, #ff7b00, #ff4500)',
                          boxShadow: '0 4px 10px rgba(255,120,0,0.4)',
                          padding: '14px'
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.06 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12 1.05.35 2.07.68 3.05a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.98.33 2 .56 3.05.68A2 2 0 0 1 22 16.92z"
                            fill="#fff"
                          />
                        </svg>
                      </span>
                      757-848-4559
                    </a>
                  </div>
                </motion.div>
              </Col>

              {/* Right Content Block - Quote Form */}
              <Col lg={5} md={12}>
                <motion.div
                  className="hero-right-block"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '59px 30px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center'
                  }}
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.8, delay: 0.2}}
                >
                  <h3
                    className="quote-form-title"
                    style={{
                      marginBottom: '14px',
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-primary)',
                      lineHeight: '1.4'
                    }}
                  >
                    Please text or email me a no-obligation demolition quote.
                  </h3>

                  <p
                    className="quote-form-subtitle"
                    style={{
                      marginBottom: '30px',
                      fontSize: '1.1rem',
                      fontWeight: '400',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family-primary)',
                      lineHeight: '1.4'
                    }}
                  >
                    We service Hampton, Newport News, Yorktown, and Norfolk
                  </p>

                  <form className="quote-form" onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Property Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={{
                          padding: '18px',
                          fontSize: '1.1rem',
                          borderRadius: '8px',
                          border: '2px solid var(--color-border)',
                          fontFamily: 'var(--font-family-primary)',
                          fontWeight: '400'
                        }}
                      />
                    </div>

                    <div
                      className="mb-4"
                      style={{
                        paddingBottom: '32px'
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Email or Phone"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        style={{
                          padding: '18px',
                          fontSize: '1.1rem',
                          borderRadius: '8px',
                          border: '2px solid var(--color-border)',
                          fontFamily: 'var(--font-family-primary)',
                          fontWeight: '400'
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isSubmitting}
                      style={{
                        padding: '18px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-primary)',
                        border: 'none',
                        fontFamily: 'var(--font-family-primary)',
                        textTransform: 'none'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
                    </Button>
                  </form>
                </motion.div>
              </Col>
            </Row>
          </Container>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '0.5rem'
            }}
          >
            <Button
              type="button"
              variant="link"
              className="text-white btn--scroll-to"
              onClick={handleScrollToLearnMore}
              style={{
                fontSize: '1rem',
                textDecoration: 'none',
                padding: '4px 6px',
                fontWeight: '500'
              }}
            >
              Learn more ↓
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section - Improved Spacing */}
      <hr
        ref={learnMoreRef}
        style={{borderTop: '0px solid transparent', margin: '0'}}
      />

      <section id="key-features" style={{padding: '80px 0 60px 0'}}>
        <Container className="text-center">
          <Row>
            <Col xs={12}>
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Full-Service Demolition Contractor
              </motion.h2>
            </Col>

            {/* Shed Removal Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
                // style={{ position: "relative" }}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/shed-removal.webp"
                    alt="Shed removal service in Hampton Roads by Mr Demo Pro"
                    width="128"
                    height="128"
                    loading="lazy"
                  />
                </div>
                <h3>Shed Removal Services</h3>
                <p>
                  Is your shed old and eating up space in your compound? Our
                  shed removal will help you to quickly and efficiently take
                  back that space.
                </p>
                <div className="html_button">
                  <Link
                    to="/shed-removal"
                    aria-label="Get a shed removal quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Deck Removal Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
                // style={{ position: "relative" }}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/deck-removal.webp"
                    alt="Deck removal service in Hampton Roads by Mr Demo Pro"
                    width="128"
                    height="128"
                    loading="lazy"
                  />
                </div>
                <h3>Deck Removal Services</h3>
                <p>
                  If you want to change your outdoor space around or your deck
                  has become old and unsafe; this can be done through our deck
                  removal service without hassle.
                </p>
                <div className="html_button">
                  <Link
                    to="/deck-removal"
                    aria-label="Get a deck removal quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Fence Removal Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/fence-removal.webp"
                    alt="Fence removal service in Hampton Roads by Mr Demo Pro"
                    width="128"
                    height="128"
                    loading="lazy"
                  />
                </div>
                <h3>Fence Removal Services</h3>
                <p>
                  Old fences, damaged or unwanted, can be eyesores. Speedy
                  removal of these barriers can only be provided through our
                  fence removal services.
                </p>
                <div className="html_button">
                  <Link
                    to="/fence-removal"
                    aria-label="Get a fence removal quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Interior Demo Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.5}}
                // style={{ position: "relative" }}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/hammer.webp"
                    alt="Interior Demo Service by mrdemopro"
                    width="128"
                    height="128"
                    loading="lazy"
                  />
                </div>
                <h3>Interior Demolition Services</h3>
                <p>
                  Professional interior demolition services for renovations and
                  remodeling. We safely remove walls, fixtures, and interior
                  structures to prepare your space for new construction.
                </p>
                <div className="html_button">
                  <Link
                    to="/interior-demo"
                    aria-label="Get an interior demolition quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Junk Removal Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 1.0, duration: 0.5}}
                // style={{ position: "relative" }}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/trash.webp"
                    alt="Junk removal service in Hampton Roads by Mr Demo Pro"
                    width="128"
                    height="128"
                    loading="lazy"
                  />
                </div>
                <h3>Junk Removal Services</h3>
                <p>
                  Fast and reliable junk removal services. We remove unwanted
                  items from your home or business, including furniture,
                  appliances, and general junk.
                </p>
                <div className="html_button">
                  <Link
                    to="/junk-removal"
                    aria-label="Get a junk removal quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Cleanout Service */}
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 1.2, duration: 0.5}}
                // style={{ position: "relative" }}
              >
                <div className="mb-3">
                  <img
                    src="/assets/Icons/cleanout.webp"
                    alt="Property cleanout service in Hampton Roads by Mr Demo Pro"
                    width="128"
                    height="128"
                  />
                </div>
                <h3>Cleanout Services</h3>
                <p>
                  Complete property cleanout and debris removal services. We
                  handle everything from estate cleanouts to construction debris
                  removal, leaving your property clean and ready.
                </p>
                <div className="html_button">
                  <Link
                    to="/cleanout"
                    aria-label="Get a property cleanout quote in Hampton Roads"
                    onClick={() =>
                      window.scrollTo({top: 0, behavior: 'smooth'})
                    }
                  >
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why Mr Demo Pro Section - Improved Proportions */}
      <section
        id="features"
        style={{
          padding: '80px 0',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <Container>
          <Row>
            <Col xs={12}>
              <motion.h2
                className="title-small text-center fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '50px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Why Choose Mr Demo Pro for Demolition Services?
              </motion.h2>
            </Col>
            <Col md={12} className="text-center">
              <motion.div
                className="ratio ratio-16x9"
                style={{maxWidth: '900px', margin: '0 auto'}}
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
              >
                <video
                  className="w-100"
                  poster="/MrDemoProLogoVideo.webp"
                  preload="none"
                  aria-label="Introduction video about Mr Demo Pro demolition services"
                  controls
                  style={{
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <source src="/assets/img/MrDemoPro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hampton Roads Section - Improved Proportions */}
      <section id="main-features" style={{padding: '80px 0'}}>
        <Container>
          <Row className="align-items-center" style={{marginBottom: '80px'}}>
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0, x: -50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Serving Hampton Roads: Yorktown, Norfolk, Newport News & Hampton
              </motion.h2>
              <motion.h3
                className="subtitle-small"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Mr Demo Pro is proud to provide professional demolition services
                across the Hampton Roads region, including Yorktown, Norfolk,
                Newport News, Hampton, Virginia Beach, and Chesapeake.
              </motion.h3>
            </Col>
            <Col lg={6} md={12}>
              <motion.img
                className="img-fluid rounded"
                src="/assets/img/features/hampton-roads.webp"
                alt="Hampton Roads demolition service area served by Mr Demo Pro"
                loading="lazy"
                initial={{opacity: 0, x: 50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{delay: 0.2, duration: 0.6}}
                style={{
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </Col>
          </Row>

          <Row className="align-items-center" style={{marginBottom: '80px'}}>
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.img
                className="img-fluid rounded"
                src="/assets/img/features/get-in-touch.webp"
                alt="Get in touch with MrDemoPro for free consultation"
                initial={{opacity: 0, x: -50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{delay: 0.2, duration: 0.6}}
                style={{
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </Col>
            <Col lg={6} md={12}>
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0, x: 50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Free Demolition Estimates – Call 757-848-4559
              </motion.h2>
              <motion.h3
                className="subtitle-small"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px'
                }}
              >
                Are you ready to start? Reach MrDemoPro on a free consultation
                and estimate today.
              </motion.h3>
              <motion.div
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Link
                  to="/services"
                  aria-label="View demolition services offered by Mr Demo Pro"
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                >
                  <Button
                    size="lg"
                    className="customButton large"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px'
                    }}
                  >
                    Get Quote
                  </Button>
                </Link>
              </motion.div>
            </Col>
          </Row>

          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0, x: -50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Our Demolition Services Overview
              </motion.h2>
              <motion.h3
                className="subtitle-small"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)'
                }}
              >
                MrDemoPro offers a wide variety of demolition services to its
                clients in Hampton Roads, VA. Our team is made up of experts who
                are committed to providing you with quality service throughout
                the entire process. Below are some of the detailed demolition
                and removal services we provide.
              </motion.h3>
            </Col>
            <Col lg={6} md={12}>
              <motion.img
                className="img-fluid rounded"
                src="/assets/img/features/services-overview.webp"
                alt="Overview of demolition and removal services by Mr Demo Pro"
                initial={{opacity: 0, x: 50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{delay: 0.2, duration: 0.6}}
                style={{
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
