import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const HouseDemolition = () => (
  <ServiceLandingPage
    title="Whole House Demolition Services in Hampton Roads, VA"
    description="Mr Demo Pro provides whole house demolition in Hampton Roads—including Hampton, VA—with full structural teardown, foundation removal, debris haul-off, and permit coordination for residential properties."
    serviceType="House Demolition"
    heroImage={{
      src: '/assets/img/features/hampton-roads.webp',
      alt: 'Whole house demolition service by Mr Demo Pro in Hampton Roads, VA'
    }}
    benefits={[
      {
        title: 'Licensed & Insured Crew',
        description:
          'Our demolition team follows strict safety standards to protect people, neighboring properties, and the work site throughout the project.'
      },
      {
        title: 'Permit & Utility Coordination',
        description:
          'We help coordinate demolition permits, utility disconnects, and inspections so your whole-house teardown stays on schedule.'
      },
      {
        title: 'Complete Site Cleanup',
        description:
          'We haul off demolition debris and leave your lot cleared and ready for rebuild, sale, or new construction planning.'
      }
    ]}
    serviceIncludes={[
      'Full structural teardown and removal',
      'Foundation and slab demolition (as scoped)',
      'Debris haul-off, recycling, and disposal',
      'Permit guidance and coordination',
      'Final site cleanup and grading prep'
    ]}
    processSteps={[
      {
        title: 'Site Assessment',
        description:
          'We evaluate the home, access, utilities, and neighboring structures to plan the safest demolition approach.'
      },
      {
        title: 'Permits & Prep',
        description:
          'Utilities are disconnected, permits are confirmed, and the work zone is secured before demolition begins.'
      },
      {
        title: 'Demolition & Haul-Off',
        description:
          'Our crew completes the whole-house teardown efficiently while keeping debris controlled and the site organized.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We remove remaining debris and leave the property ready for your next phase — rebuild, sale, or landscaping.'
      }
    ]}
    pricingExpectationsTitle="House demolition pricing expectations"
    pricingExpectationsItems={[
      'PLACEHOLDER — confirm with owner before publish: whole-house demolition in Virginia often falls in a $4–$12 per square foot range depending on home size, construction type, foundation scope, and access.',
      'Wood-frame homes, masonry, basements, and slab-on-grade foundations each affect equipment needs and disposal costs.',
      'Quotes include a written scope covering teardown, haul-off, and cleanup. See our demolition cost guide for factors that affect price.'
    ]}
    permitsSafetyTitle="Permits & safety"
    permitsSafetyParagraphs={[
      'Virginia generally requires a demolition permit for full structure teardowns. Hampton Roads cities and counties — including Hampton, Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, and Suffolk — typically require permits and may require utility disconnect verification before work begins. Contact your local building or development office for requirements.',
      'We coordinate safety controls including work-zone barriers, dust suppression planning, and haul routes that protect pedestrians and neighboring properties. For local service details, see our service area hub and city contractor pages.'
    ]}
    faqs={[
      {
        question: 'What is the difference between full and partial house demolition?',
        answer:
          'Full house demolition removes the entire structure and typically the foundation, leaving a cleared lot. Partial or selective demolition removes specific sections — such as an addition, garage, or interior areas — while preserving parts of the home you plan to keep.'
      },
      {
        question: 'Do I need a permit for whole house demolition in Hampton Roads?',
        answer:
          'Yes, in most cases. Full teardowns in Hampton Roads localities generally require a demolition permit from the city or county building department. We help you understand the requirements and coordinate as part of your project scope.'
      },
      {
        question: 'How much does house demolition cost in Virginia?',
        answer:
          'Pricing depends on square footage, construction materials, foundation type, access, and disposal needs. We provide a free written estimate after reviewing your property. See our demolition cost guide for general factors that affect price.'
      },
      {
        question: 'How long does a whole house demolition take?',
        answer:
          'Most residential whole-house demolitions take several days to two weeks depending on size, weather, permit timing, and foundation scope. We provide a timeline with your quote.'
      },
      {
        question: 'What areas do you serve for house demolition?',
        answer:
          'We serve Hampton Roads including Hampton, Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk, and Yorktown. Call 757-848-4559 for a free estimate.'
      }
    ]}
    nearbyAreasTitle="House demolition service areas"
    nearbyAreasIntro="Explore city-focused demolition pages or our Hampton Roads service area hub."
    nearbyAreasLinks={[
      {label: 'Service areas hub', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
      {label: 'Demolition contractor Newport News, VA', to: CITY_PATHS.newportNews},
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk},
      {label: 'Demolition contractor Virginia Beach, VA', to: CITY_PATHS.virginiaBeach},
      {label: 'Demolition contractor Chesapeake, VA', to: CITY_PATHS.chesapeake},
      {label: 'Demolition contractor Portsmouth, VA', to: CITY_PATHS.portsmouth},
      {label: 'Demolition contractor Suffolk, VA', to: CITY_PATHS.suffolk}
    ]}
    ctaTitle="Need whole house demolition in Hampton Roads?"
    ctaDescription="Tell us about the property and we will provide a free, no-pressure quote."
  >
    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-4 mb-lg-0">
            <h2
              style={{
                color: 'var(--color-primary)',
                marginBottom: '16px',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 800
              }}
            >
              Full demolition vs selective demolition
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: '16px'}}>
              <strong>Full house demolition</strong> removes the entire structure
              down to the foundation (or includes foundation removal), leaving a
              cleared lot ready for new construction or sale.
            </p>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              <strong>Selective or partial demolition</strong> targets specific
              areas — an addition, wing, or interior — while preserving the rest
              of the home. This is common for remodels or when only part of a
              structure needs to come down.
            </p>
          </Col>
          <Col lg={6} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: 12
              }}
            >
              {[
                'Full teardown with debris haul-off',
                'Foundation and slab removal (as scoped)',
                'Selective demo for partial removals',
                'Permit coordination and site prep'
              ].map(item => (
                <li
                  key={item}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff'
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
    <section style={{padding: '80px 0'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-4 mb-lg-0">
            <h2
              style={{
                color: 'var(--color-primary)',
                marginBottom: '16px',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 800
              }}
            >
              Related services
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              House demolition projects often pair with other demolition work.
              Browse <Link to="/services/">all services</Link> or visit:
            </p>
          </Col>
          <Col lg={6} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: 12
              }}
            >
              {[
                {label: 'Residential Demolition', to: '/residential-demolition/'},
                {label: 'Building Demolition', to: '/building-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Demolition Cost Guide', to: '/demolition-cost-virginia/'},
                {label: 'Contact for a Quote', to: '/contact/'}
              ].map(item => (
                <li
                  key={item.to}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff'
                  }}
                >
                  <Link
                    to={item.to}
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    {item.label}
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

export default HouseDemolition;
