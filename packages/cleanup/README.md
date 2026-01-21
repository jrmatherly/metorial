# @metorial-mcp-containers/cleanup

Cleanup function registry for the Metorial ecosystem. This package provides a simple mechanism for registering cleanup handlers that execute in reverse order (LIFO) when your application shuts down or cleanup is triggered.

## Features

- **🔄 LIFO Execution**: Cleanup functions run in reverse registration order
- **🛡️ Error Resilient**: Continues executing remaining handlers even if one fails
- **⚡ Zero Dependencies**: Lightweight and performant
- **🔐 Type-Safe**: Full TypeScript support with async/await
- **🎯 Simple API**: Just two functions - register and cleanup

## Installation

```bash
bun add @metorial-mcp-containers/cleanup
```

## Quick Start

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

// Register cleanup handlers
registerCleanup(async () => {
  console.log('Closing database connection...');
  await db.close();
});

registerCleanup(async () => {
  console.log('Shutting down server...');
  await server.close();
});

// When application exits or cleanup is needed
await cleanup();
// Output:
// Shutting down server...      (runs second)
// Closing database connection... (runs first)
```

## API Reference

### `registerCleanup(fn: () => Promise<void>): void`

Registers an async cleanup function to be executed when `cleanup()` is called. Functions are stored in a stack and executed in LIFO (Last In, First Out) order.

**Parameters:**
- `fn` (() => Promise<void>): Async function to execute during cleanup

**Returns:** void

**Example:**

```typescript
import { registerCleanup } from '@metorial-mcp-containers/cleanup';

registerCleanup(async () => {
  await closeConnection();
});
```

### `cleanup(): Promise<void>`

Executes all registered cleanup functions in reverse order (LIFO). If a cleanup function throws an error, it logs the error and continues with the remaining functions.

**Returns:** Promise<void>

**Error Handling:** Errors are logged to console.error but do not stop execution of other cleanup handlers.

**Example:**

```typescript
import { cleanup } from '@metorial-mcp-containers/cleanup';

// Execute all registered cleanup functions
await cleanup();
```

## Common Patterns

### Application Shutdown Handler

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

// Register cleanup handlers during application initialization
async function initializeApp() {
  const db = await connectDatabase();
  registerCleanup(async () => {
    console.log('Closing database...');
    await db.close();
  });

  const server = await startServer();
  registerCleanup(async () => {
    console.log('Stopping server...');
    await server.stop();
  });

  const cache = await connectCache();
  registerCleanup(async () => {
    console.log('Flushing cache...');
    await cache.flush();
  });
}

// Handle shutdown signals
process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});
```

### Resource Management

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

async function acquireResource() {
  const resource = await allocate();

  // Register cleanup immediately after allocation
  registerCleanup(async () => {
    await resource.release();
  });

  return resource;
}

// In your application
const resource1 = await acquireResource();
const resource2 = await acquireResource();

// When done
await cleanup(); // Releases resource2 first, then resource1
```

### Temporary File Cleanup

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';
import { unlink } from 'fs/promises';

async function createTempFile(prefix: string) {
  const filePath = `/tmp/${prefix}-${Date.now()}.tmp`;
  await writeFile(filePath, '');

  registerCleanup(async () => {
    try {
      await unlink(filePath);
      console.log(`Deleted temp file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete temp file: ${filePath}`, error);
    }
  });

  return filePath;
}

// Create multiple temp files
const file1 = await createTempFile('data');
const file2 = await createTempFile('cache');

// Cleanup removes files in reverse order
await cleanup();
```

### Worker Pool Cleanup

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

class WorkerPool {
  private workers: Worker[] = [];

  async initialize(count: number) {
    for (let i = 0; i < count; i++) {
      const worker = new Worker('./worker.js');
      this.workers.push(worker);
    }

    registerCleanup(async () => {
      console.log(`Terminating ${this.workers.length} workers...`);
      await Promise.all(
        this.workers.map(worker => worker.terminate())
      );
    });
  }
}

const pool = new WorkerPool();
await pool.initialize(4);

