import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackFormSubmission } from '../config/gtm';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScrollToLearnMore = () => {
    const element = document.getElementById('scroll-learn-more');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const scriptURL = "https://script.google.com/macros/s/AKfycbwxdfDsv0GMztRmpg6r0Jmocw9MuHelOfZFImoXtxtE5kHbCcWhVmX_Ue3eWokw5WZdAA/exec";
      
      const formDataToSend = new FormData();
      formDataToSend.append('address', formData.address);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('form_type', 'quote_request');

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Track successful form submission
        trackFormSubmission('quote_request', {
          address: formData.address,
          contact: formData.contact
        });
        navigate('/thank-you');
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting your request. Please try again or call us at 757-848-4559.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
            {/* Hero Area Section - Two Block Layout */}
      <section 
        id="hero-area" 
        style={{
          backgroundImage: 'url("/assets/img/backgrounds/steptodown.com779769.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '100px',
          paddingBottom: '60px',
          position: 'relative'
        }}
      >
        {/* Background Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))',
          zIndex: 1
        }} />
        
        <div className="hero-inner" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
          <Container>
            <Row className="align-items-center">
              {/* Left Content Block - Company Information */}
              <Col lg={7} md={12} className="mb-4 mb-lg-0">
                <motion.div 
                  className="hero-left-block"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '16px',
                    padding: '60px 40px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 
                    className="hero-main-title text-white" 
                    style={{ 
                      marginBottom: '20px',
                      fontSize: '4rem',
                      fontWeight: '700',
                      lineHeight: '1.1',
                      fontFamily: 'var(--font-family-secondary)',
                      letterSpacing: '-0.025em'
                    }}
                  >
                    Mr Demo Pro
                  </h1>
                  
                  <div style={{ marginBottom: '30px' }}>
                    <img 
                      src="/main-logo.png" 
                      alt="mrdemopro main logo" 
                      style={{ 
                        maxHeight: '120px',
                        width: 'auto'
                      }} 
                    />
                  </div>
                  
                  <h2 
                    className="hero-subtitle text-white" 
                    style={{
                      marginBottom: '30px',
                      fontSize: '2.2rem',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      fontFamily: 'var(--font-family-secondary)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Your Demolition Experts in Hampton Roads!
                  </h2>

                  <p 
                    className="hero-description text-white" 
                    style={{
                      marginBottom: '40px',
                      fontSize: '1.2rem',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    Professional demolition services in Hampton, Newport News, Yorktown, and Norfolk, VA
                  </p>

                  <div style={{ marginBottom: '40px' }}>
                    <a 
                      href="tel:757-848-4559" 
                      title="Click to call" 
                      className="phone-link text-white text-decoration-none"
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: '700',
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
                        className="phone-icon" 
                        style={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '12px',
                          padding: '10px 14px',
                          display: 'inline-block',
                          fontSize: '1.2rem'
                        }}
                      >
                        📞
                      </span>
                      757-848-4559
                    </a>
                  </div>

                  <Button 
                    variant="link" 
                    className="text-white btn--scroll-to"
                    onClick={handleScrollToLearnMore}
                    style={{
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      fontWeight: '500'
                    }}
                  >
                    Learn more ↓
                  </Button>
                </motion.div>
              </Col>

              {/* Right Content Block - Quote Form */}
              <Col lg={5} md={12}>
                <motion.div 
                  className="hero-right-block"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h3 
                    className="quote-form-title"
                    style={{
                      marginBottom: '15px',
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
                      lineHeight: '1.5'
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
                    
                    <div className="mb-4">
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
        </div>
      </section>

      {/* Services Section - Improved Spacing */}
      <hr id="scroll-learn-more" style={{ borderTop: '0px solid transparent', margin: '0' }} />
      <section id="key-features" style={{ padding: '80px 0 60px 0' }}>
        <Container className="text-center">
          <Row>
            <Col xs={12}>
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ position: 'relative' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/shed-removal.png" 
                    alt="Shed Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Shed Removal</h3>
                <p>
                  Is your shed old and eating up space in your compound?
                  Our shed removal will help you to quickly and
                  efficiently take back that space.
                </p>
                <div className="html_button">
                  <Link to="/shed-removal">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ position: 'relative' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/deck-removal.png" 
                    alt="Deck Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Deck Removal</h3>
                <p>
                  If you want to change your outdoor space around or your
                  deck has become old and unsafe; this can be
                  done through our deck removal service without hassle.
                </p>
                <div className="html_button">
                  <Link to="/deck-removal">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/fence-removal.png" 
                    alt="Fence Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Fence Removal</h3>
                <p>
                  Old fences, damaged or unwanted, can be eyesores. Speedy
                  removal of these barriers can only be provided through our fence removal services.
                </p>
                <div className="html_button">
                  <Link to="/fence-removal">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ position: 'relative' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/hammer.png" 
                    alt="Interior Demo Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Interior Demo</h3>
                <p>
                  Professional interior demolition services for renovations and remodeling.
                  We safely remove walls, fixtures, and interior structures to prepare
                  your space for new construction.
                </p>
                <div className="html_button">
                  <Link to="/interior-demo">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                style={{ position: 'relative' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/trash.png" 
                    alt="Junk Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Junk Removal</h3>
                <p>
                  Fast and reliable junk removal services. We remove unwanted items
                  from your home or business, including furniture, appliances, and general junk.
                </p>
                <div className="html_button">
                  <Link to="/junk-removal">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                style={{ position: 'relative' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/cleanout.png" 
                    alt="Cleanout Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3>Cleanout Services</h3>
                <p>
                  Complete property cleanout and debris removal services. We handle
                  everything from estate cleanouts to construction debris removal,
                  leaving your property clean and ready.
                </p>
                <div className="html_button">
                  <Link to="/cleanout">
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
      <section id="features" style={{ 
        padding: '80px 0',
        backgroundColor: 'var(--color-surface)'
      }}>
        <Container>
          <Row>
            <Col xs={12}>
              <motion.h2 
                className="title-small text-center fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '50px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Why Choose Mr Demo Pro?
              </motion.h2>
            </Col>
            <Col md={12} className="text-center">
              <motion.div 
                className="ratio ratio-16x9"
                style={{ maxWidth: '900px', margin: '0 auto' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <video 
                  className="w-100" 
                  poster="/MrDemoProLogoVideo.jpeg" 
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
      <section id="main-features" style={{ padding: '80px 0' }}>
        <Container>
          <Row className="align-items-center" style={{ marginBottom: '80px' }}>
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Serving Yorktown, Norfolk, Newport News & Hampton
              </motion.h2>
              <motion.h3 
                className="subtitle-small"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)'
                }}
              >
                MrDemoPro is proud to serve the Hampton Roads region including Yorktown, Norfolk, Newport News, 
                Hampton, Virginia Beach, Chesapeake and surrounding areas. Regardless of how large or small your project
                , we are here at your service.
              </motion.h3>
            </Col>
            <Col lg={6} md={12}>
              <motion.img 
                className="img-fluid rounded"
                src="/assets/img/features/hampton-roads.jpg"
                alt="Hampton Roads service area by MrDemoPro"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </Col>
          </Row>

          <Row className="align-items-center" style={{ marginBottom: '80px' }}>
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.img 
                className="img-fluid rounded"
                src="/assets/img/features/get-in-touch.jpg"
                alt="Get in touch with MrDemoPro for free consultation"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </Col>
            <Col lg={6} md={12}>
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Free Estimates – Call 757-848-4559
              </motion.h2>
              <motion.h3 
                className="subtitle-small"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px'
                }}
              >
                Are you ready to start? Reach MrDemoPro on a free consultation and estimate today.
              </motion.h3>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link to="/services">
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
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Our Services Overview
              </motion.h2>
              <motion.h3 
                className="subtitle-small"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)'
                }}
              >
                MrDemoPro offers a wide variety of demolition services to its clients in Hampton Roads, VA. Our team is made
                up of experts who are committed to providing you with quality service throughout the entire process. Here are
                some of the more detailed services we have
              </motion.h3>
            </Col>
            <Col lg={6} md={12}>
              <motion.img 
                className="img-fluid rounded"
                src="/assets/img/features/services-overview.jpg"
                alt="Overview of services by MrDemoPro"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
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
