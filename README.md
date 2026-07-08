# Ender Jones — blog V3

研究笔记本 + 个人档案 + worklog(对抗 ADHD 的外置工作记忆). Astro 静态站, 部署在 Cloudflare Pages.
设计规范原稿在 [design_handoff_blog_redesign/README.md](design_handoff_blog_redesign/README.md), 维护操作见 [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

## 地图 — 想做 X, 去改哪

| 想做什么 | 去哪 |
|---|---|
| 写新文章 | `src/content/posts/<slug>.mdx` — frontmatter 抄旁边任意一篇; 配图放 `public/img/posts/` |
| 手写 worklog | `src/content/worklogs/YYYY-MM.md` — 一月一个文件, 追加 `## YYYY-MM-DD` 小节 |
| 加/改 coda 引文 | `src/data/quotes.yml` |
| 新 tag 注册 | `src/data/tags.yml` — 文章用了没注册的 tag 构建会报错, 这是故意的 |
| 改身份/联系方式 | `src/data/site.yml` |
| 改颜色/字体/动效 | `src/styles/tokens.css` — 全站唯一的设计令牌来源 |
| 未完成的草稿 | `drafts/` — 永远不进 `src/content`, 不用 `draft: true` |
| 页面 | `src/pages/` — 路由即文件 |
| 组件 | `src/components/` — `content/` 是文章内用的四件套 (Epigraph/Figure/Callout/Poem) |
| worklog 解析 | `src/lib/parseWorklog.ts` |
| 刷新 commit 墙数据 | `npm run activity:cache`(需要 `GITHUB_TOKEN` 或已登录的 `gh`) |
| 手动跑内容检查 | `npm run check:content`(commit 时也会自动跑, 见下) |

约定: 所有需要你手动维护的"主页级数据"(研究面板的论文列表、readout 卡的状态行、hero 文案等)一律放 `src/data/*.yml`, 文件内带注释, 并在此表登记入口——不许藏进组件代码里.

## 本地跑(Docker-first — 依赖住在容器的 named volume 里, 不落在 Mac 上)

```bash
docker compose up site                        # 第一次自动装依赖; localhost:4321
docker compose run --rm site npm run build    # 完整门禁: 内容检查 + astro check + 构建
docker compose down                           # 停 (down -v 连依赖 volume 一起清掉重来)

git config core.hooksPath hooks   # 一次性: commit 前自动跑内容检查(用 Mac 自带 node, 不需要 node_modules)
```

## 部署(上线时)

Cloudflare Pages 新建项目连接本仓库: build command `npm run build`, output `dist`, Node 22.
域名切换放最后; 旧站 (`personal_blog_astro`) 保留作历史.

Go-live 清单(上线那天做):
1. CF 构建环境配 `GITHUB_TOKEN`(读 contributions 用), 让 commit 墙每次构建自动新鲜.
2. 跑一次 `docker compose run --rm -e GITHUB_TOKEN=xxx site npm run activity:cache` 刷掉过期快照.
3. 建每日 04:00 JST 的定时重建(deploy hook + GitHub Actions cron).
4. 移除主页的 `noindex`.

## 血统

V1 Jekyll (`Ender-Jones.github.io`, 已归档) → V2 Astro (`personal_blog_astro`, 内容与工程层的来源) → V3(本仓库, claude design 交接的「暗房里的生命体征」设计).
