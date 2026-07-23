# 维护手册 — 精简版

只写"什么时候 + 干什么 + 去哪干". 平时不用看这个文件.

## 现在就有效

**录入台挂了 / 不想用录入台** — 直接手写:
打开 `src/content/worklogs/YYYY-MM.md`, 追加一节, git push. 系统把手写和录入台写的一视同仁.

**构建红了** — `npm run build` 本地看报错; 最常见原因是文章用了 `src/data/tags.yml` 里没注册的 tag(去注册一下).

**部署坏了想回滚** — Cloudflare Pages → 项目 → Deployments → 选上一个成功的 → Rollback.

**觉得字太小/太大** — 改 `src/styles/tokens.css` 里 `--ej-fs-*` 那 8 行(全站字号只从这里取), 一行管一档. 想换字体也是同一文件顶部的三个 `--ej-serif/mono/sans`.

## 录入台上线后生效(2026-07-11 起已生效)

**PAT 一年一换.**
PAT(Personal Access Token)= 一把代替你 GitHub 密码的钥匙, 但被削成只能开一扇门: 本仓库的文件读写. 它放在 Cloudflare 的服务器上, 让录入台能替你 commit. GitHub 规定这种钥匙最长一年有效, 到期前 GitHub 会给你发邮件.
换法(约 3 分钟): GitHub → Settings → Developer settings → Fine-grained tokens → Generate new → 只勾选本仓库 + Contents: Read and write + 期限 1 年 → 复制 → Cloudflare Pages 项目 → Settings → Environment variables → 更新 `GITHUB_TOKEN` → Save 并重新部署.

**手机丢了 / 换设备.**
Cloudflare → Zero Trust → Access → 撤销那台设备的会话(session). 名单里只有你自己, 别人本来也进不来.

**每日自动重建挂了(它会自己告诉你).**
`.github/workflows/nightly-rebuild.yml` 每天 04:00 JST 戳一次 Cloudflare 的 deploy hook 让它重建(让 commit 墙对齐"今天"; 定在 4 点是因为你常干活到凌晨). 挂了会红叉 → GitHub 按你的通知设置发邮件; 配了 repo secret `NTFY_URL` 的话还会往手机推一条.
收到告警, 点通知里的 run 链接看日志:
- 写着 `CF_DEPLOY_HOOK is not configured` = 那个 secret 没了 → Cloudflare Pages → 项目 → Settings → Build → Deploy hooks 建一个指向 `main` 的 hook, 复制 URL, 再 `gh secret set CF_DEPLOY_HOOK --repo Ender-Jones/Ender-s-Blog` 粘进去.
- curl 报错 = Cloudflare 那头抽风, 隔天自己好就别管; 连着几天不好再去 CF 看 hook 还在不在.
不致命: 你任何一次 push 都会顺带重建, 这个定时任务只管"连着几天不 push"时的保鲜.
⚠ 仓库连续 60 天没有任何活动, GitHub 会自动停掉定时任务(会发邮件), 去 Actions 页面点一下重新启用即可.

## 一年一遇

- `npm outdated` 看看依赖有没有落后太多; 不强求追新.
- 域名/证书由 Cloudflare 自动续, 不用管.
