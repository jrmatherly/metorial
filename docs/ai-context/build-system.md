# Build System Guide

> **When to Load**: When building containers, troubleshooting build failures, or configuring build options.

## Overview

The Metorial build system uses Nixpacks to create Docker containers from MCP server source code.

```
Source → Nixpacks → Dockerfile → Docker → Container Image
```

## Build Commands

### Essential Commands

```bash
# Build single server
bun run build single <serverId>
bun run build single github

# Build with version
bun run build single github v1.0.0

# Build and publish
bun run build single github --publish

# Build all servers
bun run build all
```

### Platform-Specific Builds

```bash
# AMD64 only
bun run build single github --platform linux/amd64

# ARM64 only
bun run build single github --platform linux/arm64
```

### CI/CD Commands

```bash
# CI build (per platform)
bun run build ci github v1.0.0 --platform linux/amd64
bun run build ci github v1.0.0 --platform linux/arm64

# CI publish (create manifest)
bun run build ci-publish github v1.0.0
```

### Utility Commands

```bash
# Get latest version
bun run build get-latest-version github

# Get supported platforms
bun run build get-build-platforms github

# Prepare without containerizing
bun run build prepare github --out ./output

# Export to tar file
bun run build single github --export ./github.tar
```

## Architecture

### Package Structure

```
packages/nixpacks/
└── src/
    ├── index.ts      # Exports
    ├── build.ts      # nixpacksBuild(), getContainerName()
    ├── plan.ts       # Build planning
    ├── options.ts    # Build options
    └── nixDir.ts     # Nixpacks directory utilities

scripts/build/
└── src/
    ├── index.ts      # CLI commands
    └── chunks.ts     # Batch processing
```

### Build Flow

```
┌──────────────────┐
│  Server Source   │
│  (servers/<id>)  │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Nixpacks Detect  │  Analyze project structure
│ - package.json?  │  Determine runtime
│ - deno.json?     │  (Node.js, Deno, Python)
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Nixpacks Plan   │  Generate build plan
│  - Install step  │  Create Dockerfile
│  - Build step    │
│  - Start command │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Nixpacks Build  │  Execute Dockerfile
│  - Dependencies  │  Create image layers
│  - Application   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Docker Publish  │  Push to registry
│  - Tag image     │  Multi-platform manifest
│  - Push layers   │
└──────────────────┘
```

## Build Configuration

### metorial.json Build Section

```json
{
  "name": "server-name",
  "runtime": "typescript.deno",
  "build": {
    "startCommand": "deno run --allow-all server.ts",
    "buildCommand": null,
    "installCommand": null,
    "nodeVersion": "20",
    "pythonVersion": "3.11",
    "buildDir": "dist",
    "nixPackages": ["git", "curl"],
    "aptPackages": ["libssl-dev"],
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

### Configuration Options

| Option | Type | Description | Default |
| -------- | ------ | ------------- | --------- |
| `startCommand` | string | Container entrypoint | Auto-detected |
| `buildCommand` | string | Build step command | Auto-detected |
| `installCommand` | string | Dependency installation | Auto-detected |
| `nodeVersion` | string | Node.js version | `20` |
| `pythonVersion` | string | Python version | `3.11` |
| `buildDir` | string | Build output directory | - |
| `nixPackages` | string[] | Nix packages to include | `[]` |
| `aptPackages` | string[] | Apt packages to include | `[]` |
| `platforms` | string[] | Target platforms | `["linux/amd64", "linux/arm64"]` |

### Runtime Detection

| Runtime | Detection | Default Start Command |
| --------- | ----------- | ---------------------- |
| Node.js | `package.json` | `npm start` |
| Deno | `deno.json` | `deno run --allow-all` |
| Python | `requirements.txt` | `python main.py` |

## Container Naming

```
ghcr.io/metorial/mcp-<serverId>:<version>
ghcr.io/metorial/mcp-<serverId>:latest
```

**Examples:**

- `ghcr.io/metorial/mcp-github:1.0.0`
- `ghcr.io/metorial/mcp-github:latest`
- `ghcr.io/metorial/mcp-slack:2.1.0`

## Platform Support

| Platform | Description | Use Case |
| --------- | ------------- | ---------- |
| `linux/amd64` | x86_64 | Standard servers, Intel/AMD |
| `linux/arm64` | ARM64 | Apple Silicon, AWS Graviton |

## Troubleshooting

### Common Build Errors

| Error | Cause | Solution |
| ------- | ------- | ---------- |
| Missing dependency | Package not in Nix | Add to `nixPackages` |
| Native module fails | System lib missing | Add to `aptPackages` |
| Start command fails | Wrong entrypoint | Update `startCommand` |
| Out of memory | Large dependencies | Increase Docker memory |
| Permission denied | Docker access | Check Docker daemon |

### Native Dependencies

For packages with native dependencies:

```json
{
  "build": {
    "nixPackages": ["openssl", "pkg-config", "gcc"],
    "aptPackages": ["libssl-dev", "ca-certificates"]
  }
}
```

### Custom Build Steps

```json
{
  "build": {
    "installCommand": "npm ci --legacy-peer-deps",
    "buildCommand": "npm run build && npm prune --production"
  }
}
```

### Debugging Builds

```bash
# Enable verbose output
DEBUG=* bun run build single <serverId>

# Prepare only (inspect without containerizing)
bun run build prepare <serverId> --out ./debug-output
cd debug-output
ls -la

# Check generated Dockerfile
cat ./debug-output/.nixpacks/Dockerfile
```

## Docker Operations

```bash
# Check built images
docker images | grep metorial

# Test container locally
docker run --rm -it ghcr.io/metorial/mcp-github:latest

# Clean up
docker system prune -f

# Remove specific image
docker rmi ghcr.io/metorial/mcp-github:latest
```

## Batch Building

### Build All Servers

```bash
bun run build all
```

### Build Subset

```bash
# Create list file
echo "github" > servers.txt
echo "slack" >> servers.txt

# Build only listed servers
bun run build all --only servers.txt
```

### Parallel Building

The build system automatically parallelizes where possible. Platform-specific builds can run concurrently:

```bash
# These can run in parallel
bun run build ci github v1.0.0 --platform linux/amd64 &
bun run build ci github v1.0.0 --platform linux/arm64 &
wait

# Then create manifest
bun run build ci-publish github v1.0.0
```

## Reference Files

- `packages/nixpacks/src/build.ts` - Core build implementation
- `packages/nixpacks/src/plan.ts` - Build planning
- `scripts/build/src/index.ts` - CLI implementation
- `scripts/build/src/chunks.ts` - Batch processing
