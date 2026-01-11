/**
 * Smart Delay Utilities
 * 
 * Implements human-like delays with jitter to avoid detection
 */

/**
 * Sleep for a random duration between min and max milliseconds
 * Adds natural variation to avoid predictable patterns
 */
export async function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  console.log(`⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Smart delay between job scraping requests
 * Recommended: 10-20 seconds with jitter
 */
export async function smartJobDelay(): Promise<void> {
  const min = parseInt(process.env.SCRAPE_DELAY_MIN || '10000', 10); // 10s default
  const max = parseInt(process.env.SCRAPE_DELAY_MAX || '20000', 10); // 20s default
  await randomDelay(min, max);
}

/**
 * Short delay between page pagination
 * Recommended: 3-6 seconds with jitter
 */
export async function smartPageDelay(): Promise<void> {
  const min = parseInt(process.env.PAGE_DELAY_MIN || '3000', 10); // 3s default
  const max = parseInt(process.env.PAGE_DELAY_MAX || '6000', 10); // 6s default
  await randomDelay(min, max);
}

/**
 * Exponential backoff for retries
 * Used when encountering rate limits or temporary failures
 */
export async function exponentialBackoff(
  attempt: number,
  baseDelayMs: number = 5000,
  maxDelayMs: number = 120000
): Promise<void> {
  const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  // Add 20% jitter
  const jitter = exponentialDelay * 0.2 * Math.random();
  const totalDelay = exponentialDelay + jitter;
  
  console.log(`⏳ Retry attempt ${attempt + 1}: waiting ${(totalDelay / 1000).toFixed(1)}s...`);
  await new Promise(resolve => setTimeout(resolve, totalDelay));
}

