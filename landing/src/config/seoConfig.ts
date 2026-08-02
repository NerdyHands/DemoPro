// SEO configurations for different pages
export const seoConfig = {
  home: {
    title: "Demolition Company in Hampton Roads | Mr Demo Pro – Free Estimates",
    description: "Professional demolition company in Hampton Roads, VA. Shed, deck, fence & house demolition, junk removal & cleanouts. Free estimates: 757-848-4559.",
    keywords: "demolition company, demolition companies, demolition services, demolition contractor, professional demolition, interior demo, shed removal, cleanout, deck removal, cleanout and junk removal, fence removal, Hampton Roads, Yorktown, Newport News, Hampton, free estimates, 757-848-4559",
    canonicalUrl: "https://mrdemopro.com",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Mr Demo Pro",
      "description": "Professional demolition company offering shed, deck, fence, house demolition, junk removal, and cleanouts in Hampton Roads, VA",
      "url": "https://mrdemopro.com",
      "telephone": "757-848-4559",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "VA",
        "addressCountry": "US"
      },
      "areaServed": [
        "Hampton",
        "Norfolk",
        "Virginia Beach",
        "Newport News",
        "Chesapeake",
        "Hampton Roads"
      ],
      "serviceType": [
        "Demolition",
        "Shed Removal",
        "Deck Removal",
        "Interior Demolition",
        "Garage Demolition",
        "House Demolition",
        "Junk Removal",
        "Cleanout Services",
      ],
      "priceRange": "$$",
      "image": "https://mrdemopro.com/main-logo.png",
      "logo": "https://mrdemopro.com/main-logo.png"
    }
  },

  services: {
    title: "Professional Demolition Services - Interior Demo, Shed, Deck & Fence Removal | Mr Demo Pro",
    description: "Residential & commercial demolition in Hampton Roads: shed, deck, fence, interior, kitchen, bath, garage, house demo, junk removal & cleanouts. Free quote: 757-848-4559.",
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
              "name": "Kitchen Demolition"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Bathroom Demolition"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Garage Demolition"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "House Demolition"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Concrete Removal"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Commercial Interior Demolition"
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

  buildingDemolition: {
    title: "Building Demolition Services in Hampton Roads | Mr Demo Pro",
    description: "Professional building demolition services for residential and commercial structures in Hampton Roads, VA. Safe teardown, debris removal, and site cleanup. Call 757-848-4559.",
    keywords: "building demolition, demolition company, demolition contractor, building removal, structural demolition, Hampton Roads demolition",
    canonicalUrl: "https://mrdemopro.com/building-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Building Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Building demolition services for residential and commercial structures"
    }
  },

  demolitionServices: {
    title: "Demolition Services in Hampton Roads | Mr Demo Pro",
    description: "Full-service demolition services in Hampton Roads, VA including building, concrete, residential, and commercial demolition. Get a free estimate today.",
    keywords: "demolition services, demolition company, demolition contractor, Hampton Roads demolition, concrete demolition, residential demolition, commercial demolition",
    canonicalUrl: "https://mrdemopro.com/demolition-services/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Services",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  demolitionContractorHamptonVa: {
    title: "Demolition Contractor Hampton VA | Mr Demo Pro",
    description: "Need a demolition contractor in Hampton, VA? Mr Demo Pro provides demolition and removal services across Hampton Roads including selective demo, concrete removal, garage demolition, and commercial interior strip-outs. Call 757-848-4559.",
    keywords: "demolition contractor Hampton VA, Hampton demolition company, demolition services Hampton VA, concrete removal Hampton, garage demolition Hampton, commercial interior demolition Hampton",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-hampton-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton, VA",
      "url": "https://mrdemopro.com/demolition-contractor-hampton-va/"
    }
  },

  serviceAreas: {
    title: "Demolition Service Areas in Hampton Roads | Mr Demo Pro",
    description: "Local demolition service areas in Hampton Roads, VA including Hampton, Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, and Suffolk. Call 757-848-4559.",
    keywords: "demolition service area Hampton Roads, demolition contractor Newport News, demolition contractor Norfolk, demolition contractor Hampton VA, demolition contractor Virginia Beach, demolition contractor Chesapeake, local demolition company Hampton Roads",
    canonicalUrl: "https://mrdemopro.com/service-area/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Demolition Service Areas | Mr Demo Pro",
      "description": "Hub page for Hampton Roads demolition service areas including Hampton, Newport News, Norfolk, Virginia Beach, Chesapeake, Portsmouth, and Suffolk.",
      "url": "https://mrdemopro.com/service-area/",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      }
    }
  },

  demolitionContractorNewportNewsVa: {
    title: "Demolition Contractor Newport News VA | Mr Demo Pro",
    description: "Demolition contractor in Newport News, VA for interior demo, garage removal, concrete tear-out, and debris haul-off. Local Hampton Roads crew. Call 757-848-4559 for a free quote.",
    keywords: "demolition contractor Newport News VA, Newport News demolition company, demolition services Newport News, concrete removal Newport News, garage demolition Newport News",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-newport-news-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Newport News, VA",
      "url": "https://mrdemopro.com/demolition-contractor-newport-news-va/"
    }
  },

  demolitionContractorNorfolkVa: {
    title: "Demolition Contractor Norfolk VA | Mr Demo Pro",
    description: "Demolition contractor in Norfolk, VA: selective interior demolition, garage and concrete removal, commercial strip-outs, and debris disposal. Serving Hampton Roads. Call 757-848-4559.",
    keywords: "demolition contractor Norfolk VA, Norfolk demolition company, demolition services Norfolk, concrete removal Norfolk, interior demolition Norfolk",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-norfolk-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Norfolk, VA",
      "url": "https://mrdemopro.com/demolition-contractor-norfolk-va/"
    }
  },

  demolitionContractorVirginiaBeachVa: {
    title: "Demolition Contractor Virginia Beach VA | Mr Demo Pro",
    description: "Demolition contractor in Virginia Beach, VA for interior demo, concrete removal, garage demolition, commercial strip-outs, and debris haul-off. Call 757-848-4559.",
    keywords: "demolition contractor Virginia Beach VA, Virginia Beach demolition company, demolition services Virginia Beach, concrete removal Virginia Beach, interior demolition Virginia Beach",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-virginia-beach-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Virginia Beach, VA",
      "url": "https://mrdemopro.com/demolition-contractor-virginia-beach-va/"
    }
  },

  demolitionContractorChesapeakeVa: {
    title: "Demolition Contractor Chesapeake VA | Mr Demo Pro",
    description: "Demolition contractor in Chesapeake, VA for selective interior demolition, concrete removal, garage and shed demolition, and debris hauling. Call 757-848-4559.",
    keywords: "demolition contractor Chesapeake VA, Chesapeake demolition company, demolition services Chesapeake, concrete removal Chesapeake, garage demolition Chesapeake",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-chesapeake-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Chesapeake, VA",
      "url": "https://mrdemopro.com/demolition-contractor-chesapeake-va/"
    }
  },

  demolitionContractorPortsmouthVa: {
    title: "Demolition Contractor Portsmouth VA | Mr Demo Pro",
    description: "Demolition contractor in Portsmouth, VA for remodel tear-outs, concrete removal, garage demolition, commercial strip-outs, and debris haul-off. Call 757-848-4559.",
    keywords: "demolition contractor Portsmouth VA, Portsmouth demolition company, demolition services Portsmouth, concrete removal Portsmouth, interior demolition Portsmouth",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-portsmouth-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Portsmouth, VA",
      "url": "https://mrdemopro.com/demolition-contractor-portsmouth-va/"
    }
  },

  demolitionContractorSuffolkVa: {
    title: "Demolition Contractor Suffolk VA | Mr Demo Pro",
    description: "Demolition contractor in Suffolk, VA for selective demolition, concrete and garage removal, small-structure teardown, and debris hauling. Call 757-848-4559.",
    keywords: "demolition contractor Suffolk VA, Suffolk demolition company, demolition services Suffolk, concrete removal Suffolk, garage demolition Suffolk",
    canonicalUrl: "https://mrdemopro.com/demolition-contractor-suffolk-va/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Demolition Contractor",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Suffolk, VA",
      "url": "https://mrdemopro.com/demolition-contractor-suffolk-va/"
    }
  },

  demolitionCostVirginia: {
    title: "How Much Does Demolition Cost in Virginia? | Mr Demo Pro",
    description: "Learn what affects demolition cost in Virginia, including scope, debris, access, disposal, and cleanup. Hampton Roads demolition estimates from Mr Demo Pro.",
    keywords: "how much does demolition cost in Virginia, demolition cost Virginia, demolition pricing Hampton Roads, demolition estimate VA",
    canonicalUrl: "https://mrdemopro.com/demolition-cost-virginia/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How Much Does Demolition Cost in Virginia?",
      "description": "A practical guide to demolition pricing factors in Virginia and Hampton Roads.",
      "author": {
        "@type": "Organization",
        "name": "Mr Demo Pro"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mr Demo Pro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://mrdemopro.com/main-logo.png"
        }
      },
      "mainEntityOfPage": "https://mrdemopro.com/demolition-cost-virginia/"
    }
  },

  concreteDemolition: {
    title: "Concrete Demolition in Hampton Roads | Mr Demo Pro",
    description: "Concrete demolition services for driveways, slabs, patios, and foundations in Hampton Roads, VA. Fast removal and haul-off. Call 757-848-4559.",
    keywords: "concrete demolition, driveway demolition, slab removal, patio removal, foundation demolition, Hampton Roads concrete removal",
    canonicalUrl: "https://mrdemopro.com/concrete-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Concrete Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  residentialDemolition: {
    title: "Residential Demolition Contractors in Hampton Roads | Mr Demo Pro",
    description: "Residential demolition contractors for home and structure removal in Hampton Roads, VA. Safe demolition with complete cleanup. Call 757-848-4559.",
    keywords: "residential demolition contractors, residential demolition, house demolition, home demolition, Hampton Roads demolition",
    canonicalUrl: "https://mrdemopro.com/residential-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Residential Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  garageDemolition: {
    title: "Garage Demolition and Removal in Hampton Roads | Mr Demo Pro",
    description: "Garage demolition services in Hampton Roads, VA. We handle demolition of garage structures, slabs, and full debris removal. Call 757-848-4559.",
    keywords: "garage demolition, demolition of garage, garage removal, garage tear down, Hampton Roads demolition",
    canonicalUrl: "https://mrdemopro.com/garage-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Garage Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  commercialDemolition: {
    title: "Commercial Demolition Companies in Hampton Roads | Mr Demo Pro",
    description: "Commercial demolition services for offices, retail, and industrial sites in Hampton Roads, VA. Safe, schedule-driven teardown. Call 757-848-4559.",
    keywords: "commercial demolition companies, commercial demolition, commercial demolition contractors, Hampton Roads demolition",
    canonicalUrl: "https://mrdemopro.com/commercial-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Commercial Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  tenantCleanOut: {
    title: "Tenant Clean Out Services in Hampton Roads | Mr Demo Pro",
    description: "Tenant clean out services for landlords and property managers in Hampton Roads, VA. Fast cleanouts, debris removal, and unit prep. Call 757-848-4559.",
    keywords: "tenant clean out, tenant cleanout, eviction clean out, rental cleanout, Hampton Roads cleanout",
    canonicalUrl: "https://mrdemopro.com/tenant-clean-out/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Tenant Clean Out",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA"
    }
  },

  shedRemoval: {
    title: "Shed Removal Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional shed removal in Hampton Roads, VA. Fast, safe demolition with cleanup included. Free estimate. Call 757-848-4559.",
    keywords: "shed removal, shed demolition, shed removal Hampton Roads, shed removal Virginia Beach, shed removal Norfolk, shed removal Chesapeake, shed removal Newport News, shed removal Hampton, old shed removal, shed disposal",
    canonicalUrl: "https://mrdemopro.com/services/shed-removal/",
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
    description: "Expert deck removal and demolition in Hampton Roads. Old, unsafe, or unwanted decks removed safely. Free quote. 757-848-4559.",
    keywords: "deck removal, deck demolition, deck removal Hampton Roads, deck removal Virginia Beach, deck removal Norfolk, deck removal Chesapeake, deck removal Newport News, deck removal Hampton, old deck removal, deck disposal, outdoor deck removal",
    canonicalUrl: "https://mrdemopro.com/services/deck-removal/",
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
    description: "Fence removal and demolition in Hampton Roads. Old, damaged, or unwanted fences removed. Fast service with cleanup. Free estimate. 757-848-4559.",
    keywords: "fence removal, fence demolition, fence removal Hampton Roads, fence removal Virginia Beach, fence removal Norfolk, fence removal Chesapeake, fence removal Newport News, fence removal Hampton, old fence removal, fence disposal, damaged fence removal",
    canonicalUrl: "https://mrdemopro.com/services/fence-removal/",
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
    description: "Professional interior demolition for renovations and remodeling. Walls, fixtures, structures safely removed. Hampton Roads, VA. 757-848-4559.",
    keywords: "interior demo, interior demolition, interior demolition Hampton Roads, interior demo Virginia Beach, interior demo Norfolk, interior demo Chesapeake, interior demo Newport News, interior demo Hampton, interior demo Yorktown, renovation demolition, remodeling demo",
    canonicalUrl: "https://mrdemopro.com/services/interior-demo/",
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

  kitchenDemolition: {
    title: "Kitchen Demolition in Hampton Roads, VA | Mr Demo Pro",
    description: "Kitchen demolition for remodels in Hampton Roads, VA. Cabinet removal, countertop demo, flooring and drywall removal, debris haul-off, and cleanup. Call 757-848-4559 for a free estimate.",
    keywords: "kitchen demolition, cabinet removal, countertop removal, kitchen demo contractors, kitchen remodel demolition, Hampton Roads kitchen demolition",
    canonicalUrl: "https://mrdemopro.com/services/kitchen-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Kitchen Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "url": "https://mrdemopro.com/services/kitchen-demolition/"
    }
  },

  bathroomDemolition: {
    title: "Bathroom Demolition in Hampton Roads, VA | Mr Demo Pro",
    description: "Professional bathroom demolition and interior removal for renovations. Safe, licensed. Free estimate. 757-848-4559.",
    keywords: "bathroom demolition, tub removal, shower removal, tile removal, bathroom demo contractors, Hampton Roads bathroom demolition",
    canonicalUrl: "https://mrdemopro.com/services/bathroom-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Bathroom Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "url": "https://mrdemopro.com/services/bathroom-demolition/"
    }
  },

  serviceGarageDemolition: {
    title: "Garage Demolition in Hampton Roads, VA | Mr Demo Pro",
    description: "Garage demolition and removal in Hampton Roads. Licensed, insured, fully cleaned up. Free estimate. 757-848-4559.",
    keywords: "garage demolition, garage removal, detached garage demolition, attached garage demolition, Hampton Roads garage demolition",
    canonicalUrl: "https://mrdemopro.com/services/garage-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Garage Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "url": "https://mrdemopro.com/services/garage-demolition/"
    }
  },

  concreteRemoval: {
    title: "Concrete Removal in Hampton Roads, VA | Mr Demo Pro",
    description: "Concrete removal and demolition in Hampton Roads. Driveway, patio, foundation removal. Safe, professional. Free estimate. 757-848-4559.",
    keywords: "concrete removal, driveway removal, patio removal, slab removal, concrete haul off, Hampton Roads concrete removal",
    canonicalUrl: "https://mrdemopro.com/services/concrete-removal/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Concrete Removal",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "url": "https://mrdemopro.com/services/concrete-removal/"
    }
  },

  commercialInteriorDemolition: {
    title: "Commercial Interior Demolition in Hampton Roads, VA | Mr Demo Pro",
    description: "Commercial interior demolition and strip-outs in Hampton Roads, VA for offices, retail, and tenant improvements. Selective demo, debris haul-off, and cleanup included. Call 757-848-4559.",
    keywords: "commercial interior demolition, office demolition, retail strip out, tenant improvement demolition, selective demolition, Hampton Roads commercial demo",
    canonicalUrl: "https://mrdemopro.com/services/commercial-interior-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Commercial Interior Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "url": "https://mrdemopro.com/services/commercial-interior-demolition/"
    }
  },


  cleanout: {
    title: "Cleanout Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Property cleanout and debris removal in Hampton Roads. Estate cleanouts, construction debris, site cleanup. Free quote. 757-848-4559.",
    keywords: "cleanout services, property cleanout, cleanout Hampton Roads, cleanout Virginia Beach, cleanout Norfolk, cleanout Chesapeake, cleanout Newport News, cleanout Hampton, cleanout Yorktown, debris removal, property cleanup",
    canonicalUrl: "https://mrdemopro.com/services/cleanout/",
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

  hoardingCleanout: {
    title: "Hoarding Cleanout Services in Hampton, VA | Mr Demo Pro",
    description: "Compassionate, discreet hoarding cleanout services in Hampton Roads, VA. We sort, haul, and clean heavily cluttered homes with respect and full debris disposal. Free estimate. Call 757-848-4559.",
    keywords: "hoarding cleanout, hoarding cleanout services Hampton VA, hoarder house cleanout, hoarding cleanup Hampton Roads, estate hoarding cleanout, biohazard cleanout, cluttered home cleanout, Hampton, Newport News, Norfolk",
    canonicalUrl: "https://mrdemopro.com/services/hoarding-cleanout/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Hoarding Cleanout",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Compassionate hoarding cleanout and debris removal services",
      "url": "https://mrdemopro.com/services/hoarding-cleanout/"
    }
  },

  junkRemoval: {
    title: "Junk Removal Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Junk removal services in Hampton Roads. Furniture, appliances, debris removal. Fast, reliable, fully insured. Free estimate. Call 757-848-4559.",
    keywords: "junk removal, junk removal Hampton Roads, junk removal Virginia Beach, junk removal Norfolk, junk removal Chesapeake, junk removal Newport News, junk removal Hampton, furniture removal, appliance removal, hauling service, debris removal",
    canonicalUrl: "https://mrdemopro.com/services/junk-removal/",
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

  houseDemolition: {
    title: "House Demolition Services in Hampton Roads, VA | Mr Demo Pro",
    description: "Whole house demolition in Hampton Roads, VA. Full teardown, foundation removal, debris haul-off & permit help. Free estimate: 757-848-4559.",
    keywords: "house demolition, whole house demolition, residential demolition, house teardown, foundation removal, demolition permit, Hampton Roads house demolition, Virginia Beach, Norfolk, Newport News, Hampton",
    canonicalUrl: "https://mrdemopro.com/services/house-demolition/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "House Demolition",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
      },
      "areaServed": "Hampton Roads, VA",
      "description": "Whole house demolition, foundation removal, and debris haul-off services",
      "url": "https://mrdemopro.com/services/house-demolition/"
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

  about: {
    title: "About Mr Demo Pro | Hampton Roads Demolition Contractor",
    description: "Learn about Mr Demo Pro, a trusted demolition contractor in Hampton Roads, VA offering safe, reliable demolition services and cleanup.",
    keywords: "about Mr Demo Pro, demolition contractor, demolition company, Hampton Roads demolition services",
    canonicalUrl: "https://mrdemopro.com/about/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Mr Demo Pro",
        "telephone": "757-848-4559"
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
