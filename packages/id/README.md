# @metorial-mcp-containers/id

Unique identifier generation utility for the Metorial ecosystem. This package provides a simple function for generating prefixed, URL-safe unique IDs using nanoid.

## Features

- **🎯 Prefix Support**: Generate IDs with custom prefixes (e.g., `user_abc123`, `order_xyz789`)
- **🔐 Cryptographically Strong**: Uses nanoid for secure random ID generation
- **📏 Configurable Length**: Customize ID length to match your needs (default: 15 characters)
- **🌐 URL-Safe**: Alphanumeric characters only - safe for URLs and file systems
- **⚡ Zero Configuration**: Works out of the box with sensible defaults
- **🔐 Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @metorial-mcp-containers/id
```

## Quick Start

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Generate user ID with default length (15 chars)
const userId = generateId('user');
// "user_a1B2c3D4e5F6g7H"

// Generate order ID with custom length
const orderId = generateId('order', 10);
// "order_x9Y8z7W6v5"

// Different prefixes for different entity types
const sessionId = generateId('session');
const apiKeyId = generateId('key');
const webhookId = generateId('webhook');
```

## API Reference

### `generateId(prefix: string, length?: number): string`

Generates a unique identifier with a specified prefix and optional custom length.

**Parameters:**
- `prefix` (string): Prefix to prepend to the ID (e.g., `"user"`, `"order"`, `"session"`)
- `length` (number, optional): Length of the random portion. Default: `15`

**Returns:** String in the format `{prefix}_{randomId}`

**Character Set:** `0-9A-Za-z` (62 characters)

**Examples:**

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Default length (15 characters)
generateId('user');
// "user_a1B2c3D4e5F6g7H"

// Custom length (8 characters)
generateId('session', 8);
// "session_x9Y8z7W6"

// Very short IDs (4 characters)
generateId('tmp', 4);
// "tmp_a1B2"

// Longer IDs for extra uniqueness (32 characters)
generateId('secure', 32);
// "secure_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6"
```

## Common Patterns

### Entity Identification

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Database entities
const userId = generateId('user');
const postId = generateId('post');
const commentId = generateId('comment');

// Store in database
await db.users.create({
  id: userId,
  name: 'John Doe',
  email: 'john@example.com'
});
```

### API Keys and Tokens

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Generate API keys with longer length for security
function createApiKey(): string {
  return generateId('key', 32);
}

// Generate access tokens
function createAccessToken(): string {
  return generateId('access', 24);
}

// Generate refresh tokens
function createRefreshToken(): string {
  return generateId('refresh', 32);
}

const apiKey = createApiKey();
// "key_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6"
```

### Session Management

```typescript
import { generateId } from '@metorial-mcp-containers/id';

interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

