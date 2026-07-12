# Behavioral guidelines
## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.


## 5. 已定论的分歧 —— 必须记录在案

**定义**:
- Claude 判定"**这是很严重/很大的问题**",但经与用户认真讨论后**被用户说服**、或**自己意识到先前判断有误** → **必须记录**。
- **反向同样必须记录**:用户原本的判断,被 Claude 说服/纠正。

**为什么**:否则同一个分歧会被反复"重新发现",双方每次都要再惊吓一次、再讨论一遍。

**怎么做**:
1. 发现"新问题"时:**先查已定论清单** → 再**评估严重性**(硬伤?措辞?已知?)→ 最后才打断用户,并给出严重性判断,不制造恐慌。
2. 一场分歧收敛后,**立刻回写一条**:`[方向标记] 原主张 → 最终结论 → 依据`。
3. 方向标记:`[U→C]` 用户说服 Claude · `[C→U]` Claude 说服用户 · `[核实纠正]` 回原始材料/代码核实后纠正。
4. **未解决的问题不进本清单**(那是 TODO)。

## 6. Commit messages: English

Commit messages go in English from 2026-07-12 onward (Ender's call). Keep them reasonably
concise — this is not the place to port the old Chinese decision-log detail verbatim; that
level of internal-debate detail is more exposed once it's legible to a wider audience, which
cuts against why the README was stripped down in the first place. No AI signature/trailer,
single author (Ender-Jones) — unchanged from before.

# Project reference

(Moved out of README.md 2026-07-12 — the public repo page should show nothing but the site
link. This file is still tracked and browsable, just not auto-rendered on the repo landing
page.)

Design spec source: [design_handoff_blog_redesign/README.md](design_handoff_blog_redesign/README.md).
Ops runbook: [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

## Map — want to change X, edit where

| Want to | Edit |
|---|---|
| Write a new post | `src/content/posts/<slug>.mdx` — copy frontmatter from any neighbor; images in `public/img/posts/` |
| Hand-write a worklog entry | `src/content/worklogs/YYYY-MM.md` — one file per month, append `## YYYY-MM-DD` sections |
| Add/change a coda quote | `src/data/quotes.yml` — pin one to a post via frontmatter `coda: <id>`, else random |
| Register a new tag | `src/data/tags.yml` — an unregistered tag fails the build on purpose |
| Change identity/contact info | `src/data/site.yml` |
| Change About page copy | `src/data/about.yml` — bio/three-identities/ADHD section/colophon all live here |
| Change Research page content | `src/data/research.yml` — paper details/timeline (education years still need filling in)/what's next |
| Change colors/fonts/motion | `src/styles/tokens.css` — the one source of design tokens for the whole site |
| Unfinished drafts | `drafts/` — never enters `src/content`, no `draft: true` flag |
| Pages | `src/pages/` — routing is file-based |
| Components | `src/components/` — `content/` holds the four MDX components (Epigraph/Figure/Callout/Poem) |
| Worklog parsing | `src/lib/worklogDays.ts` (day entries/week grouping) + `src/lib/parseWorklog.ts` (NOW-line fallback) |
| What the console does and when | `docs/CONSOLE.md` — behavior contract; edit it before touching console code |
| Refresh the commit-wall data | `npm run activity:cache` (needs `GITHUB_TOKEN` or a logged-in `gh`) |
| Run content checks manually | `npm run check:content` (also runs automatically on commit, see below) |

Rule: anything you'd hand-maintain at the "homepage data" level (research panel's paper list,
readout card's status line, hero copy, etc.) lives in `src/data/*.yml` with inline comments and
gets listed in this table — never buried inside component code.

## Local dev (Docker-first — deps live in the container's named volume, never touch the Mac)

```bash
docker compose up site                        # first run installs deps; localhost:4321
docker compose run --rm site npm run build    # full gate: content check + astro check + build
docker compose down                           # stop (down -v also wipes the deps volume)

git config core.hooksPath hooks   # one-time: pre-commit content check runs on host node, no node_modules needed
```

## Deployment

**Phase 1 — live**: https://ender-s-blog.pages.dev/ (Cloudflare **Pages**, tracks GitHub `main`,
rebuilds on every push). Site carries `noindex`, no custom domain yet.

<details><summary>How it was set up (reference; needed again on a rebuild or account switch)</summary>

⚠ Use the **Pages** flow, not **Workers**. If the screen title says "Configure your Worker
project" and asks for a "Deploy command" (`npx wrangler deploy`) — that's Workers, it'll fail
with `Missing entry-point`; back out and reselect. The Pages flow has no deploy-command field,
it just deploys automatically once created.
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git** → pick `Ender-Jones/Ender-s-Blog`.
2. Framework preset **Astro**; build command `npm run build`; build output `dist`; env var `NODE_VERSION` = `22`.
3. **Save and Deploy**.
</details>

**Phase 2 — live (2026-07-11)**: console writes straight to the D1 working tree; close-the-day
is a Pages Function that composes markdown and commits it via the GitHub contents API (first
real commit `891b91f`). `/console/` and `/api/*` are gated by Cloudflare Access (email OTP,
7-day session since 2026-07-12, Allow policy session = "Same as application session timeout");
AUD/team domain live in `wrangler.toml`'s `[vars]`, the only real secret is the
Pages Secret `GITHUB_TOKEN` (rotates yearly, see `docs/MAINTENANCE.md`). Behavior contract:
`docs/CONSOLE.md`.

**Go-live checklist (the day a custom domain lands):**
1. Set `GITHUB_TOKEN` in the CF build environment (reads contributions) so the commit wall is
   fresh on every build; run `npm run activity:cache` once by hand first.
2. Daily 04:00 JST scheduled rebuild (deploy hook + GitHub Actions cron).
3. Drop `noindex` from the homepage; add a sitemap (`@astrojs/sitemap` + the real domain in
   `astro.config`).
4. Check the giscus theme.

## TODO (current, roughly by urgency; delete a line once it's done)

Fonts are final (V2 trio, Lexend rejected, type-lab removed). Site is live. Left:

**Ender's**
1. Translate `src/content/posts/zh/` — the research-notes post (evaluation metrics) has a full
   draft translation already, waiting on his pass for tone; prompt-engineering essay and
   who-am-i are still untranslated (the poem is exempt); also decide whether the Research page
   gets a Chinese version (leaning no).
2. Extreme font-size tier is live — say how it reads whenever (dial back/tune = 8 lines in
   `tokens.css`).
3. Search-magnet post topic (⚠ site still `noindex`, payoff waits for the custom domain; do an
   SERP check before writing to confirm no one's already nailed it).
   Origin story and formula (2026-07-12): a ghostty cheatsheet on some blog ranked #1 on a
   one-search query and he himself lingered on it a while — the perfect signal is a query with
   clear intent × weak-competition SERP × above-the-fold answer (table/diagram/copyable code) ×
   evergreen topic × genuinely his territory. Dwell time is exactly what Google's "did the last
   user bounce back" signal rewards.
   Shortlist (2026-07-12, after his pass; all tool/method only, no unpublished numbers):
   - ⭐ statistical-test cheatsheet for **comparing two models under cross-validation**
     (corrected paired t-test / Nadeau–Bengio + Hedges' g, copyable python) — angle: "for people
     bad at stats" (his own self-assessment), he's the first reader
   - ⭐ zh: **data-leakage checklist** (subject-level vs record-level split table, matches the
     "reproducible evaluation" persona)
   - ⭐ **UBFC-Phys dataset field guide** (directory layout/T1-T3 semantics/sample rate/gotchas;
     dataset facts only)
   - backup ideas: MediaPipe 478-landmark cheat sheet / zh CF Pages+D1+Access postmortem /
     pyVHR rPPG cheat sheet

**Co-written**
4. ADHD worklog methodology essay (pays off the About page's "a longer essay is coming").

**Standing red line**: no public résumé/CV download on the site, no photos, no link that leads
straight to his real name (that's why the IEICE technical-report page isn't linked).

**The day a custom domain lands** (see Deployment → Go-live checklist above): drop noindex +
sitemap + 04:00 cron + activity refresh.

**Low priority**
5. Pass over on a real mobile device; photography section design; expand `quotes.yml`.

## Lineage

V1 Jekyll (`Ender-Jones.github.io`, archived) → V2 Astro (`personal_blog_astro`, source of
content and engineering) → V3 (this repo, the "vital signs in a darkroom" design handoff).