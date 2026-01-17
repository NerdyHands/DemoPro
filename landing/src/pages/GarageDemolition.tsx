import ServiceLandingPage from '../components/ServiceLandingPage';

const GarageDemolition = () => (
  <ServiceLandingPage
    title="Garage Demolition and Removal in Hampton Roads"
    description="Looking for demolition of a garage? Mr Demo Pro removes detached and attached garages safely, including slab demolition and complete debris haul-off."
    serviceType="Garage Demolition"
    heroImage={{
      src: '/assets/Icons/fence-removal.webp',
      alt: 'Garage demolition and removal service',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Detached or Attached Garages',
        description:
          'We tailor the demolition plan to your garage layout and site access.'
      },
      {
        title: 'Safe Utility Handling',
        description:
          'Our crew coordinates utility disconnects and keeps the site protected.'
      },
      {
        title: 'Full Cleanup Included',
        description:
          'We remove the structure, slab, and debris so your property is ready.'
      }
    ]}
    serviceIncludes={[
      'Detached garage demolition',
      'Attached garage demolition',
      'Concrete slab and foundation removal',
      'Haul-off, disposal, and cleanup'
    ]}
    processSteps={[
      {
        title: 'Site Review',
        description:
          'We evaluate access, materials, and any utility connections.'
      },
      {
        title: 'Safety Preparation',
        description:
          'Utilities are disconnected and the work area is secured.'
      },
      {
        title: 'Demolition & Removal',
        description:
          'We remove the garage structure and any remaining slab or debris.'
      },
      {
        title: 'Clean Finish',
        description:
          'The area is cleared and ready for new construction or landscaping.'
      }
    ]}
    ctaTitle="Need garage demolition?"
    ctaDescription="Get a fast, free quote for garage removal in Hampton Roads."
  />
);

export default GarageDemolition;
