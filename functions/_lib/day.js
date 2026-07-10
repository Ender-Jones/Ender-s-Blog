// 逻辑日: 04:00 JST 才翻页 — 熬夜到凌晨三点的工作算"昨天"的.
// 与 console 前端(src/pages/console)的算法保持一字不差.
export function logicalDay(now = new Date()) {
  const jst = now.getTime() + 9 * 3600_000;
  return new Date(jst - 4 * 3600_000).toISOString().slice(0, 10);
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
