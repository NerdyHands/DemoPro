export function fieldValue(
  fields: Record<string, unknown>,
  ...aliases: string[]
): unknown {
  const entries = Object.entries(fields);
  for (const alias of aliases) {
    const exact = fields[alias];
    if (exact !== undefined && exact !== null && exact !== '') {
      return exact;
    }
    const match = entries.find(
      ([key]) => key.toLowerCase() === alias.toLowerCase()
    );
    if (match && match[1] !== undefined && match[1] !== null && match[1] !== '') {
      return match[1];
    }
  }
  return undefined;
}

export function fieldString(
  fields: Record<string, unknown>,
  ...aliases: string[]
): string {
  const value = fieldValue(fields, ...aliases);
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0].trim();
  }
  return '';
}

export function fieldBool(
  fields: Record<string, unknown>,
  ...aliases: string[]
): boolean {
  const value = fieldValue(fields, ...aliases);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  }
  return false;
}

export function extractEmail(fields: Record<string, unknown>): string {
  const direct = fieldString(fields, 'Email', 'email', 'Admin Email');
  if (direct.includes('@')) return direct.toLowerCase();

  const name = fieldString(fields, 'Name', 'name');
  if (name.includes('@')) return name.toLowerCase();

  return '';
}

export function fieldNumber(
  fields: Record<string, unknown>,
  ...aliases: string[]
): number {
  const value = fieldValue(fields, ...aliases);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function fieldLinkedIds(
  fields: Record<string, unknown>,
  ...aliases: string[]
): string[] {
  const value = fieldValue(fields, ...aliases);
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

export function firstLinkedId(
  fields: Record<string, unknown>,
  ...aliases: string[]
): string {
  return fieldLinkedIds(fields, ...aliases)[0] ?? '';
}
