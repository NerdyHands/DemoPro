/** Static process.env.* so Next.js inlines Amplify/.env.production values at build. */
function read(value: string | undefined): string {
  return (value ?? '').trim();
}

export const CRM_BASE_ID_DEFAULT = 'appBDw3qjn76qICKH';
export const LEGACY_MIXED_TABLE_ID = 'tblSQLnizZs73xVd8';
export const LEGACY_MIXED_VIEW_ID = 'viwcmic8TToaIPBm0';

export type Env = {
  AIRTABLE_TOKEN: string;
  AIRTABLE_ADMINS_BASE_ID: string;
  AIRTABLE_ADMINS_TABLE_ID: string;
  AIRTABLE_ADMINS_VIEW_ID: string;
  AIRTABLE_CRM_BASE_ID: string;
  AIRTABLE_CUSTOMERS_TABLE_ID: string;
  AIRTABLE_ESTIMATES_TABLE_ID: string;
  AIRTABLE_CONTRACTS_TABLE_ID: string;
  AIRTABLE_LEGACY_TABLE_ID: string;
  AIRTABLE_TLS_ALLOW_INVALID: boolean;
  ADMIN_SESSION_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  AIRTABLE_LEADS_BASE_ID: string;
  N8N_BASE_URL: string;
  N8N_LEADS_WEBHOOK_URL: string;
  N8N_WEBHOOK_SECRET: string;
  OPS_API_URL: string;
  OPS_SERVICE_TOKEN: string;
};

