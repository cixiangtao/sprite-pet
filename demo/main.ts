import {
  DEFAULT_ANIMATIONS,
  SPRITE_PET_LAYOUT,
  SPRITE_PET_STATES,
  SpritePetRenderer,
  loadSpritePet,
  loadSpritePetFiles,
  type SpritePetSource,
  type SpritePetState,
} from "../src/index.js";
import { loadBuiltInPetIndex, type BuiltInPet } from "./built-ins.js";
import { loadSamplePet } from "./sample.js";

const canvas = document.querySelector<HTMLCanvasElement>("#pet-canvas");
const stage = document.querySelector<HTMLElement>("#stage");
const status = document.querySelector<HTMLElement>("#status");
const stateControls = document.querySelector<HTMLElement>("#state-controls");
const activeStateValue = document.querySelector<HTMLElement>("#active-state-value");
const builtInPetSelect = document.querySelector<HTMLSelectElement>("#built-in-pet");
const builtInPetList = document.querySelector<HTMLElement>("#built-in-pet-list");
const builtInPetDescription = document.querySelector<HTMLElement>("#built-in-pet-description");
const sourceCount = document.querySelector<HTMLElement>("#source-count");
const urlForm = document.querySelector<HTMLFormElement>("#url-form");
const manifestUrl = document.querySelector<HTMLInputElement>("#manifest-url");
const fileForm = document.querySelector<HTMLFormElement>("#file-form");
const manifestFile = document.querySelector<HTMLInputElement>("#manifest-file");
const spritesheetFile = document.querySelector<HTMLInputElement>("#spritesheet-file");
const atlasSize = document.querySelector<HTMLElement>("#atlas-size");
const atlasVersion = document.querySelector<HTMLElement>("#atlas-version");
const cursorHint = document.querySelector<HTMLElement>(".cursor-hint");
const playbackToggle = document.querySelector<HTMLButtonElement>("#playback-toggle");
const currentFrame = document.querySelector<HTMLElement>("#current-frame");
const timeline = document.querySelector<HTMLElement>("#timeline-frames");
const copyFeedback = document.querySelector<HTMLElement>("#copy-feedback");

if (
  canvas === null ||
  stage === null ||
  status === null ||
  stateControls === null ||
  activeStateValue === null ||
  builtInPetSelect === null ||
  builtInPetList === null ||
  builtInPetDescription === null ||
  sourceCount === null ||
  urlForm === null ||
  manifestUrl === null ||
  fileForm === null ||
  manifestFile === null ||
  spritesheetFile === null ||
  atlasSize === null ||
  atlasVersion === null ||
  cursorHint === null ||
  playbackToggle === null ||
  currentFrame === null ||
  timeline === null ||
  copyFeedback === null
) {
  throw new Error("The demo page is missing a required element.");
}

const stateLabels: Record<SpritePetState, string> = {
  idle: "Idle",
  "move-right": "Move right",
  "move-left": "Move left",
  wave: "Wave",
  jump: "Jump",
  failure: "Failure",
  waiting: "Waiting",
  working: "Working",
  reviewing: "Reviewing",
};

const sampleId = "generated-sample";
const installCommand = "pnpm add sprite-pet";

let renderer: SpritePetRenderer | null = null;
let builtInPets: BuiltInPet[] = [];

const petButtons = new Map<string, HTMLButtonElement>();
const stateButtons = new Map<SpritePetState, HTMLButtonElement>();

const timelineFrames = Array.from({ length: SPRITE_PET_LAYOUT.columns }, (_value, frame) => {
  const element = document.createElement("div");
  element.className = "frame-cell";
  element.dataset.frame = String(frame);
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", `Frame ${frame + 1}`);

  const frameNumber = document.createElement("span");
  frameNumber.textContent = String(frame + 1).padStart(2, "0");

  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = SPRITE_PET_LAYOUT.cellWidth;
  frameCanvas.height = SPRITE_PET_LAYOUT.cellHeight;
  frameCanvas.setAttribute("aria-hidden", "true");

  element.append(frameNumber, frameCanvas);
  timeline.append(element);
  return { canvas: frameCanvas, element };
});

const setStatus = (message: string, isError = false) => {
  status.textContent = message;
  status.dataset.tone = isError ? "error" : "ready";
  status.parentElement?.setAttribute("data-tone", isError ? "error" : "ready");
};

