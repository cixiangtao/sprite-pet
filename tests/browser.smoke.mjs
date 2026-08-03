import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";

import { strFromU8, unzipSync } from "fflate";
import { chromium } from "playwright";

const demoUrl = "http://127.0.0.1:4173";
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

const openGugaDemo = async (browser, viewport = { width: 1280, height: 900 }) => {
  const page = await browser.newPage({ viewport, colorScheme: "dark" });
  await page.goto(`${demoUrl}/?pet=guga`);
  await page.waitForFunction(
    () => document.querySelector("#pet-sprite")?.dataset.sourceState !== undefined,
  );
  return page;
};

test("keeps the behavior demo light and selects guga from the query", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openGugaDemo(browser);
    const selectedPet = page.locator('.pet-option[data-pet-id="guga"]');
    const sprite = page.locator("#pet-sprite");

    assert.equal(
      await page.locator("html").evaluate((element) => getComputedStyle(element).colorScheme),
      "light",
    );
    assert.equal(
      await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(247, 248, 251)",
    );
    assert.equal(await selectedPet.getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#pet-name").textContent(), "咕嘎");
    assert.match(
      (await sprite.evaluate((element) => getComputedStyle(element).backgroundImage)) ?? "",
      /guga\/spritesheet\.webp/,
    );
    assert.equal(await sprite.getAttribute("data-source-state"), "idle");
    assert.equal(await page.locator(".pet-option").count(), 14);

    const download = page.getByRole("link", { name: "下载 咕嘎 宠物包" });
    assert.equal(await download.getAttribute("href"), `${demoUrl}/pets/downloads/guga.zip`);
    assert.equal(await download.getAttribute("download"), "guga.zip");

    const archiveResponse = await page.request.get(`${demoUrl}/pets/downloads/guga.zip`);
    assert.equal(archiveResponse.ok(), true);
    assert.match(archiveResponse.headers()["content-type"] ?? "", /application\/zip/);
    const archive = unzipSync(new Uint8Array(await archiveResponse.body()));
    assert.deepEqual(Object.keys(archive).toSorted(), [
      "NOTICE.md",
      "pet.json",
      "spritesheet.webp",
    ]);
    assert.equal(JSON.parse(strFromU8(archive["pet.json"])).id, "guga");
    assert.match(strFromU8(archive["NOTICE.md"]), /not a license grant/i);
  } finally {
    await browser.close();
  }
});

test("maps behavior and supports floating, dragging, and keyboard resizing", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openGugaDemo(browser);
    const sprite = page.locator("#pet-sprite");
    const shell = page.locator("#pet-shell");

    await page.getByRole("button", { name: "让它活动" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector("#pet-sprite")?.dataset.behavior === "active" &&
        document.querySelector("#pet-sprite")?.dataset.sourceState === "running-right",
    );
    assert.equal(await page.locator("#behavior-state").textContent(), "活动");
    assert.equal(await page.locator("#source-state").textContent(), "running-right");

    const floatingToggle = page.getByRole("switch", { name: /页面悬浮/ });
    await floatingToggle.click();
    assert.equal(await floatingToggle.getAttribute("aria-checked"), "true");
    assert.equal(
      await page
        .locator("body")
        .evaluate((element) => element.classList.contains("page-floating-mode")),
      true,
    );
    await page.waitForFunction(
      () => document.querySelector("#pet-shell")?.style.translate !== "0px 0px",
    );
    await page.waitForTimeout(120);

    const initialBounds = await shell.boundingBox();
    assert.ok(initialBounds);
    await page.mouse.move(
      initialBounds.x + initialBounds.width / 2,
      initialBounds.y + initialBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      initialBounds.x + initialBounds.width / 2 - 82,
      initialBounds.y + initialBounds.height / 2 - 64,
      { steps: 4 },
    );
    await page.mouse.up();
    await page.waitForTimeout(120);
    const draggedBounds = await shell.boundingBox();
    assert.ok(draggedBounds);
    assert.ok(
      draggedBounds.x < initialBounds.x - 64,
      JSON.stringify({ initialBounds, draggedBounds }),
    );
    assert.ok(
      draggedBounds.y < initialBounds.y - 48,
      JSON.stringify({ initialBounds, draggedBounds }),
    );

    const resizeHandle = page.getByRole("button", { name: /调节宠物大小/ });
    await resizeHandle.focus();
    const widthBeforeKeyboardResize = (await shell.boundingBox())?.width;
    assert.ok(widthBeforeKeyboardResize);
    await resizeHandle.press("ArrowRight");
    const widthAfterKeyboardResize = (await shell.boundingBox())?.width;
    assert.ok(widthAfterKeyboardResize);
    assert.ok(widthAfterKeyboardResize > widthBeforeKeyboardResize);
    assert.equal(await resizeHandle.getAttribute("aria-label"), "调节宠物大小，当前 200 像素");

    await page.keyboard.press("Escape");
    assert.equal(await floatingToggle.getAttribute("aria-checked"), "false");
    assert.equal(await sprite.isVisible(), true);
  } finally {
    await browser.close();
  }
});

test("keeps the complete demo inside a narrow viewport", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openGugaDemo(browser, { width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
    );
    assert.equal(
      await page.getByRole("heading", { name: "让旧雪碧图，拥有新的生活。" }).isVisible(),
      true,
    );
    assert.equal(await page.getByRole("region", { name: "互动宠物演示" }).isVisible(), true);
  } finally {
    await browser.close();
  }
});
