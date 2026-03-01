import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const DemolitionContractorHamptonVa = () => (
  <ServiceLandingPage
    title="Demolition Contractor in Hampton, VA"
    description="Looking for a demolition contractor in Hampton, VA? Mr Demo Pro provides clean, professional demolition and removal services across Hampton Roads—fast quotes, safe work, and haul-off included."
    serviceType="Demolition Contractor"
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
    serviceIncludes={[
      'Kitchen and bathroom demolition for remodels',
      'Garage demolition and removal',
      'Concrete removal (driveways, slabs, patios)',
      'Commercial interior demolition and strip-outs',
      'Selective interior demo and cleanouts'
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
                {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'},
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
