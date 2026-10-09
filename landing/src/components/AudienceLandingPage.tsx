import {Link, useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import QuoteForm from './QuoteForm';
import {
  AudienceOutcomes,
  AudienceProblem,
  AudienceSupport,
  type AudienceContent
} from './AudienceHighlights';
import type {NearbyAreaLink} from './ServiceLandingPage';
import {getPageTypeFromPath, trackCtaClick, trackPhoneClick} from '../config/gtm';
import type {PageType} from '../config/analyticsTypes';
import {useScrollDepth} from '../hooks/useScrollDepth';
import './AudienceLandingPage.css';

const PHONE = '757-848-4559';

interface AudienceLandingPageProps {
  title: string;
  tagline: string;
  description: string;
  serviceType: string;
  areaServed?: string;
  heroImage: {
    src: string;
    alt: string;
  };
  audience: AudienceContent;
  benefitsTitle: string;
  benefits: Array<{
    title: string;
    description: string;
    image: {src: string; alt: string};
  }>;
  processTitle: string;
  processSteps: Array<{
    title: string;
    description: string;
  }>;
  pricingExpectationsTitle: string;
  pricingExpectationsItems: string[];
  nearbyAreasTitle: string;
  nearbyAreasIntro: string;
  nearbyAreasLinks: NearbyAreaLink[];
  ctaTitle: string;
  ctaDescription: string;
}

const DETAIL_IMAGES = {
  pricing: {
    src: '/assets/img/features/services-overview.webp',
    alt: 'Weathered backyard shed on an overgrown lot'
  },
  cta: {
    src: '/assets/img/features/get-in-touch.webp',
    alt: 'Leaning white picket fence along a garden bed'
  },
  area: {
    src: '/assets/img/features/hampton-roads.webp',
    alt: 'Worker removing an old wooden deck railing'
  }
};

const fadeUp = {
  initial: {opacity: 0, y: 30},
  whileInView: {opacity: 1, y: 0},
  viewport: {once: true},
  transition: {duration: 0.5}
};

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
};

