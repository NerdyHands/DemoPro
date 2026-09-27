import {useState, useEffect, useRef, type MouseEvent as ReactMouseEvent} from 'react';
import {Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import {
  HUBS,
  PRIMARY_NAV_LINKS,
  SERVICE_LEAVES,
  CITY_LEAVES
} from '../config/siteStructure';

const navLinkStyle = {
  fontWeight: 600,
  fontSize: '1rem',
  color: '#1a202c',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  transition: 'all 0.3s ease'
} as const;

const dropdownItemStyle = {
  fontWeight: 500,
  padding: '0.5rem 1rem'
} as const;

const Header = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 20);

      if (expanded && window.scrollY > 10) {
        setExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [expanded]);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleNavClick = () => {
    scrollToTop();
    setExpanded(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        expanded &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [expanded]);

  const isOpen = expanded;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const applyHoverIn = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'rgb(236, 65, 0)';
    e.currentTarget.style.backgroundColor = 'rgba(236, 65, 0, 0.1)';
  };

  const applyHoverOut = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = '#1a202c';
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  return (
    <>
      <header>
        <Navbar
          ref={navRef}
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
              onClick={() => setExpanded(prev => !prev)}
              style={{
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                <span />
                <span />
                <span />
              </div>
            </Navbar.Toggle>

            <Navbar.Collapse id="main-navigation">
              <div className="ms-auto">
                <nav aria-label="Primary navigation">
                  <Nav className="text-center" style={{gap: '0.5rem'}}>
                    <Nav.Link
                      as={Link}
                      to="/"
                      onClick={handleNavClick}
                      aria-current={
                        location.pathname === '/' ? 'page' : undefined
                      }
                      style={navLinkStyle}
                      onMouseEnter={applyHoverIn}
                      onMouseLeave={applyHoverOut}
                    >
                      Home
                    </Nav.Link>

                    <NavDropdown
                      title="Services"
                      id="services-dropdown"
                      style={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#1a202c'
                      }}
                    >
                      <NavDropdown.Item
                        as={Link}
                        to={HUBS.services.path}
                        onClick={handleNavClick}
                        style={dropdownItemStyle}
                      >
                        All Services
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      {SERVICE_LEAVES.map(service => (
                        <NavDropdown.Item
                          key={service.path}
                          as={Link}
                          to={service.path}
                          onClick={handleNavClick}
                          style={dropdownItemStyle}
                        >
                          {service.label}
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>

                    <NavDropdown
                      title="Service Areas"
                      id="service-areas-dropdown"
                      style={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#1a202c'
                      }}
                    >
                      <NavDropdown.Item
                        as={Link}
                        to={HUBS.serviceAreas.path}
                        onClick={handleNavClick}
                        style={dropdownItemStyle}
                      >
                        All Service Areas
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      {CITY_LEAVES.map(city => (
                        <NavDropdown.Item
                          key={city.path}
                          as={Link}
                          to={city.path}
                          onClick={handleNavClick}
                          style={dropdownItemStyle}
                        >
                          {city.label}
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>

                    {PRIMARY_NAV_LINKS.map(item => (
                      <Nav.Link
                        key={item.path}
                        as={Link}
                        to={item.path}
                        onClick={handleNavClick}
                        aria-current={
                          location.pathname === item.path ? 'page' : undefined
                        }
                        style={navLinkStyle}
                        onMouseEnter={applyHoverIn}
                        onMouseLeave={applyHoverOut}
                      >
                        {item.label}
                      </Nav.Link>
                    ))}
                  </Nav>
                </nav>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      <div style={{height: '100px'}}></div>

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
