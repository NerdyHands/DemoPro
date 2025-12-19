import {useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const JunkRemoval = () => {
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
        <meta itemProp="serviceType" content="JunkRemoval Removal" />
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
                Professional Junk Removal Services
              </motion.h1>
              <motion.p
              itemProp="description"
                className="lead"
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
                Fast, reliable junk removal services in Hampton Roads, VA. We
                remove unwanted items from your home, business, or property and
                dispose of them responsibly.
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Button
                  size="lg"
                  className="customButton large"
                     aria-label="Get a free junk removal quote in Hampton Roads"
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
                 aria-label="Call for junk removal services"
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
                <QuoteForm serviceType="Junk Removal" inline={true} />
              ) : (
                <motion.img
                  className="img-fluid rounded"
                  src="/assets/Icons/trash.webp"
                  alt="Professional junk removal services in Hampton Roads Virginia"
                  width={300}
                  height={300}
                  fetchPriority="high"
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
                Why Choose Our Junk Removal Service?
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
                    ⚡
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Same-Day Service
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  Book today and we'll haul away your junk the same day. Fast
                  turnaround times without compromising quality service.
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
                    🌱
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Eco-Friendly Disposal
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  We recycle and donate items whenever possible, ensuring
                  responsible disposal that's good for the environment.
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
                    💪
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Full-Service Solution
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  From lifting heavy items to hauling away debris, we handle
                  everything so you don't have to lift a finger.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Items We Remove */}
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
                What We Remove
              </motion.h2>
            </Col>
          </Row>

          <Row>
            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center" >
                  <div style={{fontSize: '48px'}}>🛋️</div>
                </div>
                <h4
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}
                >
                  Furniture
                </h4>
                <p
                  style={{
                    textAlign: 'center',
                    flexGrow: 1,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Couches, chairs, tables, mattresses, dressers, and other large
                  furniture items.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center">
                  <div style={{fontSize: '48px'}}>📺</div>
                </div>
                <h4
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}
                >
                  Appliances
                </h4>
                <p
                  style={{
                    textAlign: 'center',
                    flexGrow: 1,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Refrigerators, washers, dryers, ovens, dishwashers, and other
                  household appliances.
                </p>
              </motion.div>
            </Col>

            <Col lg={4} md={6} sm={6} xs={12} className="mb-5">
              <motion.div
                className="feature-item h-100 p-4"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="mb-3 text-center">
                  <div style={{fontSize: '48px'}}>🗑️</div>
                </div>
                <h4
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}
                >
                  General Junk
                </h4>
                <p
                  style={{
                    textAlign: 'center',
                    flexGrow: 1,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Electronics, yard waste, construction debris, and
                  miscellaneous household items.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Section */}
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
                Our Simple Process
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
                  Schedule
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  Call or request a free estimate online at your convenience.
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
                  Quote
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We provide a transparent, upfront quote before we start.
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
                  Remove
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  Our team arrives on time and handles everything
                  professionally.
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
                  Dispose
                </h4>
                <p style={{color: 'var(--color-text-secondary)'}}>
                  We recycle, donate, and dispose of items responsibly.
                </p>
              </motion.div>
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
                We provide professional junk removal services throughout the
                Hampton Roads region
              </motion.p>
            </Col>
          </Row>
          <Row className="text-center">
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.5}}
              >
                <h5 className="fw-bold">Yorktown</h5>
                <p>Junk removal services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.4, duration: 0.5}}
              >
                <h5 className="fw-bold">Norfolk</h5>
                <p>Junk removal services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.6, duration: 0.5}}
              >
                <h5 className="fw-bold">Newport News</h5>
                <p>Junk removal services</p>
              </motion.div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.8, duration: 0.5}}
              >
                <h5 className="fw-bold">Hampton</h5>
                <p>Junk removal services</p>
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
                Ready to Clear Out Your Junk?
              </motion.h2>
              <motion.p
                className="lead"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: '40px',
                  opacity: 0.9
                }}
              >
                Get your free quote today and enjoy a clutter-free space!
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

export default JunkRemoval;
