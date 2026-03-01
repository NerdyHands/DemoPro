import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const BathroomDemolition = () => (
  <ServiceLandingPage
    title="Bathroom Demolition in Hampton Roads, VA"
    description="Mr Demo Pro provides selective bathroom demolition for remodels—tub and shower removal, vanity demo, tile removal, and full debris haul-off—throughout Hampton Roads."
    serviceType="Bathroom Demolition"
    heroImage={{
      src: '/assets/Icons/hammer.webp',
      alt: 'Bathroom demolition service by Mr Demo Pro',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Remodel-Ready Selective Demo',
        description:
          'We remove what needs to go while helping protect what you’re keeping for your renovation.'
      },
      {
        title: 'Tile, Fixtures, and Surrounds',
        description:
          'From tile and backer board to vanities and shower surrounds, we handle demo safely and efficiently.'
      },
      {
        title: 'Haul-Off Included',
        description:
          'We remove debris from the property so your project can move forward without a mess.'
      }
    ]}
    serviceIncludes={[
      'Tub and shower removal',
      'Vanity and countertop demo',
      'Tile and flooring removal',
      'Drywall and backer board removal',
      'Debris haul-off and cleanup'
    ]}
    processSteps={[
      {
        title: 'Scope the Demo',
        description:
          'We confirm what’s being removed and review access, disposal, and scheduling details.'
      },
      {
        title: 'Prep & Protection',
        description:
          'We prep the bathroom and adjacent areas to keep demolition controlled and organized.'
      },
      {
        title: 'Demolition & Load-Out',
        description:
          'Fixtures and finishes are removed efficiently and debris is staged for haul-off.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the space clean and ready for the next steps of your bathroom remodel.'
      }
    ]}
    ctaTitle="Ready to demo your bathroom?"
    ctaDescription="Request a free bathroom demolition quote in Hampton Roads."
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
              Pair bathroom demo with these services
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Many remodels include adjacent demo work. View{' '}
              <Link to="/services/">all services</Link> or jump to a related page:
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
                {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'},
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
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

export default BathroomDemolition;
