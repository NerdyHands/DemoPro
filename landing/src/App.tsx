import React from 'react';
import {Routes, Route, Link, useLocation, Navigate} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import {Container} from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import SEO from './components/SEO';
import Home from './pages/Home';
import Prices from './pages/Prices';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ShedRemoval from './pages/ShedRemoval';
import DeckRemoval from './pages/DeckRemoval';
import FenceRemoval from './pages/FenceRemoval';
import InteriorDemo from './pages/InteriorDemo';
import Cleanout from './pages/Cleanout';
import HoardingCleanout from './pages/HoardingCleanout';
import ConstructionDebrisRemoval from './pages/ConstructionDebrisRemoval';
import JunkRemoval from './pages/JunkRemoval';
import BuildingDemolition from './pages/BuildingDemolition';
import DemolitionServices from './pages/DemolitionServices';
import ConcreteDemolition from './pages/ConcreteDemolition';
import ResidentialDemolition from './pages/ResidentialDemolition';
import CommercialDemolition from './pages/CommercialDemolition';
import TenantCleanOut from './pages/TenantCleanOut';
import KitchenDemolition from './pages/KitchenDemolition';
import BathroomDemolition from './pages/BathroomDemolition';
import ServiceGarageDemolition from './pages/ServiceGarageDemolition';
import ConcreteRemoval from './pages/ConcreteRemoval';
import HouseDemolition from './pages/HouseDemolition';
import CommercialInteriorDemolition from './pages/CommercialInteriorDemolition';
import DemolitionContractorHamptonVa from './pages/DemolitionContractorHamptonVa';
import DemolitionContractorNewportNewsVa from './pages/DemolitionContractorNewportNewsVa';
import DemolitionContractorNorfolkVa from './pages/DemolitionContractorNorfolkVa';
import DemolitionContractorVirginiaBeachVa from './pages/DemolitionContractorVirginiaBeachVa';
import DemolitionContractorChesapeakeVa from './pages/DemolitionContractorChesapeakeVa';
import DemolitionContractorPortsmouthVa from './pages/DemolitionContractorPortsmouthVa';
import DemolitionContractorSuffolkVa from './pages/DemolitionContractorSuffolkVa';
import ServiceArea from './pages/ServiceArea';
import About from './pages/About';
import FAQs from './pages/FAQs';
import ThankYou from './pages/ThankYou';
import Blog from './pages/Blog';
import BlogPost, { BlogPostTrailingRedirect } from './pages/BlogPost';
import BlogTag, { BlogTagTrailingRedirect } from './pages/BlogTag';
import DiyVsProDemolition from './pages/DiyVsProDemolition';
import DiyQuizThankYou from './pages/DiyQuizThankYou';
import DemolitionCostVirginia from './pages/DemolitionCostVirginia';
import seoConfig from './config/seoConfig';
import {
  getServiceNameFromPath,
  isServicePath,
  trackPageMetadata,
  trackPageView,
  trackServiceView
} from './config/gtm';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = /^\/diy-vs-pro-demolition\/?$/.test(
    location.pathname
  );

  const lastServiceViewPath = React.useRef<string | null>(null);

  // Track SPA route changes (GTM doesn't automatically fire page views on client-side navigation)
  React.useEffect(() => {
    trackPageView(document.title, window.location.href);
    trackPageMetadata(location.pathname, location.search);

    if (isServicePath(location.pathname)) {
      const serviceName = getServiceNameFromPath(location.pathname);
      if (serviceName && lastServiceViewPath.current !== location.pathname) {
        lastServiceViewPath.current = location.pathname;
        trackServiceView(serviceName, location.pathname);
      }
    } else {
      lastServiceViewPath.current = null;
    }
  }, [location.pathname, location.search, location.hash]);

  // Global error handler to prevent external script errors from affecting the app
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore errors from external scripts that don't affect our app functionality
      if (
        event.filename &&
        (event.filename.includes('multiVariateTestingCS.js') ||
          event.filename.includes('chrome-extension') ||
          event.filename.includes('extension') ||
          event.filename.includes('content-script') ||
          event.filename.includes('background-script') ||
          event.filename.includes('gtm.js') ||
          event.filename.includes('googletagmanager.com'))
      ) {
        event.preventDefault();
        return false;
      }

      // Ignore "message port closed" errors (common with browser extensions)
      if (
        event.message &&
        (event.message.includes('message port closed') ||
          event.message.includes('Content Security Policy') ||
          event.message.includes('CORS policy') ||
          event.message.includes('postMessage') ||
          event.message.includes('target origin'))
      ) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore unhandled promise rejections from external scripts
      if (
        event.reason &&
        typeof event.reason === 'string' &&
        (event.reason.includes('multiVariateTestingCS') ||
          event.reason.includes('chrome-extension') ||
          event.reason.includes('extension') ||
          event.reason.includes('message port closed') ||
          event.reason.includes('isInitialized') ||
          event.reason.includes('CORS') ||
          event.reason.includes('Failed to fetch') ||
          event.reason.includes('Content Security Policy'))
      ) {
        event.preventDefault();
        return false;
      }
    };

    // Handle console errors from external scripts
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (
        errorMessage.includes('multiVariateTestingCS') ||
        errorMessage.includes('chrome-extension') ||
        errorMessage.includes('message port closed') ||
        errorMessage.includes('isInitialized') ||
        errorMessage.includes('Content Security Policy') ||
        errorMessage.includes(
          'violates the following Content Security Policy'
        ) ||
        errorMessage.includes('CORS policy') ||
        errorMessage.includes('Access-Control-Allow-Origin') ||
        errorMessage.includes('postMessage') ||
        errorMessage.includes('target origin') ||
        (errorMessage.includes('Failed to fetch') &&
          errorMessage.includes('script.google.com'))
      ) {
        return; // Suppress these errors
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);

  return (
    <div className="App">
      {!isLandingPage && <Header />}
      <main>
        <Routes>
            <Route
              path="/"
              element={
                <>
                  <SEO
                    {...seoConfig.home}
                    canonicalUrl="https://mrdemopro.com/"
                  />
                  <Home />
                </>
              }
            />
            <Route
              path="/services"
              element={<Navigate to="/services/" replace />}
            />
            <Route
              path="/services/"
              element={
                <>
                  <SEO
                    {...seoConfig.services}
                    canonicalUrl="https://mrdemopro.com/services/"
                  />
                  <Services />
                </>
              }
            />
            <Route
              path="/building-demolition"
              element={<Navigate to="/building-demolition/" replace />}
            />
            <Route
              path="/building-demolition/"
              element={
                <>
                  <SEO
                    title="Building Demolition Services in Hampton Roads | Mr Demo Pro"
                    description="Professional building demolition services for residential and commercial structures in Hampton Roads, VA. Safe teardown, debris removal, and site cleanup. Call 757-848-4559."
                    keywords="building demolition, demolition company, demolition contractor, building removal, structural demolition, Hampton Roads demolition"
                    structuredData={seoConfig.buildingDemolition.structuredData}
                    canonicalUrl="https://mrdemopro.com/building-demolition/"
                  />
                  <BuildingDemolition />
                </>
              }
            />
            <Route
              path="/demolition-services"
              element={<Navigate to="/demolition-services/" replace />}
            />
            <Route
              path="/demolition-services/"
              element={
                <>
                  <SEO
                    title="Demolition Services in Hampton Roads | Mr Demo Pro"
                    description="Full-service demolition services in Hampton Roads, VA including building, concrete, residential, and commercial demolition. Get a free estimate today."
                    keywords="demolition services, demolition company, demolition contractor, Hampton Roads demolition, concrete demolition, residential demolition, commercial demolition"
                    structuredData={seoConfig.demolitionServices.structuredData}
                    canonicalUrl="https://mrdemopro.com/demolition-services/"
                  />
                  <DemolitionServices />
                </>
              }
            />
            <Route
              path="/demolition-contractor-hampton-va"
              element={
                <Navigate to="/demolition-contractor-hampton-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-hampton-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorHamptonVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-hampton-va/"
                  />
                  <DemolitionContractorHamptonVa />
                </>
              }
            />
            <Route
              path="/service-area"
              element={<Navigate to="/service-area/" replace />}
            />
            <Route
              path="/service-area/"
              element={
                <>
                  <SEO
                    {...seoConfig.serviceAreas}
                    canonicalUrl="https://mrdemopro.com/service-area/"
                  />
                  <ServiceArea />
                </>
              }
            />
            <Route
              path="/demolition-contractor-newport-news-va"
              element={
                <Navigate to="/demolition-contractor-newport-news-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-newport-news-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorNewportNewsVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-newport-news-va/"
                  />
                  <DemolitionContractorNewportNewsVa />
                </>
              }
            />
            <Route
              path="/demolition-contractor-norfolk-va"
              element={
                <Navigate to="/demolition-contractor-norfolk-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-norfolk-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorNorfolkVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-norfolk-va/"
                  />
                  <DemolitionContractorNorfolkVa />
                </>
              }
            />
            <Route
              path="/demolition-contractor-virginia-beach-va"
              element={
                <Navigate to="/demolition-contractor-virginia-beach-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-virginia-beach-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorVirginiaBeachVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-virginia-beach-va/"
                  />
                  <DemolitionContractorVirginiaBeachVa />
                </>
              }
            />
            <Route
              path="/demolition-contractor-chesapeake-va"
              element={
                <Navigate to="/demolition-contractor-chesapeake-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-chesapeake-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorChesapeakeVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-chesapeake-va/"
                  />
                  <DemolitionContractorChesapeakeVa />
                </>
              }
            />
            <Route
              path="/demolition-contractor-portsmouth-va"
              element={
                <Navigate to="/demolition-contractor-portsmouth-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-portsmouth-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorPortsmouthVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-portsmouth-va/"
                  />
                  <DemolitionContractorPortsmouthVa />
                </>
              }
            />
            <Route
              path="/demolition-contractor-suffolk-va"
              element={
                <Navigate to="/demolition-contractor-suffolk-va/" replace />
              }
            />
            <Route
              path="/demolition-contractor-suffolk-va/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionContractorSuffolkVa}
                    canonicalUrl="https://mrdemopro.com/demolition-contractor-suffolk-va/"
                  />
                  <DemolitionContractorSuffolkVa />
                </>
              }
            />
            <Route
              path="/concrete-demolition"
              element={<Navigate to="/concrete-demolition/" replace />}
            />
            <Route
              path="/concrete-demolition/"
              element={
                <>
                  <SEO
                    title="Concrete Demolition in Hampton Roads | Mr Demo Pro"
                    description="Concrete demolition services for driveways, slabs, patios, and foundations in Hampton Roads, VA. Fast removal and haul-off. Call 757-848-4559."
                    keywords="concrete demolition, driveway demolition, slab removal, patio removal, foundation demolition, Hampton Roads concrete removal"
                    structuredData={seoConfig.concreteDemolition.structuredData}
                    canonicalUrl="https://mrdemopro.com/concrete-demolition/"
                  />
                  <ConcreteDemolition />
                </>
              }
            />
            <Route
              path="/residential-demolition"
              element={<Navigate to="/residential-demolition/" replace />}
            />
            <Route
              path="/residential-demolition/"
              element={
                <>
                  <SEO
                    title="Residential Demolition Contractors in Hampton Roads | Mr Demo Pro"
                    description="Residential demolition contractors for home and structure removal in Hampton Roads, VA. Safe demolition with complete cleanup. Call 757-848-4559."
                    keywords="residential demolition contractors, residential demolition, house demolition, home demolition, Hampton Roads demolition"
                    structuredData={seoConfig.residentialDemolition.structuredData}
                    canonicalUrl="https://mrdemopro.com/residential-demolition/"
                  />
                  <ResidentialDemolition />
                </>
              }
            />
            <Route
              path="/garage-demolition"
              element={<Navigate to="/services/garage-demolition/" replace />}
            />
            <Route
              path="/garage-demolition/"
              element={<Navigate to="/services/garage-demolition/" replace />}
            />
            <Route
              path="/deck-removal"
              element={<Navigate to="/services/deck-removal/" replace />}
            />
            <Route
              path="/deck-removal/"
              element={<Navigate to="/services/deck-removal/" replace />}
            />
            <Route
              path="/shed-removal"
              element={<Navigate to="/services/shed-removal/" replace />}
            />
            <Route
              path="/shed-removal/"
              element={<Navigate to="/services/shed-removal/" replace />}
            />
            <Route
              path="/fence-removal"
              element={<Navigate to="/services/fence-removal/" replace />}
            />
            <Route
              path="/fence-removal/"
              element={<Navigate to="/services/fence-removal/" replace />}
            />
            <Route
              path="/interior-demo"
              element={<Navigate to="/services/interior-demo/" replace />}
            />
            <Route
              path="/interior-demo/"
              element={<Navigate to="/services/interior-demo/" replace />}
            />
            <Route
              path="/junk-removal"
              element={<Navigate to="/services/junk-removal/" replace />}
            />
            <Route
              path="/junk-removal/"
              element={<Navigate to="/services/junk-removal/" replace />}
            />
            <Route
              path="/cleanout"
              element={<Navigate to="/services/cleanout/" replace />}
            />
            <Route
              path="/cleanout/"
              element={<Navigate to="/services/cleanout/" replace />}
            />
            <Route
              path="/commercial-demolition"
              element={<Navigate to="/commercial-demolition/" replace />}
            />
            <Route
              path="/commercial-demolition/"
              element={
                <>
                  <SEO
                    title="Commercial Demolition Companies in Hampton Roads | Mr Demo Pro"
                    description="Commercial demolition services for offices, retail, and industrial sites in Hampton Roads, VA. Safe, schedule-driven teardown. Call 757-848-4559."
                    keywords="commercial demolition companies, commercial demolition, commercial demolition contractors, Hampton Roads demolition"
                    structuredData={seoConfig.commercialDemolition.structuredData}
                    canonicalUrl="https://mrdemopro.com/commercial-demolition/"
                  />
                  <CommercialDemolition />
                </>
              }
            />
            <Route
              path="/tenant-clean-out"
              element={<Navigate to="/tenant-clean-out/" replace />}
            />
            <Route
              path="/tenant-clean-out/"
              element={
                <>
                  <SEO
                    {...seoConfig.tenantCleanOut}
                    canonicalUrl="https://mrdemopro.com/tenant-clean-out/"
                  />
                  <TenantCleanOut />
                </>
              }
            />
            {/* Service Pages */}
            <Route
              path="/services/shed-removal"
              element={<Navigate to="/services/shed-removal/" replace />}
            />
            <Route
              path="/services/shed-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.shedRemoval}
                    canonicalUrl="https://mrdemopro.com/services/shed-removal/"
                  />
                  <ShedRemoval />
                </>
              }
            />
            <Route
              path="/services/deck-removal"
              element={<Navigate to="/services/deck-removal/" replace />}
            />
            <Route
              path="/services/deck-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.deckRemoval}
                    canonicalUrl="https://mrdemopro.com/services/deck-removal/"
                  />
                  <DeckRemoval />
                </>
              }
            />
            <Route
              path="/services/fence-removal"
              element={<Navigate to="/services/fence-removal/" replace />}
            />
            <Route
              path="/services/fence-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.fenceRemoval}
                    canonicalUrl="https://mrdemopro.com/services/fence-removal/"
                  />
                  <FenceRemoval />
                </>
              }
            />
            <Route
              path="/services/interior-demo"
              element={<Navigate to="/services/interior-demo/" replace />}
            />
            <Route
              path="/services/interior-demo/"
              element={
                <>
                  <SEO
                    {...seoConfig.interiorDemo}
                    canonicalUrl="https://mrdemopro.com/services/interior-demo/"
                  />
                  <InteriorDemo />
                </>
              }
            />
            <Route
              path="/services/kitchen-demolition"
              element={
                <Navigate to="/services/kitchen-demolition/" replace />
              }
            />
            <Route
              path="/services/kitchen-demolition/"
              element={
                <>
                  <SEO
                    {...seoConfig.kitchenDemolition}
                    canonicalUrl="https://mrdemopro.com/services/kitchen-demolition/"
                  />
                  <KitchenDemolition />
                </>
              }
            />
            <Route
              path="/services/bathroom-demolition"
              element={
                <Navigate to="/services/bathroom-demolition/" replace />
              }
            />
            <Route
              path="/services/bathroom-demolition/"
              element={
                <>
                  <SEO
                    {...seoConfig.bathroomDemolition}
                    canonicalUrl="https://mrdemopro.com/services/bathroom-demolition/"
                  />
                  <BathroomDemolition />
                </>
              }
            />
            <Route
              path="/services/garage-demolition"
              element={
                <Navigate to="/services/garage-demolition/" replace />
              }
            />
            <Route
              path="/services/garage-demolition/"
              element={
                <>
                  <SEO
                    {...seoConfig.serviceGarageDemolition}
                    canonicalUrl="https://mrdemopro.com/services/garage-demolition/"
                  />
                  <ServiceGarageDemolition />
                </>
              }
            />
            <Route
              path="/services/concrete-removal"
              element={<Navigate to="/services/concrete-removal/" replace />}
            />
            <Route
              path="/services/concrete-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.concreteRemoval}
                    canonicalUrl="https://mrdemopro.com/services/concrete-removal/"
                  />
                  <ConcreteRemoval />
                </>
              }
            />
            <Route
              path="/services/commercial-interior-demolition"
              element={
                <Navigate to="/services/commercial-interior-demolition/" replace />
              }
            />
            <Route
              path="/services/commercial-interior-demolition/"
              element={
                <>
                  <SEO
                    {...seoConfig.commercialInteriorDemolition}
                    canonicalUrl="https://mrdemopro.com/services/commercial-interior-demolition/"
                  />
                  <CommercialInteriorDemolition />
                </>
              }
            />
            <Route
              path="/services/cleanout"
              element={<Navigate to="/services/cleanout/" replace />}
            />
            <Route
              path="/services/cleanout/"
              element={
                <>
                  <SEO
                    {...seoConfig.cleanout}
                    canonicalUrl="https://mrdemopro.com/services/cleanout/"
                  />
                  <Cleanout />
                </>
              }
            />
            <Route
              path="/services/hoarding-cleanout"
              element={<Navigate to="/services/hoarding-cleanout/" replace />}
            />
            <Route
              path="/services/hoarding-cleanout/"
              element={
                <>
                  <SEO
                    {...seoConfig.hoardingCleanout}
                    canonicalUrl="https://mrdemopro.com/services/hoarding-cleanout/"
                  />
                  <HoardingCleanout />
                </>
              }
            />
            <Route
              path="/services/construction-debris-removal"
              element={
                <Navigate to="/services/construction-debris-removal/" replace />
              }
            />
            <Route
              path="/services/construction-debris-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.constructionDebrisRemoval}
                    canonicalUrl="https://mrdemopro.com/services/construction-debris-removal/"
                  />
                  <ConstructionDebrisRemoval />
                </>
              }
            />
            <Route
              path="/services/junk-removal"
              element={<Navigate to="/services/junk-removal/" replace />}
            />
            <Route
              path="/services/junk-removal/"
              element={
                <>
                  <SEO
                    {...seoConfig.junkRemoval}
                    canonicalUrl="https://mrdemopro.com/services/junk-removal/"
                  />
                  <JunkRemoval />
                </>
              }
            />
            <Route
              path="/services/house-demolition"
              element={<Navigate to="/services/house-demolition/" replace />}
            />
            <Route
              path="/services/house-demolition/"
              element={
                <>
                  <SEO
                    {...seoConfig.houseDemolition}
                    canonicalUrl="https://mrdemopro.com/services/house-demolition/"
                  />
                  <HouseDemolition />
                </>
              }
            />
            <Route
              path="/prices"
              element={<Navigate to="/prices/" replace />}
            />
            <Route
              path="/prices/"
              element={
                <>
                  <SEO
                    title="Prices - Transparent Pricing for Cleanouts | Mr Demo Pro"
                    description="Transparent pricing for cleanouts and related services in Hampton Roads, VA. Call 757-848-4559 for an exact quote."
                    keywords="demolition prices, cleanout prices, junk removal prices, Hampton Roads pricing"
                    canonicalUrl="https://mrdemopro.com/prices/"
                    structuredData={{
                      '@context': 'https://schema.org',
                      '@type': 'Service',
                      serviceType: 'Pricing',
                      provider: {
                        '@type': 'LocalBusiness',
                        name: 'Mr Demo Pro',
                        telephone: '757-848-4559'
                      },
                      areaServed: 'Hampton Roads, VA'
                    }}
                  />
                  <Prices />
                </>
              }
            />
            <Route
              path="/contact"
              element={<Navigate to="/contact/" replace />}
            />
            <Route
              path="/contact/"
              element={
                <>
                  <SEO
                    {...seoConfig.contact}
                    canonicalUrl="https://mrdemopro.com/contact/"
                  />
                  <Contact />
                </>
              }
            />
            <Route
              path="/about"
              element={<Navigate to="/about/" replace />}
            />
            <Route
              path="/about/"
              element={
                <>
                  <SEO
                    {...seoConfig.about}
                    canonicalUrl="https://mrdemopro.com/about/"
                  />
                  <About />
                </>
              }
            />
            <Route
              path="/faqs"
              element={<Navigate to="/faqs/" replace />}
            />
            <Route
              path="/faqs/"
              element={
                <>
                  <SEO
                    {...seoConfig.faqs}
                    canonicalUrl="https://mrdemopro.com/faqs/"
                  />
                  <FAQs />
                </>
              }
            />
            <Route
              path="/thank-you"
              element={<Navigate to="/thank-you/" replace />}
            />
            <Route
              path="/thank-you/"
              element={
                <>
                  <SEO
                    title="Thank You - Mr Demo Pro"
                    description="Thank you for your demolition service request. We'll contact you within 24 hours with a free quote."
                    keywords="thank you, demolition quote, Mr Demo Pro"
                    canonicalUrl="https://mrdemopro.com/thank-you/"
                    noIndex={true}
                  />
                  <ThankYou />
                </>
              }
            />
            <Route path="/blog" element={<Navigate to="/blog/" replace />} />
            <Route
              path="/blog/"
              element={
                <>
                  <SEO
                    title="Blog | Mr Demo Pro"
                    description="Guides, tips, and updates on demolition, cleanouts, and Hampton Roads projects from Mr Demo Pro."
                    canonicalUrl="https://mrdemopro.com/blog/"
                  />
                  <Blog />
                </>
              }
            />
            <Route path="/blog/tag" element={<Navigate to="/blog/" replace />} />
            <Route
              path="/blog/tag/:tag"
              element={<BlogTagTrailingRedirect />}
            />
            <Route path="/blog/tag/:tag/" element={<BlogTag />} />
            <Route path="/blog/:slug" element={<BlogPostTrailingRedirect />} />
            <Route path="/blog/:slug/" element={<BlogPost />} />
            <Route
              path="/diy-vs-pro-demolition/thank-you"
              element={
                <Navigate to="/diy-vs-pro-demolition/thank-you/" replace />
              }
            />
            <Route
              path="/diy-vs-pro-demolition/thank-you/"
              element={
                <>
                  <SEO
                    title="Thank You | DIY vs Pro Quiz | Mr Demo Pro"
                    description="Thanks for completing the DIY vs Pro demolition risk quiz. Our team may follow up with next steps."
                    canonicalUrl="https://mrdemopro.com/diy-vs-pro-demolition/thank-you/"
                    noIndex={true}
                  />
                  <DiyQuizThankYou />
                </>
              }
            />
            <Route
              path="/diy-vs-pro-demolition"
              element={<Navigate to="/diy-vs-pro-demolition/" replace />}
            />
            <Route
              path="/diy-vs-pro-demolition/"
              element={
                <>
                  <DiyVsProDemolition />
                </>
              }
            />
            <Route
              path="/demolition-cost-virginia"
              element={<Navigate to="/demolition-cost-virginia/" replace />}
            />
            <Route
              path="/demolition-cost-virginia/"
              element={
                <>
                  <SEO
                    {...seoConfig.demolitionCostVirginia}
                    canonicalUrl="https://mrdemopro.com/demolition-cost-virginia/"
                  />
                  <DemolitionCostVirginia />
                </>
              }
            />
            <Route path="/terms" element={<Navigate to="/terms/" replace />} />
            <Route
              path="/terms/"
              element={
                <>
                  <SEO
                    {...seoConfig.terms}
                    canonicalUrl="https://mrdemopro.com/terms/"
                  />
                  <div style={{paddingTop: '100px', minHeight: '50vh'}}>
                    <h1 className="text-center">
                      Terms and Conditions - Coming Soon
                    </h1>
                  </div>
                </>
              }
            />
            <Route
              path="/privacy"
              element={<Navigate to="/privacy/" replace />}
            />
            <Route
              path="/privacy/"
              element={
                <>
                  <SEO
                    {...seoConfig.privacy}
                    canonicalUrl="https://mrdemopro.com/privacy/"
                  />
                  <div style={{paddingTop: '100px', minHeight: '50vh'}}>
                    <h1 className="text-center">
                      Privacy Policy - Coming Soon
                    </h1>
                  </div>
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <SEO
                    title="404 - Page Not Found | Mr Demo Pro"
                    description="The page you're looking for doesn't exist. Explore our demolition services or contact us for assistance."
                    keywords="404, page not found, demolition services, Mr Demo Pro"
                    noIndex={true}
                  />
                  <div
                    style={{
                      paddingTop: '100px',
                      minHeight: '50vh',
                      textAlign: 'center'
                    }}
                  >
                    <Container>
                      <h1
                        style={{
                          color: 'var(--color-primary)',
                          marginBottom: '1rem'
                        }}
                      >
                        404 - Page Not Found
                      </h1>
                      <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>
                        The page you're looking for doesn't exist.
                      </p>
                      <div>
                        <Link to="/" className="btn btn-primary me-3">
                          Go Home
                        </Link>
                        <Link
                          to="/services/"
                          className="btn btn-outline-primary"
                        >
                          View Services
                        </Link>
                      </div>
                    </Container>
                  </div>
                </>
              }
            />
          </Routes>
        </main>
        {!isLandingPage && <Footer />}
      </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}

export default App;
