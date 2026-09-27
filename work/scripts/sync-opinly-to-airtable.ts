import { createOpinlyClient } from '@opinly/backend';
import { imageUrl, renderToHtml } from '@opinly/shared';
import {
  createRecords,
  listBaseTables,
  listRecords,
  updateRecords,
  type AirtableRecord
} from '../src/lib/airtable';
import { loadScriptEnv } from './load-env';

loadScriptEnv();

const BLOG_BASE_ID_DEFAULT = 'appN9vpPDhXfWVwB3';
const BLOG_TABLE_ID_DEFAULT = 'tblAKTg8pq8RAtHKT';

const REQUIRED_FIELDS = [
  'Name',
  'Company',
  'Slug',
  'Excerpt',
  'Content HTML',
  'Author',
  'Tags',
  'Published At',
  'Updated At',
  'Cover URL',
  'Cover File Key',
  'Meta Title',
  'Meta Description',
  'Synced At',
  'Opinly Key'
] as const;

type CompanyConfig = { name: string; apiKey: string };

type BlogFields = {
  Name?: string;
  Company?: string;
  Slug?: string;
  Excerpt?: string;
  'Content HTML'?: string;
  Author?: string;
  Tags?: string;
  'Published At'?: string;
  'Updated At'?: string;
  'Cover URL'?: string;
  'Cover File Key'?: string;
  'Meta Title'?: string;
  'Meta Description'?: string;
  'Synced At'?: string;
  'Opinly Key'?: string;
};

type OpinlyPost = {
  publicId?: string;
  slug?: string;
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  firstPublishedAt?: string;
  lastPublishedAt?: string;
  modifiedAt?: string;
  content?: unknown;
  author?: { name?: string };
  category?: { name?: string; slug?: string };
  tags?: Array<{ name?: string; slug?: string }>;
  titleFile?: { fileKey?: string };
  image?: { fileKey?: string };
};

/** Opinly can list the same slug more than once; keep the newest publish date. */
function dedupeListPostsBySlug(posts: OpinlyPost[]): OpinlyPost[] {
  const bySlug = new Map<string, OpinlyPost>();
  for (const post of posts) {
    const slug = (post.slug || '').trim();
    if (!slug) continue;
    const prev = bySlug.get(slug);
    if (!prev) {
      bySlug.set(slug, post);
      continue;
    }
    const prevAt = prev.firstPublishedAt || prev.lastPublishedAt || '';
    const nextAt = post.firstPublishedAt || post.lastPublishedAt || '';
    if (nextAt >= prevAt) bySlug.set(slug, post);
  }
  return Array.from(bySlug.values());
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let companyFilter: string | undefined;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--company=')) {
      companyFilter = arg.slice('--company='.length).trim().toLowerCase();
    }
  }
  return { dryRun, companyFilter };
}

function parseCompanies(raw: string): CompanyConfig[] {
  const companies: CompanyConfig[] = [];
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf(':');
    if (eq < 1) {
      throw new Error(`Invalid OPINLY_COMPANIES entry (expected name:sk-…): ${trimmed.slice(0, 24)}`);
    }
    const name = trimmed.slice(0, eq).trim().toLowerCase();
    const apiKey = trimmed.slice(eq + 1).trim();
    if (!name || !apiKey) {
      throw new Error(`Invalid OPINLY_COMPANIES entry: ${name || '(missing name)'}`);
    }
    companies.push({ name, apiKey });
  }
  return companies;
}

function resolveImagesPrefix(): string | null {
  const raw = (process.env.OPINLY_IMAGES_PREFIX || '').trim().replace(/\/$/, '');
  if (raw) return raw;
  const ns = (process.env.OPINLY_CDN_NAMESPACE || '').trim();
  if (ns) return `https://cdn.opinly.ai/${ns}`;
  return null;
}

function toDateOnly(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined;
}

function tagNamesFromPost(post: OpinlyPost): string[] {
  const names = new Set<string>();
  if (post.category?.name) names.add(post.category.name);
  else if (post.category?.slug) names.add(post.category.slug);
  for (const tag of post.tags || []) {
    if (tag?.name) names.add(tag.name);
    else if (tag?.slug) names.add(tag.slug);
  }
  return Array.from(names);
}

function coverFileKey(post: OpinlyPost): string {
  return post.titleFile?.fileKey || post.image?.fileKey || '';
}

