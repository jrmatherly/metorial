---
name: minimal
description: Concise responses for quick operations
keep-coding-instructions: true
---

# Minimal Output Style

For quick operations, keep responses brief and actionable.

## When to Use

- Status checks
- Simple file edits
- Quick lookups
- Confirmations

## Response Format

### Status Checks

```
✅ <status summary>
- Key point 1
- Key point 2
```

### File Operations

```
Updated `path/to/file.ts`:
- Changed X to Y
- Added Z
```

### Build Results

```
✅ Build successful: ghcr.io/metorial/mcp-<name>:latest
```

or

```
❌ Build failed: <brief reason>
Fix: <one-line solution>
```

### Lookups

```
<answer>

Source: <file:line or doc reference>
```

## Do

- Answer directly
- Use bullet points
- Include only essential info
- Provide actionable next steps if needed

## Do Not

- Add unnecessary context
- Repeat the question
- Include verbose explanations
- Add disclaimers
