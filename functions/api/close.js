// POST /api/close {day?, energy?, dry_run?} — close-the-day:
// 把该逻辑日的行编成月文件的一节, 经 GitHub contents API 追加提交(server 持有 PAT),
// 成功后行打 committed=1. 没配 GITHUB_TOKEN 或 dry_run=true 时只返回将要提交的 markdown.
// 注意: carry-over 分诊是 console 前端的闸(pendingCarry), 后端不重复裁决.
import { requireAccess } from '../_lib/auth.js';
import { json, logicalDay } from '../_lib/day.js';
import { composeDay } from '../_lib/md.js';

const GH_API = 'https://api.github.com';

export async function onRequestPost(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;

  const body = (await context.request.json().catch(() => null)) ?? {};
  const day = body.day ?? logicalDay();
  const energy = Number(body.energy) || undefined;

  const { results: rows } = await context.env.EJ_DB.prepare(
    'SELECT id, type, text FROM lines WHERE day = ? AND deleted = 0 AND committed = 0 ORDER BY id'
  )
    .bind(day)
    .all();
  if (!rows.length) return json({ error: `nothing to close for ${day}` }, 409);

  const section = composeDay(day, rows, energy);
  const token = context.env.GITHUB_TOKEN;
  if (body.dry_run === true || !token) {
    return json({ mode: 'dry-run', day, lines: rows.length, md: section });
  }

  const repo = context.env.GITHUB_REPO ?? 'Ender-Jones/Ender-s-Blog';
  const path = `src/content/worklogs/${day.slice(0, 7)}.md`;
  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'enders-blog-console',
  };

  // 读现有月文件(可能不存在 → 起新档)
  const getRes = await fetch(`${GH_API}/repos/${repo}/contents/${path}`, { headers });
  let content = '';
  let sha;
  if (getRes.ok) {
    const file = await getRes.json();
    sha = file.sha;
    content = new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
    if (content.includes(`## ${day}\n`)) return json({ error: `${day} already closed in ${path}` }, 409);
  } else if (getRes.status === 404) {
    const month = day.slice(0, 7);
    content = `---\ntitle: "Work Log: ${month}"\ndate: ${month}-01T00:00:00+09:00\ndescription: ""\n---\n`;
  } else {
    return json({ error: `github read failed (${getRes.status})` }, 502);
  }

  const updated = content.replace(/\s*$/, '\n') + section;
  const putRes = await fetch(`${GH_API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `worklog: close ${day}`,
      content: btoa(String.fromCharCode(...new TextEncoder().encode(updated))),
      sha,
      committer: { name: 'Ender-Jones', email: 'enderjones1872@gmail.com' },
    }),
  });
  if (!putRes.ok) return json({ error: `github commit failed (${putRes.status})`, detail: await putRes.text() }, 502);
  const commit = (await putRes.json()).commit?.sha;

  await context.env.EJ_DB.prepare('UPDATE lines SET committed = 1 WHERE day = ? AND deleted = 0')
    .bind(day)
    .run();
  return json({ ok: true, day, lines: rows.length, commit, path });
}
