import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Button, Col, Container, Row} from 'react-bootstrap';
import {CITY_LEAVES, HUBS} from '../config/siteStructure';

const Services = () => {
  const scrollTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

  const services = [
    {
      title: 'Shed Removal',
      img: '/assets/Icons/shed-removal.webp',
      link: '/services/shed-removal/',
      aria: 'Get a shed removal quote in Hampton Roads',
      desc: 'Outdated or unwanted sheds can be an eyesore and take up valuable space in your yard. Our team is equipped to safely and efficiently remove any type of shed, leaving your property clean and ready for new possibilities.'
    },
    {
      title: 'Deck Removal',
      img: '/assets/Icons/deck-removal.webp',
      link: '/services/deck-removal/',
      aria: 'Get a deck removal quote in Hampton Roads',
      desc: "Whether you're upgrading your outdoor space or dealing with a deteriorating deck, we offer comprehensive deck removal services. Our team takes care of everything from disassembling to removing rubbish so you can have a hassle-free experience."
    },
    {
      title: 'Fence Removal',
      img: '/assets/Icons/fence-removal.webp',
      link: '/services/fence-removal/',
      aria: 'Get a fence removal quote in Hampton Roads',
      desc: "Old or damaged fences can detract from your property's appearance and security. We provide fast and effective fence removal services, clearing the way for new installations or open spaces."
    },
    {
      title: 'Interior Demolition',
      img: '/assets/Icons/hammer.webp',
      link: '/services/interior-demo/',
      aria: 'Get an interior demolition quote in Hampton Roads',
      desc: 'Professional interior demolition services for renovations and remodeling. We safely remove walls, fixtures, and interior structures to prepare your space for new construction.'
    },
    {
      title: 'Kitchen Demolition',
      img: '/assets/Icons/hammer.webp',
      link: '/services/kitchen-demolition/',
      aria: 'Get a kitchen demolition quote in Hampton Roads',
      desc: 'Kitchen demolition for remodels including cabinet removal, countertop demo, flooring removal, and debris haul-off—so your renovation can move fast.'
    },
    {
      title: 'Bathroom Demolition',
      img: '/assets/Icons/hammer.webp',
      link: '/services/bathroom-demolition/',
      aria: 'Get a bathroom demolition quote in Hampton Roads',
      desc: 'Selective bathroom demolition for renovations: tub and shower removal, vanity demo, tile and flooring removal, plus cleanup and haul-off.'
    },
    {
      title: 'Garage Demolition',
      img: '/assets/Icons/fence-removal.webp',
      link: '/services/garage-demolition/',
      aria: 'Get a garage demolition quote in Hampton Roads',
      desc: 'Detached or attached garage demolition with debris removal. We keep the jobsite clean and leave your property ready for what’s next.'
    },
    {
      title: 'House Demolition',
      img: '/assets/img/features/hampton-roads.webp',
      link: '/services/house-demolition/',
      aria: 'Get a house demolition quote in Hampton Roads',
      desc: 'Whole house demolition with full teardown, foundation removal, debris haul-off, and permit coordination across Hampton Roads.'
    },
    {
      title: 'Concrete Removal',
      img: '/assets/img/features/services-overview.webp',
      link: '/services/concrete-removal/',
      aria: 'Get a concrete removal quote in Hampton Roads',
      desc: 'Concrete removal for driveways, patios, walkways, slabs, and small foundations. Breakup, load-out, haul-off, and cleanup included.'
    },
    {
      title: 'Commercial Interior Demolition',
      img: '/assets/img/features/services-overview.webp',
      link: '/services/commercial-interior-demolition/',
      aria: 'Get a commercial interior demolition quote in Hampton Roads',
      desc: 'Commercial interior demo and strip-outs for offices and retail. Selective removal, debris haul-off, and a clean space ready for build-back.'
    },
    {
      title: 'Junk Removal',
      img: '/assets/Icons/trash.webp',
      link: '/services/junk-removal/',
      aria: 'Get a junk removal quote in Hampton Roads',
      desc: 'Fast and reliable junk removal services. We remove unwanted items from your home or business, including furniture, appliances, and general junk.'
    },
    {
      title: 'Cleanout Services',
      img: '/assets/Icons/cleanout.webp',
      link: '/services/cleanout/',
      aria: 'Get a property cleanout quote in Hampton Roads',
      desc: 'Complete property cleanout and debris removal services. We handle everything from estate cleanouts to construction debris removal, leaving your property clean and ready.'
    },
    {
      title: 'Construction Debris Removal',
      img: '/assets/Icons/trash.webp',
      link: '/services/construction-debris-removal/',
      aria: 'Get a construction debris removal quote in Hampton Roads',
      desc: 'Renovation debris, contractor cleanup, and job site cleanout with load-and-haul. We clear construction waste so your next phase can start on a clean site.'
    },
    {
      title: 'Hoarding Cleanout',
      img: '/assets/Icons/cleanout.webp',
      link: '/services/hoarding-cleanout/',
      aria: 'Get a hoarding cleanout quote in Hampton Roads',
      desc: 'Discreet, compassionate hoarding cleanout for heavily cluttered homes. We sort keepsakes, haul away debris, and leave the property clean and move-in ready.'
    }
  ];

  return (
    <section id="services" aria-labelledby="services-heading" className="py-5">
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <motion.h1
              id="services-heading"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.6}}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-4xl)',
                fontWeight: 'bold'
              }}
            >
              Demolition Services in Hampton Roads, VA
            </motion.h1>
            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.2, duration: 0.6}}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-lg)',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              Browse our specialty services below, then jump to the{' '}
              <Link to={HUBS.serviceAreas.path} onClick={scrollTop}>
                service areas hub
              </Link>{' '}
              for city-specific demolition pages across Hampton Roads. For a
              broader overview, see{' '}
              <Link to="/demolition-services/" onClick={scrollTop}>
                demolition services
              </Link>
              .
            </motion.p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <div
              style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h2
                style={{
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-2xl)',
                  marginBottom: '16px'
                }}
              >
                Local demolition pages
              </h2>
              <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.65}}>
                Need a demolition contractor by city? Start with{' '}
                {CITY_LEAVES.map((city, index, list) => (
                  <span key={city.path}>
                    <Link to={city.path} onClick={scrollTop}>
                      {city.label.replace(', VA', '')}
                    </Link>
                    {index < list.length - 1 ? ', ' : '.'}
                  </span>
                ))}
                {' '}For budget planning, read our{' '}
                <Link to="/demolition-cost-virginia/" onClick={scrollTop}>
                  Virginia demolition cost guide
                </Link>
                .
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          {services.map((service, index) => (
            <Col key={service.title} lg={4} md={6} sm={12} className="mb-5">
              <motion.div
                itemScope
                itemType="https://schema.org/Service"
                className="feature-item h-100 p-4 text-center"
                initial={{opacity: 0, y: 40}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.2, duration: 0.5}}
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <img
                  src={service.img}
                  alt={`${service.title} in Hampton Roads by MrDemoPro`}
                  width="128"
                  height="128"
                  loading="lazy"
                  className="mb-3 mx-auto"
                />

                <h3 itemProp="name" style={{color: 'var(--color-primary)'}}>
                  {service.title}
                </h3>

                <p itemProp="description" className="flex-grow-1">
                  {service.desc}
                </p>

                <Link
                  to={service.link}
                  onClick={scrollTop}
                  aria-label={service.aria}
                >
                  <Button type="button" className="service-btn">
                    Get Quote
                  </Button>
                </Link>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Services;
