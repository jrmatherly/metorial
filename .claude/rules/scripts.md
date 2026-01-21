---
globs: ["**/scripts/**/*.ts", "**/scripts/**/package.json"]
description: Development script patterns and conventions
---

# Scripts Rules

## Scripts Overview

| Script | Purpose | Command |
| -------- | --------- | --------- |
| `add-server` | Interactive server creation | `bun add-server` |
| `build` | Build servers to containers | `bun run build` |
| `check-versions` | Verify version consistency | `bun run check-versions` |
| `import` | Import servers from sources | Internal use |
| `index` | Update catalog index | Internal use |

## add-server Script

Interactive wizard for adding new MCP servers.

**Usage:**

```bash
bun add-server
```

**Flow:**

1. Prompts for repository URL or local path
2. Analyzes project structure
3. Detects runtime (TypeScript/Python)
4. Creates server files or catalog entry
5. Runs test build to verify

**Entry point:** `scripts/add-server/src/index.ts`

## build Script

Build servers to Docker containers using Nixpacks.

**Commands:**

```bash
# Build single server
bun run build single <serverId> [version]
bun run build single github
bun run build single github v1.0.0

# Build with options
bun run build single github --platform linux/amd64
bun run build single github --publish
bun run build single github --export ./output

# Prepare build (no container)
bun run build prepare <serverId> --out ./output

# Get server info
bun run build get-latest-version <serverId>
bun run build get-build-platforms <serverId>

# Build all servers
bun run build all
bun run build all --only servers.txt

# CI commands
bun run build ci <serverId> <version> --platform linux/amd64
bun run build ci-publish <serverId> <version>
```

**Entry point:** `scripts/build/src/index.ts`

## check-versions Script

Verify version consistency across catalog.

**Usage:**

```bash
bun run check-versions
```

**Entry point:** `scripts/check-versions/src/index.ts`

## Script Structure

```
scripts/<name>/
├── src/
│   ├── index.ts      # Entry point
│   └── *.ts          # Additional modules
├── package.json
└── tsconfig.json
```

## CLI Framework

Scripts use `sade` for CLI parsing:

```typescript
import sade from 'sade';

let prog = sade('script-name');

prog
  .command('subcommand <required> [optional]')
  .option('--flag, -f', 'Description')
  .action(async (required, optional, opts) => {
    // Implementation
  });

prog.parse(process.argv);
```

## Dependencies

Scripts typically depend on:

- `@metorial-mcp-containers/manifest` - Manifest utilities
- `@metorial-mcp-containers/nixpacks` - Build utilities
- `sade` - CLI framework
- `fs-extra` - File system utilities

## Do

- Use existing utilities from `packages/`
- Follow CLI conventions (flags, help text)
- Handle errors gracefully
- Exit with appropriate codes

## Do Not

- Duplicate functionality from packages
- Skip error handling
- Use synchronous file operations
- Hardcode paths (use config)
