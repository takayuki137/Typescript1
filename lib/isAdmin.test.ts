import { describe, expect, it } from "vitest";
import { isAdmin } from "./isAdmin";

describe("isAdmin", () => {
  it("role が ADMIN のとき true を返す", () => {
    expect(isAdmin("ADMIN")).toBe(true);
  });
});
