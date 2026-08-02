import CityDemolitionPage from './CityDemolitionPage';
import {CITY_PATHS} from '../content/locationCluster';

const DemolitionContractorPortsmouthVa = () => (
  <CityDemolitionPage
    city="Portsmouth"
    cityPath={CITY_PATHS.portsmouth}
    description="Need demolition in Portsmouth, VA? Mr Demo Pro supports interior remodel tear-outs, concrete removal, garage demolition, commercial strip-outs, and debris haul-off with clear scopes and cleanup included."
    benefitFocus={[
      'Older homes, compact lots, and renovation schedules need careful access and debris planning before demolition starts.',
      'We combine controlled demolition with hauling so the project does not stall around debris piles or disposal logistics.',
      'Final cleanup leaves the property ready for repairs, build-back, rental turnover, or exterior improvements.'
    ]}
    nearbyCities={[
      {label: 'Demolition contractor Norfolk, VA', to: CITY_PATHS.norfolk},
      {label: 'Demolition contractor Chesapeake, VA', to: CITY_PATHS.chesapeake},
      {label: 'Demolition contractor Suffolk, VA', to: CITY_PATHS.suffolk}
    ]}
  />
);

export default DemolitionContractorPortsmouthVa;
