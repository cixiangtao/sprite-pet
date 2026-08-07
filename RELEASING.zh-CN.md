# sprite-pet 发布流程

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

`package.json` 是版本号唯一来源。稳定版本遵循 SemVer，使用带注释的 `vX.Y.Z` Git Tag，并发布到 npm 的 `latest` dist-tag。项目没有二进制附件，因此 GitHub Release 不是必需交付面；npm 与 Git Tag 才是正式交付面。

## 准备 Release PR

1. 从干净且与 `origin/main` 同步的 `main` 分支开始。
2. 创建名称严格为 `release/vX.Y.Z` 的分支。
3. 运行 `pnpm release:prepare X.Y.Z`，同时更新 `package.json` 和 `pnpm-lock.yaml`。
4. 在 `CHANGELOG.md` 中加入 `X.Y.Z` 记录，先写英文，再写中文。
5. 面向用户的行为发生变化时，同时更新中英文公开文档。
6. 运行 `pnpm release:check`，再检查打包文件，确认不包含 `demo/`、`pets/`、密钥或本地产物。
7. 只提交 `package.json`、`pnpm-lock.yaml` 和 `CHANGELOG.md`，提交信息使用
   `chore(release): prepare vX.Y.Z`；推送分支并向 `main` 创建 Pull Request。

Release PR 被有意限制为以上三个文件。文档或实现变更必须在更早的 PR 中完成评审并合入。

## 发布说明

每个已发布版本都应先提供简洁英文说明，再提供中文说明，覆盖用户可见变化、兼容性说明和迁移步骤。没有相关变化时不要编造记录。

## 发布与验证

必需检查通过后，在 GitHub 上合并 Release PR。`Release npm package` 工作流只接受已经合并、
分支名严格为 `release/vX.Y.Z`、版本号与分支匹配，且改动文件符合发布白名单的 PR。之后工作流会构建
唯一一份 npm 产物，创建带注释的 `vX.Y.Z` Tag，并通过 npm Trusted Publishing 发布该产物。

不要在本地创建或推送发布 Tag，也不要从开发机运行 `npm publish`。直接提交到 `main`、普通功能 PR，
或混入无关文件的 Release PR 都没有发布资格。其他尚未关闭且与本次发布无关的 PR 不会阻塞合法的 Release PR。

工作流完成后，独立验证：

- `origin/main` 和 `vX.Y.Z` 指向预期提交；
- 该提交对应的 CI 与 Pages 工作流成功；
- npm 上存在 `X.Y.Z`，且 dist-tag 正确；
- 公开压缩包包含运行时、类型声明、许可证和两份 README，但不含宠物素材；
- 全新消费者能够导入公开包；
- Pages 首页、JavaScript、CSS、目录和至少一个下载均可访问。

任何远程步骤失败后，应先检查 Release PR、分支、Tag、npm 版本、dist-tag、工作流与工作区，再决定是否重试。不得复用或覆盖已经发布的版本号。
