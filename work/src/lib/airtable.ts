export type AirtableRecord<T extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  createdTime?: string;
  fields: T;
};

type ListResponse<T extends Record<string, unknown>> = {
  records: AirtableRecord<T>[];
  offset?: string;
};

export class AirtableError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Airtable request failed (${status})`);
    this.name = 'AirtableError';
    this.status = status;
    this.body = body;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function encodePath(tableId: string): string {
  return encodeURIComponent(tableId);
}

export async function airtableFetch(
  path: string,
  init: RequestInit & { token: string }
): Promise<Response> {
  const { token, ...rest } = init;
  const maxAttempts = 5;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`https://api.airtable.com/v0${path}`, {
      ...rest,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(rest.headers ?? {})
      }
    });

    if (response.status !== 429 && response.status !== 503) {
      return response;
    }

    lastError = new AirtableError(response.status, await response.text());
    const retryAfter = Number(response.headers.get('Retry-After'));
    const backoffMs =
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 400 * 2 ** attempt;
    await sleep(backoffMs);
  }

  throw lastError instanceof Error ? lastError : new Error('Airtable request failed after retries');
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new AirtableError(response.status, await response.text());
  }
  return (await response.json()) as T;
}

export async function listRecords<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  viewId?: string;
  filterByFormula?: string;
  fields?: string[];
  maxRecords?: number;
}): Promise<AirtableRecord<T>[]> {
  const records: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (options.viewId) params.set('view', options.viewId);
    if (options.filterByFormula) params.set('filterByFormula', options.filterByFormula);
    if (options.maxRecords) params.set('maxRecords', String(options.maxRecords));
    if (offset) params.set('offset', offset);
    for (const field of options.fields ?? []) {
      params.append('fields[]', field);
    }

    const response = await airtableFetch(
      `/${options.baseId}/${encodePath(options.tableId)}?${params.toString()}`,
      { method: 'GET', token: options.token }
    );
    const body = await parseJson<ListResponse<T>>(response);
    records.push(...body.records);
    offset = body.offset;
    if (options.maxRecords && records.length >= options.maxRecords) {
      return records.slice(0, options.maxRecords);
    }
  } while (offset);

  return records;
}

export async function getRecord<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  recordId: string;
}): Promise<AirtableRecord<T>> {
  const response = await airtableFetch(
    `/${options.baseId}/${encodePath(options.tableId)}/${options.recordId}`,
    { method: 'GET', token: options.token }
  );
  return parseJson<AirtableRecord<T>>(response);
}

export async function createRecord<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  fields: Record<string, unknown>;
}): Promise<AirtableRecord<T>> {
  const created = await createRecords<T>({
    token: options.token,
    baseId: options.baseId,
    tableId: options.tableId,
    records: [{ fields: options.fields }]
  });
  const record = created[0];
  if (!record) {
    throw new Error('Airtable create returned no record');
  }
  return record;
}

export async function createRecords<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  records: Array<{ fields: Record<string, unknown> }>;
}): Promise<AirtableRecord<T>[]> {
  const created: AirtableRecord<T>[] = [];
  for (let i = 0; i < options.records.length; i += 10) {
    const chunk = options.records.slice(i, i + 10);
    const response = await airtableFetch(
      `/${options.baseId}/${encodePath(options.tableId)}`,
      {
        method: 'POST',
        token: options.token,
        body: JSON.stringify({ records: chunk, typecast: true })
      }
    );
    const body = await parseJson<{ records: AirtableRecord<T>[] }>(response);
    created.push(...body.records);
  }
  return created;
}

export async function updateRecord<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  recordId: string;
  fields: Record<string, unknown>;
}): Promise<AirtableRecord<T>> {
  const updated = await updateRecords<T>({
    token: options.token,
    baseId: options.baseId,
    tableId: options.tableId,
    records: [{ id: options.recordId, fields: options.fields }]
  });
  const record = updated[0];
  if (!record) {
    throw new Error('Airtable update returned no record');
  }
  return record;
}

export async function updateRecords<T extends Record<string, unknown> = Record<string, unknown>>(options: {
  token: string;
  baseId: string;
  tableId: string;
  records: Array<{ id: string; fields: Record<string, unknown> }>;
}): Promise<AirtableRecord<T>[]> {
  const updated: AirtableRecord<T>[] = [];
  for (let i = 0; i < options.records.length; i += 10) {
    const chunk = options.records.slice(i, i + 10);
    const response = await airtableFetch(
      `/${options.baseId}/${encodePath(options.tableId)}`,
      {
        method: 'PATCH',
        token: options.token,
        body: JSON.stringify({ records: chunk, typecast: true })
      }
    );
    const body = await parseJson<{ records: AirtableRecord<T>[] }>(response);
    updated.push(...body.records);
  }
  return updated;
}

export async function deleteRecord(options: {
  token: string;
  baseId: string;
  tableId: string;
  recordId: string;
}): Promise<void> {
  const response = await airtableFetch(
    `/${options.baseId}/${encodePath(options.tableId)}/${options.recordId}`,
    { method: 'DELETE', token: options.token }
  );
  await parseJson(response);
}

export async function listBaseTables(options: { token: string; baseId: string }): Promise<
  Array<{
    id: string;
    name: string;
    primaryFieldId?: string;
    fields: Array<{ id: string; name: string; type: string }>;
    views?: Array<{ id: string; name: string; type: string }>;
  }>
> {
  const response = await airtableFetch(`/meta/bases/${options.baseId}/tables`, {
    method: 'GET',
    token: options.token
  });
  const body = await parseJson<{
    tables: Array<{
      id: string;
      name: string;
      primaryFieldId?: string;
      fields: Array<{ id: string; name: string; type: string }>;
      views?: Array<{ id: string; name: string; type: string }>;
    }>;
  }>(response);
  return body.tables;
}
