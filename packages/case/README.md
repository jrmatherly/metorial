# @metorial-mcp-containers/case

String case conversion utilities for the Metorial ecosystem. This package provides a flexible API for converting strings between different naming conventions (camelCase, PascalCase, kebab-case, snake_case).

## Features

- **🔄 Multiple Formats**: Convert between camelCase, PascalCase, kebab-case, and snake_case
- **🎯 Smart Parsing**: Automatically handles mixed-case inputs, numbers, and delimiters
- **🚀 Dual API**: Static methods for one-off conversions, instance methods for multiple operations
- **⚡ Zero Dependencies**: Lightweight and performant
- **🔐 Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @metorial-mcp-containers/case
```

## Quick Start

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Static methods (one-off conversions)
Cases.toCamelCase('hello-world'); // "helloWorld"
Cases.toPascalCase('hello_world'); // "HelloWorld"
Cases.toKebabCase('helloWorld'); // "hello-world"
Cases.toSnakeCase('HelloWorld'); // "hello_world"

// Instance methods (multiple conversions from same input)
const converter = new Cases('my-variable-name');
converter.toCamelCase(); // "myVariableName"
converter.toPascalCase(); // "MyVariableName"
converter.toKebabCase(); // "my-variable-name"
converter.toSnakeCase(); // "my_variable_name"
```

## API Reference

### `Cases` Class

Creates a case converter instance that normalizes the input string and provides methods to convert it to different case formats.

**Constructor:**

```typescript
new Cases(input: string)
```

**Parameters:**
- `input` (string): String to convert, in any case format

**Example:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

const converter = new Cases('getUserProfile');
```

### Static Methods

Static methods are convenience shortcuts for one-off conversions without creating a `Cases` instance.

#### `Cases.toCamelCase(input: string): string`

Converts a string to camelCase (first word lowercase, subsequent words capitalized, no separators).

**Parameters:**
- `input` (string): String to convert

**Returns:** String in camelCase format

**Examples:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

Cases.toCamelCase('hello-world'); // "helloWorld"
Cases.toCamelCase('HelloWorld'); // "helloWorld"
Cases.toCamelCase('hello_world'); // "helloWorld"
Cases.toCamelCase('HELLO_WORLD'); // "helloWorld"
Cases.toCamelCase('getUserID'); // "getUserId"
Cases.toCamelCase('api-v2-endpoint'); // "apiV2Endpoint"
```

#### `Cases.toPascalCase(input: string): string`

Converts a string to PascalCase (all words capitalized, no separators). Also known as UpperCamelCase.

**Parameters:**
- `input` (string): String to convert

**Returns:** String in PascalCase format

**Examples:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

Cases.toPascalCase('hello-world'); // "HelloWorld"
Cases.toPascalCase('helloWorld'); // "HelloWorld"
Cases.toPascalCase('hello_world'); // "HelloWorld"
Cases.toPascalCase('HELLO_WORLD'); // "HelloWorld"
Cases.toPascalCase('get-user-id'); // "GetUserId"
Cases.toPascalCase('api-v2-endpoint'); // "ApiV2Endpoint"
```

#### `Cases.toKebabCase(input: string): string`

Converts a string to kebab-case (all words lowercase, separated by hyphens).

**Parameters:**
- `input` (string): String to convert

**Returns:** String in kebab-case format

**Examples:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

Cases.toKebabCase('helloWorld'); // "hello-world"
Cases.toKebabCase('HelloWorld'); // "hello-world"
Cases.toKebabCase('hello_world'); // "hello-world"
Cases.toKebabCase('HELLO_WORLD'); // "hello-world"
Cases.toKebabCase('getUserID'); // "get-user-id"
Cases.toKebabCase('APIv2Endpoint'); // "ap-iv2-endpoint"
```

#### `Cases.toSnakeCase(input: string): string`

Converts a string to snake_case (all words lowercase, separated by underscores).

**Parameters:**
- `input` (string): String to convert

**Returns:** String in snake_case format

**Examples:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

