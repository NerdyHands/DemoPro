import {useState, useRef, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import SEOHead from '../components/SEO';
import QuoteForm from '../components/QuoteForm';

const JunkRemoval = () => {
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

  const JunkFeatureIcon = ({type}: {type: string}) => {
    switch (type) {
      case 'sameDay':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Clock */}
            <circle cx="32" cy="32" r="18" stroke="white" strokeWidth="2" />
            <line
              x1="32"
              y1="32"
              x2="32"
              y2="20"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="32"
              y1="32"
              x2="42"
              y2="32"
              stroke="white"
              strokeWidth="2"
            />
            {/* Speed lines */}
            <path d="M8 26H16" stroke="white" strokeWidth="2" />
            <path d="M6 32H14" stroke="white" strokeWidth="2" />
            <path d="M8 38H16" stroke="white" strokeWidth="2" />
          </svg>
        );

      case 'eco':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Leaf */}
            <path
              d="M32 12C18 12 14 30 14 30C14 30 18 52 32 52C46 52 50 30 50 30C50 30 46 12 32 12Z"
              stroke="white"
              strokeWidth="2"
            />
            <path d="M32 20V44" stroke="white" strokeWidth="2" />
            <path d="M24 30L32 34L40 30" stroke="white" strokeWidth="2" />
          </svg>
        );

      case 'full':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Arm */}
            <path
              d="M22 26C22 22 26 18 30 18C34 18 36 22 36 26V34"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M36 34L44 36V42C44 44 42 46 40 46H30C26 46 22 42 22 38Z"
              stroke="white"
              strokeWidth="2"
            />
            {/* Dumbbell line */}
            <line
              x1="18"
              y1="26"
              x2="22"
              y2="26"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEOHead
        title="Junk Removal Services in Hampton Roads, VA"
        description="Fast, affordable junk removal services in Hampton Roads, VA. Same-day service for homes and businesses. Call for a free quote today."
        canonicalUrl="https://mrdemopro.com/services/junk-removal"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Junk Removal Services',
            serviceType: 'Junk Removal',
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
            url: 'https://mrdemopro.com/services/junk-removal'
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
          <meta itemProp="serviceType" content="Junk Removal" />
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
                  remove unwanted items from your home, business, or property
                  and dispose of them responsibly.
                </motion.p>
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.5, duration: 0.6}}
                  className="hero-cta-group"
                >
                  <Button
                    size="lg"
                    aria-label="Get a free junk removal quote in Hampton Roads"
                    className="customButton large hero-cta"
                    onClick={() => setShowForm(!showForm)}
                  >
                    Get Free Quote
                  </Button>
                  <a
                    href="tel:757-848-4559"
                    aria-label="Call for junk removal services"
                    className="cta-button  hero-badge hero-cta"
                  >
                    Call (757) 848 4559
                  </a>
                </motion.div>
              </Col>
              <Col lg={6} md={12}>
                {showForm ? (
                  <div ref={formRef} className="quote-form-wrapper ">
                    <QuoteForm serviceType="Junk Removal" inline={true} />
                  </div>
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
                  Why Choose Our Junk Removal Service?
                </motion.h2>
              </Col>
            </Row>

            <Row>
              {[
                {
                  key: 'sameDay',
                  title: 'Same-Day Service',
                  desc: "Book today and we'll haul away your junk the same day. Fast turnaround times without compromising quality service.",
                  delay: 0.2
                },
                {
                  key: 'eco',
                  title: 'Eco-Friendly Disposal',
                  desc: "We recycle and donate items whenever possible, ensuring responsible disposal that's good for the environment.",
                  delay: 0.4
                },
                {
                  key: 'full',
                  title: 'Full-Service Solution',
                  desc: "From lifting heavy items to hauling away debris, we handle everything so you don't have to lift a finger.",
                  delay: 0.6
                }
              ].map((item, idx) => (
                <Col key={idx} lg={4} md={6} sm={6} xs={12} className="mb-5">
                  <motion.div
                    className="feature-item h-100 p-4"
                    initial={{opacity: 0, y: 50}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{delay: item.delay, duration: 0.5}}
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
                          backgroundColor: '#f97316',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <JunkFeatureIcon type={item.key} />
                      </div>
                    </div>

                    <h3
                      style={{
                        color: '#000000',
                        textAlign: 'center',
                        marginBottom: '20px'
                      }}
                    >
                      {item.title}
                    </h3>

                    <p style={{textAlign: 'center', flexGrow: 1}}>
                      {item.desc}
                    </p>
                  </motion.div>
                </Col>
              ))}
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
                  <div className="mb-3 text-center">
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
                    Couches, chairs, tables, mattresses, dressers, and other
                    large furniture items.
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
                    Refrigerators, washers, dryers, ovens, dishwashers, and
                    other household appliances.
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
                    <p className="mb-0">Junk removal services</p>
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
                    opacity: 0.9,
                    color: '#ffffff'
                  }}
                >
                  Get your free quote today and enjoy a clutter-free space!
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
                    aria-label="Get free junk removal quote in Hampton Roads"
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
                    aria-label="Call for junk removal services"
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
    </>
  );
};

export default JunkRemoval;
