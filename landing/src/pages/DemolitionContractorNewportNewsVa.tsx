import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const DemolitionContractorNewportNewsVa = () => (
  <ServiceLandingPage
    title="Demolition Contractor in Newport News, VA"
    description="Searching for a demolition contractor in Newport News, VA? Mr Demo Pro handles selective interior demolition, garage and concrete removal, and debris haul-off—built around safety, speed, and clear communication."
    serviceType="Demolition Contractor"
    areaServed="Newport News, VA"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Demolition contractor serving Newport News, VA'
    }}
    benefits={[
      {
        title: 'Neighbor-Friendly Workflow',
        description:
          'We sequence demolition and haul-off to reduce downtime and keep residential streets and parking areas manageable.'
      },
      {
        title: 'Contractor-Ready Handoffs',
        description:
          'Ideal for remodel and renovation schedules—we leave spaces predictable for carpenters, electricians, and builders.'
      },
      {
        title: 'Everything Loaded Out',
        description:
          'Our crews handle demolition debris disposal—no mystery piles left behind.'
      }
    ]}
    whatWeDemolishTitle="What we demolish in Newport News"
    whatWeDemolishItems={[
      'Kitchen and bathroom demolition for renovations',
      'Garages, sheds, and small outbuildings',
      'Concrete slabs, patios, walkways, and driveway sections',
      'Commercial interior strip-outs and selective demolition',
      'Mixed demolition debris removal and cleanup'
    ]}
    processSteps={[
      {
        title: 'Scope & Scheduling',
        description:
          'Tell us what needs removed and when your GC or homeowner timeline matters—we align demolition accordingly.'
      },
      {
        title: 'Site Prep',
        description:
          'We verify access paths, containment strategy, and debris staging before tools hit the ground.'
      },
      {
        title: 'Demolition & Load-Out',
        description:
          'Controlled teardown with steady haul-off so interior dust and exterior clutter stay minimized.'
      },
      {
        title: 'Cleanup Walkthrough',
        description:
          'Final sweep so your space is ready for inspections or the next trade.'
      }
    ]}
    pricingExpectationsTitle="Pricing expectations"
    pricingExpectationsItems={[
      'Quotes factor in labor, disposal tonnage, equipment needs, and distance inside or behind the property—not just square footage.',
      'Interior selective demolition often differs dramatically from exterior slab work or structural removals; we outline assumptions clearly.',
      'Expect firm pricing before mobilization once scope is confirmed.'
    ]}
    permitsSafetyTitle="Permits & safety in Newport News"
    permitsSafetyParagraphs={[
      'Demolition touching structural walls, utilities, or regulated exterior structures often involves permitting or inspections. Requirements vary—always confirm specifics with local officials when scope crosses beyond cosmetic removals.',
      'Mr Demo Pro emphasizes containment, protective walkways, and disciplined haul routes—especially important where neighbors share tight setbacks.'
    ]}
    beforeAfterTitle="Before & after scenarios"
    beforeAfterExamples={[
      {
        title: 'Kitchen rip-out for remodel',
        description:
          'Cabinetry, countertops, flooring, and appliance disconnect coordination wrapped into one demolition sequence.'
      },
      {
        title: 'Concrete tear-out',
        description:
          'Broken concrete is lifted from tight yards or corners and loaded directly—ideal prep for pavers or new pours.'
      }
    ]}
    faqs={[
      {
        question: 'Do I need a permit for demolition in Newport News, VA?',
        answer:
          'Scope dictates permitting. Minor interior removals sometimes proceed differently than structural alterations or exterior teardowns. Our estimates spell out responsibilities so you know whether permitting coordination belongs on our checklist.'
      },
      {
        question: 'How long does demolition take?',
        answer:
          'Single-room demolition frequently completes within a day once utilities are verified. Larger footprints or reinforced concrete take longer due to breakout time and heavier hauling.'
      },
      {
        question: 'Do you remove debris?',
        answer:
          'Absolutely—demolition estimates typically bundle hauling unless clearly excluded by scope.'
      }
    ]}
    nearbyAreasTitle="Nearby areas & helpful links"
    nearbyAreasIntro="Browse Hampton or Norfolk pages—or jump back to the Hampton Roads hub—for adjacent-city searches."
    nearbyAreasLinks={[
      {label: 'Service areas hub (Hampton Roads)', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk}
    ]}
    ctaTitle="Ready for demolition in Newport News?"
    ctaDescription="Call or request a quote—we’ll outline timing, hauling, and access before we mobilize."
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
              Popular demolition services in Newport News
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Explore focused service pages or contact us for a bundled scope.
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
                {label: 'Interior Demolition', to: '/services/interior-demo/'},
                {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Garage Demolition', to: '/services/garage-demolition/'},
                {label: 'Building Demolition Overview', to: '/building-demolition/'},
                {label: 'Contact', to: '/contact/'}
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

export default DemolitionContractorNewportNewsVa;
