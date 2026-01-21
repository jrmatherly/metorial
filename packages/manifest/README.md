# @metorial-mcp-containers/manifest

Utilities for reading, writing, and validating MCP server manifests in the Metorial ecosystem. This package provides a type-safe interface for working with server configurations, versions, and catalog management.

## Features

- **📄 Manifest Reading**: Read and validate server manifests with Zod schema validation
- **📚 Catalog Management**: Enumerate and query all servers in the catalog
- **🔢 Version Management**: Access and query server versions and build metadata
- **✍️ Manifest Writing**: Create and persist new server manifests
- **⚙️ Config Building**: Generate configuration from environment variables, CLI arguments, and files
- **🔐 Type-Safe**: Full TypeScript support with Zod-validated schemas

## Installation

```bash
bun add @metorial-mcp-containers/manifest
```

## API Reference

### `readManifest(id: string): Promise<ServerManifest>`

Reads and validates a server manifest from the catalog.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`

**Returns:** Promise resolving to a validated `ServerManifest` object

**Throws:** Error if manifest not found or validation fails

**Example:**

```typescript
import { readManifest } from '@metorial-mcp-containers/manifest';

const manifest = await readManifest('modelcontextprotocol/servers/github');

console.log(manifest.title); // "GitHub"
console.log(manifest.description); // "MCP server for GitHub API"
console.log(manifest.config.configValues); // Array of config values
```

### `getAllServers(): Promise<ServerManifest[]>`

Retrieves all server manifests from the catalog directory.

**Returns:** Promise resolving to array of `ServerManifest` objects, sorted by `fullId`

**Example:**

```typescript
import { getAllServers } from '@metorial-mcp-containers/manifest';

const servers = await getAllServers();

console.log(`Found ${servers.length} servers`);

// Filter servers by owner
const mcpServers = servers.filter(s =>
  s.fullId.startsWith('modelcontextprotocol/')
);

// Find servers with specific config requirements
const oauthServers = servers.filter(s =>
  s.config.configValues.some(v => v.title.toLowerCase().includes('token'))
);
```

### `getLatestServerVersion(serverId: string): Promise<ServerVersion>`

Gets the most recent version of a server, sorted by creation date.

**Parameters:**
- `serverId` (string): Full server ID in format `owner/repo/server`

**Returns:** Promise resolving to the latest `ServerVersion` object

**Example:**

```typescript
import { getLatestServerVersion } from '@metorial-mcp-containers/manifest';

const version = await getLatestServerVersion('modelcontextprotocol/servers/github');

console.log(version.version); // "1.2.3"
console.log(version.createdAt); // "2024-01-15T10:30:00Z"
console.log(version.manifestHash); // "abc123..."
console.log(version.builder); // Build configuration with Nixpacks plan
```

### `getServerVersions(serverId: string): Promise<ServerVersion[]>`

Gets all versions of a server.

**Parameters:**
- `serverId` (string): Full server ID in format `owner/repo/server`

**Returns:** Promise resolving to array of `ServerVersion` objects

**Example:**

```typescript
import { getServerVersions } from '@metorial-mcp-containers/manifest';

const versions = await getServerVersions('modelcontextprotocol/servers/github');

// Get version history
versions.forEach(v => {
  console.log(`${v.version} - ${new Date(v.createdAt).toLocaleDateString()}`);
});
```

### `manifestSchema`

Zod schema for validating server manifests.

**Example:**

```typescript
import { manifestSchema } from '@metorial-mcp-containers/manifest';

// Validate a manifest object
const result = manifestSchema.safeParse(data);

if (result.success) {
  const manifest = result.data;
  // manifest is typed as ServerManifest
} else {
  console.error('Validation errors:', result.error.flatten());
}

// Use with TypeScript
import type { ServerManifest } from '@metorial-mcp-containers/manifest';

const myManifest: ServerManifest = {
  id: 'my-server',
  fullId: 'owner/repo/my-server',
  repo: {
    provider: 'github',
    owner: 'owner',
    repo: 'repo',
    branch: 'main',
    url: 'https://github.com/owner/repo'
  },
  config: {
    argumentsTemplate: null,
    configValues: []
  },
  subdirectory: 'packages/my-server',
  title: 'My Server',
  description: 'A custom MCP server'
};
```

### `writeManifest(manifest: ServerManifest): Promise<{ relativeManifestDir: string }>`

Writes a server manifest to the catalog directory.

**Parameters:**
- `manifest` (ServerManifest): The manifest object to write

**Returns:** Promise resolving to object with `relativeManifestDir` path

**Example:**

```typescript
import { buildManifest, writeManifest, buildConfig } from '@metorial-mcp-containers/manifest';

