import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const coverMode = z.enum([
  'hero-large',
  'hero-small',
  'showcase',
  'strip',
  'none',
]);
const postKind = z.enum([
  'essay',
  'poem',
  'note',
  'research-note',
  'field-report',
]);
const text = z.string().trim().min(1);
const marginaliaQuoteYear = z.union([text, z.number().int().positive().transform(String)]);
const marginaliaQuote = z
  .object({
    lines: z.array(text).min(1),
    author: text.optional(),
    work: text.optional(),
    year: marginaliaQuoteYear.optional(),
  })
  .strict();
const marginalia = z.union([
  z.boolean(),
  z
    .object({
      text: text.optional(),
      source: text.optional(),
      quote: marginaliaQuote.optional(),
      image: text.optional(),
      image_alt: text.optional(),
      image_focus: text.optional(),
    })
    .strict(),
]);

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: text,
      date: z.coerce.date(),
      description: text.optional(),
      kind: postKind.default('essay'),
      tags: z.array(text).default([]),
      pinned: z.boolean().default(false),
      comments: z.boolean().default(true),
      language: z.enum(['en', 'zh']).default('en'),
      i18n_alt: text.optional(),
      image: text.optional(),
      image_alt: text.optional(),
      image_role: z.enum(['mood', 'semantic', 'decorative']).default('mood'),
      image_focus: text.default('50% 50%'),
      image_credit: text.optional(),
      cover_mode: coverMode.optional(),
      marginalia: marginalia.optional(),
      coda: text.optional(), // 固定文尾 coda: 填 src/data/quotes.yml 里某条的 id
    })
    .strict(),
});

const publicThread = z
  .object({
    summary: text,
    bullets: z.array(text).max(4).default([]),
  })
  .strict();

const worklogs = defineCollection({
  loader: glob({ base: './src/content/worklogs', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: text,
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      description: text.optional(),
      public_thread: publicThread.optional(),
    })
    .strict(),
});

export const collections = { posts, worklogs };
