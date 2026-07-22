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
| Write a new post | `src/content/posts/<slug>.mdx` — copy frontmatter from any neighbor; images in `public/img/posts/` — body contract: sections start at `##`, ladder stops at `####` (validator-enforced); everything GFM can emit is dressed |
| Check/adjust article typography | `src/styles/prose.css` (all token-fed); eyeball every element at once on `/dev/prose-lab` |
| Hand-write a worklog entry | `src/content/worklogs/YYYY-MM.md` — one file per month, append `## YYYY-MM-DD` sections; **format contract: `docs/WORKLOG.md`** (syntax, render map, red lines, checklist) |
| Add/change a coda quote | `src/data/quotes.yml` — pin one to a post via frontmatter `coda: <id>`, else random |
| Register a new tag | `src/data/tags.yml` — an unregistered tag fails the build on purpose |
| Change identity/contact info | `src/data/site.yml` |
| Change About page copy | `src/data/about.yml` — bio/three-identities/ADHD section/colophon all live here |
| Change Research page content | `src/data/research.yml` (EN) + `src/data/research.zh.yml` (zh mirror — keep both in sync); shared renderer `src/components/research/ResearchPage.astro`, routes `/research/` + `/zh/research/` |
| Change colors/fonts/motion | `src/styles/tokens.css` — the one source of design tokens for the whole site |
| Unfinished drafts | `drafts/` — never enters `src/content`, no `draft: true` flag |
| Pages | `src/pages/` — routing is file-based |
| Components | `src/components/` — `content/` holds the four MDX components (Epigraph/Figure/Callout/Poem) |
| Worklog parsing | `src/lib/worklogDays.ts` (day entries/week grouping) + `src/lib/parseWorklog.ts` (NOW-line fallback) — behavior contract `docs/WORKLOG.md`, edit it before touching worklog code |
| What the console does and when | `docs/CONSOLE.md` — behavior contract; edit it before touching console code |
| Refresh the commit-wall data | `npm run activity:cache` (needs `GITHUB_TOKEN` or a logged-in `gh`) |
| Run content checks manually | `npm run check:content` (also runs automatically on commit, see below) |
| Figure out which yml feeds which page / verify after a data edit | **`docs/DATA.md`** — file→page map, where to eyeball, zh parity, gotchas |

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

Content is current as of 2026-07-22: zh mirrors done (posts + Research + About), who-am-i
rewritten, the prompt post's model takes redone with the 2025 snapshot frozen in place, and the
site-wide copy sweep retired the "notebook" framing. Nothing on the site is knowingly stale.

**Ender's**
1. Search-magnet post — **topic decided, not yet written**. SERP scouting done 2026-07-22 (full
   findings + already-verified dataset facts in Claude's memory `search-magnet-scout`):
   - **Write first: UBFC-Phys field guide** (directory layout / T1–T3 semantics / sample rates /
     gotchas). SERP is genuinely empty — the official page is a blurb and the real structure is
     locked inside a READ_ME.docx you must download; no third-party guide exists. Small audience,
     cleanest possible win, lowest writing cost. Dataset facts only — the number embargo holds.
   - Second: **zh data-leakage wedge** — write *only* the subject-level vs record-level angle
     (near-empty in Chinese); a general leakage checklist drowns in the CSDN/知乎 red ocean.
   - Later: **corrected paired t-test cheatsheet** — biggest demand, most crowded SERP
     (scikit-learn already ships Nadeau–Bengio code); the one open gap is Hedges' g for CV
     model comparison.
   - Formula (2026-07-12, from the ghostty cheatsheet that held his own attention): clear-intent
     query × weak-competition SERP × above-the-fold answer × evergreen × genuinely his territory.
   - ⚠ Site is still `noindex`, so ranking payoff waits for the custom domain — the first post's
     real job is to test whether the formula works at all.

**Co-written**
2. ADHD worklog methodology essay (pays off the About page's "a longer essay is coming" — the
   only public IOU on the site). Two rounds of scouting are already done; read Claude's memory
   `adhd-essay-scout` before starting.

**Standing red line**: no public résumé/CV download on the site, no photos, no link that leads
straight to his real name (that's why the IEICE technical-report page isn't linked).

**The day a custom domain lands** (see Deployment → Go-live checklist above): drop noindex +
sitemap + 04:00 cron + activity refresh.

**Low priority**
3. Pass over on a real mobile device; photography section design; expand `quotes.yml`;
   the 10-day range heading in `2026-04` has never rendered (split the heading vs extend the
   parser — Ender's call, and legacy files are never rewritten).

## Lineage

V1 Jekyll (`Ender-Jones.github.io`, archived) → V2 Astro (`personal_blog_astro`, source of
content and engineering) → V3 (this repo, the "vital signs in a darkroom" design handoff).