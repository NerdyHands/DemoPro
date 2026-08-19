import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
  type AirtableRecord
} from '@/lib/airtable';
import { assertCrmConfigured } from '@/lib/env';
import { fieldString } from '@/lib/fields';
import {
  CUSTOMER_LIST_FIELDS,
  CUSTOMER_STATUSES,
  type Customer,
  type CustomerInput,
  type CustomerStatus
} from './types';

function crm() {
  const env = assertCrmConfigured();
  return {
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_CUSTOMERS_TABLE_ID
  };
}

function asStatus(value: string): CustomerStatus {
  return CUSTOMER_STATUSES.includes(value as CustomerStatus)
    ? (value as CustomerStatus)
    : 'Lead';
}

export function displayName(input: {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
}): string {
  const business = input.businessName?.trim();
  if (business) return business;
  const person = [input.firstName, input.lastName].filter(Boolean).join(' ').trim();
  return person || input.email?.trim() || 'Untitled customer';
}

export function mapCustomer(record: AirtableRecord): Customer {
  const firstName = fieldString(record.fields, 'First Name');
  const lastName = fieldString(record.fields, 'Last Name');
  const businessName = fieldString(record.fields, 'Business Name');
  const email = fieldString(record.fields, 'Email');
  return {
    id: record.id,
    mongoId: fieldString(record.fields, 'MongoId', 'Mongo ID'),
    name:
      fieldString(record.fields, 'Name') ||
      displayName({ firstName, lastName, businessName, email }),
    firstName,
    lastName,
    businessName,
    email,
    phone: fieldString(record.fields, 'Phone'),
    address: fieldString(record.fields, 'Address'),
    notes: fieldString(record.fields, 'Notes'),
    status: asStatus(fieldString(record.fields, 'Status') || 'Lead'),
    createdTime: record.createdTime || ''
  };
}

export function customerFields(input: CustomerInput): Record<string, unknown> {
  const firstName = input.firstName?.trim() || '';
  const lastName = input.lastName?.trim() || '';
  const businessName = input.businessName?.trim() || '';
  const email = input.email.trim().toLowerCase();
  const fields: Record<string, unknown> = {
    Name: displayName({ firstName, lastName, businessName, email }),
    'First Name': firstName,
    'Last Name': lastName,
    'Business Name': businessName,
    Email: email,
    Phone: input.phone?.trim() || '',
    Address: input.address?.trim() || '',
    Notes: input.notes?.trim() || '',
    Status: asStatus(input.status || 'Lead')
  };
  if (input.mongoId) fields.MongoId = input.mongoId;
  return fields;
}

export async function listCustomers(options?: {
  query?: string;
  status?: string;
}): Promise<Customer[]> {
  const records = await listRecords({
    ...crm(),
    fields: CUSTOMER_LIST_FIELDS
  });
  const query = options?.query?.trim().toLowerCase() ?? '';
  const status = options?.status?.trim();
  return records
    .map(mapCustomer)
    .filter(customer => {
      if (status && status !== 'all' && customer.status !== status) return false;
      if (!query) return true;
      const haystack = [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.businessName
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    return mapCustomer(await getRecord({ ...crm(), recordId: id }));
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  return mapCustomer(await createRecord({ ...crm(), fields: customerFields(input) }));
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  return mapCustomer(
    await updateRecord({ ...crm(), recordId: id, fields: customerFields(input) })
  );
}

export async function updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
  return mapCustomer(await updateRecord({ ...crm(), recordId: id, fields: { Status: asStatus(status) } }));
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteRecord({ ...crm(), recordId: id });
}

export async function findCustomerIdByMongoId(mongoId: string): Promise<string | undefined> {
  const records = await listRecords({
    ...crm(),
    fields: ['MongoId'],
    filterByFormula: `{MongoId}='${mongoId.replace(/'/g, "\\'")}'`
  });
  return records[0]?.id;
}
