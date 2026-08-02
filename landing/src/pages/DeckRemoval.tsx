import {useState, useRef, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';
import PhoneLink from '../components/PhoneLink';
import {useScrollDepth} from '../hooks/useScrollDepth';

const DECK_FAQS = [
  {
    question: 'How much does deck removal cost?',
    answer:
      'PLACEHOLDER — confirm with owner before publish: typical deck removal often falls in an $800–$3,000+ range depending on deck size, height, attachment to the house, and disposal needs. We provide a free written quote after reviewing your deck.'
  },
  {
    question: 'Do I need a permit to remove a deck?',
    answer:
      'Most residential deck removals in Hampton Roads do not require a permit, but requirements vary by locality — especially for elevated decks, decks with electrical, or work in historic districts. We help you understand local rules before starting.'
  },
  {
    question: "Can you remove a deck without damaging the house it's attached to?",
    answer:
      'Yes. We carefully detach the deck from the house, protecting siding, brick, and the ledger board area. Our crew uses controlled dismantling to minimize impact on your home’s exterior.'
  },
  {
    question: 'What happens to the deck debris?',
    answer:
      'We haul away all deck boards, framing, posts, and hardware as part of the job. Wood and composite materials are loaded out and disposed of properly — you do not need to coordinate a dumpster or second haul-off crew.'
  }
];

const deckFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: DECK_FAQS.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer
    }
  }))
};

const DeckRemoval = () => {
  useScrollDepth('service');
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

  const DeckFeatureIcon = ({type}: {type: string}) => {
    switch (type) {
      case 'dismantle':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Hammer */}
            <path
              d="M38 10L46 18L42 22L34 14Z"
              stroke="white"
              strokeWidth="2"
            />
            <path d="M34 14L16 32" stroke="white" strokeWidth="3" />
            {/* Wood plank */}
            <rect
              x="10"
              y="36"
              width="30"
              height="8"
              rx="2"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );

      case 'remove':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Truck body */}
            <rect
              x="10"
              y="28"
              width="28"
              height="12"
              rx="2"
              stroke="white"
              strokeWidth="2"
            />
            <path d="M38 30H48L54 36V40H38Z" stroke="white" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="18" cy="42" r="3" stroke="white" strokeWidth="2" />
            <circle cx="40" cy="42" r="3" stroke="white" strokeWidth="2" />
            {/* Debris */}
            <path d="M16 26L20 22L24 26" stroke="white" strokeWidth="2" />
          </svg>
        );

      case 'cleanup':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Broom handle */}
            <path d="M42 10L20 36" stroke="white" strokeWidth="2" />
            {/* Broom head */}
            <rect
              x="16"
              y="36"
              width="14"
              height="8"
              rx="2"
              stroke="white"
              strokeWidth="2"
            />
            {/* Dust */}
            <circle cx="34" cy="46" r="1.5" fill="white" />
            <circle cx="38" cy="48" r="1.5" fill="white" />
            <circle cx="42" cy="46" r="1.5" fill="white" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(deckFaqJsonLd)}}
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
                  Professional Deck Removal Services in Hampton Roads, VA
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
                  services. We safely dismantle and remove old or unwanted
                  decks, leaving your property clean and ready for new outdoor
                  projects.
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
                    aria-label="Get a free deck removal quote in Hampton Roads"
                  >
                    Get Free Quote
                  </Button>

                  <PhoneLink
                    ctaLocation="service_page_hero"
                    clickLocation="cta"
                    serviceName="Deck Removal"
                    ariaLabel="Call for deck removal services"
                    className="cta-button hero-badge hero-cta"
                  >
                    Call (757) 848 4559
                  </PhoneLink>
                </motion.div>
              </Col>
              <Col lg={6} md={12}>
                {showForm ? (
                  <div ref={formRef} className="quote-form-wrapper ">
                    <QuoteForm serviceType="Deck Removal" inline={true} />
                  </div>
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
                  Why Choose Our Deck Removal Service?
                </motion.h2>
              </Col>
            </Row>

            <Row>
              {[
                {
                  key: 'dismantle',
                  title: 'Expert Dismantling',
                  desc: 'Our skilled team carefully dismantles your deck piece by piece, ensuring no damage to your property or surrounding structures.',
                  delay: 0.2
                },
                {
                  key: 'remove',
                  title: 'Complete Removal',
                  desc: 'We remove all deck materials, including posts, beams, and hardware, leaving your yard completely clear and ready for new projects.',
                  delay: 0.4
                },
                {
                  key: 'cleanup',
                  title: 'Thorough Cleanup',
                  desc: 'After removal, we thoroughly clean the area, removing all debris, nails, and materials to ensure your property is spotless.',
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
                          backgroundColor: 'rgb(236 107 58)', // orange
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <DeckFeatureIcon type={item.key} />
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

        {/* Pricing Section */}
        <section style={{padding: '80px 0'}}>
          <Container>
            <Row className="justify-content-center">
              <Col lg={10}>
                <motion.h2
                  className="title-small fw-bold text-center"
                  initial={{opacity: 0}}
                  whileInView={{opacity: 1}}
                  transition={{duration: 0.6}}
                  style={{
                    color: 'var(--color-primary)',
                    marginBottom: '28px',
                    fontSize: 'var(--font-size-3xl)'
                  }}
                >
                  Deck Removal Pricing in Hampton Roads
                </motion.h2>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-md)',
                    lineHeight: 1.65,
                    marginBottom: '16px'
                  }}
                >
                  PLACEHOLDER — confirm with owner before publish: typical deck
                  removal often falls in an <strong>$800–$3,000+</strong> range
                  depending on deck size, height, attachment to the house, and
                  disposal needs.
                </p>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-md)',
                    lineHeight: 1.65,
                    marginBottom: 0
                  }}
                >
                  Every deck is different — we provide a free written quote
                  after reviewing your project. See our{' '}
                  <Link to="/prices/">pricing page</Link> and{' '}
                  <Link to="/demolition-cost-virginia/">
                    demolition cost guide
                  </Link>{' '}
                  for more detail.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* FAQ Section */}
        <section
          style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}
          aria-labelledby="deck-faq-heading"
        >
          <Container>
            <Row className="justify-content-center">
              <Col lg={10}>
                <motion.h2
                  id="deck-faq-heading"
                  className="title-small fw-bold text-center"
                  initial={{opacity: 0}}
                  whileInView={{opacity: 1}}
                  transition={{duration: 0.6}}
                  style={{
                    color: 'var(--color-primary)',
                    marginBottom: '32px',
                    fontSize: 'var(--font-size-3xl)'
                  }}
                >
                  Deck Removal FAQs
                </motion.h2>
                {DECK_FAQS.map(faq => (
                  <div key={faq.question} style={{marginBottom: '28px'}}>
                    <h3
                      style={{
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: '12px'
                      }}
                    >
                      {faq.question}
                    </h3>
                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-md)',
                        lineHeight: 1.65,
                        marginBottom: 0
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                ))}
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
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                >
                  <Button
                    size="lg"
                    variant="light"
                    onClick={() => setShowForm(!showForm)}
                    aria-label="Get free deck removal quote in Hampton Roads"
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
                  <PhoneLink
                    ctaLocation="service_page_bottom"
                    clickLocation="cta"
                    serviceName="Deck Removal"
                    ariaLabel="Call for deck removal services"
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
                  </PhoneLink>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default DeckRemoval;
