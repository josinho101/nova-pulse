import { describe, expect, it } from "vitest";
import { getHealthStatus } from "./health.controller";

describe("getHealthStatus", () => {
  it("returns ok status with a valid ISO timestamp", () => {
    const before = Date.now();
    const result = getHealthStatus();
    const after = Date.now();

    expect(result.status).toBe("ok");

    const time = new Date(result.time).getTime();
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(after);
  });
});
