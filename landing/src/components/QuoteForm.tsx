import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackFormSubmission } from '../config/gtm';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/googleAppsScript';
import { getRecaptchaToken } from '../config/recaptcha';

interface QuoteFormProps {
  serviceType: string;
  showTitle?: boolean;
  inline?: boolean;
}

const QuoteForm = ({ serviceType, showTitle = true, inline = false }: QuoteFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    contact: '',
    serviceType: serviceType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime] = useState(Date.now()); // Track when form loads for spam detection

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('quote_request');

      const scriptURL = GOOGLE_APPS_SCRIPT_URL;

      // Use URLSearchParams to encode form data
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('address', formData.address);
      formDataEncoded.append('contact', formData.contact);
      formDataEncoded.append('service_type', formData.serviceType);
      formDataEncoded.append('form_type', 'quote_request');
      formDataEncoded.append('form_load_time', formLoadTime.toString()); // For spam detection
      formDataEncoded.append('website', ''); // Honeypot field (should be empty)
      formDataEncoded.append('recaptcha_token', recaptchaToken); // reCAPTCHA token

      // Submit using fetch with proper encoding
      // Google Apps Script web apps handle CORS automatically when deployed as "Anyone"
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script web apps
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataEncoded.toString(),
      });

      // With no-cors mode, we can't read the response, but the submission should succeed
      // Track successful form submission
      trackFormSubmission('quote_request', {
        address: formData.address,
        contact: formData.contact,
        serviceType: formData.serviceType
      });

      // Navigate to thank you page
      navigate('/thank-you');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again or call us at 757-848-4559.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inline) {
    return (
      <motion.div 
        className="quote-form-inline"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px 30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          marginTop: '40px'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {showTitle && (
          <>
            <h3 
              className="quote-form-title"
              style={{
                marginBottom: '15px',
                fontSize: '1.4rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-primary)',
                lineHeight: '1.4'
              }}
            >
              Please text or email me a no-obligation demolition quote.
            </h3>
            
            <p 
              className="quote-form-subtitle"
              style={{
                marginBottom: '30px',
                fontSize: '1.1rem',
                fontWeight: '400',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-primary)',
                lineHeight: '1.5'
              }}
            >
              We service Hampton, Newport News, Yorktown, and Norfolk
            </p>
          </>
        )}

        <form className="quote-form" onSubmit={handleSubmit}>
          <input 
            type="hidden" 
            name="serviceType" 
            value={serviceType}
          />
          
          <div className="mb-3">
            <input 
              type="text" 
              className="form-control"
              placeholder="Property Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{
                padding: '18px',
                fontSize: '1.1rem',
                borderRadius: '8px',
                border: '2px solid var(--color-border)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: '400'
              }}
            />
          </div>
          
          <div className="mb-4">
            <input 
              type="text" 
              className="form-control"
              placeholder="Email or Phone"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              style={{
                padding: '18px',
                fontSize: '1.1rem',
                borderRadius: '8px',
                border: '2px solid var(--color-border)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: '400'
              }}
            />
          </div>
          
          {/* Honeypot field - hidden from users but bots will fill it */}
          <div style={{position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none'}}>
            <label htmlFor="website-quote">Website (leave blank)</label>
            <input type="text" id="website-quote" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          
          <Button 
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
            style={{
              padding: '18px',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              fontFamily: 'var(--font-family-primary)',
              textTransform: 'none'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
          </Button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="hero-right-block"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px 30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {showTitle && (
        <>
          <h3 
            className="quote-form-title"
            style={{
              marginBottom: '15px',
              fontSize: '1.4rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-primary)',
              lineHeight: '1.4'
            }}
          >
            Please text or email me a no-obligation demolition quote.
          </h3>
          
          <p 
            className="quote-form-subtitle"
            style={{
              marginBottom: '30px',
              fontSize: '1.1rem',
              fontWeight: '400',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-primary)',
              lineHeight: '1.5'
            }}
          >
            We service Hampton, Newport News, Yorktown, and Norfolk
          </p>
        </>
      )}

      <form className="quote-form" onSubmit={handleSubmit}>
        <input 
          type="hidden" 
          name="serviceType" 
          value={serviceType}
        />
        
        <div className="mb-3">
          <input 
            type="text" 
            className="form-control"
            placeholder="Property Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              padding: '18px',
              fontSize: '1.1rem',
              borderRadius: '8px',
              border: '2px solid var(--color-border)',
              fontFamily: 'var(--font-family-primary)',
              fontWeight: '400'
            }}
          />
        </div>
        
        <div className="mb-4">
          <input 
            type="text" 
            className="form-control"
            placeholder="Email or Phone"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            style={{
              padding: '18px',
              fontSize: '1.1rem',
              borderRadius: '8px',
              border: '2px solid var(--color-border)',
              fontFamily: 'var(--font-family-primary)',
              fontWeight: '400'
            }}
          />
        </div>
        
        {/* Honeypot field - hidden from users but bots will fill it */}
        <div style={{position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none'}}>
          <label htmlFor="website-quote-2">Website (leave blank)</label>
          <input type="text" id="website-quote-2" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        
        <Button 
          type="submit"
          className="btn btn-primary w-100"
          disabled={isSubmitting}
          style={{
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            fontFamily: 'var(--font-family-primary)',
            textTransform: 'none'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
        </Button>
      </form>
    </motion.div>
  );
};

export default QuoteForm;
