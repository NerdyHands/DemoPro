import ServiceLandingPage from '../components/ServiceLandingPage';

const ConcreteDemolition = () => (
  <ServiceLandingPage
    title="Concrete Demolition in Hampton Roads"
    description="Need concrete demolition for a driveway, slab, patio, or foundation? Mr Demo Pro breaks and removes concrete safely, protecting nearby structures and leaving a clean site for your next step."
    serviceType="Concrete Demolition"
    heroImage={{
      src: '/assets/Icons/hammer.webp',
      alt: 'Concrete demolition service by Mr Demo Pro',
      maxWidth: 320
    }}
    benefits={[
      {
        title: 'Precision Concrete Removal',
        description:
          'We break and remove concrete without unnecessary damage to surrounding areas.'
      },
      {
        title: 'Fast Debris Haul-Off',
        description:
          'Concrete waste is heavy. We handle hauling and disposal to keep your site clean.'
      },
      {
        title: 'Safe, Controlled Work',
        description:
          'Our crew uses the right tools and procedures to keep demolition safe and efficient.'
      }
    ]}
    serviceIncludes={[
      'Driveways, sidewalks, and walkways',
      'Patios, slabs, and concrete pads',
      'Foundations, footings, and curbs',
      'Concrete steps and retaining structures'
    ]}
    processSteps={[
      {
        title: 'Scope the Work',
        description:
          'We measure the concrete area and identify any access or safety needs.'
      },
      {
        title: 'Protect Surroundings',
        description:
          'Our team safeguards nearby landscaping and structures before breaking begins.'
      },
      {
        title: 'Break & Remove',
        description:
          'Concrete is broken into manageable pieces and removed quickly.'
      },
      {
        title: 'Clean Site',
        description:
          'We haul away debris and leave the area ready for new installation.'
      }
    ]}
    ctaTitle="Concrete demolition made easy"
    ctaDescription="Tell us about your concrete project and get a free quote today."
  />
);

export default ConcreteDemolition;
