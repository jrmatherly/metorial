# Catalog System Guide

> **When to Load**: When working with third-party servers, adding to catalog, or understanding catalog structure.

## Overview

The catalog contains **408+ indexed third-party MCP servers** from external repositories, organized by GitHub owner and repository.

## Structure

```
catalog/
├── index.json                    # Master index (408 entries)
└── <github-owner>/
    └── <repo-name>/
        └── <server-id>/
            ├── manifest.json     # Server configuration
            ├── README.md         # Documentation
            └── versions/
                └── <commit-sha>/
                    └── version.json
```

## Master Index

`catalog/index.json` contains all cataloged servers:

```json
[
  {
    "id": "mcp-server-kubernetes",
    "owner": "Flux159",
    "repo": "mcp-server-kubernetes",
    "repoUrl": "https://github.com/Flux159/mcp-server-kubernetes"
  },
  {
    "id": "mcp-installer",
    "owner": "anaisbetts",
    "repo": "mcp-installer",
    "repoUrl": "https://github.com/anaisbetts/mcp-installer"
  }
]
```

## Manifest Schema

Each server has a `manifest.json`:

```json
{
  "id": "server-id",
  "fullId": "owner/repo/server-id",
  "repo": {
    "provider": "github",
    "owner": "owner-name",
    "repo": "repo-name",
    "branch": "main",
    "url": "https://github.com/owner/repo"
  },
  "config": {
    "argumentsTemplate": null,
    "configValues": [
      {
        "title": "API Token",
        "description": "Authentication token for the service",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "environment",
            "key": "API_TOKEN"
          }
        ]
      }
    ]
  },
  "subdirectory": "",
  "title": "Display Name",
  "description": "Server description",
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "nodeVersion": "20",
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

## Config Field Types

| Type | Description | Example Usage |
| ------ | ------------- | --------------- |
| `environment` | Environment variable | `API_KEY`, `TOKEN` |
| `cli` | Command line argument | `--api-key`, `-k` |
| `file` | Configuration file path | `config.json` |

### Config Field Structure

```json
{
  "title": "API Key",
  "description": "Your API key for authentication",
  "default": null,
  "required": true,
  "fields": [
    {
      "type": "environment",
      "key": "SERVICE_API_KEY"
    }
  ]
}
```

## Version Tracking

Each indexed version corresponds to a Git commit:

```
versions/
├── a1b2c3d4e5f6.../
│   └── version.json
├── b2c3d4e5f6a1.../
│   └── version.json
└── c3d4e5f6a1b2.../
    └── version.json
```

**version.json:**

```json
{
  "version": "a1b2c3d4e5f6789...",
  "timestamp": "2026-01-21T00:00:00Z"
}
```

## Operations

### Adding Server to Catalog

**Interactive (recommended):**

```bash
bun add-server
```

Follows these steps:

1. Enter repository URL
2. Analyze repository structure
3. Confirm detected settings
4. Create manifest and README
5. Verify test build

**Manual:**

1. Create directory structure
2. Create manifest.json with proper schema
3. Create README.md
4. Run verification build

### Building Cataloged Server

```bash
# Using full ID
bun run build single Flux159/mcp-server-kubernetes/mcp-server-kubernetes

# Get latest version first
bun run build get-latest-version Flux159/mcp-server-kubernetes/mcp-server-kubernetes
```

### Checking All Versions

```bash
bun run check-versions
```

## Package Utilities

```typescript
import {
  getAllServers,
  readManifest,
  getLatestServerVersion
} from '@metorial-mcp-containers/manifest';

// List all servers
const servers = await getAllServers();
// Returns: [{ fullId, id, owner, repo, ... }]

// Read specific manifest
const manifest = await readManifest('owner/repo/server-id');

// Get latest version
const version = await getLatestServerVersion('owner/repo/server-id');
// Returns: { version: 'sha...', timestamp: '...' }
```

## Searching the Catalog

### Using jq

```bash
# Find servers by owner
jq '.[] | select(.owner == "Flux159")' catalog/index.json

# Find servers by keyword in ID
jq '.[] | select(.id | contains("kubernetes"))' catalog/index.json

# Count total servers
jq 'length' catalog/index.json

# List all unique owners
jq '[.[].owner] | unique' catalog/index.json
```

### Using Shell

```bash
# List all servers for an owner
ls catalog/<owner>/

# Find servers with specific keyword
grep -r "kubernetes" catalog/*/manifest.json
```

## Server Categories

| Category | Example Servers |
| --------- | --------------- |
| Container/K8s | mcp-server-kubernetes, docker-mcp |
| Databases | mongo-mcp, mcp-mysql, postgres-mcp |
| AI/LLM | langfuse, litellm, openai-mcp |
| Cloud | aws-samples, cloudflare, azure-mcp |
| Dev Tools | github, gitlab, jira |
| Communication | slack, discord, email |
| Analytics | posthog, mixpanel |
| Storage | s3, minio, dropbox |

## Manifest Validation

The manifest schema is defined in:
`packages/manifest/src/types/schema.ts`

Key validations:

- `id` must be kebab-case
- `fullId` must match `owner/repo/id` pattern
- `repo.provider` must be "github"
- `build.platforms` must be valid Docker platforms
- `config.configValues[].fields[].type` must be valid field type

## Troubleshooting

| Issue | Cause | Solution |
| ------- | ------- | ---------- |
| Server not found | Not in index.json | Run `bun add-server` |
| Build fails | Wrong build config | Update manifest.json |
| Version missing | Not tracked | Re-run indexing |
| Config error | Invalid schema | Validate against manifestSchema |
| Missing README | Manual creation needed | Add documentation |

## Reference Files

- `packages/manifest/src/types/schema.ts` - Schema definition
- `packages/manifest/src/manifest/` - Read/write utilities
- `packages/manifest/src/index.ts` - Package exports
- `scripts/add-server/src/index.ts` - Add server wizard
- `scripts/import/src/index.ts` - Bulk import
