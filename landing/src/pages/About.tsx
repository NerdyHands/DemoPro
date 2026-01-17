import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';

const About = () => (
  <main>
    <section
      style={{
        padding: '80px 0 60px 0',
        background:
          'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-5 mb-lg-0">
            <motion.h1
              className="title-small fw-bold"
              initial={{opacity: 0, x: -50}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              style={{
                color: 'var(--color-primary)',
                marginBottom: '30px',
                fontSize: 'var(--font-size-4xl)'
              }}
            >
              About Mr Demo Pro
            </motion.h1>
            <motion.p
              className="lead"
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.3, duration: 0.6}}
              style={{
                fontSize: 'var(--font-size-lg)',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)'
              }}
            >
              Mr Demo Pro is a Hampton Roads demolition contractor focused on
              safe, reliable demolition services for homes and businesses. Our
              local crew handles everything from cleanouts to full structure
              removal with clear timelines and honest communication.
            </motion.p>
          </Col>
          <Col lg={6} md={12}>
            <motion.img
              className="img-fluid rounded"
              src="/assets/img/features/hampton-roads.webp"
              alt="Mr Demo Pro demolition contractor serving Hampton Roads"
              initial={{opacity: 0, x: 50}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.2, duration: 0.6}}
              style={{
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </Col>
        </Row>
      </Container>
    </section>

    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <motion.div
              className="feature-item h-100 p-4"
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h3 style={{color: 'var(--color-primary)'}}>Our Mission</h3>
              <p>
                Deliver safe, efficient demolition that keeps projects on time
                and properties clean.
              </p>
            </motion.div>
          </Col>
          <Col md={4} className="mb-4">
            <motion.div
              className="feature-item h-100 p-4"
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.1, duration: 0.5}}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h3 style={{color: 'var(--color-primary)'}}>What We Do</h3>
              <p>
                Building demolition, concrete removal, cleanouts, and specialty
                demolition services tailored to your property.
              </p>
            </motion.div>
          </Col>
          <Col md={4} className="mb-4">
            <motion.div
              className="feature-item h-100 p-4"
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.2, duration: 0.5}}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h3 style={{color: 'var(--color-primary)'}}>Service Area</h3>
              <p>
                We serve Hampton, Norfolk, Newport News, Yorktown, Chesapeake,
                and the greater Hampton Roads region.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>

    <section style={{padding: '80px 0'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={7} md={12} className="mb-4 mb-lg-0">
            <motion.h2
              className="title-small fw-bold"
              initial={{opacity: 0, x: -50}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.6}}
              style={{
                color: 'var(--color-primary)',
                marginBottom: '20px',
                fontSize: 'var(--font-size-3xl)'
              }}
            >
              Ready to start your demolition project?
            </motion.h2>
            <motion.p
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: 0.2, duration: 0.6}}
              style={{
                fontSize: 'var(--font-size-lg)',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)'
              }}
            >
              Get a free estimate from a local demolition contractor and see
              how we can help.
            </motion.p>
          </Col>
          <Col lg={5} md={12} className="text-lg-end">
            <Link to="/contact/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <Button
                size="lg"
                className="customButton large"
                style={{
                  padding: '15px 40px',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderRadius: '12px'
                }}
              >
                Contact Us
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  </main>
);

export default About;
