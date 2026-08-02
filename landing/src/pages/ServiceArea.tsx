import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';
import {useScrollDepth} from '../hooks/useScrollDepth';

const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

const cities = [
  {
    name: 'Hampton',
    path: CITY_PATHS.hampton,
    blurb:
      'Residential and commercial demolition, selective interior demo, concrete removal, and haul-off—responsive scheduling across Hampton.'
  },
  {
    name: 'Newport News',
    path: CITY_PATHS.newportNews,
    blurb:
      'Garage and outbuilding demolition, remodel tear-outs, and debris removal with clear communication for Newport News homeowners and contractors.'
  },
  {
    name: 'Norfolk',
    path: CITY_PATHS.norfolk,
    blurb:
      'Interior strip-outs, concrete removal, and cleanup-focused demolition work serving Norfolk neighborhoods and jobsites.'
  },
  {
    name: 'Virginia Beach',
    path: CITY_PATHS.virginiaBeach,
    blurb:
      'Interior demolition, concrete removal, garage demolition, and debris haul-off for Virginia Beach homes, rentals, and commercial spaces.'
  },
  {
    name: 'Chesapeake',
    path: CITY_PATHS.chesapeake,
    blurb:
      'Selective demolition, shed and garage removals, concrete tear-outs, and clean jobsite handoffs across Chesapeake.'
  },
  {
    name: 'Portsmouth',
    path: CITY_PATHS.portsmouth,
    blurb:
      'Remodel tear-outs, commercial strip-outs, concrete removal, and haul-off for Portsmouth properties and contractors.'
  },
  {
    name: 'Suffolk',
    path: CITY_PATHS.suffolk,
    blurb:
      'Small-structure demolition, interior removals, concrete work, and disposal planning for Suffolk homes and larger lots.'
  }
];

const ServiceArea = () => {
  useScrollDepth('location');

  return (
  <main>
    <section
      aria-labelledby="service-area-heading"
      style={{
        padding: '80px 0 48px 0',
        background:
          'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
      }}
    >
      <Container>
        <Row className="text-center">
          <Col>
            <motion.h1
              id="service-area-heading"
              className="title-small fw-bold"
              initial={{opacity: 0, y: -12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-4xl)',
                marginBottom: '24px'
              }}
            >
              Demolition Service Areas in Hampton Roads, VA
            </motion.h1>
            <motion.p
              className="lead mx-auto"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.15, duration: 0.5}}
              style={{
                maxWidth: '820px',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-lg)',
                lineHeight: 1.6
              }}
            >
              Mr Demo Pro is a local demolition contractor serving Hampton Roads. Use this hub
              to jump into city-specific pages—we intentionally link between Hampton,
              Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, and Suffolk
              so you can find intent-matched information quickly.
            </motion.p>
          </Col>
        </Row>
      </Container>
    </section>

    <section style={{padding: '48px 0 80px 0'}}>
      <Container>
        <Row className="g-4">
          {cities.map((city, index) => (
            <Col key={city.path} lg={4} md={6}>
              <motion.article
                initial={{opacity: 0, y: 24}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: index * 0.08, duration: 0.45}}
                style={{
                  height: '100%',
                  padding: '28px 24px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h2
                  style={{
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-2xl)',
                    marginBottom: '12px'
                  }}
                >
                  {city.name}
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    flexGrow: 1,
                    lineHeight: 1.6,
                    marginBottom: '20px'
                  }}
                >
                  {city.blurb}
                </p>
                <Link
                  to={city.path}
                  onClick={scrollTop}
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textDecoration: 'none'
                  }}
                >
                  View demolition in {city.name}, VA →
                </Link>
              </motion.article>
            </Col>
          ))}
        </Row>

        <Row className="mt-5">
          <Col lg={10} className="mx-auto">
            <motion.div
              initial={{opacity: 0}}
              whileInView={{opacity: 1}}
              viewport={{once: true}}
              transition={{duration: 0.5}}
              style={{
                padding: '28px 24px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h2
                style={{
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-2xl)',
                  marginBottom: '12px'
                }}
              >
                Cross-links for local search
              </h2>
              <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.65}}>
                We also serve nearby areas like{' '}
                <Link to={CITY_PATHS.newportNews} onClick={scrollTop}>
                  Newport News
                </Link>{' '}
                and{' '}
                <Link to={CITY_PATHS.virginiaBeach} onClick={scrollTop}>
                  Virginia Beach
                </Link>{' '}
                from our Hampton Roads base. If you are comparing contractors,
                start on your city page, then browse{' '}
                <Link to="/demolition-services/" onClick={scrollTop}>
                  full demolition services
                </Link>{' '}
                or{' '}
                <Link to="/services/" onClick={scrollTop}>
                  specialty service pages
                </Link>{' '}
                (shed removal, deck removal, kitchen demo, and more).
              </p>
              <p style={{color: 'var(--color-text-secondary)', marginBottom: 0, lineHeight: 1.65}}>
                This hub lives at{' '}
                <strong>{SERVICE_AREA_HUB_PATH}</strong>—bookmark it if you manage multiple
                properties across the region.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  </main>
  );
};

export default ServiceArea;
