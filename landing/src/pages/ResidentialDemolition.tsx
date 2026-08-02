import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import ServiceLandingPage from '../components/ServiceLandingPage';

const ResidentialDemolition = () => (
  <ServiceLandingPage
    title="Residential Demolition Contractors in Hampton Roads"
    description="Mr Demo Pro is a trusted team of residential demolition contractors serving Hampton Roads. We handle full and partial teardown projects with clean job sites, clear communication, and reliable timelines."
    serviceType="Residential Demolition"
    heroImage={{
      src: '/assets/img/features/hampton-roads.webp',
      alt: 'Residential demolition contractors serving Hampton Roads'
    }}
    benefits={[
      {
        title: 'Respectful, Neighbor-Friendly Work',
        description:
          'We keep noise, debris, and disruption to a minimum while protecting nearby homes.'
      },
      {
        title: 'Flexible Scheduling',
        description:
          'We align with your renovation or rebuild timeline so you can stay on track.'
      },
      {
        title: 'Full Cleanup Included',
        description:
          'Our team removes debris and leaves the property ready for construction.'
      }
    ]}
    serviceIncludes={[
      'Full home demolition and removal',
      'Selective interior demolition',
      'Garage, shed, and outbuilding removal',
      'Foundation and slab removal',
      'Haul-off and site cleanup'
    ]}
    processSteps={[
      {
        title: 'Evaluate the Property',
        description:
          'We review access, utilities, and structural details to plan the safest approach.'
      },
      {
        title: 'Prepare the Site',
        description:
          'Utilities are disconnected and the area is secured for demolition.'
      },
      {
        title: 'Demolish & Remove',
        description:
          'We complete the teardown efficiently while keeping the site organized.'
      },
      {
        title: 'Final Cleanup',
        description:
          'Debris is hauled away and the site is left ready for your next step.'
      }
    ]}
    ctaTitle="Need residential demolition in Hampton Roads?"
    ctaDescription="Get a free quote from a local demolition contractor today."
  >
    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
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
              House Demolition for Hampton Roads Homes
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
              Planning a house demolition in Hampton or elsewhere in Hampton
              Roads? We safely remove outdated or damaged homes, managing
              debris and cleanup so your property is ready for a rebuild or
              sale. For whole-house teardown details, see our{' '}
              <Link to="/services/house-demolition/">
                house demolition service page
              </Link>
              .
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
                'Whole-home demolition and haul-off',
                'Selective demo for remodeling projects',
                'Safe removal near neighboring properties',
                'Clear site cleanup and preparation'
              ].map(item => (
                <li
                  key={item}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff'
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

export default ResidentialDemolition;
