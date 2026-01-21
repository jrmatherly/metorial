# Context Loading Strategy

**Purpose**: Optimize token usage when working with this project by loading only necessary context based on task type.

**Target**: Maximize efficiency while maintaining sufficient context for high-quality responses.

---

## Context Loading Philosophy

**Principle**: Load progressively - start minimal, expand as needed.

**Anti-Pattern**: Loading all documentation upfront (wastes tokens on potentially irrelevant context)

**Best Practice**: Use decision tree to determine optimal context set for each task type

---

## Token Cost Reference

Quick reference for planning context loads:

| Document | Token Cost (Approx) | Purpose |
| ---------- | --------------------- | --------- |
| `CLAUDE.md` | ~1K | Quick reference, auto-loaded |
| `AGENTS.md` | ~2K | Universal guidelines |
| `PROJECT_INDEX.md` | ~3K | Complete project overview |
| `README.md` | ~8K | Platform documentation |
| `CONTRIBUTING.md` | ~2K | Contribution guide |
| Serena memories | ~2-5K each | Deep domain knowledge |
| docs/ai-context/* | ~3-8K each | Domain-specific guides |

---

## Task-Based Context Loading Patterns

### Pattern 1: Quick Information Queries

**Examples**:

- "What version of the SDK is used?"
- "How many servers are in the catalog?"
- "What's the command to add a server?"

**Context to Load**:

```
CLAUDE.md only (~1K tokens) - auto-loaded
```

**Total**: ~1K tokens

---

### Pattern 2: Simple Code Changes

**Examples**:

- "Fix a typo in server code"
- "Update a dependency version"
- "Add a new tool to existing server"

**Context to Load**:

```
CLAUDE.md (auto-loaded) (~1K)
+ Read specific file (~2K)
```

**Total**: ~3K tokens

---

### Pattern 3: New Server Development

**Examples**:

- "Create a new MCP server for Notion"
- "Add OAuth support to a server"
- "Implement new tool endpoints"

**Context to Load**:

```
CLAUDE.md (~1K)
PROJECT_INDEX.md (~3K)
Serena: code_style_conventions (~2K)
Example: servers/github/server.ts (~3K)
```

**Total**: ~9K tokens

---

### Pattern 4: Build/Deployment Issues

**Examples**:

- "Server build is failing"
- "Docker container not starting"
- "Nixpacks configuration issues"

**Context to Load**:

```
CLAUDE.md (~1K)
PROJECT_INDEX.md (~3K)
packages/nixpacks/src/build.ts (~3K)
scripts/build/src/index.ts (~2K)
```

**Total**: ~9K tokens

---

### Pattern 5: Architecture Understanding

**Examples**:

- "How does the SDK work?"
- "Explain the catalog structure"
- "How are servers built?"

**Context to Load**:

```
CLAUDE.md (~1K)
PROJECT_INDEX.md (~3K)
Serena: codebase_architecture (~4K)
```

**Total**: ~8K tokens

---

## Progressive Loading Workflow

**Step 1: Always Start Minimal**

```
CLAUDE.md is auto-loaded (~1K)
```

**Step 2: Assess Task Complexity**

```
if simple_query:
    proceed with CLAUDE.md only
elif code_change:
    read specific files
elif new_server:
    load PROJECT_INDEX + example server
elif architecture:
    load Serena memories
```

**Step 3: Expand Context As Needed**

```
# Only load additional context when needed
if additional_context_needed:
    load specific doc(s)
```

---

## Quick Reference: Load This When

| User Says... | Load Context | Token Cost |
| ------------ | ------------ | ---------- |
| "What command..." | CLAUDE.md | 1K |
| "Fix this bug" | CLAUDE.md + file | 3K |
| "Create new server" | PROJECT_INDEX + example | 9K |
| "Build failing" | PROJECT_INDEX + nixpacks | 9K |
| "How does X work" | PROJECT_INDEX + memory | 8K |

---

## Best Practices

### DO

1. **Start with CLAUDE.md**: Always begin with minimal context
2. **Load progressively**: Add context as conversation develops
3. **Use Serena memories**: For deep domain knowledge
4. **Read specific files**: Instead of loading entire codebase

### DON'T

1. **Don't load everything upfront**: Wastes token budget
2. **Don't skip CLAUDE.md**: It's the efficient foundation
3. **Don't load docs "just in case"**: Only load when truly needed
4. **Don't ignore PROJECT_INDEX.md**: It's comprehensive and efficient

---

## Token Budget Targets

| Task Type | Target Tokens |
| --------- | ------------- |
| Quick tasks | < 3K |
| Simple changes | < 5K |
| New server | < 15K |
| Architecture | < 10K |
| Deep debugging | < 20K |

---

**Last Updated**: 2026-01-21
**Token Budget Target**: Use < 25% of budget on context loading for typical tasks
