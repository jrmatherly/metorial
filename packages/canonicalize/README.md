# @metorial-mcp-containers/canonicalize

JSON canonicalization utility for the Metorial ecosystem. This package provides RFC8785-compliant JSON canonicalization, ensuring deterministic and reproducible JSON representations for cryptographic signatures, content hashing, and data comparison.

## Features

- **📜 RFC8785 Compliant**: Implements [RFC8785](https://www.rfc-editor.org/rfc/rfc8785) JSON Canonicalization Scheme (JCS)
- **🔒 Deterministic Output**: Always produces the same output for equivalent JSON data
- **🔑 Sorted Keys**: Automatically sorts object keys lexicographically
- **🎯 Type Support**: Handles primitives, arrays, objects, dates, and special values
- **⚡ Zero Dependencies**: Lightweight and performant
- **🔐 Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @metorial-mcp-containers/canonicalize
```

## Quick Start

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Basic object canonicalization
const data = { b: 2, a: 1 };
canonicalize(data); // '{"a":1,"b":2}'

// Array canonicalization
canonicalize([3, 1, 2]); // '[3,1,2]'

// Nested structures
const nested = {
  user: { name: 'Alice', id: 123 },
  active: true
};
canonicalize(nested); // '{"active":true,"user":{"id":123,"name":"Alice"}}'
```

## What is JSON Canonicalization?

JSON Canonicalization (RFC8785) is a standardized method for producing a unique, deterministic representation of JSON data. This is essential for:

- **Cryptographic Signatures**: Sign JSON data consistently
- **Content Hashing**: Generate reliable content-addressed identifiers
- **Data Comparison**: Compare JSON structures reliably
- **Cache Keys**: Create deterministic cache identifiers
- **Deduplication**: Identify equivalent JSON documents

**Key differences from `JSON.stringify()`:**

| Feature | `JSON.stringify()` | `canonicalize()` |
|---------|-------------------|------------------|
| Key ordering | Insertion order | Lexicographic (sorted) |
| Whitespace | Configurable | Always minimal |
| Undefined handling | Omitted | Converted to null |
| Number format | Variable | RFC8785 normalized |
| Deterministic | No | Yes |

## API Reference

### `canonicalize(json: any): string`

Converts any JSON-compatible value into its canonical string representation according to RFC8785.

**Parameters:**
- `json` (any): The value to canonicalize (primitives, objects, arrays, dates, etc.)

**Returns:** Canonical JSON string representation

**Throws:** Error if the input contains non-finite numbers (Infinity, -Infinity, NaN)

**Examples:**

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Primitives
canonicalize(null); // 'null'
canonicalize(true); // 'true'
canonicalize(42); // '42'
canonicalize('hello'); // '"hello"'

// Objects (keys are sorted)
canonicalize({ z: 3, a: 1, m: 2 }); // '{"a":1,"m":2,"z":3}'

// Arrays (order preserved)
canonicalize([3, 1, 2]); // '[3,1,2]'

// Nested structures
canonicalize({
  name: 'Alice',
  settings: { theme: 'dark', notifications: true },
  tags: ['admin', 'user']
});
// '{"name":"Alice","settings":{"notifications":true,"theme":"dark"},"tags":["admin","user"]}'

// Dates (converted to ISO strings)
canonicalize(new Date('2024-01-15T10:00:00Z'));
// '"2024-01-15T10:00:00.000Z"'

// Undefined and symbols (converted to null)
canonicalize({ a: undefined, b: Symbol('x') }); // '{"a":null,"b":null}'

// Invalid: Non-finite numbers throw errors
canonicalize(Infinity); // throws Error
canonicalize(NaN); // throws Error
```

## Common Patterns

### Cryptographic Signatures

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';
import { createHash } from 'crypto';

// Create consistent signatures for JSON data
function signData(data: any, secretKey: string): string {
  const canonical = canonicalize(data);
  const hmac = createHash('sha256').update(canonical + secretKey);
  return hmac.digest('hex');
}

const document = { userId: 123, action: 'login', timestamp: Date.now() };
const signature = signData(document, 'secret');

// Verify signature
function verifySignature(data: any, signature: string, secretKey: string): boolean {
  return signData(data, secretKey) === signature;
}

verifySignature(document, signature, 'secret'); // true
```

### Content-Addressed Storage

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';
import { createHash } from 'crypto';

// Generate deterministic content hashes
function getContentHash(data: any): string {
  const canonical = canonicalize(data);
  return createHash('sha256').update(canonical).digest('hex');
}

const doc1 = { b: 2, a: 1 };
const doc2 = { a: 1, b: 2 }; // Different key order

getContentHash(doc1); // 'abc123...'
getContentHash(doc2); // 'abc123...' (same hash!)

// Use as cache key
const cache = new Map<string, any>();
const cacheKey = getContentHash(query);
cache.set(cacheKey, results);
```

### Data Deduplication

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Detect duplicate JSON structures
function deduplicateRecords(records: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const record of records) {
    const canonical = canonicalize(record);
    if (!seen.has(canonical)) {
      seen.add(canonical);
      unique.push(record);
    }
  }

  return unique;
}

const records = [
  { id: 1, name: 'Alice' },
  { name: 'Alice', id: 1 }, // Duplicate (different key order)
  { id: 2, name: 'Bob' }
];

deduplicateRecords(records); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

### API Request Fingerprinting

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Create consistent request identifiers for caching/rate limiting
function getRequestFingerprint(endpoint: string, params: any): string {
  const canonical = canonicalize({ endpoint, params });
  return createHash('md5').update(canonical).digest('hex');
}

// These produce the same fingerprint despite different key order
const fp1 = getRequestFingerprint('/api/users', { sort: 'name', limit: 10 });
const fp2 = getRequestFingerprint('/api/users', { limit: 10, sort: 'name' });

console.log(fp1 === fp2); // true

// Use for rate limiting
const rateLimitMap = new Map<string, number>();
const fingerprint = getRequestFingerprint(endpoint, params);

if (rateLimitMap.has(fingerprint)) {
  const lastRequest = rateLimitMap.get(fingerprint)!;
  if (Date.now() - lastRequest < 1000) {
    throw new Error('Rate limit exceeded');
  }
}
rateLimitMap.set(fingerprint, Date.now());
```

### Database Change Detection

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Detect if database records have changed
interface Record {
  id: number;
  data: any;
  checksum?: string;
}

function updateRecord(record: Record): Record {
  return {
    ...record,
    checksum: createHash('sha256')
      .update(canonicalize(record.data))
      .digest('hex')
  };
}

function hasChanged(oldRecord: Record, newData: any): boolean {
  const oldChecksum = oldRecord.checksum;
  const newChecksum = createHash('sha256')
    .update(canonicalize(newData))
    .digest('hex');
  return oldChecksum !== newChecksum;
}

const record = updateRecord({ id: 1, data: { name: 'Alice', age: 30 } });

// Later...
hasChanged(record, { age: 30, name: 'Alice' }); // false (same data)
hasChanged(record, { name: 'Alice', age: 31 }); // true (age changed)
```

### JWT Payload Normalization

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';
import { encode } from 'base64-url';

// Create deterministic JWT payloads
function createJWT(payload: any, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };

  // Canonicalize both header and payload
  const canonicalHeader = encode(canonicalize(header));
  const canonicalPayload = encode(canonicalize(payload));

  const signature = createHash('sha256')
    .update(`${canonicalHeader}.${canonicalPayload}.${secret}`)
    .digest('base64url');

  return `${canonicalHeader}.${canonicalPayload}.${signature}`;
}

const token = createJWT({ userId: 123, role: 'admin' }, 'secret');
```

### GraphQL Query Deduplication

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Deduplicate GraphQL queries with different variable order
function getQueryKey(query: string, variables: any): string {
  return `${query}:${canonicalize(variables)}`;
}

const query = 'query GetUser($id: ID!, $includeEmail: Boolean!) { ... }';

// These produce the same key despite different variable order
const key1 = getQueryKey(query, { id: '123', includeEmail: true });
const key2 = getQueryKey(query, { includeEmail: true, id: '123' });

console.log(key1 === key2); // true

// Use for query result caching
const queryCache = new Map<string, any>();
const queryKey = getQueryKey(query, variables);

if (queryCache.has(queryKey)) {
  return queryCache.get(queryKey);
}

const result = await executeQuery(query, variables);
queryCache.set(queryKey, result);
```

## How It Works

The `canonicalize` function transforms JSON data into a canonical form following RFC8785:

**Canonicalization Process:**

1. **Type Validation**: Rejects non-finite numbers (Infinity, NaN)
2. **Special Value Handling**: Converts `undefined` and `Symbol` to `null`
3. **Date Conversion**: Transforms `Date` objects to ISO 8601 strings
4. **Number Normalization**: Ensures RFC8785-compliant number representation
5. **Object Key Sorting**: Sorts object keys lexicographically
6. **Recursive Processing**: Applies canonicalization to nested structures
7. **Minimal Formatting**: Outputs JSON with no whitespace

**Key Sorting Example:**

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

const input = {
  zebra: 1,
  apple: 2,
  mango: 3,
  banana: 4
};

// Keys are sorted alphabetically
canonicalize(input); // '{"apple":2,"banana":4,"mango":3,"zebra":1}'

// Nested objects are also sorted
const nested = {
  z: { b: 1, a: 2 },
  a: { y: 1, x: 2 }
};

canonicalize(nested); // '{"a":{"x":2,"y":1},"z":{"a":2,"b":1}}'
```

**Custom toJSON Support:**

Objects with a `toJSON()` method are canonicalized via their JSON representation:

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

class User {
  constructor(public id: number, public name: string) {}

  toJSON() {
    return { userId: this.id, userName: this.name };
  }
}

const user = new User(123, 'Alice');
canonicalize(user); // '{"userId":123,"userName":"Alice"}'
```

## RFC8785 Compliance

This implementation follows [RFC8785 - JSON Canonicalization Scheme (JCS)](https://www.rfc-editor.org/rfc/rfc8785) specification:

- **Unicode Handling**: UTF-8 encoding with proper escape sequences
- **Number Representation**: IEEE 754 double precision normalization
- **Lexicographic Ordering**: Keys sorted using Unicode code point comparison
- **Whitespace**: No insignificant whitespace in output
- **String Escaping**: Minimal escape sequences as per JSON spec

**Canonical vs Non-Canonical:**

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Non-canonical (JSON.stringify)
JSON.stringify({ b: 2, a: 1 }, null, 2);
// {
//   "b": 2,
//   "a": 1
// }

// Canonical (RFC8785)
canonicalize({ b: 2, a: 1 }); // '{"a":1,"b":2}'
```

## Best Practices

### Use for Cryptographic Operations

Always canonicalize before signing or hashing:

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Good: Deterministic signature
const canonical = canonicalize(data);
const signature = sign(canonical, privateKey);

// Bad: Non-deterministic (key order varies)
const json = JSON.stringify(data);
const signature = sign(json, privateKey);
```

### Validate Input Before Canonicalization

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

function safeCanonicalize(data: any): string | null {
  try {
    return canonicalize(data);
  } catch (error) {
    console.error('Canonicalization failed:', error);
    return null;
  }
}

// Handles invalid inputs gracefully
safeCanonicalize({ value: Infinity }); // null (logs error)
safeCanonicalize({ value: 42 }); // '{"value":42}'
```

### Cache Canonical Representations

For frequently accessed data, cache the canonical form:

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

class CachedDocument {
  private _canonical?: string;

  constructor(private data: any) {}

  get canonical(): string {
    if (!this._canonical) {
      this._canonical = canonicalize(this.data);
    }
    return this._canonical;
  }

  updateData(newData: any) {
    this.data = newData;
    this._canonical = undefined; // Invalidate cache
  }
}

const doc = new CachedDocument({ a: 1, b: 2 });
doc.canonical; // Computes and caches
doc.canonical; // Returns cached value
```

### Compare JSON Structures

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Reliable JSON comparison
function jsonEquals(a: any, b: any): boolean {
  try {
    return canonicalize(a) === canonicalize(b);
  } catch {
    return false;
  }
}

jsonEquals({ b: 2, a: 1 }, { a: 1, b: 2 }); // true
jsonEquals([1, 2, 3], [3, 2, 1]); // false (array order matters)
```

## Error Handling

The `canonicalize` function throws errors for invalid inputs:

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Invalid: Non-finite numbers
try {
  canonicalize(Infinity);
} catch (error) {
  console.error(error.message); // 'canonicalize: cannot canonicalize non-number JSON'
}

try {
  canonicalize(NaN);
} catch (error) {
  console.error(error.message); // 'canonicalize: cannot canonicalize non-number JSON'
}

// Valid: Regular numbers work fine
canonicalize(3.14159); // '3.14159'
canonicalize(-273.15); // '-273.15'
canonicalize(0); // '0'
```

## Performance Considerations

- **Object Key Sorting**: O(n log n) complexity for object keys
- **Recursive Processing**: Linear time relative to data structure depth
- **String Building**: Minimal allocations using template literals
- **No Regex**: Uses native string operations for efficiency
- **Caching**: Consider caching canonical forms for frequently accessed data

**Performance Tips:**

```typescript
import { canonicalize } from '@metorial-mcp-containers/canonicalize';

// Good: Canonicalize once, use many times
const canonical = canonicalize(largeObject);
const hash1 = sha256(canonical);
const hash2 = md5(canonical);
const signature = sign(canonical, key);

// Less efficient: Repeated canonicalization
const hash1 = sha256(canonicalize(largeObject));
const hash2 = md5(canonicalize(largeObject));
const signature = sign(canonicalize(largeObject), key);
```

## Related Packages

- [`@metorial-mcp-containers/case`](../case) - String case conversion utilities
- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities

## References

- [RFC8785 - JSON Canonicalization Scheme (JCS)](https://www.rfc-editor.org/rfc/rfc8785)
- [JSON Specification (RFC8259)](https://www.rfc-editor.org/rfc/rfc8259)

## License

MIT
