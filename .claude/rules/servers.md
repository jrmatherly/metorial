---
globs: ["**/servers/**/*.ts", "**/servers/**/metorial.json"]
description: MCP server implementation patterns and conventions
---

# MCP Server Development Rules

## Server Structure

Every server in `servers/` must have:

```
servers/<name>/
├── server.ts         # Main implementation (REQUIRED)
├── metorial.json     # Server metadata (REQUIRED)
├── package.json      # Dependencies (REQUIRED)
└── tsconfig.json     # TypeScript config (REQUIRED)
```

## metorial.json Format

```json
{
  "name": "Server Display Name",
  "runtime": "typescript.deno"
}
```

**Supported runtimes:**

- `typescript.deno` - Deno runtime (preferred)
- `typescript.node` - Node.js runtime
- `python` - Python runtime

## Server Implementation Pattern

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// 1. Optional: OAuth handler (for authenticated services)
metorial.setOauthHandler({
  getAuthForm: () => ({ fields: [] }),
  getAuthorizationUrl: async (input) => ({
    authorizationUrl: `https://service.com/oauth/authorize?...`
  }),
  handleCallback: async (input) => ({
    access_token: '...',
    token_type: 'Bearer'
  })
});

// 2. Define config interface
interface Config {
  token: string;
  // Add other config fields as needed
}

// 3. Create server
metorial.createServer<Config>(
  { name: 'server-name', version: '1.0.0' },
  async (server, config) => {
    // 4. Helper function for API calls
    async function apiRequest(endpoint: string, method = 'GET', body?: unknown) {
      const response = await fetch(`https://api.service.com${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();
    }

    // 5. Register resources (read-only data endpoints)
    server.registerResource(
      'resource-name',
      new ResourceTemplate('service://resource/{id}', { list: undefined }),
      { title: 'Resource Title', description: 'What this resource provides' },
      async (uri, { id }) => ({
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(await apiRequest(`/resource/${id}`), null, 2)
        }]
      })
    );

    // 6. Register tools (actions)
    server.registerTool(
      'tool_name',
      {
        title: 'Tool Title',
        description: 'What this tool does',
        inputSchema: {
          param1: z.string().describe('Description of param1'),
          param2: z.number().optional().describe('Optional numeric param')
        }
      },
      async ({ param1, param2 }) => {
        const result = await apiRequest('/endpoint', 'POST', { param1, param2 });
        return {
          content: [{ type: 'text', text: `Success: ${JSON.stringify(result)}` }]
        };
      }
    );
  }
);
```

## Naming Conventions

| Element | Convention | Example |
| --------- | ---------- | --------- |
| Server directory | lowercase, hyphens | `google-calendar` |
| Tool names | snake_case | `list_repositories`, `create_issue` |
| Resource names | kebab-case | `repository-file`, `pull-request` |
| Config interface | PascalCase | `Config`, `ServerConfig` |

## Zod Schema Best Practices

Always use `.describe()` for all schema fields:

```typescript
inputSchema: {
  owner: z.string().describe('Repository owner (username or org)'),
  repo: z.string().describe('Repository name'),
  state: z.enum(['open', 'closed', 'all']).default('open').describe('Issue state filter'),
  per_page: z.number().min(1).max(100).default(30).describe('Results per page'),
  labels: z.array(z.string()).optional().describe('Filter by label names')
}
```

## OAuth Patterns

### Authorization URL

```typescript
getAuthorizationUrl: async (input) => {
  const scopes = ['read', 'write'].join(' ');
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: scopes,
    state: input.state,
    response_type: 'code'
  });
  return {
    authorizationUrl: `https://service.com/oauth/authorize?${params}`
  };
}
```

### Token Exchange

```typescript
handleCallback: async (input) => {
  const url = new URL(input.fullUrl);
  const code = url.searchParams.get('code');

  const response = await fetch('https://service.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: code!,
      redirect_uri: input.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const data = await response.json();
  return {
    access_token: data.access_token,
    token_type: data.token_type,
    scope: data.scope
  };
}
```

## Do

- Use the SDK's built-in Zod for schema validation
- Handle API errors gracefully with meaningful messages
- Use YAML anchors for repeated values
- Follow existing server patterns (see `servers/github/server.ts`)
- Request minimum OAuth scopes needed

## Do Not

- Hardcode API URLs or credentials
- Skip `.describe()` on schema fields
- Return raw API responses without formatting
- Use `any` type except for external API responses
- Create servers without all required files

## Troubleshooting

| Issue | Solution |
| ------- | ---------- |
| Build fails | Check `metorial.json` runtime matches code |
| OAuth not working | Verify scopes, redirectUri, client credentials |
| Tool not appearing | Check tool registration syntax |
| Resource 404 | Verify URI template parameters match handler |

## Reference Implementation

See `servers/github/server.ts` for a comprehensive example with:

- OAuth handler
- Multiple resources
- Multiple tools
- Error handling
- API helper function
