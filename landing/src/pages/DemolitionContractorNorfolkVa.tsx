import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const DemolitionContractorNorfolkVa = () => (
  <ServiceLandingPage
    title="Demolition Contractor in Norfolk, VA"
    description="Need demolition in Norfolk, VA? Mr Demo Pro completes selective interior demolition, garage and concrete removals, and thorough debris haul-off—ideal for homeowners, landlords, and contractors preparing properties for renovation."
    serviceType="Demolition Contractor"
    areaServed="Norfolk, VA"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Demolition contractor serving Norfolk, VA'
    }}
    benefits={[
      {
        title: 'Tight-Site Experience',
        description:
          'We plan for alleys, close lot lines, and older construction where access and utilities can be unique.'
      },
      {
        title: 'Clear Debris Plans',
        description:
          'Truck positioning, container needs, and hand-load paths are discussed up front—fewer surprises mid-job.'
      },
      {
        title: 'Responsive Quotes',
        description:
          'Photos plus a quick phone scope often jump-start scheduling so your renovation calendar stays intact.'
      }
    ]}
    whatWeDemolishTitle="What we demolish in Norfolk"
    whatWeDemolishItems={[
      'Interior demolition for kitchens, baths, rental turnovers, and remodels',
      'Attached or detached garages and accessory structures',
      'Concrete demos for patios, walkways, pads, and slabs',
      'Commercial interiors and selective strip-outs',
      'Construction and demolition debris hauling'
    ]}
    processSteps={[
      {
        title: 'Discovery Call',
        description:
          'Describe the layout, hazards you know about, and timing constraints—we advise what photos help most.'
      },
      {
        title: 'Walkthrough or Remote Review',
        description:
          'Confirm scope, debris staging areas, and whether permits or landlord approvals apply.'
      },
      {
        title: 'Controlled Demo Days',
        description:
          'Work progresses in deliberate phases—tear-out, segregate loads, haul continuously.'
      },
      {
        title: 'Cleanup Sign-Off',
        description:
          'Walkthrough-ready floors and walls where requested so next crews can mobilize.'
      }
    ]}
    pricingExpectationsTitle="Pricing expectations"
    pricingExpectationsItems={[
      'Pricing ties to debris weight/volume, labor hours, protection needs, and dump fees—not headline square footage alone.',
      'Interior scopes vary widely between cosmetic rip-outs versus structural demolition—your estimate spells out assumptions.',
      'Commercial interiors may bundle multiple trades worth of teardown—schedule and disposal volume drive cost.'
    ]}
    permitsSafetyTitle="Permits & safety in Norfolk"
    permitsSafetyParagraphs={[
      'Depending on occupancy type and scope, demolition may involve inspections or permits—especially where utilities, occupancy changes, or structural elements are addressed. Confirm specifics with Norfolk officials when applicable.',
      'Safety planning covers respiratory hazards, adjacent structures, pedestrian routes, and careful sequencing where mechanical equipment operates near foundations.'
    ]}
    beforeAfterTitle="Results homeowners recognize"
    beforeAfterExamples={[
      {
        title: 'Interior ready for remodel',
        description:
          'Fixture removal, drywall tear-back, flooring pulls, and stacked haul routes until trucks roll.'
      },
      {
        title: 'Outdoor clearing',
        description:
          'Concrete breakout and grading-friendly cleanup so landscaping or paving crews have a blank slate.'
      }
    ]}
    faqs={[
      {
        question: 'Do I need a permit for demolition in Norfolk, VA?',
        answer:
          'Scope determines permitting. Structural alterations, regulated removals, or commercial tenant improvements often involve inspection checkpoints. Share your goals—we highlight compliance considerations within your estimate narrative.'
      },
      {
        question: 'How long does demolition take?',
        answer:
          'Small interior packages can often complete in one day; multi-zone or reinforced jobs extend based on breakout and haul cadence.'
      },
      {
        question: 'Do you remove debris?',
        answer:
          'Yes—debris handling and disposal are baked into standard scopes unless explicitly defined as owner-provided dumpsters.'
      }
    ]}
    nearbyAreasTitle="Nearby areas & helpful links"
    nearbyAreasIntro="We regularly connect Norfolk projects with Hampton and Newport News searches—use these hubs for cross-city intent."
    nearbyAreasLinks={[
      {label: 'Service areas hub (Hampton Roads)', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
      {label: 'Demolition contractor Newport News, VA', to: CITY_PATHS.newportNews}
    ]}
    ctaTitle="Schedule Norfolk demolition today"
    ctaDescription="Call or request a free quote—tell us about access, fixtures, and your target finish date."
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
              Popular demolition services in Norfolk
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Mix and match interior, concrete, and structural services—then connect with our team for sequencing.
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
                {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
                {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Residential Demolition', to: '/residential-demolition/'},
                {label: 'Junk Removal & Hauling', to: '/services/junk-removal/'},
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

export default DemolitionContractorNorfolkVa;
