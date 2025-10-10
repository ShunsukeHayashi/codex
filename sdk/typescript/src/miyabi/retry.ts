/**
 * Retry Logic with Exponential Backoff
 * Phase 8: Real API Integration
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryableErrors: string[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableErrors: [
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "ECONNRESET",
    "EPIPE",
    "503", // Service Unavailable
    "502", // Bad Gateway
    "504", // Gateway Timeout
  ],
};

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns The result of the function
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => {
 *     return await fetchData();
 *   },
 *   {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some((code) =>
        lastError!.message.includes(code)
      );

      // Don't retry if:
      // 1. Error is not retryable
      // 2. We've exhausted all retries
      if (!isRetryable || attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      // Log retry attempt
      console.warn(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms. Error: ${lastError.message}`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Create a retry wrapper for a function
 *
 * @param fn - The async function to wrap
 * @param options - Retry options
 * @returns A wrapped function with retry logic
 *
 * @example
 * ```typescript
 * const fetchWithRetry = createRetryWrapper(
 *   fetchData,
 *   { maxRetries: 3 }
 * );
 *
 * const result = await fetchWithRetry(params);
 * ```
 */
export function createRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: Partial<RetryOptions> = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    return withRetry(() => fn(...args), options);
  };
}
