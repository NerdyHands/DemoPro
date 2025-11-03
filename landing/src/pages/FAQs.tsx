import { Container, Row, Col, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FAQs = () => {
  return (
    <div style={{  }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '80px 0 60px 0',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)'
      }}>
        <Container>
          <Row className="text-center">
            <Col xs={12}>
              <motion.h1 
                className="title-small fw-bold"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Frequently Asked Questions
              </motion.h1>
              <motion.p 
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px',
                  maxWidth: '800px',
                  margin: '0 auto 40px'
                }}
              >
                Find answers to common questions about our demolition services. 
                If you don't see what you're looking for, feel free to contact us directly.
              </motion.p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQs Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--color-surface)' }}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Accordion>
                  {/* General Service Questions */}
                  <Accordion.Item eventKey="0" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      What areas do you serve?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We proudly serve the Hampton Roads region including Norfolk, Virginia Beach, Chesapeake, Newport News, Hampton and surrounding areas. We provide professional demolition services throughout the entire Hampton Roads area.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      How quickly can you complete a demolition project?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Most projects can be completed in a single day. Our experienced team works efficiently to minimize disruption to your daily routine. The exact timeline depends on the size and complexity of the structure being removed.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Do you provide free quotes?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Yes! We offer free, no-obligation quotes for all our demolition services. Contact us today to schedule a consultation and get your free estimate.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Shed Removal Questions */}
                  <Accordion.Item eventKey="3" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      What types of sheds can you remove?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We can remove any type of shed - wooden, metal, plastic, or composite. Our team is equipped to safely and efficiently remove sheds of all sizes and conditions, from small garden sheds to large storage buildings.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="4" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Do you clean up after shed removal?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Absolutely! We don't just remove the shed - we clean up all debris and materials, leaving your property spotless and ready for new projects. Our complete cleanup service includes removing all nails, screws, and construction materials.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Deck Removal Questions */}
                  <Accordion.Item eventKey="5" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      How do you remove deck posts and footings?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We carefully remove all deck posts and concrete footings from the ground. Our process includes dismantling the deck structure, removing posts, and extracting concrete footings to ensure your yard is completely clear and ready for new projects.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="6" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Will deck removal damage my property?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      No, our expert team carefully dismantles your deck piece by piece, ensuring no damage to your property or surrounding structures. We use proper safety equipment and techniques throughout the entire process.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Fence Removal Questions */}
                  <Accordion.Item eventKey="7" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Can you remove concrete fence posts?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Yes, we can remove all types of fence posts including concrete footings. Our team has the equipment and expertise to extract concrete posts and footings, leaving your property clean and ready for new installations or landscaping.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="8" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Do you handle fence gates and hardware?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Yes, we remove all fence components including panels, gates, and hardware. Our complete removal service ensures that all fence materials, posts, and debris are properly disposed of, leaving your property clean and ready for new installations.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Safety and Insurance Questions */}
                  <Accordion.Item eventKey="9" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Are you licensed and insured?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Yes, we are fully licensed and insured. We carry comprehensive liability insurance to protect your property and our team during all demolition projects. Safety is our top priority.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="10" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      What safety measures do you take?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We use proper safety equipment and techniques to ensure the removal process is safe for our team and your property. This includes safety gear, proper tools, and careful planning to prevent any damage or accidents.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Pricing and Payment Questions */}
                  <Accordion.Item eventKey="11" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      How do you determine pricing?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      Pricing is based on several factors including the size and type of structure, accessibility, complexity of removal, and cleanup requirements. We provide transparent, upfront pricing with no hidden fees.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="12" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      What payment methods do you accept?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We accept cash, checks, and major credit cards. Payment is typically due upon completion of the project. We also offer flexible payment options for larger projects.
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Scheduling Questions */}
                  <Accordion.Item eventKey="13" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      How far in advance should I schedule?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We recommend scheduling at least a few days in advance, especially during peak season. However, we do our best to accommodate urgent requests when possible. Contact us to check our current availability.
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="14" style={{ marginBottom: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <Accordion.Header style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                      Do you work in all weather conditions?
                    </Accordion.Header>
                    <Accordion.Body style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                      We work in most weather conditions, but may need to reschedule in cases of severe weather for safety reasons. We'll communicate with you if weather conditions affect our schedule.
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact CTA Section */}
      <section style={{ 
        padding: '80px 0',
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      }}>
        <Container>
          <Row className="text-center">
            <Col xs={12}>
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-3xl)'
                }}
              >
                Still Have Questions?
              </motion.h2>
              <motion.p 
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-lg)',
                  color:"#fff",
                  marginBottom: '40px',
                  opacity: 0.9,
               
                }}
              >
                Can't find the answer you're looking for? Contact us directly and we'll be happy to help!
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link to="/contact">
                  <button 
                    className="btn btn-light btn-lg"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      marginRight: '20px',
                      border: 'none'
                    }}
                  >
                    Contact Us
                  </button>
                </Link>
                <a href="tel:757-848-4559">

                  
                  <button 
                    className="btn btn-outline-light btn-lg"
                    style={{
                      padding: '15px 40px',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      border: '2px solid white',
                      gap:"10px"
                    }}
                  >
                     <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.06 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12 1.05.35 2.07.68 3.05a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.98.33 2 .56 3.05.68A2 2 0 0 1 22 16.92z"
      fill="#fff"
    />
  </svg>
                  757-848-4559
                  </button>
                </a>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default FAQs;
