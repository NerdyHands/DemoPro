import {useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const InteriorDemo = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div itemScope itemType="https://schema.org/Service">
      {/* Hero Section */}
      <section
        style={{
              padding: '80px 0 60px 0',
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
        }}
      >
        <meta itemProp="areaServed" content="Hampton Roads, VA" />
        <meta itemProp="provider" content="Mr Demo Pro" />
        <meta itemProp="serviceType" content="Interior Demolition" />

        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h1
                itemProp="name"
                initial={{opacity: 0, x: -50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Interior Demo Services
              </motion.h1>
              <motion.p
                itemProp="description"
                className="lead mb-4 "
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                    fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px'
                }}
              >
                Professional interior demolition services for renovations and
                remodeling in Hampton Roads, VA. We safely remove walls,
                fixtures, and interior structures to prepare your space for new
                construction.
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.6, duration: 0.6}}
              >
                <a
                  href="tel:757-848-4559"
                  ria-label="Get a free interior demolition quote"
                  className="btn btn-light btn-lg me-3 mb-3"
                  style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)'
                    }}
                >
                  📞 Call 757-848-4559
                </a>
                <Button
                   className="customButton large"
                  size="lg"
                    aria-label="Get a free interior removal quote in Hampton Roads"
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
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              {showForm ? (
                <QuoteForm serviceType="Interior Demo" inline={true} />
              ) : (
                <motion.img
                  src="/assets/Icons/hammer.webp"
                  alt="Interior demolition services in Hampton Roads by Mr Demo Pro"
                  loading="lazy"
                  width="300"
                  height="300"
                  className="img-fluid rounded"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
                  style={{boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}
                />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Overview */}
      <section style={{padding: '80px 0'}}>
        <Container>
          <Row>
            <Col xs={12} className="text-center mb-5">
              <motion.h2
                className="display-5 fw-bold mb-4"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{color: 'var(--color-primary)'}}
              >
                What We Remove
              </motion.h2>
            </Col>
          </Row>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <motion.div
                className="text-center p-4 h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  className="mb-3"
                  itemProp="hasOfferCatalog"
                  itemScope
                  itemType="https://schema.org/OfferCatalog"
                >
                  <img
                    src="/assets/Icons/wall-removal.png"
                    alt="Wall removal service"
                    width="80"
                    height="80"
                  />
                </div>
                <h4 itemProp="itemOffered" className="fw-bold mb-3">
                  Wall Removal
                </h4>
                <p>
                  Safe removal of interior walls, load-bearing and
                  non-load-bearing, with proper structural support.
                </p>
              </motion.div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <motion.div
                className="text-center p-4 h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  className="mb-3"
                  itemProp="hasOfferCatalog"
                  itemScope
                  itemType="https://schema.org/OfferCatalog"
                >
                  <img
                    src="/assets/Icons/fixture-removal.png"
                    alt="Fixture removal service"
                    width="80"
                    height="80"
                  />
                </div>
                <h4 itemProp="itemOffered" className="fw-bold mb-3">
                  Fixture Removal
                </h4>
                <p>
                  Professional removal of light fixtures, ceiling fans, and
                  electrical components.
                </p>
              </motion.div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <motion.div
                className="text-center p-4 h-100"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div
                  className="mb-3"
                  itemProp="hasOfferCatalog"
                  itemScope
                  itemType="https://schema.org/OfferCatalog"
                >
                  <img
                    src="/assets/Icons/flooring-removal.png"
                    alt="Flooring removal service"
                    width="80"
                    height="80"
                  />
                </div>
                <h4 itemProp="itemOffered" className="fw-bold mb-3">
                  Flooring Removal
                </h4>
                <p>
                  Complete removal of old flooring including tile, carpet,
                  hardwood, and laminate.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section
        style={{
          padding: '80px 0',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h2
                className="display-5 fw-bold mb-4"
                initial={{opacity: 0, x: -50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{color: 'var(--color-primary)'}}
              >
                Why Choose Mr Demo Pro for Interior Demo?
              </motion.h2>
              <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
              >
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Licensed & Insured</h5>
                  <p>
                    Fully licensed and insured for your protection and peace of
                    mind.
                  </p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Experienced Team</h5>
                  <p>
                    Years of experience in interior demolition with attention to
                    detail.
                  </p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Safe & Clean</h5>
                  <p>
                    We maintain a clean work environment and follow all safety
                    protocols.
                  </p>
                </div>
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">✅ Free Estimates</h5>
                  <p>
                    No-obligation free estimates for all interior demo projects.
                  </p>
                </div>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              <motion.img
                src="/assets/img/services/interior-demo-process.jpg"
                alt="Interior demolition process"
                className="img-fluid rounded"
                initial={{opacity: 0, x: 50}}
                whileInView={{opacity: 1, x: 0}}
                transition={{delay: 0.2, duration: 0.6}}
                style={{boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Service Areas */}
      <section style={{padding: '80px 0'}}>
        <Container>
          <Row>
            <Col xs={12} className="text-center mb-5">
              <motion.h2
                className="display-5 fw-bold mb-4"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{color: 'var(--color-primary)'}}
              >
                Serving Hampton Roads Area
              </motion.h2>
              <motion.p
                className="lead"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
              >
                We provide interior demolition services throughout the Hampton
                Roads region
              </motion.p>
            </Col>
          </Row>
          <Row className="text-center">
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                itemProp="areaServed"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
              >
                <h5 className="fw-bold">Yorktown</h5>
                <p>Interior demo services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                itemProp="areaServed"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
              >
                <h5 className="fw-bold">Norfolk</h5>
                <p>Interior demo services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                itemProp="areaServed"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
              >
                <h5 className="fw-bold">Newport News</h5>
                <p>Interior demo services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                itemProp="areaServed"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.5}}
              >
                <h5 className="fw-bold">Hampton</h5>
                <p>Interior demo services</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '80px 0',
          backgroundColor: 'var(--color-primary)',
          color: 'white'
        }}
      >
        <Container className="text-center">
          <motion.h2
            className="display-5 fw-bold mb-4"
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            transition={{duration: 0.6}}
          >
            Ready to Start Your Interior Demo Project?
          </motion.h2>
          <motion.p
            className="lead mb-5"
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            transition={{delay: 0.3, duration: 0.6}}
          >
            Get your free estimate today! Call us at 757-848-4559 or request a
            quote online.
          </motion.p>
          <motion.div
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            transition={{delay: 0.6, duration: 0.6}}
          >
            <a
              href="tel:757-848-4559"
              aria-label="Call for interior demolition services in Hampton Roads"
              className="btn btn-light btn-lg me-3 mb-3"
              style={{fontWeight: 'bold'}}
            >
              📞 Call Now: 757-848-4559
            </a>
            <Button
              variant="outline-light"
              ria-label="Get a free interior demolition quote"
              size="lg"
              className="mb-3"
              onClick={() => {
                setShowForm(!showForm);
                window.scrollTo({top: 0, behavior: 'smooth'});
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

export default InteriorDemo;
