import { describe, expect, it } from "vitest";
import { isAdmin } from "./isAdmin";

describe("isAdmin", () => {
  it("role が ADMIN のとき true を返す", () => {
    expect(isAdmin("ADMIN")).toBe(true);
  });

  it("role が admin のとき true を返す", () => {
    expect(isAdmin("admin")).toBe(true);
  });

  it("role が Admin のとき true を返す", () => {
    expect(isAdmin("Admin")).toBe(true);
  });

  it("role が USER のとき false を返す", () => {
    expect(isAdmin("USER")).toBe(false);
  });

  it("role が null のとき false を返す", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("role が undefined のとき false を返す", () => {
    expect(isAdmin(undefined)).toBe(false);
  });
});