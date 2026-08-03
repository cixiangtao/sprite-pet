import { CODEX_ATLAS, loadCodexPet, PetRuntime, type PetBehavior } from "../src/index.js";
import {
  getCatalogDownloadUrl,
  getCatalogSpritesheetUrl,
  loadPetCatalog,
  mergePetCatalogs,
  type PetCatalogEntry,
} from "./catalog.js";
import {
  clampPetPosition,
  getFloatingDockPosition,
  movePetPosition,
  type PetPosition,
} from "./pet-position";
import { clampPetWidth, getResizedPetWidth, type PetResizeSession } from "./pet-resize";

const FLOATING_MODE_STORAGE_KEY = "sprite-pet-page-floating";
const FLOATING_VIEWPORT_MARGIN = 24;
const PET_SCALE_STORAGE_KEY = "sprite-pet-scale";
const DEFAULT_PET_SCALE = 1;
const MIN_PET_WIDTH = 80;
const MAX_PET_WIDTH = 224;
const PET_WIDTH_KEYBOARD_STEP = 8;

const getElement = <ElementType extends HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Missing demo element #${id}.`);
  return element as ElementType;
};

const behaviorLabels = {
  idle: "待机",
  active: "活动",
  hover: "关注你",
  click: "回应点击",
  drag: "跟随拖动",
  sleep: "休息",
  surprised: "受惊",
  celebrate: "庆祝",
} as const satisfies Record<PetBehavior, string>;

const petCard = getElement<HTMLElement>("pet-card");
const petStage = getElement<HTMLDivElement>("pet-stage");
const petShell = getElement<HTMLDivElement>("pet-shell");
const petInteractionTarget = getElement<HTMLButtonElement>("pet-interaction-target");
const petSprite = getElement<HTMLSpanElement>("pet-sprite");
const petResizeHandle = getElement<HTMLButtonElement>("pet-resize-handle");
const petName = getElement<HTMLElement>("pet-name");
const petCount = getElement<HTMLElement>("pet-count");
const petPicker = getElement<HTMLDivElement>("pet-picker");
const petHint = getElement<HTMLElement>("pet-hint");
const petDownload = getElement<HTMLAnchorElement>("pet-download");
const floatingToggle = getElement<HTMLButtonElement>("floating-toggle");
const floatingStatus = getElement<HTMLElement>("floating-status");
const behaviorState = getElement<HTMLElement>("behavior-state");
const sourceState = getElement<HTMLElement>("source-state");
let position: PetPosition = { x: 0, y: 0 };
let runtime: PetRuntime | undefined;
let activationSequence = 0;
let floatingMode = false;
let petScale = DEFAULT_PET_SCALE;
let resizeSession: (PetResizeSession & { pointerId: number }) | undefined;
let bundledPetsById = new Map<string, PetCatalogEntry>();

const getStageAndPetSizes = () => {
  const stageRect = petStage.getBoundingClientRect();
  const shellRect = petShell.getBoundingClientRect();
  return {
    stage: { width: stageRect.width, height: stageRect.height },
    pet: { width: shellRect.width, height: shellRect.height },
  };
};

const applyPosition = (nextPosition: PetPosition) => {
  position = nextPosition;
  petShell.style.translate = `${position.x}px ${position.y}px`;
};

const updatePosition = (deltaX: number, deltaY: number) => {
  const { stage, pet } = getStageAndPetSizes();
  applyPosition(movePetPosition(position, { x: deltaX, y: deltaY }, stage, pet));
};

const resetPetPosition = () => {
  const { stage, pet } = getStageAndPetSizes();
  applyPosition(
    floatingMode ? getFloatingDockPosition(stage, pet, FLOATING_VIEWPORT_MARGIN) : { x: 0, y: 0 },
  );
};

const clampPetToStage = () => {
  const { stage, pet } = getStageAndPetSizes();
  applyPosition(clampPetPosition(position, stage, pet));
};

const storeFloatingMode = (enabled: boolean) => {
  try {
    window.localStorage.setItem(FLOATING_MODE_STORAGE_KEY, String(enabled));
  } catch {
    // Storage can be unavailable in privacy-restricted embeds; the switch still works for this page.
  }
};

