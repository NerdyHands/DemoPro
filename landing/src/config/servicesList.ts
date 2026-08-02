/** Service options for quote forms — keep in sync with Services page */
export const SERVICE_OPTIONS = [
  'Shed Removal',
  'Deck Removal',
  'Fence Removal',
  'Interior Demolition',
  'Kitchen Demolition',
  'Bathroom Demolition',
  'Garage Demolition',
  'House Demolition',
  'Concrete Removal',
  'Commercial Interior Demolition',
  'Junk Removal',
  'Cleanout Services'
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

/** Include page-specific service labels that are not in the main list */
export function getServiceOptionsForForm(currentValue?: string): string[] {
  const options: string[] = [...SERVICE_OPTIONS];
  if (currentValue && !options.includes(currentValue)) {
    options.unshift(currentValue);
  }
  return options;
}
