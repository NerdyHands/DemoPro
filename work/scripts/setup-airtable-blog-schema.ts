import { airtableFetch, listBaseTables } from '../src/lib/airtable';
import { loadScriptEnv } from './load-env';

loadScriptEnv();

type FieldDef = Record<string, unknown>;

const BLOG_BASE_ID_DEFAULT = 'appN9vpPDhXfWVwB3';
const BLOG_TABLE_ID_DEFAULT = 'tblAKTg8pq8RAtHKT';
const BLOG_TABLE_NAME = 'Blog Posts';

const COMPANY_CHOICES = ['lawn', 'demo', 'nerdy', 'floor', 'picra', 'trading'];

const select = (name: string, choices: string[]): FieldDef => ({
  name,
  type: 'singleSelect',
  options: { choices: choices.map(choice => ({ name: choice })) }
});

const dateField = (name: string): FieldDef => ({
  name,
  type: 'date',
  options: { dateFormat: { name: 'iso', format: 'YYYY-MM-DD' } }
});

const dateTimeField = (name: string): FieldDef => ({
  name,
  type: 'dateTime',
  options: {
    timeZone: 'utc',
    dateFormat: { name: 'iso', format: 'YYYY-MM-DD' },
    timeFormat: { name: '24hour', format: 'HH:mm' }
  }
});

const BLOG_FIELDS: FieldDef[] = [
  select('Company', COMPANY_CHOICES),
  { name: 'Slug', type: 'singleLineText' },
  { name: 'Excerpt', type: 'multilineText' },
  { name: 'Content HTML', type: 'multilineText' },
  { name: 'Author', type: 'singleLineText' },
  { name: 'Tags', type: 'multilineText' },
  dateField('Published At'),
  dateField('Updated At'),
  { name: 'Cover URL', type: 'url' },
  { name: 'Cover File Key', type: 'singleLineText' },
  { name: 'Meta Title', type: 'singleLineText' },
  { name: 'Meta Description', type: 'multilineText' },
  dateTimeField('Synced At'),
  { name: 'Opinly Key', type: 'singleLineText' }
];

async function renameTable(token: string, baseId: string, tableId: string, name: string) {
  const response = await airtableFetch(`/meta/bases/${baseId}/tables/${tableId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ name, description: 'Opinly blog posts synced by company' })
  });
  if (!response.ok) {
    throw new Error(`Rename table failed (${response.status}): ${await response.text()}`);
  }
  return (await response.json()) as { id: string; name: string };
}

async function createField(token: string, baseId: string, tableId: string, field: FieldDef) {
  const response = await airtableFetch(`/meta/bases/${baseId}/tables/${tableId}/fields`, {
    method: 'POST',
    token,
    body: JSON.stringify(field)
  });
  if (!response.ok) {
    throw new Error(
      `Create field "${String(field.name)}" failed (${response.status}): ${await response.text()}`
    );
  }
  return (await response.json()) as { id: string; name: string; type: string };
}

async function main() {
  const token = (process.env.AIRTABLE_TOKEN || '').trim();
  if (!token) {
    throw new Error('AIRTABLE_TOKEN is required in work/.env.local');
  }

  const baseId = (process.env.AIRTABLE_BLOG_BASE_ID || BLOG_BASE_ID_DEFAULT).trim();
  const tableId = (process.env.AIRTABLE_BLOG_TABLE_ID || BLOG_TABLE_ID_DEFAULT).trim();

  const tables = await listBaseTables({ token, baseId });
  const table = tables.find(t => t.id === tableId);
  if (!table) {
    const available = tables.map(t => `${t.name} (${t.id})`).join(', ') || '(none)';
    throw new Error(`Table ${tableId} not found in base ${baseId}. Available: ${available}`);
  }

  if (table.name !== BLOG_TABLE_NAME) {
    const renamed = await renameTable(token, baseId, tableId, BLOG_TABLE_NAME);
    console.log(`Renamed "${table.name}" → "${renamed.name}" (${renamed.id})`);
  } else {
    console.log(`Table already named "${BLOG_TABLE_NAME}" (${table.id})`);
  }

  const existingNames = new Set(table.fields.map(f => f.name));
  let created = 0;
  for (const field of BLOG_FIELDS) {
    const name = String(field.name);
    if (existingNames.has(name)) {
      console.log(`  skip field (exists): ${name}`);
      continue;
    }
    const result = await createField(token, baseId, tableId, field);
    console.log(`  created field: ${result.name} (${result.type})`);
    existingNames.add(result.name);
    created += 1;
  }

  const refreshed = await listBaseTables({ token, baseId });
  const finalTable = refreshed.find(t => t.id === tableId);
  console.log(`\nDone. Created ${created} field(s).`);
  console.log(`Table: ${finalTable?.name} (${tableId})`);
  console.log('Fields:');
  for (const field of finalTable?.fields ?? []) {
    console.log(`  - ${field.name} | ${field.type}`);
  }
  console.log('\nEnv:');
  console.log(`AIRTABLE_BLOG_BASE_ID=${baseId}`);
  console.log(`AIRTABLE_BLOG_TABLE_ID=${tableId}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
