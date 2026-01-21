---
name: debugging
description: Structured debugging for MCP server and build issues
keep-coding-instructions: true
---

# Debugging Output Style

Follow systematic debugging process for MCP server development:

## 1. Reproduce

- Confirm exact symptoms
- Note which server/package is affected
- Identify recent changes

## 2. Isolate

- Narrow down to specific component (SDK, Server, Build, Config)
- Check dependency chain
- Identify last known good state

## 3. Analyze

- Form hypothesis based on error patterns
- Gather evidence (logs, types, config)
- Check related code paths

## 4. Fix

- Make minimal change
- Verify fix doesn't break dependencies
- Document if non-obvious

## 5. Verify

- Run build to confirm fix
- Test affected functionality
- Check related servers if pattern issue

## Response Structure

Always structure debugging responses with these headers:

~~~~~markdown
## Problem

**Symptom:** [What the user observed]
**Error:** [Exact error message if any]
**Component:** [Server name/Package name/Build system]
**Context:** [When it started, recent changes]

## Investigation

### Hypothesis 1: [Most likely cause]

**Evidence:**
- [Finding from code/logs]
- [Finding from types/schemas]

**Code examined:**
```typescript
[relevant code snippet]
```

**Verdict:** [Confirmed/Ruled out]

### Hypothesis 2: [Alternative cause]
...

## Root Cause

[Clear explanation of what's actually wrong]

## Fix

```typescript
// Before
[problematic code]

// After
[fixed code]
```

**Why this fixes it:** [Brief explanation]

## Verification

```bash
# Build the server
bun run build single <serverId>

# Or run type check
tsc --noEmit
```

**Expected output:** [What success looks like]

## Prevention

- [ ] Update patterns: [if common issue]
- [ ] Add to troubleshooting: [if recurring]
- [ ] Consider: [related improvements]
~~~~~

## Debug Commands Reference

### Build Issues

```bash
# Build single server with verbose output
bun run build single <serverId>

# Prepare build without containerizing
bun run build prepare <serverId> --out ./debug-output

# Check server metadata
cat servers/<name>/metorial.json
```

### TypeScript Issues

```bash
# Type check without emitting
tsc --noEmit

# Check specific server
tsc --noEmit -p servers/<name>/tsconfig.json
```

### SDK Issues

```bash
# Check SDK types
cat packages/sdk/src/lib.ts

# Find symbol usage
grep -r "createServer" servers/
```

### Docker Issues

```bash
# List images
docker images | grep metorial

# Check container logs
docker logs <container-id>

# Inspect image
docker inspect ghcr.io/metorial/mcp-<name>:latest
```

## Do

- Start with the most likely cause based on error patterns
- Show your reasoning process
- Provide verification steps
- Reference relevant docs sections

## Do Not

- Jump to conclusions without evidence
- Propose complex fixes before understanding the problem
- Skip the verification step
- Make changes to multiple servers without testing each
