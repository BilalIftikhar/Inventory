import { describe, expect, it } from "vitest";
import { loginBodySchema } from "./auth";

describe("loginBodySchema", () => {
  it("accepts valid login", () => {
    expect(
      loginBodySchema.safeParse({
        email: "user@example.com",
        password: "secret",
      }).success,
    ).toBe(true);
  });

  it("rejects empty password", () => {
    expect(
      loginBodySchema.safeParse({
        email: "user@example.com",
        password: "",
      }).success,
    ).toBe(false);
  });
});