const setPetDescription = (description: string) => {
  builtInPetDescription.textContent = description;
};

const setSourceLoading = (isLoading: boolean) => {
  builtInPetSelect.disabled = isLoading;
  for (const button of petButtons.values()) button.disabled = isLoading;
};

const updatePetButtons = () => {
  for (const [petId, button] of petButtons) {
    button.setAttribute("aria-pressed", String(petId === builtInPetSelect.value));
  }
};

const updateStateButtons = (state: SpritePetState) => {
  activeStateValue.textContent = stateLabels[state];
  for (const [buttonState, button] of stateButtons) {
    button.setAttribute("aria-pressed", String(buttonState === state));
  }
};

const renderTimeline = (source: SpritePetSource, state: SpritePetState) => {
  const row = DEFAULT_ANIMATIONS[state].row;
  for (const [frame, frameView] of timelineFrames.entries()) {
    const context = frameView.canvas.getContext("2d");
    if (context === null) continue;

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, frameView.canvas.width, frameView.canvas.height);
    context.drawImage(
      source.image,
      frame * SPRITE_PET_LAYOUT.cellWidth,
      row * SPRITE_PET_LAYOUT.cellHeight,
      SPRITE_PET_LAYOUT.cellWidth,
      SPRITE_PET_LAYOUT.cellHeight,
      0,
      0,
      SPRITE_PET_LAYOUT.cellWidth,
      SPRITE_PET_LAYOUT.cellHeight,
    );
  }
};

const getVisibleFrameOverrides = (source: SpritePetSource) => {
  const scratch = document.createElement("canvas");
  scratch.width = SPRITE_PET_LAYOUT.cellWidth;
  scratch.height = SPRITE_PET_LAYOUT.cellHeight;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (context === null) return undefined;

  const overrides: Partial<Record<SpritePetState, { frameCount: number }>> = {};
  try {
    for (const state of SPRITE_PET_STATES) {
      const row = DEFAULT_ANIMATIONS[state].row;
      let frameCount = SPRITE_PET_LAYOUT.columns;

      while (frameCount > 1) {
        context.clearRect(0, 0, scratch.width, scratch.height);
        context.drawImage(
          source.image,
          (frameCount - 1) * SPRITE_PET_LAYOUT.cellWidth,
          row * SPRITE_PET_LAYOUT.cellHeight,
          SPRITE_PET_LAYOUT.cellWidth,
          SPRITE_PET_LAYOUT.cellHeight,
          0,
          0,
          SPRITE_PET_LAYOUT.cellWidth,
          SPRITE_PET_LAYOUT.cellHeight,
        );
        const pixels = context.getImageData(0, 0, scratch.width, scratch.height).data;
        let hasVisiblePixel = false;
        for (let alpha = 3; alpha < pixels.length; alpha += 4) {
          if ((pixels[alpha] ?? 0) > 0) {
            hasVisiblePixel = true;
            break;
          }
        }
        if (hasVisiblePixel) break;
        frameCount -= 1;
      }

      overrides[state] = { frameCount };
    }
  } catch {
    return undefined;
  }

  return overrides;
};

const mountSource = (source: SpritePetSource) => {
  renderer?.destroy();
  const animationOverrides = getVisibleFrameOverrides(source);
  renderer = new SpritePetRenderer({
    canvas,
    source,
    width: Math.min(320, Math.max(240, stage.clientWidth * 0.52)),
    initialState: "idle",
    imageSmoothing: false,
    ...(animationOverrides === undefined ? {} : { animations: animationOverrides }),
  });
  updateStateButtons("idle");
  renderTimeline(source, "idle");
  canvas.dataset.ready = "true";
  canvas.dataset.version = String(source.version);
  canvas.dataset.petId = source.manifest.id;
  atlasSize.textContent = `${source.imageWidth} × ${source.imageHeight}`;
  atlasVersion.textContent = `v${source.version}`;
  cursorHint.hidden = source.version < 2;
  setStatus(`${source.manifest.displayName} · v${source.version} atlas`);
  setPetDescription(source.manifest.description ?? "Portable sprite-pet atlas bundle.");
};

