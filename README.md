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

**第一阶段 — 现在就能 live(不动域名, 约 5 分钟点击):**
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → **Create** → **Pages** → Connect to Git → 选 `Ender-Jones/Ender-s-Blog`(首次要授权 GitHub).
2. 构建设置: Framework preset 选 **Astro**; Build command `npm run build`; Build output `dist`; 环境变量加一条 `NODE_VERSION` = `22`.
3. 点 Deploy, 两三分钟后得到 `https://<项目名>.pages.dev` — 之后每次 git push 自动重新部署.
4. 站带着 `noindex`, 搜索引擎不会收录 — 随便看.

第一阶段里 `/console/` 仍是 LOCAL MODE(记在浏览器里), 三个 API 会 500 — 正常, 它们等的是第二阶段.

**第二阶段 — console 真联网(等你想做时, 我给截图级步骤):**
D1 建库回填 `wrangler.toml` 的 database_id + 跑 `schema/d1.sql` → Pages 项目绑定 EJ_DB → Access 保护 `/console/` 和 `/api/*`(配 ACCESS_TEAM_DOMAIN/ACCESS_AUD)→ 环境变量放 fine-grained `GITHUB_TOKEN`(只给本仓库 contents 写权限).

**Go-live 清单(换正式域名那天):**
1. CF 构建环境配 `GITHUB_TOKEN`(读 contributions), commit 墙每次构建自动新鲜; 先手动 `npm run activity:cache` 刷一次快照.
2. 每日 04:00 JST 定时重建(deploy hook + GitHub Actions cron).
3. 移除主页 `noindex`; 加 sitemap(@astrojs/sitemap + astro.config 填正式域名).
4. giscus 主题核对.

## TODO(当前, 按要紧程度; 完成一条删一条)

**印 要做的**
1. 部署第一阶段(上面 5 分钟点击)→ 把 pages.dev 地址发给 Claude.
2. 字体已定(V2 三件套, 已全站换装); 极端字号档已试穿 — **用两天, 说读感**(回退/微调=改 tokens.css 8 行).
3. `/dev/type-lab/` 只剩 Lexend 长文样张 — 看完说"删".
4. 翻译 `src/content/posts/zh/` 4 篇(建议顺序: 研究笔记 → prompt 随笔 → who-am-i; 诗可豁免); 顺便定 research 页要不要中文(倾向: 不要).

**共写**
5. ADHD worklog 方法论 essay(About 页 "a longer essay is coming" 的兑现).

**机器侧(待触发)**
6. 部署第二阶段(D1/Access/PAT)截图级步骤 — 等第一阶段完成.
7. console 前端从 LOCAL MODE 切到 /api(第二阶段之后).

**红线备忘**: 站上不放公开简历/CV 下载, 不放照片, 不放直达本名的外链(IEICE 技报页因此不挂).

**低优先**
8. 真机移动端过一遍; photography 区设计; quotes.yml 扩充.

## 血统

V1 Jekyll (`Ender-Jones.github.io`, 已归档) → V2 Astro (`personal_blog_astro`, 内容与工程层的来源) → V3(本仓库, claude design 交接的「暗房里的生命体征」设计).
