# Airtable inspect notes

Shared URL: https://airtable.com/appBDw3qjn76qICKH/tblSQLnizZs73xVd8/viwcmic8TToaIPBm0?blocks=hide

- Base: `appBDw3qjn76qICKH`
- Open table `tblSQLnizZs73xVd8` is **Leads** (Phone, Lead Name, Email, Business Line, Status, scoring, next action). Leave it alone.
- Open view: `viwcmic8TToaIPBm0` (Grid view)
- Existing **Contracts** in this base is a different schema (Client Name, attachments). CRM setup creates **CRM Contracts** instead of overwriting it.

If `inspect:airtable` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, set `AIRTABLE_TLS_ALLOW_INVALID=true` in `work/.env.local`.

```bash
cd work
npm run inspect:airtable
npm run setup:airtable
```
