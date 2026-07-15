// 内容门禁: commit 前(hooks/pre-commit)和构建前(npm run build)自动跑.
// 只校验"能在 VSCode 里手写出错"的东西; 深层 schema 校验由 astro 的 zod 负责.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listMarkdownFiles,
  readFrontmatter,
  readFrontmatterValue,
  readFrontmatterList,
  tagSlug,
} from './lib/content-utils.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src/content');
const PUBLIC = join(ROOT, 'public');
const errors = [];
const fail = (file, message) => errors.push(`✗ ${file.replace(ROOT, '')} — ${message}`);

// 新格式从 2026-07 起强制; 旧文件按 legacy 宽松处理(原文保留, 不回改).
const LEGACY_WORKLOGS = new Set(['2026-04.md', '2026-05.md']);

const CONFLICT_RE = /^(<<<<<<<|=======$|>>>>>>>)/m;

function checkConflictMarkers(file, source) {
  if (CONFLICT_RE.test(source)) fail(file, 'git conflict marker left in file');
}

function checkPost(file) {
  const source = readFileSync(file, 'utf8');
  checkConflictMarkers(file, source);
  const fm = readFrontmatter(source);
  if (!fm) return fail(file, 'missing frontmatter');
  for (const key of ['title', 'date']) {
    if (!readFrontmatterValue(fm, key)) fail(file, `frontmatter missing "${key}"`);
  }
  for (const tag of readFrontmatterList(fm, 'tags')) {
    if (!registeredTags.has(tagSlug(tag))) {
      fail(file, `tag "${tag}" (slug "${tagSlug(tag)}") not registered in src/data/tags.yml`);
    }
  }
  const image = readFrontmatterValue(fm, 'image');
  if (image && image.startsWith('/') && !existsSync(join(PUBLIC, image))) {
    fail(file, `frontmatter image not found in public${image}`);
  }
  const coda = readFrontmatterValue(fm, 'coda');
  if (coda && !quoteIds.has(coda)) {
    fail(file, `coda "${coda}" has no matching id in src/data/quotes.yml`);
  }

  // 标题层级契约: 正文从 ## 开始, 最深到 ####(h1 = frontmatter title 的领地;
  // h5/h6 在 prose.css 里没有着装). 先剥 frontmatter 与代码块, 免得 # 注释误伤.
  const body = source
    .replace(/^---\n[\s\S]*?\n---/, '')
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1/gm, '');
  if (/^# /m.test(body)) fail(file, 'h1 in post body — title lives in frontmatter, start sections at "##"');
  if (/^#{5,6} /m.test(body)) fail(file, 'h5/h6 in post body — heading ladder stops at "####"');
}

function checkWorklog(file) {
  const name = basename(file);
  const source = readFileSync(file, 'utf8');
  checkConflictMarkers(file, source);
  if (!/^\d{4}-\d{2}\.md$/.test(name)) return fail(file, 'worklog filename must be YYYY-MM.md');
  const fm = readFrontmatter(source);
  if (!fm) return fail(file, 'missing frontmatter');
  for (const key of ['title', 'date']) {
    if (!readFrontmatterValue(fm, key)) fail(file, `frontmatter missing "${key}"`);
  }
  if (LEGACY_WORKLOGS.has(name)) return;

  const month = name.slice(0, 7);
  for (const match of source.matchAll(/^## +(.+?) *$/gm)) {
    const heading = match[1];
    const m = heading.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
      fail(file, `day heading "## ${heading}" must be "## YYYY-MM-DD"`);
      continue;
    }
    const date = new Date(`${heading}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== heading) {
      fail(file, `"## ${heading}" is not a real calendar date`);
    } else if (!heading.startsWith(month)) {
      fail(file, `"## ${heading}" does not belong to ${month}`);
    }
  }
  for (const match of source.matchAll(/^<!-- *energy:? *(.*?) *-->$/gm)) {
    if (!/^[1-5]$/.test(match[1])) fail(file, `energy comment "${match[0]}" must be 1–5`);
  }
}

// src/content 下只允许 posts/ 和 worklogs/
const strayEntries = readdirSync(CONTENT).filter(
  (name) => !['posts', 'worklogs'].includes(name) && !name.startsWith('.'),
);
for (const name of strayEntries) fail(join(CONTENT, name), 'unexpected entry in src/content');

// tags.yml 注册表
const tagsSource = readFileSync(join(ROOT, 'src/data/tags.yml'), 'utf8');
const registeredTags = new Set(
  [...tagsSource.matchAll(/^([a-z0-9-]+):/gm)].map((m) => m[1]),
);

// quotes.yml 最低限
const quotesSource = readFileSync(join(ROOT, 'src/data/quotes.yml'), 'utf8');
const quoteTexts = [...quotesSource.matchAll(/^ +text:/gm)].length;
const quoteSources = [...quotesSource.matchAll(/^ +source:/gm)].length;
if (quoteTexts !== quoteSources) {
  fail(join(ROOT, 'src/data/quotes.yml'), `every quote needs a source (${quoteTexts} text / ${quoteSources} source)`);
}
const quoteIds = new Set(
  [...quotesSource.matchAll(/^ +- +id: *([a-z0-9-]+) *$/gm)].map((m) => m[1]),
);

const posts = listMarkdownFiles(join(CONTENT, 'posts'));
const worklogs = listMarkdownFiles(join(CONTENT, 'worklogs'));
posts.forEach(checkPost);
worklogs.forEach(checkWorklog);

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\ncontent check failed: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`✓ content ok (${posts.length} posts · ${worklogs.length} worklogs · ${quoteTexts} quotes)`);
