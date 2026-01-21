---
name: build-server
description: Workflow for building and publishing MCP server containers
---

# Build Server Skill

This skill guides you through building MCP servers into Docker containers.

## Build Flow

```
Source Code → Nixpacks Detect → Build Plan → Docker Build → Container Image
                   │                 │              │
                   v                 v              v
              Detect runtime    Generate        Multi-platform
              (Node/Deno/Py)    Dockerfile      linux/amd64
                                               linux/arm64
```

## Quick Commands

```bash
# Build single server
bun run build single <serverId>

# Build with version
bun run build single <serverId> v1.0.0

# Build for specific platform
bun run build single <serverId> --platform linux/amd64

# Build and publish
bun run build single <serverId> --publish

# Build all servers
bun run build all
```

## Build Workflow

### Step 1: Verify Server is Ready

```bash
# Check server files exist
ls servers/<name>/
# Should show: server.ts, metorial.json, package.json, tsconfig.json

# Verify metorial.json
cat servers/<name>/metorial.json
```

### Step 2: Choose Build Type

| Goal | Command |
| ------ | --------- |
| Local testing | `bun run build single <id>` |
| Specific version | `bun run build single <id> v1.0.0` |
| CI pipeline | `bun run build ci <id> <version> --platform linux/amd64` |
| Publish | `bun run build single <id> --publish` |

### Step 3: Build the Container

**Standard Build:**

```bash
bun run build single github
```

**With Options:**

```bash
# Export to tar file
bun run build single github --export ./github.tar

# Prepare without containerizing
bun run build prepare github --out ./output
```

### Step 4: Verify Build

```bash
# Check image was created
docker images | grep metorial

# Test container locally
docker run --rm -it ghcr.io/metorial/mcp-github:latest
```

## Build Configuration

### metorial.json Build Section

```json
{
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
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

| Option | Purpose | Example |
| -------- | --------- | --------- |
| `startCommand` | Container entrypoint | `npm start`, `deno run` |
| `buildCommand` | Build step | `npm run build` |
| `installCommand` | Dependency install | `npm ci` |
| `nodeVersion` | Node.js version | `18`, `20`, `22` |
| `pythonVersion` | Python version | `3.10`, `3.11` |
| `nixPackages` | Nix packages to include | `["openssl", "git"]` |
| `aptPackages` | Apt packages to include | `["libssl-dev"]` |
| `platforms` | Target platforms | `["linux/amd64", "linux/arm64"]` |

## Container Naming

```
ghcr.io/metorial/mcp-<serverId>:<version>
ghcr.io/metorial/mcp-<serverId>:latest
```

Examples:

- `ghcr.io/metorial/mcp-github:1.0.0`
- `ghcr.io/metorial/mcp-slack:latest`

## CI/CD Build

### CI Build (per platform)

```bash
# Build for single platform (runs in parallel per arch)
bun run build ci github v1.0.0 --platform linux/amd64
bun run build ci github v1.0.0 --platform linux/arm64
```

### CI Publish (create manifest)

```bash
# Create multi-arch manifest after platform builds complete
bun run build ci-publish github v1.0.0
```

## Troubleshooting

### Build Failures

| Error | Cause | Solution |
| ------- | ------- | ---------- |
| Missing dependencies | Package not in Nix | Add to `nixPackages` |
| Native module fails | Missing system lib | Add to `aptPackages` |
| Start command fails | Wrong entrypoint | Update `startCommand` |
| Out of memory | Large build | Increase Docker resources |

### Common Fixes

**Native Dependencies:**

```json
{
  "build": {
    "nixPackages": ["openssl", "pkg-config"],
    "aptPackages": ["libssl-dev", "ca-certificates"]
  }
}
```

**Custom Install:**

```json
{
  "build": {
    "installCommand": "npm ci --legacy-peer-deps"
  }
}
```

**Multi-step Build:**

```json
{
  "build": {
    "buildCommand": "npm run build && npm prune --production"
  }
}
```

## Utility Commands

```bash
# Get latest version for a server
bun run build get-latest-version <serverId>

# Get supported platforms
bun run build get-build-platforms <serverId>

# Clean up Docker resources
docker system prune -f
```

## Build Checklist

- [ ] Server has valid metorial.json
- [ ] All dependencies in package.json
- [ ] Build command completes without errors
- [ ] Container starts successfully
- [ ] Server responds to MCP protocol
- [ ] Multi-platform build works (if needed)