const loadSelectedPet = async () => {
  setSourceLoading(true);
  try {
    if (builtInPetSelect.value === sampleId) {
      setStatus("Generating sample pet…");
      mountSource(await loadSamplePet());
      setPetDescription("A generated v2 sample used to demonstrate pointer-facing poses.");
      updatePetButtons();
      return;
    }

    const pet = builtInPets.find(({ id }) => id === builtInPetSelect.value);
    if (pet === undefined) throw new Error("The selected built-in pet is unavailable.");

    setStatus(`Loading ${pet.displayName}…`);
    mountSource(await loadSpritePet(new URL(pet.manifestPath, window.location.href)));
    setPetDescription(pet.description);
    updatePetButtons();
  } finally {
    setSourceLoading(false);
  }
};

const createBuiltInPetButton = (pet: BuiltInPet) => {
  const button = document.createElement("button");
  button.className = "pet-option";
  button.type = "button";
  button.setAttribute("aria-label", `${pet.displayName}, v${pet.spriteVersionNumber} atlas`);

  const thumbnail = document.createElement("span");
  thumbnail.className = "pet-thumbnail";
  const manifestPath = new URL(pet.manifestPath, window.location.href);
  const spritesheetPath = new URL("./spritesheet.webp", manifestPath);
  thumbnail.style.backgroundImage = `url("${spritesheetPath.href}")`;
  thumbnail.style.backgroundSize = `800% ${pet.spriteVersionNumber === 2 ? 1100 : 900}%`;

  const copy = document.createElement("span");
  copy.className = "pet-option__copy";
  const name = document.createElement("strong");
  name.textContent = pet.displayName;
  const version = document.createElement("small");
  version.textContent = `v${pet.spriteVersionNumber} atlas`;
  copy.append(name, version);

  const marker = document.createElement("span");
  marker.className = "selection-marker";
  marker.setAttribute("aria-hidden", "true");

  button.append(thumbnail, copy, marker);
  button.addEventListener("click", () => {
    builtInPetSelect.value = pet.id;
    updatePetButtons();
    void loadSelectedPet().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : "Unable to load the selected pet.", true);
    });
  });
  petButtons.set(pet.id, button);
  return button;
};

const createSampleButton = () => {
  const button = document.createElement("button");
  button.className = "pet-option";
  button.type = "button";
  button.setAttribute("aria-label", "Generated sample, v2 atlas");

  const thumbnail = document.createElement("span");
  thumbnail.className = "pet-thumbnail pet-thumbnail--generated";
  thumbnail.textContent = "S";

  const copy = document.createElement("span");
  copy.className = "pet-option__copy";
  const name = document.createElement("strong");
  name.textContent = "Generated sample";
  const version = document.createElement("small");
  version.textContent = "v2 · pointer poses";
  copy.append(name, version);

  const marker = document.createElement("span");
  marker.className = "selection-marker";
  marker.setAttribute("aria-hidden", "true");

  button.append(thumbnail, copy, marker);
  button.addEventListener("click", () => {
    builtInPetSelect.value = sampleId;
    updatePetButtons();
    void loadSelectedPet().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : "Unable to load the sample pet.", true);
    });
  });
  petButtons.set(sampleId, button);
  return button;
};

for (const [row, state] of SPRITE_PET_STATES.entries()) {
  const button = document.createElement("button");
  button.className = "state-button";
  button.type = "button";
  button.dataset.state = state;
  button.setAttribute("aria-label", stateLabels[state]);
  button.setAttribute("aria-pressed", String(state === "idle"));

  const rowNumber = document.createElement("span");
  rowNumber.className = "state-row";
  rowNumber.textContent = String(row + 1).padStart(2, "0");
  const label = document.createElement("strong");
  label.textContent = stateLabels[state];
  const frameCount = document.createElement("small");
  frameCount.textContent = "8 frames";
  const marker = document.createElement("span");
  marker.className = "selection-marker";
  marker.setAttribute("aria-hidden", "true");

  button.append(rowNumber, label, frameCount, marker);
  button.addEventListener("click", () => {
    renderer?.setState(state);
    if (renderer !== null) renderTimeline(renderer.source, state);
    updateStateButtons(state);
    setStatus(`${renderer?.source.manifest.displayName ?? "Pet"} · ${stateLabels[state]}`);
  });
  stateButtons.set(state, button);
  stateControls.append(button);
}

