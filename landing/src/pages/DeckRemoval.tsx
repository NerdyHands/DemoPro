import {useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const DeckRemoval = () => {
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
        <meta itemProp="provider" content="MrDemoPro" />
        <meta itemProp="serviceType" content="Deck Removal" />

        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h1
                itemProp="name"
                className="title-small fw-bold"
                initial={{opacity: 0, x: -50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Professional Deck Removal Services
              </motion.h1>
              <motion.p
                className="lead"
                itemProp="description"
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
                Upgrade your outdoor space with our professional deck removal
                services. We safely dismantle and remove old or unwanted decks,
                leaving your property clean and ready for new outdoor projects.
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Button
                  size="lg"
                  className="customButton large"
                  aria-label="Get a free deck removal quote in Hampton Roads"
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
                <a href="tel:757-848-4559"
                  aria-label="Call for Deck removal services"
                >
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
                <QuoteForm serviceType="Deck Removal" inline={true} />
              ) : (
                <motion.img
                  className="img-fluid rounded"
                  src="/assets/Icons/deck-removal.webp"
                  alt="Professional deck removal services in Hampton Roads"
                  loading="lazy"
                  width="400"
                  height="400"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
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
      <section
        style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}
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
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Why Choose Our Deck Removal Service?
              </motion.h2>
            </Col>
          </Row>

          <Row>
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
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
                  <div
                    style={{
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
                    }}
                  >
                    🔧
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Expert Dismantling
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  Our skilled team carefully dismantles your deck piece by
                  piece, ensuring no damage to your property or surrounding
                  structures.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
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
                  <div
                    style={{
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
                    }}
                  >
                    🚛
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Complete Removal
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  We remove all deck materials, including posts, beams, and
                  hardware, leaving your yard completely clear and ready for new
                  projects.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 50}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
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
                  <div
                    style={{
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
                    }}
                  >
                    🧹
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Thorough Cleanup
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  After removal, we thoroughly clean the area, removing all
                  debris, nails, and materials to ensure your property is
                  spotless.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Section */}
      <section style={{padding: '80px 0'}}>
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
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Our Deck Removal Process
              </motion.h2>
            </Col>
          </Row>

          <Row>
            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="text-center"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
              >
                <div
                  itemProp="step"
                  itemScope
                  itemType="https://schema.org/HowToStep"
                  style={{
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
                  }}
                >
                  1
                </div>
                <h4
                  itemProp="name"
                  style={{
                    color: 'var(--color-text-primary)',
                    marginBottom: '15px'
                  }}
                >
                  Inspection
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We inspect your deck to assess its condition and plan the
                  safest removal approach.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="text-center"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
              >
                <div
                  itemProp="step"
                  itemScope
                  itemType="https://schema.org/HowToStep"
                  style={{
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
                  }}
                >
                  2
                </div>
                <h4
                  itemProp="name"
                  style={{
                    color: 'var(--color-text-primary)',
                    marginBottom: '15px'
                  }}
                >
                  Dismantling
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We carefully dismantle the deck, removing boards, railings,
                  and structural elements.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="text-center"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
              >
                <div
                  itemProp="step"
                  itemScope
                  itemType="https://schema.org/HowToStep"
                  style={{
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
                  }}
                >
                  3
                </div>
                <h4
                  itemProp="name"
                  style={{
                    color: 'var(--color-text-primary)',
                    marginBottom: '15px'
                  }}
                >
                  Foundation Removal
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We remove posts, footings, and any remaining structural
                  elements from the ground.
                </p>
              </motion.div>
            </Col>

            <Col lg={3} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="text-center"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.5}}
              >
                <div
                  itemProp="step"
                  itemScope
                  itemType="https://schema.org/HowToStep"
                  style={{
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
                  }}
                >
                  4
                </div>
                <h4
                  itemProp="name"
                  style={{
                    color: 'var(--color-text-primary)',
                    marginBottom: '15px'
                  }}
                >
                  Final Cleanup
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We clean up all debris, fill holes, and ensure your property
                  is ready for new projects.
                </p>
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
        <Container>
          <Row className="text-center">
            <Col xs={12}>
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Ready to Upgrade Your Outdoor Space?
              </motion.h2>
              <motion.p
                className="lead"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: '40px',
                  opacity: 0.9,
                  color: '#fff'
                }}
              >
                Get your free quote today and transform your outdoor area!
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Button
                  size="lg"
                  variant="light"
                  onClick={() => {
                    setShowForm(!showForm);
                    window.scrollTo({top: 0, behavior: 'smooth'});
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

export default DeckRemoval;
