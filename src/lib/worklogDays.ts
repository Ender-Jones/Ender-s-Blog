// V3 worklog 日条目解析器 — 从月度 markdown 里抽出逐日条目流.
// 宽容两代格式: legacy(2026-04/05, 无 Public/energy, 夹杂非日期 H2 块)与新格式
// (## YYYY-MM-DD + <!-- energy: N --> + ### Done/Decision/Risk/Next/Dropped/Public).
import type { WorklogEntry } from './content';

export type WorklogItemType =
  | 'done'
  | 'decision'
  | 'risk'
  | 'next'
  | 'dropped'
  | 'project'
  | 'note';

export type WorklogItem = { type: WorklogItemType; text: string };

export type WorklogDay = {
  date: string; // YYYY-MM-DD
  energy?: number;
  items: WorklogItem[];
  publicLine?: string;
};

const SECTION_TYPE: Record<string, WorklogItemType | 'public'> = {
  project: 'project',
  done: 'done',
  decision: 'decision',
  decisions: 'decision',
  risk: 'risk',
  risks: 'risk',
  next: 'next',
  dropped: 'dropped',
  public: 'public',
  note: 'note',
  notes: 'note',
  observation: 'note',
  observations: 'note',
  info: 'note',
};

const DAY_RE = /^## +(\d{4}-\d{2}-\d{2}) *$/;

function stripComments(text: string) {
  return text.replace(/<!--[\s\S]*?-->/g, '').trim();
}

function parseDaySegment(date: string, segment: string): WorklogDay {
  const day: WorklogDay = { date, items: [] };

  const energyMatch = segment.match(/<!-- *energy:? *([1-5]) *-->/);
  if (energyMatch) day.energy = Number(energyMatch[1]);

  // 按 ### 分节; 节名映射到条目类型, 未知节名按 note 处理.
  const parts = segment.split(/^### +/m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf('\n');
    const heading = (newline === -1 ? part : part.slice(0, newline))
      .replace(/[:：]\s*$/, '')
      .trim()
      .toLowerCase();
    const body = newline === -1 ? '' : part.slice(newline + 1);
    const type = SECTION_TYPE[heading] ?? 'note';

    const bullets = [...body.matchAll(/^- +(.+?) *$/gm)]
      .map((m) => stripComments(m[1]))
      .filter(Boolean)
      .filter((text) => !/^none[.。]? *$/i.test(text)) // legacy 空节占位词, 不是条目
      .map((text) => text.replace(/^~~(.+)~~$/, '$1'));

    if (type === 'public') {
      const line =
        bullets[0] ??
        stripComments(body)
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#'))[0];
      if (line) day.publicLine = line;
      continue;
    }

    if (bullets.length) {
      for (const text of bullets) day.items.push({ type, text });
    } else {
      // 无 bullet 的节(legacy 的 Project 常是一行纯文本)整体算一条.
      const text = stripComments(body)
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && l !== '---')
        .join(' ');
      if (text && !/^none[.。]? *$/i.test(text)) day.items.push({ type, text });
    }
  }
  return day;
}

/** 全部 worklog 文件 → 逐日条目, 新→旧排序. */
export function getWorklogDays(worklogs: WorklogEntry[]): WorklogDay[] {
  const days = new Map<string, WorklogDay>();

  for (const worklog of worklogs) {
    const body = worklog.body ?? '';
    const lines = body.split('\n');
    let current: { date: string; buf: string[] } | undefined;

    const flush = () => {
      if (!current) return;
      const day = parseDaySegment(current.date, current.buf.join('\n'));
      if (day.items.length || day.publicLine) days.set(day.date, day);
      current = undefined;
    };

    for (const line of lines) {
      const dayMatch = line.match(DAY_RE);
      if (dayMatch) {
        flush();
        current = { date: dayMatch[1], buf: [] };
        continue;
      }
      if (/^## /.test(line)) {
        // 非日期 H2(legacy 的 April Close / Resume Here 等)结束当前日段
        flush();
        continue;
      }
      if (current) current.buf.push(line);
    }
    flush();
  }

  return [...days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** ISO 周编号(周一为一周之始). */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export type WorklogWeek = {
  key: string;
  week: number;
  range: string;
  current: boolean;
  days: WorklogDay[];
};

/** 逐日条目 → ISO 周分组(新→旧). todayIso 决定 OPEN 徽章. */
export function groupByWeek(days: WorklogDay[], todayIso: string): WorklogWeek[] {
  const weeks = new Map<string, WorklogWeek>();
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });

  for (const day of days) {
    const date = new Date(`${day.date}T12:00:00Z`);
    const { year, week } = isoWeek(date);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    let bucket = weeks.get(key);
    if (!bucket) {
      // 该 ISO 周的周一/周日
      const dayNum = date.getUTCDay() || 7;
      const monday = new Date(date.getTime() - (dayNum - 1) * 86400000);
      const sunday = new Date(monday.getTime() + 6 * 86400000);
      const today = new Date(`${todayIso}T12:00:00Z`);
      bucket = {
        key,
        week,
        range: `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getUTCFullYear()}`,
        current: today >= monday && today <= sunday,
        days: [],
      };
      weeks.set(key, bucket);
    }
    bucket.days.push(day);
  }

  return [...weeks.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}
