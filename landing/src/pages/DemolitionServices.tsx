import {Container, Row, Col} from 'react-bootstrap';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const DemolitionServices = () => (
  <ServiceLandingPage
    title="Demolition Services in Hampton Roads"
    description="Mr Demo Pro delivers full-service demolition services for homes, businesses, and construction sites. From selective interior demo to complete structure removal, our demolition company keeps projects safe, clean, and on time."
    serviceType="Demolition Services"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Demolition services overview by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Full-Service Demolition',
        description:
          'We handle everything from planning to final cleanup so you can focus on your next phase.'
      },
      {
        title: 'Local, Experienced Team',
        description:
          'Our Hampton Roads crew brings the experience of a professional demolition contractor to every job.'
      },
      {
        title: 'Clear Communication',
        description:
          'We provide clear timelines, fast quotes, and responsive updates throughout the project.'
      }
    ]}
    whatWeDemolishTitle="What we demolish"
    whatWeDemolishItems={[
      'Interior demolition and strip-outs',
      'Residential structure removal',
      'Commercial demolition services',
      'Concrete demolition and haul-off',
      'Site cleanup and debris disposal'
    ]}
    serviceIncludesTitle="What professional demolition typically includes"
    serviceIncludes={[
      'Written scope discussion before mobilization',
      'Controlled teardown sequencing for safety',
      'Loading, hauling, and lawful disposal',
      'Jobsite cleanup—organized and walk-through ready'
    ]}
    processSteps={[
      {
        title: 'Share Project Details',
        description:
          'Tell us about the property, structure, and your goals so we can scope the work.'
      },
      {
        title: 'On-Site Assessment',
        description:
          'We evaluate access, safety needs, and materials for a precise demolition plan.'
      },
      {
        title: 'Demolition & Haul-Off',
        description:
          'Our crew removes structures safely and keeps debris contained and organized.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the site clean and ready for construction, sale, or renovation.'
      }
    ]}
    pricingExpectationsTitle="Pricing expectations"
    pricingExpectationsItems={[
      'Demolition estimates consider access, debris weight, equipment needs, disposal fees, and schedule urgency—photos and a walkthrough sharpen accuracy fast.',
      'Interior-only projects differ from structural or concrete-heavy removals; we spell out assumptions in writing.',
      'Commercial projects may bundle multiple rooms or floors—expect pricing to track with phasing and haul volume.'
    ]}
    permitsSafetyTitle="Permits & safety"
    permitsSafetyParagraphs={[
      'Demolition that touches structure, utilities, or regulated exterior work may require permits or inspections depending on jurisdiction and property type.',
      'We prioritize barrier planning, mechanical equipment positioning, dust control, and safe debris paths—especially near occupied homes and busy sites.'
    ]}
    beforeAfterTitle="Results you will recognize on site"
    beforeAfterExamples={[
      {
        title: 'Controlled interior strip',
        description:
          'Systems are isolated, fixtures are removed, and loads are staged for fast truck-out so your GC can start build-back sooner.'
      },
      {
        title: 'Outdoor structure removal',
        description:
          'Detached structures and slabs are lifted out with disciplined cleanup—no vague “we will come back later” piles.'
      }
    ]}
    faqs={[
      {
        question: 'Do you serve only one city?',
        answer:
          'We work across Hampton Roads and maintain city pages so you can find localized context for Hampton, Newport News, and Norfolk.'
      },
      {
        question: 'How fast can demolition start?',
        answer:
          'Small projects can often book quickly once scope is clear. Larger or structural work may require additional planning, equipment, or documentation.'
      },
      {
        question: 'Do you haul away debris?',
        answer:
          'Yes—hauling is a standard part of how we scope residential and commercial demolition unless your contract explicitly states otherwise.'
      }
    ]}
    ctaTitle="Ready for a demolition services quote?"
    ctaDescription="Call now or request a free estimate for your Hampton Roads project."
  >
    <section style={{padding: '80px 0'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-4 mb-lg-0">
            <motion.h2
              className="title-small fw-bold"
              initial={{opacity: 0, x: -50}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              style={{
                color: 'var(--color-primary)',
                marginBottom: '20px',
                fontSize: 'var(--font-size-3xl)'
              }}
            >
              Specialty demolition services
            </motion.h2>
            <motion.p
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.2, duration: 0.6}}
              style={{
                fontSize: 'var(--font-size-lg)',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)'
              }}
            >
              Need a specific demolition service? Explore focused landing pages for the top requests in Hampton Roads.
            </motion.p>
          </Col>
          <Col lg={6} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '12px'
              }}
            >
              {[
                {label: 'Building Demolition', to: '/building-demolition/'},
                {label: 'Concrete Demolition', to: '/concrete-demolition/'},
                {label: 'Residential Demolition', to: '/residential-demolition/'},
                {label: 'Garage Demolition', to: '/services/garage-demolition/'},
                {label: 'Commercial Demolition', to: '/commercial-demolition/'},
                {label: 'Tenant Clean Out', to: '/tenant-clean-out/'},
                {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
                {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
                {
                  label: 'Commercial Interior Demolition',
                  to: '/services/commercial-interior-demolition/'
                },
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Shed Removal', to: '/services/shed-removal/'}
              ].map(link => (
                <li
                  key={link.to}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      fontWeight: 600
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

    <section style={{padding: '0 0 80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-4 mb-lg-0">
            <motion.h2
              className="title-small fw-bold"
              initial={{opacity: 0, x: -50}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              style={{
                color: 'var(--color-primary)',
                marginBottom: '20px',
                fontSize: 'var(--font-size-3xl)'
              }}
            >
              Local demolition contractor pages
            </motion.h2>
            <motion.p
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.2, duration: 0.6}}
              style={{
                fontSize: 'var(--font-size-lg)',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)',
                marginBottom: 0
              }}
            >
              We also serve nearby areas like Newport News and Norfolk—use these pages when you want city-specific wording and FAQs.
            </motion.p>
          </Col>
          <Col lg={6} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '12px'
              }}
            >
              {[
                {label: 'Service areas hub (Hampton Roads)', to: SERVICE_AREA_HUB_PATH},
                {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
                {
                  label: 'Demolition contractor Newport News, VA',
                  to: CITY_PATHS.newportNews
                },
                {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk}
              ].map(link => (
                <li
                  key={link.to}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff'
                  }}
                >
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      fontWeight: 600
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
  </ServiceLandingPage>
);

export default DemolitionServices;
