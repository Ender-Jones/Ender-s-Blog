// 产物门禁: 构建后核对 dist/ — 该在的文件都在, 关键路由都生成了, robots/sitemap 内容正确.
import { existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listMarkdownFiles, readFrontmatterFile, readFrontmatterList, tagSlug, stripExtension } from './lib/content-utils.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const errors = [];
const fail = (msg) => errors.push(`✗ ${msg}`);

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found — run the build first');
  process.exit(1);
}

const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  'googleea7f91fa26471a51.html',
];
for (const file of REQUIRED_FILES) {
  if (!existsSync(join(DIST, file))) fail(`dist/${file} missing`);
}

const ROUTES = [
  'posts/',
  'worklog/',
  'worklog/archive/',
  'console/',
  'research/',
  'about/',
];
const posts = listMarkdownFiles(join(ROOT, 'src/content/posts'));
const tagSlugs = new Set();
for (const file of posts) {
  ROUTES.push(`posts/${stripExtension(basename(file))}/`);
  for (const tag of readFrontmatterList(readFrontmatterFile(file), 'tags')) tagSlugs.add(tagSlug(tag));
}
for (const slug of tagSlugs) ROUTES.push(`tags/${slug}/`);
for (const route of ROUTES) {
  if (!existsSync(join(DIST, route, 'index.html'))) fail(`route /${route} not generated`);
}

if (existsSync(join(DIST, 'robots.txt'))) {
  const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
  if (!robots.includes('Disallow: /console/')) fail('robots.txt does not disallow /console/');
  if (!robots.includes('Sitemap:')) fail('robots.txt missing Sitemap line');
}

if (existsSync(join(DIST, 'sitemap.xml'))) {
  const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  for (const file of posts) {
    const slug = stripExtension(basename(file));
    if (!sitemap.includes(`/posts/${slug}/`)) fail(`sitemap missing /posts/${slug}/`);
  }
  if (sitemap.includes('/console/')) fail('sitemap must not list /console/');
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\nbuild verification failed: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`✓ dist ok (${ROUTES.length + REQUIRED_FILES.length} artifacts checked)`);
