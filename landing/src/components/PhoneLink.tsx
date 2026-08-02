import type {ReactNode, MouseEvent} from 'react';
import {trackPhoneClick} from '../config/gtm';
import type {ClickLocation, PageType} from '../config/analyticsTypes';
import {DEFAULT_PHONE} from '../config/gtm';

type PhoneLinkProps = {
  children: ReactNode;
  /** Legacy cta_location string for phone_click event */
  ctaLocation: string;
  clickLocation?: ClickLocation;
  ctaLabel?: string;
  pageType?: PageType;
  serviceName?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

const PhoneLink = ({
  children,
  ctaLocation,
  clickLocation,
  ctaLabel,
  pageType,
  serviceName,
  className,
  style,
  ariaLabel
}: PhoneLinkProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackPhoneClick({
      cta_location: ctaLocation,
      click_location: clickLocation,
      cta_label: ctaLabel,
      page_type: pageType,
      service_name: serviceName
    });
    e.currentTarget.blur();
  };

  return (
    <a
      href={`tel:${DEFAULT_PHONE}`}
      className={className}
      style={style}
      aria-label={ariaLabel ?? 'Call Mr Demo Pro'}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default PhoneLink;
