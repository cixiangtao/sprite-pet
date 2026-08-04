# Built-in pets

[English](#english) · [简体中文](#简体中文)

## English

This directory is the source of truth for the pets shown on the sprite-pet website. Each pet keeps
the portable two-file layout:

```text
guga/
├── pet.json
└── spritesheet.webp
```

The website packages those two files together with `NOTICE.md` as an on-demand ZIP. The generated
archives live only in the website build and are not committed.

These assets are excluded from the npm package and are not covered by the renderer's MIT License.
Read [NOTICE.md](./NOTICE.md) and [THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md) before reuse.

The repository owner has confirmed explicit authorization for this project to publish these files;
that authorization does not automatically grant downstream reuse rights.

## 简体中文

本目录是 sprite-pet 网站内置宠物的事实来源。每个宠物采用可移植的双文件结构：

```text
guga/
├── pet.json
└── spritesheet.webp
```

网站会把这两个文件和 `NOTICE.md` 组合为按需下载的 ZIP。生成的压缩包只存在于网站构建产物中，不会提交到仓库。

这些素材不会进入 npm 包，也不受渲染器 MIT License 覆盖。仓库所有者已确认本项目获得发布这些指定文件的明确授权，但该授权不会自动授予下游复用权。复用前请阅读 [NOTICE.md](./NOTICE.md) 和 [THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md)。
