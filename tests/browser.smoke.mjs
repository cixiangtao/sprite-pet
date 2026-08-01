import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { chromium } from "playwright";

const demoUrl = "http://127.0.0.1:4173";
const localPetFixture = process.env.SPRITE_PET_FIXTURE_DIR;
let server;

const waitForServer = async (attempt = 0) => {
  if (attempt >= 80) {
    throw new Error("Timed out while waiting for the demo server.");
  }

  try {
    const response = await fetch(demoUrl);
    if (response.ok) return;
  } catch {
    // The preview server is still starting.
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  return waitForServer(attempt + 1);
};

before(async () => {
  server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "demo",
      "--host",
      "127.0.0.1",
      "--port",
      "4173",
      "--strictPort",
      "--outDir",
      "../demo-dist",
    ],
    {
      cwd: process.cwd(),
      stdio: "ignore",
    },
  );
  await waitForServer();
});

after(() => {
  server?.kill("SIGTERM");
});

test("renders, animates, and follows the pointer in Chromium", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(demoUrl);
    const canvas = page.locator("#pet-canvas");
    await canvas.waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("canvas")?.dataset.ready === "true");

    const builtInPetIds = [
      "doro",
      "goku",
      "guga",
      "hutao",
      "ikkun",
      "ikun-gaara",
      "ikun-giegie",
      "ikunchick",
      "kimlet-hover-clap",
      "mini-elon",
      "nimbus",
      "shinchan",
      "trump",
      "usagi",
    ];
    const petSelect = page.locator("#built-in-pet");
    assert.equal(await petSelect.locator("option").count(), builtInPetIds.length + 1);

    const verifyBuiltInPets = async ([petId, ...remainingPetIds]) => {
      if (petId === undefined) return;

      await petSelect.selectOption(petId);
      await page.waitForFunction(
        (expectedPetId) => document.querySelector("canvas")?.dataset.petId === expectedPetId,
        petId,
      );
      assert.equal(await canvas.getAttribute("data-version"), "1");
      await verifyBuiltInPets(remainingPetIds);
    };
    await verifyBuiltInPets(builtInPetIds);

    const hasVisiblePixel = await canvas.evaluate((element) => {
      const context = element.getContext("2d");
      if (context === null) return false;
      return context
        .getImageData(0, 0, element.width, element.height)
        .data.some((value, index) => (index % 4 === 3 ? value > 0 : false));
    });
    assert.equal(hasVisiblePixel, true);

    await page.getByRole("button", { name: "Working", exact: true }).click();
    await assert.doesNotReject(async () =>
      page.waitForFunction(() =>
        document.querySelector("#status")?.textContent?.includes("Working"),
      ),
    );

    await petSelect.selectOption("generated-sample");
    await page.waitForFunction(() => document.querySelector("canvas")?.dataset.version === "2");

    const bounds = await canvas.boundingBox();
    assert.ok(bounds);
    await page.mouse.move(bounds.x + bounds.width, bounds.y + bounds.height / 2);
    await page.waitForFunction(
      () => document.querySelector("canvas")?.dataset.lookDirection === "90",
    );

    const widget = page.locator(".sprite-pet-widget");
    await page.getByRole("button", { name: "Float pet", exact: true }).click();
    assert.equal(await widget.getAttribute("data-floating"), "true");
    assert.equal(await widget.evaluate((element) => getComputedStyle(element).position), "fixed");

    const floatingBounds = await widget.boundingBox();
    assert.ok(floatingBounds);
    await page.mouse.move(
      floatingBounds.x + floatingBounds.width / 2,
      floatingBounds.y + floatingBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      floatingBounds.x + floatingBounds.width / 2 - 96,
      floatingBounds.y + floatingBounds.height / 2 - 72,
    );
    await page.mouse.up();
    const draggedBounds = await widget.boundingBox();
    assert.ok(draggedBounds);
    assert.ok(draggedBounds.x < floatingBounds.x - 80);
    assert.ok(draggedBounds.y < floatingBounds.y - 56);

    const resizeHandle = page.getByRole("slider", { name: "Resize pet" });
    const resizeBounds = await resizeHandle.boundingBox();
    assert.ok(resizeBounds);
    await page.mouse.move(resizeBounds.x + resizeBounds.width / 2, resizeBounds.y + 14);
    await page.mouse.down();
    await page.mouse.move(resizeBounds.x - 48, resizeBounds.y - 48);
    await page.mouse.up();
    const resizedBounds = await widget.boundingBox();
    assert.ok(resizedBounds);
    assert.ok(resizedBounds.width < draggedBounds.width - 32);
    assert.ok(Math.abs(resizedBounds.width / resizedBounds.height - 192 / 208) < 0.01);

    await resizeHandle.focus();
    const keyboardWidth = (await widget.boundingBox())?.width;
    assert.ok(keyboardWidth);
    await resizeHandle.press("ArrowRight");
    const keyboardResizedWidth = (await widget.boundingBox())?.width;
    assert.ok(keyboardResizedWidth);
    assert.ok(keyboardResizedWidth > keyboardWidth);

    await page.getByRole("button", { name: "Dock preview", exact: true }).click();
    assert.equal(await widget.getAttribute("data-floating"), "false");
    assert.equal(
      await widget.evaluate((element) => getComputedStyle(element).position),
      "relative",
    );
    assert.equal(await canvas.evaluate((element) => element.closest("#stage") !== null), true);
  } finally {
    await browser.close();
  }
});

test(
  "loads a real local v1 pet bundle without uploading it",
  { skip: localPetFixture === undefined },
  async () => {
    assert.ok(localPetFixture);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(demoUrl);
      await page.locator("#manifest-file").setInputFiles(join(localPetFixture, "pet.json"));
      await page
        .locator("#spritesheet-file")
        .setInputFiles(join(localPetFixture, "spritesheet.webp"));
      await page.getByRole("button", { name: "Use files", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("canvas")?.dataset.version === "1");
      assert.match((await page.locator("#status").textContent()) ?? "", /· v1 atlas/);

      await page.getByRole("button", { name: "Working", exact: true }).click();
      await page.waitForFunction(() =>
        document.querySelector("#status")?.textContent?.includes("Working"),
      );
    } finally {
      await browser.close();
    }
  },
);
