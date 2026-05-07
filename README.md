# May 2026 AI Impact Brief

A branded G-Nosis Systems landing page for the May 2026 AI Impact Brief.

Published via Cloudflare Workers static assets at https://ai.g-nosis.com.

## Download counter

PDF buttons route through `/download`. The Worker inserts one row into a Cloudflare D1 table and redirects to the PDF.

Stats endpoint:

```text
https://ai.g-nosis.com/stats?token=<STATS_TOKEN>
```

Setup/deploy steps when Cloudflare auth is available:

```bash
npx wrangler d1 create ai_may_2026_brief_stats
# copy the returned database_id into wrangler.toml
npx wrangler secret put STATS_TOKEN
npx wrangler deploy
```

The Worker creates the table automatically on first download/stats request. Stored fields:

- timestamp
- path
- referer
- user-agent
- Cloudflare country
- anonymized IP hash, not raw IP

Stats response includes `totalDownloads` and the latest 50 download events.
