import {useState, useRef, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';
import PhoneLink from '../components/PhoneLink';
import {useScrollDepth} from '../hooks/useScrollDepth';

const SHED_FAQS = [
  {
    question: 'Do I need a permit to remove a shed?',
    answer:
      'Most small residential sheds in Hampton Roads do not require a demolition permit, but requirements vary by city and county — especially for larger structures or sheds with electrical hookups. We help you understand local rules before work begins.'
  },
  {
    question: 'How much does shed removal cost in Hampton Roads?',
    answer:
      'PLACEHOLDER — confirm with owner before publish: typical shed removal often falls in a $400–$1,500+ range depending on size, materials (wood, metal, or vinyl), access, and disposal needs. We provide a free written quote after reviewing your shed.'
  },
  {
    question: 'Do you remove metal, wood, and plastic sheds?',
    answer:
      'Yes. We dismantle and haul away wood, metal, and vinyl/plastic sheds. Material type affects dismantling approach and disposal, which we factor into your quote.'
  },
  {
    question: 'How long does shed removal take?',
    answer:
      'Most shed removals are completed in a single visit — typically a few hours for standard backyard sheds. Larger or hard-to-access structures may take longer.'
  }
];

const shedFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SHED_FAQS.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer
    }
  }))
};

const ShedRemoval = () => {
  useScrollDepth('service');
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);

  // useEffect(() => {
  //   if (showForm && formRef.current) {
  //     formRef.current.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'start'
  //     });
  //   }
  // }, [showForm]);
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

  // const features = [
  //   {
  //     icon: '⚡',
  //     title: 'Fast & Efficient',
  //     desc: 'Our experienced team works quickly and efficiently to remove your shed in a single visit, minimizing disruption to your daily routine.'
  //   },
  //   {
  //     icon: '🛡️',
  //     title: 'Safe & Professional',
  //     desc: 'We use proper safety equipment and techniques to ensure the removal process is safe for our team and your property.'
  //   },
  //   {
  //     icon: '🧹',
  //     title: 'Complete Cleanup',
  //     desc: "We don't just remove the shed - we clean up all debris and materials, leaving your property spotless and ready for new projects."
  //   }
  // ];

  const features = [
    {
      key: 'fast',
      title: 'Fast & Efficient',
      desc: 'Our experienced team works quickly and efficiently to remove your shed in a single visit, minimizing disruption to your daily routine.'
    },
    {
      key: 'safe',
      title: 'Safe & Professional',
      desc: 'We use proper safety equipment and techniques to ensure the removal process is safe for our team and your property.'
    },
    {
      key: 'clean',
      title: 'Complete Cleanup',
      desc: "We don't just remove the shed — we clean up all debris and materials, leaving your property spotless and ready for new projects."
    }
  ];

  const FeatureIcon = ({type}: {type: string}) => {
    switch (type) {
      case 'fast':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            <path
              d="M12 36L28 12L24 28H40L20 52L24 36H12Z"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );
      case 'safe':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            {/* Shield */}
            <path
              d="M32 10L48 16V28C48 40 38 48 32 52C26 48 16 40 16 28V16Z"
              stroke="white"
              strokeWidth="2"
            />
            {/* Check */}
            <path d="M24 30L30 36L40 26" stroke="white" strokeWidth="2" />
          </svg>
        );

      case 'clean':
        return (
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            <path
              d="M14 40L30 20L36 26L20 46Z"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="38"
              y1="10"
              x2="26"
              y2="22"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="44"
              y1="16"
              x2="32"
              y2="28"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Assessment',
      desc: 'We evaluate your shed and property to determine the best removal approach.'
    },
    {
      number: 2,
      title: 'Preparation',
      desc: 'We secure the area and prepare the necessary equipment for safe removal.'
    },
    {
      number: 3,
      title: 'Removal',
      desc: 'Our team carefully dismantles and removes the shed using professional techniques.'
    },
    {
      number: 4,
      title: 'Cleanup',
      desc: 'We thoroughly clean the area, removing all debris and leaving it spotless.'
    }
  ];

  return (
    <>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(shedFaqJsonLd)}}
        />
        <div itemScope itemType="https://schema.org/Service">
          {/* Hero Section */}
          <section
            aria-labelledby="shed-removal-heading"
            style={{
              padding: '80px 0 60px 0',
              background:
                'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
            }}
          >
            <meta itemProp="areaServed" content="Hampton Roads, VA" />
            <meta itemProp="provider" content="MrDemoPro" />
            <meta itemProp="serviceType" content="Shed Removal" />
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
                    Professional Shed Removal Services in Hampton Roads, VA
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
                    Transform your outdoor space with our professional shed
                    removal services. We safely and efficiently remove unwanted
                    sheds, leaving your property clean and ready for new
                    possibilities.
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
                      aria-label="Get a free shed removal quote in Hampton Roads"
                    >
                      Get Free Quote
                    </Button>

                    <PhoneLink
                      ctaLocation="service_page_hero"
                      clickLocation="cta"
                      serviceName="Shed Removal"
                      ariaLabel="Call for shed removal services in Hampton Roads"
                      className="cta-button hero-badge hero-cta"
                    >
                      Call (757) 848 4559
                    </PhoneLink>
                  </motion.div>
                </Col>
                <Col lg={6} md={12}>
                  {showForm ? (
                    <div ref={formRef} className="quote-form-wrapper ">
                      <QuoteForm serviceType="Shed Removal" inline={true} />
                    </div>
                  ) : (
                    <motion.img
                      className="img-fluid rounded"
                      src="/assets/Icons/shed-removal.webp"
                      alt="Professional Shed Removal Services"
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
                    Why Choose Our Shed Removal Service?
                  </motion.h2>
                </Col>
              </Row>

              <Row>
                {features.map((feature, idx) => (
                  <Col key={idx} lg={4} md={6} sm={6} xs={12} className="mb-5">
                    <motion.div
                      className="feature-item h-100 p-4"
                      initial={{opacity: 0, y: 50}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
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
                          <FeatureIcon type={feature.key} />
                        </div>
                      </div>

                      <h3
                        style={{
                          color: '#000000',
                          textAlign: 'center',
                          marginBottom: '20px'
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{textAlign: 'center', flexGrow: 1}}>
                        {feature.desc}
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
                    Our Shed Removal Process
                  </motion.h2>
                </Col>
              </Row>

              <Row>
                {steps.map((step, idx) => (
                  <Col key={idx} lg={3} md={6} sm={6} xs={12} className="mb-5">
                    <motion.div
                      className="text-center"
                      initial={{opacity: 0, y: 30}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
                    >
                      <div
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
                        {step.number}
                      </div>
                      <div
                        itemProp="step"
                        itemScope
                        itemType="https://schema.org/HowToStep"
                      >
                        <h4
                          style={{
                            color: 'var(--color-text-primary)',
                            marginBottom: '15px'
                          }}
                        >
                          {step.title}
                        </h4>
                        <p style={{color: 'var(--color-text-secondary)'}}>
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>

          {/* Shed Removal Details */}
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
                    Shed Removal Service Details
                  </motion.h2>
                </Col>
              </Row>
              <Row>
                {[
                  {
                    title: 'Shed Demolition & Disposal',
                    desc: 'We dismantle wood, metal, or vinyl sheds and handle debris removal so your property is clean.'
                  },
                  {
                    title: 'Permit & Access Guidance',
                    desc: 'If your shed removal project needs permits or utility checks, we help you understand the requirements.'
                  },
                  {
                    title: 'Site Prep for New Projects',
                    desc: 'After shed demolition, we leave the area level and ready for new landscaping or construction.'
                  }
                ].map((item, idx) => (
                  <Col key={item.title} lg={4} md={6} sm={6} xs={12} className="mb-5">
                    <motion.div
                      className="feature-item h-100 p-4"
                      initial={{opacity: 0, y: 50}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
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
                    Shed Removal Pricing in Hampton Roads
                  </motion.h2>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-md)',
                      lineHeight: 1.65,
                      marginBottom: '16px'
                    }}
                  >
                    PLACEHOLDER — confirm with owner before publish: typical
                    small–medium shed removal often falls in a{' '}
                    <strong>$400–$1,500+</strong> range depending on shed size,
                    materials (wood, metal, or vinyl), yard access, and disposal
                    needs.
                  </p>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-md)',
                      lineHeight: 1.65,
                      marginBottom: 0
                    }}
                  >
                    Every property is different — we provide a free written
                    quote after reviewing your shed. See our{' '}
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
            aria-labelledby="shed-faq-heading"
          >
            <Container>
              <Row className="justify-content-center">
                <Col lg={10}>
                  <motion.h2
                    id="shed-faq-heading"
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
                    Shed Removal FAQs
                  </motion.h2>
                  {SHED_FAQS.map(faq => (
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
                    Ready to Transform Your Space?
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
                    Get your free quote today and reclaim your outdoor space!
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
                      aria-label="Get free shed removal quote in Hampton Roads"
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

                    <PhoneLink
                      ctaLocation="service_page_bottom"
                      clickLocation="cta"
                      serviceName="Shed Removal"
                      ariaLabel="Call for shed removal services"
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
      </main>
    </>
  );
};

export default ShedRemoval;
