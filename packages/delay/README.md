# @metorial-mcp-containers/delay

Promise-based delay utility for the Metorial ecosystem. This package provides a simple async delay function for pausing execution in asynchronous code.

## Features

- **⏱️ Promise-Based**: Clean async/await syntax for delays
- **⚡ Zero Dependencies**: Lightweight and performant
- **🔐 Type-Safe**: Full TypeScript support
- **🎯 Simple API**: Single function - just specify milliseconds

## Installation

```bash
bun add @metorial-mcp-containers/delay
```

## Quick Start

```typescript
import { delay } from '@metorial-mcp-containers/delay';

// Wait for 1 second
await delay(1000);
console.log('Executed after 1 second');

// Use in async functions
async function fetchWithRetry() {
  try {
    return await fetch('/api/data');
  } catch (error) {
    console.log('Retrying in 2 seconds...');
    await delay(2000);
    return await fetch('/api/data');
  }
}
```

## API Reference

### `delay(ms: number): Promise<void>`

Creates a Promise that resolves after the specified number of milliseconds.

**Parameters:**
- `ms` (number): Number of milliseconds to wait before resolving

**Returns:** Promise<void> that resolves after the specified delay

**Example:**

```typescript
import { delay } from '@metorial-mcp-containers/delay';

// Wait for 500ms
await delay(500);
```

## Common Patterns

### Retry with Backoff

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function fetchWithExponentialBackoff(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const backoffTime = Math.pow(2, attempt) * 1000;
      console.log(`Retry ${attempt + 1} after ${backoffTime}ms`);
      await delay(backoffTime);
    }
  }
}

// Retry with 1s, 2s, 4s delays
await fetchWithExponentialBackoff('/api/data');
```

### Rate Limiting

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function processItemsWithRateLimit<T>(
  items: T[],
  processItem: (item: T) => Promise<void>,
  delayMs = 100
) {
  for (const item of items) {
    await processItem(item);
    await delay(delayMs); // 100ms between each request
  }
}

// Process with 100ms delay between items
await processItemsWithRateLimit(
  users,
  async (user) => await updateUser(user),
  100
);
```

### Polling

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function pollUntilComplete(
  checkStatus: () => Promise<boolean>,
  intervalMs = 1000,
  timeoutMs = 30000
) {
  const startTime = Date.now();

  while (true) {
    if (await checkStatus()) {
      return true;
    }

    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Polling timeout');
    }

    await delay(intervalMs);
  }
}

// Poll every second for up to 30 seconds
await pollUntilComplete(
  async () => {
    const status = await getJobStatus(jobId);
    return status === 'completed';
  },
  1000,
  30000
);
```

### Debouncing User Input

```typescript
import { delay } from '@metorial-mcp-containers/delay';

let searchTimeout: NodeJS.Timeout | null = null;

async function debouncedSearch(query: string) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  return new Promise((resolve) => {
    searchTimeout = setTimeout(async () => {
      const results = await performSearch(query);
      resolve(results);
    }, 300);
  });
}

// Alternative using delay directly
async function searchWithDelay(query: string) {
  await delay(300);
  return await performSearch(query);
}
```

### Animation Timing

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function animateProgressBar(targetProgress: number) {
  const steps = 20;
  const increment = targetProgress / steps;
  const stepDelay = 50; // 50ms per step

  for (let i = 0; i <= steps; i++) {
    updateProgressBar(i * increment);
    await delay(stepDelay);
  }
}

// Animate progress bar over 1 second (20 steps × 50ms)
await animateProgressBar(100);
```

### Sequential Task Execution

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function runTasksSequentially(tasks: Array<() => Promise<void>>) {
  for (const task of tasks) {
    await task();
    await delay(500); // 500ms pause between tasks
    console.log('Task completed, waiting before next...');
  }
}

// Execute tasks with delays
await runTasksSequentially([
  async () => await initializeDatabase(),
  async () => await seedData(),
  async () => await runMigrations(),
  async () => await startServer()
]);
```

### Testing Async Behavior

```typescript
import { delay } from '@metorial-mcp-containers/delay';
import { test, expect } from 'bun:test';

