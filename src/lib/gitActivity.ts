import githubActivityCache from '../data/github-activity.json';

export type GitActivityDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GitActivitySnapshot = {
  days: GitActivityDay[];
  source: 'github' | 'unavailable';
  totalContributions: number;
};

export function getGitActivitySnapshot(weeks = 12, now = new Date()): GitActivitySnapshot {
  const { start, dayCount } = getAlignedWindow(weeks, now);
  const counts = readCachedContributionCounts();
  const source = counts.size > 0 ? 'github' : 'unavailable';
  let totalContributions = 0;

  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = formatDateKey(date);
    const count = counts.get(key) ?? 0;
    totalContributions += count;

    return {
      date: key,
      count,
      level: getCommitLevel(count),
    };
  });

  return { days, source, totalContributions };
}

function readCachedContributionCounts() {
  const counts = new Map<string, number>();
  const days = Array.isArray(githubActivityCache.days) ? githubActivityCache.days : [];

  for (const day of days) {
    if (typeof day?.date !== 'string' || typeof day?.count !== 'number') continue;
    counts.set(day.date, day.count);
  }

  return counts;
}

function getAlignedWindow(weeks: number, now: Date) {
  const dayCount = weeks * 7;
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(end.getDate() - dayCount + 1);

  return { start, dayCount };
}

function getCommitLevel(count: number): GitActivityDay['level'] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
