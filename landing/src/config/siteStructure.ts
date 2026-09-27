import {CITY_PATHS, SERVICE_AREA_HUB_PATH} from '../content/locationCluster';

export type SiteLink = {
  label: string;
  path: string;
};

export const SITE_BASE_URL = 'https://mrdemopro.com';

/** Primary section hubs */
export const HUBS = {
  services: {label: 'Services', path: '/services/'} as SiteLink,
  serviceAreas: {label: 'Service Areas', path: SERVICE_AREA_HUB_PATH} as SiteLink,
  blog: {label: 'Blog', path: '/blog/'} as SiteLink
} as const;

/** Nested service leaf pages under /services/ */
export const SERVICE_LEAVES: SiteLink[] = [
  {label: 'Shed Removal', path: '/services/shed-removal/'},
  {label: 'Deck Removal', path: '/services/deck-removal/'},
  {label: 'Fence Removal', path: '/services/fence-removal/'},
  {label: 'Interior Demolition', path: '/services/interior-demo/'},
  {label: 'Kitchen Demolition', path: '/services/kitchen-demolition/'},
  {label: 'Bathroom Demolition', path: '/services/bathroom-demolition/'},
  {label: 'Garage Demolition', path: '/services/garage-demolition/'},
  {label: 'House Demolition', path: '/services/house-demolition/'},
  {label: 'Concrete Removal', path: '/services/concrete-removal/'},
  {
    label: 'Commercial Interior Demolition',
    path: '/services/commercial-interior-demolition/'
  },
  {label: 'Cleanout Services', path: '/services/cleanout/'},
  {
    label: 'Construction Debris Removal',
    path: '/services/construction-debris-removal/'
  },
  {label: 'Hoarding Cleanout', path: '/services/hoarding-cleanout/'},
  {label: 'Junk Removal', path: '/services/junk-removal/'}
];

/** City / location pages nested under /service-area/ */}
export const CITY_LEAVES: SiteLink[] = [
  {label: 'Hampton, VA', path: CITY_PATHS.hampton},
  {label: 'Newport News, VA', path: CITY_PATHS.newportNews},
  {label: 'Norfolk, VA', path: CITY_PATHS.norfolk},
  {label: 'Virginia Beach, VA', path: CITY_PATHS.virginiaBeach},
  {label: 'Chesapeake, VA', path: CITY_PATHS.chesapeake},
  {label: 'Portsmouth, VA', path: CITY_PATHS.portsmouth},
  {label: 'Suffolk, VA', path: CITY_PATHS.suffolk}
];

/** Top-level primary nav (after Services / Service Areas dropdowns) */
export const PRIMARY_NAV_LINKS: SiteLink[] = [
  {label: 'Prices', path: '/prices/'},
  {label: 'Cost Guide', path: '/demolition-cost-virginia/'},
  {label: 'Blog', path: '/blog/'},
  {label: 'FAQs', path: '/faqs/'}
];

/** Footer: Company column */
export const COMPANY_LINKS: SiteLink[] = [
  {label: 'About Us', path: '/about/'},
  {label: 'Contact Us', path: '/contact/'},
  {label: 'Blog', path: '/blog/'},
  {label: 'FAQs', path: '/faqs/'},
  {label: 'Prices', path: '/prices/'},
  {label: 'Cost Guide', path: '/demolition-cost-virginia/'}
];

/** Footer: Legal column */
export const LEGAL_LINKS: SiteLink[] = [
  {label: 'Terms and Conditions', path: '/terms/'},
  {label: 'Privacy Policy', path: '/privacy/'}
];

/** Featured services for compact footer lists */
export const FOOTER_SERVICE_LINKS: SiteLink[] = [
  HUBS.services,
  {label: 'House Demolition', path: '/services/house-demolition/'},
  ...SERVICE_LEAVES.filter(
    s =>
      s.path !== '/services/house-demolition/' &&
      [
        '/services/shed-removal/',
        '/services/deck-removal/',
        '/services/interior-demo/',
        '/services/garage-demolition/',
        '/services/junk-removal/',
        '/services/cleanout/'
      ].includes(s.path)
  )
];

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return withSlash;
}

export function findServiceLeaf(pathname: string): SiteLink | undefined {
  const path = normalizePath(pathname);
  return SERVICE_LEAVES.find(s => s.path === path);
}

export function findCityLeaf(pathname: string): SiteLink | undefined {
  const path = normalizePath(pathname);
  return CITY_LEAVES.find(c => c.path === path);
}
