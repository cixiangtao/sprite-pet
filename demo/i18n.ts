import type { PetBehavior } from "../src/index.js";

/** Locales supported by the public sprite-pet demo. */
export const DEMO_LOCALES = ["zh-CN", "en"] as const;

/** One language available in the public sprite-pet demo. */
export type DemoLocale = (typeof DEMO_LOCALES)[number];

/** Static copy keys rendered directly into the demo document. */
export interface DemoStaticMessages {
  headline: string;
  lede: string;
  celebrate: string;
  surprise: string;
  activate: string;
  floatingTitle: string;
  floatingDescription: string;
  petLibraryTitle: string;
  discoveringPets: string;
  sourceAnimation: string;
  webBehavior: string;
  loadingPet: string;
  readyHint: string;
  downloadPet: string;
  languageLabel: string;
  interactionControls: string;
  petList: string;
  petDemo: string;
  petControls: string;
  petInteraction: string;
  petResize: string;
  githubLinkLabel: string;
  guideTitle: string;
  guideLede: string;
  installTitle: string;
  installDescription: string;
  bundleTitle: string;
  bundleDescription: string;
  createTitle: string;
  createDescription: string;
  projectLinksLabel: string;
  fullDocumentation: string;
  npmPackage: string;
  quickStart: string;
}

interface DemoMessages {
  title: string;
  description: string;
  staticText: DemoStaticMessages;
  behaviorLabels: Record<PetBehavior, string>;
  floatingStatus: (enabled: boolean) => string;
  resizeLabel: (width: number) => string;
  petInteractionLabel: (name: string) => string;
  petDownloadLabel: (name: string) => string;
  wakingPet: (name: string) => string;
  discoveredPets: (count: number) => string;
  loadFailure: string;
  emptyCatalog: string;
  documentationUrl: string;
}

