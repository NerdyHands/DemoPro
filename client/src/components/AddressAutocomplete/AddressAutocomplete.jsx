import React, { useEffect, useRef, useState } from 'react';
import './AddressAutocomplete.css';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter property address",
  className = "",
  required = false,
  disabled = false,
  onAddressSelect = null
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Places API is loaded
    const checkGoogleLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded
    if (checkGoogleLoaded()) {
      return;
    }

    // Wait for Google Places API to load
    const interval = setInterval(() => {
      if (checkGoogleLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current) return;

    // Initialize Google Places Autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Restrict to US addresses
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
    });

    autocompleteRef.current = autocomplete;

    // Add place_changed event listener
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        onChange(place.formatted_address);
        
        // Call onAddressSelect callback if provided
        if (onAddressSelect) {
          onAddressSelect({
            formattedAddress: place.formatted_address,
            placeId: place.place_id,
            geometry: place.geometry,
            addressComponents: place.address_components
          });
        }
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearListeners(autocompleteRef.current, 'place_changed');
      }
    };
  }, [isGoogleLoaded, onChange, onAddressSelect]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Prevent form submission on Enter key when autocomplete dropdown is open
    if (e.key === 'Enter' && autocompleteRef.current) {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && pacContainer.style.display !== 'none') {
        e.preventDefault();
      }
    }
  };

  return (
    <div className={`address-autocomplete-container ${className}`} data-testid="address-autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="address-autocomplete-input"
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
      {!isGoogleLoaded && (
        <div className="google-loading-indicator">
          Loading address suggestions...
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 