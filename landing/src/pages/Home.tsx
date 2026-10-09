import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {trackPhoneClick} from '../config/gtm';
import {useScrollDepth} from '../hooks/useScrollDepth';
import {useLeadFormFunnel} from '../hooks/useLeadFormFunnel';
import {GOOGLE_APPS_SCRIPT_URL} from '../config/googleAppsScript';
import {getRecaptchaToken} from '../config/recaptcha';
import AddressAutocomplete, {
  type ResolvedAddress
} from '../components/AddressAutocomplete/AddressAutocomplete';
import {isGooglePlacesConfigured} from '../config/googlePlaces';
import './Home.css';

const PHONE = '757-848-4559';

const WORK_OPTIONS = [
  {label: 'Shed Removal', value: 'Shed Removal'},
  {label: 'Deck Removal', value: 'Deck Removal'},
  {label: 'Fence Removal', value: 'Fence Removal'},
  {label: 'Interior Demolition', value: 'Interior Demolition'},
  {label: 'House Demolition', value: 'House Demolition'},
  {label: 'Junk Removal', value: 'Junk Removal'},
  {label: 'Cleanout', value: 'Cleanout Services'},
  {label: 'Construction Debris Removal', value: 'Construction Debris Removal'}
];

const SERVICE_CARDS = [
  {
    title: 'Shed and Deck Removal',
    text: 'Remove unsafe or unwanted outdoor structures and reclaim the space for what comes next.',
    img: '/assets/Icons/deck-removal.webp',
    alt: 'Deck removal work by Mr Demo Pro in Hampton Roads'
  },
  {
    title: 'Interior Demolition',
    text: 'Clear walls, fixtures, kitchens, bathrooms, and other interior spaces for renovation or repair.',
    img: '/assets/Icons/hammer.webp',
    alt: 'Interior demolition work by Mr Demo Pro'
  },
  {
    title: 'Junk Removal',
    text: 'Remove furniture, appliances, general junk, and bulky debris from homes and businesses.',
    img: '/assets/Icons/trash.webp',
    alt: 'Junk and debris removal in Hampton Roads'
  },
  {
    title: 'Property Cleanouts',
    text: 'Clear estates, rentals, evictions, and full properties with hauling and final cleanup included.',
    img: '/assets/Icons/cleanout.webp',
    alt: 'Property cleanout service by Mr Demo Pro'
  },
  {
    title: 'Fence Removal',
    text: 'Take down damaged or unwanted fencing, remove the debris, and leave the area cleared.',
    img: '/assets/Icons/fence-removal.webp',
    alt: 'Fence removal service in Hampton Roads'
  },
  {
    title: 'Construction Debris Removal',
    text: 'Keep renovation and construction work moving with prompt jobsite cleanup and haul-off.',
    img: '/assets/Icons/construction-debris-removal.svg',
    alt: 'Line illustration of construction debris removal'
  }
];

const AUDIENCES = [
  {
    title: 'Homeowners',
    text: 'Reclaim your space without taking on the safety risk, heavy labor, or cleanup yourself. We handle removal from start to finish.'
  },
  {
    title: 'Property managers',
    text: 'Turn properties faster with clear cleanout pricing, dependable communication, and same-day emergency response when availability allows.'
  },
  {
    title: 'Contractors',
    text: 'Keep your crew focused on building. We handle selective demolition, debris removal, and the clean handoff your next trade needs.'
  }
];

const OUTCOMES = [
  {
    title: 'Transparent cleanout pricing',
    text: 'Published price guidance helps you understand the likely investment before the work begins. Final pricing reflects the confirmed volume, materials, access, and disposal needs.'
  },
  {
    title: 'Same-day emergency response available',
    text: 'Urgent eviction, turnover, safety, and project-delay situations cannot always wait. Call for same-day response availability across Hampton Roads.'
  }
];

const STEPS = [
  {
    title: 'Request your free quote',
    text: 'Tell us what needs to go online or by phone.'
  },
  {
    title: 'Confirm the scope and date',
    text: 'We explain the price, preparation, and schedule.'
  },
  {
    title: 'Get the site back ready',
    text: 'We remove the material and include cleanup.'
  }
];

