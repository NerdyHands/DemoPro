import { MongoClient, type Document } from 'mongodb';
import { createRecords, listRecords, updateRecords } from '../src/lib/airtable';
import { assertCrmConfigured } from '../src/lib/env';
import { fieldString } from '../src/lib/fields';
import { serializeLineItems, sumLineItems, normalizeLineItems } from '../src/lib/crm/line-items';
import { displayName } from '../src/lib/crm/customers';
import { loadScriptEnv } from './load-env';

loadScriptEnv();

const DRY_RUN = process.argv.includes('--dry-run');

function isoDate(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function addressFull(address: unknown): string {
  if (typeof address === 'string') return address;
  if (address && typeof address === 'object' && 'full' in address) {
    const full = (address as { full?: unknown }).full;
    return typeof full === 'string' ? full : '';
  }
  return '';
}

function mongoIdOf(doc: Document): string {
  return String(doc._id);
}

async function mongoIdMap(
  token: string,
  baseId: string,
  tableId: string
): Promise<Map<string, string>> {
  const records = await listRecords({
    token,
    baseId,
    tableId,
    fields: ['MongoId']
  });
  const map = new Map<string, string>();
  for (const record of records) {
    const mongoId = fieldString(record.fields, 'MongoId');
    if (mongoId) map.set(mongoId, record.id);
  }
  return map;
}

async function upsertTable(
  options: {
    token: string;
    baseId: string;
    tableId: string;
    existing: Map<string, string>;
    rows: Array<{ mongoId: string; fields: Record<string, unknown> }>;
    label: string;
  }
) {
  const toCreate: Array<{ fields: Record<string, unknown> }> = [];
  const toUpdate: Array<{ id: string; fields: Record<string, unknown> }> = [];
  for (const row of options.rows) {
    const existingId = options.existing.get(row.mongoId);
    if (existingId) {
      toUpdate.push({ id: existingId, fields: row.fields });
    } else {
      toCreate.push({ fields: row.fields });
    }
  }
  console.log(
    `${options.label}: ${toCreate.length} create, ${toUpdate.length} update${DRY_RUN ? ' (dry-run)' : ''}`
  );
  if (DRY_RUN) return;

  if (toCreate.length) {
    const created = await createRecords({
      token: options.token,
      baseId: options.baseId,
      tableId: options.tableId,
      records: toCreate
    });
    for (const record of created) {
      const mongoId = fieldString(record.fields, 'MongoId');
      if (mongoId) options.existing.set(mongoId, record.id);
    }
  }
  if (toUpdate.length) {
    await updateRecords({
      token: options.token,
      baseId: options.baseId,
      tableId: options.tableId,
      records: toUpdate
    });
  }
}

async function main() {
  const env = assertCrmConfigured();
  const mongoUri = (process.env.MONGODB_URI ?? '').trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required (work/.env.local or server/.env.development)');
  }

  const client = new MongoClient(mongoUri, {
    tlsAllowInvalidCertificates: process.env.MONGODB_TLS_ALLOW_INVALID === 'true'
  });
  await client.connect();
  const db = client.db();
  const customers = await db.collection('customers').find().toArray();
  const estimates = await db.collection('estimates').find().toArray();
  const contracts = await db.collection('contracts').find().toArray();
  console.log(
    `Mongo: ${customers.length} customers, ${estimates.length} estimates, ${contracts.length} contracts`
  );

  const existingCustomers = await mongoIdMap(
    env.AIRTABLE_TOKEN,
    env.AIRTABLE_CRM_BASE_ID,
    env.AIRTABLE_CUSTOMERS_TABLE_ID
  );
  const customerRows = customers.map(doc => {
    const mongoId = mongoIdOf(doc);
    const firstName = String(doc.firstName || '');
    const lastName = String(doc.lastName || '');
    const businessName = String(doc.businessName || '');
    const email = String(doc.email || '').toLowerCase();
    return {
      mongoId,
      fields: {
        Name: displayName({ firstName, lastName, businessName, email }),
        'First Name': firstName,
        'Last Name': lastName,
        'Business Name': businessName,
        Email: email,
        Phone: String(doc.phone || ''),
        Address: addressFull(doc.address),
        Notes: String(doc.notes || ''),
        Status: 'Active',
        MongoId: mongoId
      }
    };
  });
  await upsertTable({
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_CUSTOMERS_TABLE_ID,
    existing: existingCustomers,
    rows: customerRows,
    label: 'Customers'
  });

  const existingEstimates = await mongoIdMap(
    env.AIRTABLE_TOKEN,
    env.AIRTABLE_CRM_BASE_ID,
    env.AIRTABLE_ESTIMATES_TABLE_ID
  );
  let unmatchedEstimates = 0;
  const estimateRows = estimates.flatMap(doc => {
    const mongoId = mongoIdOf(doc);
    const customerMongoId =
      doc.customer && typeof doc.customer === 'object' && '_id' in doc.customer
        ? String((doc.customer as { _id: unknown })._id)
        : String(doc.customer || '');
    const customerRec = existingCustomers.get(customerMongoId);
    if (!customerRec) {
      unmatchedEstimates += 1;
      return [];
    }
    const lineItems = normalizeLineItems(doc.lineItems);
    const total = Number(doc.totalAmount) || sumLineItems(lineItems);
    return [
      {
        mongoId,
        fields: {
          'Estimate Number': String(doc.estimateNumber || ''),
          Title: String(doc.title || 'Estimate'),
          Description: String(doc.description || ''),
          'Property Address': String(doc.propertyAddress || ''),
          Customer: [customerRec],
          Status: String(doc.status || 'Draft'),
          'Line Items': serializeLineItems(lineItems),
          Subtotal: Number(doc.subtotal) || total,
          Total: total,
          'Valid Until': isoDate(doc.validUntil),
          Notes: String(doc.notes || ''),
          MongoId: mongoId
        }
      }
    ];
  });
  await upsertTable({
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_ESTIMATES_TABLE_ID,
    existing: existingEstimates,
    rows: estimateRows,
    label: 'Estimates'
  });

  const existingContracts = await mongoIdMap(
    env.AIRTABLE_TOKEN,
    env.AIRTABLE_CRM_BASE_ID,
    env.AIRTABLE_CONTRACTS_TABLE_ID
  );
  let unmatchedContracts = 0;
  const contractRows = contracts.flatMap(doc => {
    const mongoId = mongoIdOf(doc);
    const customerMongoId =
      doc.customer && typeof doc.customer === 'object' && '_id' in doc.customer
        ? String((doc.customer as { _id: unknown })._id)
        : String(doc.customerId || doc.customer || '');
    const customerRec = existingCustomers.get(customerMongoId);
    if (!customerRec) {
      unmatchedContracts += 1;
      return [];
    }
    const estimateMongoId = String(doc.estimateId || doc.estimate || '');
    const estimateRec =
      existingEstimates.get(estimateMongoId) ||
      [...existingEstimates.entries()].find(([key]) => key === estimateMongoId)?.[1];
    const lineItems = normalizeLineItems(doc.lineItems);
    const total = Number(doc.totalAmount) || sumLineItems(lineItems);
    return [
      {
        mongoId,
        fields: {
          'Contract Number': String(doc.contractNumber || ''),
          Title: String(doc.title || 'Contract'),
          Description: String(doc.description || ''),
          'Property Address': String(doc.propertyAddress || ''),
          Customer: [customerRec],
          Estimate: estimateRec ? [estimateRec] : [],
          Status: String(doc.status || 'Draft'),
          'Line Items': serializeLineItems(lineItems),
          Total: total,
          Deposit: Number(doc.depositAmount) || 0,
          'Start Date': isoDate(doc.startDate),
          'End Date': isoDate(doc.endDate),
          Terms: String(doc.terms || ''),
          Notes: String(doc.notes || ''),
          MongoId: mongoId
        }
      }
    ];
  });
  await upsertTable({
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId: env.AIRTABLE_CONTRACTS_TABLE_ID,
    existing: existingContracts,
    rows: contractRows,
    label: 'Contracts'
  });

  console.log(`Unmatched estimate customer links: ${unmatchedEstimates}`);
  console.log(`Unmatched contract customer links: ${unmatchedContracts}`);
  await client.close();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
