# 数据文件地图(src/data/*)

> 与 `docs/WORKLOG.md` / `docs/CONSOLE.md` 同地位: **改任何 yml 之前先看这张表 —
> 它回答三个问题: 这个文件喂哪些页面 / 改完去哪看 / 中英文对照关系是什么.**
> 最后校准: 2026-07-22(逐文件 grep 消费者实测).

## 验证工作流(定论 2026-07-22)

改 yml → `docker compose up site` → localhost:4321 按下表「改完去哪看」逐页眼看 →
没问题就 commit+push. **localhost 过了就算过, push 后不必再上线上复核**(CF Pages
构建与本地 build 同一条命令, 没道理会炸; 结构性错误 pre-commit 的内容检查会先拦).

## 地图

| 文件 | 喂哪些页面 | 改完去哪看 | 中英对照 |
|---|---|---|---|
| `home.yml` | 主页 splash 问候 + hero 三行 + readout 卡; **readout.status 还复用在 About 的 NOW 卡** | `/` 和 `/about/` | zh.yml 只镜像 hero; splash/readout 无中文(⁠/zh/ 是简化着陆页, 非全镜像) |
| `zh.yml` | /zh/ 着陆页 hero + 底部 notes | `/zh/` | 对应 home.yml 的 hero 部分 |
| `about.yml` | About 页全部文案(lead/自述段/essay 链接/三重身份行/ADHD 短节/colophon), 经共享骨架 `components/about/AboutPage.astro` | `/about/` | 与 about.zh.yml 结对, **改内容两边成对动**(MIRROR_PAIRS 盯结构; 文案按"中英分开创作"原则各写各的) |
| `about.zh.yml` | 只喂 `/zh/about/` | `/zh/about/` | 同上 |
| `research.yml` | `/research/` 整页 + **主页 research 面板** | `/research/` + 主页中段 | 与 research.zh.yml 结对, **改内容两边必须同步** |
| `research.zh.yml` | 只喂 `/zh/research/` | `/zh/research/` | 同上 |
| `site.yml` | 文章页 giscus 配置; Research 页头点行(signals/models/stack); About 的 base/role/langs 行 + 联系方式 | `/research/`、`/zh/research/`、`/about/`、任一文章评论区 | **只放语言无关数据**(分界原则 2026-07-22): 中英共用, mono 值保持英文(site chrome); 可译成句一律住语言配对文件 |
| `quotes.yml` | 主页 coda(随机)+ 文章 coda(frontmatter `coda: <id>` 固定, 否则随机) | 主页刷新几次 / 指定文章底部 | 引文原文属于作品, 不翻译 |
| `tags.yml` | tag chip 四色语义 + `/tags/<tag>` 页; 未注册 tag 故意 fail build | 任一文章 tag 行 | 标签全英文, 中英文章共用 |
| `github-activity.json` | 主页 commit 墙 | 不手改 — `npm run activity:cache` 生成 | — |

## 事件→改哪(倒排触发器表)

上面的地图回答"这个文件是什么"; 这张表回答"发生了什么事时该动哪里".
维护原则(2026-07-22 调研定论): **更新靠事件触发, 不靠记性** — 事件发生时对一眼这张表.

| 发生了什么 | 改哪 | 注意 |
|---|---|---|
| 论文状态变化(投稿/接收/见刊) | `research.yml` + `research.zh.yml` **成对** | 投稿日必改清单: home.yml `status` · about.yml mid-turn 段 · research 的 In writing 状态 |
| 新 post 用了新 tag | `tags.yml` 注册 | 不注册 build 故意挂 |
| 换邮箱/社交账号 | `site.yml` socials | 单源: About 联系行与 Footer 胶囊都从这里读(2026-07-22 接线) |
| 头衔/单位/语言变化 | `site.yml` identity | 中英共用, 不翻译 |
| 读到想进 coda 的句子 | `quotes.yml` | 要固定给某篇: 文章 frontmatter `coda: <id>` |
| 自我叙事变化 | `about.yml` + `about.zh.yml` **成对** | 顺带想一下 who-am-i 是否也该动(反之亦然) |
| 研究方向/hero 措辞变化 | `home.yml` hero + `zh.yml` hero **成对** | splash 问候也在 home.yml |
| "现在在干什么"变了 | **不改 yml** — NOW 行走 worklog(console 正门) | home.yml `status` 只在投稿日动 |

## 坑与注意

- **数据 yml 没有 schema 运行时校验**(2026-07-22 核实): zod `.strict()` 只管 content
  collections(posts/worklogs); src/data 的 yml 经 lib/data.ts 类型断言, 拼错/多余的
  字段**静默通过** — validate 脚本只查 tags 注册与 quotes id, 外加双语镜像保险
  (2026-07-22 上线): 镜像对的 key 骨架逐行比对(不一致 fail build)+ git 时间漂移
  (EN 提交晚于 zh 时 warn 不拦). 将来再添镜像对(如 about.zh.yml)记得登记进
  validate 脚本的 `MIRROR_PAIRS`.

- yml 一律经 `src/lib/data.ts` 类型化导出, 组件从不裸 import — 加/删字段要同步改
  data.ts 的类型.
- Research 页头标着 `stack` 的那行读的是 `site.identity.tools`(页面标签与字段名不一致,
  历史原因); 页头斜体 thesis 句住 research.yml/research.zh.yml(2026-07-22 从 site.yml 移入).
- 头像 ang.JPG 不走 yml — Hero/About/Console 三处 CSS 硬编码
  `url('/img/author/ang.JPG')`.
- research.yml 时间线的学历年份(2019 B.S. / 2023 M.S.)是真实年份(2026-07-22 印确认).
