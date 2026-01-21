# Codebase Architecture

Deep architectural patterns and design decisions for the Metorial MCP Containers project.

## High-Level Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Metorial Platform                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│   │  Node.js    │    │   Python    │    │   Direct    │                     │
│   │    SDK      │    │    SDK      │    │    API      │                     │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│          │                  │                  │                            │
│          └──────────────────┼──────────────────┘                            │
│                             │                                               │
│                             v                                               │
│                    ┌─────────────────┐                                      │
│                    │  Metorial API   │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│                             v                                               │
│                    ┌─────────────────┐                                      │
│                    │  MCP Containers │  <── THIS REPOSITORY                 │
│                    │  (Docker)       │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│          ┌──────────────────┼──────────────────┐                            │
│          v                  v                  v                            │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                      │
│   │   GitHub    │   │   Slack     │   │   Notion    │   ...408+ more       │
│   │   Server    │   │   Server    │   │   Server    │                      │
│   └─────────────┘   └─────────────┘   └─────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Repository Structure

```text
metorial/
│
├── servers/                      # CUSTOM SERVERS (33 implementations)
│   │                             # These are first-party, maintained servers
│   │
│   ├── github/                   # Example: GitHub MCP Server
│   │   ├── server.ts             # Main implementation
│   │   ├── metorial.json         # Server metadata
│   │   ├── package.json          # Dependencies
│   │   └── tsconfig.json         # TypeScript config
│   │
│   ├── slack/                    # Slack integration
│   ├── notion/                   # Notion integration
│   ├── stripe/                   # Stripe payments
│   └── ...                       # 29 more servers
│
├── catalog/                      # THIRD-PARTY SERVERS (408 indexed)
│   │                             # These are indexed from external repos
│   │
│   ├── index.json                # Master catalog index
│   │
│   └── <owner>/                  # Organized by GitHub owner
│       └── <repo>/
│           └── <server-id>/
│               ├── manifest.json # Server configuration
│               ├── README.md     # Documentation
│               └── versions/
│                   └── <commit-sha>/
│                       └── version.json
│
├── packages/                     # SHARED PACKAGES (12 utilities)
│   │
│   ├── sdk/                      # @metorial/mcp-server-sdk
│   │   └── src/
│   │       ├── lib.ts            # Main exports (metorial object)
│   │       ├── server.ts         # createServer implementation
│   │       ├── oauth.ts          # OAuth handler
│   │       └── callbacks.ts      # Callback handler
│   │
│   ├── manifest/                 # Manifest utilities
│   │   └── src/
│   │       ├── config.ts         # Configuration
│   │       ├── manifest/         # Read/write/getServers
│   │       ├── types/schema.ts   # Zod manifest schema
│   │       └── versions/         # Version management
│   │
│   ├── nixpacks/                 # Docker build utilities
│   │   └── src/
│   │       ├── build.ts          # nixpacksBuild function
│   │       ├── plan.ts           # Build planning
│   │       └── options.ts        # Build options
│   │
│   ├── repo/                     # GitHub repo utilities
│   ├── server-config/            # Server configuration parsing
│   ├── cleanup/                  # Cleanup utilities
│   ├── delay/                    # Promise delay
│   ├── id/                       # ID generation
│   ├── case/                     # String case conversion
│   ├── canonicalize/             # Canonicalization
│   ├── unique/                   # Unique value utilities
│   └── temp-dir/                 # Temp directory management
│
└── scripts/                      # DEVELOPMENT SCRIPTS
    │
    ├── add-server/               # Interactive server creation
    │   └── src/
    │       ├── index.ts          # Entry point
    │       └── cli.ts            # CLI implementation
    │
    ├── build/                    # Server build CLI
    │   └── src/
    │       ├── index.ts          # Build commands (single, all, ci)
    │       └── chunks.ts         # Batch processing
    │
    ├── check-versions/           # Version verification
    ├── import/                   # Server import from sources
    └── index/                    # Catalog indexing
```

## Data Flow

### Server Development Flow

