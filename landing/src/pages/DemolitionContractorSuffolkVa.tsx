import CityDemolitionPage from './CityDemolitionPage';
import {CITY_PATHS} from '../content/locationCluster';

const DemolitionContractorSuffolkVa = () => (
  <CityDemolitionPage
    city="Suffolk"
    cityPath={CITY_PATHS.suffolk}
    description="Searching for a demolition contractor in Suffolk, VA? Mr Demo Pro handles selective demolition, concrete and garage removal, small-structure teardown, and debris hauling for residential and commercial projects."
    benefitFocus={[
      'Larger lots, outbuildings, and long haul routes benefit from an upfront plan for access, staging, and disposal.',
      'Our crew can handle interior removals, concrete, garages, sheds, and debris cleanup under one coordinated scope.',
      'We leave the site clean and ready for property improvements, contractor handoff, or sale preparation.'
    ]}
    nearbyCities={[
      {label: 'Demolition contractor Portsmouth, VA', to: CITY_PATHS.portsmouth},
      {label: 'Demolition contractor Chesapeake, VA', to: CITY_PATHS.chesapeake},
      {label: 'Demolition contractor Newport News, VA', to: CITY_PATHS.newportNews}
    ]}
  />
);

export default DemolitionContractorSuffolkVa;
