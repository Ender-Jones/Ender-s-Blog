import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const tagSlug = (tag: string) =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const GET: APIRoute = async ({ site }) => {
  const base = site?.href ?? 'https://enderjones.com/';
  const posts = await getCollection('posts');

  const urls = new Set<string>(['', 'posts/', 'worklog/', 'worklog/archive/', 'research/', 'about/']);
  for (const post of posts) {
    urls.add(`posts/${post.id.replace(/\.(md|mdx)$/, '')}/`);
    for (const tag of post.data.tags) urls.add(`tags/${tagSlug(tag)}/`);
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].map((u) => `  <url><loc>${base}${u}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
