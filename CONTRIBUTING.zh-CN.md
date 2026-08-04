# 贡献指南

[English](./CONTRIBUTING.md) · [简体中文](./CONTRIBUTING.zh-CN.md)

感谢你帮助改进 `sprite-pet`。

## 开发

环境要求：

- Node.js 24
- pnpm 10.34.5

安装依赖并运行本地门禁：

```bash
pnpm install
pnpm check
pnpm test:browser
```

使用 `pnpm dev` 打开互动演示。请保持修改聚焦，为运行时行为补充行为测试，并且不要提交第三方宠物素材或生成的包压缩文件。

## Pull Request

- 说明面向用户的行为和修改动机。
- 为运行时行为新增或更新测试。
- 保持 `pnpm release:check` 通过。
- 明确指出对图集或清单契约的修改。

安全问题请遵循 [SECURITY.zh-CN.md](./SECURITY.zh-CN.md)，不要创建公开 Issue。维护者准备版本时还应遵循 [RELEASING.zh-CN.md](./RELEASING.zh-CN.md)。
