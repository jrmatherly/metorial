# CLAUDE.md

Claude Code-specific guidance for the Metorial MCP Containers repository.

> **Universal guidelines** (commands, patterns, dos/don'ts): See `AGENTS.md`

## Quick Start

1. Run `/expert-mode` to initialize session with Serena context (or `/sc:load` with SuperClaude)
2. Read `PROJECT_INDEX.md` for complete project understanding (~3K tokens)
3. Use Serena memories for deep context (load on-demand)

## Repository Overview

Open-source collection of **MCP (Model Context Protocol) servers** in Docker containers. Enables AI agents to connect to APIs and tools via a unified interface.

**Stack:** TypeScript, Bun runtime, Yarn workspaces, Docker, Nixpacks, `@metorial/mcp-server-sdk`

## Context Budget

| Complexity | Tokens | What to Load |
|------------|--------|--------------|
| Quick fix | ~5K | CLAUDE.md + AGENTS.md (auto-loaded) |
| Standard work | ~10-15K | + PROJECT_INDEX.md |
| New server | ~15-20K | + `/add-server` skill + server reference |
| Deep architecture | ~30-40K | + memories + ai-context docs |

## On-Demand Context Loading

**Core Principle:** Load context only when the task requires it.

### By Task Type

| Task | Load |
|------|------|
| Creating new server | `/add-server` skill |
| Debugging build issues | `/debug-server` skill |
| Building containers | `/build-server` skill |
| Server implementation | `.claude/rules/servers.md` (auto-loads for `servers/**/*.ts`) |
| Package development | `.claude/rules/packages.md` (auto-loads for `packages/**/*.ts`) |
| Catalog operations | `.claude/rules/catalog.md` (auto-loads for `catalog/**/*.json`) |
| Script modifications | `.claude/rules/scripts.md` (auto-loads for `scripts/**/*.ts`) |
| SDK internals | `docs/ai-context/sdk-usage.md` + `sdk-expert` agent |
| Build system deep dive | `docs/ai-context/build-system.md` + `build-expert` agent |

### Serena MCP Memories

Load on-demand based on task:

| Memory | When to Load |
|--------|--------------|
| `project_overview` | Session start, project understanding |
| `codebase_architecture` | Deep architectural decisions |
| `code_style_conventions` | Writing new code |
| `task_completion_checklist` | Before completing any task |
| `context_optimization_analysis` | Understanding context loading |
| `suggested_commands` | Shell command reference |

## Essential Commands

```bash
bun install                        # Install dependencies
bun add-server                     # Add new MCP server (interactive)
bun run build single <serverId>    # Build specific server
bun run build all                  # Build all servers
bun run check-versions             # Verify versions
```

## Project Structure

```
metorial/
├── catalog/           # 408 indexed MCP server configurations
├── servers/           # 33 custom server implementations
├── packages/          # 12 shared utility packages
│   ├── sdk/           # @metorial/mcp-server-sdk
│   ├── manifest/      # Manifest utilities
│   └── nixpacks/      # Build utilities
└── scripts/           # Development automation
```

## Quick Reference

### Server Runtime Options

| Runtime | Use Case |
|---------|----------|
| `typescript.deno` | Preferred for new servers |
| `typescript.node` | For Node-specific dependencies |
| `python` | For Python servers |

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tool names | snake_case | `create_issue`, `list_repos` |
| Resource names | kebab-case | `pull-request`, `calendar-event` |
| Server directories | kebab-case | `google-calendar`, `github` |
| Config keys | camelCase | `accessToken`, `clientId` |

### Server Implementation Pattern

```typescript
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
    server.registerResource('name', template, opts, handler);

    // Register tools
    server.registerTool('tool_name', { inputSchema: {...} }, handler);
  }
);
```

## Agents (Use via Task tool)

| Agent | Domain |
|-------|--------|
| `mcp-server-expert` | Server implementation patterns |
| `sdk-expert` | SDK internals and extension |
| `build-expert` | Docker/Nixpacks builds |
| `catalog-expert` | Catalog management |

## Skills

| Skill | Workflow |
|-------|----------|
| `/add-server` | Adding new MCP servers |
| `/debug-server` | Diagnosing server issues |
| `/build-server` | Building containers |
| `/expert-mode` | Session initialization |

## Context Optimization

1. **Don't re-read CLAUDE.md/AGENTS.md** - already in context
2. **Load memories on-demand** - not upfront
3. **Use PROJECT_INDEX.md** for complete overview
4. **Use Serena symbolic tools** for code exploration
5. **Let rules auto-activate** - they load based on file paths

## When Stuck

| Issue | Solution |
|-------|----------|
| Which file to edit? | Custom servers: `servers/`, Catalog: `catalog/` |
| How to add server? | Run `bun add-server` interactive wizard |
| Build failing? | Check `metorial.json` runtime, run `bun run build single <id>` |
| OAuth not working? | Check scopes, redirectUri in `setOauthHandler()` |
| SDK usage? | See `servers/github/server.ts` as reference |
| Server not found? | Check path in `servers/` or `catalog/` |
| Manifest errors? | Verify against schema in `packages/manifest/src/types/schema.ts` |
| Pre-commit steps? | Load `task_completion_checklist` memory |
| Deep architecture? | Load `codebase_architecture` memory |
| Template syntax? | Check `.claude/rules/servers.md` (auto-loads) |

## Key Files Reference

| File | Purpose |
|------|---------|
| `servers/<name>/server.ts` | Server implementation |
| `servers/<name>/metorial.json` | Server metadata |
| `packages/sdk/src/lib.ts` | SDK exports |
| `packages/manifest/src/types/schema.ts` | Manifest schema |
| `catalog/index.json` | Master catalog index |

---

*For universal guidelines, see `AGENTS.md`. Use `/expert-mode` for efficient session initialization.*