test('timeout handling', async () => {
  const result = await Promise.race([
    delay(100).then(() => 'completed'),
    delay(50).then(() => 'timeout')
  ]);

  expect(result).toBe('timeout');
});

test('loading state management', async () => {
  let loading = true;

  delay(100).then(() => {
    loading = false;
  });

  expect(loading).toBe(true);
  await delay(150);
  expect(loading).toBe(false);
});
```

### Circuit Breaker Pattern

```typescript
import { delay } from '@metorial-mcp-containers/delay';

class CircuitBreaker {
  private failures = 0;
  private readonly threshold = 3;
  private readonly resetTimeout = 5000;
  private isOpen = false;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.threshold) {
        this.isOpen = true;
        console.log('Circuit breaker opened');

        // Reset after timeout
        delay(this.resetTimeout).then(() => {
          this.isOpen = false;
          this.failures = 0;
          console.log('Circuit breaker reset');
        });
      }

      throw error;
    }
  }
}

const breaker = new CircuitBreaker();
await breaker.execute(() => fetch('/api/data'));
```

## How It Works

The `delay` function is a simple wrapper around JavaScript's `setTimeout` that returns a Promise:

```typescript
export let delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

**Execution Flow:**

1. **Promise Creation**: Creates a new Promise when called
2. **Timer Setup**: Sets up a `setTimeout` with the specified duration
3. **Resolution**: Resolves the Promise when the timer completes
4. **Await**: Can be awaited in async functions to pause execution

**Example:**

```typescript
import { delay } from '@metorial-mcp-containers/delay';

async function example() {
  console.log('Start');
  await delay(1000); // Pauses here for 1 second
  console.log('End');
}
```

## Best Practices

### Use Descriptive Delays

```typescript
// Good: Clear intent
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_DELAY_MS = 100;

await delay(RETRY_DELAY_MS);
await delay(RATE_LIMIT_DELAY_MS);

// Less clear: Magic numbers
await delay(2000);
await delay(100);
```

### Avoid Blocking Main Thread Unnecessarily

```typescript
import { delay } from '@metorial-mcp-containers/delay';

// Good: Delay between API calls to respect rate limits
for (const item of items) {
  await processItem(item);
  await delay(100);
}

// Bad: Unnecessary delays in tight loops
for (let i = 0; i < 1000; i++) {
  await delay(10); // Adds 10 seconds total!
  processNumber(i);
}
```

### Combine with Timeouts

```typescript
import { delay } from '@metorial-mcp-containers/delay';

// Good: Use Promise.race for timeout behavior
async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  return Promise.race([
    fetch(url),
    delay(timeoutMs).then(() => {
      throw new Error('Request timeout');
    })
  ]);
}

// Throws error if fetch takes longer than 5 seconds
await fetchWithTimeout('/api/data', 5000);
```

### Configurable Delays

```typescript
import { delay } from '@metorial-mcp-containers/delay';

// Good: Make delays configurable
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs);
    }
  }
  throw new Error('All retries failed');
}

// Use with different delays
await retryWithDelay(apiCall, 3, 500);
await retryWithDelay(dbQuery, 5, 2000);
```

## Performance Considerations

- **Non-Blocking**: Uses `setTimeout` which is non-blocking and doesn't consume CPU
- **Memory**: Each delay creates one Promise and one timer - minimal memory footprint
- **Precision**: JavaScript timers are not perfectly precise - actual delay may be slightly longer
- **Event Loop**: Delays don't block the event loop - other operations can execute
- **Testing**: Consider mocking delays in tests to avoid slow test suites

```typescript
// In tests, you might want to mock delay
import { test, mock } from 'bun:test';

const mockDelay = mock(() => Promise.resolve());

// Or use a library like fake-timers to control time in tests
```

## Related Packages

- [`@metorial-mcp-containers/cleanup`](../cleanup) - Cleanup function registry
- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities

## License

MIT
