# @metorial/mcp-server-sdk

The official SDK for building [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers for Metorial. This package provides a streamlined interface for creating MCP servers with built-in support for OAuth, webhooks, and resource management.

## Features

- **🚀 Simple Server Creation**: Create MCP servers with a clean, typed API
- **🔐 Built-in OAuth Support**: Handle OAuth flows with minimal configuration
- **🪝 Webhook Management**: Easy webhook and polling callback handlers
- **📦 Type-Safe**: Full TypeScript support with Zod schema validation
- **🛠️ MCP Compliant**: Built on the official Model Context Protocol SDK

## Installation

```bash
npm install @metorial/mcp-server-sdk
```

or

```bash
bun add @metorial/mcp-server-sdk
```

## Quick Start

Create a basic MCP server:

```typescript
import { metorial, z } from '@metorial/mcp-server-sdk';

interface Config {
  apiKey: string;
}

metorial.createServer<Config>(
  {
    name: 'my-mcp-server',
    version: '1.0.0'
  },
  async (server, config) => {
    // Register a simple tool
    server.registerTool(
      'hello_world',
      {
        title: 'Hello World',
        description: 'Returns a greeting message',
        inputSchema: {
          name: z.string().describe('Name to greet')
        }
      },
      async ({ name }) => {
        return {
          content: [
            {
              type: 'text',
              text: `Hello, ${name}!`
            }
          ]
        };
      }
    );
  }
);
```

## API Reference

### `metorial.createServer<Config>(opts, callback)`

Creates and configures a new MCP server.

**Parameters:**

- `opts`: Object containing:
  - `name` (string): The name of your MCP server
  - `version` (string): The version of your server
- `callback`: Async function that receives:
  - `server` (McpServer): The MCP server instance
  - `config` (Config): Your server's configuration object

**Example:**

```typescript
interface Config {
  token: string;
  baseUrl?: string;
}

metorial.createServer<Config>(
  { name: 'example-server', version: '1.0.0' },
  async (server, config) => {
    // Register tools, resources, and prompts
  }
);
```

### Server Methods

#### `server.registerTool(name, options, handler)`

Register a tool that AI models can invoke.

**Parameters:**

- `name` (string): Tool name in snake_case (e.g., `create_issue`)
- `options`: Object containing:
  - `title` (string): Human-readable tool name
  - `description` (string): What the tool does
  - `inputSchema` (ZodObject): Zod schema defining tool parameters
- `handler`: Async function that processes the tool call

**Example:**

```typescript
server.registerTool(
  'create_issue',
  {
    title: 'Create Issue',
    description: 'Create a new issue in a repository',
    inputSchema: {
      title: z.string().describe('Issue title'),
      body: z.string().optional().describe('Issue description'),
      labels: z.array(z.string()).optional()
    }
  },
  async ({ title, body, labels }) => {
    // Make API call to create issue
    const result = await createIssue({ title, body, labels });

    return {
      content: [
        {
          type: 'text',
          text: `Issue created: ${result.url}`
        }
      ]
    };
  }
);
```

#### `server.registerResource(name, template, options, handler)`

Register a resource that can be read by AI models.

**Parameters:**

- `name` (string): Resource name in kebab-case
- `template` (ResourceTemplate): URI template for the resource
- `options`: Object containing:
  - `title` (string): Human-readable resource name
  - `description` (string): What the resource provides
- `handler`: Async function that returns resource data

**Example:**

```typescript
import { ResourceTemplate } from '@metorial/mcp-server-sdk';

server.registerResource(
  'repository',
  new ResourceTemplate('github://repository/{owner}/{repo}', {
    list: undefined
  }),
  {
    title: 'GitHub Repository',
    description: 'Access repository details and metadata'
  },
  async (uri, { owner, repo }) => {
    const data = await fetchRepository(owner, repo);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
);
```

### `metorial.setOauthHandler(config)`

Configure OAuth authentication for your server.

**Parameters:**

- `config`: Object containing:
  - `getAuthForm?` (function): Optional function returning custom form fields
  - `getAuthorizationUrl` (function): **Required**. Returns the OAuth authorization URL
  - `handleCallback` (function): **Required**. Exchanges authorization code for access token
  - `refreshAccessToken?` (function): Optional function to refresh expired tokens

**Example:**

```typescript
metorial.setOauthHandler({
  getAuthForm: () => ({
    fields: [
      {
        type: 'text',
        key: 'subdomain',
        label: 'Subdomain',
        placeholder: 'your-company',
        isRequired: true
      }
    ]
  }),

  getAuthorizationUrl: async ({ clientId, redirectUri, state, fields }) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'read write',
      response_type: 'code'
    });

    return {
      authorizationUrl: `https://${fields.subdomain}.example.com/oauth/authorize?${params}`
    };
  },

  handleCallback: async ({ clientId, clientSecret, code, redirectUri }) => {
    const response = await fetch('https://api.example.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    };
  },

  refreshAccessToken: async ({ clientId, clientSecret, refreshToken }) => {
    const response = await fetch('https://api.example.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    };
  }
});
```

### `metorial.setCallbackHandler(config)`

Configure webhook and polling handlers for real-time events.

**Parameters:**

- `config`: Object containing:
  - `install?` (function): Optional setup function called when webhook is registered
  - `handle` (function): **Required**. Processes incoming webhook events
  - `poll?` (function): Optional function for polling-based event fetching

**Example:**

```typescript
metorial.setCallbackHandler({
  install: async ({ callbackUrl, callbackId }) => {
    // Register webhook with external service
    await fetch('https://api.example.com/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        url: callbackUrl,
        events: ['issue.created', 'issue.updated']
      })
    });
  },

  handle: async ({ callbackId, eventId, payload }) => {
    // Process webhook event
    if (payload.event === 'issue.created') {
      return {
        type: 'issue_created',
        result: {
          issueId: payload.issue.id,
          title: payload.issue.title
        }
      };
    }
    return null;
  },

  poll: async ({ callbackId, setState, state }) => {
    // Poll for new events since last check
    const since = state.lastChecked || Date.now();
    const events = await fetchEventsSince(since);

    setState({ lastChecked: Date.now() });

    return events.map(event => ({
      id: event.id,
      type: event.type,
      data: event.data
    }));
  }
});
```

## Exported Types and Utilities

The SDK re-exports types and utilities from its dependencies:

```typescript
// From @modelcontextprotocol/sdk
export * from '@modelcontextprotocol/sdk/server/index.js';
export * from '@modelcontextprotocol/sdk/server/mcp.js';