Cases.toSnakeCase('helloWorld'); // "hello_world"
Cases.toSnakeCase('HelloWorld'); // "hello_world"
Cases.toSnakeCase('hello-world'); // "hello_world"
Cases.toSnakeCase('HELLO-WORLD'); // "hello_world"
Cases.toSnakeCase('getUserID'); // "get_user_id"
Cases.toSnakeCase('APIv2Endpoint'); // "ap_iv2_endpoint"
```

### Instance Methods

Instance methods allow you to convert the same input to multiple formats efficiently.

#### `toCamelCase(): string`

Converts the instance's normalized input to camelCase.

**Returns:** String in camelCase format

**Example:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

const converter = new Cases('user-profile-settings');
converter.toCamelCase(); // "userProfileSettings"
```

#### `toPascalCase(): string`

Converts the instance's normalized input to PascalCase.

**Returns:** String in PascalCase format

**Example:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

const converter = new Cases('user-profile-settings');
converter.toPascalCase(); // "UserProfileSettings"
```

#### `toKebabCase(): string`

Converts the instance's normalized input to kebab-case.

**Returns:** String in kebab-case format

**Example:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

const converter = new Cases('userProfileSettings');
converter.toKebabCase(); // "user-profile-settings"
```

#### `toSnakeCase(): string`

Converts the instance's normalized input to snake_case.

**Returns:** String in snake_case format

**Example:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

const converter = new Cases('UserProfileSettings');
converter.toSnakeCase(); // "user_profile_settings"
```

## Common Patterns

### Converting Variable Names

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// API response to JavaScript convention
const apiField = 'user_profile_id';
const jsVariable = Cases.toCamelCase(apiField); // "userProfileId"

// JavaScript to database column
const dbColumn = Cases.toSnakeCase(jsVariable); // "user_profile_id"
```

### Converting Multiple Formats

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Generate all case formats for a string
const input = 'user-profile-settings';
const converter = new Cases(input);

const formats = {
  camelCase: converter.toCamelCase(),   // "userProfileSettings"
  pascalCase: converter.toPascalCase(), // "UserProfileSettings"
  kebabCase: converter.toKebabCase(),   // "user-profile-settings"
  snakeCase: converter.toSnakeCase()    // "user_profile_settings"
};

console.log(formats);
```

### Normalizing API Fields

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Convert API response keys to camelCase
function normalizeApiResponse(data: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      Cases.toCamelCase(key),
      value
    ])
  );
}

const apiData = {
  user_id: 123,
  first_name: 'John',
  last_name: 'Doe',
  created_at: '2024-01-15'
};

const normalized = normalizeApiResponse(apiData);
// {
//   userId: 123,
//   firstName: 'John',
//   lastName: 'Doe',
//   createdAt: '2024-01-15'
// }
```

### File Path Conversion

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Convert class names to file paths
const className = 'UserProfileService';
const fileName = `${Cases.toKebabCase(className)}.ts`;
// "user-profile-service.ts"

// Convert file paths to class names
const filePath = 'user-profile-service.ts';
const componentName = Cases.toPascalCase(filePath.replace('.ts', ''));
// "UserProfileService"
```

### Database Schema Mapping

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Convert TypeScript model to database schema
interface User {
  userId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

function toDbSchema<T extends Record<string, any>>(model: T) {
  return Object.fromEntries(
    Object.entries(model).map(([key, value]) => [
      Cases.toSnakeCase(key),
      value
    ])
  );
}

const user: User = {
  userId: '123',
  firstName: 'Jane',
  lastName: 'Smith',
  emailAddress: 'jane@example.com'
};

const dbRecord = toDbSchema(user);
// {
//   user_id: '123',
//   first_name: 'Jane',
//   last_name: 'Smith',
//   email_address: 'jane@example.com'
// }
```

### URL Slug Generation

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Convert titles to URL-friendly slugs
function createSlug(title: string): string {
  return Cases.toKebabCase(title);
}

createSlug('Getting Started with TypeScript'); // "getting-started-with-type-script"
createSlug('API v2 Documentation'); // "api-v2-documentation"
createSlug('User Profile Settings'); // "user-profile-settings"
```

### GraphQL Schema Generation

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Convert database fields to GraphQL types
const dbFields = ['user_id', 'first_name', 'last_name', 'created_at'];

const graphqlType = `
type User {
${dbFields.map(field => `  ${Cases.toCamelCase(field)}: String`).join('\n')}
}
`;

// type User {
//   userId: String
//   firstName: String
//   lastName: String
//   createdAt: String
// }
```

## How It Works

The `Cases` class uses intelligent normalization to handle various input formats:

