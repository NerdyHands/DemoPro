import {useState} from 'react';
import {Container, Row, Col, Form, Button, Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {trackFormSubmission} from '../config/gtm';
import SEOHead from '../components/SEO';
import {GOOGLE_APPS_SCRIPT_URL} from '../config/googleAppsScript';
import {getRecaptchaToken} from '../config/recaptcha';

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
  const [formLoadTime] = useState(Date.now()); // Track when form loads for spam detection

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = e.target;
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

    // if (!formData.email.trim()) {
    //   setAlertMessage('Email is required');
    //   setShowAlert(true);
    //   return false;
    // }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setAlertMessage('Please enter a valid email address');
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
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('contact_form');

      const scriptURL = GOOGLE_APPS_SCRIPT_URL;

      // Use URLSearchParams to encode form data
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('name', formData.name);
      formDataEncoded.append('email', formData.email);
      formDataEncoded.append('message', formData.message);
      formDataEncoded.append('form_type', 'contact_form');
      formDataEncoded.append('form_load_time', formLoadTime.toString()); // For spam detection
      formDataEncoded.append('website', ''); // Honeypot field (should be empty)
      formDataEncoded.append('recaptcha_token', recaptchaToken); // reCAPTCHA token

      // Submit using fetch with proper encoding
      // Google Apps Script web apps handle CORS automatically when deployed as "Anyone"
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script web apps
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDataEncoded.toString()
      });

      // With no-cors mode, we can't read the response, but the submission should succeed
      // Track successful form submission
      trackFormSubmission('contact_form', {
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      // Navigate to thank you page
      navigate('/thank-you');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setAlertMessage(
        'There was an error sending your message. Please try again.'
      );
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Mr Demo Pro - Free Demolition Estimates | Hampton Roads, VA"
        description="Get in touch with Mr Demo Pro for demolition, junk removal, shed, deck, or fence removal services in Hampton Roads, VA. Call or send a message today."
        canonicalUrl="https://mrdemopro.com/contact"
      />

      <div style={{paddingTop: '100px', minHeight: '100vh'}}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <motion.div
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
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
                    variant={
                      alertMessage.includes('Thank you') ? 'success' : 'danger'
                    }
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
                      style={{
                        color: 'var(--color-primary)',
                        fontWeight: 'bold'
                      }}
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
                      style={{
                        color: 'var(--color-primary)',
                        fontWeight: 'bold'
                      }}
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
                      style={{
                        color: 'var(--color-primary)',
                        fontWeight: 'bold'
                      }}
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

                  {/* Honeypot field - hidden from users but bots will fill it */}
                  <div style={{position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none'}}>
                    <label htmlFor="website">Website (leave blank)</label>
                    <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

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
                  <h5
                    style={{color: 'var(--color-primary)', fontWeight: 'bold'}}
                  >
                    Or Call Us Directly
                  </h5>

                  <a href="tel:757-848-4559">
                    <Button
                      size="lg"
                      variant="outline-light"
                      style={{
                        padding: '15px 40px',
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        borderRadius: '12px',
                        minWidth: '200px',
                        color: '#333',
                        backgroundColor: 'rgb(236 65 0 / 52%)'
                      }}
                    >
                      757-848-4559
                    </Button>
                  </a>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Contact;
