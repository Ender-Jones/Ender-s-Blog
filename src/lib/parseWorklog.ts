import { byDateDesc, type WorklogEntry } from './content';

export type CurrentThread =
  | {
      state: 'normal' | 'stale';
      worklog: WorklogEntry;
      summary: string;
      bullets: string[];
      updatedAt: Date;
      source: 'frontmatter' | 'block';
    }
  | {
      state: 'collapsed';
      worklog?: WorklogEntry;
      updatedAt?: Date;
      reason: 'no-worklog' | 'no-public-block' | 'too-old';
    };

export type PublicThreadSummary = {
  summary: string;
  bullets: string[];
  source: 'frontmatter' | 'block';
};

const PUBLIC_THREAD_RE = /<!-- public:thread:start -->([\s\S]*?)<!-- public:thread:end -->/;

export function getCurrentThread(worklogs: WorklogEntry[], now = new Date()): CurrentThread {
  const latest = byDateDesc(worklogs)[0];

  if (!latest) {
    return { state: 'collapsed', reason: 'no-worklog' };
  }

  const updatedAt = latest.data.updated ?? latest.data.date;

  const thread = getPublicThread(latest);

  if (!thread) {
    return {
      state: 'collapsed',
      reason: 'no-public-block',
      worklog: latest,
      updatedAt,
    };
  }

  const state = getStalenessState(updatedAt, now);

  if (state === 'collapsed') {
    return { state, reason: 'too-old', worklog: latest, updatedAt };
  }

  return {
    state,
    worklog: latest,
    updatedAt,
    source: thread.source,
    summary: thread.summary,
    bullets: thread.bullets,
  };
}

export function getPublicThread(worklog: WorklogEntry): PublicThreadSummary | undefined {
  if (worklog.data.public_thread) {
    return {
      source: 'frontmatter',
      summary: worklog.data.public_thread.summary,
      bullets: worklog.data.public_thread.bullets,
    };
  }

  const match = worklog.body?.match(PUBLIC_THREAD_RE);

  if (!match) return undefined;

  const thread = parsePublicBlock(match[1]);
  if (!thread) return undefined;

  return {
    source: 'block',
    ...thread,
  };
}

function parsePublicBlock(block: string) {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, ''))
    .slice(0, 4);

  const summary = lines.find((line) => !/^[-*]\s+/.test(line)) ?? bullets[0];

  if (!summary) return undefined;

  return { summary, bullets };
}

function getStalenessState(date: Date, now: Date): 'normal' | 'stale' | 'collapsed' {
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (days <= 14) return 'normal';
  if (days <= 45) return 'stale';
  return 'collapsed';
}
