import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((name) => {
      const file = join(dir, name);
      const stat = statSync(file);

      if (stat.isDirectory()) return listMarkdownFiles(file);
      if (/\.(md|mdx)$/i.test(name)) return [file];

      return [];
    })
    .sort();
}

export function listProjectSourceFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((name) => {
      const file = join(dir, name);
      const stat = statSync(file);

      if (stat.isDirectory()) return listProjectSourceFiles(file);
      if (/\.(astro|ts|js|mjs)$/.test(name)) return [file];

      return [];
    })
    .sort();
}

export function listFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .flatMap((name) => {
      const file = join(dir, name);
      const stat = statSync(file);

      if (stat.isDirectory()) return listFiles(file);
      return [file];
    })
    .sort();
}

export function listContentFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => !name.startsWith('.') && !name.endsWith('~'))
    .map((name) => join(dir, name))
    .sort();
}

export function readIfExists(file) {
  if (!existsSync(file)) return undefined;
  return readFileSync(file, 'utf8');
}

export function readFrontmatter(source) {
  return source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

export function readFrontmatterFile(file) {
  return readFrontmatter(readFileSync(file, 'utf8'));
}

export function readFrontmatterValue(frontmatter, key) {
  const value = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, 'm'))?.[1]?.trim();

  if (!value) return undefined;

  return value.replace(/^['"]|['"]$/g, '');
}

export function readNestedFrontmatterValue(frontmatter, objectKey, key) {
  const block = frontmatter.match(new RegExp(`^${objectKey}:\\s*\\r?\\n((?:\\s{2,}.+\\r?\\n?)+)`, 'm'))?.[1] ?? '';
  const value = block.match(new RegExp(`^\\s+${key}:\\s*(.+?)\\s*$`, 'm'))?.[1]?.trim();

  if (!value) return undefined;

  return value.replace(/^['"]|['"]$/g, '');
}

export function hasNestedFrontmatterKey(frontmatter, objectKey, key) {
  const block = frontmatter.match(new RegExp(`^${objectKey}:\\s*\\r?\\n((?:\\s{2,}.+\\r?\\n?)+)`, 'm'))?.[1] ?? '';
  return new RegExp(`^\\s+${key}:\\s*(?:.+?)?\\s*$`, 'm').test(block);
}

export function readFrontmatterList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+-\\s+.+\\r?\\n?)+)`, 'm'));
  const list = match?.[1] ?? '';

  return [...list.matchAll(/^\s+-\s+(.+?)\s*$/gm)].map((item) =>
    item[1].trim().replace(/^['"]|['"]$/g, ''),
  );
}

export function readYamlScalar(source, key) {
  return source.match(new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

export function hasConfiguredGiscus(source) {
  const commentsStart = source.match(/^comments:\s*$/m)?.index;
  if (commentsStart === undefined) return false;

  const commentsBlock = source.slice(commentsStart);
  const giscusStart = commentsBlock.match(/^\s+giscus:\s*$/m)?.index;
  if (giscusStart === undefined) return false;

  const block = commentsBlock.slice(giscusStart);
  return ['repo', 'repo_id', 'category', 'category_id'].every((key) =>
    new RegExp(`^\\s+${key}:\\s*\\S+`, 'm').test(block),
  );
}

export function commentsEnabled(frontmatter) {
  return !/^comments:\s*false\s*$/m.test(frontmatter);
}

export function routeToFile(route) {
  if (route === '/') return '/index.html';
  return `${route}index.html`;
}

export function stripExtension(path) {
  return path.replace(/\.(md|mdx)$/i, '');
}

export function tagSlug(tag) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function hasFileExtension(path) {
  return /\.[a-z0-9]+$/i.test(path);
}

export function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}
