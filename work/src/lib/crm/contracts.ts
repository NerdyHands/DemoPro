import {
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
  CONTRACT_LIST_FIELDS,
  CONTRACT_STATUSES,
  type Contract,
  type ContractInput,
  type ContractStatus
} from './types';

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
    Notes: input.notes?.trim() || ''
  };
  if (input.contractNumber) fields['Contract Number'] = input.contractNumber;
  if (input.startDate) fields['Start Date'] = input.startDate;
  if (input.endDate) fields['End Date'] = input.endDate;
  if (input.mongoId) fields.MongoId = input.mongoId;
  return fields;
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
  return mapContract(
    await createRecord({
      ...crm(),
      fields: await contractFields({ ...input, contractNumber: number })
    }),
    names
  );
}

export async function updateContract(id: string, input: ContractInput): Promise<Contract> {
  const names = await customerNameMap();
  return mapContract(
    await updateRecord({
      ...crm(),
      recordId: id,
      fields: await contractFields(input)
    }),
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
