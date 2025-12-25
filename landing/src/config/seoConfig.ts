// SEO configurations for different pages
export const seoConfig = {
  home: {
    title: "Demolition Services Hampton Roads | Mr Demo Pro – Free Estimates",
    description: "Mr Demo Pro offers professional demolition services in Hampton Roads – shed, deck, and fence removal. Call 757-848-4559 for a free estimate today!",
    keywords: "demolition services, demolition contractor, professional demolition, interior demo, shed removal, cleanout, deck removal, cleanout and junk removal, fence removal, Hampton Roads, Yorktown, Newport News, Hampton, free estimates, 757-848-4559",
    canonicalUrl: "https://mrdemopro.com",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Mr Demo Pro",
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
        "Hampton",
        "Newport News",
        "Yorktown",
        "Norfolk"
      ],
      "serviceType": [
        "Demolition Services",
        "Interior Demo",
        "Shed Removal",
        "Deck Removal", 
        "Fence Removal",

        "Cleanout Services",
        "Junk Removal"
      ],
      "priceRange": "$$",
      "image": "https://mrdemopro.com/main-logo.png",
      "logo": "https://mrdemopro.com/main-logo.png"
    }
  },

  services: {
    title: "Professional Demolition Services - Interior Demo, Shed, Deck & Fence Removal | Mr Demo Pro",
    description: "Comprehensive demolition services including interior demo, shed removal, deck removal, fence removal, junk removal, and cleanout services in Hampton Roads, VA. Professional, efficient, and affordable. Get your free quote today!",
    keywords: "demolition services, demolition contractor, professional demolition, interior demo, shed removal, deck removal, fence removal, junk removal, cleanout, Hampton Roads, Yorktown, Newport News, Hampton, free quotes, demolition estimates",
    canonicalUrl: "https://mrdemopro.com/services/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Services",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Demolition Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Shed Removal"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Deck Removal"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Fence Removal"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Interior Demo"
            }
          },

          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Cleanout Services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Junk Removal"
            }
          }
        ]
      }
    }
  },

  shedRemoval: {
    title: "Shed Removal Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional shed removal services in Hampton Roads, VA. Fast, efficient, and affordable shed demolition. Free estimates. Call 757-848-4559 for expert shed removal.",
    keywords: "shed removal, shed demolition, shed removal Hampton Roads, shed removal Virginia Beach, shed removal Norfolk, shed removal Chesapeake, shed removal Newport News, shed removal Hampton, old shed removal, shed disposal",
    canonicalUrl: "https://mrdemopro.com/shed-removal/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Shed Removal",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional shed removal and demolition services"
    }
  },

  deckRemoval: {
    title: "Deck Removal Services in Hampton Roads, VA | Mr Demo Pro", 
    description: "Expert deck removal services in Hampton Roads, VA. Safe and efficient deck demolition. Transform your outdoor space. Free estimates. Call 757-848-4559.",
    keywords: "deck removal, deck demolition, deck removal Hampton Roads, deck removal Virginia Beach, deck removal Norfolk, deck removal Chesapeake, deck removal Newport News, deck removal Hampton, old deck removal, deck disposal, outdoor deck removal",
    canonicalUrl: "https://mrdemopro.com/deck-removal/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Deck Removal",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional deck removal and demolition services"
    }
  },

  fenceRemoval: {
    title: "Fence Removal Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional fence removal services in Hampton Roads, VA. Quick and efficient fence demolition. Remove old, damaged fences safely. Free estimates. Call 757-848-4559.",
    keywords: "fence removal, fence demolition, fence removal Hampton Roads, fence removal Virginia Beach, fence removal Norfolk, fence removal Chesapeake, fence removal Newport News, fence removal Hampton, old fence removal, fence disposal, damaged fence removal",
    canonicalUrl: "https://mrdemopro.com/fence-removal/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Fence Removal",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional fence removal and demolition services"
    }
  },

  interiorDemo: {
    title: "Interior Demo Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional interior demolition services in Hampton Roads, VA. Expert interior demo for renovations and remodeling. Free estimates. Call 757-848-4559 for quality interior demolition work.",
    keywords: "interior demo, interior demolition, interior demolition Hampton Roads, interior demo Virginia Beach, interior demo Norfolk, interior demo Chesapeake, interior demo Newport News, interior demo Hampton, interior demo Yorktown, renovation demolition, remodeling demo",
    canonicalUrl: "https://mrdemopro.com/interior-demo/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Interior Demo",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional interior demolition and renovation services"
    }
  },


  cleanout: {
    title: "Cleanout Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional cleanout services in Hampton Roads, VA. Expert property cleanout and debris removal. Free estimates. Call 757-848-4559 for cleanout services.",
    keywords: "cleanout services, property cleanout, cleanout Hampton Roads, cleanout Virginia Beach, cleanout Norfolk, cleanout Chesapeake, cleanout Newport News, cleanout Hampton, cleanout Yorktown, debris removal, property cleanup",
    canonicalUrl: "https://mrdemopro.com/cleanout/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Cleanout Services",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional cleanout and debris removal services"
    }
  },

  junkRemoval: {
    title: "Junk Removal Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Fast and reliable junk removal services in Hampton Roads, VA. Same-day service for furniture, appliances, and general junk removal. Free estimates. Call 757-848-4559.",
    keywords: "junk removal, junk removal Hampton Roads, junk removal Virginia Beach, junk removal Norfolk, junk removal Chesapeake, junk removal Newport News, junk removal Hampton, furniture removal, appliance removal, hauling service, debris removal",
    canonicalUrl: "https://mrdemopro.com/junk-removal/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Junk Removal",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Professional junk removal and hauling services"
    }
  },

  contact: {
    title: "Contact Mr Demo Pro - Free Demolition Estimates | Hampton Roads, VA",
    description: "Contact Mr Demo Pro for free demolition estimates in Hampton Roads, VA. Professional shed, deck, and fence removal services. Call 757-848-4559 or get a quote online.",
    keywords: "contact Mr Demo Pro, demolition estimates, free quotes, Hampton Roads demolition, shed removal quote, deck removal quote, fence removal quote, 757-848-4559",
    canonicalUrl: "https://mrdemopro.com/contact/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "757-848-4559",
          "contactType": "customer service"
        }
      }
    }
  },

  faqs: {
    title: "Frequently Asked Questions - Mr Demo Pro Demolition Services",
    description: "Get answers to common questions about demolition services, shed removal, deck removal, and fence removal in Hampton Roads, VA. Expert advice from Mr Demo Pro.",
    keywords: "demolition FAQ, shed removal questions, deck removal questions, fence removal questions, demolition process, demolition costs, Hampton Roads demolition",
    canonicalUrl: "https://mrdemopro.com/faqs/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": {
        "@type": "Question",
        "name": "What demolition services does Mr Demo Pro offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mr Demo Pro offers professional demolition services including shed removal, deck removal, and fence removal in Hampton Roads, VA."
        }
      }
    }
  },

  terms: {
    title: "Terms and Conditions - Mr Demo Pro",
    description: "Terms and conditions for Mr Demo Pro demolition services in Hampton Roads, VA. Professional shed removal, deck removal, and fence removal. Free estimates. Call 757-848-4559.",
    keywords: "terms and conditions, Mr Demo Pro terms, demolition service terms",
    canonicalUrl: "https://mrdemopro.com/terms/",
    noIndex: true
  },

  privacy: {
    title: "Privacy Policy - Mr Demo Pro", 
    description: "Privacy policy for Mr Demo Pro demolition services in Hampton Roads, VA. Professional shed removal, deck removal, and fence removal. Free estimates. Call 757-848-4559.",
    keywords: "privacy policy, Mr Demo Pro privacy, data protection",
    canonicalUrl: "https://mrdemopro.com/privacy/",
    noIndex: true
  }
};

export default seoConfig;
