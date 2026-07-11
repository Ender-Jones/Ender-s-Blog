# Ender Jones — blog V3

研究笔记本 + 个人档案 + worklog(对抗 ADHD 的外置工作记忆). Astro 静态站, 部署在 Cloudflare Pages.
设计规范原稿在 [design_handoff_blog_redesign/README.md](design_handoff_blog_redesign/README.md), 维护操作见 [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

## 地图 — 想做 X, 去改哪

| 想做什么 | 去哪 |
|---|---|
| 写新文章 | `src/content/posts/<slug>.mdx` — frontmatter 抄旁边任意一篇; 配图放 `public/img/posts/` |
| 手写 worklog | `src/content/worklogs/YYYY-MM.md` — 一月一个文件, 追加 `## YYYY-MM-DD` 小节 |
| 加/改 coda 引文 | `src/data/quotes.yml` — 文章想固定某条: frontmatter 写 `coda: <id>`, 不写则随机 |
| 新 tag 注册 | `src/data/tags.yml` — 文章用了没注册的 tag 构建会报错, 这是故意的 |
| 改身份/联系方式 | `src/data/site.yml` |
| 改 About 页文案 | `src/data/about.yml` — 自述/三重身份/ADHD 短节/colophon 全在这 |
| 改 Research 页内容 | `src/data/research.yml` — 论文详情/时间线(学历年份待你填)/what's next |
| 改颜色/字体/动效 | `src/styles/tokens.css` — 全站唯一的设计令牌来源 |
| 未完成的草稿 | `drafts/` — 永远不进 `src/content`, 不用 `draft: true` |
| 页面 | `src/pages/` — 路由即文件 |
| 组件 | `src/components/` — `content/` 是文章内用的四件套 (Epigraph/Figure/Callout/Poem) |
| worklog 解析 | `src/lib/worklogDays.ts`(日条目/周分组)+ `src/lib/parseWorklog.ts`(NOW 线兜底) |
| console 什么时候会发生什么 | `docs/CONSOLE.md` — 行为契约; 改 console 前先改它 |
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

## 部署

**第一阶段 — ✅ 已 LIVE**: https://ender-s-blog.pages.dev/ (Cloudflare **Pages**, 连 GitHub `main`, 每 push 自动重建). 站带 `noindex`, 未换正式域名.

<details><summary>当时怎么建的(备查; 重建或换账号时用)</summary>

⚠ 走 **Pages** 流程, 不是 **Workers**. 若界面标题是 "Configure your Worker project"、要你填 "Deploy command"(`npx wrangler deploy`)—— 那是 Workers, 会报 `Missing entry-point`, 退出重选. Pages 流程没有 deploy 命令栏, 建完自动部署.
1. dash.cloudflare.com → **Workers & Pages** → **Create** → 切 **Pages** 标签 → **Connect to Git** → 选 `Ender-Jones/Ender-s-Blog`.
2. Framework preset **Astro**; Build command `npm run build`; Build output `dist`; 环境变量 `NODE_VERSION` = `22`.
3. **Save and Deploy**.
</details>

**第二阶段 — ✅ 已 LIVE(2026-07-11)**: console 直写 D1 工作区, close-the-day 由 Pages Function 编 markdown 提交进 git(首个真实提交 891b91f). `/console/` 与 `/api/*` 由 Cloudflare Access 保护(邮箱验证码, 会话 24h); AUD/team 域名在 `wrangler.toml` 的 `[vars]`, 真机密只有 Pages Secret 里的 `GITHUB_TOKEN`(一年一换, 见 docs/MAINTENANCE.md). 行为契约: `docs/CONSOLE.md`. 当时的截图级搭建步骤已按印的要求删除 — 要重建, 翻 git 历史(commit `5f12838` 时的 README).

**Go-live 清单(换正式域名那天):**
1. CF 构建环境配 `GITHUB_TOKEN`(读 contributions), commit 墙每次构建自动新鲜; 先手动 `npm run activity:cache` 刷一次快照.
2. 每日 04:00 JST 定时重建(deploy hook + GitHub Actions cron).
3. 移除主页 `noindex`; 加 sitemap(@astrojs/sitemap + astro.config 填正式域名).
4. giscus 主题核对.

## TODO(当前, 按要紧程度; 完成一条删一条)

字体已定稿(V2 三件套, Lexend 否决, type-lab 已删); 站已 live. 剩:

**印 要做的**
1. 翻译 `src/content/posts/zh/` — 研究笔记(评估指标)已有全文初译, 等你过目改口吻; 剩 prompt 随笔 → who-am-i(诗可豁免); 顺便定 research 页要不要中文(倾向: 不要).
2. 极端字号档已上线 — 有空说读感(回退/微调=改 tokens.css 8 行).
3. 「搜索磁铁」post 选题(⚠ 站还 noindex, 收益等换域名后兑现; 动笔前先做 SERP 调查确认没被人写死).
   起因与公式(2026-07-12): 某博客的 ghostty cheatsheet 一 google 即中、印自己也停留很久 — 完美信号 = 明确意图的查询 × 弱竞争 SERP × 首屏即答案(表/图/可抄代码) × 长效话题 × 真是自己的地盘. 停留时长正中 Google 的"上一个用户行为"黑灯测试.
   初筛(2026-07-12, 印过目后的短名单; 全部只写工具/方法, 不碰未发表数字):
   - ⭐ **交叉验证下比较两个模型**的统计检验 cheatsheet(corrected paired t-test / Nadeau–Bengio + Hedges' g, 可抄 python)— 角度就写"给数学白痴的"(印自评), 他自己是第一读者
   - ⭐ zh: **数据泄漏 checklist**(subject-level vs record-level split 对照表, 与 "reproducible evaluation" 人设同频)
   - ⭐ **UBFC-Phys 数据集实用手册**(目录结构/T1-T3 语义/采样率/坑; 只写数据集事实)
   - 备选: MediaPipe 478 landmark 速查图 / zh CF Pages+D1+Access 踩坑记 / pyVHR rPPG 一表流

**共写**
4. ADHD worklog 方法论 essay(About 页 "a longer essay is coming" 的兑现).

**红线备忘**: 站上不放公开简历/CV 下载, 不放照片, 不放直达本名的外链(IEICE 技报页因此不挂).

**换正式域名那天**(见上「部署 · Go-live 清单」): 移 noindex + sitemap + 04:00 cron + activity 刷新.

**低优先**
5. 真机移动端过一遍; photography 区设计; quotes.yml 扩充.

## 血统

V1 Jekyll (`Ender-Jones.github.io`, 已归档) → V2 Astro (`personal_blog_astro`, 内容与工程层的来源) → V3(本仓库, claude design 交接的「暗房里的生命体征」设计).
