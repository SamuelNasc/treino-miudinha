import { describe, expect, it } from "vitest";
import { localDate, weekStart } from "./dates";

describe("dates", () => {
  it("local date and monday week start", () => {
    // 22:00 local on 2026-10-05 is 01:00 UTC on 2026-10-06 in UTC-3.
    const late = new Date(2026, 9, 5, 22, 0);
    expect(late.toISOString().slice(0, 10)).toBe("2026-10-06");
    expect(localDate(late)).toBe("2026-10-05");

    expect(weekStart("2026-10-11")).toBe("2026-10-05"); // Sunday -> Monday before
    expect(weekStart("2026-10-05")).toBe("2026-10-05"); // Monday -> itself
  });
});
