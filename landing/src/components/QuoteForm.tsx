import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackFormSubmission } from '../config/gtm';

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
      const scriptURL = "https://script.google.com/macros/s/AKfycbwxdfDsv0GMztRmpg6r0Jmocw9MuHelOfZFImoXtxtE5kHbCcWhVmX_Ue3eWokw5WZdAA/exec";
      
      const formDataToSend = new FormData();
      formDataToSend.append('address', formData.address);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('service_type', formData.serviceType);
      formDataToSend.append('form_type', 'quote_request');

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Track successful form submission
        trackFormSubmission('quote_request', {
          address: formData.address,
          contact: formData.contact,
          serviceType: formData.serviceType
        });
        navigate('/thank-you');
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
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
