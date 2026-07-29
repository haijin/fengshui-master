/**
 * Cloudflare Pages catch-all — reverse proxy to the backing Next.js app.
 *
 * Any request that doesn't match a more specific function (e.g. /api/track-visit)
 * is forwarded to ORIGIN with the original method, headers, and body.
 */

const ORIGIN = "http://origin.fengshuimaster.com:3009";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const target = ORIGIN + url.pathname + url.search;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(ORIGIN).host);
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
  }

  return fetch(target, init);
}
