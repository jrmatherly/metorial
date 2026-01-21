# AI Context Documentation

> Domain-specific documentation for AI assistants working with this project.

## Purpose

These documents provide deep-dive knowledge for AI assistants (Claude, GPT, etc.) when working on specific subsystems. They complement the main documentation with implementation details, troubleshooting flows, and contextual knowledge.

## Documents

| Document | Domain | Use When |
| ---------- | -------- | ---------- |
| [context-loading-strategy.md](./context-loading-strategy.md) | Context | Understanding token-efficient context loading |
| [sdk-usage.md](./sdk-usage.md) | SDK | Using @metorial/mcp-server-sdk, server patterns |
| [build-system.md](./build-system.md) | Build | Nixpacks/Docker build process |
| [catalog.md](./catalog.md) | Catalog | Managing third-party servers |

## Quick Reference

### For Server Development

```
Read: docs/ai-context/sdk-usage.md
Example: servers/github/server.ts
Rule: .claude/rules/servers.md
```

### For SDK Questions

```
Read: docs/ai-context/sdk-usage.md
Code: packages/sdk/src/lib.ts
Agent: .claude/agents/sdk-expert.md
```

### For Build Issues

```
Read: docs/ai-context/build-system.md
Code: packages/nixpacks/src/build.ts
Agent: .claude/agents/build-expert.md
```

### For Catalog Operations

```
Read: docs/ai-context/catalog.md
Index: catalog/index.json
Agent: .claude/agents/catalog-expert.md
```

## Token Efficiency

These documents are designed for efficient context loading:

- Each document focuses on one domain
- Includes practical commands and examples
- Avoids redundancy with main docs
- Provides troubleshooting decision trees

For minimal context loading, start with:

1. `PROJECT_INDEX.md` (3KB) - Complete project understanding
2. Relevant ai-context document (~5-10KB each)

This is more efficient than loading full codebase (~50KB+).

---

**Last Updated:** January 21, 2026
**Total Documents:** 5 domain-specific guides
