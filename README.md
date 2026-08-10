# sprite-pet

English | [简体中文](README.zh-CN.md)

A framework-agnostic TypeScript browser-pet runtime. It renders deterministic sprite-sheet animation with Canvas and keeps artwork outside the npm package.

## [Full English documentation →](https://github.com/cixiangtao/sprite-pet#readme)

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

The package contains the renderer, behavior model, TypeScript declarations, and sprite-sheet contract. Downloadable artwork shown in the repository is governed separately by [THIRD_PARTY_ASSETS.md](https://github.com/cixiangtao/sprite-pet/blob/main/THIRD_PARTY_ASSETS.md) and is not included in the MIT-licensed npm artifact.

## License

[MIT](LICENSE) for the renderer source.
