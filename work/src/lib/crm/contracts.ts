import {
  AirtableError,
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
  type AirtableRecord
} from '@/lib/airtable';
import { assertCrmConfigured } from '@/lib/env';
import { fieldNumber, fieldString, firstLinkedId } from '@/lib/fields';
import { normalizeLineItems, serializeLineItems, sumLineItems } from './line-items';
import { customerNameMap } from './names';
import { nextNumber } from './numbers';
import {
  asDrawScheduleType,
  normalizePaymentSchedule,
  serializePaymentSchedule
} from './payment-schedule';
import {
  CONTRACT_LIST_FIELDS,
  CONTRACT_STATUSES,
  type Contract,
  type ContractInput,
  type ContractStatus
} from './types';

const OPTIONAL_CONTRACT_FIELDS = [
  'Client Name',
  'Client Address',
  'Draw Schedule Type',
  'Payment Schedule'
];

function crm() {
  const env = assertCrmConfigured();
  return {
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_CONTRACTS_TABLE_ID
  };
}

function asStatus(value: string): ContractStatus {
  return CONTRACT_STATUSES.includes(value as ContractStatus)
    ? (value as ContractStatus)
    : 'Draft';
}

function mapContract(record: AirtableRecord, names?: Map<string, string>): Contract {
  const lineItems = normalizeLineItems(record.fields['Line Items']);
  const totalFromItems = sumLineItems(lineItems);
  const customerId = firstLinkedId(record.fields, 'Customer');
  return {
    id: record.id,
    mongoId: fieldString(record.fields, 'MongoId', 'Mongo ID'),
    contractNumber: fieldString(record.fields, 'Contract Number'),
    title: fieldString(record.fields, 'Title'),
    description: fieldString(record.fields, 'Description'),
    propertyAddress: fieldString(record.fields, 'Property Address'),
    customerId,
    customerName: names?.get(customerId) || '',
    estimateId: firstLinkedId(record.fields, 'Estimate'),
    status: asStatus(fieldString(record.fields, 'Status') || 'Draft'),
    lineItems,
    total: fieldNumber(record.fields, 'Total') || totalFromItems,
    deposit: fieldNumber(record.fields, 'Deposit'),
    startDate: fieldString(record.fields, 'Start Date'),
    endDate: fieldString(record.fields, 'End Date'),
    terms: fieldString(record.fields, 'Terms'),
    notes: fieldString(record.fields, 'Notes'),
    clientName: fieldString(record.fields, 'Client Name'),
    clientAddress: fieldString(record.fields, 'Client Address'),
    drawScheduleType: asDrawScheduleType(fieldString(record.fields, 'Draw Schedule Type')),
    paymentSchedule: normalizePaymentSchedule(record.fields['Payment Schedule']),
    createdTime: record.createdTime || ''
  };
}

async function contractFields(input: ContractInput): Promise<Record<string, unknown>> {
  const lineItems = input.lineItems ?? [];
  const total = sumLineItems(lineItems);
  const fields: Record<string, unknown> = {
    Title: input.title.trim(),
    Description: input.description?.trim() || '',
    'Property Address': input.propertyAddress?.trim() || '',
    Customer: input.customerId ? [input.customerId] : [],
    Estimate: input.estimateId ? [input.estimateId] : [],
    Status: asStatus(input.status || 'Draft'),
    'Line Items': serializeLineItems(lineItems),
    Total: total,
    Deposit: input.deposit ?? 0,
    Terms: input.terms?.trim() || '',
    Notes: input.notes?.trim() || '',
    'Client Name': input.clientName?.trim() || '',
    'Client Address': input.clientAddress?.trim() || '',
    'Draw Schedule Type': asDrawScheduleType(input.drawScheduleType),
    'Payment Schedule': serializePaymentSchedule(input.paymentSchedule ?? [])
  };
  if (input.contractNumber) fields['Contract Number'] = input.contractNumber;
  if (input.startDate) fields['Start Date'] = input.startDate;
  if (input.endDate) fields['End Date'] = input.endDate;
  if (input.mongoId) fields.MongoId = input.mongoId;
  return fields;
}

function withoutOptionalFields(fields: Record<string, unknown>): Record<string, unknown> {
  const next = { ...fields };
  for (const name of OPTIONAL_CONTRACT_FIELDS) {
    delete next[name];
  }
  return next;
}

function isUnknownFieldError(error: unknown): boolean {
  return error instanceof AirtableError && /UNKNOWN_FIELD_NAME|UNKNOWN_FIELD/i.test(error.body);
}

async function writeContract(
  writer: (fields: Record<string, unknown>) => Promise<AirtableRecord>,
  fields: Record<string, unknown>,
  names?: Map<string, string>
): Promise<Contract> {
  try {
    return mapContract(await writer(fields), names);
  } catch (error) {
    if (!isUnknownFieldError(error)) throw error;
    return mapContract(await writer(withoutOptionalFields(fields)), names);
  }
}

export async function listContracts(options?: {
  query?: string;
  status?: string;
  customerId?: string;
}): Promise<Contract[]> {
  const names = await customerNameMap();
  const records = await listRecords({
    ...crm(),
    fields: CONTRACT_LIST_FIELDS
  });
  const query = options?.query?.trim().toLowerCase() ?? '';
  const status = options?.status?.trim();
  return records
    .map(record => mapContract(record, names))
    .filter(contract => {
      if (status && status !== 'all' && contract.status !== status) return false;
      if (options?.customerId && contract.customerId !== options.customerId) return false;
      if (!query) return true;
      return [
        contract.contractNumber,
        contract.title,
        contract.propertyAddress,
        contract.customerName
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime));
}

export async function getContract(id: string): Promise<Contract | null> {
  try {
    const names = await customerNameMap();
    return mapContract(await getRecord({ ...crm(), recordId: id }), names);
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createContract(input: ContractInput): Promise<Contract> {
  const number = input.contractNumber || (await nextNumber('CON'));
  const names = await customerNameMap();
  const fields = await contractFields({ ...input, contractNumber: number });
  return writeContract(next => createRecord({ ...crm(), fields: next }), fields, names);
}

export async function updateContract(id: string, input: ContractInput): Promise<Contract> {
  const names = await customerNameMap();
  const fields = await contractFields(input);
  return writeContract(
    next => updateRecord({ ...crm(), recordId: id, fields: next }),
    fields,
    names
  );
}

export async function updateContractStatus(id: string, status: ContractStatus): Promise<Contract> {
  const names = await customerNameMap();
  return mapContract(
    await updateRecord({ ...crm(), recordId: id, fields: { Status: asStatus(status) } }),
    names
  );
}

export async function deleteContract(id: string): Promise<void> {
  await deleteRecord({ ...crm(), recordId: id });
}

export async function findContractIdByMongoId(mongoId: string): Promise<string | undefined> {
  const records = await listRecords({
    ...crm(),
    fields: ['MongoId'],
    filterByFormula: `{MongoId}='${mongoId.replace(/'/g, "\\'")}'`
  });
  return records[0]?.id;
}