function coverUrl(fileKey: string, imagesPrefix: string | null): string {
  if (!fileKey || !imagesPrefix) return '';
  try {
    return imageUrl(fileKey, { imagesPrefix }) || `${imagesPrefix}/${fileKey}`;
  } catch {
    return `${imagesPrefix}/${fileKey}`;
  }
}

function mapPostToFields(
  company: string,
  post: OpinlyPost,
  imagesPrefix: string | null,
  syncedAt: string
): BlogFields {
  const slug = (post.slug || '').trim();
  const fileKey = coverFileKey(post);
  let contentHtml = '';
  if (post.content) {
    try {
      contentHtml =
        renderToHtml(post.content as never, {
          config: { imagesPrefix: imagesPrefix || 'https://cdn.opinly.ai' }
        }) || '';
    } catch {
      contentHtml = '';
    }
  }

  // Airtable long text practical limit; keep sync from failing on huge posts.
  const maxHtml = 95_000;
  if (contentHtml.length > maxHtml) {
    contentHtml = `${contentHtml.slice(0, maxHtml)}\n\n<!-- truncated -->`;
  }

  const fields: BlogFields = {
    Name: post.title || slug || 'Untitled',
    Company: company,
    Slug: slug,
    Excerpt: post.description || post.metaDescription || '',
    'Content HTML': contentHtml,
    Author: post.author?.name || '',
    Tags: tagNamesFromPost(post).join(', '),
    'Cover File Key': fileKey,
    'Meta Title': post.metaTitle || post.title || '',
    'Meta Description': post.metaDescription || post.description || '',
    'Synced At': syncedAt,
    'Opinly Key': `${company}:${slug}`
  };

  const published = toDateOnly(post.firstPublishedAt || post.lastPublishedAt);
  const updated = toDateOnly(post.modifiedAt || post.lastPublishedAt || post.firstPublishedAt);
  if (published) fields['Published At'] = published;
  if (updated) fields['Updated At'] = updated;

  const url = coverUrl(fileKey, imagesPrefix);
  if (url) fields['Cover URL'] = url;

  return fields;
}

async function fetchAllPosts(opinly: ReturnType<typeof createOpinlyClient>): Promise<OpinlyPost[]> {
  const all: OpinlyPost[] = [];
  let cursor: string | undefined;
  do {
    const page = await opinly.posts({
      limit: 50,
      cursor,
      sort: 'newest'
    });
    const batch = Array.isArray(page?.data) ? (page.data as OpinlyPost[]) : [];
    all.push(...batch);
    cursor = page?.has_more ? page.next_cursor || undefined : undefined;
  } while (cursor);
  return all;
}

