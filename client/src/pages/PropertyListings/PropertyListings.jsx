import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.jsx';
import api from '../../services/api.jsx';
import './PropertyListings.css';

const PropertyCard = ({ home }) => {
  return (
    <div className="property-card">
      <div className="property-image-container">
        {home.photo || home.thumbnail ? (
          <img
            src={home.photo || home.thumbnail}
            alt={home.address?.line || 'Property image'}
            className="property-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="property-image-placeholder">
            <span className="placeholder-icon">🏠</span>
          </div>
        )}
      </div>
      <div className="property-content">
        <h2 className="property-address">{home.address?.line || 'Address not available'}</h2>
        <p className="property-location">
          {home.address?.city || 'City'}, {home.address?.state_code || 'State'}
        </p>
        {home.price && (
          <p className="property-price">${home.price.toLocaleString()}</p>
        )}
        <div className="property-details">
          {home.beds && (
            <span className="property-detail">
              <span className="detail-icon">🛏️</span>
              {home.beds} Beds
            </span>
          )}
          {home.baths && (
            <span className="property-detail">
              <span className="detail-icon">🚿</span>
              {home.baths} Baths
            </span>
          )}
          {home.building_size && (
            <span className="property-detail">
              <span className="detail-icon">📐</span>
              {home.building_size.size} sqft
            </span>
          )}
        </div>
        {home.rdc_web_url && (
          <a
            href={home.rdc_web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="view-listing-btn"
          >
            View Listing
            <span className="btn-arrow">→</span>
          </a>
        )}
      </div>
    </div>
  );
};

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPendingProperties();
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load pending properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="properties-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading pending properties...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="properties-container">
        <div className="properties-header">
          <div className="properties-title-section">
            <h1 className="properties-title">Pending Properties</h1>
            <p className="properties-subtitle">
              Browse pending properties in Hampton, VA
            </p>
          </div>
          <button onClick={fetchProperties} className="refresh-btn">
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
        </div>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="properties-content">
          {properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <span className="empty-state-icon">🏘️</span>
                <h2>No Pending Properties Found</h2>
                <p>
                  There are currently no pending properties available in Hampton, VA.
                </p>
                <button onClick={fetchProperties} className="refresh-empty-btn">
                  Try Refreshing
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="properties-count">
                <span className="count-badge">{properties.length}</span>
                {properties.length === 1 ? ' Property' : ' Properties'} Found
              </div>
              <div className="properties-grid">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.property_id || index}
                    home={property}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PropertyListings;