// Build configuration
const config = buildConfig({
  cliArguments: {
    arguments: [
      { key: '--api-key', required: true },
      { key: '--base-url', required: false }
    ]
  },
  environmentVariables: [
    { key: 'API_KEY', required: true },
    { key: 'BASE_URL', required: false }
  ],
  files: []
});

// Build manifest
const manifest = await buildManifest({
  repoUrl: 'https://github.com/owner/repo',
  subdirectory: 'packages/my-server',
  title: 'My Server',
  description: 'A custom MCP server',
  config
});

// Write to catalog
const { relativeManifestDir } = await writeManifest(manifest);
console.log(`Manifest written to ${relativeManifestDir}`);
```

### `buildConfig(options): { argumentsTemplate, configValues }`

Builds a configuration object from environment variables, CLI arguments, and files.

**Parameters:**
- `options.cliArguments`: CLI argument specification (template or array)
- `options.environmentVariables`: Array of environment variable specifications
- `options.files`: Array of file paths required by the server

**Returns:** Configuration object with `argumentsTemplate` and `configValues`

**Example:**

```typescript
import { buildConfig } from '@metorial-mcp-containers/manifest';

// Simple configuration
const config1 = buildConfig({
  cliArguments: {
    arguments: [
      { key: '--token', required: true }
    ]
  },
  environmentVariables: [
    { key: 'GITHUB_TOKEN', required: true }
  ],
  files: []
});

// Template-based CLI arguments
const config2 = buildConfig({
  cliArguments: {
    template: '--api-key {apiKey} --base-url {baseUrl}',
    keys: [
      { key: 'apiKey', required: true },
      { key: 'baseUrl', required: false }
    ]
  },
  environmentVariables: null,
  files: []
});

// With file requirements
const config3 = buildConfig({
  cliArguments: null,
  environmentVariables: null,
  files: ['service-account.json', 'config.yaml']
});
```

### `buildManifest(options): Promise<ServerManifest>`

Builds a complete server manifest from repository and configuration details.

**Parameters:**
- `options.repoUrl` (string): Repository URL
- `options.config`: Configuration object from `buildConfig()`
- `options.subdirectory` (string): Path to server within repository
- `options.title` (string): Human-readable server name
- `options.description` (string | null): Server description

**Returns:** Promise resolving to complete `ServerManifest`

**Example:**

```typescript
import { buildManifest, buildConfig } from '@metorial-mcp-containers/manifest';

const config = buildConfig({
  cliArguments: {
    arguments: [{ key: '--token', required: true }]
  },
  environmentVariables: [{ key: 'API_TOKEN', required: true }],
  files: []
});

const manifest = await buildManifest({
  repoUrl: 'https://github.com/owner/repo',
  subdirectory: 'src/server',
  title: 'My MCP Server',
  description: 'A server for accessing external APIs',
  config
});

console.log(manifest.id); // "my-mcp-server"
console.log(manifest.fullId); // "owner/repo/my-mcp-server"
```

### `manifestExists(id: string): Promise<boolean>`

Checks if a manifest exists for the given server ID.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`

**Returns:** Promise resolving to boolean

**Example:**

```typescript
import { manifestExists } from '@metorial-mcp-containers/manifest';

if (await manifestExists('modelcontextprotocol/servers/github')) {
  console.log('GitHub server manifest found');
}
```

### `getServerDefinitionDir(id: string): string`

Gets the filesystem path to a server's definition directory.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`

**Returns:** Absolute path to server directory

**Example:**

```typescript
import { getServerDefinitionDir } from '@metorial-mcp-containers/manifest';

const dir = getServerDefinitionDir('modelcontextprotocol/servers/github');
console.log(dir); // "/path/to/catalog/modelcontextprotocol/servers/github"
```

## Types

### `ServerManifest`

```typescript
interface ServerManifest {
  id: string;                          // Short server ID (e.g., "github")
  fullId: string;                      // Full ID (e.g., "modelcontextprotocol/servers/github")
  repo: {
    provider: string;                  // e.g., "github"
    owner: string;                     // Repository owner
    repo: string;                      // Repository name
    branch: string;                    // Branch name
    url: string;                       // Full repository URL
  };
  config: {
    argumentsTemplate: string | null;  // CLI template (e.g., "--token {token}")
    configValues: ConfigValue[];       // Array of configuration values
  };
  subdirectory: string;                // Path within repository
  title: string;                       // Human-readable name
  description: string | null;          // Server description
  build?: {                            // Optional build configuration
    startCommand?: string | null;
    buildCommand?: string | null;
    installCommand?: string | null;
    nodeVersion?: string | null;
    pythonVersion?: string | null;
    buildDir?: string | null;
    nixPackages?: string[] | null;
    aptPackages?: string[] | null;
    platforms?: ('linux/arm64' | 'linux/amd64')[] | null;
  } | null;
}
```

### `ConfigValue`

