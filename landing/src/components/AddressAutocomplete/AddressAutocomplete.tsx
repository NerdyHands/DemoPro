import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  isGooglePlacesConfigured,
  loadGooglePlacesScript
} from '../../config/googlePlaces';
import './AddressAutocomplete.css';

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  name?: string;
};

const AddressAutocomplete = ({
  value,
  onChange,
  onFocus,
  placeholder = 'Property Address',
  required = false,
  disabled = false,
  className = 'form-control',
  style,
  name = 'address'
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<InstanceType<
    NonNullable<typeof window.google>['maps']['places']['Autocomplete']
  > | null>(null);
  const [placesReady, setPlacesReady] = useState(false);
  const usePlaces = isGooglePlacesConfigured();

  useEffect(() => {
    if (!usePlaces) return;

    let cancelled = false;
    loadGooglePlacesScript()
      .then(() => {
        if (!cancelled) setPlacesReady(true);
      })
      .catch(err => {
        console.warn('Address autocomplete unavailable:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [usePlaces]);

  useEffect(() => {
    if (!placesReady || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'place_id', 'geometry', 'address_components']
      }
    );

    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearListeners(
          autocompleteRef.current,
          'place_changed'
        );
      }
    };
  }, [placesReady, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && autocompleteRef.current) {
      const pac = document.querySelector('.pac-container') as HTMLElement | null;
      if (pac && pac.style.display !== 'none') {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="address-autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        className={className}
        style={style}
        required={required}
        disabled={disabled}
        autoComplete={usePlaces ? 'off' : 'street-address'}
      />
      {usePlaces && !placesReady && (
        <span className="google-loading-indicator" aria-hidden="true">
          Loading suggestions…
        </span>
      )}
    </div>
  );
};

export default AddressAutocomplete;
