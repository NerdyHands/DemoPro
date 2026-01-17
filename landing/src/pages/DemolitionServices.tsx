import {Container, Row, Col} from 'react-bootstrap';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

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
    serviceIncludes={[
      'Interior demolition and strip-outs',
      'Residential structure removal',
      'Commercial demolition services',
      'Concrete demolition and haul-off',
      'Site cleanup and debris disposal'
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
              Specialty Demolition Services
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
              Need a specific demolition service? Explore our focused landing
              pages for the top requests in Hampton Roads.
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
                {label: 'Garage Demolition', to: '/garage-demolition/'},
                {label: 'Commercial Demolition', to: '/commercial-demolition/'},
                {label: 'Tenant Clean Out', to: '/tenant-clean-out/'},
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
  </ServiceLandingPage>
);

export default DemolitionServices;
