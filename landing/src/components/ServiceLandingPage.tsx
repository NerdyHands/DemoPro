import {useState, useRef, useEffect, type ReactNode} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from './QuoteForm';

interface ServiceLandingPageProps {
  title: string;
  description: string;
  serviceType: string;
  heroImage: {
    src: string;
    alt: string;
    maxWidth?: number;
  };
  benefitsTitle?: string;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  processTitle?: string;
  processSteps: Array<{
    title: string;
    description: string;
  }>;
  serviceIncludesTitle?: string;
  serviceIncludes?: string[];
  ctaTitle?: string;
  ctaDescription?: string;
  children?: ReactNode;
}

const ServiceLandingPage = ({
  title,
  description,
  serviceType,
  heroImage,
  benefitsTitle,
  benefits,
  processTitle,
  processSteps,
  serviceIncludesTitle,
  serviceIncludes,
  ctaTitle,
  ctaDescription,
  children
}: ServiceLandingPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);

  useEffect(() => {
    if (showForm && formRef.current) {
      scrollPosRef.current = window.scrollY;
      formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else if (!showForm) {
      window.scrollTo({top: scrollPosRef.current, behavior: 'smooth'});
    }
  }, [showForm]);

  return (
    <main>
      <div itemScope itemType="https://schema.org/Service">
        {/* Hero Section */}
        <section
          aria-labelledby="service-hero-title"
          style={{
            padding: '80px 0 60px 0',
            background:
              'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
          }}
        >
          <meta itemProp="areaServed" content="Hampton Roads, VA" />
          <meta itemProp="provider" content="Mr Demo Pro" />
          <meta itemProp="serviceType" content={serviceType} />
          <Container>
            <Row className="align-items-center">
              <Col lg={6} md={12} className="mb-5 mb-lg-0">
                <motion.h1
                  id="service-hero-title"
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
                  {title}
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
                  {description}
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
                    aria-label={`Get a free ${serviceType} quote in Hampton Roads`}
                  >
                    Get Free Quote
                  </Button>
                  <a
                    href="tel:757-848-4559"
                    aria-label={`Call for ${serviceType} services in Hampton Roads`}
                    className="cta-button hero-badge hero-cta"
                  >
                    Call (757) 848 4559
                  </a>
                </motion.div>
              </Col>
              <Col lg={6} md={12}>
                {showForm ? (
                  <div ref={formRef} className="quote-form-wrapper">
                    <QuoteForm serviceType={serviceType} inline={true} />
                  </div>
                ) : (
                  <motion.img
                    className="img-fluid rounded"
                    src={heroImage.src}
                    alt={heroImage.alt}
                    initial={{opacity: 0, x: 50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.2, duration: 0.6}}
                    style={{
                      borderRadius: '16px',
                      maxWidth: heroImage.maxWidth || '100%'
                    }}
                  />
                )}
              </Col>
            </Row>
          </Container>
        </section>

        {/* Benefits Section */}
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
                  {benefitsTitle || `Why Choose Mr Demo Pro for ${serviceType}?`}
                </motion.h2>
              </Col>
            </Row>
            <Row>
              {benefits.map((benefit, idx) => (
                <Col key={benefit.title} lg={4} md={6} sm={6} xs={12} className="mb-5">
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
                      {benefit.title}
                    </h3>
                    <p style={{textAlign: 'center', flexGrow: 1}}>
                      {benefit.description}
                    </p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {children}

        {/* Service Includes */}
        {serviceIncludes && serviceIncludes.length > 0 && (
          <section style={{padding: '80px 0'}}>
            <Container>
              <Row className="justify-content-center">
                <Col lg={10}>
                  <motion.h2
                    className="title-small text-center fw-bold"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.6}}
                    style={{
                      color: 'var(--color-primary)',
                      marginBottom: '40px',
                      fontSize: 'var(--font-size-3xl)'
                    }}
                  >
                    {serviceIncludesTitle || `What's Included in ${serviceType}`}
                  </motion.h2>
                  <Row>
                    {serviceIncludes.map(item => (
                      <Col key={item} md={6} className="mb-3">
                        <div
                          style={{
                            padding: '16px 18px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {item}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </Container>
          </section>
        )}

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
                  {processTitle || `Our ${serviceType} Process`}
                </motion.h2>
              </Col>
            </Row>
            <Row>
              {processSteps.map((step, idx) => (
                <Col key={step.title} lg={3} md={6} sm={6} xs={12} className="mb-5">
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
                      {idx + 1}
                    </div>
                    <h4
                      style={{
                        color: 'var(--color-text-primary)',
                        marginBottom: '15px'
                      }}
                    >
                      {step.title}
                    </h4>
                    <p style={{color: 'var(--color-text-secondary)'}}>
                      {step.description}
                    </p>
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
                  {ctaTitle || `Ready to start your ${serviceType} project?`}
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
                  {ctaDescription ||
                    'Get a free quote and see how fast our team can get your site ready.'}
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
                    aria-label={`Get free ${serviceType} quote in Hampton Roads`}
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
                    aria-label={`Call for ${serviceType} services`}
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
    </main>
  );
};

export default ServiceLandingPage;