1. **Delimiter Detection**: Recognizes hyphens and underscores as word separators
2. **Case Transition Detection**: Identifies camelCase and PascalCase boundaries
3. **Number Handling**: Detects transitions between letters and numbers
4. **Normalization**: Converts input to an array of lowercase words
5. **Format Application**: Applies the target case format to normalized words

**Examples of normalization:**

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Input: "getUserID" → Normalized: ["get", "user", "id"]
new Cases('getUserID').toKebabCase(); // "get-user-id"

// Input: "api-v2-endpoint" → Normalized: ["api", "v2", "endpoint"]
new Cases('api-v2-endpoint').toCamelCase(); // "apiV2Endpoint"

// Input: "HELLO_WORLD" → Normalized: ["hello", "world"]
new Cases('HELLO_WORLD').toPascalCase(); // "HelloWorld"

// Input: "user123profile" → Normalized: ["user123", "profile"]
new Cases('user123profile').toSnakeCase(); // "user123_profile"
```

## Best Practices

### Choose the Right Method

Use static methods for one-off conversions:

```typescript
// Good: Single conversion
const kebab = Cases.toKebabCase('userProfile');
```

Use instance methods when converting the same input multiple times:

```typescript
// Good: Multiple conversions
const converter = new Cases('user-profile');
const camel = converter.toCamelCase();
const pascal = converter.toPascalCase();
const snake = converter.toSnakeCase();

// Bad: Unnecessary repeated parsing
const camel = Cases.toCamelCase('user-profile');
const pascal = Cases.toPascalCase('user-profile');
const snake = Cases.toSnakeCase('user-profile');
```

### Handle Edge Cases

Be aware of how the library handles acronyms and numbers:

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Acronyms are split by case transitions
Cases.toKebabCase('getUserID'); // "get-user-id" (not "get-user-i-d")
Cases.toKebabCase('HTTPSConnection'); // "h-t-t-p-s-connection"

// Numbers are preserved
Cases.toCamelCase('api-v2-endpoint'); // "apiV2Endpoint"
Cases.toSnakeCase('version2Point0'); // "version2_point0"
```

### Consistent Naming Conventions

Use the library to enforce naming conventions across your codebase:

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Enforce file naming convention
function getComponentFileName(className: string): string {
  return `${Cases.toKebabCase(className)}.tsx`;
}

getComponentFileName('UserProfile'); // "user-profile.tsx"
getComponentFileName('APIClient'); // "a-p-i-client.tsx"

// Enforce database column naming
function toColumnName(fieldName: string): string {
  return Cases.toSnakeCase(fieldName);
}

toColumnName('userId'); // "user_id"
toColumnName('createdAt'); // "created_at"
```

### Type Safety

Leverage TypeScript for type-safe conversions:

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Type-safe field mapper
function mapFields<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[],
  converter: (key: string) => string
): Record<string, T[K]> {
  return Object.fromEntries(
    fields.map(field => [
      converter(String(field)),
      obj[field]
    ])
  );
}

const user = {
  userId: 123,
  firstName: 'John',
  lastName: 'Doe'
};

const dbRecord = mapFields(
  user,
  ['userId', 'firstName', 'lastName'],
  Cases.toSnakeCase
);
// { user_id: 123, first_name: 'John', last_name: 'Doe' }
```

## Performance Considerations

- **Normalization Cost**: The `Cases` constructor normalizes the input once. Use instance methods to avoid repeated normalization.
- **Static vs Instance**: Static methods create a temporary `Cases` instance internally. For single conversions, the overhead is negligible.
- **String Operations**: All conversions use native JavaScript string operations - no regex compilation or complex parsing.

```typescript
import { Cases } from '@metorial-mcp-containers/case';

// Efficient: One normalization, multiple conversions
const converter = new Cases(input);
const formats = [
  converter.toCamelCase(),
  converter.toPascalCase(),
  converter.toKebabCase(),
  converter.toSnakeCase()
];

// Less efficient: Four normalizations
const formats = [
  Cases.toCamelCase(input),
  Cases.toPascalCase(input),
  Cases.toKebabCase(input),
  Cases.toSnakeCase(input)
];
```

## Related Packages

- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities
- [`@metorial-mcp-containers/canonicalize`](../canonicalize) - JSON canonicalization

## License

MIT
