# AGENTS.md

Universal AI coding agent instructions for the Metorial MCP Containers repository. Follows the [AGENTS.md open standard](https://agents.md).

> **Claude Code users**: See `CLAUDE.md` for Serena MCP, skills, agents, and context optimization.

## Project Overview

Open-source collection of **MCP (Model Context Protocol) servers** in Docker containers. Part of the Metorial platform (YC F25) for connecting AI agents to APIs, data sources, and tools.

**Stack:** TypeScript, Bun runtime, Yarn workspaces, Docker/Nixpacks, `@metorial/mcp-server-sdk`

**Related:** [metorial-platform](https://github.com/metorial/metorial-platform), [metorial-node](https://github.com/metorial/metorial-node), [metorial-python](https://github.com/metorial/metorial-python)

## Context Loading

**Read first:** `PROJECT_INDEX.md` - Complete project understanding in ~3K tokens

**Key directories:**

| Directory | Contents | Count |
|-----------|----------|-------|
| `servers/` | Custom MCP server implementations | 33 |
| `packages/` | Shared utility packages | 12 |
| `catalog/` | Indexed third-party servers | 408 |
| `scripts/` | Development automation | 5 |

## Critical Rules

### DO

- Use `bun add-server` for adding new servers (interactive wizard)
- Follow existing server patterns (see `servers/github/server.ts`)
- Use `@metorial/mcp-server-sdk` for server development
- Register tools with Zod schemas including `.describe()` for all fields
- Use single quotes, semicolons, 2-space indentation
- Run `bun run build single <serverId>` to verify changes

### DON'T

- Manually create server directories (use the wizard)
- Use `{{ }}` Jinja syntax (this isn't a template project)
- Commit secrets, API keys, or `.env` files
- Modify `catalog/` without understanding manifest schema
- Skip the `metorial.json` configuration file
- Use `any` type except for external API responses

## Essential Commands

```bash
# Setup
bun install                           # Install dependencies

# Development
bun add-server                        # Add new server (interactive)
bun run build single <serverId>       # Build specific server
bun run build all                     # Build all servers
bun run check-versions                # Verify versions

# Build options
bun run build single github --publish # Build and publish
bun run build prepare <id> --out ./   # Prepare build output
```

## Project Structure

```
metorial/
├── servers/<name>/           # Custom MCP servers
│   ├── server.ts             # Implementation
│   ├── metorial.json         # Metadata (name, runtime)
│   ├── package.json          # Dependencies
│   └── tsconfig.json         # TypeScript config
│
├── packages/                 # Shared packages
│   ├── sdk/                  # @metorial/mcp-server-sdk
│   ├── manifest/             # Manifest utilities
│   └── nixpacks/             # Build utilities
│
├── catalog/<owner>/<repo>/   # Third-party servers
│   ├── manifest.json         # Server configuration
│   └── versions/             # Version tracking
│
└── scripts/                  # Automation
    ├── add-server/           # Server creation wizard
    ├── build/                # Build CLI
    └── check-versions/       # Version checking
```

## Server Implementation (Quick Reference)

```typescript
import { metorial, ResourceTemplate, z } from '@metorial/mcp-server-sdk';

// Optional: OAuth handler
metorial.setOauthHandler({ ... });

interface Config { token: string; }

metorial.createServer<Config>(
  { name: 'server-name', version: '1.0.0' },
  async (server, config) => {
    // Resources (read operations)
    server.registerResource('name', template, opts, handler);
    
    // Tools (actions) - always use z.string().describe()
    server.registerTool('tool_name', {
      inputSchema: { param: z.string().describe('Description') }
    }, handler);
  }
);
```

**Full example:** `servers/github/server.ts`

## metorial.json

```json
{
  "name": "Server Display Name",
  "runtime": "typescript.deno"
}
```

| Runtime | Use Case |
|---------|----------|
| `typescript.deno` | Preferred for new servers |
| `typescript.node` | Node-specific dependencies |
| `python` | Python servers |

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Server directory | kebab-case | `google-calendar` |
| Tool names | snake_case | `create_issue` |
| Resource names | kebab-case | `pull-request` |
| Config keys | camelCase | `accessToken` |

## Code Style

| Rule | Standard |
|------|----------|
| Quotes | Single (`'string'`) |
| Semicolons | Required |
| Indentation | 2 spaces |
| Print width | 95 characters |
| Trailing commas | None |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `bun add-server` fails | Ensure Docker and Nixpacks installed |
| Build errors | Check `metorial.json` runtime matches code |
| OAuth not working | Verify scopes, redirectUri, clientId/Secret |
| Server not found | Check path in `servers/` or `catalog/` |

## Success Criteria

- [ ] `bun run build single <serverId>` succeeds
- [ ] Server registers at least one resource or tool
- [ ] OAuth flow works (if applicable)
- [ ] Zod schemas include `.describe()` for all fields
- [ ] Code follows style conventions

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `PROJECT_INDEX.md` | Complete project overview (~3K tokens) |
| `CLAUDE.md` | Claude Code specific (Serena, skills, agents) |
| `CONTRIBUTING.md` | Contribution guidelines |
| `servers/github/server.ts` | Reference implementation |

---

*For detailed patterns, see `PROJECT_INDEX.md`. Claude Code users: see `CLAUDE.md` for enhanced tooling.*