const fadeUp = {
  initial: {opacity: 0, y: 30},
  whileInView: {opacity: 1, y: 0},
  viewport: {once: true},
  transition: {duration: 0.5}
};

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    serviceType: '',
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
  const [formLoadTime] = useState(Date.now()); // Track when form loads for spam detection
  const {
    formRef,
    markFormStart,
    markSubmitAttempt,
    markValidationError,
    markNetworkError,
    markSubmitted
  } = useLeadFormFunnel({
    formId: 'home_hero_quote',
    formType: 'quote_request',
    serviceName: 'Homepage quote'
  });

  useScrollDepth('home');

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    const target = id === 'quote' ? 'quote-form' : id;
    const timer = window.setTimeout(() => scrollToSection(target), 50);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.key]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    markFormStart();
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fieldStyle = {
    padding: '18px',
    fontSize: '1.1rem',
    borderRadius: '8px',
    border: '2px solid var(--color-primary)',
    fontFamily: 'var(--font-family-primary)',
    fontWeight: '400'
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    markSubmitAttempt();

    if (isGooglePlacesConfigured() && !placesUnavailable) {
      if (!resolvedAddress?.isComplete || !resolvedAddress.placeId) {
        setAddressError(
          'Please select a complete property address from the Google suggestions.'
        );
        markValidationError('address', 'incomplete_google_address');
        return;
      }
    } else if (!formData.address.trim()) {
      setAddressError('Property address is required.');
      markValidationError('address', 'missing_address');
      return;
    }

    setIsSubmitting(true);
    setAddressError(null);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('quote_request');

      const scriptURL = GOOGLE_APPS_SCRIPT_URL;

      // Use URLSearchParams to encode form data
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
      formDataEncoded.append('form_load_time', formLoadTime.toString()); // For spam detection
      formDataEncoded.append('website', ''); // Honeypot field (should be empty)
      formDataEncoded.append('recaptcha_token', recaptchaToken); // reCAPTCHA token

      // Submit using fetch with proper encoding
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script web apps handle CORS automatically
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDataEncoded.toString()
      });

      markSubmitted(
        {name: formData.name, phone: formData.phone},
        {address: formData.address, service_name: formData.serviceType}
      );

      navigate('/thank-you/');
    } catch (error) {
      console.error('Error submitting form:', error);
      markNetworkError(error);
      alert(
        `There was an error submitting your request. Please try again or call us at ${PHONE}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const quoteLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection('quote-form');
  };

  return (
    <div className="home-page">
      <section
        id="quote"
        className="home-hero"
        aria-label="Hero section - Mr Demo Pro Demolition Services"
      >
        <img
          className="home-hero-bg"
          src="/assets/img/backgrounds/steptodown.com779769.webp"
          alt="Demolition site background - Mr Demo Pro"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width="1920"
          height="1080"
        />
        <div className="home-hero-overlay" />

        <div className="home-container">
          <div className="home-hero-grid">
            <motion.div
              className="home-hero-left"
              initial={{opacity: 0, x: -50}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.8}}
            >
              <h1>Demolition and Cleanouts Without the Runaround</h1>

              <img
                src="/main-logo.webp"
                alt="Mr Demo Pro logo – Demolition Contractor"
                width={240}
                height={120}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{maxHeight: '120px', width: 'auto'}}
              />

              <h2>Safe, Fast, and Fully Cleaned Up</h2>

              <p>
                Mr Demo Pro clears unwanted structures, interiors, junk, and
                debris for Hampton Roads homeowners, property managers, and
                contractors.
              </p>

              <div className="home-hero-actions">
                <a
                  href={`tel:${PHONE}`}
                  className="home-hero-phone"
                  aria-label={`Call Mr Demo Pro at ${PHONE}`}
                  onClick={() =>
                    trackPhoneClick({
                      cta_location: 'homepage_hero',
                      cta_label: 'Hero call CTA'
                    })
                  }
                >
                  <span className="home-hero-phone-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.06 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12 1.05.35 2.07.68 3.05a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.98.33 2 .56 3.05.68A2 2 0 0 1 22 16.92z"
                        fill="#fff"
                      />
                    </svg>
                  </span>
                  {PHONE}
                </a>
              </div>
            </motion.div>

            <motion.div
              id="quote-form"
              className="home-hero-form"
              initial={{opacity: 0, x: 50}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.8, delay: 0.2}}
            >
              <h3>Tell us what needs to go and get a free quote</h3>

              <form ref={formRef} className="quote-form" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <select
                    className="form-control"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    onFocus={markFormStart}
                    required
                    aria-label="Select type of work"
                    style={{
                      ...fieldStyle,
                      paddingRight: '48px',
                      color: formData.serviceType ? 'inherit' : '#6c757d'
                    }}
                  >
                    <option value="" hidden>
                      Select types of work
                    </option>
                    {WORK_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                    aria-label="Your Name"
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
                    aria-label="Phone Number"
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
                    aria-label="Business Name (optional)"
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
                      setFormData(prev => ({...prev, address}));
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
                    style={
                      addressError
                        ? {...fieldStyle, border: '2px solid #dc3545'}
                        : fieldStyle
                    }
                  />
                </div>

                {/* Honeypot field - hidden from users but bots will fill it */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                >
                  <label htmlFor="website">Website (leave blank)</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="home-submit"
                  aria-label="Submit demolition quote request"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Request My Free Quote'}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="home-hero-more">
            <a
              href="#services"
              className="home-hero-secondary"
              onClick={e => {
                e.preventDefault();
                scrollToSection('services');
              }}
            >
              See Our Services
            </a>
          </div>
        </div>
      </section>

      <section id="problem-statement" className="home-problem">
        <div className="home-container">
          <motion.div className="home-narrow" {...fadeUp}>
            <h2 className="home-h2">
              Clear the property without adding more work to your plate
            </h2>
            <p className="home-lead" style={{marginBottom: 0}}>
              Demolition and cleanouts involve safety, scheduling, hauling, and
              cleanup. Mr Demo Pro handles the heavy work and keeps the process
              straightforward from quote to cleared site.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="services" className="home-services">
        <div className="home-container">
          <h2 className="home-h2">Demolition, removal, and cleanout services</h2>
          <p
            className="home-lead"
            style={{maxWidth: '800px', margin: '0 auto 40px'}}
          >
            One dependable team handles the removal, haul-off, and final
            cleanup so your property is ready for renovation, turnover,
            construction, or everyday use.
          </p>
          <ul className="home-checklist">
            <li>✔ Residential and light commercial demolition</li>
            <li>✔ Junk removal and full property cleanouts</li>
            <li>✔ Construction debris haul-off</li>
            <li>✔ Cleanup included with every job</li>
          </ul>
          <p className="home-lead" style={{marginBottom: 0}}>
            Safety first. Clear communication. A clean finish.
          </p>

          <div className="home-service-grid">
            {SERVICE_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                {...fadeUp}
                transition={{duration: 0.5, delay: (index % 3) * 0.1}}
              >
                <div className="home-service-card">
                  <img
                    src={card.img}
                    alt={card.alt}
                    width={128}
                    height={128}
                    loading="lazy"
                    decoding="async"
                  />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <a
                    href="#quote"
                    className="home-btn-small"
                    aria-label={`Get a quote for ${card.title}`}
                    onClick={quoteLink}
                  >
                    Get Quote
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="audiences" className="home-audiences">
        <div className="home-container">
          <div className="home-audiences-grid">
            <div className="home-audiences-intro">
              <h2 className="home-h2">One crew for the heavy work</h2>
              <p className="home-lead" style={{maxWidth: '520px'}}>
                Mr Demo Pro works with the people responsible for getting a
                property cleared, safe, and ready for its next use.
              </p>
            </div>
            <div className="home-audience-list">
              {AUDIENCES.map(audience => (
                <motion.article
                  key={audience.title}
                  className="home-audience"
                  {...fadeUp}
                >
                  <h3>{audience.title}</h3>
                  <p>{audience.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="home-outcomes">
        <div className="home-container">
          <div className="home-outcomes-grid">
            {OUTCOMES.map(outcome => (
              <motion.div key={outcome.title} className="home-outcome" {...fadeUp}>
                <h3>{outcome.title}</h3>
                <p>{outcome.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="home-process">
        <div className="home-container">
          <h2 className="home-h2">A straightforward path to a cleared property</h2>
          <div className="home-steps">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                className="home-step"
                {...fadeUp}
                transition={{duration: 0.5, delay: index * 0.15}}
              >
                <div className="home-step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="service-area" className="home-area">
        <div className="home-container">
          <div className="home-area-grid">
            <motion.div className="home-area-copy" {...fadeUp}>
              <h2 className="home-h2">Serving Hampton Roads</h2>
              <p className="home-lead">
                Mr Demo Pro provides demolition, junk removal, and cleanout
                services across Yorktown, Norfolk, Newport News, Hampton,
                Virginia Beach, and Chesapeake.
              </p>
              <a href="#quote" className="home-btn-large" onClick={quoteLink}>
                Request a Free Quote
              </a>
            </motion.div>
            <motion.img
              className="home-area-image"
              src="/assets/img/features/hampton-roads.webp"
              alt="Mr Demo Pro demolition service across Hampton Roads"
              loading="lazy"
              decoding="async"
              {...fadeUp}
            />
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-container">
          <div className="home-cta-inner">
            <div style={{maxWidth: '760px'}}>
              <h2 className="home-h2">Tell us what needs to go</h2>
              <p>
                Get a clear quote for demolition, junk removal, or a property
                cleanout anywhere in Hampton Roads.
              </p>
            </div>
            <div className="home-cta-actions">
              <a href="#quote" className="home-cta-light" onClick={quoteLink}>
                Request a Quote
              </a>
              <a
                href={`tel:${PHONE}`}
                className="home-cta-outline"
                onClick={() =>
                  trackPhoneClick({
                    cta_location: 'homepage_closing_cta',
                    cta_label: 'Closing call CTA'
                  })
                }
              >
                Call {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
