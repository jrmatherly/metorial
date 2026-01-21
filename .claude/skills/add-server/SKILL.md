---
name: add-server
description: Workflow for adding new MCP servers to the project
---

# Add Server Skill

This skill guides you through adding a new MCP server to the Metorial project.

## Prerequisites

- API documentation for the target service
- Understanding of required authentication (OAuth vs API key)
- List of desired resources and tools

## Workflow

### Step 1: Determine Server Type

```
┌─────────────────────────────────────────┐
│         Is this a custom server?        │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        v                 v
   ┌────────┐        ┌────────┐
   │  Yes   │        │   No   │
   │servers/│        │catalog/│
   └────────┘        └────────┘
```

**Custom Server** (servers/): Full implementation with OAuth, resources, tools
**Catalog Server** (catalog/): Index existing third-party server

### Step 2: For Custom Servers

#### 2a. Create Directory Structure

```bash
mkdir -p servers/<name>
```

Required files:

- `server.ts` - Main implementation
- `metorial.json` - Metadata
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config

#### 2b. Implement Server

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// OAuth handler (if needed)
metorial.setOauthHandler({
  getAuthForm: () => ({
    fields: [
      { type: 'text', name: 'clientId', title: 'Client ID', required: true },
      { type: 'password', name: 'clientSecret', title: 'Client Secret', required: true }
    ]
  }),
  getAuthorizationUrl: async ({ clientId, clientSecret, redirectUrl, state }) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUrl,
      state,
      response_type: 'code',
      scope: 'required scopes'
    });
    return { authorizationUrl: `https://api.service.com/oauth/authorize?${params}` };
  },
  handleCallback: async ({ clientId, clientSecret, redirectUrl, code }) => {
    // Exchange code for token
    const response = await fetch('https://api.service.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
        code,
        grant_type: 'authorization_code'
      })
    });
    return response.json();
  }
});

interface Config {
  token: string;
}

metorial.createServer<Config>(
  { name: '<service>-mcp-server', version: '1.0.0' },
  async (server, config) => {
    const api = createApiClient(config.token);

    // Register resources (GET operations)
    server.registerResource(
      'items',
      new ResourceTemplate('service://items/{id}', {
        list: async () => {
          const items = await api.listItems();
          return items.map(item => ({
            uri: `service://items/${item.id}`,
            name: item.name
          }));
        }
      }),
      { title: 'Items', description: 'Service items' },
      async (uri, { id }) => ({
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(await api.getItem(id))
        }]
      })
    );

    // Register tools (POST/PUT/DELETE operations)
    server.registerTool(
      'create_item',
      {
        title: 'Create Item',
        description: 'Create a new item',
        inputSchema: {
          name: z.string().describe('Item name'),
          description: z.string().optional().describe('Item description')
        }
      },
      async ({ name, description }) => {
        const result = await api.createItem({ name, description });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }
    );
  }
);
```

#### 2c. Create Metadata Files

**metorial.json:**

```json
{
  "name": "<server-name>",
  "runtime": "typescript.deno"
}
```

**package.json:**

```json
{
  "name": "@metorial-servers/<name>",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@metorial/mcp-server-sdk": "workspace:*"
  }
}
```

### Step 3: For Catalog Servers

Use the interactive wizard:

```bash
bun add-server
```

Or manually create:

```
catalog/<owner>/<repo>/<server-id>/
├── manifest.json
├── README.md
└── versions/
```

### Step 4: Build and Test

```bash
# Build the server
bun run build single <serverId>

# Test locally (if applicable)
bun run build prepare <serverId> --out ./test-output
```

### Step 5: Verify

- [ ] Server builds without errors
- [ ] All resources return expected data
- [ ] All tools perform expected actions
- [ ] OAuth flow works (if applicable)
- [ ] Error handling is appropriate

## Naming Conventions

| Element | Convention | Example |
| --------- | ------------ | --------- |
| Server ID | kebab-case | `google-calendar` |
| Tool names | snake_case | `create_event` |
| Resource names | kebab-case | `calendar-events` |
| Config keys | camelCase | `accessToken` |

## Reference

- See `servers/github/server.ts` for comprehensive example
- See `.claude/rules/servers.md` for detailed patterns
