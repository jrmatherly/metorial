# Context Optimization Guide

Strategies for efficient context window usage in the Metorial MCP Containers project.

## Core Principle

**Load on-demand, not upfront.** Only load the context you need for the current task, when you need it.

## Auto-Loaded Context

Claude Code automatically loads `CLAUDE.md` into every conversation (~2K tokens). This provides:

- Project overview and stack
- Common commands reference
- Server implementation pattern
- Directory structure
- Quick troubleshooting

**Do NOT re-read CLAUDE.md** - it's already in your context.

## Context Loading Strategy

### Quick Tasks (Minimal Context)

For simple operations, the auto-loaded CLAUDE.md is sufficient:

```text
Quick fixes → CLAUDE.md only (~2K tokens)
Status checks → CLAUDE.md only
Simple edits → CLAUDE.md only
```

### Standard Operations (~10-20K tokens)

```text
Task: Create new server
Load: .claude/skills/add-server/SKILL.md

Task: Debug server
Load: .claude/skills/debug-server/SKILL.md

Task: Build container
Load: .claude/skills/build-server/SKILL.md
```

### Complex Development (~20-30K tokens)

```text
Task: SDK modifications
Load: docs/ai-context/sdk-usage.md + Serena memory: codebase_architecture

Task: Build system issues
Load: docs/ai-context/build-system.md + .claude/agents/build-expert.md

Task: Catalog operations
Load: docs/ai-context/catalog.md + .claude/agents/catalog-expert.md
```

### Architecture Work (~40-50K tokens)

```text
Task: Major feature development
Load: PROJECT_INDEX.md + relevant ai-context docs + Serena memories

Task: Cross-cutting changes
Load: Multiple rules + agent expertise + codebase exploration
```

## Token Budget Reference

| Resource | Tokens | When to Load |
|----------|--------|--------------|
| CLAUDE.md | ~2K | Auto-loaded |
| AGENTS.md | ~2K | Auto-loaded |
| PROJECT_INDEX.md | ~3K | Complex tasks |
| Rules (each) | ~1-2K | Auto by path |
| Agents (each) | ~2-4K | Domain expertise |
| Skills (each) | ~2-3K | Workflow guidance |
| AI Context docs | ~3-5K | Deep dives |
| Serena memories | ~2-5K | Cross-session context |

## Anti-Patterns

### Don't

- Load all memories at session start
- Read CLAUDE.md when it's already in context
- Load multiple AI context docs for simple tasks
- Read entire server.ts files when symbolic tools suffice

### Do

- Use Serena symbolic tools for code exploration
- Let rules auto-activate based on file paths
- Load skills only when following their workflow
- Use targeted memory reads for specific knowledge

## Serena MCP Integration

For code exploration, prefer Serena tools over file reading:

```text
find_symbol → Locate specific functions/classes
get_symbols_overview → Understand file structure
find_referencing_symbols → Trace usage
search_for_pattern → Find patterns across codebase
```

This is more token-efficient than reading entire files.

## Context Reset Points

Consider starting fresh conversation when:

- Switching between unrelated tasks
- Context window feels cluttered
- Multiple failed attempts at a task
- Moving from research to implementation

Use `/sc:save` to persist important context to Serena memories before resetting.

## Session Initialization

For efficient session setup, use:

```
/expert-mode
```

This provides:
- Serena project activation
- Git state check
- Minimal context loading (PROJECT_INDEX.md)
- Ready state confirmation

Alternative: `/sc:load` if using SuperClaude system.
