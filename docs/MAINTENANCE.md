# 维护手册 — 精简版

只写"什么时候 + 干什么 + 去哪干". 平时不用看这个文件.

## 现在就有效

**录入台挂了 / 不想用录入台** — 直接手写:
打开 `src/content/worklogs/YYYY-MM.md`, 追加一节, git push. 系统把手写和录入台写的一视同仁.

**构建红了** — `npm run build` 本地看报错; 最常见原因是文章用了 `src/data/tags.yml` 里没注册的 tag(去注册一下).

**部署坏了想回滚** — Cloudflare Pages → 项目 → Deployments → 选上一个成功的 → Rollback.

**觉得字太小/太大** — 改 `src/styles/tokens.css` 里 `--ej-fs-*` 那 8 行(全站字号只从这里取), 一行管一档. 想换字体也是同一文件顶部的三个 `--ej-serif/mono/sans`.

## 录入台上线后才生效(现在不用做)

**PAT 一年一换.**
PAT(Personal Access Token)= 一把代替你 GitHub 密码的钥匙, 但被削成只能开一扇门: 本仓库的文件读写. 它放在 Cloudflare 的服务器上, 让录入台能替你 commit. GitHub 规定这种钥匙最长一年有效, 到期前 GitHub 会给你发邮件.
换法(约 3 分钟): GitHub → Settings → Developer settings → Fine-grained tokens → Generate new → 只勾选本仓库 + Contents: Read and write + 期限 1 年 → 复制 → Cloudflare Pages 项目 → Settings → Environment variables → 更新 `GITHUB_TOKEN` → Save 并重新部署.

**手机丢了 / 换设备.**
Cloudflare → Zero Trust → Access → 撤销那台设备的会话(session). 名单里只有你自己, 别人本来也进不来.

**每日自动重建没跑.**
仓库 `.github/workflows/` 里有个定时任务, 每天 04:00 JST 戳一次 Cloudflare 重建(让 commit 墙对齐"今天"; 定在 4 点是因为你常干活到凌晨). GitHub Actions 页面能看到它跑没跑; 挂了也不致命, 你任何一次 push 都会顺带重建.

## 一年一遇

- `npm outdated` 看看依赖有没有落后太多; 不强求追新.
- 域名/证书由 Cloudflare 自动续, 不用管.
