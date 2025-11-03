import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const Cleanout = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div >
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: 'var(--color-primary)', 
        padding: '80px 0',
        color: 'white'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h1 
                className="display-4 fw-bold mb-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Cleanout Services
              </motion.h1>
              <motion.p 
                className="lead mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Complete property cleanout and debris removal services in Hampton Roads, VA. 
                We handle everything from estate cleanouts to construction debris removal, leaving your property clean and ready.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <a 
                  href="tel:757-848-4559" 
                  className="btn btn-light btn-lg me-3 mb-3"
                  style={{ fontWeight: 'bold' }}
                >
                  📞 Call 757-848-4559
                </a>
                <Button 
                  variant="outline-light"
                  size="lg"
                  className="mb-3"
                  onClick={() => setShowForm(!showForm)}
                >
                  Get Free Quote
                </Button>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              {showForm ? (
                <QuoteForm serviceType="Cleanout" inline={true} />
              ) : (
                <motion.img 
                  src="/assets/img/services/cleanout.jpg"
                  alt="Cleanout services by Mr Demo Pro"
                  className="img-fluid rounded"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Overview */}
      <section style={{ padding: '80px 0' }}>
        <Container>
          <Row>
            <Col xs={12} className="text-center mb-5">
              <motion.h2 
                className="display-5 fw-bold mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ color: 'var(--color-primary)' }}
              >
                Cleanout Services We Provide
              </motion.h2>
            </Col>
          </Row>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <motion.div 
                className="text-center p-4 h-100"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/estate-cleanout.png" 
                    alt="Estate cleanout service"
                    width="80" 
                    height="80" 
                  />
                </div>
                <h4 className="fw-bold mb-3">Estate Cleanout</h4>
                <p>Comprehensive estate cleanout services for homes, helping families during difficult times with respectful and thorough cleanup.</p>
              </motion.div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <motion.div 
                className="text-center p-4 h-100"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/construction-cleanout.png" 
                    alt="Construction cleanout service"
                    width="80" 
                    height="80" 
                  />
                </div>
                <h4 className="fw-bold mb-3">Construction Cleanout</h4>
                <p>Post-construction debris removal and cleanup services, ensuring your construction site is clean and safe.</p>
              </motion.div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <motion.div 
                className="text-center p-4 h-100"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/property-cleanout.png" 
                    alt="Property cleanout service"
                    width="80" 
                    height="80" 
                  />
                </div>
                <h4 className="fw-bold mb-3">Property Cleanout</h4>
                <p>Complete property cleanout services for rental properties, foreclosures, and property preparation for sale or renovation.</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section style={{ 
        padding: '80px 0',
        backgroundColor: 'var(--color-surface)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h2 
                className="display-5 fw-bold mb-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ color: 'var(--color-primary)' }}
              >
                Why Choose Mr Demo Pro for Cleanout Services?
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Complete Cleanup</h5>
                  <p>We handle everything from sorting and removal to final cleanup, leaving your property spotless.</p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Respectful Service</h5>
                  <p>We understand the sensitive nature of cleanout work and provide respectful, professional service.</p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Proper Disposal</h5>
                  <p>All items are properly sorted and disposed of according to local regulations and environmental standards.</p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Licensed & Insured</h5>
                  <p>Fully licensed and insured for your protection and peace of mind.</p>
                </div>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              <motion.img 
                src="/assets/img/services/cleanout-process.jpg"
                alt="Cleanout process"
                className="img-fluid rounded"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Service Areas */}
      <section style={{ padding: '80px 0' }}>
        <Container>
          <Row>
            <Col xs={12} className="text-center mb-5">
              <motion.h2 
                className="display-5 fw-bold mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ color: 'var(--color-primary)' }}
              >
                Serving Hampton Roads Area
              </motion.h2>
              <motion.p 
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                We provide cleanout services throughout the Hampton Roads region
              </motion.p>
            </Col>
          </Row>
          <Row className="text-center">
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h5 className="fw-bold">Yorktown</h5>
                <p>Cleanout services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h5 className="fw-bold">Norfolk</h5>
                <p>Cleanout services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h5 className="fw-bold">Newport News</h5>
                <p>Cleanout services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <h5 className="fw-bold">Hampton</h5>
                <p>Cleanout services</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '80px 0',
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      }}>
        <Container className="text-center">
          <motion.h2 
            className="display-5 fw-bold mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Need Professional Cleanout Services?
          </motion.h2>
          <motion.p 
            className="lead mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Get your free estimate today! Call us at 757-848-4559 or request a quote online.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <a 
              href="tel:757-848-4559" 
              className="btn btn-light btn-lg me-3 mb-3"
              style={{ fontWeight: 'bold' }}
            >
              📞 Call Now: 757-848-4559
            </a>
            <Button 
              variant="outline-light"
              size="lg"
              className="mb-3"
              onClick={() => {
                setShowForm(!showForm);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Get Free Quote
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Cleanout;
