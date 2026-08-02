import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const DemolitionContractorHamptonVa = () => (
  <ServiceLandingPage
    title="Demolition Contractor in Hampton, VA"
    description="Looking for a demolition contractor in Hampton, VA? Mr Demo Pro provides clean, professional demolition and removal services across Hampton Roads—fast quotes, safe work, and haul-off included."
    serviceType="Demolition Contractor"
    areaServed="Hampton, VA"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Demolition contractor serving Hampton, VA'
    }}
    benefits={[
      {
        title: 'Local Hampton Roads Crew',
        description:
          'We serve Hampton and surrounding cities with responsive scheduling and straightforward communication.'
      },
      {
        title: 'Clean, Controlled Work',
        description:
          'From selective interior demo to removal projects, we keep debris controlled and sites organized.'
      },
      {
        title: 'Haul-Off Included',
        description:
          'We don’t leave you with piles of debris—cleanup and disposal are part of the service.'
      }
    ]}
    whatWeDemolishTitle="What we demolish in Hampton"
    whatWeDemolishItems={[
      'Small structures, sheds, and outbuildings',
      'Kitchen and bathroom demolition for remodels',
      'Garage demolition and concrete pads',
      'Driveways, patios, slabs, and selective concrete removal',
      'Commercial interior demolition and tenant strip-outs',
      'Debris haul-off and jobsite cleanup'
    ]}
    processSteps={[
      {
        title: 'Tell Us About the Project',
        description:
          'Share photos, measurements, and what needs removed so we can scope the work accurately.'
      },
      {
        title: 'On-Site Assessment',
        description:
          'We review access, safety needs, and debris handling to build a clean demolition plan.'
      },
      {
        title: 'Demolition & Haul-Off',
        description:
          'Our crew completes the demolition safely and removes debris from the site.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the property clean and ready for renovation, construction, or turnover.'
      }
    ]}
    pricingExpectationsTitle="Pricing expectations"
    pricingExpectationsItems={[
      'Every quote is based on what we see: structure size, materials, access, disposal, and time on site—so you get a number that matches the real job.',
      'Smaller selective projects (single rooms, small sheds) are typically less than full-structure or heavy concrete work, but the fastest way to know is a quick walkthrough or photos.',
      'We provide a clear, written scope before we start so you are not surprised mid-project.'
    ]}
    permitsSafetyTitle="Permits & safety in Hampton"
    permitsSafetyParagraphs={[
      'Permit and inspection rules depend on your project type, property, and what is being removed. In many cases, work that changes the building envelope, load-bearing elements, or certain outdoor structures will require a permit or an approval from the local building office. We help you understand what to ask, and we can coordinate documentation when it is part of the plan.',
      'On site, we work to protect people, neighboring properties, and access points. That means planning for dust and debris, safe tool use, and an organized load-out so the area stays as contained as possible before the final cleanup.'
    ]}
    beforeAfterTitle="Before & after: what to expect"
    beforeAfterExamples={[
      {
        title: 'Remodel-ready interior',
        description:
          'Cabinets, flooring, and fixtures are removed and hauled off, leaving a broom-clean space for your build team.'
      },
      {
        title: 'Clear outdoor pad',
        description:
          'Sheds, small outbuildings, and concrete are broken out, loaded, and hauled so you are not left with hidden disposal work.'
      }
    ]}
    faqs={[
      {
        question: 'Do I need a permit for demolition in Hampton, VA?',
        answer:
          'It depends on scope. Interior selective demolition may not always trigger the same permits as structural teardown or exterior removals—but requirements vary by situation and jurisdiction. If permits apply for your job, we help you understand next steps and coordinate documentation when appropriate.'
      },
      {
        question: 'How long does demolition take?',
        answer:
          'Many small-to-mid projects are completed in a day or two once utilities are cleared and access is confirmed. Larger removals or concrete-heavy jobs take longer based on equipment needs and debris volume.'
      },
      {
        question: 'Do you remove debris?',
        answer:
          'Yes. Loading, hauling, and disposal are core parts of how we work—we do not leave piles behind for you to figure out.'
      }
    ]}
    nearbyAreasTitle="Nearby areas & helpful links"
    nearbyAreasIntro="We also serve nearby areas like Newport News and Norfolk—browse these pages for intent-specific detail."
    nearbyAreasLinks={[
      {label: 'Service areas hub (Hampton Roads)', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Newport News, VA', to: CITY_PATHS.newportNews},
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk}
    ]}
    ctaTitle="Need a demolition contractor in Hampton, VA?"
    ctaDescription="Call now or request a free estimate for your Hampton project."
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
              Popular demolition services in Hampton
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Start with one of these common requests or browse{' '}
              <Link to="/services/">all services</Link>.
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
                {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
                {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
                {label: 'Garage Demolition', to: '/services/garage-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {
                  label: 'Commercial Interior Demolition',
                  to: '/services/commercial-interior-demolition/'
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

export default DemolitionContractorHamptonVa;
