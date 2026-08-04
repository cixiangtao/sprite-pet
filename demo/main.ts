import { CODEX_ATLAS, loadCodexPet, PetRuntime, type PetBehavior } from "../src/index.js";
import {
  getCatalogDownloadUrl,
  getCatalogSpritesheetUrl,
  loadPetCatalog,
  mergePetCatalogs,
  type PetCatalogEntry,
} from "./catalog.js";
import {
  getDemoMessages,
  parseDemoLocale,
  type DemoLocale,
  type DemoStaticMessages,
} from "./i18n.js";
import {
  clampPetPosition,
  getFloatingDockPosition,
  movePetPosition,
  type PetPosition,
} from "./pet-position";
import { clampPetWidth, getResizedPetWidth, type PetResizeSession } from "./pet-resize";

const FLOATING_MODE_STORAGE_KEY = "sprite-pet-page-floating";
const LOCALE_STORAGE_KEY = "sprite-pet-locale";
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
const languageSwitcher = getElement<HTMLElement>("language-switcher");
const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
const docsLink = getElement<HTMLAnchorElement>("docs-link");
let position: PetPosition = { x: 0, y: 0 };
let runtime: PetRuntime | undefined;
let activationSequence = 0;
let floatingMode = false;
let petScale = DEFAULT_PET_SCALE;
let resizeSession: (PetResizeSession & { pointerId: number }) | undefined;
let bundledPetsById = new Map<string, PetCatalogEntry>();
let locale: DemoLocale = "zh-CN";
let messages = getDemoMessages(locale);
let currentBehavior: PetBehavior = "idle";
let currentPetName: string | undefined;
let discoveredPetCount: number | undefined;
let petHintState: "ready" | "loading" | "error" = "ready";

const storeLocale = (nextLocale: DemoLocale) => {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  } catch {
    // The explicit language switch still works when storage is unavailable.
  }
};

const readStoredLocale = () => {
  try {
    return parseDemoLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return undefined;
  }
};

const renderPetHint = () => {
  petHint.textContent =
    petHintState === "loading" && currentPetName !== undefined
      ? messages.wakingPet(currentPetName)
      : petHintState === "error"
        ? messages.loadFailure
        : messages.staticText.readyHint;
};

const applyLocale = (nextLocale: DemoLocale, persist = true) => {
  locale = nextLocale;
  messages = getDemoMessages(locale);
  document.documentElement.lang = locale;
  document.title = messages.title;
  descriptionMeta?.setAttribute("content", messages.description);
  docsLink.href = messages.documentationUrl;

  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = element.dataset.i18n;
    if (key !== undefined && key in messages.staticText) {
      element.textContent = messages.staticText[key as keyof DemoStaticMessages];
    }
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]")) {
    const key = element.dataset.i18nAriaLabel;
    if (key !== undefined && key in messages.staticText) {
      element.setAttribute("aria-label", messages.staticText[key as keyof DemoStaticMessages]);
    }
  }
  for (const button of languageSwitcher.querySelectorAll<HTMLButtonElement>("[data-locale]")) {
    button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
  }

  floatingStatus.textContent = messages.floatingStatus(floatingMode);
  behaviorState.textContent = messages.behaviorLabels[currentBehavior];
  petCount.textContent =
    discoveredPetCount === undefined
      ? messages.staticText.discoveringPets
      : messages.discoveredPets(discoveredPetCount);
  const renderedWidth = Math.round(petScale * CODEX_ATLAS.frameWidth);
  petResizeHandle.setAttribute("aria-label", messages.resizeLabel(renderedWidth));
  if (currentPetName !== undefined) {
    petInteractionTarget.setAttribute("aria-label", messages.petInteractionLabel(currentPetName));
    if (!petDownload.hidden) {
      petDownload.setAttribute("aria-label", messages.petDownloadLabel(currentPetName));
    }
  } else {
    petName.textContent = messages.staticText.loadingPet;
  }
  renderPetHint();

  if (persist) {
    storeLocale(locale);
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set("lang", locale);
    window.history.replaceState(null, "", pageUrl);
  }
};

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
  floatingStatus.textContent = messages.floatingStatus(enabled);
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
  petResizeHandle.setAttribute("aria-label", messages.resizeLabel(renderedWidth));
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
  petDownload.setAttribute("aria-label", messages.petDownloadLabel(entry.displayName));
};

const activatePet = async (entry: PetCatalogEntry) => {
  const sequence = ++activationSequence;
  petCard.dataset.loading = "true";
  currentPetName = entry.displayName;
  petHintState = "loading";
  renderPetHint();

  try {
    const manifestUrl = new URL(entry.manifestPath, window.location.href).toString();
    const spec = await loadCodexPet(manifestUrl);
    if (sequence !== activationSequence) return;

    runtime?.destroy();
    petSprite.removeAttribute("style");
    petName.textContent = spec.displayName;
    currentPetName = spec.displayName;
    petInteractionTarget.setAttribute("aria-label", messages.petInteractionLabel(spec.displayName));
    updatePetDownload(entry);
    petHintState = "ready";
    renderPetHint();
    sourceState.textContent = "idle";
    currentBehavior = "idle";
    behaviorState.textContent = messages.behaviorLabels.idle;

    runtime = new PetRuntime({
      spec,
      interactionElement: petShell,
      spriteElement: petSprite,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      scale: petScale,
      onDragMove: ({ deltaX, deltaY }) => updatePosition(deltaX, deltaY),
      onStateChange: ({ behavior }) => {
        currentBehavior = behavior;
        behaviorState.textContent = messages.behaviorLabels[behavior];
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
    petHintState = "error";
    renderPetHint();
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
  button.title = entry.displayName;

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

const requestedLocale = parseDemoLocale(new URL(window.location.href).searchParams.get("lang"));
applyLocale(requestedLocale ?? readStoredLocale() ?? "zh-CN", false);
languageSwitcher.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-locale]");
  const nextLocale = parseDemoLocale(button?.dataset.locale);
  if (nextLocale !== undefined) applyLocale(nextLocale);
});

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
  import.meta.env.DEV ? loadOptionalCatalog("/@local-pets/index.json") : Promise.resolve([]),
  loadOptionalCatalog(new URL("./pets/index.json", window.location.href).toString()),
]);
const catalog = mergePetCatalogs(bundledCatalog, localCatalog);
if (catalog.length === 0) throw new Error(messages.emptyCatalog);

bundledPetsById = new Map(bundledCatalog.map((entry) => [entry.id, entry]));
petPicker.replaceChildren(...catalog.map(createPetOption));
discoveredPetCount = catalog.length;
petCount.textContent = messages.discoveredPets(discoveredPetCount);

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
