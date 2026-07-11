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

**第一阶段 — ✅ 已 LIVE**: https://ender-s-blog.pages.dev/ (Cloudflare **Pages**, 连 GitHub `main`, 每 push 自动重建). 站带 `noindex`, 未换正式域名. `/console/` 仍是 LOCAL MODE, 三个 `/api/*` 会 500(`wrangler.toml` 的 D1 绑定第一阶段注释掉了)—— 正常, 等第二阶段.

<details><summary>当时怎么建的(备查; 重建或换账号时用)</summary>

⚠ 走 **Pages** 流程, 不是 **Workers**. 若界面标题是 "Configure your Worker project"、要你填 "Deploy command"(`npx wrangler deploy`)—— 那是 Workers, 会报 `Missing entry-point`, 退出重选. Pages 流程没有 deploy 命令栏, 建完自动部署.
1. dash.cloudflare.com → **Workers & Pages** → **Create** → 切 **Pages** 标签 → **Connect to Git** → 选 `Ender-Jones/Ender-s-Blog`.
2. Framework preset **Astro**; Build command `npm run build`; Build output `dist`; 环境变量 `NODE_VERSION` = `22`.
3. **Save and Deploy**.
</details>

**第二阶段 — ✅ 已 LIVE(2026-07-11)**: console 直写 D1 工作区, close-the-day 由 Pages Function 编 markdown 提交进 git(首个真实提交 891b91f). `/console/` 与 `/api/*` 由 Cloudflare Access 保护(邮箱验证码, 会话 24h). 当时怎么建的(备查; 重建/换账号/换 team 时用):

<details><summary>Step 1 — D1 建库 + 跑 schema(约 3 分钟)</summary>

1. dash.cloudflare.com → 左栏 **Storage & Databases** → **D1 SQL Database** → **Create Database**.
2. 名字必须是 `enders-blog-worklog`(和 `wrangler.toml` 里的 database_name 一字不差), 其余默认 → **Create**.
3. 建好的库页面顶部有 **Database ID**(一串 UUID)→ 复制, 丢给 Claude(它负责回填 wrangler.toml 并解注释 D1 绑定).
4. 同页切到 **Console** 标签 → 把仓库 `schema/d1.sql` 的全文粘进去 → **Execute**. 左侧 Tables 出现 `lines` 表 = 成功.
   (习惯命令行的话等价于: `npx wrangler d1 execute enders-blog-worklog --remote --file=schema/d1.sql`, 需要先 `npx wrangler login`.)
</details>

<details><summary>Step 2 — Access 锁住 /console/ 和 /api/(约 8 分钟, 只做一次)</summary>

1. Pages 项目 `ender-s-blog` → **Settings** → **General** → **Enable access policy**. 第一次用会把你带进 Zero Trust 开通流程: team 名随便起但记住它(`<team名>.cloudflareaccess.com` 待会要用), 套餐选 **Free**(可能要求绑卡, 免费档不扣费).
   这个开关本身只锁"预览部署"(带哈希前缀的 *.pages.dev 网址)— 顺带的好事, 主域上的两条路径还得下一步手动加.
2. one.dash.cloudflare.com(Zero Trust)→ **Access controls** → **Applications**(老界面叫 Access → Applications)→ 找到刚自动生成的 `ender-s-blog` 应用 → 编辑(Configure).
3. 在 public hostname 区 **Add public hostname** 加两条(自带的 `*.ender-s-blog.pages.dev` 那条保留):
   - Domain `ender-s-blog.pages.dev` · Path `console`
   - Domain `ender-s-blog.pages.dev` · Path `api`
4. **Policies**: 打开自带的 policy → Action = **Allow**, Include 改成 Selector **Emails** = 你自己的邮箱(默认那条"本 Cloudflare 账户成员"也能用, 但写死邮箱最明确). 登录方式不用配 — 默认 One-time PIN, 邮箱收验证码.
5. 保存后在应用编辑页复制 **Application Audience (AUD) Tag**(一长串十六进制, 藏在 **Additional settings** 折叠区里, 不在第一屏)→ 这就是 `ACCESS_AUD` 的值.
6. `ACCESS_TEAM_DOMAIN` 的值 = `<team名>.cloudflareaccess.com`(忘了 team 名: Zero Trust → Overview 右侧 Account details 里写着).
7. AUD 和 team 域名**不是机密**, 直接写在 `wrangler.toml` 的 `[vars]` 里(已写); 换 team/重建应用时改那两行即可.
</details>

<details><summary>Step 3 — fine-grained PAT(约 3 分钟; 一年一换, 换法见 docs/MAINTENANCE.md)</summary>

GitHub → 头像 → **Settings** → 左栏最底 **Developer settings** → **Personal access tokens → Fine-grained tokens** → **Generate new token**:
- Token name `enders-blog-console`, Expiration **1 year**;
- Repository access = **Only select repositories** → 只勾 `Ender-s-Blog`;
- **Permissions → Repository permissions → Contents = Read and write**(其余全部不动);
- **Generate** → 复制(只显示这一次, 丢了就重新生成一个).
</details>

<details><summary>Step 4 — 三个环境变量 + 收尾验收</summary>

1. dash.cloudflare.com → **Workers & Pages** → `ender-s-blog` → **Settings** → **Variables and Secrets**(旧名 Environment variables)→ 给 **Production** 加一条: `GITHUB_TOKEN` = Step 3 的 PAT, 类型选 **Secret**.
   (`ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` 不用加 — 它们不是机密, 已经写在 wrangler.toml 的 `[vars]` 里.)
2. 把 Step 1 的 **Database ID** 丢给 Claude → 它回填 wrangler.toml、把 console 从 LOCAL MODE 切到 `/api`、push(这次部署会同时带上新变量和 D1 绑定).
3. 验收: 无痕窗口开 https://ender-s-blog.pages.dev/console/ → 应先撞 Access 验证码页 → 进去录一行 → 刷新页面它还在(说明进了 D1)→ close the day → 仓库自动多一个 `worklog: close YYYY-MM-DD` 的 commit.
</details>

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

**共写**
3. ADHD worklog 方法论 essay(About 页 "a longer essay is coming" 的兑现).

**红线备忘**: 站上不放公开简历/CV 下载, 不放照片, 不放直达本名的外链(IEICE 技报页因此不挂).

**换正式域名那天**(见上「部署 · Go-live 清单」): 移 noindex + sitemap + 04:00 cron + activity 刷新.

**低优先**
5. 真机移动端过一遍; photography 区设计; quotes.yml 扩充.

## 血统

V1 Jekyll (`Ender-Jones.github.io`, 已归档) → V2 Astro (`personal_blog_astro`, 内容与工程层的来源) → V3(本仓库, claude design 交接的「暗房里的生命体征」设计).
