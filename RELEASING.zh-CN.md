# sprite-pet 发布流程

[English](./RELEASING.md) · [简体中文](./RELEASING.zh-CN.md)

`package.json` 是版本号唯一来源。稳定版本遵循 SemVer，使用带注释的 `vX.Y.Z` Git Tag，并发布到 npm 的 `latest` dist-tag。项目没有二进制附件，因此 GitHub Release 不是必需交付面；npm 与 Git Tag 才是正式交付面。

## 发布前

1. 从干净且与 `origin/main` 同步的 `main` 分支开始。
2. 确定 SemVer 变更，并同时更新 `package.json` 和 `pnpm-lock.yaml`。
3. 面向用户的行为发生变化时，同时更新中英文公开文档。
4. 运行 `pnpm release:check`。
5. 检查打包文件，确认不包含 `demo/`、`pets/`、密钥或本地产物。
6. 使用 `chore(release): prepare vX.Y.Z` 提交，并创建带注释的 `vX.Y.Z` Tag。

## 发布说明

每个已发布版本都应先提供简洁英文说明，再提供中文说明，覆盖用户可见变化、兼容性说明和迁移步骤。没有相关变化时不要编造记录。

## 发布与验证

npm 发布必须得到明确授权并具备相应凭据。推送发布提交和 Tag，通过仓库支持的 npm 流程发布，然后独立验证：

- `origin/main` 和 `vX.Y.Z` 指向预期提交；
- 该提交对应的 CI 与 Pages 工作流成功；
- npm 上存在 `X.Y.Z`，且 dist-tag 正确；
- 公开压缩包包含运行时、类型声明、许可证和两份 README，但不含宠物素材；
- 全新消费者能够导入公开包；
- Pages 首页、JavaScript、CSS、目录和至少一个下载均可访问。

任何远程步骤失败后，应先检查分支、Tag、npm 版本、dist-tag、工作流与工作区，再决定是否重试。不得复用或覆盖已经发布的版本号。
