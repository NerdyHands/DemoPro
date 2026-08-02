import ServiceLandingPage from '../components/ServiceLandingPage';
import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

const BuildingDemolition = () => (
  <ServiceLandingPage
    title="Building Demolition Services in Hampton Roads"
    description="Mr Demo Pro is a local demolition company delivering safe, efficient building demolition for residential and commercial structures. As a trusted demolition contractor, we handle permits, safety planning, and full debris removal."
    serviceType="Building Demolition"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Building demolition services by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Licensed & Insured Crew',
        description:
          'Our demolition team follows strict safety standards to protect people, property, and nearby structures.'
      },
      {
        title: 'Permit & Utility Coordination',
        description:
          'We help coordinate permits and utility disconnects so your demolition project stays on schedule.'
      },
      {
        title: 'Complete Cleanup',
        description:
          'We handle demolition debris haul-off and leave your site clean and ready for the next phase.'
      }
    ]}
    whatWeDemolishTitle="Building types we demolish"
    whatWeDemolishItems={[
      'Residential homes and additions',
      'Detached garages and outbuildings',
      'Commercial buildings and retail spaces',
      'Warehouses and light industrial structures'
    ]}
    serviceIncludes={[
      'Interior strip-out and soft demo',
      'Structural teardown and removal',
      'Concrete and foundation demolition',
      'Haul-off, recycling, and disposal',
      'Final site cleanup and grading'
    ]}
    processSteps={[
      {
        title: 'Site Assessment',
        description:
          'We evaluate the structure, access, and safety needs to plan the right approach.'
      },
      {
        title: 'Safety Prep',
        description:
          'Utilities are disconnected and the work area is secured before demolition begins.'
      },
      {
        title: 'Demolition & Haul-Off',
        description:
          'Our crew removes the structure efficiently while keeping the site organized.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We leave the property free of debris so you can move forward quickly.'
      }
    ]}
    pricingExpectationsTitle="Pricing expectations"
    pricingExpectationsItems={[
      'Building demolition pricing reflects structure size, materials (wood vs masonry vs steel), equipment requirements, disposal tonnage, and site access—not just square footage.',
      'Interior-only scopes vs full-structure teardown differ sharply; we outline assumptions line-by-line.',
      'Quotes typically bundle hauling unless your scope specifies owner-provided dumpsters or staging.'
    ]}
    permitsSafetyTitle="Permits & safety"
    permitsSafetyParagraphs={[
      'Structural demolition frequently intersects with permitting, inspections, and utility coordination—especially when envelopes or foundations change. Requirements vary by municipality and scope.',
      'Safety controls include fencing/barriers as needed, engineered sequencing when heights matter, dust suppression planning, and disciplined haul routes away from pedestrians.'
    ]}
    beforeAfterTitle="Typical outcomes"
    beforeAfterExamples={[
      {
        title: 'Teardown to open lot',
        description:
          'From standing structure to graded, debris-free lot—ready for development, sale, or new construction planning.'
      },
      {
        title: 'Phased commercial work',
        description:
          'Selective removal of sections while adjacent operations continue, with documented dust and debris control.'
      }
    ]}
    faqs={[
      {
        question: 'How do I get a building demolition quote in Hampton Roads?',
        answer:
          'Send photos, address, and any known hazards. We may recommend a site visit for large or complex buildings, then provide a written scope and price before work starts.'
      },
      {
        question: 'Do you handle disposal and recycling?',
        answer:
          'Yes. We plan for sortable materials and load-out so your site is not left with hidden cleanup work.'
      },
      {
        question: 'Do you work in specific cities?',
        answer:
          'We serve the full region. For local intent, see our city pages and service area hub for Hampton, Newport News, and Norfolk.'
      }
    ]}
    nearbyAreasTitle="Local demolition intent pages"
    nearbyAreasIntro="Explore city-focused demolition contractor pages or our Hampton Roads hub."
    nearbyAreasLinks={[
      {label: 'Service areas hub', to: SERVICE_AREA_HUB_PATH},
      {label: 'Demolition contractor Hampton, VA', to: CITY_PATHS.hampton},
      {label: 'Demolition contractor Newport News, VA', to: CITY_PATHS.newportNews},
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk}
    ]}
    ctaTitle="Need building demolition in Hampton Roads?"
    ctaDescription="Tell us about the structure and we will provide a free, no-pressure quote."
  />
);

export default BuildingDemolition;
