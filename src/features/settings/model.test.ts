import { describe, expect, it } from "vitest";
import { summarizeUiModules, uiModules } from "./model";

describe("settings module inventory", () => {
  it("keeps every module identity unique", () => {
    expect(new Set(uiModules.map((module) => module.id)).size).toBe(uiModules.length);
  });

  it("reports contract-limited modules separately from available modules", () => {
    expect(summarizeUiModules()).toEqual({ total: 10, available: 9, contractLimited: 1 });
  });
});
