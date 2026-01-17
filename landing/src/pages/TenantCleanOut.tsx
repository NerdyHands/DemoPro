import ServiceLandingPage from '../components/ServiceLandingPage';

const TenantCleanOut = () => (
  <ServiceLandingPage
    title="Tenant Clean Out Services in Hampton Roads"
    description="Need a fast tenant clean out? Mr Demo Pro handles tenant clean out projects for landlords and property managers, including debris removal, light demolition, and full cleanup."
    serviceType="Tenant Clean Out"
    heroImage={{
      src: '/assets/Icons/cleanout.webp',
      alt: 'Tenant clean out services by Mr Demo Pro',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Fast Turnaround',
        description:
          'We help you reset units quickly so you can get back to occupancy.'
      },
      {
        title: 'Complete Debris Removal',
        description:
          'Furniture, trash, and leftover items are hauled away efficiently.'
      },
      {
        title: 'Ready-to-List Finish',
        description:
          'Our team leaves the unit clean and ready for repairs or listing.'
      }
    ]}
    serviceIncludes={[
      'Apartment and rental cleanouts',
      'Eviction clean out services',
      'Furniture and trash removal',
      'Light demolition and prep',
      'Final sweep and cleanup'
    ]}
    processSteps={[
      {
        title: 'Walkthrough & Plan',
        description:
          'We review the unit and determine the right cleanup approach.'
      },
      {
        title: 'Sort & Remove',
        description:
          'Items are sorted and removed quickly with careful handling.'
      },
      {
        title: 'Haul-Off',
        description:
          'All debris and furniture are loaded and disposed of responsibly.'
      },
      {
        title: 'Final Cleanup',
        description:
          'We finish with a clean, cleared space ready for the next tenant.'
      }
    ]}
    ctaTitle="Need a tenant clean out fast?"
    ctaDescription="Call now or request a free quote for tenant clean out service."
  />
);

export default TenantCleanOut;
