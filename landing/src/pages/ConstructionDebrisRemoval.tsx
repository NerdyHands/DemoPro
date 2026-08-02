import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const ConstructionDebrisRemoval = () => (
  <ServiceLandingPage
    title="Construction Debris Removal Services in Hampton Roads, VA"
    description="Need construction debris removal in Hampton Roads? Mr Demo Pro clears renovation debris, contractor job-site waste, and remodel cleanouts—loading, hauling, and disposal included. Call 757-848-4559 for a free estimate."
    serviceType="Construction Debris Removal"
    heroImage={{
      src: '/assets/Icons/trash.webp',
      alt: 'Construction debris removal and job site cleanup by Mr Demo Pro',
      maxWidth: 302
    }}
    benefitsTitle="Why Choose Mr Demo Pro for Construction Debris Removal?"
    benefits={[
      {
        title: 'Renovation & Remodel Ready',
        description:
          'We clear drywall, lumber, flooring scraps, cabinets, tile, and other renovation debris so your next trade can start on a clean site.'
      },
      {
        title: 'Contractor Job-Site Cleanup',
        description:
          'Builders and remodelers call us for end-of-day or end-of-phase load-outs when dumpsters are full, delayed, or the wrong fit for the job.'
      },
      {
        title: 'Haul-Off Included',
        description:
          'Our crew loads, hauls, and disposes of construction waste—no dumpster coordination required unless you prefer one.'
      }
    ]}
    whatWeDemolishTitle="What we remove from job sites"
    whatWeDemolishItems={[
      'Renovation debris: drywall, lumber, trim, and packaging',
      'Flooring, tile, cabinet, and fixture tear-out waste',
      'Contractor cleanout piles after framing, demo, or punch-list work',
      'Mixed construction debris from kitchens, baths, and additions',
      'Light concrete, brick, and masonry scraps (as scoped)',
      'Final job-site sweep and haul-off'
    ]}
    serviceIncludes={[
      'On-site loading of construction and renovation debris',
      'Contractor and homeowner job-site cleanouts',
      'Debris sorting guidance for recyclable vs landfill waste',
      'Haul-off and proper disposal',
      'Broom-clean finish when included in scope'
    ]}
    processTitle="Our Construction Debris Removal Process"
    processSteps={[
      {
        title: 'Share Photos & Access',
        description:
          'Send pictures of the pile or rooms, note stairs or tight driveways, and tell us if the job is mid-renovation or final cleanup.'
      },
      {
        title: 'Clear Quote',
        description:
          'We price by volume, material mix, and access—so you know the cost before we arrive.'
      },
      {
        title: 'Load & Haul',
        description:
          'Our crew clears the debris efficiently, protects walkways where needed, and loads everything for disposal.'
      },
      {
        title: 'Site Ready for Next Phase',
        description:
          'We leave the work area clear so contractors, inspectors, or installers can move forward without delay.'
      }
    ]}
    permitsSafetyTitle="Construction debris vs junk removal"
    permitsSafetyParagraphs={[
      'Construction debris removal focuses on renovation and job-site waste—materials from demolition, remodeling, and contractor work. Household furniture and general clutter usually fit better under junk removal or property cleanout.',
      'If your project also needs selective demolition (walls, floors, fixtures), we can combine debris haul-off with demo so you are not managing two crews.'
    ]}
    faqs={[
      {
        question: 'How much does construction debris removal cost?',
        answer:
          'Cost depends on debris volume, material type (wood vs concrete vs mixed), access, and labor time. Most Hampton Roads jobs are quoted after photos or a quick on-site look. Call 757-848-4559 for a free estimate.'
      },
      {
        question: 'What is considered construction debris?',
        answer:
          'Typical construction debris includes drywall, lumber, flooring, tile, cabinets, fixtures, packaging, and mixed remodel waste from renovations or new construction. Hazardous materials require special handling and may need a separate plan.'
      },
      {
        question: 'Do you provide dumpsters for construction debris?',
        answer:
          'Many customers prefer full-service load-and-haul instead of a dumpster. If a container makes more sense for your timeline, tell us when you request a quote and we will recommend the best approach.'
      },
      {
        question:
          'Can you remove construction debris from a renovation in Hampton Roads?',
        answer:
          'Yes. We serve Yorktown, Norfolk, Newport News, Hampton, Virginia Beach, Chesapeake, and nearby cities for renovation debris removal and contractor job-site cleanouts.'
      }
    ]}
    nearbyAreasTitle="Construction debris removal service areas"
    nearbyAreasIntro="We provide construction debris removal across Hampton Roads, including Yorktown, Norfolk, Newport News, Hampton, Virginia Beach, and Chesapeake."
    nearbyAreasLinks={[
      {label: 'Service areas hub', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
      {
        label: 'Demolition contractor Newport News, VA',
        to: CITY_PATHS.newportNews
      },
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk},
      {
        label: 'Demolition contractor Virginia Beach, VA',
        to: CITY_PATHS.virginiaBeach
      },
      {
        label: 'Demolition contractor Chesapeake, VA',
        to: CITY_PATHS.chesapeake
      }
    ]}
    ctaTitle="Need construction debris removed?"
    ctaDescription="Request a free construction debris removal quote in Hampton Roads."
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
              Related services
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Construction debris removal often pairs with cleanout, junk
              removal, or selective demolition. Browse{' '}
              <Link to="/services/">all services</Link> or visit:
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
                {label: 'Cleanout Services', to: '/services/cleanout/'},
                {label: 'Junk Removal', to: '/services/junk-removal/'},
                {
                  label: 'Interior Demolition',
                  to: '/services/interior-demo/'
                },
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

export default ConstructionDebrisRemoval;
