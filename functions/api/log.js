// GET  /api/log                 — 当日现场: 今日 closed 标志 + 实际落笔日(已关→明日)的未归档行 + 漏关旧日清单
// GET  /api/log?day=YYYY-MM-DD  — 指定逻辑日的未归档行(补关流程恢复该日现场用)
// POST /api/log {type, text, day?} — 追加一行. 今日已关 → 自动落到下一逻辑日(关日即翻页);
//                                    day 只许指向未关的过去日(补关时回填漏记的行 / save point / public).
import { requireAccess } from '../_lib/auth.js';
import { json, logicalDay, shiftDay, isClosed } from '../_lib/day.js';
import { TYPES, normalizeType } from '../_lib/md.js';

const linesOf = (db, day) =>
  db
    .prepare('SELECT id, day, type, text, created_at, amended_at FROM lines WHERE day = ? AND deleted = 0 AND committed = 0 ORDER BY id')
    .bind(day)
    .all();

export async function onRequestGet(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;
  const db = context.env.EJ_DB;

  const param = new URL(context.request.url).searchParams.get('day');
  if (param) {
    const { results } = await linesOf(db, param);
    return json({ day: param, lines: results });
  }

  const today = logicalDay();
  const closed = await isClosed(db, today);
  const effectiveDay = closed ? shiftDay(today, 1) : today; // 关日即翻页: 关完之后的落笔日是明天
  const { results } = await linesOf(db, effectiveDay);
  // 漏关的旧日(忘了关就睡过 04:00): 前端顶部横幅从最旧的开始一天一天补关.
  // 已关过的日子要排除 — 旧模型时代"关日后又录入"留下的孤儿行不该触发补关(close 会 409).
  const { results: stale } = await db
    .prepare(
      'SELECT DISTINCT day FROM lines l WHERE day < ? AND deleted = 0 AND committed = 0 AND NOT EXISTS (SELECT 1 FROM lines c WHERE c.day = l.day AND c.committed = 1) ORDER BY day'
    )
    .bind(today)
    .all();
  // carry-over 实时源: 最近一个 < effectiveDay 且有已归档(committed) next 的日子及其 next 行 —
  // 直接读 D1, 不必等站点重建. 前端再与构建期快照(含手写历史的 next)取日期更新的一个.
  const carryDay = await db
    .prepare("SELECT MAX(day) AS d FROM lines WHERE type = 'next' AND deleted = 0 AND committed = 1 AND day < ?")
    .bind(effectiveDay)
    .first();
  let carry = null;
  if (carryDay?.d) {
    const { results: nx } = await db
      .prepare("SELECT text FROM lines WHERE type = 'next' AND deleted = 0 AND committed = 1 AND day = ? ORDER BY id")
      .bind(carryDay.d)
      .all();
    carry = { date: carryDay.d, texts: nx.map((r) => r.text) };
  }
  // last note 实时源: 最近一个已归档的日子 — 头部 "last note … · Nd ago" 不再等站点重建
  const last = await db.prepare('SELECT MAX(day) AS d FROM lines WHERE committed = 1 AND deleted = 0').first();
  return json({
    day: today,
    closed,
    effectiveDay,
    lines: results,
    staleDays: stale.map((r) => r.day),
    carry,
    lastClosed: last?.d ?? null,
  });
}

export async function onRequestPost(context) {
  const denied = await requireAccess(context);
  if (denied) return denied;
  const db = context.env.EJ_DB;

  const body = await context.request.json().catch(() => null);
  const text = body?.text?.trim();
  const type = normalizeType(body?.type ?? 'done');
  if (!text) return json({ error: 'text is required' }, 400);
  if (!TYPES.includes(type)) return json({ error: `type must be one of ${TYPES.join('|')}` }, 400);

  const today = logicalDay();
  let day = today;
  if (body.day) {
    // 显式指定日只服务"补关": 给漏关的过去日补行. 未来日永远由 server 算, 堵死时间旅行.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.day) || body.day >= today) return json({ error: 'day must be a past logical day' }, 400);
    if (await isClosed(db, body.day)) return json({ error: `${body.day} is already closed` }, 409);
    day = body.day;
  } else if (await isClosed(db, today)) {
    day = shiftDay(today, 1); // 关日即翻页: 今天已关, 这行属于明天 — 录入台永不禁用
  }

  const { meta } = await db
    .prepare('INSERT INTO lines (day, type, text, created_at) VALUES (?, ?, ?, ?)')
    .bind(day, type, text, new Date().toISOString())
    .run();
  return json({ ok: true, id: meta.last_row_id, day }, 201);
}
