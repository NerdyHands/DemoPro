import {useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {motion} from 'framer-motion';
import QuoteForm from '../components/QuoteForm';

const ShedRemoval = () => {
  const [showForm, setShowForm] = useState(false);

  const features = [
    {
      icon: '⚡',
      title: 'Fast & Efficient',
      desc: 'Our experienced team works quickly and efficiently to remove your shed in a single visit, minimizing disruption to your daily routine.'
    },
    {
      icon: '🛡️',
      title: 'Safe & Professional',
      desc: 'We use proper safety equipment and techniques to ensure the removal process is safe for our team and your property.'
    },
    {
      icon: '🧹',
      title: 'Complete Cleanup',
      desc: "We don't just remove the shed - we clean up all debris and materials, leaving your property spotless and ready for new projects."
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Assessment',
      desc: 'We evaluate your shed and property to determine the best removal approach.'
    },
    {
      number: 2,
      title: 'Preparation',
      desc: 'We secure the area and prepare the necessary equipment for safe removal.'
    },
    {
      number: 3,
      title: 'Removal',
      desc: 'Our team carefully dismantles and removes the shed using professional techniques.'
    },
    {
      number: 4,
      title: 'Cleanup',
      desc: 'We thoroughly clean the area, removing all debris and leaving it spotless.'
    }
  ];

  return (
    <div itemProp="offers" >
      {/* Hero Section */}
      <section
        itemScope
        itemType="https://schema.org/Service"
        aria-labelledby="shed-removal-heading"
        style={{
          padding: '80px 0 60px 0',
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
        }}
      >
         <meta itemProp="areaServed" content="Hampton Roads, VA" />
        <meta itemProp="provider" content="MrDemoPro" />
        <meta itemProp="serviceType" content="Shed Removal" />
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-5 mb-lg-0">
              <motion.h1
              itemProp="name"
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
                Professional Shed Removal Services
              </motion.h1>
              <motion.p
                itemProp="description"
                className="lead"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px'
                }}
              >
                Transform your outdoor space with our professional shed removal
                services. We safely and efficiently remove unwanted sheds,
                leaving your property clean and ready for new possibilities.
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Button
                  size="lg"
                  className="customButton large"
                  onClick={() => setShowForm(!showForm)}
                  aria-label="Get a free shed removal quote in Hampton Roads"
                  style={{
                    padding: '15px 40px',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: '12px',
                    marginRight: '20px'
                  }}
                >
                  Get Free Quote
                </Button>
                <a
                  href="tel:757-848-4559"
                  aria-label="Call for shed removal services in Hampton Roads"
                >
                  <Button
                    variant="outline-primary"
                    size="lg"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    📞 Call Now
                  </Button>
                </a>
              </motion.div>
            </Col>
            <Col lg={6} md={12}>
              {showForm ? (
                <QuoteForm serviceType="Shed Removal" inline={true} />
              ) : (
                <motion.img
                  className="img-fluid rounded"
                  src="/assets/Icons/shed-removal.webp"
                  alt="Professional Shed Removal Services"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
                  style={{
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '400px'
                  }}
                />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Overview */}
      <section
        style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}
      >
        <Container>
          <Row>
            <Col xs={12}>
              <motion.h2
                className="title-small text-center fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Why Choose Our Shed Removal Service?
              </motion.h2>
            </Col>
          </Row>

          <Row>
            {features.map((feature, idx) => (
              <Col key={idx} lg={4} md={6} sm={6} xs={12} className="mb-5">
                <motion.div
                  className="feature-item h-100 p-4"
                  initial={{opacity: 0, y: 50}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div className="mb-3 text-center">
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: 'white',
                        fontSize: '24px'
                      }}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <h3
                    style={{
                      color: 'var(--color-primary)',
                      textAlign: 'center',
                      marginBottom: '20px'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{textAlign: 'center', flexGrow: 1}}>
                    {feature.desc}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Process Section */}
      <section style={{padding: '80px 0'}}>
        <Container>
          <Row>
            <Col xs={12}>
              <motion.h2
                className="title-small text-center fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Our Shed Removal Process
              </motion.h2>
            </Col>
          </Row>

          <Row>
            {steps.map((step, idx) => (
              <Col key={idx} lg={3} md={6} sm={6} xs={12} className="mb-5">
                <motion.div
                  className="text-center"
                  initial={{opacity: 0, y: 30}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
                >
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: 'bold'
                    }}
                  >
                    {step.number}
                  </div>
                  <div itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                  <h4
                    style={{
                      color: 'var(--color-text-primary)',
                      marginBottom: '15px'
                    }}
                  >
                    {step.title}
                  </h4>
                  <p style={{color: 'var(--color-text-secondary)'}}>
                    {step.desc}
                  </p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '80px 0',
          backgroundColor: 'var(--color-primary)',
          color: 'white'
        }}
      >
        <Container>
          <Row className="text-center">
            <Col xs={12}>
              <motion.h2
                className="title-small fw-bold"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{duration: 0.6}}
                style={{
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Ready to Transform Your Space?
              </motion.h2>
              <motion.p
                className="lead"
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.6}}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: '40px',
                  opacity: 0.9,
                  color: '#fff'
                }}
              >
                Get your free quote today and reclaim your outdoor space!
              </motion.p>
              <motion.div
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                transition={{delay: 0.5, duration: 0.6}}
              >
                <Button
                  size="lg"
                  variant="light"
                  onClick={() => {
                    setShowForm(!showForm);
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  }}
                   aria-label="Get free shed removal quote in Hampton Roads"
                  style={{
                    padding: '15px 40px',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: '12px',
                    marginRight: '20px'
                  }}
                >
                  Get Free Quote
                </Button>
                <a href="tel:757-848-4559"
                 aria-label="Call for Shed removal services"
                >
                  <Button
                    size="lg"
                    variant="outline-light"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px'
                    }}
                  >
                    📞 Call 757-848-4559
                  </Button>
                </a>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ShedRemoval;
