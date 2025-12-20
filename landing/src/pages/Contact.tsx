import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackFormSubmission } from '../config/gtm';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setAlertMessage('Name is required');
      setShowAlert(true);
      return false;
    }
    
    if (/\d/.test(formData.name)) {
      setAlertMessage('Error: Name should not contain numbers');
      setShowAlert(true);
      return false;
    }

    if (!formData.email.trim()) {
      setAlertMessage('Email is required');
      setShowAlert(true);
      return false;
    }

    if (!formData.message.trim()) {
      setAlertMessage('Message is required');
      setShowAlert(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Using the same Google Sheets endpoint from the original
      const scriptURL = "https://script.google.com/macros/s/AKfycbwxdfDsv0GMztRmpg6r0Jmocw9MuHelOfZFImoXtxtE5kHbCcWhVmX_Ue3eWokw5WZdAA/exec";
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('form_type', 'contact_form');

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Track successful form submission
        trackFormSubmission('contact_form', {
          name: formData.name,
          email: formData.email,
          message: formData.message
        });
        navigate('/thank-you');
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage('There was an error sending your message. Please try again.');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
                          <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-5 shadow rounded"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)'
                }}
              >
              <div className="text-center mb-4">
                                 <h3 
                   style={{ 
                     fontWeight: 'bold', 
                     lineHeight: 0.9, 
                     color: 'var(--color-primary)' 
                   }}
                 >
                  Contact Us
                </h3>
              </div>

              {showAlert && (
                <Alert 
                  variant={alertMessage.includes('Thank you') ? 'success' : 'danger'}
                  onClose={() => setShowAlert(false)}
                  dismissible
                >
                  {alertMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                                     <Form.Label 
                     htmlFor="name"
                     style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                   >
                    Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                                     <Form.Label 
                     htmlFor="email"
                     style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                   >
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                                     <Form.Label 
                     htmlFor="message"
                     style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                   >
                    Message
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    id="message"
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                                         style={{
                       backgroundColor: 'var(--color-primary)',
                       color: '#ffffff',
                       border: 'none',
                       borderRadius: '5px',
                       fontWeight: 'bold',
                       boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
                       padding: '12px 30px',
                       fontSize: '18px',
                       lineHeight: '1.33',
                       transition: 'all 0.3s ease'
                     }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <hr />
                                 <h5 style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Or Call Us Directly
                </h5>
                <a 
                  href="tel:757-848-4559" 
                                     style={{ 
                     color: 'var(--color-primary)', 
                     textDecoration: 'none', 
                     fontSize: '1.5rem', 
                     fontWeight: 'bold' 
                   }}
                >
                  📞 757-848-4559
                </a>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
