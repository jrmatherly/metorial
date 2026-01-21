# Code Style and Conventions

## TypeScript Style

Based on `.prettierrc` configuration:

- **Single quotes**: Yes (`'string'` not `"string"`)
- **Semicolons**: Yes (required)
- **Print width**: 95 characters
- **Tab width**: 2 spaces
- **Trailing commas**: None
- **Bracket spacing**: Yes
- **Arrow function parens**: Avoid when possible (`x => x` not `(x) => x`)
- **Tabs**: No (use spaces)

## Server Implementation Pattern

MCP servers follow this pattern:

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// Optional: OAuth handler setup
metorial.setOauthHandler({
  getAuthForm: () => ({ fields: [] }),
  getAuthorizationUrl: async input => { /* ... */ },
  handleCallback: async input => { /* ... */ }
});

// Config interface
interface Config {
  token: string;
  // ... other config fields
}

// Server creation
metorial.createServer<Config>(
  {
    name: 'server-name',
    version: '1.0.0'
  },
  async (server, config) => {
    // Helper functions
    async function apiRequest(endpoint: string, method: string = 'GET', body?: unknown): Promise<any> {
      // ...
    }

    // Register resources
    server.registerResource('resource-name', new ResourceTemplate('uri://...'), { ... }, async (uri, params) => {
      // ...
    });

    // Register tools
    server.registerTool('tool_name', {
      title: 'Tool Title',
      description: 'Tool description',
      inputSchema: {
        param: z.string().describe('Parameter description')
      }
    }, async (params) => {
      // ...
    });
  }
);
```

## Naming Conventions

- **Files**: kebab-case (`server.ts`, `my-module.ts`)
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: camelCase (not SCREAMING_CASE)
- **Tool names**: snake_case (`list_repositories`, `create_issue`)
- **Resource names**: kebab-case (`repository-file`, `pull-request`)

## Documentation

- Use JSDoc-style comments for functions and complex code
- Keep comments concise and relevant
- Document tool/resource inputs with Zod `.describe()`

## Type Safety

- Use Zod schemas for input validation
- Define explicit interfaces for config objects
- Avoid `any` except for external API responses
