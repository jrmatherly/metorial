# Task Completion Checklist

## Load When

- Before completing ANY task
- Before committing code
- Before marking work as done

---

## Universal Checklist

Before marking any task complete:

- [ ] Code follows style conventions (see `code_style_conventions.md`)
- [ ] No hardcoded secrets or API keys
- [ ] Changes are tested (manual or automated)
- [ ] Documentation updated if needed

---

## Server Development Checklist

When creating/modifying MCP servers:

- [ ] `server.ts` follows SDK patterns
- [ ] `metorial.json` has correct name and runtime
- [ ] `package.json` has required dependencies
- [ ] `tsconfig.json` exists
- [ ] Tools have Zod schemas with `.describe()`
- [ ] Resources have proper URI templates
- [ ] OAuth handler complete (if needed)
- [ ] `bun run build single <serverId>` succeeds

---

## Code Style Quick Check

- [ ] Single quotes (`'string'`)
- [ ] Semicolons required
- [ ] 2-space indentation
- [ ] No trailing commas
- [ ] Arrow parens avoided (`x => x`)
- [ ] Print width < 95 chars

---

## Commit Message Format

```
<type>: <description>

Types: add, fix, update, remove, refactor, docs
```

**Examples**:

- `add: new Notion MCP server`
- `fix: OAuth callback handling in GitHub server`
- `update: SDK version to 1.1.0`

---

## Pull Request Checklist

- [ ] Clear, descriptive PR title
- [ ] Description explains changes
- [ ] Code follows conventions
- [ ] Build passes
- [ ] No secrets committed
- [ ] Documentation updated

---

## Validation Commands

```bash
# Build verification
bun run build single <serverId>

# Type checking (if applicable)
tsc --noEmit

# Version consistency
bun run check-versions
```

---

## Common Pitfalls to Avoid

| Mistake | Prevention |
| --------- | ------------ |
| Missing `metorial.json` | Always create with `bun add-server` |
| Wrong runtime in config | Match to actual code (typescript.deno, typescript.node, python) |
| Hardcoded URLs | Use config variables |
| Missing Zod `.describe()` | Add to all schema fields |
| OAuth scopes too broad | Request minimum needed |

---

**Last Updated**: 2026-01-21
