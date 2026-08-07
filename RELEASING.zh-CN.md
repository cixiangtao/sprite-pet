# sprite-pet 发布流程

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

GitHub Actions 是 npm 与 GitHub Release 的唯一正式发布者。Release Please 会自动创建或持续更新
发版 PR，维护者无需在本地升版本、打 tag 或发布。

## 日常流程

1. 普通产品改动先通过 PR、必需检查和评审合入受保护的 `main`；其他无关 PR 可以保持打开。
2. Release Please 从 `release-please--branches--main--...` 分支持续更新唯一的自动发版 PR。
   Conventional Commit 或 squash merge 标题决定建议版本与 `CHANGELOG.md`：`fix` 为 patch，`feat`
   为 minor，`!` 或 `BREAKING CHANGE` 为 major。
3. 检查发版 PR 的受限 diff、建议版本、中英文 Changelog 和 CI，确认积累的改动可以发布后再合并。
4. `.github/workflows/release.yml` 会反查这次发版 PR 合并，完成构建和打包，再创建 `vX.Y.Z`、
   通过 npm trusted publishing 发布已检查的产物，并创建对应 GitHub Release。
5. 独立核对 tag 指向、GitHub Release 状态、npm 版本与 dist-tag、公开 tarball、全新消费者导入和
   Pages 站点。

普通 PR 合并不会发布。不要在工作站手工改版本、创建或推送发版 tag，也不要运行 `npm publish`。
文档和实现改动应通过普通 PR，而不是夹带在自动发版 PR 中。

## 自动化凭据与失败恢复

仓库需要配置 Actions variable `RELEASE_APP_CLIENT_ID` 和 secret
`RELEASE_APP_PRIVATE_KEY`，对应一个已安装到本仓库、具有 Contents、Issues、Pull requests
读写权限的 GitHub App。使用 App token 可让自动发版 PR 的必需 CI 无人值守运行；默认
`GITHUB_TOKEN` 创建的 PR 目前需要维护者另行批准工作流。

远端步骤失败时，先检查已合并发版 PR、工作流、tag、GitHub Release、npm 版本和 dist-tag，再重跑
同一工作流。不要复用或覆盖已经公开的版本。