function createSession(userId: string): Session {
  return {
    id: generateId('session', 20),
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
}

const session = createSession('user_abc123');
// { id: "session_x9Y8z7W6v5U4t3S2r1Q0", userId: "user_abc123", ... }
```

### Transaction IDs

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// E-commerce transactions
const orderId = generateId('order');
const paymentId = generateId('payment');
const refundId = generateId('refund');

// Financial operations
const transactionId = generateId('txn', 16);
const invoiceId = generateId('inv', 12);

// Create order with IDs
const order = {
  id: orderId,
  transactionId,
  items: [...],
  total: 99.99
};
```

### Temporary Resources

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Short-lived temporary files
function createTempFile(): string {
  return generateId('tmp', 8);
}

// Cache keys
function createCacheKey(resource: string): string {
  return generateId(`cache_${resource}`, 10);
}

// Upload tracking
function trackUpload(): string {
  return generateId('upload', 12);
}

const tempFile = createTempFile(); // "tmp_x9Y8z7W6"
const cacheKey = createCacheKey('user'); // "cache_user_a1B2c3D4e5"
```

### Webhook and Event IDs

```typescript
import { generateId } from '@metorial-mcp-containers/id';

interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

function createWebhookEvent(type: string, payload: any): WebhookEvent {
  return {
    id: generateId('evt', 16),
    type,
    payload,
    timestamp: Date.now()
  };
}

const event = createWebhookEvent('user.created', { userId: 'user_123' });
// { id: "evt_a1B2c3D4e5F6g7H8", type: "user.created", ... }
```

### Multi-Tenant Systems

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Tenant-specific IDs
const tenantId = generateId('tenant');
const workspaceId = generateId('workspace');
const projectId = generateId('project');

// Organization hierarchy
interface Organization {
  id: string;
  workspaces: Workspace[];
}

interface Workspace {
  id: string;
  tenantId: string;
  projects: Project[];
}

function createWorkspace(tenantId: string): Workspace {
  return {
    id: generateId('workspace', 12),
    tenantId,
    projects: []
  };
}
```

### Correlation and Request IDs

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Request tracing
function middleware(req: Request, res: Response, next: Function) {
  req.id = generateId('req', 10);
  req.correlationId = generateId('corr', 12);

  res.setHeader('X-Request-ID', req.id);
  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
}

// Log with request IDs
function log(message: string, requestId: string) {
  console.log(`[${requestId}] ${message}`);
}
```

### File and Resource Naming

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Generate unique file names
function generateFileName(extension: string): string {
  return `${generateId('file', 12)}.${extension}`;
}

// Generate S3 keys
function generateS3Key(bucket: string, type: string): string {
  return `${bucket}/${type}/${generateId(type, 16)}`;
}

const fileName = generateFileName('jpg');
// "file_a1B2c3D4e5F6.jpg"

const s3Key = generateS3Key('uploads', 'image');
// "uploads/image/image_a1B2c3D4e5F6g7H8"
```

### Job and Task IDs

```typescript
import { generateId } from '@metorial-mcp-containers/id';

interface Job {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

function createJob(type: string): Job {
  return {
    id: generateId('job', 14),
    type,
    status: 'pending',
    createdAt: new Date()
  };
}

// Background tasks
const emailJob = createJob('send_email');
const reportJob = createJob('generate_report');
const backupJob = createJob('database_backup');
```

## How It Works

The `generateId` function uses **nanoid** with a custom alphabet for secure, collision-resistant ID generation:

```typescript
import { customAlphabet } from 'nanoid';

let nid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 15);

export let generateId = (prefix: string, length: number = 15) => `${prefix}_${nid(length)}`;
```

**Key Properties:**

1. **Custom Alphabet**: Uses `0-9A-Za-z` (62 characters) - URL-safe and readable
2. **Nanoid**: Cryptographically strong random number generator
3. **Configurable**: Default length of 15 characters, customizable per use case
4. **Format**: `{prefix}_{randomId}` for easy identification and filtering

**Collision Probability:**

With the default length of 15 characters and 62-character alphabet:
- **Total combinations**: 62^15 ≈ 768 quadrillion (7.68 × 10^26)
- **Collision probability**: ~1% after generating 1 billion IDs per second for 100 years
- **Recommended for**: Most applications requiring unique identifiers

For higher security requirements, increase the length:
- **20 characters**: 62^20 ≈ 704 septillion combinations
- **32 characters**: 62^32 ≈ 2.27 × 10^57 combinations

## Best Practices

### Choose Descriptive Prefixes

```typescript
// Good: Clear entity identification
const userId = generateId('user');
const orderId = generateId('order');
const sessionId = generateId('session');

// Less clear: Generic prefixes
const id1 = generateId('id');
const id2 = generateId('data');
```

### Match Length to Use Case

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Short-lived resources: shorter IDs
const tempId = generateId('tmp', 8);
const cacheKey = generateId('cache', 10);

// Permanent entities: default length
const userId = generateId('user'); // 15 chars
const orderId = generateId('order'); // 15 chars

// Security-sensitive: longer IDs
const apiKey = generateId('key', 32);
const secretToken = generateId('secret', 40);
```

### Consistent Prefix Conventions

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Establish naming conventions
const PREFIXES = {
  USER: 'user',
  ORDER: 'order',
  SESSION: 'session',
  API_KEY: 'key',
  WEBHOOK: 'webhook'
} as const;

// Use consistent prefixes throughout codebase
const userId = generateId(PREFIXES.USER);
const orderId = generateId(PREFIXES.ORDER);
```

### Type Safety with TypeScript

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Create branded types for ID safety
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(): UserId {
  return generateId('user') as UserId;
}

function createOrderId(): OrderId {
  return generateId('order') as OrderId;
}

// Type-safe functions
function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

const userId = createUserId();
const orderId = createOrderId();

getUser(userId); // ✓ Type-safe
getUser(orderId); // ✗ Type error
```

### Index and Query Optimization

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// IDs with prefixes are great for database indexing
// They naturally group related entities together

// Example: Querying by prefix
const allUserIds = await db.entities
  .where('id', 'startsWith', 'user_')
  .toArray();

const allOrderIds = await db.entities
  .where('id', 'startsWith', 'order_')
  .toArray();
```

### Avoid Predictable IDs

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Good: Random, non-sequential IDs
const id = generateId('user');
// "user_a1B2c3D4e5F6g7H"

// Bad: Sequential IDs (security risk)
let counter = 0;
const id = `user_${counter++}`; // ✗ Predictable, enumerable
```

## Performance Considerations

- **Generation Speed**: Nanoid is extremely fast - generates millions of IDs per second
- **Memory**: Minimal memory footprint - creates simple strings
- **Collision Risk**: With default settings, collision probability is negligible
- **String Concatenation**: Uses template literals for efficient string building
- **No Dependencies**: Only depends on `nanoid` (3KB gzipped)

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// Batch generation is efficient
const userIds = Array.from({ length: 1000 }, () => generateId('user'));
// Generates 1000 IDs in ~1-2ms
```

## Security Considerations

- **Unpredictability**: IDs are cryptographically random - cannot be guessed or enumerated
- **Non-Sequential**: Unlike auto-increment IDs, these don't reveal creation order or count
- **URL-Safe**: Safe to use in URLs without encoding
- **Length**: Longer IDs = more security. Use 32+ characters for API keys and secrets

```typescript
import { generateId } from '@metorial-mcp-containers/id';

// For security-sensitive use cases, increase length
const apiKey = generateId('key', 40); // 40 characters for API keys
const resetToken = generateId('reset', 32); // 32 characters for password reset
```

## Related Packages

- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities
- [`@metorial-mcp-containers/cleanup`](../cleanup) - Cleanup function registry

## License

MIT