export function getEnv(): Env {
  const adminsBase = read(process.env.AIRTABLE_ADMINS_BASE_ID) || CRM_BASE_ID_DEFAULT;
  return {
    AIRTABLE_TOKEN: read(process.env.AIRTABLE_TOKEN),
    AIRTABLE_ADMINS_BASE_ID: adminsBase,
    AIRTABLE_ADMINS_TABLE_ID: read(process.env.AIRTABLE_ADMINS_TABLE_ID) || 'Admins',
    AIRTABLE_ADMINS_VIEW_ID: read(process.env.AIRTABLE_ADMINS_VIEW_ID),
    AIRTABLE_CRM_BASE_ID: read(process.env.AIRTABLE_CRM_BASE_ID) || adminsBase,
    AIRTABLE_CUSTOMERS_TABLE_ID: read(process.env.AIRTABLE_CUSTOMERS_TABLE_ID) || 'Customers',
    AIRTABLE_ESTIMATES_TABLE_ID: read(process.env.AIRTABLE_ESTIMATES_TABLE_ID) || 'Estimates',
    AIRTABLE_CONTRACTS_TABLE_ID: read(process.env.AIRTABLE_CONTRACTS_TABLE_ID) || 'Contracts',
    AIRTABLE_LEGACY_TABLE_ID: read(process.env.AIRTABLE_LEGACY_TABLE_ID) || LEGACY_MIXED_TABLE_ID,
    AIRTABLE_TLS_ALLOW_INVALID: read(process.env.AIRTABLE_TLS_ALLOW_INVALID) === 'true',
    ADMIN_SESSION_SECRET: read(process.env.ADMIN_SESSION_SECRET),
    NEXT_PUBLIC_APP_URL: read(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3002',
    RESEND_API_KEY: read(process.env.RESEND_API_KEY),
    RESEND_FROM_EMAIL: read(process.env.RESEND_FROM_EMAIL) || 'no-reply@mrdemopro.com',
    AIRTABLE_LEADS_BASE_ID: read(process.env.AIRTABLE_LEADS_BASE_ID),
    N8N_BASE_URL: read(process.env.N8N_BASE_URL) || 'https://nerdyhands.app.n8n.cloud',
    N8N_LEADS_WEBHOOK_URL: read(process.env.N8N_LEADS_WEBHOOK_URL),
    N8N_WEBHOOK_SECRET: read(process.env.N8N_WEBHOOK_SECRET),
    OPS_API_URL: read(process.env.OPS_API_URL),
    OPS_SERVICE_TOKEN: read(process.env.OPS_SERVICE_TOKEN)
  };
}

export type ConfigStatus = {
  airtableToken: boolean;
  adminsBase: boolean;
  adminsTable: boolean;
  adminsView: boolean;
  crmBase: boolean;
  customersTable: boolean;
  estimatesTable: boolean;
  contractsTable: boolean;
  sessionSecret: boolean;
  resend: boolean;
  fromEmail: boolean;
  appUrl: boolean;
  leadsBase: boolean;
  n8nWebhook: boolean;
  n8nSecret: boolean;
  opsApi: boolean;
  authReady: boolean;
  crmReady: boolean;
  leadGenReady: boolean;
  opsReady: boolean;
};

export function getConfigStatus(): ConfigStatus {
  const env = getEnv();
  const airtableToken = Boolean(env.AIRTABLE_TOKEN);
  const adminsBase = Boolean(env.AIRTABLE_ADMINS_BASE_ID);
  const adminsTable = Boolean(env.AIRTABLE_ADMINS_TABLE_ID);
  const adminsView = Boolean(env.AIRTABLE_ADMINS_VIEW_ID);
  const crmBase = Boolean(env.AIRTABLE_CRM_BASE_ID);
  const customersTable = Boolean(env.AIRTABLE_CUSTOMERS_TABLE_ID);
  const estimatesTable = Boolean(env.AIRTABLE_ESTIMATES_TABLE_ID);
  const contractsTable = Boolean(env.AIRTABLE_CONTRACTS_TABLE_ID);
  const sessionSecret = Boolean(env.ADMIN_SESSION_SECRET);
  const resend = Boolean(env.RESEND_API_KEY);
  const fromEmail = Boolean(env.RESEND_FROM_EMAIL);
  const appUrl = Boolean(env.NEXT_PUBLIC_APP_URL);
  const leadsBase = Boolean(env.AIRTABLE_LEADS_BASE_ID);
  const n8nWebhook = Boolean(env.N8N_LEADS_WEBHOOK_URL);
  const n8nSecret = Boolean(env.N8N_WEBHOOK_SECRET);
  const opsApi = Boolean(env.OPS_API_URL && env.OPS_SERVICE_TOKEN);

  return {
    airtableToken,
    adminsBase,
    adminsTable,
    adminsView,
    crmBase,
    customersTable,
    estimatesTable,
    contractsTable,
    sessionSecret,
    resend,
    fromEmail,
    appUrl,
    leadsBase,
    n8nWebhook,
    n8nSecret,
    opsApi,
    authReady: airtableToken && adminsBase && adminsTable && sessionSecret && resend,
    crmReady: airtableToken && crmBase && customersTable && estimatesTable && contractsTable,
    leadGenReady: leadsBase && n8nWebhook && n8nSecret,
    opsReady: opsApi
  };
}

export function assertAdminsConfigured(): Env {
  const env = getEnv();
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_ADMINS_BASE_ID || !env.AIRTABLE_ADMINS_TABLE_ID) {
    throw new AdminsNotConfiguredError();
  }
  return env;
}

export function assertCrmConfigured(): Env {
  const env = getEnv();
  if (
    !env.AIRTABLE_TOKEN ||
    !env.AIRTABLE_CRM_BASE_ID ||
    !env.AIRTABLE_CUSTOMERS_TABLE_ID ||
    !env.AIRTABLE_ESTIMATES_TABLE_ID ||
    !env.AIRTABLE_CONTRACTS_TABLE_ID
  ) {
    throw new CrmNotConfiguredError();
  }
  return env;
}

export class AdminsNotConfiguredError extends Error {
  constructor() {
    super('Admins base not configured');
    this.name = 'AdminsNotConfiguredError';
  }
}

export class CrmNotConfiguredError extends Error {
  constructor() {
    super('CRM base not configured');
    this.name = 'CrmNotConfiguredError';
  }
}
