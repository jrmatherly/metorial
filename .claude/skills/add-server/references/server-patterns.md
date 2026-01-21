# MCP Server Implementation Patterns

Complete patterns for implementing new MCP servers.

## Basic Server Structure

### Minimal Server (API Token Auth)

```typescript
import { metorial, z } from '@metorial/mcp-server-sdk';

interface Config {
  token: string;
}

metorial.createServer<Config>(
  { name: 'service-name', version: '1.0.0' },
  async (server, config) => {
    // Helper for API calls
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

    // Register tools
    server.registerTool(
      'list_items',
      {
        title: 'List Items',
        description: 'List all items from the service',
        inputSchema: {
          limit: z.number().optional().default(10).describe('Max items to return')
        }
      },
      async ({ limit }) => {
        const items = await apiRequest(`/items?limit=${limit}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(items, null, 2) }]
        };
      }
    );
  }
);
```

### OAuth Server Pattern

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// OAuth handler - runs before server creation
metorial.setOauthHandler({
  getAuthForm: () => ({ fields: [] }),

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
  },

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
});

interface Config {
  token: string;
}

metorial.createServer<Config>(
  { name: 'service-name', version: '1.0.0' },
  async (server, config) => {
    // Server implementation...
  }
);
```

## metorial.json Patterns

### TypeScript with Deno (Preferred)

```json
{
  "name": "Service Name",
  "runtime": "typescript.deno"
}
```

### TypeScript with Node

```json
{
  "name": "Service Name",
  "runtime": "typescript.node"
}
```

### Python

```json
{
  "name": "Service Name",
  "runtime": "python"
}
```

## Tool Registration Patterns

### Basic Tool

```typescript
server.registerTool(
  'tool_name',
  {
    title: 'Tool Title',
    description: 'What this tool does',
    inputSchema: {
      required_param: z.string().describe('Required parameter'),
      optional_param: z.number().optional().describe('Optional parameter')
    }
  },
  async ({ required_param, optional_param }) => {
    // Implementation
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
);
```

### Tool with Complex Schema

```typescript
server.registerTool(
  'create_item',
  {
    title: 'Create Item',
    description: 'Create a new item with detailed configuration',
    inputSchema: {
      name: z.string().min(1).describe('Item name'),
      type: z.enum(['basic', 'advanced']).describe('Item type'),
      tags: z.array(z.string()).optional().describe('Optional tags'),
      config: z.object({
        enabled: z.boolean().default(true),
        priority: z.number().min(1).max(10).default(5)
      }).optional().describe('Optional configuration')
    }
  },
  async ({ name, type, tags, config }) => {
    // Implementation
  }
);
```

## Resource Registration Patterns

### Static Resource

```typescript
server.registerResource(
  'config',
  new ResourceTemplate('service://config', { list: undefined }),
  { title: 'Configuration', description: 'Current service configuration' },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: 'application/json',
      text: JSON.stringify(await apiRequest('/config'), null, 2)
    }]
  })
);
```

### Parameterized Resource

```typescript
server.registerResource(
  'item',
  new ResourceTemplate('service://items/{id}', { list: undefined }),
  { title: 'Item', description: 'Get item by ID' },
  async (uri, { id }) => ({
    contents: [{
      uri: uri.href,
      mimeType: 'application/json',
      text: JSON.stringify(await apiRequest(`/items/${id}`), null, 2)
    }]
  })
);
```

## Common OAuth Scopes by Service

| Service | Common Scopes |
|---------|---------------|
| GitHub | `repo`, `user`, `read:org` |
| Google | `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/gmail.readonly` |
| Slack | `channels:read`, `chat:write`, `users:read` |
| Microsoft | `User.Read`, `Mail.Read`, `Calendars.ReadWrite` |
| Salesforce | `api`, `refresh_token` |

## Error Handling Pattern

```typescript
async function apiRequest(endpoint: string) {
  const response = await fetch(`https://api.service.com${endpoint}`, {
    headers: { 'Authorization': `Bearer ${config.token}` }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json();
}
```

## Pagination Pattern

```typescript
server.registerTool(
  'list_items',
  {
    inputSchema: {
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(20).describe('Items per page')
    }
  },
  async ({ page, per_page }) => {
    const items = await apiRequest(`/items?page=${page}&per_page=${per_page}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          items: items.data,
          pagination: {
            page,
            per_page,
            total: items.total,
            has_more: items.has_more
          }
        }, null, 2)
      }]
    };
  }
);
```
