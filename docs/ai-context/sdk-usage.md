# SDK Usage Guide

> **When to Load**: When developing or modifying MCP servers, understanding SDK internals, or extending SDK functionality.

## SDK Overview

The `@metorial/mcp-server-sdk` package provides the foundation for building MCP servers.

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';
```

## Package Structure

```
packages/sdk/src/
├── index.ts      # Re-exports from lib.ts
├── lib.ts        # Main exports (metorial object)
├── server.ts     # createServer implementation
├── oauth.ts      # setOauthHandler implementation
├── callbacks.ts  # setCallbackHandler implementation
└── promise.ts    # Promise utilities
```

## Core API

### metorial.createServer

Creates an MCP server instance with typed configuration.

```typescript
function createServer<Config>(
  metadata: { name: string; version: string },
  setup: (server: Server, config: Config) => Promise<void>
): void
```

**Behavior:**

1. Parses config from environment/arguments
2. Creates MCP server instance
3. Calls setup function with server and parsed config
4. Starts server on stdio transport

**Example:**

```typescript
interface Config {
  token: string;
  apiUrl?: string;
}

metorial.createServer<Config>(
  { name: 'my-server', version: '1.0.0' },
  async (server, config) => {
    // config.token is typed as string
    // config.apiUrl is typed as string | undefined

    // Register resources and tools here
  }
);
```

### metorial.setOauthHandler

Configures OAuth authentication flow.

```typescript
interface OAuthHandler {
  getAuthForm: () => { fields: FormField[] };
  getAuthorizationUrl: (input: AuthInput) => Promise<{ authorizationUrl: string }>;
  handleCallback: (input: CallbackInput) => Promise<TokenResponse>;
}

function setOauthHandler(handler: OAuthHandler): void
```

**Must be called before createServer.**

**FormField Types:**

```typescript
type FormField = {
  type: 'text' | 'password' | 'select';
  name: string;
  title: string;
  required?: boolean;
  options?: { label: string; value: string }[];  // for select type
};
```

**AuthInput:**

```typescript
interface AuthInput {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  state: string;
  // Plus any custom fields from getAuthForm
}
```

**CallbackInput:**

```typescript
interface CallbackInput {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  code: string;
  // Plus any custom fields from getAuthForm
}
```

### metorial.setCallbackHandler

Sets callback handlers for server events.

```typescript
function setCallbackHandler(handler: CallbackHandler): void
```

## Server Methods

### server.registerResource

Registers a read-only data resource.

```typescript
server.registerResource(
  name: string,
  template: ResourceTemplate,
  options: { title: string; description: string },
  handler: (uri: URL, params: Record<string, string>) => Promise<ResourceResult>
): void
```

**ResourceResult:**

```typescript
interface ResourceResult {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}
```

### server.registerTool

Registers an action-performing tool.

```typescript
server.registerTool(
  name: string,
  options: {
    title: string;
    description: string;
    inputSchema: Record<string, ZodType>;
  },
  handler: (params: InferredParams) => Promise<ToolResult>
): void
```

**ToolResult:**

```typescript
interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
}
```

## ResourceTemplate

Creates URI templates for resources.

```typescript
import { ResourceTemplate } from '@metorial/mcp-server-sdk';

// Simple template (no listing)
new ResourceTemplate('service://items/{id}', { list: undefined })

// With list handler
new ResourceTemplate('service://items', {
  list: async () => [
    { uri: 'service://items/1', name: 'Item 1' },
    { uri: 'service://items/2', name: 'Item 2' }
  ]
})
```

**URI Template Syntax:**

- `{param}` - Required parameter
- Parameters extracted and passed to handler

## Zod Schema Integration

The SDK re-exports Zod for schema validation.

```typescript
import { z } from '@metorial/mcp-server-sdk';

// Tool input schema
const inputSchema = {
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(100).default(10).describe('Max results'),
  filters: z.object({
    status: z.enum(['active', 'inactive']).optional()
  }).optional().describe('Optional filters')
};
```

**Schema Requirements:**

- Must be an object with keys (not wrapped in z.object())
- Use `.describe()` for documentation
- Use `.default()` for optional with defaults
- Use `.optional()` for truly optional

## Re-exports

The SDK re-exports from upstream packages:

```typescript
// From @modelcontextprotocol/sdk/server/index.js
export * from '@modelcontextprotocol/sdk/server/index.js';

// From @modelcontextprotocol/sdk/server/mcp.js
export * from '@modelcontextprotocol/sdk/server/mcp.js';

// From zod
export * from 'zod';
```

## Common Patterns

### API Client Pattern

```typescript
function createApiClient(token: string) {
  const baseUrl = 'https://api.service.com';

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    // ... other methods
  };
}
```

### Error Handling Pattern

```typescript
server.registerTool(
  'risky_operation',
  { ... },
  async (params) => {
    try {
      const result = await api.riskyCall(params);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: `Error: ${message}` }]
      };
    }
  }
);
```

## Extending the SDK

### Adding New Handlers

1. Create handler file in `packages/sdk/src/`
2. Implement handler function
3. Export from `lib.ts`
4. Update `metorial` object

### Modifying Server Behavior

The SDK wraps @modelcontextprotocol/sdk. To modify:

1. Check if upstream supports the feature
2. If not, create wrapper in `server.ts`
3. Maintain backward compatibility

## Debugging

```typescript
// Enable debug logging
process.env.DEBUG = 'mcp:*';

// Check server methods
console.log(Object.keys(server));

// Inspect registered tools
server.listTools().then(console.log);
```

## Reference Files

- `packages/sdk/src/lib.ts` - Main implementation
- `packages/sdk/src/server.ts` - Server creation
- `packages/sdk/src/oauth.ts` - OAuth flow
- `servers/github/server.ts` - Reference implementation
