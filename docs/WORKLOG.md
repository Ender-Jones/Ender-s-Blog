# Worklog 契约

> 与 `docs/CONSOLE.md` 同地位: **行为契约 — 改 worklog 的格式、解析或渲染之前, 先改这里.**
> 分工: 本文管 **md 文件里写什么、怎么被解析渲染**; CONSOLE.md 管录入台怎么把一天编成 md.
> 最后校准: 2026-07-22(逐条对照 `worklogDays.ts` / `parseWorklog.ts` / `validate-content.mjs` 实测).

## 本源与分工

- **git 里的 markdown 是唯一本源**. console 的 D1 只是当日工作区; 站点只从 md 构建.
- 手写 md 是永远在的兜底 — 绕过 console 直接写完全合法(边界见 CONSOLE.md「已知边界」2).
- **每月一个文件, 雷打不动**: `src/content/worklogs/YYYY-MM.md`. 月份归属以日期为准 —
  哪怕只差一天也开新文件(06-01~07 曾写在 05 文件里, 2026-07-22 已迁正).

## 文件 frontmatter(schema 是 `.strict()`, 多一个键 build 就挂)

```yaml
title: "Work Log: YYYY-MM"   # 必填
date: YYYY-MM-01T00:00:00+09:00   # 必填; 用于文件排序(最新文件 = Hero synced 日期来源)
updated: …                   # 可选; 存在则优先作 synced 日期; 每次动文件记得 bump
description: "…"             # 可选; 列表用
public_thread:               # 可选; ⚠ 当前处于【休眠】状态, 见下「渲染链路」
  summary: "…"
  bullets: ["…"]
```

## 日条目语法(新格式; 04/05 是 legacy, 见下)

```markdown
---
## 2026-07-22
<!-- energy: 3 -->
### WIP
- 今天在摸什么(投入, 不是结果; 和 Done 重复是特性)

### Done
- 摸完了的事

### Decision
- 定了的事

### Risk
- 悬着的风险

### Next
- 明天从哪开始(最新一条 = 全站 SAVE POINT)

### Public
- 一句公开话(最新一天的这句 = 全站 NOW 行)
```

硬规则(`scripts/validate-content.mjs`, pre-commit + build + CI 三处都跑):

1. **`##` 只允许是 `## YYYY-MM-DD`** — 任何别的 H2(包括 `## 2026-04-26 Evening`
   这类范围/时段写法、`## June Close` 这类总结标题)直接 fail build.
2. 日期必须是**真实历法日期**, 且**属于本文件的月份**.
3. `<!-- energy: n -->` 的 n 必须 1–5(可整段省略; 找规律用, 不是打分).

解析规则(`src/lib/worklogDays.ts`, 宽容面):

- 段名词表(`### Xxx`, 大小写不敏感, 冒号可带可不带):
  `wip`(旧名 `project` 仍认)/ `done` / `decision(s)` / `risk(s)` / `next` / `dropped` /
  `public` / `note(s)` / `observation(s)` / `info`. **未知段名不报错, 按 note 渲染**.
- 条目 = `- ` 开头的 bullet; `None`(及变体)占位词被过滤, 不算条目.
- `~~文字~~` 整条包裹 = dropped 样式(删除线保留文字, 有尊严的退场).
- 没有 bullet 的段: 整段文本算一条(legacy 常见, 新条目请一律用 bullet).
- 同一天在多个文件出现时后读的赢 — **不要制造这种情况**.

## 渲染链路(改任何字段前, 先看它会出现在哪)

