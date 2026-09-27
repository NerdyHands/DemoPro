import { getEnv } from '@/lib/env';
import { listRecords } from '@/lib/airtable';

export async function nextNumber(prefix: 'EST' | 'CON'): Promise<string> {
  const env = getEnv();
  const tableId =
    prefix === 'EST' ? env.AIRTABLE_ESTIMATES_TABLE_ID : env.AIRTABLE_CONTRACTS_TABLE_ID;
  const field = prefix === 'EST' ? 'Estimate Number' : 'Contract Number';
  const records = await listRecords({
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_CRM_BASE_ID,
    tableId,
    fields: [field]
  });

  let max = 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  for (const record of records) {
    const raw = record.fields[field];
    const value = typeof raw === 'string' ? raw.trim() : '';
    const match = pattern.exec(value);
    if (match?.[1]) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}