// Later...
await cleanup(); // Terminates all workers
```

### Test Cleanup

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';
import { beforeEach, afterEach, test } from 'bun:test';

beforeEach(async () => {
  // Setup test resources
  const testDb = await createTestDatabase();
  registerCleanup(async () => {
    await testDb.drop();
  });
});

afterEach(async () => {
  // Cleanup after each test
  await cleanup();
});

test('example test', async () => {
  // Test logic here
});
```

## How It Works

The cleanup mechanism uses a simple stack-based approach:

1. **Registration**: `registerCleanup()` pushes functions onto an internal array
2. **Execution**: `cleanup()` pops functions from the array (LIFO order) and executes them
3. **Error Handling**: Each function runs in a try-catch block - errors are logged but don't stop execution
4. **Idempotency**: After cleanup runs, the array is empty and can be populated again

**LIFO Execution Example:**

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

registerCleanup(async () => console.log('First registered'));  // Executes 3rd
registerCleanup(async () => console.log('Second registered')); // Executes 2nd
registerCleanup(async () => console.log('Third registered'));  // Executes 1st

await cleanup();
// Output:
// Third registered
// Second registered
// First registered
```

## Best Practices

### Register Cleanup Immediately After Resource Allocation

```typescript
// Good: Register cleanup right after allocation
const db = await connectDatabase();
registerCleanup(async () => await db.close());

// Bad: Registering cleanup far from allocation
const db = await connectDatabase();
// ... lots of code ...
registerCleanup(async () => await db.close()); // Easy to forget or lose track
```

### Handle Errors Within Cleanup Functions

While the cleanup system catches errors, it's better to handle them explicitly:

```typescript
import { registerCleanup } from '@metorial-mcp-containers/cleanup';

// Good: Explicit error handling
registerCleanup(async () => {
  try {
    await criticalResource.close();
  } catch (error) {
    console.error('Failed to close critical resource:', error);
    // Potentially alert monitoring system
  }
});

// Acceptable: Let cleanup system catch it
registerCleanup(async () => {
  await resource.close(); // Error caught by cleanup system
});
```

### Use Descriptive Logging

```typescript
import { registerCleanup } from '@metorial-mcp-containers/cleanup';

// Good: Clear logging helps debugging
registerCleanup(async () => {
  console.log('Closing Redis connection...');
  await redis.disconnect();
  console.log('Redis connection closed');
});

// Less helpful: No context
registerCleanup(async () => {
  await redis.disconnect();
});
```

### Consider Cleanup Order Dependencies

Remember that cleanup runs in LIFO order. Register dependent resources in the correct order:

```typescript
import { registerCleanup } from '@metorial-mcp-containers/cleanup';

// Database depends on connection pool
const pool = await createConnectionPool();
registerCleanup(async () => await pool.close());

const db = await connectDatabase(pool);
registerCleanup(async () => await db.close());

// Cleanup order: db closes first, then pool (correct!)
```

### Single Cleanup Call

```typescript
import { cleanup } from '@metorial-mcp-containers/cleanup';

// Good: Call cleanup once during shutdown
process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Unnecessary: Cleanup already empties the function array
process.on('SIGTERM', async () => {
  await cleanup();
  await cleanup(); // No-op, no functions left to run
});
```

## Error Handling

The cleanup system is designed to be resilient to errors:

```typescript
import { registerCleanup, cleanup } from '@metorial-mcp-containers/cleanup';

registerCleanup(async () => {
  console.log('This will run');
});

registerCleanup(async () => {
  throw new Error('This fails');
  // Error is caught, logged, and execution continues
});

registerCleanup(async () => {
  console.log('This still runs despite the error above');
});

await cleanup();
// Output:
// This still runs despite the error above
// Cleanup failed Error: This fails
// Continuing with other cleanup functions
// This will run
```

## Performance Considerations

- **Minimal Overhead**: Registration is a simple array push operation (O(1))
- **Sequential Execution**: Cleanup functions run sequentially, not in parallel
- **Memory**: Only stores function references - minimal memory footprint
- **No Polling**: No background timers or event listeners

## Related Packages

- [`@metorial-mcp-containers/case`](../case) - String case conversion utilities
- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities

## License

MIT
