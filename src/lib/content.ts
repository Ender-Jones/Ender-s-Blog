import type { CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;
export type WorklogEntry = CollectionEntry<'worklogs'>;

export function byDateDesc<T extends { data: { date: Date } }>(items: T[]) {
  return [...items].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  }).format(date);
}

export function formatPostDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return parts.replaceAll('-', '.');
}

export function getReadingStats(markdown = '') {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`{}[\]().,;:!?'"“”‘’—–-]/g, ' ');
  const words = text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  const minutes = Math.max(1, Math.round(words / 220));

  return { words, minutes };
}

export function postHref(post: PostEntry) {
  return `/posts/${post.id}/`;
}

export function worklogHref(worklog: WorklogEntry) {
  return `/worklog/${worklog.id}/`;
}

export function getCoverMode(post: PostEntry) {
  return post.data.cover_mode ?? (post.data.image ? (post.data.pinned ? 'hero-large' : 'hero-small') : 'none');
}

export function getPostKindLabel(post: PostEntry) {
  const labels: Record<PostEntry['data']['kind'], string> = {
    essay: 'Essay',
    poem: 'Poem',
    note: 'Note',
    'research-note': 'Research Note',
    'field-report': 'Field Report',
  };

  return labels[post.data.kind];
}

export function getTagCounts(posts: PostEntry[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function groupPostsByYear(posts: PostEntry[]) {
  const groups = new Map<number, PostEntry[]>();

  for (const post of byDateDesc(posts)) {
    const year = post.data.date.getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, yearPosts]) => ({
      year,
      posts: yearPosts,
      pinned: yearPosts.find((post) => post.data.pinned),
    }));
}

export function tagSlug(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
