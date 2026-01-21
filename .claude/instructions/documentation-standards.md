# Documentation Standards

Standards for documentation in the Metorial MCP Containers project.

## File Types

| Type | Location | Purpose |
|------|----------|---------|
| Entry points | Root | CLAUDE.md, AGENTS.md, README.md |
| AI Context | `docs/ai-context/` | Deep-dive guides for AI assistants |
| Rules | `.claude/rules/` | Path-specific coding patterns |
| Agents | `.claude/agents/` | Domain expert configurations |
| Skills | `.claude/skills/` | Workflow guides |
| Memories | `.serena/memories/` | Cross-session knowledge |

## Markdown Conventions

### Headings

- Use ATX style (`# Heading`)
- Single H1 per file (the title)
- Hierarchical structure (H2 → H3 → H4)
- No trailing punctuation

### Lists

- Use dashes (`-`) for unordered lists
- Use numbers for ordered lists (`1.`, `2.`, `3.`)
- 2-space indentation for nested lists

### Code Blocks

- Always specify language for syntax highlighting
- Use fenced code blocks (```)
- Surround with blank lines

```typescript
// Good
import { metorial } from '@metorial/mcp-server-sdk';
```

### Tables

- Use for structured data comparison
- Align columns with pipes
- Include header row

| Column 1 | Column 2 |
|----------|----------|
| Value 1 | Value 2 |

## Frontmatter Standards

### Rules

```yaml
---
globs: ["**/path/**/*.ts"]
description: Brief description
---
```

### Agents

```yaml
---
name: agent-name
description: What this agent does
tools:
  - Read
  - Glob
  - Grep
  - Bash
allowedMcpServers:
  - serena
  - context7
model: sonnet
---
```

### Skills

```yaml
---
name: skill-name
description: What this skill does
---
```

## Content Guidelines

### Do

- Start with a clear purpose statement
- Include practical examples
- Provide troubleshooting sections
- Cross-reference related docs
- Use "When to Load" guidance for AI context docs

### Don't

- Duplicate content from other docs
- Include outdated information
- Use overly complex language
- Skip the "Do/Don't" sections where applicable

## AI-Friendly Patterns

### Structure for AI Consumption

1. **Clear headings** - AI can navigate by section
2. **Code examples** - Concrete patterns to follow
3. **Tables** - Quick reference lookup
4. **Do/Don't lists** - Clear guidance
5. **Command references** - Copy-paste ready

### Token Efficiency

- Be concise but complete
- Use tables over prose for structured data
- Include only necessary context
- Link to details rather than duplicating

## File Organization

### Root Level

```
metorial/
├── CLAUDE.md          # Claude Code entry point
├── AGENTS.md          # Universal AI guidelines
├── PROJECT_INDEX.md   # Human-readable index
├── PROJECT_INDEX.json # Machine-readable index
└── README.md          # GitHub readme
```

### Documentation Directories

```
docs/
├── ai-context/        # AI-specific deep dives
│   ├── README.md      # Index with loading guidance
│   └── *.md           # Domain-specific guides
└── ...                # Other docs
```

### Claude Configuration

```
.claude/
├── settings.json      # Hooks and permissions
├── instructions/      # Behavior guides
├── output-styles/     # Response formats
├── rules/             # Path-specific patterns
├── agents/            # Domain experts
├── skills/            # Workflow guides
└── commands/          # Quick operations
```
