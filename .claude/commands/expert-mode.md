---
description: Initialize expert mode for metorial MCP Containers with efficient context loading
---

# Expert Mode - Session Initialization

Quick initialization for the metorial MCP Containers development workspace.

**Context Architecture:**

- `AGENTS.md` - Universal guidelines (commands, patterns, dos/don'ts)
- `CLAUDE.md` - Claude-specific (Serena MCP, memories, skills, agents)

Both files auto-inject into Claude Code. Use `AGENTS.md` as primary reference.

## Initialization Steps

### 1. Activate Serena Project

Activate the project for access to memories and symbolic tools:

```text
mcp__plugin_serena_serena__activate_project with project: "metorial"
```

### 2. Check Current State

Check working directory and git status:

```bash
pwd && git branch --show-current && git status --short && git log --oneline -3
```

**Identify:**

- Current branch and recent commits
- Uncommitted changes
- What the user was working on

### 3. Load Minimal Context

Read `PROJECT_INDEX.md` for efficient project understanding (~3K tokens):

```text
Read PROJECT_INDEX.md
```

This provides:

- Project overview
- Directory structure
- Server inventory (33 custom, 408 catalogued)
- Core packages reference
- Build commands

### 4. Ready State

Confirm readiness:

- Serena project activated
- Git state understood
- PROJECT_INDEX.md loaded
- Ready for on-demand context loading

**What would you like to work on?**

---

## On-Demand Context Loading

**Core Principle:** Load context only when the task requires it.

### By Task Type

| Task | Load |
|------|------|
| Creating new server | `/add-server` skill |
| Debugging build issues | `/debug-server` skill |
| Building containers | `/build-server` skill |
| Server implementation | `.claude/rules/servers.md` (auto-loads) |
| Package development | `.claude/rules/packages.md` (auto-loads) |
| Catalog operations | `.claude/rules/catalog.md` (auto-loads) |
| Script modifications | `.claude/rules/scripts.md` (auto-loads) |
| SDK internals | `docs/ai-context/sdk-usage.md` |
| Build system deep dive | `docs/ai-context/build-system.md` |

### Serena Memories (Deep Context)

| Memory | When to Load |
|--------|--------------|
| `project_overview` | Quick project reference |
| `codebase_architecture` | Deep architectural patterns |
| `code_style_conventions` | Writing new code |
| `task_completion_checklist` | Before completing any task |
| `context_optimization_analysis` | Understanding context loading |
| `suggested_commands` | Shell command reference |

### Usage Patterns

**Quick tasks** (~5K tokens):

- CLAUDE.md + AGENTS.md (auto-loaded)
- Rules auto-load when editing files
- Start working immediately

**Standard work** (~10-15K tokens):

- + PROJECT_INDEX.md
- + Relevant skill for workflow

**Deep work** (~20-40K tokens):

- + Domain-specific ai-context docs
- + Relevant Serena memories
- + Reference server implementations

---

## Essential Commands

```bash
bun install                        # Install dependencies
bun add-server                     # Add new server (interactive)
bun run build single <serverId>    # Build specific server
bun run build all                  # Build all servers
bun run check-versions             # Verify versions
```

See `AGENTS.md` for full command reference.

## Server Runtime Options

```text
typescript.deno  - Preferred for new servers
typescript.node  - For Node-specific dependencies
python           - For Python servers
```

## Naming Conventions

```text
Tool names:     snake_case    (create_issue, list_repos)
Resource names: kebab-case    (pull-request, calendar-event)
Server dirs:    kebab-case    (google-calendar, github)
Config keys:    camelCase     (accessToken, clientId)
```

---

## When Stuck

| Issue | Solution |
|-------|----------|
| Which file to edit? | Custom servers: `servers/`, Catalog: `catalog/` |
| How to add server? | Run `bun add-server` interactive wizard |
| Build failing? | Check `metorial.json` runtime, run `bun run build single <id>` |
| OAuth not working? | Check scopes, redirectUri in `setOauthHandler()` |
| SDK usage? | See `servers/github/server.ts` as reference |
| Pre-commit steps? | Load `task_completion_checklist` memory |
| Deep architecture? | Load `codebase_architecture` memory |
| Template syntax? | Check `.claude/rules/servers.md` (auto-loads) |

---

**Then wait for the user's specific task.**
