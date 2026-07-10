// 把一天的行编成月文件里的一节 — 格式与 src/lib/worklogDays.ts 的第二代解析器一字不差:
// "## YYYY-MM-DD" + <!-- energy --> + "### Project/Done/Decision/Risk/Next/Dropped/Public" + "- " 条目.
const SECTIONS = [
  ['project', 'Project'],
  ['done', 'Done'],
  ['decision', 'Decision'],
  ['risk', 'Risk'],
  ['next', 'Next'],
  ['drop', 'Dropped'],
  ['public', 'Public'],
];

export const TYPES = SECTIONS.map(([t]) => t);

export function composeDay(day, rows, energy) {
  const by = {};
  for (const r of rows) (by[r.type] ??= []).push(r.text);
  let md = `\n## ${day}\n`;
  if (energy) md += `<!-- energy: ${energy} -->\n`;
  for (const [type, title] of SECTIONS) {
    if (!by[type]?.length) continue;
    md += `\n### ${title}\n`;
    for (const text of by[type]) md += `- ${text}\n`;
  }
  return md;
}
