# Project Index: Metorial MCP Containers

Generated: 2026-01-21

## Overview

**Metorial** (YC F25) - Open-source integration platform for agentic AI. This repository contains pre-built MCP (Model Context Protocol) servers in Docker containers, enabling AI agents to connect to various APIs and tools.

## Quick Start

```bash
# Install dependencies
bun install

# Add a new MCP server (interactive)
bun add-server

# Build a specific server
bun run build single <serverId> [version]

# Build all servers
bun run build all

# Check versions
bun run check-versions
```

## Project Structure

```
metorial/
├── catalog/              # 408 indexed MCP server configurations
│   ├── index.json        # Master index of all catalog entries
│   └── <owner>/          # Server configs organized by GitHub owner
│       └── <repo>/
│           ├── manifest.json
│           ├── README.md
│           └── versions/
├── servers/              # 33 custom MCP server implementations
│   ├── github/           # GitHub API integration
│   ├── slack/            # Slack API integration
│   ├── notion/           # Notion API integration
│   ├── stripe/           # Stripe payments integration
│   ├── gmail/            # Gmail integration
│   ├── google-calendar/  # Google Calendar integration
│   └── ...               # 27 more servers
├── packages/             # 12 shared utility packages
│   ├── sdk/              # MCP Server SDK (@metorial/mcp-server-sdk)
│   ├── manifest/         # Manifest reading/writing utilities
│   ├── nixpacks/         # Docker/Nixpacks build utilities
│   ├── repo/             # GitHub repo utilities
│   ├── server-config/    # Server configuration parsing
│   └── ...               # 7 more utility packages
└── scripts/              # Development automation
    ├── add-server/       # Interactive server creation wizard
    ├── build/            # Server build CLI
    ├── check-versions/   # Version checking utility
    ├── import/           # Bulk server import
    └── index/            # Catalog indexing
```

## Entry Points

| Entry Point | Path | Purpose |
| ------------- | ------ | --------- |
| Add Server | `scripts/add-server/src/index.ts` | Interactive CLI wizard for adding new MCP servers |
| Build | `scripts/build/src/index.ts` | Build servers to Docker containers |
| Check Versions | `scripts/check-versions/src/index.ts` | Verify server version consistency |
| Import | `scripts/import/src/index.ts` | Import servers from external sources |

## Core Packages

### @metorial/mcp-server-sdk (`packages/sdk`)

Main SDK for building MCP servers. Exports:

- `metorial.createServer<Config>()` - Create an MCP server
- `metorial.setOauthHandler()` - Configure OAuth authentication
- `metorial.setCallbackHandler()` - Set callback handlers
- Re-exports from `@modelcontextprotocol/sdk` and `zod`

### @metorial-mcp-containers/manifest (`packages/manifest`)

Utilities for reading/writing server manifests:

- `readManifest(serverId)` - Read server manifest
- `getAllServers()` - List all servers
- `getLatestServerVersion(serverId)` - Get latest version
- `manifestSchema` - Zod schema for validation

### @metorial-mcp-containers/nixpacks (`packages/nixpacks`)

Docker build utilities:

- `nixpacksBuild()` - Build server to container
- `getContainerName()` - Generate container name

### Other Packages

| Package | Purpose |
| --------- | --------- |
| `canonicalize` | Canonicalization utilities |
| `case` | String case conversion |
| `cleanup` | Cleanup utilities |
| `delay` | Promise delay utilities |
| `id` | ID generation |
| `repo` | GitHub repository operations |
| `server-config` | Server configuration parsing |
| `temp-dir` | Temporary directory management |
| `unique` | Unique value utilities |

## Server Implementation Pattern

Each server in `servers/` follows this structure:

```typescript
// server.ts
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// Optional OAuth handler
metorial.setOauthHandler({ ... });

interface Config {
  token: string;
}

metorial.createServer<Config>(
  { name: 'server-name', version: '1.0.0' },
  async (server, config) => {
    // Register resources
    server.registerResource('resource-name', template, opts, handler);

    // Register tools
    server.registerTool('tool_name', { inputSchema: {...} }, handler);
  }
);
```

**Server files:**

- `server.ts` - Main implementation
- `metorial.json` - Server metadata (`{ "name": "...", "runtime": "typescript.deno" }`)
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config

## Available Servers (33 total)

**Productivity:** airtable, confluence, jira, notion, slack
**Google Suite:** gmail, google-calendar, google-docs, google-drive, google-sheets
**Development:** github, gitlab, vercel
**Communication:** discord, whatsapp
**Business:** hubspot, quickbooks, salesforce, stripe
**AI/Search:** brave, context7, exa, firecrawl, perplexity, tavily
**Storage:** dropbox, supabase
**Other:** arXiv, calendly, hackernews, loops, microsoft356, resend

## Catalog Structure (408 indexed servers)

Each catalogued server has:

```
catalog/<owner>/<repo>/<server-id>/
├── manifest.json         # Server configuration
├── README.md             # Documentation
└── versions/
    └── <commit-sha>/
        └── version.json  # Version-specific config
```

## Key Configuration Files

| File | Purpose |
| ------ | --------- |
| `package.json` | Root workspace config, defines `bun add-server`, `bun run build` |
| `.prettierrc` | Code formatting (single quotes, semicolons, 95 chars) |
| `featured.json` | List of featured servers |
| `CONTRIBUTING.md` | Contribution guidelines |

## Dependencies

**Runtime:** Bun
**Package Manager:** Yarn workspaces (executed via Bun)
**Containerization:** Docker + Nixpacks
**Core Libraries:**

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `zod` - Schema validation
- `sade` - CLI framework
- `fs-extra` - Enhanced filesystem operations

## Build Commands

```bash
# Build single server
bun run build single <serverId> [version]
bun run build single github
bun run build single slack v1.0.0

# Build with options
bun run build single github --platform linux/amd64 --publish

# Build all servers
bun run build all
bun run build all --only servers.txt

# Prepare build output
bun run build prepare <serverId> --out ./output

# Get server info
bun run build get-latest-version <serverId>
bun run build get-build-platforms <serverId>

# CI commands
bun run build ci <serverId> <version> --platform linux/amd64
bun run build ci-publish <serverId> <version>
```

## Related Resources

- **Metorial Platform:** https://github.com/metorial/metorial-platform
- **Node.js SDK:** https://github.com/metorial/metorial-node
- **Python SDK:** https://github.com/metorial/metorial-python
- **MCP Index:** https://github.com/metorial/mcp-index
- **Documentation:** https://metorial.com/docs
- **API Docs:** https://metorial.com/api
