import {Container, Row, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import ServiceLandingPage from '../components/ServiceLandingPage';

const HoardingCleanout = () => (
  <ServiceLandingPage
    title="Hoarding Cleanout Services in Hampton, VA"
    description="Mr Demo Pro provides discreet, compassionate hoarding cleanout services in Hampton Roads. We sort salvageable items, haul away debris, and fully clean the property so families, landlords, and estates can move forward with dignity."
    serviceType="Hoarding Cleanout"
    heroImage={{
      src: '/assets/Icons/cleanout.webp',
      alt: 'Compassionate hoarding cleanout service by Mr Demo Pro',
      maxWidth: 302
    }}
    benefitsTitle="Why Choose Mr Demo Pro for Hoarding Cleanout?"
    benefits={[
      {
        title: 'Discreet & Respectful',
        description:
          'We treat every home and family with privacy and compassion, working without judgment and at a pace that respects the people involved.'
      },
      {
        title: 'Full-Service Haul-Off',
        description:
          'From the first room to the final load, we sort, remove, and dispose of clutter and debris so you never have to coordinate multiple crews.'
      },
      {
        title: 'Clean, Move-In Ready Finish',
        description:
          'We leave the property cleared and broom-clean, ready for sale, rental turnover, renovation, or a fresh start.'
      }
    ]}
    serviceIncludes={[
      'Whole-home and single-room cleanouts',
      'Sorting of keepsakes, documents, and valuables (on request)',
      'Furniture, appliance, and general debris removal',
      'Trash, clutter, and accumulated material haul-off',
      'Light biohazard coordination and referrals as needed',
      'Final cleanup and disposal'
    ]}
    processTitle="Our Hoarding Cleanout Process"
    processSteps={[
      {
        title: 'Private Walkthrough',
        description:
          'We assess the home discreetly, discuss priorities, and identify any items you want set aside.'
      },
      {
        title: 'Clear Plan & Quote',
        description:
          'You get a straightforward scope and free estimate, with no pressure and no judgment.'
      },
      {
        title: 'Sort & Remove',
        description:
          'Our team works room by room, separating keepsakes from debris and loading out clutter.'
      },
      {
        title: 'Clean & Hand Back',
        description:
          'We haul everything away and leave the property clean and ready for its next chapter.'
      }
    ]}
    permitsSafetyTitle="Sensitive situations, handled with care"
    permitsSafetyParagraphs={[
      'Hoarding cleanouts often involve emotional circumstances, estates, or property deadlines. We coordinate with family members, property managers, and realtors, and we can stage work over multiple visits when that is easier for everyone involved.',
      'For homes with biohazards, pests, or extensive contamination, we will advise on specialized remediation and coordinate referrals so the property is handled safely.'
    ]}
    faqs={[
      {
        question: 'Do you handle hoarding cleanouts discreetly?',
        answer:
          'Yes. We work privately and respectfully, use unmarked logistics where possible, and never share details about the property or the people involved.'
      },
      {
        question: 'Can you set aside important items?',
        answer:
          'Absolutely. Tell us what matters most—documents, photos, heirlooms, or valuables—and we will sort carefully and set those items aside before removal.'
      },
      {
        question: 'How is hoarding cleanout different from a standard cleanout?',
        answer:
          'Hoarding cleanouts usually involve much higher volume, careful sorting, and sensitive circumstances. For lighter clutter or estate work, our standard cleanout service may be a better fit.'
      },
      {
        question: 'Do you serve all of Hampton Roads?',
        answer:
          'Yes—Hampton, Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk, and Yorktown. Call 757-848-4559 for a free estimate.'
      }
    ]}
    ctaTitle="Need a compassionate hoarding cleanout?"
    ctaDescription="Request a free, no-pressure hoarding cleanout quote in Hampton Roads."
  >
    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} md={12} className="mb-4 mb-lg-0">
            <h2
              style={{
                color: 'var(--color-primary)',
                marginBottom: '16px',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 800
              }}
            >
              Related services
            </h2>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
              Hoarding cleanout often pairs with general cleanout, junk removal,
              and estate work. Browse <Link to="/services/">all services</Link>{' '}
              or visit:
            </p>
          </Col>
          <Col lg={6} md={12}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: 12
              }}
            >
              {[
                {label: 'Cleanout Services', to: '/services/cleanout/'},
                {label: 'Junk Removal', to: '/services/junk-removal/'},
                {label: 'Contact for a Quote', to: '/contact/'}
              ].map(item => (
                <li
                  key={item.to}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff'
                  }}
                >
                  <Link
                    to={item.to}
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>
    </section>
  </ServiceLandingPage>
);

export default HoardingCleanout;
