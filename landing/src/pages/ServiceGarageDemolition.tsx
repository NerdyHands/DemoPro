import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const ServiceGarageDemolition = () => (
  <ServiceLandingPage
    title="Garage Demolition in Hampton Roads, VA"
    description="Need a garage removed as part of a renovation or property cleanup? Mr Demo Pro handles detached and attached garage demolition, slab removal options, and debris haul-off across Hampton Roads."
    serviceType="Garage Demolition"
    heroImage={{
      src: '/assets/Icons/fence-removal.webp',
      alt: 'Garage demolition service by Mr Demo Pro',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Detached or Attached Garages',
        description:
          'We tailor the demolition plan based on access, layout, and what structures must remain.'
      },
      {
        title: 'Safety & Utility Coordination',
        description:
          'We help coordinate proper disconnection and prioritize safe work practices on every site.'
      },
      {
        title: 'Cleanup Included',
        description:
          'We remove debris and keep the job moving so your property is ready for what’s next.'
      }
    ]}
    serviceIncludes={[
      'Detached garage demolition',
      'Attached garage demolition (selective, as scoped)',
      'Concrete slab removal options',
      'Haul-off, disposal, and cleanup'
    ]}
    processSteps={[
      {
        title: 'Site Review',
        description:
          'We review access, materials, and any utility connections to plan the safest approach.'
      },
      {
        title: 'Prep & Protection',
        description:
          'Work areas are secured and adjacent structures are protected based on the scope.'
      },
      {
        title: 'Demolition & Load-Out',
        description:
          'We remove the structure efficiently and stage debris for haul-off.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the area clear and ready for construction, a new garage, or landscaping.'
      }
    ]}
    ctaTitle="Need garage demolition?"
    ctaDescription="Get a free garage demolition quote in Hampton Roads."
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
              Looking for other demo work?
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Explore related demolition services or view the full list on our{' '}
              <Link to="/services/">services page</Link>.
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
                {label: 'Concrete Removal', to: '/services/concrete-removal/'},
                {label: 'Commercial Interior Demolition', to: '/services/commercial-interior-demolition/'},
                {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
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

export default ServiceGarageDemolition;
