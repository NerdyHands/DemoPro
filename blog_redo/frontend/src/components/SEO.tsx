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
  keywords = "demolition services, shed removal, deck removal, fence removal, Hampton Roads, Virginia Beach, Norfolk, Chesapeake, Newport News, Hampton, demolition contractor, professional demolition, free estimates, 757-848-4559",
  canonicalUrl,
  ogImage = "/main-logo.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
  noIndex = false
}) => {
  const fullTitle = title.includes("Mr Demo Pro") ? title : `${title} | Mr Demo Pro`;
  const fullDescription = description;
  const fullKeywords = keywords;

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
      "addressRegion": "VA",
      "addressCountry": "US"
    },
    "areaServed": [
      "Hampton Roads",
      "Norfolk",
      "Virginia Beach", 
      "Chesapeake",
      "Newport News",
      "Hampton"
    ],
    "serviceType": [
      "Demolition Services",
      "Shed Removal",
      "Deck Removal", 
      "Fence Removal"
    ],
    "priceRange": "$$",
    "image": "https://mrdemopro.com/main-logo.png",
    "logo": "https://mrdemopro.com/main-logo.png"
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
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="Mr Demo Pro" />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `https://mrdemopro.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl || "https://mrdemopro.com"} />
      <meta property="og:site_name" content="Mr Demo Pro" />
      <meta property="og:locale" content="en_US" />
      {/* <meta property="og:updated_time" content={new Date().toISOString()} /> */}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `https://mrdemopro.com${ogImage}`} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="geo.region" content="US-VA" />
      <meta name="geo.placename" content="Hampton Roads" />
      <meta name="geo.position" content="36.8468;-76.2852" />
      <meta name="ICBM" content="36.8468, -76.2852" />
      
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
