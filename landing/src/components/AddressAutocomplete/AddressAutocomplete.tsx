import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  isGooglePlacesConfigured,
  loadGooglePlacesScript
} from '../../config/googlePlaces';
import './AddressAutocomplete.css';

export type ResolvedAddress = {
  formattedAddress: string;
  placeId: string;
  isComplete: boolean;
};

type AddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  /** Fires when a Google Place is chosen (or cleared by typing). */
  onResolvedChange?: (resolved: ResolvedAddress | null) => void;
  /**
   * Fires once we know whether Google Places is actually usable. `true` means the script
   * failed to load (network issue, ad blocker, key restriction, etc.) and the field has
   * fallen back to plain free-text entry — callers should stop requiring a Google-verified
   * selection in that case so the form never becomes un-submittable.
   */
  onAvailabilityChange?: (unavailable: boolean) => void;
  onFocus?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  name?: string;
  /** When Places is configured, block free-typed incomplete addresses. */
  requireCompleteSelection?: boolean;
  error?: string;
};

function hasType(components: AddressComponent[] | undefined, type: string) {
  return Boolean(components?.some(c => c.types?.includes(type)));
}

function isCompletePlace(place: {
  formatted_address?: string;
  place_id?: string;
  address_components?: AddressComponent[];
}) {
  if (!place.formatted_address || !place.place_id) return false;
  const components = place.address_components || [];
  const hasStreetNumber = hasType(components, 'street_number');
  const hasRoute = hasType(components, 'route');
  const hasLocality =
    hasType(components, 'locality') ||
    hasType(components, 'sublocality') ||
    hasType(components, 'neighborhood') ||
    hasType(components, 'administrative_area_level_3');
  const hasRegion = hasType(components, 'administrative_area_level_1');
  const hasPostal = hasType(components, 'postal_code');
  // Require street number + street + (city or postal) + state for a usable jobsite.
  return hasStreetNumber && hasRoute && hasRegion && (hasLocality || hasPostal);
}

const AddressAutocomplete = ({
  value,
  onChange,
  onResolvedChange,
  onAvailabilityChange,
  onFocus,
  placeholder = 'Property Address',
  required = false,
  disabled = false,
  className = 'form-control',
  style,
  name = 'address',
  requireCompleteSelection = true,
  error
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<InstanceType<
    NonNullable<typeof window.google>['maps']['places']['Autocomplete']
  > | null>(null);
  const onResolvedRef = useRef(onResolvedChange);
  const onChangeRef = useRef(onChange);
  const onAvailabilityRef = useRef(onAvailabilityChange);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesFailed, setPlacesFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const usePlaces = isGooglePlacesConfigured();
  // Places is configured but couldn't actually load — fall back to plain text entry
  // rather than leaving the field permanently unusable.
  const placesUnavailable = usePlaces && placesFailed;

  useEffect(() => {
    onResolvedRef.current = onResolvedChange;
  }, [onResolvedChange]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onAvailabilityRef.current = onAvailabilityChange;
  }, [onAvailabilityChange]);

  useEffect(() => {
    if (!usePlaces) return;

    let cancelled = false;
    loadGooglePlacesScript()
      .then(() => {
        if (cancelled) return;
        setPlacesReady(true);
        setPlacesFailed(false);
        onAvailabilityRef.current?.(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.warn('Address autocomplete unavailable:', err);
        setPlacesFailed(true);
        onAvailabilityRef.current?.(true);
      });

    return () => {
      cancelled = true;
    };
  }, [usePlaces, retryToken]);

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
      const complete = isCompletePlace(place);
      const formatted = place.formatted_address || '';

      if (!formatted || !place.place_id) {
        setLocalError('Please select a complete address from the suggestions.');
        onResolvedRef.current?.(null);
        return;
      }

      onChangeRef.current(formatted);

      if (requireCompleteSelection && !complete) {
        setLocalError(
          'Please choose a full street address (with street number) from the list.'
        );
        onResolvedRef.current?.({
          formattedAddress: formatted,
          placeId: place.place_id,
          isComplete: false
        });
        return;
      }

      setLocalError(null);
      onResolvedRef.current?.({
        formattedAddress: formatted,
        placeId: place.place_id,
        isComplete: true
      });
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearListeners(
          autocompleteRef.current,
          'place_changed'
        );
      }
      autocompleteRef.current = null;
    };
  }, [placesReady, requireCompleteSelection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    // Typing clears a prior Places selection so free-text can't be submitted as "selected".
    if (usePlaces && !placesUnavailable && requireCompleteSelection) {
      onResolvedChange?.(null);
      setLocalError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && autocompleteRef.current) {
      const pac = document.querySelector('.pac-container') as HTMLElement | null;
      if (pac && pac.style.display !== 'none') {
        e.preventDefault();
      }
    }
  };

  const handleRetry = () => {
    setLocalError(null);
    setPlacesReady(false);
    setPlacesFailed(false);
    setRetryToken(t => t + 1);
  };

  const shownError = error || localError;
  const showGoogleUx = usePlaces && !placesUnavailable;

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
        placeholder={
          showGoogleUx ? `${placeholder} (select from suggestions)` : placeholder
        }
        className={`${className}${shownError ? ' is-invalid' : ''}`}
        style={style}
        required={required}
        disabled={disabled}
        autoComplete={showGoogleUx ? 'off' : 'street-address'}
        aria-invalid={Boolean(shownError)}
        aria-describedby={shownError ? `${name}-help` : undefined}
      />
      {showGoogleUx && !placesReady && (
        <span className="google-loading-indicator" aria-hidden="true">
          Loading suggestions…
        </span>
      )}
      {showGoogleUx && requireCompleteSelection && !shownError && (
        <p id={`${name}-help`} className="address-autocomplete-hint">
          Start typing, then select the full address from the Google suggestions.
        </p>
      )}
      {placesUnavailable && !shownError && (
        <p id={`${name}-help`} className="address-autocomplete-hint">
          Address suggestions are unavailable right now — just type your full property
          address.{' '}
          <button
            type="button"
            className="address-autocomplete-retry"
            onClick={handleRetry}
          >
            Retry suggestions
          </button>
        </p>
      )}
      {shownError && (
        <p id={`${name}-help`} className="address-autocomplete-error" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
