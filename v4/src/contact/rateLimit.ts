/**
 * Fixed-window counter per key, in process memory. Enough to keep one visitor from turning the
 * contact form into a mail cannon; a restart or a second replica resets it, which is acceptable
 * for that purpose.
 */
export class RateLimiter {
  private readonly windows = new Map<
    string,
    { start: number; count: number }
  >();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  allow(key: string): boolean {
    const now = this.now();
    const current = this.windows.get(key);
    if (!current || now - current.start >= this.windowMs) {
      this.windows.set(key, { start: now, count: 1 });
      this.sweep(now);
      return true;
    }
    current.count++;
    return current.count <= this.limit;
  }

  private sweep(now: number) {
    for (const [key, window] of this.windows)
      if (now - window.start >= this.windowMs) this.windows.delete(key);
  }
}
