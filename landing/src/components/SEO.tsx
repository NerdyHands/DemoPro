import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  // structuredData?: object;
  structuredData?: object | object[];
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = "Mr Demo Pro - Professional Demolition Services in Hampton Roads, VA",
  description = "Professional demolition services in Hampton Roads, VA. Expert shed removal, deck removal, and fence removal. Free estimates. Call 757-848-4559 for quality demolition work.",
  canonicalUrl,
  ogImage = "/main-logo.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
  noIndex = false
}) => {
  const fullTitle = title.includes("Mr Demo Pro") ? title : `${title} | Mr Demo Pro`;
  const fullDescription = description;
  const normalizedCanonicalUrl =
    canonicalUrl && !canonicalUrl.includes('?') && !canonicalUrl.endsWith('/')
      ? `${canonicalUrl}/`
      : canonicalUrl;

  // Default structured data for local business
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://mrdemopro.com/#business",
    "name": "Mr Demo Pro",
    "inLanguage": "en-US",
    "description": "Professional demolition services specializing in shed removal, deck removal, and fence removal in Hampton Roads, VA",
    "url": "https://mrdemopro.com",
    "telephone": "757-848-4559",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hampton",
      "addressRegion": "VA",
      "postalCode": "23664",
      "addressCountry": "US"
    },
    "areaServed": [
      "Hampton",
      "Norfolk",
      "Virginia Beach",
      "Newport News",
      "Chesapeake",
      "Yorktown",
      "Hampton Roads"
    ],
    "serviceType": [
      "Demolition",
      "Shed Removal",
      "Deck Removal",
      "Interior Demolition",
      "Garage Demolition",
      "Mobile Home Demolition",
      "Pool Removal"
    ],
    "priceRange": "$$",
    "image": "https://mrdemopro.com/main-logo.png",
    "logo": "https://mrdemopro.com/main-logo.png",
    "sameAs": [
      "https://www.facebook.com/mrdemopro",
      "https://www.instagram.com/mrdemopro"
    ]
  };

  // const finalStructuredData = structuredData || defaultStructuredData;
const finalStructuredData = structuredData
  ? Array.isArray(structuredData) ? structuredData : [structuredData]
  : [defaultStructuredData];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="author" content="Mr Demo Pro" />
      <meta name="robots" content={noIndex ? "noindex,follow" : "index,follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      
      {/* Canonical URL */}
      {!noIndex && normalizedCanonicalUrl && (
        <link rel="canonical" href={normalizedCanonicalUrl} />
      )}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `https://mrdemopro.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={normalizedCanonicalUrl || "https://mrdemopro.com/"} />
      <meta property="og:site_name" content="Mr Demo Pro" />
      <meta property="og:locale" content="en_US" />
      {/* <meta property="og:updated_time" content={new Date().toISOString()} /> */}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `https://mrdemopro.com${ogImage}`} />
      
      {/* Business-specific meta tags */}
      <meta name="business:contact_data:phone_number" content="757-848-4559" />
      <meta name="business:contact_data:country_name" content="United States" />
      <meta name="business:contact_data:region" content="Virginia" />
      <meta name="business:contact_data:locality" content="Hampton Roads" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
