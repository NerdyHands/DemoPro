import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

interface CityDemolitionPageProps {
  city: string;
  cityPath: string;
  description: string;
  benefitFocus: [string, string, string];
  nearbyCities: Array<{label: string; to: string}>;
}

const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

const popularServices = [
  {label: 'Interior Demolition', to: '/services/interior-demo/'},
  {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
  {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
  {label: 'Concrete Removal', to: '/services/concrete-removal/'},
  {label: 'Garage Demolition', to: '/services/garage-demolition/'},
  {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'}
];

const CityDemolitionPage = ({
  city,
  cityPath,
  description,
  benefitFocus,
  nearbyCities
}: CityDemolitionPageProps) => (
  <ServiceLandingPage
    title={`Demolition Contractor in ${city}, VA`}
    description={description}
    serviceType="Demolition Contractor"
    areaServed={`${city}, VA`}
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: `Demolition contractor serving ${city}, VA`
    }}
    benefits={[
      {
        title: `${city} Project Planning`,
        description: benefitFocus[0]
      },
      {
        title: 'Selective Demo & Haul-Off',
        description: benefitFocus[1]
      },
      {
        title: 'Clean Turnovers',
        description: benefitFocus[2]
      }
    ]}
    whatWeDemolishTitle={`What we demolish in ${city}`}
    whatWeDemolishItems={[
      'Interior demolition for remodels, rentals, and property updates',
      'Kitchen and bathroom tear-outs, fixtures, flooring, and cabinets',
      'Detached garages, sheds, small structures, and accessory buildings',
      'Concrete slabs, patios, walkways, driveway sections, and pads',
      'Commercial interior strip-outs and tenant improvement preparation',
      'Construction debris, demolition debris, and cleanup hauling'
    ]}
    processSteps={[
      {
        title: 'Scope Review',
        description:
          'Share photos, measurements, access notes, and your timeline so we can size the work accurately.'
      },
      {
        title: 'Site Planning',
        description:
          'We review access, debris staging, dust control, safety needs, and utility considerations before work starts.'
      },
      {
        title: 'Demolition',
        description:
          'Our crew completes controlled demolition, separates debris where practical, and keeps the jobsite moving.'
      },
      {
        title: 'Load-Out & Cleanup',
        description:
          'Debris is hauled off and the work area is cleaned so your next trade or project phase can begin.'
      }
    ]}
    pricingExpectationsTitle={`Pricing expectations in ${city}`}
    pricingExpectationsItems={[
      'Quotes depend on materials, debris weight, access, labor time, equipment needs, and disposal costs.',
      'Selective interior demolition prices differently from structural, garage, or concrete removal work.',
      'You get a clear scope before we mobilize, including what is included in demolition, hauling, and cleanup.'
    ]}
    permitsSafetyTitle={`Permits & safety in ${city}`}
    permitsSafetyParagraphs={[
      'Permit requirements vary by project type, property, and whether structural elements or utilities are involved. Confirm local requirements for your exact scope before work begins.',
      'Mr Demo Pro plans containment, safe access paths, debris handling, and cleanup so demolition stays organized from walkthrough to final load-out.'
    ]}
    faqs={[
      {
        question: `Do I need a permit for demolition in ${city}, VA?`,
        answer:
          'It depends on scope. Structural demolition, exterior removals, utility work, or commercial spaces may require permits or approvals. We help identify what to ask during the estimate process.'
      },
      {
        question: `Do you haul debris away in ${city}?`,
        answer:
          'Yes. Most demolition scopes include debris loading, haul-off, and cleanup unless your estimate states otherwise.'
      },
      {
        question: 'How quickly can you schedule demolition?',
        answer:
          'Scheduling depends on project size and access, but photos and clear scope details help us quote and schedule faster.'
      }
    ]}
    nearbyAreasTitle="Nearby city pages"
    nearbyAreasIntro="Compare nearby Hampton Roads service pages or return to the service-area hub."
    nearbyAreasLinks={[
      {label: 'Service areas hub (Hampton Roads)', to: SERVICE_AREA_HUB_PATH},
      ...nearbyCities
    ]}
    ctaTitle={`Need demolition in ${city}?`}
    ctaDescription="Call or request a free quote for demolition, removal, hauling, and cleanup."
  >
    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={5} md={12} className="mb-4 mb-lg-0">
            <h2
              style={{
                color: 'var(--color-primary)',
                marginBottom: '16px',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 800
              }}
            >
              Popular demolition services in {city}
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Browse high-intent service pages for {city} projects, then contact us
              for a bundled quote.
            </p>
          </Col>
          <Col lg={7} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: 12
              }}
            >
              {popularServices.map(item => (
                <li
                  key={`${cityPath}-${item.to}`}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff'
                  }}
                >
                  <Link
                    to={item.to}
                    onClick={scrollTop}
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
              <li
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff'
                }}
              >
                <Link
                  to={CITY_PATHS.hampton}
                  onClick={scrollTop}
                  style={{
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontWeight: 700
                  }}
                >
                  Compare with Hampton demolition services
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </section>
  </ServiceLandingPage>
);

export default CityDemolitionPage;
