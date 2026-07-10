// POST /api/amend {id, text} 改一行 · {id, delete: true} 删一行 — 只对未归档(committed=0)的行有效.
import { requireAccess } from '../_lib/auth.js';
import { json } from '../_lib/day.js';

export async function onRequestPost(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;

  const body = await context.request.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return json({ error: 'id is required' }, 400);

  let result;
  if (body.delete === true) {
    result = await context.env.EJ_DB.prepare(
      'UPDATE lines SET deleted = 1, amended_at = ? WHERE id = ? AND committed = 0'
    )
      .bind(new Date().toISOString(), id)
      .run();
  } else {
    const text = body.text?.trim();
    if (!text) return json({ error: 'text or delete:true is required' }, 400);
    result = await context.env.EJ_DB.prepare(
      'UPDATE lines SET text = ?, amended_at = ? WHERE id = ? AND committed = 0 AND deleted = 0'
    )
      .bind(text, new Date().toISOString(), id)
      .run();
  }
  if (result.meta.changes === 0) return json({ error: 'no editable line with that id' }, 404);
  return json({ ok: true, id });
}
