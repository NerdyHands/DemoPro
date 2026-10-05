import {useState, useRef, useEffect, type ReactNode} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Accordion, Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from './QuoteForm';
import {getPageTypeFromPath, trackCtaClick, trackFaqExpand, trackPhoneClick} from '../config/gtm';
import type {PageType} from '../config/analyticsTypes';
import {useScrollDepth} from '../hooks/useScrollDepth';

export interface ServiceLandingFAQItem {
  question: string;
  answer: string;
}

export interface NearbyAreaLink {
  label: string;
  to: string;
}

export interface BeforeAfterExample {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

interface ServiceLandingPageProps {
  title: string;
  tagline?: string;
  description: string;
  serviceType: string;
  /** Used in schema microdata and CTA aria-labels. Defaults to Hampton Roads regional wording. */
  areaServed?: string;
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
  /** Optional section: primary list of demolition scope (SEO depth). */
  whatWeDemolishTitle?: string;
  whatWeDemolishItems?: string[];
  pricingExpectationsTitle?: string;
  pricingExpectationsItems?: string[];
  permitsSafetyTitle?: string;
  permitsSafetyParagraphs?: string[];
  beforeAfterTitle?: string;
  beforeAfterExamples?: BeforeAfterExample[];
  faqs?: ServiceLandingFAQItem[];
  nearbyAreasTitle?: string;
  nearbyAreasIntro?: string;
  nearbyAreasLinks?: NearbyAreaLink[];
  ctaTitle?: string;
  ctaDescription?: string;
  children?: ReactNode;
}

const surfaceSectionStyle = {padding: '80px 0'} as const;
const surfaceBgStyle = {
  ...surfaceSectionStyle,
  backgroundColor: 'var(--color-surface)'
} as const;

const ServiceLandingPage = ({
  title,
  tagline,
  description,
  serviceType,
  areaServed = 'Hampton Roads, VA',
  heroImage,
  benefitsTitle,
  benefits,
  processTitle,
  processSteps,
  serviceIncludesTitle,
  serviceIncludes,
  whatWeDemolishTitle,
  whatWeDemolishItems,
  pricingExpectationsTitle,
  pricingExpectationsItems,
  permitsSafetyTitle,
  permitsSafetyParagraphs,
  beforeAfterTitle,
  beforeAfterExamples,
  faqs,
  nearbyAreasTitle,
  nearbyAreasIntro,
  nearbyAreasLinks,
  ctaTitle,
  ctaDescription,
  children
}: ServiceLandingPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);

  const geoPhrase = areaServed.includes(',')
    ? areaServed.split(',')[0]?.trim() || areaServed
    : areaServed;

  const h1Title =
    /Hampton Roads|, VA|Norfolk|Newport News|Chesapeake|Virginia Beach/i.test(title)
      ? title
      : `${title} in ${areaServed}`;

  const location = useLocation();
  const pageType = getPageTypeFromPath(location.pathname) as PageType;
  useScrollDepth(pageType);

