# @metorial-mcp-containers/unique

Array deduplication utility for the Metorial ecosystem. This package provides a simple function for removing duplicate values from arrays while preserving order.

## Features

- **🎯 Type-Safe**: Works with arrays of any type with full TypeScript support
- **⚡ Zero Dependencies**: Lightweight and performant using native Set
- **🔄 Preserves Order**: Maintains the order of first occurrence
- **🚀 Simple API**: Single function - just pass an array
- **💎 Immutable**: Returns a new array without modifying the original

## Installation

```bash
bun add @metorial-mcp-containers/unique
```

## Quick Start

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Remove duplicates from number array
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = unique(numbers);
// [1, 2, 3, 4, 5]

// Remove duplicates from string array
const tags = ['javascript', 'typescript', 'javascript', 'node'];
const uniqueTags = unique(tags);
// ['javascript', 'typescript', 'node']

// Works with any type
const mixed = [1, '1', 2, '2', 1, 2];
const uniqueMixed = unique(mixed);
// [1, '1', 2, '2']
```

## API Reference

### `unique<T>(arr: T[]): T[]`

Returns a new array with duplicate values removed, preserving the order of first occurrence.

**Parameters:**
- `arr` (T[]): Array to deduplicate (can be any type)

**Returns:** T[] - New array with duplicates removed

**Type Safety:** The function is generic and preserves the input type

**Example:**

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const numbers = [1, 2, 2, 3, 3, 3, 4];
const result = unique(numbers);
// [1, 2, 3, 4]
```

## Common Patterns

### Deduplicating User Input

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Remove duplicate tags from user input
function normalizeTags(tags: string[]): string[] {
  return unique(tags.map(tag => tag.toLowerCase().trim()));
}

const userTags = ['JavaScript', 'typescript', ' JavaScript ', 'Node'];
const normalized = normalizeTags(userTags);
// ['javascript', 'typescript', 'node']
```

### Combining Arrays Without Duplicates

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Merge multiple arrays and remove duplicates
function mergeUnique<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat());
}

const array1 = [1, 2, 3];
const array2 = [2, 3, 4];
const array3 = [3, 4, 5];

const merged = mergeUnique(array1, array2, array3);
// [1, 2, 3, 4, 5]
```

### Filtering Unique IDs

```typescript
import { unique } from '@metorial-mcp-containers/unique';

interface Event {
  id: string;
  userId: string;
  type: string;
}

// Extract unique user IDs from events
function getUniqueUserIds(events: Event[]): string[] {
  const userIds = events.map(event => event.userId);
  return unique(userIds);
}

const events: Event[] = [
  { id: '1', userId: 'user_123', type: 'login' },
  { id: '2', userId: 'user_456', type: 'logout' },
  { id: '3', userId: 'user_123', type: 'click' }
];

const uniqueUsers = getUniqueUserIds(events);
// ['user_123', 'user_456']
```

### Deduplicating API Responses

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Remove duplicate records from paginated API responses
async function fetchAllUniqueRecords<T extends { id: string }>(
  fetchPage: (page: number) => Promise<T[]>
): Promise<T[]> {
  const allRecords: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const records = await fetchPage(page);
    allRecords.push(...records);
    hasMore = records.length > 0;
    page++;
  }

  // Deduplicate by ID
  const seenIds = new Set<string>();
  return allRecords.filter(record => {
    if (seenIds.has(record.id)) return false;
    seenIds.add(record.id);
    return true;
  });
}
```

### Category and Tag Management

```typescript
import { unique } from '@metorial-mcp-containers/unique';

interface Article {
  title: string;
  categories: string[];
  tags: string[];
}

// Get all unique categories from articles
function getAllCategories(articles: Article[]): string[] {
  const allCategories = articles.flatMap(article => article.categories);
  return unique(allCategories);
}

// Get all unique tags
function getAllTags(articles: Article[]): string[] {
  const allTags = articles.flatMap(article => article.tags);
  return unique(allTags);
}

const articles: Article[] = [
  { title: 'Post 1', categories: ['tech', 'web'], tags: ['js', 'react'] },
  { title: 'Post 2', categories: ['tech', 'mobile'], tags: ['react', 'native'] },
  { title: 'Post 3', categories: ['web', 'design'], tags: ['css', 'js'] }
];

