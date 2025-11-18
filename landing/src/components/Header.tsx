import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Close navbar when a link is clicked
  const handleNavClick = (p0: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setExpanded(false); // close mobile menu
  };

  return (
    <>
      <Navbar
        bg="white"
        expand="lg"
        fixed="top"
        expanded={expanded}
        onToggle={(isExpanded) => setExpanded(isExpanded)}
        className="navbar-default"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          padding: "0.75rem 0",
          border: "none",
          borderRadius: 0,
        }}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            style={{ padding: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/header-logo.png"
              alt="Mr Demo Pro header logo"
              style={{
                height: "80px",
                width: "auto",
                maxWidth: "200px",
                transition: "all 0.3s ease",
              }}
            />
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            style={{
              border: "none",
              padding: "0.5rem",
              borderRadius: "0.375rem",
              transition: "all 0.3s ease",
            }}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto" style={{ gap: "0.5rem",textAlign:'center' }}>
              <Nav.Link
                as={Link}
                to="/"
                onClick={() => handleNavClick("/")}
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#1a202c",
                  padding: "0.75rem 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "rgb(236, 65, 0)";
                  (e.target as HTMLElement).style.backgroundColor =
                    "rgba(236, 65, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#1a202c";
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/services"
                onClick={() => handleNavClick("/services")}
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#1a202c",
                  padding: "0.75rem 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "rgb(236, 65, 0)";
                  (e.target as HTMLElement).style.backgroundColor =
                    "rgba(236, 65, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#1a202c";
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                Services
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/prices"
                onClick={() => handleNavClick("/prices")}
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#1a202c",
                  padding: "0.75rem 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "rgb(236, 65, 0)";
                  (e.target as HTMLElement).style.backgroundColor =
                    "rgba(236, 65, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#1a202c";
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                Prices
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/contact"
                onClick={() => handleNavClick("/contact")}
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#1a202c",
                  padding: "0.75rem 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "rgb(236, 65, 0)";
                  (e.target as HTMLElement).style.backgroundColor =
                    "rgba(236, 65, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#1a202c";
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                Contact Us
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/faqs"
                onClick={() => handleNavClick("/faqs")}
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#1a202c",
                  padding: "0.75rem 1rem",
                  transition: "all 0.3s ease",
                  position: "relative",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "rgb(236, 65, 0)";
                  (e.target as HTMLElement).style.backgroundColor =
                    "rgba(236, 65, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#1a202c";
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                FAQs
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div style={{ height: "100px" }}></div>

      {/* Enhanced Back to Top Button */}
      <button
        onClick={scrollToTop}
        id="myBtn"
        title="Go to top"
        style={{
          visibility: showBackToTop ? "visible" : "hidden",
          opacity: showBackToTop ? 1 : 0,
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1030,
          backgroundColor: "rgb(236, 65, 0)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          cursor: "pointer",
          fontSize: "1.25rem",
          fontWeight: "700",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.backgroundColor = "#d63500";
          (e.target as HTMLElement).style.transform = "translateY(-3px)";
          (e.target as HTMLElement).style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = "rgb(236, 65, 0)";
          (e.target as HTMLElement).style.transform = "translateY(0)";
          (e.target as HTMLElement).style.boxShadow =
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        }}
      >
        ↑
      </button>
    </>
  );
};

export default Header;