const readFloatingMode = () => {
  try {
    return window.localStorage.getItem(FLOATING_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const setFloatingMode = (enabled: boolean, persist = true) => {
  floatingMode = enabled;
  document.body.classList.toggle("page-floating-mode", enabled);
  floatingToggle.setAttribute("aria-checked", String(enabled));
  floatingStatus.textContent = enabled ? "开启" : "关闭";
  if (persist) storeFloatingMode(enabled);
  requestAnimationFrame(resetPetPosition);
};

const clampPetScale = (scale: number) => {
  if (!Number.isFinite(scale)) return DEFAULT_PET_SCALE;
  return (
    clampPetWidth(scale * CODEX_ATLAS.frameWidth, MIN_PET_WIDTH, MAX_PET_WIDTH) /
    CODEX_ATLAS.frameWidth
  );
};

const storePetScale = (scale: number) => {
  try {
    window.localStorage.setItem(PET_SCALE_STORAGE_KEY, String(scale));
  } catch {
    // The live size control remains available when browser storage is restricted.
  }
};

const readPetScale = () => {
  try {
    const storedScale = window.localStorage.getItem(PET_SCALE_STORAGE_KEY);
    return storedScale === null ? DEFAULT_PET_SCALE : clampPetScale(Number(storedScale));
  } catch {
    return DEFAULT_PET_SCALE;
  }
};

const setPetScale = (scale: number, persist = true) => {
  petScale = clampPetScale(scale);
  const renderedWidth = Math.round(petScale * CODEX_ATLAS.frameWidth);
  petResizeHandle.setAttribute("aria-label", `调节宠物大小，当前 ${renderedWidth} 像素`);
  petResizeHandle.title = `${renderedWidth}px`;
  if (persist) storePetScale(petScale);
  if (runtime === undefined) return;

  runtime.setScale(petScale);
  requestAnimationFrame(clampPetToStage);
};

const updateSelectedPet = (selectedId: string) => {
  for (const option of petPicker.querySelectorAll<HTMLButtonElement>("[data-pet-id]")) {
    const selected = option.dataset.petId === selectedId;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  }
};

const updatePetDownload = (entry: PetCatalogEntry) => {
  const bundledEntry = bundledPetsById.get(entry.id);
  const isBundledEntry = bundledEntry?.manifestPath === entry.manifestPath;
  petDownload.hidden = !isBundledEntry;
  if (!isBundledEntry) {
    petDownload.removeAttribute("href");
    petDownload.removeAttribute("download");
    petDownload.removeAttribute("aria-label");
    return;
  }

  petDownload.href = getCatalogDownloadUrl(entry, window.location.href);
  petDownload.download = `${entry.id}.zip`;
  petDownload.setAttribute("aria-label", `下载 ${entry.displayName} 宠物包`);
};

const activatePet = async (entry: PetCatalogEntry) => {
  const sequence = ++activationSequence;
  petCard.dataset.loading = "true";
  petHint.textContent = `正在唤醒 ${entry.displayName}…`;

  try {
    const manifestUrl = new URL(entry.manifestPath, window.location.href).toString();
    const spec = await loadCodexPet(manifestUrl);
    if (sequence !== activationSequence) return;

    runtime?.destroy();
    petSprite.removeAttribute("style");
    petName.textContent = spec.displayName;
    petInteractionTarget.setAttribute("aria-label", `与 ${spec.displayName} 互动`);
    updatePetDownload(entry);
    petHint.textContent = "试试靠近、点击、拖动，或调节右下角大小";
    sourceState.textContent = "idle";
    behaviorState.textContent = behaviorLabels.idle;

    runtime = new PetRuntime({
      spec,
      interactionElement: petShell,
      spriteElement: petSprite,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      scale: petScale,
      onDragMove: ({ deltaX, deltaY }) => updatePosition(deltaX, deltaY),
      onStateChange: ({ behavior }) => {
        behaviorState.textContent = behaviorLabels[behavior];
        requestAnimationFrame(() => {
          sourceState.textContent = petSprite.dataset.sourceState ?? "idle";
        });
      },
    });
    runtime.start();
    resetPetPosition();
    updateSelectedPet(entry.id);

    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set("pet", entry.id);
    window.history.replaceState(null, "", pageUrl);
    Object.assign(window, { petRuntime: runtime });
  } catch (error) {
    if (sequence !== activationSequence) return;
    petHint.textContent = error instanceof Error ? error.message : "宠物加载失败。";
    console.error(error);
  } finally {
    if (sequence === activationSequence) delete petCard.dataset.loading;
  }
};

const createPetOption = (entry: PetCatalogEntry) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pet-option";
  button.dataset.petId = entry.id;
  button.setAttribute("aria-pressed", "false");
  button.title = entry.description;

  const preview = document.createElement("span");
  preview.className = "pet-option-preview";
  preview.style.backgroundImage = `url("${getCatalogSpritesheetUrl(entry, window.location.href)}")`;
  preview.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "pet-option-label";
  label.textContent = entry.displayName;
  button.append(preview, label);
  button.addEventListener("click", () => void activatePet(entry));
  return button;
};

const loadOptionalCatalog = async (url: string) => {
  try {
    return await loadPetCatalog(url);
  } catch {
    return [];
  }
};

setFloatingMode(readFloatingMode(), false);
floatingToggle.addEventListener("click", () => setFloatingMode(!floatingMode));
setPetScale(readPetScale(), false);

const finishPetResize = (pointerId: number, target?: HTMLButtonElement) => {
  if (resizeSession?.pointerId !== pointerId) return;
  resizeSession = undefined;
  petShell.classList.remove("is-resizing");
  document.documentElement.classList.remove("pet-resize-active");
  if (target?.hasPointerCapture(pointerId) === true) target.releasePointerCapture(pointerId);
};

const updatePetResize = (event: PointerEvent) => {
  if (resizeSession?.pointerId !== event.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  const width = getResizedPetWidth(resizeSession, event.clientX, MIN_PET_WIDTH, MAX_PET_WIDTH);
  setPetScale(width / CODEX_ATLAS.frameWidth);
};

petResizeHandle.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  petResizeHandle.setPointerCapture(event.pointerId);
  resizeSession = {
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startWidth: runtime?.size.width ?? petScale * CODEX_ATLAS.frameWidth,
  };
  petShell.classList.add("is-resizing");
  document.documentElement.classList.add("pet-resize-active");
});

petResizeHandle.addEventListener("pointermove", updatePetResize);
petResizeHandle.addEventListener("pointerup", (event) => {
  updatePetResize(event);
  finishPetResize(event.pointerId, petResizeHandle);
});
petResizeHandle.addEventListener("pointercancel", (event) => {
  event.stopPropagation();
  finishPetResize(event.pointerId, petResizeHandle);
});
petResizeHandle.addEventListener("lostpointercapture", (event) => {
  finishPetResize(event.pointerId);
});
petResizeHandle.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
});
petResizeHandle.addEventListener("keydown", (event) => {
  const currentWidth = runtime?.size.width ?? petScale * CODEX_ATLAS.frameWidth;
  const targetWidth =
    event.key === "Home"
      ? MIN_PET_WIDTH
      : event.key === "End"
        ? MAX_PET_WIDTH
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? currentWidth - PET_WIDTH_KEYBOARD_STEP
          : event.key === "ArrowRight" || event.key === "ArrowUp"
            ? currentWidth + PET_WIDTH_KEYBOARD_STEP
            : undefined;
  if (targetWidth === undefined) return;
  event.preventDefault();
  event.stopPropagation();
  setPetScale(targetWidth / CODEX_ATLAS.frameWidth);
});

window.addEventListener("resize", clampPetToStage);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && floatingMode) setFloatingMode(false);
});

const [localCatalog, bundledCatalog] = await Promise.all([
  loadOptionalCatalog("/@local-pets/index.json"),
  loadOptionalCatalog(new URL("./pets/index.json", window.location.href).toString()),
]);
const catalog = mergePetCatalogs(bundledCatalog, localCatalog);
if (catalog.length === 0) throw new Error("没有发现可用的 Codex Pet 资源。");

bundledPetsById = new Map(bundledCatalog.map((entry) => [entry.id, entry]));
petPicker.replaceChildren(...catalog.map(createPetOption));
petCount.textContent = `已发现 ${catalog.length} 只`;

const requestedPetId = new URL(window.location.href).searchParams.get("pet");
const initialPet =
  catalog.find(({ id }) => id === requestedPetId) ??
  catalog.find(({ id }) => id === "usagi") ??
  catalog[0];
if (initialPet !== undefined) await activatePet(initialPet);

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-trigger]")) {
  button.addEventListener("click", () => {
    const behavior = button.dataset.trigger as PetBehavior;
    runtime?.trigger(behavior);
  });
}

window.addEventListener("beforeunload", () => runtime?.destroy(), { once: true });
