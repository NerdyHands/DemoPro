import {useState, useRef, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import SEOHead from '../components/SEO';
import QuoteForm from '../components/QuoteForm';

const InteriorDemo = () => {
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

  const CheckIcon = () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Circle background */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
      />

      {/* Check mark */}
      <path
        d="M7 12.5L10.5 16L17 9"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const AreaIcon = () => (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Orange filled circle */}
      <circle cx="12" cy="12" r="12" fill="var(--color-primary)" />
      {/* White pin */}
      <path
        d="M12 7C9.8 7 8 8.8 8 11c0 2.6 3.2 5.9 3.6 6.3a.5.5 0 0 0 .8 0C12.8 16.9 16 13.6 16 11c0-2.2-1.8-4-4-4z"
        fill="white"
      />
      <circle cx="12" cy="11" r="1.5" fill="white" />
    </svg>
  );

  return (
    <>
      <SEOHead
        title="Interior Demolition Services in Hampton Roads, VA "
        description="Professional interior demolition services in Hampton Roads, VA. Safe wall removal, flooring removal, and fixture demolition for remodeling projects. Get a free estimate today."
        canonicalUrl="https://mrdemopro.com/services/interior-demo/"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Interior Demolition Services',
            serviceType: 'Interior Demolition',
            areaServed: [
              'Hampton, VA',
              'Norfolk, VA',
              'Newport News, VA',
              'Yorktown, VA'
            ],
            provider: {
              '@type': 'LocalBusiness',
              name: 'Mr Demo Pro',
              telephone: '757-848-4559'
            },
            
            url: 'https://mrdemopro.com/services/interior-demo/'
          }
        ]}
      />
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
                  fixtures, and interior structures to prepare your space for
                  new construction.
                </motion.p>
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.6, duration: 0.6}}
                  className="hero-cta-group"
                >
                  <Button
                    size="lg"
                    className="customButton large hero-cta"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Get a free interior removal quote in Hampton Roads"
                  >
                    Get Free Quote
                  </Button>

                  <a
                    href="tel:757-848-4559"
                    aria-label="Get a free interior demolition quote"
                    className="cta-button  hero-badge hero-cta"
                  >
                    Call (757) 848 4559
                  </a>
                </motion.div>
              </Col>
              <Col lg={6} md={12}>
                {showForm ? (
                  <div ref={formRef} className="quote-form-wrapper ">
                    <QuoteForm
                      serviceType="Interior Demolition"
                      inline={true}
                    />
                  </div>
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
                    className="mb-3 d-flex justify-content-center"
                    itemProp="hasOfferCatalog"
                    itemScope
                    itemType="https://schema.org/OfferCatalog"
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgb(236 107 58)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Wall removal service"
                        style={{color: 'white'}}
                      >
                        <title>Wall removal service</title>

                        {/* Wall */}
                        <rect
                          x="14"
                          y="18"
                          width="36"
                          height="28"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Cracks */}
                        <path
                          d="M22 18V28L18 32L24 36V46"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M34 18V26L38 30L32 34V46"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Hammer */}
                        <line
                          x1="44"
                          y1="12"
                          x2="30"
                          y2="26"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="26"
                          y="22"
                          width="10"
                          height="6"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  <h4
                    itemProp="itemOffered"
                    className="fw-bold mb-3 text-center"
                  >
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
                    className="mb-3 d-flex justify-content-center"
                    itemProp="hasOfferCatalog"
                    itemScope
                    itemType="https://schema.org/OfferCatalog"
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgb(236 107 58)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Fixture removal service"
                        style={{color: 'white'}}
                      >
                        <title>Fixture removal service</title>

                        {/* Light fixture */}
                        <rect
                          x="24"
                          y="10"
                          width="16"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="32"
                          y1="20"
                          x2="32"
                          y2="30"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Fixture base */}
                        <rect
                          x="22"
                          y="30"
                          width="20"
                          height="8"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Screw / removal indicator */}
                        <circle
                          cx="32"
                          cy="44"
                          r="6"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="28"
                          y1="44"
                          x2="36"
                          y2="44"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="32"
                          y1="40"
                          x2="32"
                          y2="48"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  <h4
                    itemProp="itemOffered"
                    className="fw-bold mb-3 text-center"
                  >
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
                    className="mb-3 d-flex justify-content-center"
                    itemProp="hasOfferCatalog"
                    itemScope
                    itemType="https://schema.org/OfferCatalog"
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: 'rgb(236 107 58)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Flooring removal service"
                        style={{color: 'white'}}
                      >
                        <title>Flooring removal service</title>

                        {/* Floor planks */}
                        <rect
                          x="10"
                          y="36"
                          width="44"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="10"
                          y="44"
                          width="44"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="10"
                          y="28"
                          width="44"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Crowbar / pry tool */}
                        <path
                          d="M44 12L30 30"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M46 14L32 32"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Lifted plank */}
                        <path
                          d="M14 26L24 20L34 26"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  <h4
                    itemProp="itemOffered"
                    className="fw-bold mb-3 text-center"
                  >
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
                  {[
                    {
                      title: 'Licensed & Insured',
                      desc: 'Fully licensed and insured for your protection and peace of mind.'
                    },
                    {
                      title: 'Experienced Team',
                      desc: 'Years of experience in interior demolition with attention to detail.'
                    },
                    {
                      title: 'Safe & Clean',
                      desc: 'We maintain a clean work environment and follow all safety protocols.'
                    },
                    {
                      title: 'Free Estimates',
                      desc: 'No-obligation free estimates for all interior demo projects.'
                    }
                  ].map((item, idx) => (
                    <div className="mb-4 d-flex align-items-start" key={idx}>
                      <div style={{marginRight: '10px', marginTop: '4px'}}>
                        <CheckIcon />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-2">{item.title}</h5>
                        <p className="mb-0">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </Col>

              <Col lg={6} md={12}>
                <motion.img
                  src="/assets/Icons/hammer.webp"
                  alt="Interior demolition process"
                  className="img-fluid rounded"
                  initial={{opacity: 0, x: 50}}
                  whileInView={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
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
              {[
                {name: 'Yorktown', delay: 0.2},
                {name: 'Norfolk', delay: 0.4},
                {name: 'Newport News', delay: 0.6},
                {name: 'Hampton', delay: 0.8}
              ].map((area, i) => (
                <Col key={i} md={3} sm={6} className="mb-4">
                  <motion.div
                    itemProp="areaServed"
                    initial={{opacity: 0, y: 30}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{delay: area.delay, duration: 0.5}}
                  >
                    <div className="mb-2 d-flex justify-content-center">
                      <AreaIcon />
                    </div>
                    <h5 className="fw-bold">{area.name}</h5>
                    <p className="mb-0">Interior demo services</p>
                  </motion.div>
                </Col>
              ))}
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
          <Container className="text-center">
            <motion.h2
              className="display-5 fw-bold mb-4"
              initial={{opacity: 0}}
              whileInView={{opacity: 1}}
              transition={{duration: 0.6}}
              style={{
                color: '#000000'
              }}
            >
              Ready to Start Your Interior Demo Project?
            </motion.h2>
            <motion.p
              className="lead mb-5"
              style={{
                color: '#ffffff'
              }}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.3, duration: 0.6}}
            >
              Get your free estimate today! Call or request a quote online.
            </motion.p>
            <motion.div
              initial={{opacity: 0}}
              whileInView={{opacity: 1}}
              transition={{delay: 0.6, duration: 0.6}}
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
                onClick={() => setShowForm(!showForm)}
                aria-label="Get a free interior demolition quote"
                style={{
                  padding: '15px 40px',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderRadius: '12px',
                  minWidth: '200px' // ensures button width consistency
                }}
              >
                Get Free Quote
              </Button>

              <a
                href="tel:757-848-4559"
                aria-label="Call for interior demolition services in Hampton Roads"
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
          </Container>
        </section>
      </div>
    </>
  );
};

export default InteriorDemo;
