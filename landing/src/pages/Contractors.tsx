import AudienceLandingPage from '../components/AudienceLandingPage';

const Contractors = () => (
  <AudienceLandingPage
    title="Selective Demolition That Keeps the Build Moving in Hampton Roads"
    tagline="Agreed scope. Schedule awareness. Clean handoff."
    description="Mr Demo Pro handles selective demolition, removal, and cleanup for Hampton Roads contractors, remodelers, restoration teams, and trades."
    serviceType="Selective Demolition"
    heroImage={{
      src: '/assets/img/features/services-overview.webp',
      alt: 'Selective demolition services for contractors by Mr Demo Pro'
    }}
    audience={{
      problemTitle:
        'Unclear demolition scope and late debris removal can stall the next trade.',
      problemText:
        'Your crew needs the agreed material removed safely, the schedule protected, and the work area cleared for the next phase.',
      supportTitle: 'A demolition partner for the work before the build',
      supportIntro:
        'Bring in Mr Demo Pro for selective removal and debris haul-off while your crew stays focused on construction, restoration, or remodeling.',
      supportItems: [
        'Interior stripping to the agreed scope',
        'Construction debris removal and haul-off',
        'Scheduling around the project sequence',
        'Cleanup included for a workable handoff'
      ],
      supportNote:
        'We confirm access, materials, removal limits, disposal needs, and target timing before the work is scheduled.',
      outcomes: [
        {
          title: 'Protect the construction schedule',
          description:
            'Clear scope and responsive coordination reduce the chance that demolition or debris delays the next phase.'
        },
        {
          title: 'Hand off a workable area',
          description:
            'Removal and cleanup stay in one scope, so the next crew can focus on building instead of clearing the site.'
        }
      ]
    }}
    benefitsTitle="Services for contractors and remodelers"
    benefits={[
      {
        title: 'Selective Demolition',
        description:
          'Remove the agreed walls, fixtures, finishes, and interior elements while keeping the project scope clear.',
        image: {
          src: '/assets/Icons/hammer.webp',
          alt: 'Line illustration of a hammer for selective demolition'
        }
      },
      {
        title: 'Construction Debris Removal',
        description:
          'Clear renovation debris and jobsite material so crews can work safely and the next phase can start on time.',
        image: {
          src: '/assets/Icons/trash.webp',
          alt: 'Line illustration of a trash bag for debris removal'
        }
      },
      {
        title: 'Jobsite Cleanout',
        description:
          'Combine removal, hauling, and final cleanup in one scope for a cleaner handoff to the next trade.',
        image: {
          src: '/assets/Icons/cleanout.webp',
          alt: 'Line illustration of a sofa for jobsite cleanouts'
        }
      }
    ]}
    processTitle="A clear process from scope to handoff"
    processSteps={[
      {
        title: 'Share the job scope',
        description:
          'Send plans, photos, access notes, material details, and the date the area is needed.'
      },
      {
        title: 'Confirm limits and schedule',
        description:
          'We align on what comes out, what stays, site access, haul-off, and sequencing.'
      },
      {
        title: 'Demolish, remove, clean',
        description:
          'The crew completes the agreed removal and leaves the area ready for the next trade.'
      }
    ]}
    pricingExpectationsTitle="Scope clarity before work starts"
    pricingExpectationsItems={[
      'We confirm removal limits, access, materials, disposal needs, and the expected finish so your team knows what the handoff includes.'
    ]}
    nearbyAreasTitle="Related services"
    nearbyAreasIntro="Mr Demo Pro supports contractors and remodelers across Yorktown, Norfolk, Newport News, Hampton, Virginia Beach, and Chesapeake."
    nearbyAreasLinks={[
      {label: 'Interior Demolition', to: '/services/interior-demo/'},
      {
        label: 'Commercial Interior Demolition',
        to: '/services/commercial-interior-demolition/'
      },
      {
        label: 'Construction Debris Removal',
        to: '/services/construction-debris-removal/'
      },
      {label: 'Kitchen Demolition', to: '/services/kitchen-demolition/'},
      {label: 'Bathroom Demolition', to: '/services/bathroom-demolition/'}
    ]}
    ctaTitle="Responsive scheduling for active projects"
    ctaDescription="Share the project sequence and target date. Mr Demo Pro will confirm current availability and coordinate the demolition window around the site plan."
  />
);

export default Contractors;
