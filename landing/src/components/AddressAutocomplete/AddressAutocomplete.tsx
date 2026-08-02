import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties
} from 'react';
import {
  isGooglePlacesConfigured,
  loadPlacesLibrary,
  type PlaceAddressComponent,
  type PlaceAutocompleteElementInstance,
  type PlacePredictionSelectEvent
} from '../../config/googlePlaces';
import './AddressAutocomplete.css';

export type ResolvedAddress = {
  formattedAddress: string;
  placeId: string;
  isComplete: boolean;
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

function hasType(components: PlaceAddressComponent[] | undefined, type: string) {
  return Boolean(components?.some(c => c.types?.includes(type)));
}

function isCompletePlace(place: {
  formattedAddress?: string | null;
  id?: string;
  addressComponents?: PlaceAddressComponent[];
}) {
  if (!place.formattedAddress || !place.id) return false;
  const components = place.addressComponents || [];
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

function applyHostStyles(
  el: PlaceAutocompleteElementInstance,
  style?: CSSProperties,
  invalid?: boolean
) {
  el.style.setProperty('color-scheme', 'light');
  el.style.setProperty('display', 'block');
  el.style.setProperty('width', '100%');
  el.style.setProperty(
    'background-color',
    (style?.backgroundColor as string) || '#fff'
  );
  el.style.setProperty(
    'border',
    invalid
      ? '2px solid #dc3545'
      : (style?.border as string) || '2px solid var(--color-border, #e1e5e9)'
  );
  el.style.setProperty(
    'border-radius',
    (style?.borderRadius as string) || '8px'
  );
  el.style.setProperty(
    'font-family',
    (style?.fontFamily as string) || 'var(--font-family-primary, inherit)'
  );
  el.style.setProperty('font-size', (style?.fontSize as string) || '1.1rem');
  el.style.setProperty(
    'font-weight',
    String(style?.fontWeight ?? '400')
  );
  el.style.setProperty('color', (style?.color as string) || 'inherit');
  // Match quote-form field padding via host font-size / internal spacing.
  el.style.setProperty('--gmp-padding', '18px');
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
  const widgetHostRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<PlaceAutocompleteElementInstance | null>(null);
  const onResolvedRef = useRef(onResolvedChange);
  const onChangeRef = useRef(onChange);
  const onAvailabilityRef = useRef(onAvailabilityChange);
  const onFocusRef = useRef(onFocus);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesFailed, setPlacesFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const usePlaces = isGooglePlacesConfigured();
  const placesUnavailable = usePlaces && placesFailed;
  const showGoogleUx = usePlaces && !placesUnavailable;
  const shownError = error || localError;

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
    onFocusRef.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    if (!usePlaces) return;

    let cancelled = false;
    loadPlacesLibrary()
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
    if (!showGoogleUx || !placesReady || !widgetHostRef.current) return;

    let cancelled = false;
    let element: PlaceAutocompleteElementInstance | null = null;

    const mount = async () => {
      try {
        const { PlaceAutocompleteElement } = await loadPlacesLibrary();
        if (cancelled || !widgetHostRef.current) return;

        element = new PlaceAutocompleteElement({
          placeholder: `${placeholder} (select from suggestions)`,
          includedRegionCodes: ['us'],
          // Residential / street jobsites (legacy types: ['address'] equivalent)
          includedPrimaryTypes: ['street_address', 'premise', 'subpremise']
        });
        element.name = name;
        element.disabled = disabled;
        if (value) element.value = value;
        element.className = `${className}${shownError ? ' is-invalid' : ''} gmp-place-autocomplete-field`;
        applyHostStyles(element, style, Boolean(shownError));

        const handleSelect = async (event: Event) => {
          const { placePrediction } = event as PlacePredictionSelectEvent;
          if (!placePrediction) {
            setLocalError('Please select a complete address from the suggestions.');
            onResolvedRef.current?.(null);
            return;
          }

          try {
            const place = placePrediction.toPlace();
            await place.fetchFields({
              fields: ['formattedAddress', 'addressComponents', 'id']
            });

            const formatted = place.formattedAddress || '';
            const placeId = place.id || '';
            const complete = isCompletePlace(place);

            if (!formatted || !placeId) {
              setLocalError('Please select a complete address from the suggestions.');
              onResolvedRef.current?.(null);
              return;
            }

            if (element) element.value = formatted;
            onChangeRef.current(formatted);

            if (requireCompleteSelection && !complete) {
              setLocalError(
                'Please choose a full street address (with street number) from the list.'
              );
              onResolvedRef.current?.({
                formattedAddress: formatted,
                placeId,
                isComplete: false
              });
              return;
            }

            setLocalError(null);
            onResolvedRef.current?.({
              formattedAddress: formatted,
              placeId,
              isComplete: true
            });
          } catch (err) {
            console.warn('Failed to fetch place details:', err);
            setLocalError('Could not verify that address. Please try another suggestion.');
            onResolvedRef.current?.(null);
          }
        };

        const handleInput = () => {
          const next = element?.value ?? '';
          onChangeRef.current(next);
          if (requireCompleteSelection) {
            onResolvedRef.current?.(null);
            setLocalError(null);
          }
        };

        const handleFocus = () => {
          onFocusRef.current?.();
        };

        const handleGmpError = () => {
          console.warn('PlaceAutocompleteElement reported gmp-error');
          setPlacesFailed(true);
          onAvailabilityRef.current?.(true);
        };

        element.addEventListener('gmp-select', handleSelect);
        element.addEventListener('input', handleInput);
        element.addEventListener('focus', handleFocus);
        element.addEventListener('gmp-error', handleGmpError);

        widgetHostRef.current.replaceChildren(element);
        elementRef.current = element;

        (element as PlaceAutocompleteElementInstance & {
          __cleanup?: () => void;
        }).__cleanup = () => {
          element?.removeEventListener('gmp-select', handleSelect);
          element?.removeEventListener('input', handleInput);
          element?.removeEventListener('focus', handleFocus);
          element?.removeEventListener('gmp-error', handleGmpError);
        };
      } catch (err) {
        if (cancelled) return;
        console.warn('Address autocomplete unavailable:', err);
        setPlacesFailed(true);
        onAvailabilityRef.current?.(true);
      }
    };

    void mount();

    const host = widgetHostRef.current;
    return () => {
      cancelled = true;
      const current = elementRef.current as
        | (PlaceAutocompleteElementInstance & { __cleanup?: () => void })
        | null;
      current?.__cleanup?.();
      if (current?.parentNode) current.parentNode.removeChild(current);
      elementRef.current = null;
      host?.replaceChildren();
    };
    // Intentionally mount once per ready/retry cycle; prop sync happens below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGoogleUx, placesReady, retryToken]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    if ((el.value ?? '') !== value) {
      el.value = value;
    }
  }, [value]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    el.disabled = disabled;
    el.placeholder = showGoogleUx
      ? `${placeholder} (select from suggestions)`
      : placeholder;
    el.className = `${className}${shownError ? ' is-invalid' : ''} gmp-place-autocomplete-field`;
    applyHostStyles(el, style, Boolean(shownError));
  }, [disabled, placeholder, className, style, shownError, showGoogleUx]);

  const handleFallbackChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (requireCompleteSelection) {
      onResolvedChange?.(null);
      setLocalError(null);
    }
  };

  const handleRetry = () => {
    setLocalError(null);
    setPlacesReady(false);
    setPlacesFailed(false);
    setRetryToken(t => t + 1);
  };

  return (
    <div className="address-autocomplete-container">
      {showGoogleUx ? (
        <>
          <div
            ref={widgetHostRef}
            className="address-autocomplete-widget-host"
            aria-busy={!placesReady}
          />
          {/* Native mirror so HTML5 `required` still blocks empty submit. */}
          <input
            type="text"
            value={value}
            required={required}
            tabIndex={-1}
            aria-hidden="true"
            className="address-autocomplete-mirror"
            onChange={() => {}}
            autoComplete="off"
          />
          {!placesReady && (
            <span className="google-loading-indicator" aria-hidden="true">
              Loading suggestions…
            </span>
          )}
        </>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleFallbackChange}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`${className}${shownError ? ' is-invalid' : ''}`}
          style={style}
          required={required}
          disabled={disabled}
          autoComplete="street-address"
          aria-invalid={Boolean(shownError)}
          aria-describedby={shownError ? `${name}-help` : undefined}
        />
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
