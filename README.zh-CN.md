# sprite-pet

[English](./README.md) · [简体中文](./README.zh-CN.md)

`sprite-pet` 是一个小巧、框架无关的 TypeScript 浏览器宠物运行时。它把语义化网页行为与源图集状态名分开，同时保留精确帧时长，并同时提供 CSS 雪碧图运行时和原有的高 DPI Canvas 渲染器。

npm 包不包含任何角色美术素材。仓库所有者已确认，本项目获得对 `pets/` 中指定文件进行公开展示与分发的明确授权；该项目级授权不会把素材纳入 MIT License，也不会自动授予下游复用权。详情见 [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md)。

[打开在线演示](https://cixiangtao.github.io/sprite-pet/?lang=zh-CN)，可以选择宠物、触发行为、查看源状态映射，并体验悬浮、拖动、缩放和宠物包下载。

## 功能

- 支持待机、活动、悬停、点击、拖动、休息、受惊和庆祝的语义行为状态机
- 零运行时依赖的 CSS 雪碧图与 Canvas 渲染器
- 支持方向动画和非均匀帧时长的 Codex 图集适配器
- 负责指针监听、拖动、尺寸与完整清理的 DOM 交互运行时
- 支持视口约束、按比例缩放和键盘操作的悬浮 Canvas 宠物
- 从可移植宠物包生成的内置宠物下载目录
- 远程 URL 与浏览器本地文件加载 API
- 对单一 8×9 图集契约的精确校验
- 基于 tsdown 构建的 ESM 包与 TypeScript 类型声明

## 安装

```bash
pnpm add sprite-pet
```

## 行为运行时

将清单和图片放在同一站点：

```text
public/pets/momo/
├── pet.json
└── spritesheet.webp
```

```html
<div id="pet-shell">
  <span id="pet-sprite"></span>
</div>
```

```ts
import { PetRuntime, loadCodexPet } from "sprite-pet";

const spec = await loadCodexPet("/pets/momo/pet.json");
const interactionElement = document.querySelector<HTMLElement>("#pet-shell");
const spriteElement = document.querySelector<HTMLElement>("#pet-sprite");
if (interactionElement === null || spriteElement === null) throw new Error("缺少宠物宿主");

const pet = new PetRuntime({
  spec,
  interactionElement,
  spriteElement,
  onDragMove: ({ deltaX, deltaY }) => {
    // 宿主负责布局，可以根据拖动增量移动外层容器。
  },
});

pet.start();
pet.trigger("celebrate");
```

`PetRuntime` 负责行为、指针监听和动画渲染；布局与持久化仍由宿主负责。移除宿主时请调用 `pet.destroy()`。

## Canvas 小组件

```ts
import { SpritePetWidget, loadSpritePet } from "sprite-pet";

const source = await loadSpritePet("/pets/momo/pet.json");
const pet = new SpritePetWidget({ source, width: 192, floating: true });
pet.setState("working");
```

悬浮小组件默认出现在视口右下角。可以拖动宠物移动，并通过右下角手柄按比例缩放。使用 `setFloating()`、`moveTo()`、`resize()` 和 `destroy()` 可以控制完整生命周期。

## 浏览器本地文件

网页不能直接读取用户电脑上的任意文件。让用户通过 `<input type="file">` 选择清单和图片，然后在浏览器内加载：

```ts
import { loadSpritePetFiles } from "sprite-pet";

const source = await loadSpritePetFiles({
  manifest: manifestFile,
  spritesheet: spritesheetFile,
});
```

文件不会被上传。

## 宠物包格式

### `pet.json`

```json
{
  "id": "momo",
  "displayName": "Momo",
  "description": "一只小小的动画伙伴。",
  "spritesheetPath": "spritesheet.webp"
}
```

### 图集几何

雪碧图必须严格为 `1536×1872`：8 列、9 行，每格 `192×208`。

| 行  | 状态         |
| --- | ------------ |
| 0   | `idle`       |
| 1   | `move-right` |
| 2   | `move-left`  |
| 3   | `wave`       |
| 4   | `jump`       |
| 5   | `failure`    |
| 6   | `waiting`    |
| 7   | `working`    |
| 8   | `reviewing`  |

指针跟随复用 `move-right` 和 `move-left`，不需要额外图集数据。

## 主要 API

- `loadCodexPet()`：加载并校验 Codex 宠物包，保留方向行和原始帧时长。
- `adaptCodexPet()`：把已加载清单转换为 `UnifiedPetSpec`。
- `PetBehaviorMachine`：纯事件驱动、可确定性测试的行为状态机。
- `CssSpriteRenderer`：把行为快照渲染到现有 DOM 元素。
- `PetRuntime`：连接状态机、CSS 渲染、指针输入、拖动和缩放。
- `loadSpritePet()` / `loadSpritePetFiles()`：加载远程或本地宠物包。
- `SpritePetWidget`：拥有 DOM、悬浮布局与交互的 Canvas 小组件。
- `SpritePetRenderer`：供已有 Canvas 和布局系统使用的底层渲染器。
- `parseSpritePetManifest()` / `validateSpritePetDimensions()`：校验不可信清单和图集尺寸。

所有公共 API 都提供类型声明和 JSDoc。完整的参数说明以类型声明和[英文 API 文档](./README.md#api)为准。

## 开发

```bash
pnpm install
pnpm sync:pets
pnpm dev
pnpm check
pnpm test:browser
pnpm verify:package
```

`pnpm dev` 会把内置目录与 `${CODEX_HOME:-~/.codex}/pets` 下的有效本地宠物合并。该本地路由仅存在于开发服务器中，本地素材不会复制到 `demo-dist` 或 npm 包。

`pnpm release:check` 是完整的本地发布门禁。维护者在修改版本、创建 Tag 或发布 npm 包前，还应遵循[双语发布流程](./RELEASING.zh-CN.md)。已发布变化记录在[更新日志](./CHANGELOG.md)中。

欢迎贡献。请阅读 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)，安全问题请通过 [SECURITY.zh-CN.md](./SECURITY.zh-CN.md) 中的私密渠道报告。

## 许可证与素材

渲染器源码采用 [MIT License](./LICENSE)。可下载宠物素材已获本项目公开分发授权，但不属于 MIT License；在其他地方发布或复用前，请阅读 [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md)。
