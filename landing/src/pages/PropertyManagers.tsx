import ServiceLandingPage from '../components/ServiceLandingPage';
import AudienceHighlights from '../components/AudienceHighlights';

const PropertyManagers = () => (
  <ServiceLandingPage
    title="Property Cleanouts That Keep Turnovers Moving in Hampton Roads"
    tagline="Clear scope. Responsive scheduling. Cleanup included."
    description="Mr Demo Pro helps Hampton Roads property managers and landlords clear vacant, inherited, and time-sensitive properties for inspection, repair, listing, or occupancy."
    serviceType="Property Cleanout"
    heroImage={{
      src: '/assets/Icons/cleanout.webp',
      alt: 'Property cleanout services for property managers by Mr Demo Pro',
      maxWidth: 320
    }}
    benefitsTitle="Services for property managers and landlords"
    benefits={[
      {
        title: 'Turnover Cleanouts',
        description:
          'Clear furniture, household items, accumulated junk, and debris so inspection, repair, or occupancy work can begin.'
      },
      {
        title: 'Junk and Debris Removal',
        description:
          'Remove unwanted furniture, appliances, loose materials, and general debris from homes and light commercial properties.'
      },
      {
        title: 'Interior Removal',
        description:
          'Remove agreed fixtures, finishes, and interior structures before repairs, restoration, or remodeling begins.'
      }
    ]}
    processTitle="A straightforward property cleanout process"
    processSteps={[
      {
        title: 'Send the property details',
        description:
          'Share the address, access conditions, scope, photos, and target date.'
      },
      {
        title: 'Confirm scope and price',
        description:
          'We clarify what leaves, what stays, and what affects the final estimate.'
      },
      {
        title: 'Clear and hand off',
        description:
          'The crew removes the material and leaves the property ready for its next use.'
      }
    ]}
    pricingExpectationsTitle="Clear pricing before the clearing starts"
    pricingExpectationsItems={[
      'Published cleanout price guidance helps with early budgeting.',
      'We confirm the final estimate after reviewing volume, access, materials, and disposal needs.'
    ]}
    nearbyAreasTitle="Related services"
    nearbyAreasIntro="Mr Demo Pro serves property owners and professionals across Yorktown, Norfolk, Newport News, Hampton, Virginia Beach, and Chesapeake."
    nearbyAreasLinks={[
      {label: 'Tenant Clean Out', to: '/tenant-clean-out/'},
      {label: 'Cleanout Services', to: '/services/cleanout/'},
      {label: 'Junk Removal', to: '/services/junk-removal/'},
      {label: 'Interior Demolition', to: '/services/interior-demo/'},
      {label: 'Cleanout Prices', to: '/prices/'}
    ]}
    ctaTitle="Turnover that can't wait?"
    ctaDescription="When a vacancy, safety issue, or turnover cannot wait, call to check the crew's current capacity. Same-day completion depends on the job and schedule."
  >
    <AudienceHighlights
      problemTitle="A delayed cleanout can hold up inspections, repairs, listings, and move-ins."
      problemText="You need a crew that confirms the scope, communicates clearly, arrives when scheduled, and leaves the property accessible for the next step."
      supportTitle="Cleanout support built for property operations"
      supportIntro="Use one local crew for removal, hauling, and final cleanup across routine turnovers and urgent property situations."
      supportItems={[
        'Published cleanout price guidance for faster planning',
        'Whole-property clearing and debris haul-off',
        'Same-day response available when scheduling allows',
        'One accountable contact for scope and timing'
      ]}
      supportNote="Final pricing depends on volume, access, materials, disposal requirements, and the confirmed scope."
      outcomes={[
        {
          title: 'Keep the next vendor on schedule',
          description:
            'A clearly scoped cleanout gives inspectors, maintenance teams, and contractors a workable property sooner.'
        },
        {
          title: 'Get the property ready for what comes next',
          description:
            'Move from problem property to inspection, repair, listing, or occupancy with removal and cleanup handled by one crew.'
        }
      ]}
    />
  </ServiceLandingPage>
);

export default PropertyManagers;
