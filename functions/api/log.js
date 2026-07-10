// GET  /api/log[?day=YYYY-MM-DD] — 该逻辑日的未归档行(console 恢复现场用)
// POST /api/log {type, text}     — 追加一行到当日工作区
import { requireAccess } from '../_lib/auth.js';
import { json, logicalDay } from '../_lib/day.js';
import { TYPES } from '../_lib/md.js';

export async function onRequestGet(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;

  const day = new URL(context.request.url).searchParams.get('day') ?? logicalDay();
  const { results } = await context.env.EJ_DB.prepare(
    'SELECT id, day, type, text, created_at, amended_at FROM lines WHERE day = ? AND deleted = 0 AND committed = 0 ORDER BY id'
  )
    .bind(day)
    .all();
  return json({ day, lines: results });
}

export async function onRequestPost(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;

  const body = await context.request.json().catch(() => null);
  const text = body?.text?.trim();
  const type = body?.type ?? 'done';
  if (!text) return json({ error: 'text is required' }, 400);
  if (!TYPES.includes(type)) return json({ error: `type must be one of ${TYPES.join('|')}` }, 400);

  const day = logicalDay();
  const { meta } = await context.env.EJ_DB.prepare(
    'INSERT INTO lines (day, type, text, created_at) VALUES (?, ?, ?, ?)'
  )
    .bind(day, type, text, new Date().toISOString())
    .run();
  return json({ ok: true, id: meta.last_row_id, day }, 201);
}
