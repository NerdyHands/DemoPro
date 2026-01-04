import React from 'react';
import {Routes, Route, Link} from 'react-router-dom';
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
import JunkRemoval from './pages/JunkRemoval';
import FAQs from './pages/FAQs';
import ThankYou from './pages/ThankYou';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BlogTag from './pages/BlogTag';
import seoConfig from './config/seoConfig';
import './App.css';

function App() {
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
    <HelmetProvider>
      <div className="App">
        <Header />
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
            {/* Service Pages */}
            <Route
              path="/services/shed-removal"
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
              path="/services/cleanout"
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
              path="/services/junk-removal"
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
              path="/prices"
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
              path="/faqs"
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
              element={
                <>
                  <SEO
                    title="Thank You - Mr Demo Pro"
                    description="Thank you for your demolition service request. We'll contact you within 24 hours with a free quote."
                    keywords="thank you, demolition quote, Mr Demo Pro"
                    canonicalUrl="https://mrdemopro.com/thank-you/"
                  />
                  <ThankYou />
                </>
              }
            />
            <Route
              path="/blog"
              element={
                <>
                  <SEO
                    title="Blog | Mr Demo Pro"
                    description="Guides, tips, and updates from Mr Demo Pro."
                    canonicalUrl="https://mrdemopro.com/blog"
                  />
                  <Blog />
                </>
              }
            />
            <Route
              path="/blog/tag/:tag"
              element={
                <>
                  <SEO
                    title="Blog Tag | Mr Demo Pro"
                    description="Browse posts by tag."
                    canonicalUrl="https://mrdemopro.com/blog"
                  />
                  <BlogTag />
                </>
              }
            />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route
              path="/terms"
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
                    // canonicalUrl="https://mrdemopro.com/404.html"
                    noIndex={true}
                    canonicalUrl="https://mrdemopro.com/404"
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
        <Footer />
      </div>
    </HelmetProvider>
  );
}

export default App;
