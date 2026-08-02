import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const ConcreteRemoval = () => (
  <ServiceLandingPage
    title="Concrete Removal in Hampton Roads, VA"
    description="Mr Demo Pro provides concrete removal in Hampton Roads—including Hampton, VA—for driveways, patios, walkways, slabs, and small foundations. We break up, remove, and haul off concrete so your site is ready for the next phase."
    serviceType="Concrete Removal"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Concrete removal and haul-off service by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Driveways, Patios & Slabs',
        description:
          'We remove common residential and light commercial concrete surfaces with efficient breakup and load-out.'
      },
      {
        title: 'Haul-Off Included',
        description:
          'We handle debris removal so you don’t have to coordinate dumpsters or multiple contractors.'
      },
      {
        title: 'Site-Ready Finish',
        description:
          'We leave the area cleared for new concrete, pavers, landscaping, or construction work.'
      }
    ]}
    serviceIncludes={[
      'Driveway and walkway removal',
      'Patio and slab removal',
      'Light foundation and footer removal (as scoped)',
      'Concrete haul-off and disposal',
      'Final cleanup'
    ]}
    processSteps={[
      {
        title: 'Share Site Details',
        description:
          'We confirm measurements, access, and what’s above/below the slab (utilities, drainage, etc.).'
      },
      {
        title: 'Plan & Protect',
        description:
          'We prep the work zone to help protect nearby structures and keep debris controlled.'
      },
      {
        title: 'Breakup & Removal',
        description:
          'Concrete is broken up, loaded out, and hauled away efficiently.'
      },
      {
        title: 'Cleanup',
        description:
          'We leave the area clean and ready for the next contractor or installation.'
      }
    ]}
    ctaTitle="Need concrete removed?"
    ctaDescription="Request a free concrete removal quote in Hampton Roads."
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
              Many projects pair concrete removal with demolition or cleanout
              work. Browse <Link to="/services/">all services</Link> or visit:
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
                {label: 'Garage Demolition', to: '/services/garage-demolition/'},
                {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'},
                {
                  label: 'Demolition Contractor Hampton, VA',
                  to: '/demolition-contractor-hampton-va/'
                },
                {label: 'Demolition Services Overview', to: '/demolition-services/'},
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

export default ConcreteRemoval;
