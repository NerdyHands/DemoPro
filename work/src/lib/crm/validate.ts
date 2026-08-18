import { normalizeLineItems } from './line-items';
import {
  CONTRACT_STATUSES,
  CUSTOMER_STATUSES,
  ESTIMATE_STATUSES,
  type ContractInput,
  type ContractStatus,
  type CustomerInput,
  type CustomerStatus,
  type EstimateInput,
  type EstimateStatus
} from './types';

export function parseCustomer(body: unknown): {
  data?: CustomerInput;
  fields?: Record<string, string>;
} {
  if (!body || typeof body !== 'object') {
    return { fields: { email: 'Email is required' } };
  }
  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const firstName = typeof raw.firstName === 'string' ? raw.firstName.trim() : '';
  const lastName = typeof raw.lastName === 'string' ? raw.lastName.trim() : '';
  const businessName = typeof raw.businessName === 'string' ? raw.businessName.trim() : '';
  const fields: Record<string, string> = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = 'Enter a valid email';
  }
  if (!businessName && !firstName && !lastName) {
    fields.firstName = 'Add a name or business name';
  }
  const status =
    typeof raw.status === 'string' && CUSTOMER_STATUSES.includes(raw.status as CustomerStatus)
      ? (raw.status as CustomerStatus)
      : 'Lead';
  if (Object.keys(fields).length) return { fields };
  return {
    data: {
      firstName,
      lastName,
      businessName,
      email,
      phone: typeof raw.phone === 'string' ? raw.phone : '',
      address: typeof raw.address === 'string' ? raw.address : '',
      notes: typeof raw.notes === 'string' ? raw.notes : '',
      status
    }
  };
}

export function parseEstimate(body: unknown): {
  data?: EstimateInput;
  fields?: Record<string, string>;
} {
  if (!body || typeof body !== 'object') {
    return { fields: { title: 'Title is required' } };
  }
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const customerId = typeof raw.customerId === 'string' ? raw.customerId.trim() : '';
  const fields: Record<string, string> = {};
  if (!title) fields.title = 'Title is required';
  if (!customerId) fields.customerId = 'Customer is required';
  const status =
    typeof raw.status === 'string' && ESTIMATE_STATUSES.includes(raw.status as EstimateStatus)
      ? (raw.status as EstimateStatus)
      : 'Draft';
  if (Object.keys(fields).length) return { fields };
  return {
    data: {
      estimateNumber: typeof raw.estimateNumber === 'string' ? raw.estimateNumber : undefined,
      title,
      description: typeof raw.description === 'string' ? raw.description : '',
      propertyAddress: typeof raw.propertyAddress === 'string' ? raw.propertyAddress : '',
      customerId,
      status,
      lineItems: normalizeLineItems(raw.lineItems),
      validUntil: typeof raw.validUntil === 'string' ? raw.validUntil : '',
      notes: typeof raw.notes === 'string' ? raw.notes : ''
    }
  };
}

export function parseContract(body: unknown): {
  data?: ContractInput;
  fields?: Record<string, string>;
} {
  if (!body || typeof body !== 'object') {
    return { fields: { title: 'Title is required' } };
  }
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const customerId = typeof raw.customerId === 'string' ? raw.customerId.trim() : '';
  const fields: Record<string, string> = {};
  if (!title) fields.title = 'Title is required';
  if (!customerId) fields.customerId = 'Customer is required';
  const status =
    typeof raw.status === 'string' && CONTRACT_STATUSES.includes(raw.status as ContractStatus)
      ? (raw.status as ContractStatus)
      : 'Draft';
  if (Object.keys(fields).length) return { fields };
  return {
    data: {
      contractNumber: typeof raw.contractNumber === 'string' ? raw.contractNumber : undefined,
      title,
      description: typeof raw.description === 'string' ? raw.description : '',
      propertyAddress: typeof raw.propertyAddress === 'string' ? raw.propertyAddress : '',
      customerId,
      estimateId: typeof raw.estimateId === 'string' ? raw.estimateId : '',
      status,
      lineItems: normalizeLineItems(raw.lineItems),
      deposit: typeof raw.deposit === 'number' ? raw.deposit : Number(raw.deposit) || 0,
      startDate: typeof raw.startDate === 'string' ? raw.startDate : '',
      endDate: typeof raw.endDate === 'string' ? raw.endDate : '',
      terms: typeof raw.terms === 'string' ? raw.terms : '',
      notes: typeof raw.notes === 'string' ? raw.notes : ''
    }
  };
}
