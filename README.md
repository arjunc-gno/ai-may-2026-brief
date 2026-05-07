# May 2026 AI Impact Brief

A branded G-Nosis Systems landing page for the May 2026 AI Impact Brief.

Published via Cloudflare Workers static assets at https://ai.g-nosis.com.

## Download counter

PDF buttons route through `/download`. The Worker inserts one row into a Cloudflare D1 table and redirects to the PDF.

Stats endpoint:

```text
https://ai.g-nosis.com/stats?token=<STATS_TOKEN>
```

On-demand check from the repo:

```bash
./check-download-stats.sh | python3 -m json.tool
```

The script reads `STATS_TOKEN` from macOS Keychain entry:

```text
Service: G-Nosis API: ai-may-2026-brief-stats-token
Account: arjunc@g-nosis.com
```

Cloudflare resources:

```text
Account ID: 8a9b68fe08ceae5d4e5826c6f25dcb31
D1 DB: ai_may_2026_brief_stats
D1 database_id: cbd8a034-6023-42d9-86a7-b0d61914a320
Worker: ai-may-2026-brief
```

The Worker creates the table automatically on first download/stats request. Stored fields:

- timestamp
- path
- referer
- user-agent
- Cloudflare country
- anonymized IP hash, not raw IP

Stats response includes `totalDownloads` and the latest 50 download events.