  useEffect(() => {
    if (showForm && formRef.current) {
      scrollPosRef.current = window.scrollY;
      formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else if (!showForm) {
      window.scrollTo({top: scrollPosRef.current, behavior: 'smooth'});
    }
  }, [showForm]);

  const faqJsonLd =
    faqs && faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer
            }
          }))
        }
      : null;

  return (
    <main>
      <div itemScope itemType="https://schema.org/Service">
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd)
            }}
          />
        )}
        {/* Hero Section */}
        <section
          aria-labelledby="service-hero-title"
          style={{
            padding: '80px 0 60px 0',
            background:
              'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
          }}
        >
          <meta itemProp="areaServed" content={areaServed} />
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
                  {h1Title}
                </motion.h1>
                {tagline && (
                  <motion.p
                    className="fw-bold"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2, duration: 0.6}}
                    style={{
                      fontSize: 'var(--font-size-xl)',
                      color: 'var(--color-text-primary)',
                      marginBottom: '20px'
                    }}
                  >
                    {tagline}
                  </motion.p>
                )}
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
                    onClick={() => {
                      trackCtaClick({
                        cta_label: 'Get Free Quote',
                        cta_location: 'service_page_hero',
                        cta_type: 'quote',
                        service_name: serviceType,
                        page_type: pageType
                      });
                      setShowForm(!showForm);
                    }}
                    aria-label={`Get a free ${serviceType} quote in ${geoPhrase}`}
                  >
                    Get Free Quote
                  </Button>
                  <a
                    href="tel:757-848-4559"
                    aria-label={`Call for ${serviceType} services in ${geoPhrase}`}
                    className="cta-button hero-badge hero-cta"
                    onClick={() =>
                      trackPhoneClick({
                        cta_location: 'service_page_hero',
                        cta_label: 'Call (757) 848 4559',
                        service_name: serviceType,
                        page_type: pageType
                      })
                    }
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
        <section style={surfaceBgStyle}>
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

        {/* What we demolish */}
        {whatWeDemolishItems && whatWeDemolishItems.length > 0 && (
          <section style={surfaceSectionStyle}>
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
                    {whatWeDemolishTitle || 'What we demolish'}
                  </motion.h2>
                  <Row>
                    {whatWeDemolishItems.map(item => (
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

        {/* Service Includes */}
        {serviceIncludes && serviceIncludes.length > 0 && (
          <section style={{...surfaceSectionStyle, backgroundColor: 'var(--color-surface)'}}>
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
                            backgroundColor: '#ffffff',
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
        <section style={surfaceSectionStyle}>
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
            <Row className="justify-content-center">
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

        {/* Pricing expectations */}
        {pricingExpectationsItems && pricingExpectationsItems.length > 0 && (
          <section style={surfaceBgStyle}>
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
                    {pricingExpectationsTitle || 'Pricing expectations'}
                  </motion.h2>
                  <ul
                    style={{
                      paddingLeft: '1.25rem',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-md)',
                      lineHeight: 1.65
                    }}
                  >
                    {pricingExpectationsItems.map(line => (
                      <li key={line} style={{marginBottom: '12px'}}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* Permits & safety */}
        {permitsSafetyParagraphs && permitsSafetyParagraphs.length > 0 && (
          <section style={surfaceSectionStyle}>
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
                    {permitsSafetyTitle || 'Permits & safety'}
                  </motion.h2>
                  {permitsSafetyParagraphs.map((p, pi) => (
                    <p
                      key={`permit-${pi}`}
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-md)',
                        lineHeight: 1.65,
                        marginBottom: '16px'
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* Before / after */}
        {beforeAfterExamples && beforeAfterExamples.length > 0 && (
          <section style={surfaceBgStyle}>
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
                      marginBottom: '36px',
                      fontSize: 'var(--font-size-3xl)'
                    }}
                  >
                    {beforeAfterTitle || 'Before & after results'}
                  </motion.h2>
                  <Row>
                    {beforeAfterExamples.map((ex, i) => (
                      <Col key={ex.title ?? i} md={6} className="mb-4">
                        <div
                          style={{
                            height: '100%',
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          {ex.imageSrc && (
                            <img
                              src={ex.imageSrc}
                              alt={ex.imageAlt || ex.title || 'Project example'}
                              className="img-fluid rounded"
                              loading="lazy"
                              style={{maxHeight: '220px', objectFit: 'cover'}}
                            />
                          )}
                          {ex.title && (
                            <h3
                              style={{
                                color: 'var(--color-text-primary)',
                                fontSize: 'var(--font-size-lg)',
                                marginBottom: 0
                              }}
                            >
                              {ex.title}
                            </h3>
                          )}
                          {ex.description && (
                            <p
                              style={{
                                color: 'var(--color-text-secondary)',
                                marginBottom: 0,
                                flexGrow: 1
                              }}
                            >
                              {ex.description}
                            </p>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section style={surfaceSectionStyle} aria-labelledby="service-faq-heading">
            <Container>
              <Row className="justify-content-center">
                <Col lg={10}>
                  <motion.h2
                    id="service-faq-heading"
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
                    Frequently asked questions
                  </motion.h2>
                  <Accordion
                    alwaysOpen
                    onSelect={(eventKey) => {
                      const key = Array.isArray(eventKey)
                        ? eventKey[eventKey.length - 1]
                        : eventKey;
                      if (key == null || !faqs) return;
                      const item = faqs[Number(key)];
                      if (item) {
                        trackFaqExpand({question_text: item.question});
                      }
                    }}
                  >
                    {faqs.map((item, idx) => (
                      <Accordion.Item
                        eventKey={String(idx)}
                        key={`faq-${idx}-${item.question}`}
                        style={{
                          marginBottom: '16px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      >
                        <Accordion.Header>{item.question}</Accordion.Header>
                        <Accordion.Body
                          style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-md)',
                            lineHeight: 1.65
                          }}
                        >
                          {item.answer}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* Nearby areas */}
        {nearbyAreasLinks && nearbyAreasLinks.length > 0 && (
          <section style={{...surfaceBgStyle}}>
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
                      marginBottom: '16px',
                      fontSize: 'var(--font-size-3xl)'
                    }}
                  >
                    {nearbyAreasTitle || 'Areas we serve nearby'}
                  </motion.h2>
                  {nearbyAreasIntro && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '28px',
                        fontSize: 'var(--font-size-lg)'
                      }}
                    >
                      {nearbyAreasIntro}
                    </p>
                  )}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gap: '12px'
                    }}
                  >
                    {nearbyAreasLinks.map(link => (
                      <li
                        key={link.to}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <Link
                          to={link.to}
                          onClick={() =>
                            window.scrollTo({top: 0, behavior: 'smooth'})
                          }
                          style={{
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            fontWeight: 700
                          }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Container>
          </section>
        )}

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
                    onClick={() => {
                      trackCtaClick({
                        cta_label: 'Get Free Quote',
                        cta_location: 'service_page_bottom',
                        cta_type: 'quote',
                        service_name: serviceType,
                        page_type: pageType
                      });
                      setShowForm(!showForm);
                    }}
                    aria-label={`Get free ${serviceType} quote in ${geoPhrase}`}
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
                    onClick={() =>
                      trackPhoneClick({
                        cta_location: 'service_page_bottom',
                        cta_label: 'Call 757-848-4559',
                        service_name: serviceType,
                        page_type: pageType
                      })
                    }
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
