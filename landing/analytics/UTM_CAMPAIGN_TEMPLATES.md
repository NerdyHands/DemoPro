# UTM Campaign Templates — Mr Demo Pro

Apply these to **inbound links** pointing to mrdemopro.com. UTMs are captured on page load and persisted in `sessionStorage` for the session.

## Base format

```
https://mrdemopro.com/{landing-path}/?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

## Google Ads (Search / PMax final URLs)

| Service | Example URL |
|---------|-------------|
| Interior demo | `https://mrdemopro.com/services/interior-demo/?utm_source=google&utm_medium=cpc&utm_campaign=hampton-demo-interior&utm_content={creative}` |
| Shed removal | `https://mrdemopro.com/services/shed-removal/?utm_source=google&utm_medium=cpc&utm_campaign=shed_removal&utm_content={creative}` |
| Deck removal | `https://mrdemopro.com/services/deck-removal/?utm_source=google&utm_medium=cpc&utm_campaign=deck_removal&utm_content={creative}` |
| Fence removal | `https://mrdemopro.com/services/fence-removal/?utm_source=google&utm_medium=cpc&utm_campaign=fence_removal&utm_content={creative}` |
| Homepage | `https://mrdemopro.com/?utm_source=google&utm_medium=cpc&utm_campaign=hampton-demo-general&utm_content={creative}` |

Replace `{creative}` with ad variant name (e.g. `headline-a`, `sitelink-prices`).

## GoHighLevel email / SMS

| Channel | Example |
|---------|---------|
| Email | `utm_source=ghl&utm_medium=email&utm_campaign=quote-followup&utm_content=week1` |
| SMS | `utm_source=ghl&utm_medium=sms&utm_campaign=missed-call&utm_content=auto-reply` |

## Craigslist / organic posts

| Channel | Example |
|---------|---------|
| Craigslist | `utm_source=craigslist&utm_medium=organic&utm_campaign=hampton-shed-removal&utm_content=post-june` |

## Campaign naming reference

- `hampton-demo-interior`
- `fence_removal`
- `deck_removal`
- `shed_removal`
- `cleanout`
- `garage_demolition`
- `hampton-demo-general`

## Verification

After deploying with UTMs, open GTM Preview → navigate with UTM URL → confirm `page_metadata` event includes `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
