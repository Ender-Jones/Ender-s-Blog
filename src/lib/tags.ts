import { tagMeta, type TagTone } from './data';
import { getTagCounts, tagSlug, type PostEntry } from './content';

export type TagSummary = {
  tag: string;
  count: number;
  tone: TagTone;
};

export function getHomeTagSummary(posts: PostEntry[]): TagSummary[] {
  return getTagCounts(posts)
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB))
    .map(([tag, count]) => ({
      tag,
      count,
      tone: getTagTone(tag),
    }));
}

export function getTagTone(tag: string): TagTone {
  return tagMeta[tagSlug(tag)]?.tone ?? 'neutral';
}
