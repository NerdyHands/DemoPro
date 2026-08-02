import CityDemolitionPage from './CityDemolitionPage';
import {CITY_PATHS} from '../content/locationCluster';

const DemolitionContractorVirginiaBeachVa = () => (
  <CityDemolitionPage
    city="Virginia Beach"
    cityPath={CITY_PATHS.virginiaBeach}
    description="Need a demolition contractor in Virginia Beach, VA? Mr Demo Pro handles selective interior demolition, concrete removal, garage demolition, and debris haul-off for homeowners, landlords, and contractors across the city."
    benefitFocus={[
      'Coastal properties, tight driveways, and HOA or rental timelines benefit from a clear demolition and hauling plan before work starts.',
      'We handle interior tear-outs, small structures, concrete, and cleanup so one crew can move the project forward.',
      'Our goal is a clean, ready space for renovation, turnover, landscaping, or the next contractor on site.'
    ]}
    nearbyCities={[
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk},
      {label: 'Demolition contractor Chesapeake, VA', to: CITY_PATHS.chesapeake},
      {label: 'Demolition contractor Portsmouth, VA', to: CITY_PATHS.portsmouth}
    ]}
  />
);

export default DemolitionContractorVirginiaBeachVa;
