import {useState, useEffect} from 'react';
import {Navbar, Nav, Container} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';

const Header = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleNavClick = () => {
    scrollToTop();
    setExpanded(false);
  };

  return (
    <>
      <header>
        <Navbar
          bg="white"
          expand="lg"
          fixed="top"
          expanded={expanded}
          onToggle={isExpanded => setExpanded(isExpanded)}
          className="navbar-default"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '0.75rem 0',
            border: 'none',
            borderRadius: 0
          }}
        >
          <Container>
            <Navbar.Brand
              as={Link}
              to="/"
              aria-label="Mr Demo Pro Home - Demolition Services"
              style={{padding: 0}}
              onClick={scrollToTop}
            >
              <img
                src="/header-logo.webp"
                alt="Mr Demo Pro - Professional Demolition Services"
                width={200}
                height={80}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  height: '80px',
                  width: 'auto',
                  maxWidth: '200px'
                }}
              />
            </Navbar.Brand>

            <Navbar.Toggle
              aria-controls="main-navigation"
              aria-label="Toggle navigation"
              style={{
                border: 'none'
              }}
            />

            <Navbar.Collapse id="main-navigation">
              <div className="ms-auto">
                <nav aria-label="Primary navigation">
                  <Nav className="text-center" style={{gap: '0.5rem'}}>
                    {[
                      {name: 'Home', path: '/'},
                      {name: 'Services', path: '/services'},
                      {name: 'Prices', path: '/prices'},
                      {name: 'Contact Us', path: '/contact'},
                      {name: 'FAQs', path: '/faqs'}
                    ].map(item => (
                      <Nav.Link
                        key={item.path}
                        as={Link}
                        to={item.path}
                        onClick={handleNavClick}
                        aria-current={
                          location.pathname === item.path ? 'page' : undefined
                        }
                        style={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: '#1a202c',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'rgb(236, 65, 0)';
                          e.currentTarget.style.backgroundColor =
                            'rgba(236, 65, 0, 0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#1a202c';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {item.name}
                      </Nav.Link>
                    ))}
                  </Nav>
                </nav>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div style={{height: '100px'}}></div>

      {/* Enhanced Back to Top Button */}
      <button
        onClick={scrollToTop}
        title="Go to top"
        aria-label="Scroll back to top"
        style={{
          visibility: showBackToTop ? 'visible' : 'hidden',
          opacity: showBackToTop ? 1 : 0,
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1030,
          backgroundColor: 'rgb(236, 65, 0)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          fontSize: '1.25rem',
          fontWeight: '700',
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.backgroundColor = '#d63500';
          (e.target as HTMLElement).style.transform = 'translateY(-3px)';
          (e.target as HTMLElement).style.boxShadow =
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.backgroundColor = 'rgb(236, 65, 0)';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
          (e.target as HTMLElement).style.boxShadow =
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
      >
        ↑
      </button>
    </>
  );
};

export default Header;
