import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const FenceRemoval = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '80px 0 60px 0',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h1 
                className="title-small fw-bold"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Professional Fence Removal Services
              </motion.h1>
              <motion.p 
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px'
                }}
              >
                Transform your property with our professional fence removal services. 
                We efficiently remove old, damaged, or unwanted fences, clearing the way 
                for new installations or open spaces.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button 
                  size="lg"
                  className="customButton large"
                  onClick={() => setShowForm(!showForm)}
                  style={{
                    padding: '15px 40px',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: '12px',
                    marginRight: '20px'
                  }}
                >
                  Get Free Quote
                </Button>
                <a href="tel:757-848-4559">
                  <Button 
                    variant="outline-primary"
                    size="lg"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    📞 Call Now
                  </Button>
                </a>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              {showForm ? (
                <QuoteForm serviceType="Fence Removal" inline={true} />
              ) : (
                <motion.img 
                  className="img-fluid rounded"
                  src="/assets/Icons/fence-removal.png"
                  alt="Professional Fence Removal Services"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  style={{
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '400px'
                  }}
                />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Overview */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--color-surface)' }}>
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
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Why Choose Our Fence Removal Service?
              </motion.h2>
            </Col>
          </Row>
          
          <Row>
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    ⚡
                  </div>
                </div>
                <h3 style={{ color: 'var(--color-primary)', textAlign: 'center', marginBottom: '20px' }}>
                  Fast & Efficient
                </h3>
                <p style={{ textAlign: 'center', flexGrow: 1 }}>
                  Our experienced team works quickly to remove your fence, 
                  minimizing disruption to your property and daily routine.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    🛡️
                  </div>
                </div>
                <h3 style={{ color: 'var(--color-primary)', textAlign: 'center', marginBottom: '20px' }}>
                  Safe & Professional
                </h3>
                <p style={{ textAlign: 'center', flexGrow: 1 }}>
                  We use proper safety equipment and techniques to ensure the removal 
                  process is safe for our team and your property.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    🧹
                  </div>
                </div>
                <h3 style={{ color: 'var(--color-primary)', textAlign: 'center', marginBottom: '20px' }}>
                  Complete Cleanup
                </h3>
                <p style={{ textAlign: 'center', flexGrow: 1 }}>
                  We remove all fence materials, posts, and debris, leaving your 
                  property clean and ready for new installations or landscaping.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Section */}
      <section style={{ padding: '80px 0' }}>
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
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Our Fence Removal Process
              </motion.h2>
            </Col>
          </Row>
          
          <Row>
            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
                <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                  Assessment
                </h4>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  We evaluate your fence and property to determine the best removal approach.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
                <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                  Panel Removal
                </h4>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  We carefully remove fence panels, gates, and hardware from the posts.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  3
                </div>
                <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                  Post Removal
                </h4>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  We remove fence posts and concrete footings from the ground.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  4
                </div>
                <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                  Final Cleanup
                </h4>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  We clean up all debris, fill holes, and ensure your property is spotless.
                </p>
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
        <Container>
          <Row className="text-center">
            <Col xs={12}>
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Ready to Transform Your Property?
              </motion.h2>
              <motion.p 
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: '40px',
                  opacity: 0.9
                }}
              >
                Get your free quote today and clear the way for new possibilities!
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button 
                  size="lg"
                  variant="light"
                  onClick={() => {
                    setShowForm(!showForm);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '15px 40px',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: '12px',
                    marginRight: '20px'
                  }}
                >
                  Get Free Quote
                </Button>
                <a href="tel:757-848-4559">
                  <Button 
                    size="lg"
                    variant="outline-light"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px'
                    }}
                  >
                    📞 Call 757-848-4559
                  </Button>
                </a>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default FenceRemoval;
