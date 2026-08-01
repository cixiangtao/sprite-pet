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

    const bounds = await canvas.boundingBox();
    assert.ok(bounds);
    await page.mouse.move(bounds.x + bounds.width, bounds.y + bounds.height / 2);
    await page.waitForFunction(
      () => document.querySelector("canvas")?.dataset.lookDirection === "90",
    );
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
