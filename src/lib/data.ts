import aboutYaml from '../data/about.yml';
import aboutZhYaml from '../data/about.zh.yml';
import homeYaml from '../data/home.yml';
import zhYaml from '../data/zh.yml';
import quotesYaml from '../data/quotes.yml';
import researchYaml from '../data/research.yml';
import researchZhYaml from '../data/research.zh.yml';
import siteYaml from '../data/site.yml';
import tagsYaml from '../data/tags.yml';

export type SocialLinks = {
  github?: string;
  twitter?: string;
  email?: string;
};

export type SiteData = {
  location: string;
  identity: {
    role_detail: string;
    signals: string[];
    models: string[];
    tools: string[];
    languages: string[];
  };
  socials: SocialLinks;
  comments?: {
    giscus?: {
      repo: string;
      repo_id: string;
      category: string;
      category_id: string;
      mapping?: string;
      strict?: string;
      reactions_enabled?: string;
      emit_metadata?: string;
      input_position?: string;
      theme?: string;
      lang?: string;
      loading?: string;
    };
  };
};

export type PaperTone = 'pink' | 'blue' | 'amber';

export type Paper = {
  status: string;
  tone: PaperTone;
  title: string;
  dek: string;
  venue: string;
  anchor: string;
  abstract: string;
  contribution: string;
  links: { paper?: string; code?: string };
};

export type TimelineEntry = {
  when: string;
  label: string;
  tone: PaperTone | 'gray';
  link?: string;
};

export type ResearchData = {
  subtitle: string;
  protocol: string;
  thesis: string;
  papers: Paper[];
  metric: {
    label: string;
    value: string;
    notes: string[];
    honesty: string;
  };
  keywords: string;
  keywords_next: string;
  whats_next: string;
  timeline: TimelineEntry[];
  focus: string;
  abstract: string;
  tags: string[];
  updated: string;
};

export type AboutData = {
  lead: string;
  paras: string[];
  essay_link: { label: string; href: string };
  notebook: { key: string; value: string }[];
  system: { title: string; body: string; link_label: string; link: string };
  colophon: string[];
};

export type HomeData = {
  splash: { greeting: string };
  hero: { kicker: string; claim: string; body: string };
  readout: {
    rows: { key: string; value: string }[];
    status: string;
  };
};

export type Quote = {
  id?: string;
  text: string;
  trans?: string;
  source: string;
  link_label?: string;
  lang?: string;
};

export type TagTone = 'research' | 'personal' | 'neutral';

export type TagMeta = {
  tone?: TagTone;
};

export type SocialDisplayLink = {
  key: keyof SocialLinks;
  label: string;
  value: string;
  href: string;
};

export const site = siteYaml as SiteData;
export const research = researchYaml as ResearchData;
export const researchZh = researchZhYaml as ResearchData;
export const tagMeta = tagsYaml as Record<string, TagMeta>;
export type ZhData = {
  hero: { kicker: string; claim: string; body: string };
  notes: string[];
};

export const home = homeYaml as HomeData;
export const about = aboutYaml as AboutData;
export const aboutZh = aboutZhYaml as AboutData;
export const zh = zhYaml as ZhData;
export const quotes = (quotesYaml as { quotes: Quote[] }).quotes;

export function getSocialLinks(siteData = site): SocialDisplayLink[] {
  const links: SocialDisplayLink[] = [];

  if (siteData.socials.github) {
    links.push({
      key: 'github',
      label: 'GitHub',
      value: getUrlHandle(siteData.socials.github),
      href: siteData.socials.github,
    });
  }

  if (siteData.socials.twitter) {
    const handle = getUrlHandle(siteData.socials.twitter);
    links.push({
      key: 'twitter',
      label: 'X',
      value: handle.startsWith('@') ? handle : `@${handle}`,
      href: siteData.socials.twitter,
    });
  }

  if (siteData.socials.email) {
    links.push({
      key: 'email',
      label: 'Email',
      value: siteData.socials.email.replace(/^mailto:/, ''),
      href: siteData.socials.email,
    });
  }

  return links;
}

function getUrlHandle(url: string) {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).at(-1) ?? url;
  } catch {
    return url;
  }
}