const categories = getAllCategories(articles);
// ['tech', 'web', 'mobile', 'design']

const tags = getAllTags(articles);
// ['js', 'react', 'native', 'css']
```

### Form Field Validation

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Validate unique email addresses
function validateUniqueEmails(emails: string[]): {
  valid: boolean;
  duplicates: string[];
} {
  const uniqueEmails = unique(emails);
  const duplicates = emails.filter(
    (email, index) => emails.indexOf(email) !== index
  );

  return {
    valid: uniqueEmails.length === emails.length,
    duplicates: unique(duplicates)
  };
}

const emailList = [
  'user1@example.com',
  'user2@example.com',
  'user1@example.com',
  'user3@example.com',
  'user2@example.com'
];

const validation = validateUniqueEmails(emailList);
// {
//   valid: false,
//   duplicates: ['user1@example.com', 'user2@example.com']
// }
```

### Event Stream Deduplication

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Deduplicate real-time event streams
class EventDeduplicator<T extends { id: string }> {
  private seenIds = new Set<string>();
  private buffer: T[] = [];

  add(event: T): void {
    if (!this.seenIds.has(event.id)) {
      this.seenIds.add(event.id);
      this.buffer.push(event);
    }
  }

  getUnique(): T[] {
    return [...this.buffer];
  }

  clear(): void {
    this.seenIds.clear();
    this.buffer = [];
  }
}

const deduplicator = new EventDeduplicator();
deduplicator.add({ id: '1', data: 'event1' });
deduplicator.add({ id: '2', data: 'event2' });
deduplicator.add({ id: '1', data: 'event1_duplicate' }); // Ignored

const uniqueEvents = deduplicator.getUnique();
// [{ id: '1', data: 'event1' }, { id: '2', data: 'event2' }]
```

### Search Results Deduplication

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Combine and deduplicate search results from multiple sources
async function multiSourceSearch(query: string): Promise<string[]> {
  const [results1, results2, results3] = await Promise.all([
    searchDatabase(query),
    searchCache(query),
    searchAPI(query)
  ]);

  // Combine all results and remove duplicates
  return unique([...results1, ...results2, ...results3]);
}

// Helper functions (example implementations)
async function searchDatabase(query: string): Promise<string[]> {
  return ['result1', 'result2', 'result3'];
}

async function searchCache(query: string): Promise<string[]> {
  return ['result2', 'result4'];
}

async function searchAPI(query: string): Promise<string[]> {
  return ['result1', 'result5'];
}

const results = await multiSourceSearch('typescript');
// ['result1', 'result2', 'result3', 'result4', 'result5']
```

### Permission and Role Management

```typescript
import { unique } from '@metorial-mcp-containers/unique';

interface User {
  id: string;
  roles: string[];
  permissions: string[];
}

// Get all unique permissions from user roles
function getUserPermissions(user: User, rolePermissions: Record<string, string[]>): string[] {
  const allPermissions = [
    ...user.permissions,
    ...user.roles.flatMap(role => rolePermissions[role] || [])
  ];

  return unique(allPermissions);
}

const user: User = {
  id: 'user_123',
  roles: ['admin', 'editor'],
  permissions: ['read', 'write']
};

const rolePermissions = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write', 'publish']
};

const permissions = getUserPermissions(user, rolePermissions);
// ['read', 'write', 'delete', 'manage_users', 'publish']
```

### Data Normalization

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Normalize data by removing duplicates and sorting
function normalizeArray<T>(arr: T[], sort: boolean = false): T[] {
  const uniqueArr = unique(arr);
  return sort ? uniqueArr.sort() : uniqueArr;
}

const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
const normalized = normalizeArray(data, true);
// [1, 2, 3, 4, 5, 6, 9]

