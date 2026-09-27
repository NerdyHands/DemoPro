import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddressAutocomplete from './AddressAutocomplete.jsx';

// Mock Google Places API
const mockGoogle = {
  maps: {
    places: {
      Autocomplete: jest.fn().mockImplementation(() => ({
        addListener: jest.fn().mockReturnValue({}),
        getPlace: jest.fn().mockReturnValue({
          formatted_address: '123 Main St, New York, NY 10001, USA',
          place_id: 'test_place_id',
          geometry: {
            location: {
              lat: () => 40.7128,
              lng: () => -74.0060
            }
          },
          address_components: []
        })
      }))
    },
    event: {
      clearListeners: jest.fn()
    }
  }
};

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogle,
  writable: true
});

describe('AddressAutocomplete', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field with placeholder', () => {
    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
        placeholder="Enter address"
      />
    );

    expect(screen.getByPlaceholderText('Enter address')).toBeInTheDocument();
  });

  test('shows loading indicator when Google API is not loaded', () => {
    // Temporarily remove google from window
    delete window.google;

    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Loading address suggestions...')).toBeInTheDocument();
  });

  test('initializes Google Places Autocomplete when API is loaded', async () => {
    // Restore google mock
    window.google = mockGoogle;

    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(mockGoogle.maps.places.Autocomplete).toHaveBeenCalled();
    });
  });

  test('calls onChange when user types', () => {
    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123 Main St' } });

    expect(mockOnChange).toHaveBeenCalledWith('123 Main St');
  });

  test('displays current value', () => {
    render(
      <AddressAutocomplete
        value="123 Main St, New York, NY"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue('123 Main St, New York, NY')).toBeInTheDocument();
  });

  test('applies required attribute when specified', () => {
    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('required');
  });

  test('applies disabled attribute when specified', () => {
    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('disabled');
  });

  test('applies custom className', () => {
    render(
      <AddressAutocomplete
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const container = screen.getByTestId('address-autocomplete-container');
    expect(container).toHaveClass('custom-class');
  });
}); 