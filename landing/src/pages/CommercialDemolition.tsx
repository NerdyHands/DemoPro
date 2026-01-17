import ServiceLandingPage from '../components/ServiceLandingPage';

const CommercialDemolition = () => (
  <ServiceLandingPage
    title="Commercial Demolition Companies in Hampton Roads"
    description="Mr Demo Pro supports businesses looking for experienced commercial demolition companies. We coordinate schedules, safety plans, and debris removal for offices, retail spaces, and industrial sites."
    serviceType="Commercial Demolition"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Commercial demolition services by Mr Demo Pro'
    }}
    benefits={[
      {
        title: 'Project Coordination',
        description:
          'We align demolition with your build-out or redevelopment timeline.'
      },
      {
        title: 'Safety & Compliance',
        description:
          'Our commercial demolition process follows safety standards for occupied sites.'
      },
      {
        title: 'Efficient Cleanup',
        description:
          'We keep job sites organized and remove debris quickly to reduce downtime.'
      }
    ]}
    serviceIncludes={[
      'Office and retail demolition',
      'Warehouse and light industrial removal',
      'Tenant build-out removal',
      'Concrete and masonry demolition',
      'Haul-off and debris disposal'
    ]}
    processSteps={[
      {
        title: 'Scope & Scheduling',
        description:
          'We review site access, materials, and timing requirements.'
      },
      {
        title: 'Safety Planning',
        description:
          'Our team secures the work area and coordinates any needed disconnects.'
      },
      {
        title: 'Demolition Execution',
        description:
          'We remove structures efficiently while keeping the site safe.'
      },
      {
        title: 'Site Cleanup',
        description:
          'Debris is hauled away and the space is left ready for the next crew.'
      }
    ]}
    ctaTitle="Request a commercial demolition quote"
    ctaDescription="Tell us about your project and we will respond quickly with next steps."
  />
);

export default CommercialDemolition;