const tags = ['react', 'vue', 'angular', 'react', 'svelte'];
const normalizedTags = normalizeArray(tags, true);
// ['angular', 'react', 'svelte', 'vue']
```

## How It Works

The `unique` function uses JavaScript's built-in `Set` data structure for efficient deduplication:

```typescript
export let unique = <T>(arr: T[]) => [...new Set(arr)];
```

**Execution Flow:**

1. **Set Creation**: Creates a new `Set` from the input array
2. **Automatic Deduplication**: `Set` only stores unique values (uses `===` comparison)
3. **Array Conversion**: Spreads the `Set` back into a new array
4. **Return**: Returns the deduplicated array

**Example:**

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const input = [1, 2, 2, 3, 3, 3];

// Step 1: new Set([1, 2, 2, 3, 3, 3]) → Set { 1, 2, 3 }
// Step 2: [...Set { 1, 2, 3 }] → [1, 2, 3]

const output = unique(input); // [1, 2, 3]
```

## Best Practices

### Understand Equality Comparison

The `unique` function uses strict equality (`===`) for comparison:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Primitives: Compared by value
unique([1, 1, 2, 2]); // [1, 2] ✓
unique(['a', 'a', 'b']); // ['a', 'b'] ✓

// Objects: Compared by reference
const obj1 = { id: 1 };
const obj2 = { id: 1 };
unique([obj1, obj2]); // [{ id: 1 }, { id: 1 }] - Both kept (different references)
unique([obj1, obj1]); // [{ id: 1 }] - Deduplicated (same reference)
```

### Deduplicating Objects by Property

For object deduplication by property, use a custom approach:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Custom object deduplication by ID
function uniqueById<T extends { id: string | number }>(arr: T[]): T[] {
  const seen = new Set<string | number>();
  return arr.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice (duplicate)' }
];

const uniqueUsers = uniqueById(users);
// [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

### Preserve Original Array

The `unique` function does not modify the original array:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const original = [1, 2, 2, 3];
const result = unique(original);

console.log(original); // [1, 2, 2, 3] - Unchanged
console.log(result);   // [1, 2, 3] - New array
```

### Chain with Other Array Methods

Combine with map, filter, and other array methods:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Extract unique values from objects
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' }
];

const uniqueRoles = unique(users.map(u => u.role));
// ['admin', 'user']

// Filter then deduplicate
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const uniqueEvens = unique(numbers.filter(n => n % 2 === 0));
// [2, 4, 6, 8, 10]
```

### Handle Empty Arrays

The function safely handles empty arrays:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const empty: number[] = [];
const result = unique(empty);
// [] - Returns empty array
```

## Performance Considerations

- **Time Complexity**: O(n) - Linear time using `Set` for deduplication
- **Space Complexity**: O(n) - Creates a new `Set` and new array
- **Comparison**: Uses `===` (strict equality) - very fast for primitives
- **Order Preservation**: Maintains insertion order (guaranteed by `Set` in modern JavaScript)
- **Immutability**: Always creates a new array - safe for functional programming

```typescript
import { unique } from '@metorial-mcp-containers/unique';

// Efficient for large arrays
const largeArray = Array.from({ length: 100000 }, (_, i) => i % 1000);
const uniqueValues = unique(largeArray); // Fast O(n) operation
// [0, 1, 2, ..., 999]
```

**Performance Comparison:**

```typescript
// ✓ Good: O(n) with Set
const result = unique(array);

// ✗ Bad: O(n²) with filter
const result = array.filter((item, index) => array.indexOf(item) === index);
```

## Edge Cases

### Handling NaN

JavaScript `Set` treats all `NaN` values as equal:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const values = [NaN, NaN, 1, 2];
const result = unique(values);
// [NaN, 1, 2] - NaN is deduplicated
```

### Handling null and undefined

Both `null` and `undefined` are treated as unique values:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const values = [null, undefined, null, undefined, 1];
const result = unique(values);
// [null, undefined, 1]
```

### Handling Mixed Types

Different types are considered unique:

```typescript
import { unique } from '@metorial-mcp-containers/unique';

const mixed = [1, '1', true, 1, '1', true];
const result = unique(mixed);
// [1, '1', true] - Number 1 and string '1' are different
```

## Related Packages

- [`@metorial-mcp-containers/delay`](../delay) - Promise-based delay utility
- [`@metorial-mcp-containers/id`](../id) - Unique identifier generation
- [`@metorial-mcp-containers/case`](../case) - String case conversion utilities

## License

MIT