// From zod (for schema validation)
export * from 'zod';
```

## Complete Example

Here's a complete example implementing a GitHub MCP server:

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// Configure OAuth
metorial.setOauthHandler({
  getAuthForm: () => ({ fields: [] }),

  getAuthorizationUrl: async ({ clientId, redirectUri, state }) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo user',
      state: state
    });

    return {
      authorizationUrl: `https://github.com/login/oauth/authorize?${params}`
    };
  },

  handleCallback: async ({ clientId, clientSecret, code, redirectUri }) => {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
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

// Configure server
interface Config {
  token: string;
}

metorial.createServer<Config>(
  { name: 'github-mcp-server', version: '1.0.0' },
  async (server, config) => {
    // Helper for API requests
    async function githubRequest(endpoint: string) {
      const response = await fetch(`https://api.github.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.json();
    }

    // Register a resource
    server.registerResource(
      'repository',
      new ResourceTemplate('github://repository/{owner}/{repo}', {
        list: undefined
      }),
      {
        title: 'GitHub Repository',
        description: 'Access repository details'
      },
      async (uri, { owner, repo }) => {
        const data = await githubRequest(`/repos/${owner}/${repo}`);
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2)
          }]
        };
      }
    );

    // Register a tool
    server.registerTool(
      'create_issue',
      {
        title: 'Create Issue',
        description: 'Create a new issue in a repository',
        inputSchema: {
          owner: z.string().describe('Repository owner'),
          repo: z.string().describe('Repository name'),
          title: z.string().describe('Issue title'),
          body: z.string().optional().describe('Issue description')
        }
      },
      async ({ owner, repo, title, body }) => {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body })
          }
        );

        const data = await response.json();

        return {
          content: [{
            type: 'text',
            text: `Issue #${data.number} created: ${data.html_url}`
          }]
        };
      }
    );
  }
);
```

## Form Field Types

When using `getAuthForm()`, you can specify custom form fields:

### Text/Password Fields

```typescript
{
  type: 'text' | 'password',
  key: string,           // Field identifier
  label: string,         // Display label
  placeholder?: string,  // Placeholder text
  isRequired?: boolean   // Whether field is required
}
```

### Select Fields

```typescript
{
  type: 'select',
  key: string,
  label: string,
  isRequired?: boolean,
  options: Array<{
    label: string,
    value: string
  }>
}
```

## Best Practices

### Tool Naming

- Use `snake_case` for tool names (e.g., `create_issue`, `list_repositories`)
- Keep names descriptive and action-oriented

### Resource Naming

- Use `kebab-case` for resource names (e.g., `pull-request`, `repository-file`)
- Use URI templates to define resource structure

### Error Handling

Always wrap API calls in try-catch blocks and provide meaningful error messages:

```typescript
server.registerTool('example_tool', { ... }, async (input) => {
  try {
    const result = await someApiCall(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  } catch (error) {
    throw new Error(`Failed to call API: ${error.message}`);
  }
});
```

### Type Safety

Define strong types for your configuration:

```typescript
interface Config {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

metorial.createServer<Config>({ ... }, async (server, config) => {
  // config is fully typed
  const url = `${config.baseUrl}/api`;
});
```

## Related Packages

- [`@metorial/mcp-server-sdk`](https://www.npmjs.com/package/@metorial/mcp-server-sdk) - This package
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - Official MCP SDK
- [`zod`](https://www.npmjs.com/package/zod) - TypeScript-first schema validation

## Resources

- [Metorial Documentation](https://metorial.com/docs)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Example Servers](https://github.com/metorial/metorial/tree/main/servers)

## License

MIT
