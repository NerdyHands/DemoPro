import { listBaseTables, listRecords } from '../src/lib/airtable';
import { CRM_BASE_ID_DEFAULT, LEGACY_MIXED_TABLE_ID, LEGACY_MIXED_VIEW_ID, getEnv } from '../src/lib/env';
import { loadScriptEnv } from './load-env';

loadScriptEnv();

async function main() {
  const env = getEnv();
  const baseId = env.AIRTABLE_CRM_BASE_ID || CRM_BASE_ID_DEFAULT;
  console.log('Base', baseId);
  console.log('Legacy table id', env.AIRTABLE_LEGACY_TABLE_ID || LEGACY_MIXED_TABLE_ID);
  console.log('Legacy view id', LEGACY_MIXED_VIEW_ID);

  if (!env.AIRTABLE_TOKEN) {
    console.log(
      'AIRTABLE_TOKEN is not set. Add it to work/.env.local and re-run: npm run inspect:airtable'
    );
    console.log(
      'Known from the shared URL: mixed/legacy table tblSQLnizZs73xVd8 in appBDw3qjn76qICKH. Do not write new CRM into it.'
    );
    process.exit(1);
  }

  const tables = await listBaseTables({ token: env.AIRTABLE_TOKEN, baseId });
  for (const table of tables) {
    const marker = table.id === LEGACY_MIXED_TABLE_ID ? '  [LEGACY MIXED]' : '';
    console.log(`\n${table.name} (${table.id})${marker}`);
    for (const field of table.fields) {
      console.log(`  - ${field.name} [${field.type}]`);
    }
    for (const view of table.views ?? []) {
      const viewMark = view.id === LEGACY_MIXED_VIEW_ID ? '  [open view]' : '';
      console.log(`  view: ${view.name} (${view.id})${viewMark}`);
    }
  }

  const legacy = tables.find(table => table.id === LEGACY_MIXED_TABLE_ID);
  if (legacy) {
    const sample = await listRecords({
      token: env.AIRTABLE_TOKEN,
      baseId,
      tableId: legacy.id,
      maxRecords: 3
    });
    console.log(`\nLegacy sample records: ${sample.length}`);
    for (const record of sample) {
      console.log(record.id, Object.keys(record.fields).join(', '));
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