const demoMessages = {
  "zh-CN": {
    title: "sprite-pet · 行为运行时",
    description: "体验支持中英文的 sprite-pet 行为运行时与 8×9 宠物图集。",
    staticText: {
      headline: "让旧雪碧图，拥有新的生活。",
      lede: "不再依赖对话状态。它会观察鼠标、回应点击、跟随拖动，也会自己发呆、活跃和休息。",
      celebrate: "一起庆祝",
      surprise: "吓它一跳",
      activate: "让它活动",
      floatingTitle: "页面悬浮",
      floatingDescription: "让宠物覆盖在当前网页上方",
      petLibraryTitle: "选择宠物",
      discoveringPets: "正在发现本机宠物…",
      sourceAnimation: "Codex 原动画",
      webBehavior: "Web 宠物行为",
      loadingPet: "正在载入…",
      readyHint: "试试靠近、点击、拖动，或调节右下角大小",
      downloadPet: "下载宠物包",
      languageLabel: "语言",
      interactionControls: "宠物互动",
      petList: "宠物列表",
      petDemo: "互动宠物演示",
      petControls: "宠物互动与大小调节",
      petInteraction: "与宠物互动",
      petResize: "调节宠物大小",
      githubLinkLabel: "在 GitHub 上查看 sprite-pet 源码",
      guideTitle: "把它带进你的网页。",
      guideLede: "安装运行时，准备一个符合 8×9 契约的宠物包，然后用几行 TypeScript 启动。",
      installTitle: "安装运行时",
      installDescription: "使用 pnpm、npm 或你习惯的包管理器。",
      bundleTitle: "托管宠物包",
      bundleDescription: "把 pet.json 与 spritesheet.webp 放在同一目录。",
      createTitle: "创建宠物",
      createDescription: "加载清单并选择内联或页面悬浮模式。",
      projectLinksLabel: "项目链接",
      fullDocumentation: "完整文档",
      npmPackage: "npm 包",
      quickStart: "快速开始",
    },
    behaviorLabels: {
      idle: "待机",
      active: "活动",
      hover: "关注你",
      click: "回应点击",
      drag: "跟随拖动",
      sleep: "休息",
      surprised: "受惊",
      celebrate: "庆祝",
    },
    floatingStatus: (enabled) => (enabled ? "开启" : "关闭"),
    resizeLabel: (width) => `调节宠物大小，当前 ${width} 像素`,
    petInteractionLabel: (name) => `与 ${name} 互动`,
    petDownloadLabel: (name) => `下载 ${name} 宠物包`,
    wakingPet: (name) => `正在唤醒 ${name}…`,
    discoveredPets: (count) => `已发现 ${count} 只`,
    loadFailure: "宠物加载失败。",
    emptyCatalog: "没有发现可用的 Codex Pet 资源。",
    documentationUrl: "https://github.com/cixiangtao/sprite-pet/blob/main/README.zh-CN.md",
  },
  en: {
    title: "sprite-pet · behavior runtime",
    description: "Try the bilingual sprite-pet behavior runtime with portable 8×9 pet atlases.",
    staticText: {
      headline: "Give old sprite sheets a new life.",
      lede: "No conversation state required. It watches the pointer, responds to clicks and drags, and knows when to idle, play, or rest.",
      celebrate: "Celebrate together",
      surprise: "Surprise it",
      activate: "Get it moving",
      floatingTitle: "Float above the page",
      floatingDescription: "Keep the pet on top of the current webpage",
      petLibraryTitle: "Choose a pet",
      discoveringPets: "Discovering local pets…",
      sourceAnimation: "Original Codex animation",
      webBehavior: "Web pet behavior",
      loadingPet: "Loading…",
      readyHint: "Move closer, click, drag, or resize from the bottom-right corner",
      downloadPet: "Download pet bundle",
      languageLabel: "Language",
      interactionControls: "Pet interactions",
      petList: "Pet list",
      petDemo: "Interactive pet demo",
      petControls: "Pet interaction and resize controls",
      petInteraction: "Interact with the pet",
      petResize: "Resize the pet",
      githubLinkLabel: "View the sprite-pet source on GitHub",
      guideTitle: "Bring it to your own webpage.",
      guideLede:
        "Install the runtime, prepare a pet bundle that follows the 8×9 contract, and start it with a few lines of TypeScript.",
      installTitle: "Install the runtime",
      installDescription: "Use pnpm, npm, or your preferred package manager.",
      bundleTitle: "Host a pet bundle",
      bundleDescription: "Keep pet.json and spritesheet.webp in the same directory.",
      createTitle: "Create the pet",
      createDescription: "Load the manifest and choose inline or page-floating mode.",
      projectLinksLabel: "Project links",
      fullDocumentation: "Full documentation",
      npmPackage: "npm package",
      quickStart: "Quick start",
    },
    behaviorLabels: {
      idle: "Idle",
      active: "Active",
      hover: "Watching you",
      click: "Responding",
      drag: "Following drag",
      sleep: "Resting",
      surprised: "Surprised",
      celebrate: "Celebrating",
    },
    floatingStatus: (enabled) => (enabled ? "On" : "Off"),
    resizeLabel: (width) => `Resize the pet, currently ${width} pixels`,
    petInteractionLabel: (name) => `Interact with ${name}`,
    petDownloadLabel: (name) => `Download the ${name} pet bundle`,
    wakingPet: (name) => `Waking ${name}…`,
    discoveredPets: (count) => `${count} pets found`,
    loadFailure: "Unable to load this pet.",
    emptyCatalog: "No usable Codex Pet resources were found.",
    documentationUrl: "https://github.com/cixiangtao/sprite-pet#readme",
  },
} as const satisfies Record<DemoLocale, DemoMessages>;

/** Parses a query or stored locale without accepting unsupported languages. */
export const parseDemoLocale = (value: string | null | undefined): DemoLocale | undefined => {
  const normalizedValue = value?.toLowerCase();
  if (normalizedValue === "en" || normalizedValue?.startsWith("en-") === true) return "en";
  if (normalizedValue === "zh-cn" || normalizedValue?.startsWith("zh-") === true) return "zh-CN";
  return undefined;
};

/** Returns all copy and dynamic labels for one supported demo locale. */
export const getDemoMessages = (locale: DemoLocale): DemoMessages => demoMessages[locale];
