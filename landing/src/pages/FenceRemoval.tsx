import {useState, useRef, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const FenceRemoval = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);

  useEffect(() => {
    if (showForm && formRef.current) {
      // save current scroll position
      scrollPosRef.current = window.scrollY;
      // scroll to form
      formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else if (!showForm) {
      // scroll back to original position when hiding
      window.scrollTo({top: scrollPosRef.current, behavior: 'smooth'});
    }
  }, [showForm]);

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
        <meta itemProp="serviceType" content="Fence Removal" />

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
                Professional Fence Removal Services
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
                Transform your property with our professional fence removal
                services. We efficiently remove old, damaged, or unwanted
                fences, clearing the way for new installations or open spaces.
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
                className="hero-cta-group"
              >
                <Button
                  size="lg"
                  className="customButton large hero-cta"
                  aria-label="Get a free Fence removal quote in Hampton Roads"
                  onClick={() => setShowForm(!showForm)}
                >
                  Get Free Quote
                </Button>
                <a
                  href="tel:757-848-4559"
                  aria-label="Call for Fence removal services"
                  className="cta-button  hero-badge hero-cta"
                >
                  Call (757) 848 4559
                </a>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              {showForm ? (
                <div ref={formRef} className="quote-form-wrapper ">
                  <QuoteForm serviceType="Shed Removal" inline={true} />
                </div>
              ) : (
                <motion.img
                  src="/assets/Icons/fence-removal.webp"
                  alt="Professional fence removal services in Hampton Roads"
                  loading="lazy"
                  width="400"
                  height="400"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
                  style={{
                    borderRadius: '16px',

                    maxWidth: '302px'
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
                Why Choose Our Fence Removal Service?
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
                  Fast & Efficient
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  Our experienced team works quickly to remove your fence,
                  minimizing disruption to your property and daily routine.
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
                    🛡️
                  </div>
                </div>
                <h3
                  style={{
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  Safe & Professional
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  We use proper safety equipment and techniques to ensure the
                  removal process is safe for our team and your property.
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
                  Complete Cleanup
                </h3>
                <p style={{textAlign: 'center', flexGrow: 1}}>
                  We remove all fence materials, posts, and debris, leaving your
                  property clean and ready for new installations or landscaping.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Section */}
      <section
        itemScope
        itemType="https://schema.org/HowTo"
        style={{padding: '80px 0'}}
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
                Our Fence Removal Process
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
                  Assessment
                </h4>
                <p
                  itemProp="text"
                  style={{color: 'var(--color-text-secondary)'}}
                >
                  We evaluate your fence and property to determine the best
                  removal approach.
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
                  Panel Removal
                </h4>
                <p
                  itemProp="text"
                  style={{color: 'var(--color-text-secondary)'}}
                >
                  We carefully remove fence panels, gates, and hardware from the
                  posts.
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
                  Post Removal
                </h4>
                <p
                  itemProp="text"
                  style={{color: 'var(--color-text-secondary)'}}
                >
                  We remove fence posts and concrete footings from the ground.
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
                <p
                  itemProp="text"
                  style={{color: 'var(--color-text-secondary)'}}
                >
                  We clean up all debris, fill holes, and ensure your property
                  is spotless.
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
                  background:
            'linear-gradient(135deg, rgb(236 64 0 / 52%), rgb(236 64 0 / 77%))',
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
                Ready to Transform Your Property?
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
                Get your free quote today and clear the way for new
                possibilities!
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
                 style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap', // allows wrapping on small screens
                  justifyContent: 'center', // centers horizontally
                  gap: '16px', // spacing between buttons
                  alignItems: 'center' // vertical alignment
                }}
              >
                <Button
                  size="lg"
                  variant="light"
                  aria-label="Get a free fence removal quote in Hampton Roads"
                 onClick={() => setShowForm(!showForm)}
                  style={{
                    padding: '15px 40px',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: '12px',
                    minWidth: '200px' 
                  }}
                >
                  Get Free Quote
                </Button>
                <a
                  href="tel:757-848-4559"
                  aria-label="Call for fence removal services"
                >
           <Button
                    size="lg"
                    variant="outline-light"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      minWidth: '200px',
                      color: '#333',
                      backgroundColor: '#fff'
                    }}
                  >
                    Call 757-848-4559
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
