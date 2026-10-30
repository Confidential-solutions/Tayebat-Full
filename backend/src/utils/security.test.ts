import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
} from "./security.js";

describe("security utils", () => {
  it("hashes and compares passwords", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(hash).not.toBe("correct-horse-battery");
    expect(await comparePassword("correct-horse-battery", hash)).toBe(true);
    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("generates and verifies JWT", () => {
    const token = generateToken({
      userId: 1,
      email: "test@example.com",
      role: "user",
    } as any);
    const payload = verifyToken(token);
    expect(payload).toBeTruthy();
    expect((payload as any).email).toBe("test@example.com");
  });

  it("extractToken reads Bearer header only", () => {
    expect(extractToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractToken("abc.def.ghi")).toBeNull();
    expect(extractToken(undefined)).toBeNull();
  });

  it("verifyToken returns null for invalid token", () => {
    expect(verifyToken("not-a-jwt")).toBeNull();
  });
});
