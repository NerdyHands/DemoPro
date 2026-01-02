import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              ezPICRA
            </Link>
            <p className="footer-description">
              Professional PICRA repairs and home inspection repair services across Hampton, Newport News, Yorktown, and Norfolk, VA. Same-day estimates and fast turnaround times for real estate professionals and homeowners.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h3>Categories</h3>
              <ul>
                <li><Link to="/category/property-inspection">Property Inspection</Link></li>
                <li><Link to="/category/real-estate">Real Estate</Link></li>
                <li><Link to="/category/legal">Legal</Link></li>
                <li><Link to="/category/guides">Guides</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Connect</h3>
              <ul>
                <li><a href="https://twitter.com/ezpicra" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                <li><a href="https://linkedin.com/company/ezpicra" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="/rss" target="_blank" rel="noopener noreferrer">RSS Feed</a></li>
                <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">Sitemap</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; ezPICRA 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
