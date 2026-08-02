import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const KitchenDemolition = () => (
  <ServiceLandingPage
    title="Kitchen Demolition in Hampton Roads, VA"
    description="Planning a kitchen remodel in Hampton or elsewhere in Hampton Roads? Mr Demo Pro provides clean, controlled kitchen demolition including cabinet removal, countertop demo, flooring removal, and debris haul-off."
    serviceType="Kitchen Demolition"
    heroImage={{
      src: '/assets/Icons/hammer.webp',
      alt: 'Kitchen demolition service by Mr Demo Pro',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Controlled Demo for Remodels',
        description:
          'We focus on selective demolition to protect areas you’re keeping and keep the jobsite organized.'
      },
      {
        title: 'Dust & Debris Containment',
        description:
          'We help reduce mess with practical containment and maintain a safer work area during demolition.'
      },
      {
        title: 'Fast Haul-Off & Cleanup',
        description:
          'Demo is only half the job. We remove debris and leave your space ready for the next trade.'
      }
    ]}
    serviceIncludes={[
      'Cabinet and vanity removal',
      'Countertop removal (laminate, stone, or composite)',
      'Appliance disconnect coordination (as needed)',
      'Tile, flooring, and drywall removal',
      'Debris haul-off and final cleanup'
    ]}
    processSteps={[
      {
        title: 'Share Remodel Scope',
        description:
          'Tell us what’s staying and what’s going so we can plan a selective demolition approach.'
      },
      {
        title: 'Site Prep & Protection',
        description:
          'We prep the work area, protect adjacent rooms, and set expectations for access and timelines.'
      },
      {
        title: 'Demolition & Removal',
        description:
          'Our crew removes cabinets, counters, flooring, and fixtures efficiently while keeping debris controlled.'
      },
      {
        title: 'Cleanup & Ready-to-Build',
        description:
          'We haul off debris and leave the kitchen ready for framing, plumbing, electrical, or install teams.'
      }
    ]}
    ctaTitle="Need kitchen demolition for your remodel?"
    ctaDescription="Get a fast, free quote for kitchen demolition in Hampton Roads."
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
              If your remodel includes more than the kitchen, explore these
              services or view all options on our{' '}
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
                {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'},
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

export default KitchenDemolition;
