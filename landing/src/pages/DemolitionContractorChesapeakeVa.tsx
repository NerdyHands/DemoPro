import CityDemolitionPage from './CityDemolitionPage';
import {CITY_PATHS} from '../content/locationCluster';

const DemolitionContractorChesapeakeVa = () => (
  <CityDemolitionPage
    city="Chesapeake"
    cityPath={CITY_PATHS.chesapeake}
    description="Looking for a demolition contractor in Chesapeake, VA? Mr Demo Pro provides interior demolition, concrete removal, garage and shed demolition, and debris hauling with clean jobsite handoffs."
    benefitFocus={[
      'From suburban homes to light commercial spaces, we plan access, debris staging, and timing before demolition begins.',
      'Selective demo, small-structure removal, and concrete tear-outs can be scoped together for a faster cleanup.',
      'We keep the site organized so renovation, landscaping, or construction work can start without leftover debris.'
    ]}
    nearbyCities={[
      {label: 'Demolition contractor Virginia Beach, VA', to: CITY_PATHS.virginiaBeach},
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk},
      {label: 'Demolition contractor Portsmouth, VA', to: CITY_PATHS.portsmouth}
    ]}
  />
);

export default DemolitionContractorChesapeakeVa;
