import type {ReactNode, MouseEvent} from 'react';
import {trackEmailClick, DEFAULT_EMAIL} from '../config/gtm';
import type {PageType} from '../config/analyticsTypes';

type EmailLinkProps = {
  children: ReactNode;
  email?: string;
  ctaLocation: string;
  ctaLabel?: string;
  pageType?: PageType;
  serviceName?: string;
  className?: string;
  style?: React.CSSProperties;
};

const EmailLink = ({
  children,
  email = DEFAULT_EMAIL,
  ctaLocation,
  ctaLabel,
  pageType,
  serviceName,
  className,
  style
}: EmailLinkProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackEmailClick({
      email_address: email,
      cta_location: ctaLocation,
      cta_label: ctaLabel,
      page_type: pageType,
      service_name: serviceName
    });
    e.currentTarget.blur();
  };

  return (
    <a
      href={`mailto:${email}`}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export default EmailLink;
