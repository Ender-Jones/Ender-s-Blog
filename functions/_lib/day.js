// 逻辑日: 04:00 JST 才翻页 — 熬夜到凌晨三点的工作算"昨天"的.
// 与 console 前端(src/pages/console)的算法保持一字不差.
export function logicalDay(now = new Date()) {
  const jst = now.getTime() + 9 * 3600_000;
  return new Date(jst - 4 * 3600_000).toISOString().slice(0, 10);
}

// 逻辑日加减(关日即翻页要算"下一逻辑日")
export function shiftDay(day, n) {
  return new Date(new Date(`${day}T12:00:00Z`).getTime() + n * 86400_000).toISOString().slice(0, 10);
}

// "某日已关" = 该日存在已归档(committed=1)的行. 空日不能关是既有闸门, 所以这个推断严密 —
// 不需要独立的关日表, 线上 D1 零迁移.
export async function isClosed(db, day) {
  const row = await db.prepare('SELECT 1 AS one FROM lines WHERE day = ? AND committed = 1 LIMIT 1').bind(day).first();
  return row !== null;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
