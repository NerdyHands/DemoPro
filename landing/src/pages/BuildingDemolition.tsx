import {Container, Row, Col} from 'react-bootstrap';
import {motion} from 'framer-motion';
import ServiceLandingPage from '../components/ServiceLandingPage';

const BuildingDemolition = () => (
  <ServiceLandingPage
    title="Building Demolition Services in Hampton Roads"
    description="Mr Demo Pro is a local demolition company delivering safe, efficient building demolition for residential and commercial structures. As a trusted demolition contractor, we handle permits, safety planning, and full debris removal."
    serviceType="Building Demolition"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Building demolition services by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Licensed & Insured Crew',
        description:
          'Our demolition team follows strict safety standards to protect people, property, and nearby structures.'
      },
      {
        title: 'Permit & Utility Coordination',
        description:
          'We help coordinate permits and utility disconnects so your demolition project stays on schedule.'
      },
      {
        title: 'Complete Cleanup',
        description:
          'We handle demolition debris haul-off and leave your site clean and ready for the next phase.'
      }
    ]}
    serviceIncludes={[
      'Interior strip-out and soft demo',
      'Structural teardown and removal',
      'Concrete and foundation demolition',
      'Haul-off, recycling, and disposal',
      'Final site cleanup and grading'
    ]}
    processSteps={[
      {
        title: 'Site Assessment',
        description:
          'We evaluate the structure, access, and safety needs to plan the right approach.'
      },
      {
        title: 'Safety Prep',
        description:
          'Utilities are disconnected and the work area is secured before demolition begins.'
      },
      {
        title: 'Demolition & Haul-Off',
        description:
          'Our crew removes the structure efficiently while keeping the site organized.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the property free of debris so you can move forward quickly.'
      }
    ]}
    ctaTitle="Need building demolition in Hampton Roads?"
    ctaDescription="Tell us about the structure and we will provide a free, no-pressure quote."
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
              Building Types We Demolish
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
              From small residential structures to larger commercial buildings,
              we tailor the demolition plan to your site, access, and timeline.
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
                'Residential homes and additions',
                'Detached garages and outbuildings',
                'Commercial buildings and retail spaces',
                'Warehouses and light industrial structures'
              ].map(item => (
                <li
                  key={item}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>
    </section>
  </ServiceLandingPage>
);

export default BuildingDemolition;
