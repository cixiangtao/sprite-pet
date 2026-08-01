import {
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
const builtInPetSelect = document.querySelector<HTMLSelectElement>("#built-in-pet");
const builtInPetDescription = document.querySelector<HTMLElement>("#built-in-pet-description");
const urlForm = document.querySelector<HTMLFormElement>("#url-form");
const manifestUrl = document.querySelector<HTMLInputElement>("#manifest-url");
const fileForm = document.querySelector<HTMLFormElement>("#file-form");
const manifestFile = document.querySelector<HTMLInputElement>("#manifest-file");
const spritesheetFile = document.querySelector<HTMLInputElement>("#spritesheet-file");

if (
  canvas === null ||
  stage === null ||
  status === null ||
  stateControls === null ||
  builtInPetSelect === null ||
  builtInPetDescription === null ||
  urlForm === null ||
  manifestUrl === null ||
  fileForm === null ||
  manifestFile === null ||
  spritesheetFile === null
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

let renderer: SpritePetRenderer | null = null;
let builtInPets: BuiltInPet[] = [];

const setStatus = (message: string, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? "#b33d50" : "";
};

const updateStateButtons = (activeState: SpritePetState) => {
  for (const button of stateControls.querySelectorAll<HTMLButtonElement>("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.state === activeState));
  }
};

const mountSource = (source: SpritePetSource) => {
  renderer?.destroy();
  renderer = new SpritePetRenderer({
    canvas,
    source,
    width: 230,
    initialState: "idle",
  });
  updateStateButtons("idle");
  canvas.dataset.ready = "true";
  canvas.dataset.version = String(source.version);
  canvas.dataset.petId = source.manifest.id;
  setStatus(`${source.manifest.displayName} · v${source.version} atlas`);
};

const setPetDescription = (description: string) => {
  builtInPetDescription.textContent = description;
};

const loadSelectedPet = async () => {
  builtInPetSelect.disabled = true;
  try {
    if (builtInPetSelect.value === sampleId) {
      setStatus("Generating sample pet…");
      mountSource(await loadSamplePet());
      setPetDescription("A generated v2 sample used to demonstrate pointer-facing poses.");
      return;
    }

    const pet = builtInPets.find(({ id }) => id === builtInPetSelect.value);
    if (pet === undefined) throw new Error("The selected built-in pet is unavailable.");

    setStatus(`Loading ${pet.displayName}…`);
    mountSource(await loadSpritePet(new URL(pet.manifestPath, window.location.href)));
    setPetDescription(pet.description);
  } finally {
    builtInPetSelect.disabled = false;
  }
};

for (const state of SPRITE_PET_STATES) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = stateLabels[state];
  button.dataset.state = state;
  button.setAttribute("aria-pressed", String(state === "idle"));
  button.addEventListener("click", () => {
    renderer?.setState(state);
    updateStateButtons(state);
    setStatus(`${renderer?.source.manifest.displayName ?? "Pet"} · ${stateLabels[state]}`);
  });
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

urlForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (manifestUrl.value === "") return;

  setStatus("Loading remote pet…");
  try {
    mountSource(await loadSpritePet(manifestUrl.value));
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
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to read the local pet.", true);
  }
});

try {
  const index = await loadBuiltInPetIndex();
  builtInPets = index.pets;
  builtInPetSelect.replaceChildren();

  for (const pet of builtInPets) {
    const option = document.createElement("option");
    option.value = pet.id;
    option.textContent = `${pet.displayName} · v${pet.spriteVersionNumber}`;
    builtInPetSelect.append(option);
  }

  const sampleOption = document.createElement("option");
  sampleOption.value = sampleId;
  sampleOption.textContent = "Generated sample · v2";
  builtInPetSelect.append(sampleOption);
  builtInPetSelect.addEventListener("change", () => {
    void loadSelectedPet().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : "Unable to load the selected pet.", true);
    });
  });

  await loadSelectedPet();
} catch (error) {
  setStatus("Built-in gallery unavailable; loading the generated sample.", true);
  try {
    mountSource(await loadSamplePet());
    setPetDescription(
      "The built-in gallery could not be loaded, so the generated sample is shown.",
    );
  } catch {
    setStatus(error instanceof Error ? error.message : "Unable to load a pet.", true);
  }
}
