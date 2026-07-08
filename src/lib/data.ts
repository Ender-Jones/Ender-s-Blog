import researchYaml from '../data/research.yml';
import siteYaml from '../data/site.yml';
import tagsYaml from '../data/tags.yml';

export type SocialLinks = {
  github?: string;
  twitter?: string;
  email?: string;
};

export type SiteData = {
  name: string;
  url: string;
  role: string;
  location: string;
  avatar: string;
  hero_portrait?: string;
  research_oneliner: string;
  about_lead: string;
  identity: {
    terminal_title: string;
    role_detail: string;
    focus_label: string;
    stack: string[];
    thesis: string;
    signals: string[];
    models: string[];
    tools: string[];
    languages: string[];
    portrait_caption: string;
  };
  github_card?: {
    title: string;
    description: string;
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

export type ResearchData = {
  focus: string;
  abstract: string;
  tags: string[];
  updated: string;
  stale_after_days: number;
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
export const tagMeta = tagsYaml as Record<string, TagMeta>;

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
