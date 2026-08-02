import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const DemolitionContractorHamptonVa = () => (
  <ServiceLandingPage
    title="Demolition Contractor in Hampton, VA"
    description="Looking for a demolition contractor in Hampton, VA? Mr Demo Pro is a local demolition company providing professional demolition services with fast quotes, safe work, and haul-off included."
    serviceType="Demolition Contractor"
    areaServed="Hampton, VA"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Demolition contractor serving Hampton, VA'
    }}
    benefits={[
      {
        title: 'Local Hampton Crew',
        description:
          'We serve Hampton and nearby Hampton Roads cities with responsive scheduling and straightforward communication.'
      },
      {
        title: 'One Contractor, Clear Scope',
        description:
          'Tell us about the project and we route you to the right service—interior, outdoor structures, concrete, or commercial—without juggling multiple vendors.'
      },
      {
        title: 'Haul-Off Included',
        description:
          'Cleanup and disposal are part of how we work—we don’t leave piles of debris for you to figure out.'
      }
    ]}
    whatWeDemolishTitle="How we help Hampton property owners"
    whatWeDemolishItems={[
      'Local demolition contractor coordination from quote to cleanup',
      'Guidance on permits and what your project type typically requires',
      'Clear written scope before work begins',
      'Debris haul-off and jobsite cleanup on every job',
      'Links to specialized service pages for room, structure, and concrete work',
      'Service across Hampton and the wider Hampton Roads area'
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
      'Every quote is based on what we see: project size, materials, access, disposal, and time on site—so you get a number that matches the real job.',
      'Smaller jobs typically cost less than full-structure work, but the fastest way to know is a quick walkthrough or photos.',
      'We provide a clear, written scope before we start so you are not surprised mid-project.'
    ]}
    permitsSafetyTitle="Permits & safety in Hampton"
    permitsSafetyParagraphs={[
      'Permit and inspection rules depend on your project type, property, and what is being removed. In many cases, work that changes the building envelope, load-bearing elements, or certain outdoor structures will require a permit or an approval from the local building office. We help you understand what to ask, and we can coordinate documentation when it is part of the plan.',
      'On site, we work to protect people, neighboring properties, and access points. That means planning for dust and debris, safe tool use, and an organized load-out so the area stays as contained as possible before the final cleanup.'
    ]}
    beforeAfterTitle="What working with a Hampton demolition contractor looks like"
    beforeAfterExamples={[
      {
        title: 'Clear scope up front',
        description:
          'You get a written plan and price before work starts, whether the job is a remodel tear-out or a larger removal.'
      },
      {
        title: 'Clean handoff',
        description:
          'Debris is loaded and hauled so the property is ready for renovation, construction, or turnover—not left with leftover piles.'
      }
    ]}
    faqs={[
      {
        question: 'Do I need a permit for demolition in Hampton, VA?',
        answer:
          'It depends on scope. Some interior projects differ from structural teardown or exterior removals—requirements vary by situation and jurisdiction. If permits apply for your job, we help you understand next steps and coordinate documentation when appropriate.'
      },
      {
        question: 'How long does demolition take?',
        answer:
          'Many small-to-mid projects are completed in a day or two once utilities are cleared and access is confirmed. Larger jobs take longer based on equipment needs and debris volume.'
      },
      {
        question: 'Do you remove debris?',
        answer:
          'Yes. Loading, hauling, and disposal are core parts of how we work—we do not leave piles behind for you to figure out.'
      },
      {
        question: 'Which service page should I use for my project?',
        answer:
          'Use this page if you are searching for a demolition contractor in Hampton, VA. For a specific job type—interior demo, kitchen, bathroom, garage, concrete, shed, or house demolition—open the matching service page linked below so you get the right details and quote path.'
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
              Specialized demolition services (use these pages)
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              This page is your Hampton demolition contractor hub. For a specific
              job type, use the dedicated service page below—or browse{' '}
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
                {
                  label: 'Interior / Residential Interior Demolition',
                  to: '/services/interior-demo/'
                },
                {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
                {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
                {label: 'Garage Demolition', to: '/services/garage-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {
                  label: 'Commercial Interior Demolition',
                  to: '/services/commercial-interior-demolition/'
                },
                {label: 'Shed Removal', to: '/services/shed-removal/'},
                {label: 'House Demolition', to: '/services/house-demolition/'},
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
