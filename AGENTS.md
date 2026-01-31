# Metorial Catalog

MCP server catalog with 33+ pre-built servers in Docker containers.

## Build & Test

```bash
bun run add-server      # Add new MCP server (interactive)
bun run build           # Build all servers
bun run check-versions  # Verify version consistency
```

## Structure

| Directory | Purpose |
|-----------|---------|
| `servers/` | MCP server implementations |
| `packages/` | Shared packages (SDK, manifest) |
| `catalog/` | Third-party server index (408+) |
| `scripts/` | Development automation |

## Server Structure

Each server in `servers/<name>/`:

```
servers/<name>/
├── server.ts         # Implementation
├── metorial.json     # Server metadata
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript config
```

## Conventions

- Package manager: Yarn workspaces
- Each server is Dockerized
- Use `@metorial/*` package naming
- Server metadata in `metorial.json`
