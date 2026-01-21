# Build Configuration Reference

Build configuration patterns for different server types.

## Catalog Server manifest.json

### Basic TypeScript Server

```json
{
  "id": "server-name",
  "fullId": "owner/repo/server-name",
  "repo": {
    "provider": "github",
    "owner": "github-owner",
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
  "title": "Server Display Name",
  "description": "What this server does",
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "nodeVersion": "20",
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

### Python Server

```json
{
  "id": "python-server",
  "fullId": "owner/repo/python-server",
  "repo": {
    "provider": "github",
    "owner": "github-owner",
    "repo": "repo-name",
    "branch": "main",
    "url": "https://github.com/owner/repo"
  },
  "config": {
    "argumentsTemplate": null,
    "configValues": []
  },
  "subdirectory": "",
  "title": "Python Server",
  "description": "Python-based MCP server",
  "build": {
    "startCommand": "python -m server",
    "installCommand": "pip install -r requirements.txt",
    "pythonVersion": "3.11",
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

### Server with Native Dependencies

```json
{
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "nodeVersion": "20",
    "nixPackages": ["openssl", "pkg-config", "git"],
    "aptPackages": ["libssl-dev", "ca-certificates"],
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

### Server in Subdirectory

```json
{
  "subdirectory": "packages/mcp-server",
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "buildDir": "packages/mcp-server",
    "nodeVersion": "20"
  }
}
```

## Config Value Patterns

### Environment Variable

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

### CLI Argument

```json
{
  "title": "Verbose Mode",
  "description": "Enable verbose logging",
  "default": "false",
  "required": false,
  "fields": [
    {
      "type": "cli",
      "key": "--verbose"
    }
  ]
}
```

### Optional with Default

```json
{
  "title": "Base URL",
  "description": "API base URL (default: production)",
  "default": "https://api.service.com",
  "required": false,
  "fields": [
    {
      "type": "environment",
      "key": "SERVICE_BASE_URL"
    }
  ]
}
```

### Multiple Fields

```json
{
  "title": "Database Connection",
  "description": "PostgreSQL connection settings",
  "default": null,
  "required": true,
  "fields": [
    {
      "type": "environment",
      "key": "DATABASE_HOST"
    },
    {
      "type": "environment",
      "key": "DATABASE_PORT"
    },
    {
      "type": "environment",
      "key": "DATABASE_NAME"
    }
  ]
}
```

## Build Commands by Runtime

### TypeScript/Node

| Runtime | Install | Build | Start |
|---------|---------|-------|-------|
| npm | `npm install` | `npm run build` | `npm start` |
| yarn | `yarn install` | `yarn build` | `yarn start` |
| pnpm | `pnpm install` | `pnpm build` | `pnpm start` |
| bun | `bun install` | `bun run build` | `bun start` |

### Python

| Tool | Install | Start |
|------|---------|-------|
| pip | `pip install -r requirements.txt` | `python -m server` |
| poetry | `poetry install` | `poetry run python -m server` |
| uv | `uv pip install -r requirements.txt` | `python -m server` |

## Node.js Version Reference

| Version | Status | Recommended |
|---------|--------|-------------|
| 18 | LTS | Legacy projects |
| 20 | LTS | ✅ Default |
| 22 | Current | New projects |

## Python Version Reference

| Version | Status | Recommended |
|---------|--------|-------------|
| 3.10 | Supported | Legacy |
| 3.11 | Supported | ✅ Default |
| 3.12 | Current | New projects |

## Common Nix Packages

| Package | Purpose |
|---------|---------|
| `openssl` | SSL/TLS support |
| `pkg-config` | Library configuration |
| `git` | Git operations |
| `curl` | HTTP requests |
| `jq` | JSON processing |
| `postgresql` | PostgreSQL client |
| `mysql80` | MySQL client |

## Common Apt Packages

| Package | Purpose |
|---------|---------|
| `libssl-dev` | SSL development headers |
| `ca-certificates` | SSL certificates |
| `build-essential` | C/C++ compiler |
| `libpq-dev` | PostgreSQL development |
| `libmysqlclient-dev` | MySQL development |

## Platform Support

| Platform | Architecture | Notes |
|----------|--------------|-------|
| `linux/amd64` | x86_64 | Intel/AMD (most common) |
| `linux/arm64` | ARM64 | Apple Silicon, AWS Graviton |

**Default:** Both platforms for maximum compatibility.

## Container Naming Convention

```
ghcr.io/metorial/mcp-<serverId>:<version>
ghcr.io/metorial/mcp-<serverId>:latest
```

Examples:
- `ghcr.io/metorial/mcp-github:1.0.0`
- `ghcr.io/metorial/mcp-slack:latest`
- `ghcr.io/metorial/mcp-notion:2.1.0`

## Build Commands Quick Reference

```bash
# Build single server (custom)
bun run build single github

# Build single server with version
bun run build single github v1.0.0

# Build catalog server
bun run build single Flux159/mcp-server-kubernetes/mcp-server-kubernetes

# Build with specific platform
bun run build single github --platform linux/amd64

# Build and publish
bun run build single github --publish

# Prepare build (no container)
bun run build prepare github --out ./output

# Get latest version
bun run build get-latest-version github

# Build all servers
bun run build all
```
