import { describe, expect, it } from "vitest";

import { getDemoMessages, parseDemoLocale } from "./i18n.js";

describe("demo i18n", () => {
  it("normalizes supported locale variants", () => {
    expect(parseDemoLocale("en-US")).toBe("en");
    expect(parseDemoLocale("EN")).toBe("en");
    expect(parseDemoLocale("zh-TW")).toBe("zh-CN");
    expect(parseDemoLocale("fr")).toBeUndefined();
  });

  it("keeps dynamic and behavior labels localized", () => {
    expect(getDemoMessages("zh-CN").discoveredPets(14)).toBe("已发现 14 只");
    expect(getDemoMessages("en").discoveredPets(14)).toBe("14 pets found");
    expect(getDemoMessages("en").behaviorLabels.celebrate).toBe("Celebrating");
  });
});
