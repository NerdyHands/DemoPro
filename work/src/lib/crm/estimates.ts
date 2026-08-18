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
  ESTIMATE_LIST_FIELDS,
  ESTIMATE_STATUSES,
  type Estimate,
  type EstimateInput,
  type EstimateStatus
} from './types';

function crm() {
  const env = assertCrmConfigured();
  return {
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_ESTIMATES_TABLE_ID
  };
}

function asStatus(value: string): EstimateStatus {
  return ESTIMATE_STATUSES.includes(value as EstimateStatus)
    ? (value as EstimateStatus)
    : 'Draft';
}

function mapEstimate(record: AirtableRecord, names?: Map<string, string>): Estimate {
  const lineItems = normalizeLineItems(record.fields['Line Items']);
  const totalFromItems = sumLineItems(lineItems);
  const customerId = firstLinkedId(record.fields, 'Customer');
  return {
    id: record.id,
    mongoId: fieldString(record.fields, 'MongoId', 'Mongo ID'),
    estimateNumber: fieldString(record.fields, 'Estimate Number'),
    title: fieldString(record.fields, 'Title'),
    description: fieldString(record.fields, 'Description'),
    propertyAddress: fieldString(record.fields, 'Property Address'),
    customerId,
    customerName: names?.get(customerId) || '',
    status: asStatus(fieldString(record.fields, 'Status') || 'Draft'),
    lineItems,
    subtotal: fieldNumber(record.fields, 'Subtotal') || totalFromItems,
    total: fieldNumber(record.fields, 'Total') || totalFromItems,
    validUntil: fieldString(record.fields, 'Valid Until'),
    notes: fieldString(record.fields, 'Notes'),
    createdTime: record.createdTime || ''
  };
}

async function estimateFields(input: EstimateInput): Promise<Record<string, unknown>> {
  const lineItems = input.lineItems ?? [];
  const total = sumLineItems(lineItems);
  const fields: Record<string, unknown> = {
    Title: input.title.trim(),
    Description: input.description?.trim() || '',
    'Property Address': input.propertyAddress?.trim() || '',
    Customer: input.customerId ? [input.customerId] : [],
    Status: asStatus(input.status || 'Draft'),
    'Line Items': serializeLineItems(lineItems),
    Subtotal: total,
    Total: total,
    Notes: input.notes?.trim() || ''
  };
  if (input.estimateNumber) fields['Estimate Number'] = input.estimateNumber;
  if (input.validUntil) fields['Valid Until'] = input.validUntil;
  if (input.mongoId) fields.MongoId = input.mongoId;
  return fields;
}

export async function listEstimates(options?: {
  query?: string;
  status?: string;
  customerId?: string;
}): Promise<Estimate[]> {
  const names = await customerNameMap();
  const records = await listRecords({
    ...crm(),
    fields: ESTIMATE_LIST_FIELDS
  });
  const query = options?.query?.trim().toLowerCase() ?? '';
  const status = options?.status?.trim();
  return records
    .map(record => mapEstimate(record, names))
    .filter(estimate => {
      if (status && status !== 'all' && estimate.status !== status) return false;
      if (options?.customerId && estimate.customerId !== options.customerId) return false;
      if (!query) return true;
      return [
        estimate.estimateNumber,
        estimate.title,
        estimate.propertyAddress,
        estimate.customerName
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime));
}

export async function getEstimate(id: string): Promise<Estimate | null> {
  try {
    const names = await customerNameMap();
    return mapEstimate(await getRecord({ ...crm(), recordId: id }), names);
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createEstimate(input: EstimateInput): Promise<Estimate> {
  const number = input.estimateNumber || (await nextNumber('EST'));
  const names = await customerNameMap();
  return mapEstimate(
    await createRecord({
      ...crm(),
      fields: await estimateFields({ ...input, estimateNumber: number })
    }),
    names
  );
}

export async function updateEstimate(id: string, input: EstimateInput): Promise<Estimate> {
  const names = await customerNameMap();
  return mapEstimate(
    await updateRecord({
      ...crm(),
      recordId: id,
      fields: await estimateFields(input)
    }),
    names
  );
}

export async function deleteEstimate(id: string): Promise<void> {
  await deleteRecord({ ...crm(), recordId: id });
}

export async function findEstimateIdByMongoId(mongoId: string): Promise<string | undefined> {
  const records = await listRecords({
    ...crm(),
    fields: ['MongoId'],
    filterByFormula: `{MongoId}='${mongoId.replace(/'/g, "\\'")}'`
  });
  return records[0]?.id;
}
