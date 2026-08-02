import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import PhoneLink from '../components/PhoneLink';
import {useScrollDepth} from '../hooks/useScrollDepth';

const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

const factors = [
  'Structure size, material type, and how much must be separated or hand-loaded',
  'Access for trucks, trailers, tools, and debris staging',
  'Disposal weight, dump fees, recycling options, and haul distance',
  'Whether utilities, permits, dust control, or protection are part of the scope',
  'How clean the final handoff needs to be for the next contractor or project phase'
];

const exampleScopes = [
  {
    title: 'Small selective interior demolition',
    copy:
      'Bathroom, kitchen, flooring, cabinet, or fixture removal usually prices around labor, protection, and load-out complexity.'
  },
  {
    title: 'Shed, deck, fence, or garage removal',
    copy:
      'Outdoor removal work depends on size, materials, concrete footings or pads, access, and how much debris must be hauled.'
  },
  {
    title: 'Concrete removal',
    copy:
      'Patios, walkways, slabs, and driveway sections are heavily influenced by thickness, reinforcement, equipment access, and disposal weight.'
  }
];

const DemolitionCostVirginia = () => {
  useScrollDepth('other');

  return (
    <main>
      <section
        aria-labelledby="demolition-cost-heading"
        style={{
          padding: '80px 0 60px 0',
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <p className="eyebrow">Demolition Pricing Guide</p>
              <h1
                id="demolition-cost-heading"
                className="title-small fw-bold"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-4xl)',
                  marginBottom: '24px'
                }}
              >
                How Much Does Demolition Cost in Virginia?
              </h1>
              <p
                className="lead"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: 860,
                  margin: '0 auto'
                }}
              >
                Demolition pricing in Virginia depends on scope, access, debris,
                disposal, safety planning, and cleanup expectations. Mr Demo Pro
                gives project-specific quotes across Hampton Roads so you know
                what is included before work starts.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section style={{padding: '70px 0'}}>
        <Container>
          <Row className="g-4">
            <Col lg={6}>
              <h2 style={{color: 'var(--color-primary)', marginBottom: '20px'}}>
                Main cost factors
              </h2>
              <ul style={{lineHeight: 1.8, color: 'var(--color-text-secondary)'}}>
                {factors.map(factor => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            </Col>
            <Col lg={6}>
              <div
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h2 style={{color: 'var(--color-primary)', marginBottom: '16px'}}>
                  Why square footage is not enough
                </h2>
                <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.7}}>
                  Two projects with the same square footage can price differently
                  if one requires hand-loading through a finished home, heavy
                  concrete disposal, utility coordination, or extra dust control.
                  Photos, measurements, and access notes help us quote faster and
                  more accurately.
                </p>
                <PhoneLink
                  ctaLocation="demolition_cost_guide"
                  ctaLabel="Call for pricing estimate"
                  serviceName="Demolition Pricing"
                >
                  Call 757-848-4559 for a free estimate
                </PhoneLink>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section style={{padding: '70px 0', backgroundColor: 'var(--color-surface)'}}>
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 style={{color: 'var(--color-primary)'}}>
                Common Hampton Roads demolition scopes
              </h2>
            </Col>
          </Row>
          <Row className="g-4">
            {exampleScopes.map(scope => (
              <Col key={scope.title} lg={4} md={6}>
                <article
                  style={{
                    height: '100%',
                    padding: '24px',
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h3 style={{color: 'var(--color-text-primary)'}}>{scope.title}</h3>
                  <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.65}}>
                    {scope.copy}
                  </p>
                </article>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section style={{padding: '70px 0'}}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <h2 style={{color: 'var(--color-primary)', marginBottom: '20px'}}>
                Get a more accurate number
              </h2>
              <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.7}}>
                The fastest way to get a useful estimate is to send photos, rough
                dimensions, the address or city, and notes about access. You can
                also compare service pages for{' '}
                <Link to="/services/interior-demo/" onClick={scrollTop}>
                  interior demolition
                </Link>
                ,{' '}
                <Link to="/services/concrete-removal/" onClick={scrollTop}>
                  concrete removal
                </Link>
                ,{' '}
                <Link to="/services/garage-demolition/" onClick={scrollTop}>
                  garage demolition
                </Link>
                , or our{' '}
                <Link to="/service-area/" onClick={scrollTop}>
                  Hampton Roads service-area hub
                </Link>
                .
              </p>
              <Link to="/contact/" onClick={scrollTop} className="btn btn-primary">
                Request a Free Quote
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default DemolitionCostVirginia;
