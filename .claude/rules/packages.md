---
globs: ["**/packages/**/*.ts", "**/packages/**/package.json"]
description: Shared package development patterns
---

# Shared Packages Rules

## Package Structure

```
packages/<name>/
├── src/
│   └── index.ts      # Main exports
├── package.json      # Package config
└── tsconfig.json     # TypeScript config
```

## Core Packages Reference

### @metorial/mcp-server-sdk (`packages/sdk`)

Main SDK for building MCP servers.

**Exports:**

```typescript
export let metorial = {
  createServer,       // Create MCP server instance
  setOauthHandler,    // Configure OAuth flow
  setCallbackHandler  // Set callback handlers
};

// Re-exports from MCP SDK
export * from '@modelcontextprotocol/sdk/server/index.js';
export * from '@modelcontextprotocol/sdk/server/mcp.js';

// Re-exports Zod for schemas
export * from 'zod';
```

### @metorial-mcp-containers/manifest (`packages/manifest`)

Utilities for reading/writing server manifests.

**Key exports:**

```typescript
export * from './config';
export * from './manifest/getServers';   // getAllServers()
export * from './manifest/read';         // readManifest()
export * from './manifest/write';        // writeManifest()
export * from './repoUrl';
export * from './types/schema';          // manifestSchema
export * from './versions/check';
export * from './versions/get';          // getLatestServerVersion()
```

### @metorial-mcp-containers/nixpacks (`packages/nixpacks`)

Docker build utilities using Nixpacks.

**Key exports:**

```typescript
export * from './build';  // nixpacksBuild(), getContainerName()
export * from './plan';   // Build planning utilities
```

## Manifest Schema

```typescript
const manifestSchema = z.object({
  id: z.string(),
  fullId: z.string(),
  repo: z.object({
    provider: z.string(),
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    url: z.string()
  }),
  config: z.object({
    argumentsTemplate: z.string().optional().nullable(),
    configValues: z.array(z.object({
      title: z.string(),
      description: z.string().optional().nullable(),
      default: z.string().optional().nullable(),
      required: z.boolean(),
      fields: z.array(z.object({
        type: z.enum(['environment', 'cli', 'file']),
        key: z.string()
      }))
    }))
  }),
  subdirectory: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  build: z.object({
    startCommand: z.string().optional().nullable(),
    buildCommand: z.string().optional().nullable(),
    installCommand: z.string().optional().nullable(),
    nodeVersion: z.string().optional().nullable(),
    pythonVersion: z.string().optional().nullable(),
    buildDir: z.string().optional().nullable(),
    nixPackages: z.array(z.string()).optional().nullable(),
    aptPackages: z.array(z.string()).optional().nullable(),
    platforms: z.array(z.enum(['linux/arm64', 'linux/amd64'])).optional().nullable()
  }).optional().nullable()
});
```

## Package Naming

| Scope | Pattern | Example |
| ------- | --------- | --------- |
| SDK packages | `@metorial/*` | `@metorial/mcp-server-sdk` |
| Internal packages | `@metorial-mcp-containers/*` | `@metorial-mcp-containers/manifest` |

## Code Style

- Single quotes, semicolons, 2-space indentation
- Export from `index.ts` barrel file
- Use Zod for schema validation
- Prefer `async/await` over raw promises

## Do

- Export types alongside implementations
- Use barrel exports (`export * from`)
- Document public APIs
- Keep packages focused on single responsibility

## Do Not

- Create circular dependencies between packages
- Export internal implementation details
- Modify package behavior without updating dependents
