import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Services = () => {
  return (
    <div style={{ paddingTop: '100px' }}>
      <section id="key-features" style={{ padding: '80px 0 60px 0' }}>
        <Container className="text-center">
          <Row>
                        <Col xs={12}>
              <motion.h2 
                className="title-small fw-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ 
                  color: 'var(--color-primary)',
                  marginBottom: '60px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                Our Services
              </motion.h2>
            </Col>

            {/* Shed Removal Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/shed-removal.png" 
                    alt="Shed Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                                 <h3 style={{ color: 'var(--color-primary)' }}>Shed Removal</h3>
                <p className="flex-grow-1" style={{ textAlign: 'center' }}>
                  Outdated or unwanted sheds can be an eyesore and take up
                  valuable space in your yard. Our team is equipped to safely and efficiently remove any type of shed,
                  leaving your property clean and ready for new possibilities.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/shed-removal">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Deck Removal Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/deck-removal.png" 
                    alt="Deck Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                                 <h3 style={{ color: 'var(--color-primary)' }}>Deck Removal</h3>
                <p style={{ textAlign: 'center' }}>
                  Whether you're upgrading your outdoor space or dealing with a deteriorating
                  deck, we offer comprehensive deck removal services. Our team takes care of everything from disassembling
                  to removing rubbish so you can have a hassle-free experience.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/deck-removal">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Fence Removal Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/fence-removal.png" 
                    alt="Fence Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3 style={{ color: 'var(--color-primary)' }}>Fence Removal</h3>
                <p className="flex-grow-1" style={{ textAlign: 'center' }}>
                  Old or damaged fences can detract from your property's
                  appearance and security. We provide fast and effective fence removal services, clearing the way for new
                  installations or open spaces.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/fence-removal">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Interior Demo Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/hammer.png" 
                    alt="Interior Demo Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3 style={{ color: 'var(--color-primary)' }}>Interior Demo</h3>
                <p className="flex-grow-1" style={{ textAlign: 'center' }}>
                  Professional interior demolition services for renovations and remodeling.
                  We safely remove walls, fixtures, and interior structures to prepare
                  your space for new construction.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/interior-demo">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Junk Removal Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/trash.png" 
                    alt="Junk Removal Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3 style={{ color: 'var(--color-primary)' }}>Junk Removal</h3>
                <p className="flex-grow-1" style={{ textAlign: 'center' }}>
                  Fast and reliable junk removal services. We remove unwanted items
                  from your home or business, including furniture, appliances, and general junk.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/junk-removal">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>

            {/* Cleanout Service */}
            <Col lg={4} md={4} sm={4} xs={12} className="mb-5">
              <motion.div 
                className="feature-item h-100 p-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <img 
                    src="/assets/Icons/cleanout.png" 
                    alt="Cleanout Service by mrdemopro" 
                    width="128" 
                    height="128" 
                  />
                </div>
                <h3 style={{ color: 'var(--color-primary)' }}>Cleanout Services</h3>
                <p className="flex-grow-1" style={{ textAlign: 'center' }}>
                  Complete property cleanout and debris removal services. We handle
                  everything from estate cleanouts to construction debris removal,
                  leaving your property clean and ready.
                </p>
                <div className="html_button mt-auto">
                  <Link to="/cleanout">
                    <Button 
                      variant="primary"
                      style={{
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgb(242 124 80)',
                        border: 'none',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(242 124 80)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgb(242 124 80)';
                      }}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Services;