```text
Developer creates server
         │
         v
┌─────────────────┐
│  bun add-server │  Interactive wizard
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Creates files: │
│  - server.ts    │
│  - metorial.json│
│  - package.json │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Developer writes│
│ implementation  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  bun run build  │  Nixpacks + Docker
│  single <id>    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Docker Image   │  Ready for deployment
│  published      │
└─────────────────┘
```

### SDK Usage Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                         MCP Server                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  import { metorial, z } from '@metorial/mcp-server-sdk'         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ metorial.setOauthHandler({...})    // Optional OAuth setup  ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              v                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ metorial.createServer<Config>(metadata, async (server) => { ││
│  │                                                              ││
│  │   server.registerResource(...)  // Data endpoints           ││
│  │   server.registerTool(...)      // Action endpoints         ││
│  │                                                              ││
│  │ })                                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              v                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              MCP Protocol (stdio/SSE)                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. SDK (`packages/sdk`)

The SDK provides the core primitives for building MCP servers:

```typescript
// Main exports from lib.ts
export let metorial = {
  createServer,      // Create MCP server instance
  setOauthHandler,   // Configure OAuth flow
  setCallbackHandler // Set callback handlers
};

// Re-exports
export * from '@modelcontextprotocol/sdk/server/index.js';
export * from '@modelcontextprotocol/sdk/server/mcp.js';
export * from 'zod';  // Schema validation
```

### 2. Manifest Schema (`packages/manifest`)

Server manifests follow this schema:

```typescript
manifestSchema = z.object({
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
    argumentsTemplate: z.string().optional(),
    configValues: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      default: z.string().optional(),
      required: z.boolean(),
      fields: z.array(z.object({
        type: z.enum(['environment', 'cli', 'file']),
        key: z.string()
      }))
    }))
  }),
  subdirectory: z.string(),
  title: z.string(),
  description: z.string().optional(),
  build: z.object({
    startCommand: z.string().optional(),
    buildCommand: z.string().optional(),
    installCommand: z.string().optional(),
    nodeVersion: z.string().optional(),
    pythonVersion: z.string().optional(),
    buildDir: z.string().optional(),
    nixPackages: z.array(z.string()).optional(),
    aptPackages: z.array(z.string()).optional(),
    platforms: z.array(z.enum(['linux/arm64', 'linux/amd64'])).optional()
  }).optional()
});
```

### 3. Build System (`packages/nixpacks`)

Uses Nixpacks for container builds:

```text
Server Source
     │
     v
┌─────────────┐
│  Nixpacks   │  Analyzes project
│   Plan      │  Determines runtime
└──────┬──────┘
       │
       v
┌─────────────┐
│  Nixpacks   │  Generates Dockerfile
│   Build     │  Builds container
└──────┬──────┘
       │
       v
┌─────────────┐
│   Docker    │  Multi-platform support
│   Publish   │  (amd64, arm64)
└─────────────┘
```

## Design Principles

### 1. Container-First

All servers run in Docker containers for:

- Isolation and security
- Consistent runtime environment
- Easy deployment and scaling

### 2. Protocol Standardization

Built on Model Context Protocol (MCP):

- Standard interface for AI tool integration
- Resources (read) and Tools (write/action)
- OAuth support for authenticated services

### 3. SDK Abstraction

The SDK abstracts MCP complexity:

- Simple `createServer` API
- Zod schema validation built-in
- OAuth flow handling

### 4. Catalog-Driven

Third-party servers indexed in catalog:

- Manifest-based configuration
- Version tracking per commit
- Automated discovery and indexing

## Server Categories

| Category | Servers | Examples |
| ---------- | --------- | ---------- |
| Productivity | 5 | airtable, confluence, jira, notion, slack |
| Google Suite | 5 | gmail, calendar, docs, drive, sheets |
| Development | 3 | github, gitlab, vercel |
| Communication | 2 | discord, whatsapp |
| Business | 5 | hubspot, quickbooks, salesforce, stripe |
| AI/Search | 6 | brave, context7, exa, firecrawl, perplexity, tavily |
| Storage | 2 | dropbox, supabase |
| Other | 5 | arXiv, calendly, hackernews, loops, microsoft365, resend |

---

**Last Updated**: 2026-01-21
**Load When**: Understanding architecture, designing features, major refactoring
