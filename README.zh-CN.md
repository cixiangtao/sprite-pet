# sprite-pet

[English](README.md) | 简体中文

一个框架无关的 TypeScript 浏览器宠物运行时。它使用 Canvas 渲染确定性的精灵图动画，并让角色美术素材与 npm 包保持分离。

## [完整中文文档 →](https://github.com/cixiangtao/sprite-pet/blob/main/.github/README.zh-CN.md)

```bash
pnpm add sprite-pet
```

```ts
import { SpritePetWidget } from "sprite-pet";

const pet = new SpritePetWidget({
  canvas: document.querySelector("canvas"),
  manifest: {
    id: "my-pet",
    displayName: "My Pet",
    spritesheetPath: "/pets/my-pet/spritesheet.webp",
  },
});

pet.start();
```

npm 包包含渲染器、行为模型、TypeScript 声明与精灵图契约，不包含仓库中展示和下载的角色美术素材。素材受 [THIRD_PARTY_ASSETS.md](https://github.com/cixiangtao/sprite-pet/blob/main/THIRD_PARTY_ASSETS.md) 单独约束，不属于 MIT 授权的 npm 产物。

## 许可证

渲染器源码使用 [MIT](LICENSE)。
