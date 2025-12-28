import {useState, useRef, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import SEOHead from '../components/SEO';
import QuoteForm from '../components/QuoteForm';

const Cleanout = () => {
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
        title="Cleanout Services in Hampton Roads, VA"
        description="Professional cleanout services in Hampton Roads, VA. Estate cleanouts, construction debris removal, and property cleanouts with full cleanup. Get a free quote today."
        canonicalUrl="https://mrdemopro.com/cleanout"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Cleanout Services',
            serviceType: 'Cleanout Services',
            provider: {
              '@type': 'LocalBusiness',
              name: 'Mr Demo Pro',
              telephone: '757-848-4559',
              areaServed: 'Hampton Roads, VA'
            },
            areaServed: [
              'Hampton, VA',
              'Norfolk, VA',
              'Newport News, VA',
              'Yorktown, VA'
            ],
            url: 'https://mrdemopro.com/cleanout'
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
          <meta itemProp="provider" content="MrDemoPro" />
          <meta itemProp="serviceType" content="Cleanout Services" />
          <Container>
            <Row className="align-items-center">
              <Col lg={6} md={12} className="mb-5 mb-lg-0">
                <motion.h1
                  itemProp="name"
                  className="display-4 fw-bold mb-4"
                  initial={{opacity: 0, x: -50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.6}}
                  style={{
                    color: 'var(--color-primary)',
                    marginBottom: '30px',
                    fontSize: 'var(--font-size-4xl)'
                  }}
                >
                  Cleanout Services
                </motion.h1>
                <motion.p
                  itemProp="description"
                  className="lead mb-4"
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
                  Complete property cleanout and debris removal services in
                  Hampton Roads, VA. We handle everything from estate cleanouts
                  to construction debris removal, leaving your property clean
                  and ready.
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
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Get a free cleanout quote in Hampton Roads"
                  >
                    Get Free Quote
                  </Button>
                  <a
                    href="tel:757-848-4559"
                    aria-label="Call for cleanout services in Hampton Roads"
                    className="cta-button  hero-badge hero-cta"
                  >
                    Call (757) 848 4559
                  </a>
                </motion.div>
              </Col>
              <Col lg={6} md={12}>
                {showForm ? (
                  <div ref={formRef} className="quote-form-wrapper ">
                    <QuoteForm serviceType="cleanout" inline={true} />
                  </div>
                ) : (
                  <motion.img
                    src="/assets/Icons/cleanout.webp"
                    className="img-fluid rounded"
                    alt="Professional Cleanout services in Hampton Roads"
                    loading="lazy"
                    width="400"
                    height="400"
                    initial={{opacity: 0, x: 50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.2, duration: 0.6}}
                    style={{
                      width: '302px'
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
                  Cleanout Services We Provide
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
                  <div className="mb-3 d-flex justify-content-center">
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
                        aria-label="Estate cleanout service"
                        style={{color: 'white'}}
                      >
                        <title>Estate cleanout service</title>

                        {/* House */}
                        <path
                          d="M14 30L32 16L50 30V50C50 52 48 54 46 54H18C16 54 14 52 14 50V30Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />

                        {/* Door */}
                        <rect
                          x="28"
                          y="38"
                          width="8"
                          height="16"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Box */}
                        <rect
                          x="38"
                          y="40"
                          width="12"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="38"
                          y1="45"
                          x2="50"
                          y2="45"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Sparkle */}
                        <path
                          d="M18 38L20 42L24 44L20 46L18 50L16 46L12 44L16 42Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  <h4 className="fw-bold mb-3">Estate Cleanout</h4>
                  <p>
                    Comprehensive estate cleanout services for homes, helping
                    families during difficult times with respectful and thorough
                    cleanup.
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
                  <div className="mb-3 d-flex justify-content-center">
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
                        aria-label="Construction cleanout service"
                        style={{color: 'white'}}
                      >
                        <title>Construction cleanout service</title>

                        {/* Debris pile */}
                        <path
                          d="M10 44L18 34L26 40L34 30L42 38L50 28L54 44H10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />

                        {/* Broom handle */}
                        <line
                          x1="48"
                          y1="10"
                          x2="30"
                          y2="32"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Broom head */}
                        <rect
                          x="24"
                          y="32"
                          width="14"
                          height="8"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Dust */}
                        <circle cx="18" cy="48" r="1.5" fill="currentColor" />
                        <circle cx="24" cy="50" r="1.5" fill="currentColor" />
                        <circle cx="30" cy="48" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                  </div>

                  <h4 className="fw-bold mb-3">Construction Cleanout</h4>
                  <p>
                    Post-construction debris removal and cleanup services,
                    ensuring your construction site is clean and safe.
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
                  <div className="mb-3 d-flex justify-content-center">
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
                        aria-label="Property cleanout service"
                        style={{color: 'white'}}
                      >
                        <title>Property cleanout service</title>

                        {/* House */}
                        <path
                          d="M12 30L32 14L52 30V50C52 52 50 54 48 54H16C14 54 12 52 12 50V30Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <rect
                          x="26"
                          y="40"
                          width="12"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Trash bin */}
                        <rect
                          x="38"
                          y="38"
                          width="12"
                          height="16"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="40"
                          y="34"
                          width="8"
                          height="4"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />

                        {/* Sparkle */}
                        <path
                          d="M18 40L20 44L24 46L20 48L18 52L16 48L12 46L16 44Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  <h4 className="fw-bold mb-3">Property Cleanout</h4>
                  <p>
                    Complete property cleanout services for rental properties,
                    foreclosures, and property preparation for sale or
                    renovation.
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
                  Why Choose Mr Demo Pro for Cleanout Services?
                </motion.h2>

                <motion.div
                  initial={{opacity: 0, y: 20}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{delay: 0.3, duration: 0.6}}
                >
                  {[
                    {
                      title: 'Complete Cleanup',
                      desc: 'We handle everything from sorting and removal to final cleanup, leaving your property spotless.'
                    },
                    {
                      title: 'Respectful Service',
                      desc: 'We understand the sensitive nature of cleanout work and provide respectful, professional service.'
                    },
                    {
                      title: 'Proper Disposal',
                      desc: 'All items are properly sorted and disposed of according to local regulations and environmental standards.'
                    },
                    {
                      title: 'Licensed & Insured',
                      desc: 'Fully licensed and insured for your protection and peace of mind.'
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
                  src="/assets/Icons/cleanout.webp"
                  alt="Cleanout process"
                  className="img-fluid rounded"
                  initial={{opacity: 0, x: 50}}
                  whileInView={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
                  style={{}}
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
                  We provide cleanout services throughout the Hampton Roads
                  region
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
                    initial={{opacity: 0, y: 30}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{delay: area.delay, duration: 0.5}}
                  >
                    <div className="mb-2 d-flex justify-content-center">
                      <AreaIcon />
                    </div>
                    <h5 className="fw-bold">{area.name}</h5>
                    <p className="mb-0">Cleanout services</p>
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
              style={{color: '#000000'}}
            >
              Need Professional Cleanout Services?
            </motion.h2>
            <motion.p
              className="lead mb-5"
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
              Get your free estimate today! Call us at 757-848-4559 or request a
              quote online.
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
                onClick={() => setShowForm(!showForm)}
                aria-label="Get free cleanout quote in Hampton Roads"
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
                aria-label="Call for cleanout services"
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

export default Cleanout;