stage.addEventListener("pointermove", (event) => {
  if (renderer?.lookAt(event.clientX, event.clientY)) {
    const direction = renderer.getSnapshot().lookDirection;
    canvas.dataset.lookDirection = String(direction);
  }
});

stage.addEventListener("pointerleave", () => {
  renderer?.clearLookDirection();
  delete canvas.dataset.lookDirection;
});

playbackToggle.addEventListener("click", () => {
  if (renderer === null) return;
  if (renderer.getSnapshot().playing) renderer.pause();
  else renderer.play();
});

urlForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (manifestUrl.value === "") return;

  setStatus("Loading remote pet…");
  try {
    mountSource(await loadSpritePet(manifestUrl.value));
    builtInPetSelect.value = "";
    updatePetButtons();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to load the remote pet.", true);
  }
});

fileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedManifest = manifestFile.files?.[0];
  const selectedSpritesheet = spritesheetFile.files?.[0];
  if (selectedManifest === undefined || selectedSpritesheet === undefined) return;

  setStatus("Reading local pet…");
  try {
    mountSource(
      await loadSpritePetFiles({
        manifest: selectedManifest,
        spritesheet: selectedSpritesheet,
      }),
    );
    builtInPetSelect.value = "";
    updatePetButtons();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to read the local pet.", true);
  }
});

for (const copyButton of document.querySelectorAll<HTMLButtonElement>("[data-copy-install]")) {
  copyButton.setAttribute("aria-label", `Copy ${installCommand}`);
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      copyButton.dataset.copied = "true";
      copyButton.setAttribute("aria-label", "Copied install command");
      copyFeedback.textContent = "Copied";
      globalThis.setTimeout(() => {
        delete copyButton.dataset.copied;
        copyButton.setAttribute("aria-label", `Copy ${installCommand}`);
        copyFeedback.textContent = "";
      }, 1800);
    } catch {
      copyFeedback.textContent = "Copy unavailable";
    }
  });
}

const syncPlaybackUi = () => {
  const snapshot = renderer?.getSnapshot();
  if (snapshot !== undefined) {
    currentFrame.textContent = String(snapshot.frame + 1);
    playbackToggle.dataset.playing = String(snapshot.playing);
    playbackToggle.setAttribute("aria-label", snapshot.playing ? "Pause" : "Play");
    for (const [frame, frameView] of timelineFrames.entries()) {
      frameView.element.dataset.current = String(frame === snapshot.frame);
    }
  }
  requestAnimationFrame(syncPlaybackUi);
};

builtInPetSelect.addEventListener("change", () => {
  updatePetButtons();
  void loadSelectedPet().catch((error: unknown) => {
    setStatus(error instanceof Error ? error.message : "Unable to load the selected pet.", true);
  });
});

try {
  const index = await loadBuiltInPetIndex();
  builtInPets = index.pets;
  builtInPetSelect.replaceChildren();
  builtInPetList.replaceChildren();

  const sampleOption = document.createElement("option");
  sampleOption.value = sampleId;
  sampleOption.textContent = "Generated sample · v2";
  builtInPetSelect.append(sampleOption);
  builtInPetList.append(createSampleButton());

  for (const pet of builtInPets) {
    const option = document.createElement("option");
    option.value = pet.id;
    option.textContent = `${pet.displayName} · v${pet.spriteVersionNumber}`;
    builtInPetSelect.append(option);
    builtInPetList.append(createBuiltInPetButton(pet));
  }
  sourceCount.textContent = String(builtInPets.length + 1);
  builtInPetSelect.value = sampleId;

  await loadSelectedPet();
} catch (error) {
  sourceCount.textContent = "1";
  builtInPetSelect.replaceChildren();
  const sampleOption = document.createElement("option");
  sampleOption.value = sampleId;
  sampleOption.textContent = "Generated sample · v2";
  builtInPetSelect.append(sampleOption);
  builtInPetList.replaceChildren(createSampleButton());
  setStatus("Built-in gallery unavailable; loading the generated sample.", true);
  try {
    mountSource(await loadSamplePet());
    setPetDescription(
      "The built-in gallery could not be loaded, so the generated sample is shown.",
    );
    updatePetButtons();
  } catch {
    setStatus(error instanceof Error ? error.message : "Unable to load a pet.", true);
  }
}

syncPlaybackUi();
