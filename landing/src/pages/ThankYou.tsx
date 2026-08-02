import { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackPhoneClick, trackThankYou } from '../config/gtm';

const ThankYou = () => {
  useEffect(() => {
    trackThankYou({
      thank_you_variant: 'standard',
      lead_source: 'form',
      page_path: '/thank-you/'
    });
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-5 shadow rounded"
              style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontSize: '4rem', marginBottom: '20px' }}
              >
                ✅
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                Thank You!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '30px',
                  lineHeight: '1.6'
                }}
              >
                Thank you for your interest in our demolition services! We've received your request and will get back to you within 24 hours with a free, no-obligation quote.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                style={{ marginBottom: '30px' }}
              >
                <h4 style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '15px' }}>
                  What happens next?
                </h4>
                <ul style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <li>We'll review your request and property details</li>
                  <li>Our team will prepare a detailed quote</li>
                  <li>We'll contact you within 24 hours</li>
                  <li>Schedule a convenient time for your project</li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                style={{ marginBottom: '30px' }}
              >
                <h5 style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Need immediate assistance?
                </h5>
                <a 
                  href="tel:757-848-4559"
                  onClick={() =>
                    trackPhoneClick({
                      cta_location: 'thank_you_page',
                      cta_label: 'Call us at 757-848-4559'
                    })
                  }
                  style={{ 
                    color: 'var(--color-primary)', 
                    textDecoration: 'none', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold' 
                  }}
                >
                  📞 Call us at 757-848-4559
                </a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link to="/">
                  <Button
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      padding: '12px 30px',
                      fontSize: '18px',
                      marginRight: '15px'
                    }}
                  >
                    Back to Home
                  </Button>
                </Link>
                <Link to="/services/">
                  <Button
                    variant="outline-primary"
                    style={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      padding: '12px 30px',
                      fontSize: '18px'
                    }}
                  >
                    View Our Services
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ThankYou;