| 字段 | 消费者 | 出现在 |
|---|---|---|
| 最新一天的 `### Public` | `getNowLine` | **三处 NOW 行**: 主页 ProofWall 下 / worklog 页顶 / About |
| 历史各天的 `### Public` | 周分组渲染 | 该日条目里的 `•` 行(公开可见) |
| 最新一条 `### Next` | worklog 页 | **SAVE POINT** 条("where tomorrow starts") |
| 各段 bullets | `groupByWeek` | worklog 页最近 4 周 + `/worklog/archive/` 全量, ISO 周分组, 今天所在周带 OPEN 徽章 |
| `<!-- energy -->` | 周分组渲染 | 日头部的能量点 |
| frontmatter `date`/`updated` | `getCurrentThread` | 主页 Hero 的 **synced** 日期(只用时间戳) |
| frontmatter `month_close` | `getMonthCloses` → `MonthCloseCard` | **月结卡**: 插在 worklog 页 + archive 周流的月界处(amber 卡: summary 衬线斜体 + bullets ≤4 mono). 比首页所示最旧一周还老的卡只出现在 archive |
| frontmatter `public_thread` | `getNowLine` 的回退 | ⚠ **休眠**: 只在「没有任何一天有 Public」时才作 NOW 回退; Hero 不渲染其内容. 2026-05 的那份是 V2 时代的 NOW 快照(非月结), **保留原样不复用** |

## 月度收束(约定 2026-07-22 定; 双层)

- **私有层** = 正文里的 **`### Month Close`** 块(`###` 层级 — `##` 会被验证器拒), 放文件顶部,
  frontmatter 之后. 结构参照 2026-04 的 April Close: Theme / What Changed(分线)/ Carry Into 下月.
  解析器只认日期 H2 之后的内容, 这块**不渲染** — 写给未来自己(和未来的 Claude)的月度快照.
- **公开层** = frontmatter **`month_close:`**(summary 一句 + bullets ≤4)→ 渲染为周流里的月结卡.
  从私有层**蒸馏**而来, 逐条过公开红线; 没有它 = 该月没有卡, 中性(gaps count against nothing).
- 写作时机 = 月末(或次月头几天), 手动仪式; 是 composition 不是 capture — **不进 console 录入台**
  (console 化与否见「待定项」).

## Legacy 文件(2026-04 / 2026-05)

- 在 `validate-content.mjs` 的 `LEGACY_WORKLOGS` 豁免名单里, **内容保持 verbatim, 不改写**.
- 名单**不再扩充** — 从 2026-06 起所有文件走新格式.
- ⚠ 已知坑: 2026-04 有 **10 个范围/时段标题**(`## 2026-04-22 to 2026-04-23` 等)不匹配
  日期正则 → 这 10 天**从未渲染到站点**. 修复方案(拆标题 vs 扩解析器)待印裁决.

## 公开红线(worklog 是公开渲染的, 每条都要过这道筛)

- 不出现未发表的实验数字 / p 值 / 效应量(投稿前一律 embargo).
- 不出现真名、单位、教授姓名, 不留能一步检索到真名的线索
  (2026-07-22 起会议名一律中性化为 "the conference paper / the short paper" —
  印如果决定放开, 全局替换即可).
- 私生活、求职过程细节不进 worklog(04 文件 Rules 原文如此, 沿用).

## 手写/补写条目 checklist

1. 对着上面的语法块拷模板; 日期属于本月文件; energy 给不给都行.
2. 过一遍公开红线.
3. `npm run check:content`(或直接 commit, pre-commit 会跑).
4. 动了文件记得 bump frontmatter `updated`.
5. 补写历史条目时, 在文件顶部注释里注明「事后重建 + 证据来源」(2026-06/07 有先例).

## 待定项(动这些之前先和印对齐)

1. 2026-04 那 10 天的修复方案(拆标题 vs 扩解析器).
2. 月度收束要不要 console 化(印: "要录入的话就得仔细设计系统"). 当前口径 = 手写;
   若做, 最小形态 = 月末最后一次关日后的一张非阻塞"关月卡"(summary + bullets ≤4 直写
   frontmatter month_close), 跳过永远合法 — 需动 Pages Function + D1, 先手写两三个月验证习惯再定.

(已决: 月度总结公开渲染 = month_close 月结卡, 2026-07-22 实现; public_thread 保留休眠作历史.)
