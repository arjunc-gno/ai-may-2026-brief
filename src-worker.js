const PDF_PATH = '/ai-development-may-2026-impact-brief.pdf';
const MAX_RECENT_EVENTS = 50;

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {})
    }
  });
}

function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || '';
}

function anonymizedIpHash(ip) {
  // Not cryptographic; just enough to avoid storing raw IPs while spotting repeats.
  let hash = 2166136261;
  for (let i = 0; i < ip.length; i += 1) {
    hash ^= ip.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ip ? (hash >>> 0).toString(16) : null;
}

async function ensureSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pdf_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      path TEXT NOT NULL,
      referer TEXT,
      ua TEXT,
      country TEXT,
      ip_hash TEXT
    )
  `).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_pdf_downloads_ts ON pdf_downloads(ts DESC)').run();
}

async function recordDownload(request, env, url) {
  const event = {
    event: 'newsletter_pdf_download_click',
    path: url.pathname,
    referer: request.headers.get('referer') || null,
    ua: request.headers.get('user-agent') || null,
    country: request.cf?.country || null,
    ipHash: anonymizedIpHash(clientIp(request)),
    ts: new Date().toISOString()
  };

  console.log(JSON.stringify(event));

  if (!env.DB) {
    console.warn('DB D1 binding is not configured; download was logged but not counted.');
    return { counted: false, event };
  }

  await ensureSchema(env);
  await env.DB.prepare(`
    INSERT INTO pdf_downloads (ts, path, referer, ua, country, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(event.ts, event.path, event.referer, event.ua, event.country, event.ipHash).run();

  return { counted: true, event };
}

async function stats(request, env) {
  if (!env.DB) {
    return json({ error: 'DB D1 binding is not configured' }, { status: 503 });
  }

  const requiredToken = env.STATS_TOKEN;
  if (requiredToken) {
    const suppliedToken = new URL(request.url).searchParams.get('token') || request.headers.get('x-stats-token');
    if (suppliedToken !== requiredToken) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await ensureSchema(env);
  const totalRow = await env.DB.prepare('SELECT COUNT(*) AS total FROM pdf_downloads').first();
  const recentRows = await env.DB.prepare(`
    SELECT ts, path, referer, ua, country, ip_hash AS ipHash
    FROM pdf_downloads
    ORDER BY ts DESC
    LIMIT ?
  `).bind(MAX_RECENT_EVENTS).all();

  return json({
    newsletter: 'May 2026 AI Impact Brief',
    pdf: PDF_PATH,
    totalDownloads: Number(totalRow?.total || 0),
    recentDownloads: recentRows.results || [],
    checkedAt: new Date().toISOString()
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/download') {
      ctx.waitUntil(recordDownload(request, env, url));
      return Response.redirect(`${url.origin}${PDF_PATH}?download=1`, 302);
    }

    if (url.pathname === '/stats') {
      return stats(request, env);
    }

    if (url.pathname.startsWith('/.')) {
      return new Response('Not found', { status: 404 });
    }

    return env.ASSETS.fetch(request);
  }
};
