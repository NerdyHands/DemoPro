import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const CommercialInteriorDemolition = () => (
  <ServiceLandingPage
    title="Commercial Interior Demolition in Hampton Roads, VA"
    description="Mr Demo Pro provides commercial interior demolition and strip-outs in Hampton Roads—including Hampton, VA—for offices, retail, and tenant improvements. We keep projects clean, organized, and on schedule with debris haul-off included."
    serviceType="Commercial Interior Demolition"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Commercial interior demolition and strip out services by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Selective Demo & Strip-Outs',
        description:
          'We remove non-structural components to prepare your space for build-back and renovations.'
      },
      {
        title: 'Schedule-Friendly Execution',
        description:
          'We coordinate around access, tenants, and site rules to help keep timelines predictable.'
      },
      {
        title: 'Debris Haul-Off Included',
        description:
          'We handle removal and disposal so your team can focus on the build.'
      }
    ]}
    serviceIncludes={[
      'Office and retail strip-outs',
      'Non-structural wall and drywall removal',
      'Ceiling grid and flooring removal',
      'Fixture and casework removal (as scoped)',
      'Debris haul-off and cleanup'
    ]}
    processSteps={[
      {
        title: 'Walkthrough & Scope',
        description:
          'We confirm the demo scope, access rules, and any required building coordination.'
      },
      {
        title: 'Prep & Containment',
        description:
          'We prep the site to keep demolition controlled and reduce disruption.'
      },
      {
        title: 'Demolition & Load-Out',
        description:
          'Selective demolition is completed efficiently and debris is removed from the site.'
      },
      {
        title: 'Clean, Ready Space',
        description:
          'We leave a clean interior ready for framing, MEP work, and build-back.'
      }
    ]}
    ctaTitle="Need a commercial strip-out quote?"
    ctaDescription="Request a free commercial interior demolition estimate in Hampton Roads."
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
              Related demolition services
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Explore related work or view <Link to="/services/">all services</Link>.
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
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Commercial Demolition (Full)', to: '/commercial-demolition/'}
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

export default CommercialInteriorDemolition;
