// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://enderjones.com',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    mdx(),
    // 私有面不进 sitemap(robots.txt 同步 disallow)
    sitemap({
      filter: (page) => !page.includes('/console/') && !page.includes('/dev/'),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    plugins: [yaml()],
  },
});