```typescript
interface ConfigValue {
  title: string;                       // Display name
  description: string | null;          // Description
  default: string | null;              // Default value
  required: boolean;                   // Whether required
  fields: ConfigValueField[];          // How to provide this value
}

interface ConfigValueField {
  type: 'environment' | 'cli' | 'file';
  key: string;                         // Environment var, CLI flag, or file path
}
```

### `ServerVersion`

```typescript
interface ServerVersion {
  serverId: string;                    // Full server ID
  version: string;                     // Semantic version
  manifest: ServerManifest;            // Manifest at this version
  manifestHash: string;                // Hash of manifest
  createdAt: string;                   // ISO 8601 timestamp
  builder: {                           // Build configuration
    type: 'nixpacks';
    plan: NixpacksPlan;
  }[];
}
```

## Complete Example

```typescript
import {
  getAllServers,
  readManifest,
  getLatestServerVersion,
  buildManifest,
  buildConfig,
  writeManifest,
  type ServerManifest
} from '@metorial-mcp-containers/manifest';

// List all servers in catalog
async function listServers() {
  const servers = await getAllServers();

  console.log(`Total servers: ${servers.length}\n`);

  // Group by owner
  const byOwner = servers.reduce((acc, server) => {
    const owner = server.repo.owner;
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byOwner).forEach(([owner, count]) => {
    console.log(`${owner}: ${count} servers`);
  });
}

// Get server details
async function getServerDetails(serverId: string) {
  const manifest = await readManifest(serverId);
  const version = await getLatestServerVersion(serverId);

  console.log(`Server: ${manifest.title}`);
  console.log(`Description: ${manifest.description}`);
  console.log(`Latest version: ${version.version}`);
  console.log(`Created: ${new Date(version.createdAt).toLocaleDateString()}`);

  console.log('\nConfiguration:');
  manifest.config.configValues.forEach(config => {
    console.log(`  ${config.title}${config.required ? ' (required)' : ''}`);
    config.fields.forEach(field => {
      console.log(`    - ${field.type}: ${field.key}`);
    });
  });
}

// Create a new server manifest
async function createNewServer() {
  // Build configuration
  const config = buildConfig({
    cliArguments: {
      arguments: [
        { key: '--api-key', required: true },
        { key: '--workspace', required: true },
        { key: '--base-url', required: false }
      ]
    },
    environmentVariables: [
      { key: 'API_KEY', required: true },
      { key: 'WORKSPACE_ID', required: true },
      { key: 'BASE_URL', required: false }
    ],
    files: []
  });

  // Build manifest
  const manifest = await buildManifest({
    repoUrl: 'https://github.com/myorg/mcp-servers',
    subdirectory: 'packages/myservice',
    title: 'My Service',
    description: 'MCP server for My Service API',
    config
  });

  // Write to catalog
  const { relativeManifestDir } = await writeManifest(manifest);

  console.log(`✓ Manifest created at ${relativeManifestDir}`);
  console.log(`  Server ID: ${manifest.fullId}`);
}

// Run examples
await listServers();
await getServerDetails('modelcontextprotocol/servers/github');
await createNewServer();
```

## Best Practices

### Server ID Format

Server IDs follow the format `owner/repo/server`:

```typescript
// Correct
await readManifest('modelcontextprotocol/servers/github');

// Incorrect
await readManifest('github'); // Missing owner/repo
```

### Configuration Keys

Use consistent naming for configuration keys:

```typescript
// CLI arguments: Use kebab-case with dashes
{ key: '--api-key', required: true }

// Environment variables: Use UPPER_SNAKE_CASE
{ key: 'API_KEY', environmentVariable: 'MY_SERVICE_API_KEY' }
```

### Error Handling

Always handle potential errors when reading manifests:

```typescript
import { readManifest, manifestExists } from '@metorial-mcp-containers/manifest';

async function safeReadManifest(id: string) {
  try {
    // Check existence first
    if (!(await manifestExists(id))) {
      console.error(`Server ${id} not found`);
      return null;
    }

    return await readManifest(id);
  } catch (error) {
    console.error(`Failed to read manifest: ${error.message}`);
    return null;
  }
}
```

### Schema Validation

Use the manifest schema for validation before writing:

```typescript
import { manifestSchema, writeManifest } from '@metorial-mcp-containers/manifest';

async function safeWriteManifest(data: unknown) {
  const result = manifestSchema.safeParse(data);

  if (!result.success) {
    console.error('Invalid manifest:', result.error.flatten());
    return;
  }

  await writeManifest(result.data);
}
```

## Related Packages

- [`@metorial-mcp-containers/case`](../case) - String case conversion utilities
- [`@metorial-mcp-containers/repo`](../repo) - Repository URL parsing
- [`@metorial-mcp-containers/nixpacks`](../nixpacks) - Nixpacks build utilities

## License

MIT
