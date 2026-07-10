// Cloudflare Access 门禁: Access 放行的请求会带 Cf-Access-Jwt-Assertion 头,
// 这里对它做真实验签(team certs + RS256 + aud + exp). 通过返回 null, 否则返回 401 Response.
// 本地开发(wrangler pages dev)用 .dev.vars 里的 DEV_BYPASS=1 跳过 — 生产环境永远不配这个变量.
// 上线要配的环境变量: ACCESS_TEAM_DOMAIN(如 ender.cloudflareaccess.com)、ACCESS_AUD(Access 应用的 Application Audience Tag).
import { json } from './day.js';

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function requireAccess({ request, env }) {
  if (env.DEV_BYPASS === '1') return null;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return json({ error: 'access not configured' }, 500);

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return json({ error: 'missing Access JWT' }, 401);

  try {
    const [h64, p64, s64] = token.split('.');
    const header = JSON.parse(new TextDecoder().decode(b64url(h64)));
    const payload = JSON.parse(new TextDecoder().decode(b64url(p64)));

    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return json({ error: 'aud mismatch' }, 401);
    if (payload.exp * 1000 < Date.now()) return json({ error: 'token expired' }, 401);

    const certs = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`).then((r) => r.json());
    const jwk = certs.keys.find((k) => k.kid === header.kid);
    if (!jwk) return json({ error: 'unknown key id' }, 401);

    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      b64url(s64),
      new TextEncoder().encode(`${h64}.${p64}`)
    );
    if (!ok) return json({ error: 'bad signature' }, 401);
    return null;
  } catch {
    return json({ error: 'jwt verification failed' }, 401);
  }
}
