import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  trackFormAbandon,
  trackFormStart,
  trackGenerateLead
} from '../config/gtm';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/googleAppsScript';
import { getRecaptchaToken } from '../config/recaptcha';
import { getServiceOptionsForForm } from '../config/servicesList';
import AddressAutocomplete, {
  type ResolvedAddress
} from './AddressAutocomplete/AddressAutocomplete';
import { isGooglePlacesConfigured } from '../config/googlePlaces';

interface QuoteFormProps {
  serviceType: string;
  showTitle?: boolean;
  inline?: boolean;
}

const fieldStyle = {
  padding: '18px',
  fontSize: '1.1rem',
  borderRadius: '8px',
  border: '2px solid var(--color-border)',
  fontFamily: 'var(--font-family-primary)',
  fontWeight: '400'
} as const;

const QuoteForm = ({ serviceType, showTitle = true, inline = false }: QuoteFormProps) => {
  const navigate = useNavigate();
  const serviceOptions = getServiceOptionsForForm(serviceType);
  const [formData, setFormData] = useState({
    serviceType: serviceType,
    name: '',
    phone: '',
    businessName: '',
    address: ''
  });
  const [resolvedAddress, setResolvedAddress] = useState<ResolvedAddress | null>(
    null
  );
  const [addressError, setAddressError] = useState<string | null>(null);
  const [placesUnavailable, setPlacesUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime] = useState(Date.now());
  const formId = `quote_${serviceType.replace(/\s+/g, '_')}_${inline ? 'inline' : 'block'}`;
  const formStarted = useRef(false);
  const formSubmitted = useRef(false);
  const abandonReported = useRef(false);

  const markFormStart = useCallback(() => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackFormStart({
      form_id: formId,
      form_type: 'quote_request',
      service_name: serviceType
    });
  }, [formId, serviceType]);

  useEffect(() => {
    const onAbandon = () => {
      if (!formStarted.current || formSubmitted.current || abandonReported.current) {
        return;
      }
      abandonReported.current = true;
      trackFormAbandon({
        form_id: formId,
        form_type: 'quote_request',
        service_name: serviceType
      });
    };
    window.addEventListener('pagehide', onAbandon);
    const onVis = () => {
      if (document.visibilityState === 'hidden') onAbandon();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', onAbandon);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [formId, serviceType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    markFormStart();
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGooglePlacesConfigured() && !placesUnavailable) {
      if (!resolvedAddress?.isComplete || !resolvedAddress.placeId) {
        setAddressError(
          'Please select a complete property address from the Google suggestions.'
        );
        return;
      }
    } else if (!formData.address.trim()) {
      setAddressError('Property address is required.');
      return;
    }

    setIsSubmitting(true);
    setAddressError(null);

    try {
      const recaptchaToken = await getRecaptchaToken('quote_request');
      const scriptURL = GOOGLE_APPS_SCRIPT_URL;

      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('name', formData.name);
      formDataEncoded.append('phone', formData.phone);
      formDataEncoded.append('business_name', formData.businessName);
      formDataEncoded.append('service_type', formData.serviceType);
      formDataEncoded.append('address', formData.address);
      if (resolvedAddress?.placeId) {
        formDataEncoded.append('place_id', resolvedAddress.placeId);
      }
      formDataEncoded.append('form_type', 'quote_request');
      formDataEncoded.append('form_load_time', formLoadTime.toString());
      formDataEncoded.append('website', '');
      formDataEncoded.append('recaptcha_token', recaptchaToken);

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataEncoded.toString(),
      });

      formSubmitted.current = true;
      trackGenerateLead({
        form_id: formId,
        lead_type: 'quote_request',
        address: formData.address,
        service_name: formData.serviceType,
        method: 'form'
      });

      navigate('/thank-you/');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again or call us at 757-848-4559.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = (honeypotId: string) => (
    <>
      <div className="mb-3">
        <select
          className="form-control"
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          onFocus={markFormStart}
          required
          aria-label="Select type of work"
          style={{...fieldStyle, color: formData.serviceType ? 'inherit' : '#6c757d'}}
        >
          <option value="" hidden>
            Select type of work
          </option>
          {serviceOptions.map(service => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Your Name"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={markFormStart}
          required
          style={fieldStyle}
        />
      </div>

      <div className="mb-3">
        <input
          type="tel"
          className="form-control"
          placeholder="Phone Number"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          onFocus={markFormStart}
          required
          style={fieldStyle}
        />
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Business Name (optional)"
          name="businessName"
          autoComplete="organization"
          value={formData.businessName}
          onChange={handleChange}
          onFocus={markFormStart}
          style={fieldStyle}
        />
      </div>

      <div className="mb-4">
        <AddressAutocomplete
          value={formData.address}
          onChange={address => {
            setFormData(prev => ({ ...prev, address }));
            setAddressError(null);
          }}
          onResolvedChange={resolved => {
            setResolvedAddress(resolved);
            if (resolved?.isComplete) setAddressError(null);
          }}
          onAvailabilityChange={setPlacesUnavailable}
          onFocus={markFormStart}
          placeholder="Select property address"
          required
          requireCompleteSelection
          error={addressError || undefined}
          style={fieldStyle}
        />
      </div>

      <div style={{position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none'}}>
        <label htmlFor={honeypotId}>Website (leave blank)</label>
        <input type="text" id={honeypotId} name="website" tabIndex={-1} autoComplete="off" />
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
    </>
  );

  const titleBlock = showTitle && (
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
  );

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
        {titleBlock}

        <form className="quote-form" onSubmit={handleSubmit}>
          {renderFormFields('website-quote')}
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
      {titleBlock}

      <form className="quote-form" onSubmit={handleSubmit}>
        {renderFormFields('website-quote-2')}
      </form>
    </motion.div>
  );
};

export default QuoteForm;
