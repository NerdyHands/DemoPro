import { airtableFetch, listBaseTables } from '../src/lib/airtable';
import { CRM_BASE_ID_DEFAULT, LEGACY_MIXED_TABLE_ID, getEnv } from '../src/lib/env';
import { loadScriptEnv } from './load-env';

loadScriptEnv();

type FieldDef = Record<string, unknown>;

const select = (name: string, choices: string[]): FieldDef => ({
  name,
  type: 'singleSelect',
  options: { choices: choices.map(choice => ({ name: choice })) }
});

const currency = (name: string): FieldDef => ({
  name,
  type: 'currency',
  options: { precision: 2, symbol: '$' }
});

const dateField = (name: string): FieldDef => ({
  name,
  type: 'date',
  options: { dateFormat: { name: 'iso', format: 'YYYY-MM-DD' } }
});

async function createTable(
  token: string,
  baseId: string,
  name: string,
  fields: FieldDef[],
  description: string
) {
  const response = await airtableFetch(`/meta/bases/${baseId}/tables`, {
    method: 'POST',
    token,
    body: JSON.stringify({ name, description, fields })
  });
  if (!response.ok) {
    throw new Error(`Create table ${name} failed (${response.status}): ${await response.text()}`);
  }
  return (await response.json()) as { id: string; name: string };
}

async function patchTable(token: string, baseId: string, tableId: string, name: string) {
  const response = await airtableFetch(`/meta/bases/${baseId}/tables/${tableId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    console.warn(`Could not rename ${tableId}: ${await response.text()}`);
    return;
  }
  console.log(`Renamed ${tableId} -> ${name}`);
}

async function main() {
  const env = getEnv();
  if (!env.AIRTABLE_TOKEN) {
    throw new Error('AIRTABLE_TOKEN is required in work/.env.local');
  }
  const baseId = env.AIRTABLE_CRM_BASE_ID || CRM_BASE_ID_DEFAULT;
  const tables = await listBaseTables({ token: env.AIRTABLE_TOKEN, baseId });
  const byName = new Map(tables.map(table => [table.name, table]));
  const byId = new Map(tables.map(table => [table.id, table]));

  const legacy = byId.get(LEGACY_MIXED_TABLE_ID);
  if (legacy && legacy.name !== 'Legacy Mixed') {
    await patchTable(env.AIRTABLE_TOKEN, baseId, legacy.id, 'Legacy Mixed');
  }

  let admins = byName.get('Admins');
  if (!admins) {
    admins = await createTable(
      env.AIRTABLE_TOKEN,
      baseId,
      'Admins',
      [
        { name: 'Name', type: 'singleLineText' },
        { name: 'Email', type: 'email' },
        { name: 'Active', type: 'checkbox', options: { color: 'greenBright', icon: 'check' } },
        { name: 'Magic Nonce', type: 'singleLineText' },
        { name: 'Magic Expires', type: 'singleLineText' }
      ],
      'Magic-link allowlist. Do not use for CRM customers.'
    );
    console.log('Created Admins', admins.id);
  } else {
    console.log('Admins exists', admins.id);
  }

  let customers = byName.get('Customers');
  if (!customers) {
    customers = await createTable(
      env.AIRTABLE_TOKEN,
      baseId,
      'Customers',
      [
        {
          name: 'Name',
          type: 'formula',
          options: {
            formula:
              'IF({Business Name}, {Business Name}, TRIM({First Name} & " " & {Last Name}))'
          }
        },
        { name: 'First Name', type: 'singleLineText' },
        { name: 'Last Name', type: 'singleLineText' },
        { name: 'Business Name', type: 'singleLineText' },
        { name: 'Email', type: 'email' },
        { name: 'Phone', type: 'phoneNumber' },
        { name: 'Address', type: 'multilineText' },
        { name: 'Notes', type: 'multilineText' },
        select('Status', ['Lead', 'Active', 'Inactive']),
        { name: 'MongoId', type: 'singleLineText' },
        { name: 'Created', type: 'createdTime' }
      ],
      'Operator CRM customers'
    );
    console.log('Created Customers', customers.id);
  } else {
    console.log('Customers exists', customers.id);
  }

  let estimates = byName.get('Estimates');
  if (!estimates) {
    estimates = await createTable(
      env.AIRTABLE_TOKEN,
      baseId,
      'Estimates',
      [
        { name: 'Estimate Number', type: 'singleLineText' },
        { name: 'Title', type: 'singleLineText' },
        { name: 'Description', type: 'multilineText' },
        { name: 'Property Address', type: 'multilineText' },
        {
          name: 'Customer',
          type: 'multipleRecordLinks',
          options: { linkedTableId: customers.id }
        },
        select('Status', ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired']),
        { name: 'Line Items', type: 'multilineText' },
        currency('Subtotal'),
        currency('Total'),
        dateField('Valid Until'),
        { name: 'Notes', type: 'multilineText' },
        { name: 'MongoId', type: 'singleLineText' }
      ],
      'Operator CRM estimates'
    );
    console.log('Created Estimates', estimates.id);
  } else {
    console.log('Estimates exists', estimates.id);
  }

  let contracts = byName.get('Contracts');
  if (!contracts) {
    contracts = await createTable(
      env.AIRTABLE_TOKEN,
      baseId,
      'Contracts',
      [
        { name: 'Contract Number', type: 'singleLineText' },
        { name: 'Title', type: 'singleLineText' },
        { name: 'Description', type: 'multilineText' },
        { name: 'Property Address', type: 'multilineText' },
        {
          name: 'Customer',
          type: 'multipleRecordLinks',
          options: { linkedTableId: customers.id }
        },
        {
          name: 'Estimate',
          type: 'multipleRecordLinks',
          options: { linkedTableId: estimates.id }
        },
        select('Status', ['Draft', 'Sent', 'Signed', 'Active', 'Completed', 'Cancelled']),
        { name: 'Line Items', type: 'multilineText' },
        currency('Total'),
        currency('Deposit'),
        dateField('Start Date'),
        dateField('End Date'),
        { name: 'Terms', type: 'multilineText' },
        { name: 'Notes', type: 'multilineText' },
        { name: 'MongoId', type: 'singleLineText' }
      ],
      'Operator CRM contracts'
    );
    console.log('Created Contracts', contracts.id);
  } else {
    console.log('Contracts exists', contracts.id);
  }

  console.log('\nPut these in work/.env.local:');
  console.log(`AIRTABLE_ADMINS_BASE_ID=${baseId}`);
  console.log(`AIRTABLE_ADMINS_TABLE_ID=${admins.id}`);
  console.log(`AIRTABLE_CRM_BASE_ID=${baseId}`);
  console.log(`AIRTABLE_CUSTOMERS_TABLE_ID=${customers.id}`);
  console.log(`AIRTABLE_ESTIMATES_TABLE_ID=${estimates.id}`);
  console.log(`AIRTABLE_CONTRACTS_TABLE_ID=${contracts.id}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
