# Changelog

All notable changes to `sprite-pet` are documented here. Releases follow [Semantic
Versioning](https://semver.org/).

## [0.5.1](https://github.com/cixiangtao/sprite-pet/compare/v0.5.0...v0.5.1) (2026-08-10)


### Bug Fixes

* **deps:** keep risky upgrades manual ([#15](https://github.com/cixiangtao/sprite-pet/issues/15)) ([c1717a9](https://github.com/cixiangtao/sprite-pet/commit/c1717a9076860e692e999c305861e029f9eb7813))

## [0.5.0](https://github.com/cixiangtao/sprite-pet/compare/v0.4.0...v0.5.0) (2026-08-07)


### Features

* **demo:** add GitHub and usage guidance ([9c9a856](https://github.com/cixiangtao/sprite-pet/commit/9c9a8560a9cc31e92c3f22ffb67c03bd114b3306))

## 0.4.0 - 2026-08-04

### English

- Added a complete Chinese/English language switch to the public demo, including translated live
  state, metadata, accessible labels, remembered preferences, and shareable `lang` URLs.
- Added complete Chinese versions of the README, contributing guide, security policy, and release
  procedure while keeping English as the default GitHub and npm entry.
- Clarified that this project has explicit permission to display and distribute the bundled demo
  pet files, without granting downstream reuse rights or including artwork in the npm package.
- Pinned GitHub Actions to immutable commit SHAs and expanded browser and package verification for
  the bilingual public surfaces.

Compatibility: there are no runtime API or atlas contract changes. Existing consumers can upgrade
without migration.

### 中文

- 为公开演示加入完整的中英文切换，覆盖实时状态、页面元信息、无障碍标签、语言偏好记忆和可分享的 `lang` 地址。
- 新增完整中文版 README、贡献指南、安全策略和发布流程，同时保留英文作为 GitHub 与 npm 默认入口。
- 明确本项目已获得对内置演示宠物文件进行公开展示与分发的授权，但不会自动授予下游复用权，且 npm 包仍不包含美术素材。
- 将 GitHub Actions 固定到不可变提交，并扩展浏览器与包校验，覆盖双语公开界面。

兼容性：运行时 API 与图集契约均未变化，现有使用者升级时无需迁移。
