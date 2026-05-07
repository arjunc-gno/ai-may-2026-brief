export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/download') {
      const referer = request.headers.get('referer') || '';
      const ua = request.headers.get('user-agent') || '';
      console.log(JSON.stringify({
        event: 'newsletter_pdf_download_click',
        path: url.pathname,
        referer,
        ua,
        ts: new Date().toISOString()
      }));

      return Response.redirect(`${url.origin}/ai-development-may-2026-impact-brief.pdf?download=1`, 302);
    }

    return env.ASSETS.fetch(request);
  }
}
