// 把一天的行编成月文件里的一节 — 格式与 src/lib/worklogDays.ts 的第二代解析器一字不差:
// "## YYYY-MM-DD" + <!-- energy --> + "### WIP/Done/Decision/Risk/Next/Dropped/Public" + "- " 条目.
const SECTIONS = [
  ['wip', 'WIP'],
  ['done', 'Done'],
  ['decision', 'Decision'],
  ['risk', 'Risk'],
  ['next', 'Next'],
  ['drop', 'Dropped'],
  ['public', 'Public'],
];

export const TYPES = SECTIONS.map(([t]) => t);

// wip 旧名 project(2026-07-12 全库改词): 改词前入库的 D1 行、改词前夜还开着的旧标签页
// POST 过来的行都可能还是 project — 读到就归一, 老数据不搬家.
export const normalizeType = (t) => (t === 'project' ? 'wip' : t);

export function composeDay(day, rows, energy) {
  const by = {};
  for (const r of rows) (by[normalizeType(r.type)] ??= []).push(r.text);
  let md = `\n## ${day}\n`;
  if (energy) md += `<!-- energy: ${energy} -->\n`;
  let first = true;
  for (const [type, title] of SECTIONS) {
    if (!by[type]?.length) continue;
    // 第一节紧跟标题/energy(与手写一致), 其后每节前空一行
    md += `${first ? '' : '\n'}### ${title}\n`;
    first = false;
    for (const text of by[type]) md += `- ${text}\n`;
  }
  return md;
}
