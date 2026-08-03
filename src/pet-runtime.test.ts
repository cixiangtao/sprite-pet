import { describe, expect, it, vi } from "vitest";

import { adaptCodexPet, type CodexPetManifest } from "./adapters/codex-pet.js";
import { PetRuntime } from "./pet-runtime.js";

const manifest = {
  id: "resizable-pet",
  displayName: "Resizable Pet",
  description: "A resizable test pet.",
  spritesheetPath: "spritesheet.webp",
} as const satisfies CodexPetManifest;

const createElement = (ownerDocument?: Document, size = { width: 0, height: 0 }) =>
  Object.assign(new EventTarget(), {
    dataset: {},
    offsetHeight: size.height,
    offsetWidth: size.width,
    ownerDocument,
    setAttribute: vi.fn(),
    style: {},
  }) as unknown as HTMLElement;

describe("PetRuntime size", () => {
  it("applies initialization and dynamic scales", () => {
    const documentTarget = new EventTarget() as unknown as Document;
    const interactionElement = createElement(documentTarget, { width: 210, height: 226 });
    const spriteElement = createElement();
    const runtime = new PetRuntime({
      spec: adaptCodexPet(manifest),
      interactionElement,
      spriteElement,
      scale: 0.75,
    });

    expect(runtime.scale).toBe(0.75);
    expect(runtime.size).toEqual({ width: 144, height: 156 });
    expect(interactionElement.style.width).toBe("157.5px");
    expect(interactionElement.style.height).toBe("169.5px");
    expect(spriteElement.style.scale).toBe("0.75");

    expect(runtime.setSize({ width: 240 })).toEqual({ width: 240, height: 260 });
    expect(runtime.scale).toBe(1.25);
    expect(interactionElement.style.width).toBe("262.5px");
    expect(interactionElement.style.height).toBe("282.5px");
    expect(spriteElement.style.scale).toBe("1.25");
    runtime.destroy();
  });

  it("rejects an invalid dynamic scale", () => {
    const documentTarget = new EventTarget() as unknown as Document;
    const runtime = new PetRuntime({
      spec: adaptCodexPet(manifest),
      interactionElement: createElement(documentTarget),
      spriteElement: createElement(),
    });

    expect(() => runtime.setScale(0)).toThrow(RangeError);
    runtime.destroy();
  });

  it("reuses the unscaled interaction size when a runtime is replaced", () => {
    const documentTarget = new EventTarget() as unknown as Document;
    const interactionElement = createElement(documentTarget, { width: 210, height: 226 });
    const spec = adaptCodexPet(manifest);
    const firstRuntime = new PetRuntime({
      spec,
      interactionElement,
      spriteElement: createElement(),
      scale: 0.75,
    });
    firstRuntime.destroy();

    Object.assign(interactionElement, { offsetWidth: 158, offsetHeight: 170 });
    const replacementRuntime = new PetRuntime({
      spec,
      interactionElement,
      spriteElement: createElement(),
      scale: 0.5,
    });

    expect(interactionElement.style.width).toBe("105px");
    expect(interactionElement.style.height).toBe("113px");
    replacementRuntime.destroy();
  });
});
