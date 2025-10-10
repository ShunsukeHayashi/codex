/**
 * Retry Logic Unit Tests
 * Phase 8: Real API Integration
 */

import { withRetry, createRetryWrapper } from "../../src/miyabi/retry.js";

// Mock console.warn to avoid polluting test output
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

describe("Retry Logic", () => {
  describe("withRetry", () => {
    it("should return result on first success", async () => {
      const fn = jest.fn().mockResolvedValue("success");

      const result = await withRetry(fn, { maxRetries: 3 });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on retryable error", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("ECONNREFUSED"))
        .mockResolvedValue("success");

      const result = await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10, // Short delay for test
      });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should retry multiple times", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("ETIMEDOUT"))
        .mockRejectedValueOnce(new Error("ETIMEDOUT"))
        .mockResolvedValue("success");

      const result = await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
      });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

      await expect(
        withRetry(fn, {
          maxRetries: 2,
          baseDelay: 10,
        })
      ).rejects.toThrow("ECONNREFUSED");

      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it("should not retry on non-retryable error", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("INVALID_ARGUMENT"));

      await expect(
        withRetry(fn, {
          maxRetries: 3,
          baseDelay: 10,
        })
      ).rejects.toThrow("INVALID_ARGUMENT");

      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it("should use exponential backoff", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("503"))
        .mockRejectedValueOnce(new Error("503"))
        .mockResolvedValue("success");

      const startTime = Date.now();

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 100,
        maxDelay: 1000,
      });

      const duration = Date.now() - startTime;

      // Should have delays: 100ms + 200ms = 300ms (approximately)
      expect(duration).toBeGreaterThanOrEqual(250);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should respect maxDelay", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("502"))
        .mockRejectedValueOnce(new Error("502"))
        .mockResolvedValue("success");

      const startTime = Date.now();

      await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 500, // Max delay less than base delay
      });

      const duration = Date.now() - startTime;

      // Should use maxDelay (500ms) for both retries = 1000ms
      expect(duration).toBeGreaterThanOrEqual(900);
      expect(duration).toBeLessThan(1500);
    });

    it("should handle custom retryable errors", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("CUSTOM_ERROR"))
        .mockResolvedValue("success");

      const result = await withRetry(fn, {
        maxRetries: 3,
        baseDelay: 10,
        retryableErrors: ["CUSTOM_ERROR"],
      });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("createRetryWrapper", () => {
    it("should create a wrapped function with retry logic", async () => {
      const originalFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("ETIMEDOUT"))
        .mockResolvedValue("success");

      const wrappedFn = createRetryWrapper(originalFn, {
        maxRetries: 3,
        baseDelay: 10,
      });

      const result = await wrappedFn();

      expect(result).toBe("success");
      expect(originalFn).toHaveBeenCalledTimes(2);
    });

    it("should pass arguments to wrapped function", async () => {
      const originalFn = jest
        .fn()
        .mockImplementation((a: number, b: string) => Promise.resolve(`${a}-${b}`));

      const wrappedFn = createRetryWrapper(originalFn, {
        maxRetries: 3,
        baseDelay: 10,
      });

      const result = await wrappedFn(42, "test");

      expect(result).toBe("42-test");
      expect(originalFn).toHaveBeenCalledWith(42, "test");
    });
  });

  describe("Default retry options", () => {
    it("should use default options when not specified", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("ECONNREFUSED"))
        .mockResolvedValue("success");

      const result = await withRetry(fn);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should retry on default retryable errors", async () => {
      const errors = [
        "ECONNREFUSED",
        "ETIMEDOUT",
        "ENOTFOUND",
        "ECONNRESET",
        "EPIPE",
        "503",
        "502",
        "504",
      ];

      for (const errorCode of errors) {
        const fn = jest
          .fn()
          .mockRejectedValueOnce(new Error(errorCode))
          .mockResolvedValue("success");

        const result = await withRetry(fn, { baseDelay: 1 });

        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(2);
      }
    });
  });
});