const AudienceLandingPage = ({
  title,
  tagline,
  description,
  serviceType,
  areaServed = 'Hampton Roads, VA',
  heroImage,
  audience,
  benefitsTitle,
  benefits,
  processTitle,
  processSteps,
  pricingExpectationsTitle,
  pricingExpectationsItems,
  nearbyAreasTitle,
  nearbyAreasIntro,
  nearbyAreasLinks,
  ctaTitle,
  ctaDescription
}: AudienceLandingPageProps) => {
  const location = useLocation();
  const pageType = getPageTypeFromPath(location.pathname) as PageType;
  useScrollDepth(pageType);

  const geoPhrase = areaServed.split(',')[0]?.trim() || areaServed;

  const quoteClick = (ctaLocation: string) => {
    trackCtaClick({
      cta_label: 'Get Free Quote',
      cta_location: ctaLocation,
      cta_type: 'quote',
      service_name: serviceType,
      page_type: pageType
    });
    scrollToId('quote-form');
  };

  return (
    <main className="aud-page">
      <div itemScope itemType="https://schema.org/Service">
        <section
          className="aud-hero"
          aria-labelledby="service-hero-title"
        >
          <meta itemProp="areaServed" content={areaServed} />
          <meta itemProp="provider" content="Mr Demo Pro" />
          <meta itemProp="serviceType" content={serviceType} />
          <img
            className="aud-hero-bg"
            src={heroImage.src}
            alt={heroImage.alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="aud-hero-overlay" />

          <div className="aud-container">
            <div className="aud-hero-grid">
              <motion.div
                className="aud-hero-left"
                initial={{opacity: 0, x: -50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.8}}
              >
                <h1 id="service-hero-title" itemProp="name">
                  {title}
                </h1>
                <img
                  src="/main-logo.webp"
                  alt="Mr Demo Pro logo"
                  width={240}
                  height={120}
                  loading="eager"
                  decoding="async"
                  style={{maxHeight: '120px', width: 'auto'}}
                />
                <p className="aud-hero-tagline">{tagline}</p>
                <p itemProp="description">{description}</p>
                <a
                  href={`tel:${PHONE}`}
                  className="aud-hero-phone"
                  aria-label={`Call for ${serviceType} services in ${geoPhrase}`}
                  onClick={() =>
                    trackPhoneClick({
                      cta_location: 'service_page_hero',
                      cta_label: 'Call (757) 848 4559',
                      service_name: serviceType,
                      page_type: pageType
                    })
                  }
                >
                  <span className="aud-hero-phone-icon">
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
                  Call (757) 848 4559
                </a>
              </motion.div>

              <div id="quote-form" className="aud-hero-form">
                <QuoteForm serviceType={serviceType} inline accentFields />
              </div>
            </div>

            <div className="aud-hero-more">
              <a
                href="#process"
                className="aud-hero-secondary"
                onClick={e => {
                  e.preventDefault();
                  scrollToId('process');
                }}
              >
                See how we work
              </a>
            </div>
          </div>
        </section>

        <AudienceProblem
          problemTitle={audience.problemTitle}
          problemText={audience.problemText}
        />

        <AudienceSupport
          supportTitle={audience.supportTitle}
          supportIntro={audience.supportIntro}
          supportItems={audience.supportItems}
          supportNote={audience.supportNote}
        >
          <h2 className="aud-h2 aud-benefits-title">{benefitsTitle}</h2>
          <div className="aud-card-grid">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                {...fadeUp}
                transition={{duration: 0.5, delay: index * 0.1}}
              >
                <div className="aud-card">
                  <img
                    src={benefit.image.src}
                    alt={benefit.image.alt}
                    width={128}
                    height={128}
                    loading="lazy"
                    decoding="async"
                  />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                  <a
                    href="#quote-form"
                    className="aud-btn-small"
                    aria-label={`Request a quote for ${benefit.title}`}
                    onClick={e => {
                      e.preventDefault();
                      quoteClick('service_page_card');
                    }}
                  >
                    Request Quote
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </AudienceSupport>

        <section id="process" className="aud-process">
          <div className="aud-container">
            <h2 className="aud-h2">{processTitle}</h2>
            <div className="aud-steps">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="aud-step"
                  {...fadeUp}
                  transition={{duration: 0.5, delay: index * 0.15}}
                >
                  <div className="aud-step-number">{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AudienceOutcomes outcomes={audience.outcomes} />

        <section className="aud-rows">
          <div className="aud-container">
            <div className="aud-row">
              <motion.div className="aud-row-copy" {...fadeUp}>
                <h2 className="aud-h2">{pricingExpectationsTitle}</h2>
                {pricingExpectationsItems.map(line => (
                  <p key={line} className="aud-lead">
                    {line}
                  </p>
                ))}
              </motion.div>
              <motion.img
                className="aud-row-image"
                src={DETAIL_IMAGES.pricing.src}
                alt={DETAIL_IMAGES.pricing.alt}
                loading="lazy"
                decoding="async"
                {...fadeUp}
              />
            </div>

            <div className="aud-row">
              <motion.img
                className="aud-row-image"
                src={DETAIL_IMAGES.cta.src}
                alt={DETAIL_IMAGES.cta.alt}
                loading="lazy"
                decoding="async"
                {...fadeUp}
              />
              <motion.div className="aud-row-copy" {...fadeUp}>
                <h2 className="aud-h2 aud-h2-dark">{ctaTitle}</h2>
                <p className="aud-lead">{ctaDescription}</p>
                <div className="aud-row-actions">
                  <a
                    href={`tel:${PHONE}`}
                    className="aud-btn-large"
                    aria-label={`Call for ${serviceType} services`}
                    onClick={() =>
                      trackPhoneClick({
                        cta_location: 'service_page_bottom',
                        cta_label: 'Call 757-848-4559',
                        service_name: serviceType,
                        page_type: pageType
                      })
                    }
                  >
                    Call {PHONE}
                  </a>
                  <a
                    href="#quote-form"
                    className="aud-btn-outline"
                    aria-label={`Get free ${serviceType} quote in ${geoPhrase}`}
                    onClick={e => {
                      e.preventDefault();
                      quoteClick('service_page_bottom');
                    }}
                  >
                    Get Free Quote
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="aud-row">
              <motion.div className="aud-row-copy" {...fadeUp}>
                <h2 className="aud-h2">{nearbyAreasTitle}</h2>
                <p className="aud-lead">{nearbyAreasIntro}</p>
                <ul className="aud-links">
                  {nearbyAreasLinks.map(link => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() =>
                          window.scrollTo({top: 0, behavior: 'smooth'})
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.img
                className="aud-row-image"
                src={DETAIL_IMAGES.area.src}
                alt={DETAIL_IMAGES.area.alt}
                loading="lazy"
                decoding="async"
                {...fadeUp}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AudienceLandingPage;
