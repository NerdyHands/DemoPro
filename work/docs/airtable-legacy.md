# Airtable inspect notes

Shared URL: https://airtable.com/appBDw3qjn76qICKH/tblSQLnizZs73xVd8/viwcmic8TToaIPBm0?blocks=hide

- Base: `appBDw3qjn76qICKH`
- Open table: `tblSQLnizZs73xVd8` — mixed/legacy. Do not write new CRM here.
- Open view: `viwcmic8TToaIPBm0`

`work/` auth was not wired to this table. New tables in this same base: `Admins`, `Customers`, `Estimates`, `Contracts`.

Field names on the mixed table were not readable without `AIRTABLE_TOKEN` (Airtable login wall). After adding a token:

```bash
cd work
npm run inspect:airtable
npm run setup:airtable
```

`setup:airtable` creates the improved tables if missing and renames `tblSQLnizZs73xVd8` to **Legacy Mixed**.
