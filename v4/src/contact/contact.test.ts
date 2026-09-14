import { describe, expect, it } from "vitest";

import { contactEmail } from "./contact";
import { ContactSchema } from "./schema";
import { RateLimiter } from "./rateLimit";

describe("ContactSchema", () => {
  it("accepts a gallery path, an email, a known subject and a message", () => {
    expect(
      ContactSchema.parse({
        context: "/con/sat/dsc-1",
        email: " a@b.fi ",
        subject: "takedown",
        message: "Hi",
      }),
    ).toEqual({
      context: "/con/sat/dsc-1",
      email: "a@b.fi",
      subject: "takedown",
      message: "Hi",
    });
  });

  it("rejects foreign contexts, unknown subjects and empty messages", () => {
    expect(
      ContactSchema.safeParse({
        context: "https://x/",
        email: "a@b.fi",
        subject: "other",
        message: "x",
      }).success,
    ).toBe(false);
    expect(
      ContactSchema.safeParse({
        context: "/a",
        email: "a@b.fi",
        subject: "spam",
        message: "x",
      }).success,
    ).toBe(false);
    expect(
      ContactSchema.safeParse({
        context: "/a",
        email: "a@b.fi",
        subject: "other",
        message: "  ",
      }).success,
    ).toBe(false);
    expect(
      ContactSchema.safeParse({
        context: "/a",
        email: "not-an-email",
        subject: "other",
        message: "x",
      }).success,
    ).toBe(false);
  });
});

describe("contactEmail", () => {
  it("puts the site, subject and context in the subject line and the sender in the body", () => {
    const mail = contactEmail(
      {
        context: "/con/sat/dsc-1",
        email: "visitor@example.com",
        subject: "permission",
        message: "May I?",
      },
      "Conikuvat",
    );
    expect(mail.subject).toBe(
      "[Conikuvat] Usage permission inquiry (/con/sat/dsc-1)",
    );
    expect(mail.text).toContain("/con/sat/dsc-1");
    expect(mail.text).toContain("visitor@example.com");
    expect(mail.text).toContain("Usage permission inquiry");
    expect(mail.text.trimEnd().endsWith("May I?")).toBe(true);
  });
});

describe("RateLimiter", () => {
  it("allows the limit within a window and resets after it", () => {
    let now = 0;
    const limiter = new RateLimiter(2, 1000, () => now);
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("a")).toBe(false);
    expect(limiter.allow("b")).toBe(true);
    now = 1000;
    expect(limiter.allow("a")).toBe(true);
  });
});