async function main() {
  const { dryRun, companyFilter } = parseArgs(process.argv.slice(2));

  const token = (process.env.AIRTABLE_TOKEN || '').trim();
  if (!token) {
    throw new Error('AIRTABLE_TOKEN is required in work/.env.local');
  }

  const baseId = (process.env.AIRTABLE_BLOG_BASE_ID || BLOG_BASE_ID_DEFAULT).trim();
  const tableId = (process.env.AIRTABLE_BLOG_TABLE_ID || BLOG_TABLE_ID_DEFAULT).trim();
  const companiesRaw = (process.env.OPINLY_COMPANIES || '').trim();
  if (!companiesRaw) {
    throw new Error('OPINLY_COMPANIES is required (name:sk-…;name:sk-…)');
  }

  let companies = parseCompanies(companiesRaw);
  if (companyFilter) {
    companies = companies.filter(c => c.name === companyFilter);
    if (companies.length === 0) {
      throw new Error(`No company matching --company=${companyFilter}`);
    }
  }

  const tables = await listBaseTables({ token, baseId });
  const table = tables.find(t => t.id === tableId);
  if (!table) {
    throw new Error(`Blog table ${tableId} not found in base ${baseId}. Run npm run setup:airtable-blog first.`);
  }
  const fieldNames = new Set(table.fields.map(f => f.name));
  const missing = REQUIRED_FIELDS.filter(name => !fieldNames.has(name));
  if (missing.length > 0) {
    console.warn(
      `Warning: missing fields (${missing.join(', ')}). Run npm run setup:airtable-blog before syncing.`
    );
  }

  const imagesPrefix = resolveImagesPrefix();
  console.log(`Syncing Opinly → Airtable${dryRun ? ' (dry-run)' : ''}`);
  console.log(`  base=${baseId} table=${table.name} (${tableId})`);
  console.log(`  companies=${companies.map(c => c.name).join(', ')}`);
  console.log(`  imagesPrefix=${imagesPrefix || '(none — Cover File Key only)'}`);

  const existing = await listRecords<BlogFields>({
    token,
    baseId,
    tableId,
    fields: ['Opinly Key', 'Slug', 'Company', 'Name']
  });
  const byKey = new Map<string, AirtableRecord<BlogFields>>();
  for (const record of existing) {
    const key = (record.fields['Opinly Key'] || '').trim();
    if (key) byKey.set(key, record);
  }
  console.log(`  existing Airtable records with Opinly Key: ${byKey.size}`);

  const syncedAt = new Date().toISOString();
  let listed = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of companies) {
    console.log(`\n→ ${company.name}`);
    const opinly = createOpinlyClient({ apiKey: company.apiKey });
    let listPosts: OpinlyPost[] = [];
    try {
      listPosts = await fetchAllPosts(opinly);
    } catch (err) {
      errors += 1;
      console.error(`  failed to list posts:`, err instanceof Error ? err.message : err);
      continue;
    }
    const uniquePosts = dedupeListPostsBySlug(listPosts);
    if (uniquePosts.length < listPosts.length) {
      console.log(
        `  listed ${listPosts.length} post(s) (${listPosts.length - uniquePosts.length} duplicate slug(s) dropped)`
      );
    } else {
      console.log(`  listed ${listPosts.length} post(s)`);
    }
    listed += uniquePosts.length;

    const toCreate: Array<{ fields: Record<string, unknown> }> = [];
    const toUpdateById = new Map<string, { id: string; fields: Record<string, unknown> }>();

    for (const item of uniquePosts) {
      if (!item?.slug) {
        skipped += 1;
        continue;
      }
      let full: OpinlyPost | null = null;
      try {
        full = (await opinly.post(item.slug)) as OpinlyPost | null;
      } catch (err) {
        errors += 1;
        console.error(`  fetch failed ${item.slug}:`, err instanceof Error ? err.message : err);
        continue;
      }
      if (!full?.slug) {
        skipped += 1;
        console.warn(`  skip missing full post: ${item.slug}`);
        continue;
      }

      const fields = mapPostToFields(company.name, full, imagesPrefix, syncedAt);
      const key = fields['Opinly Key'] || '';
      const existingRecord = byKey.get(key);

      if (dryRun) {
        console.log(`  [dry-run] ${existingRecord ? 'update' : 'create'} ${key}`);
        if (existingRecord) updated += 1;
        else created += 1;
        continue;
      }

      if (existingRecord) {
        toUpdateById.set(existingRecord.id, {
          id: existingRecord.id,
          fields: fields as Record<string, unknown>
        });
      } else {
        toCreate.push({ fields: fields as Record<string, unknown> });
      }
    }

    if (!dryRun && toCreate.length > 0) {
      const createdRecords = await createRecords<BlogFields>({
        token,
        baseId,
        tableId,
        records: toCreate
      });
      for (const record of createdRecords) {
        const key = (record.fields['Opinly Key'] || '').trim();
        if (key) byKey.set(key, record);
      }
      created += createdRecords.length;
      console.log(`  created ${createdRecords.length}`);
    }

    const toUpdate = Array.from(toUpdateById.values());
    if (!dryRun && toUpdate.length > 0) {
      const updatedRecords = await updateRecords<BlogFields>({
        token,
        baseId,
        tableId,
        records: toUpdate
      });
      updated += updatedRecords.length;
      console.log(`  updated ${updatedRecords.length}`);
    }
  }

  console.log('\nDone.');
  console.log(`  listed=${listed} created=${created} updated=${updated} skipped=${skipped} errors=${errors}`);
}

main().catch(error => {
  console.error(error);
  if (
    String((error as { cause?: { code?: string }; code?: string })?.cause?.code || '').includes(
      'UNABLE_TO_VERIFY'
    ) ||
    String(error instanceof Error ? error.message : error).includes('certificate')
  ) {
    console.error('Tip: set AIRTABLE_TLS_ALLOW_INVALID=true or NODE_TLS_REJECT_UNAUTHORIZED=0 for local TLS inspection.');
  }
  process.exit(1);
});
