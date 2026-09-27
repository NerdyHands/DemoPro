import React from 'react';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import './Layout.css';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="layout">
      {showHeader && <Header />}
      <main className="layout-main">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout; 