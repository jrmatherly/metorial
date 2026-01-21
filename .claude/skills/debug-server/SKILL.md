---
name: debug-server
description: Workflow for debugging MCP server issues
---

# Debug Server Skill

This skill guides you through diagnosing and fixing issues with MCP servers.

## Issue Categories

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Issue Types                        │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Build     │   Runtime   │    Auth     │   Integration    │
│   Errors    │   Errors    │   Issues    │    Problems      │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

## Diagnostic Workflow

### Step 1: Identify Issue Category

| Symptom | Category | Start Here |
| --------- | ---------- | ------------ |
| `bun run build` fails | Build | Step 2a |
| Server starts but crashes | Runtime | Step 2b |
| OAuth redirect fails | Auth | Step 2c |
| API returns errors | Integration | Step 2d |
| Tool/Resource not found | Registration | Step 2e |

### Step 2a: Build Errors

**Check TypeScript Configuration:**

```bash
# Verify tsconfig.json exists and is valid
cat servers/<name>/tsconfig.json
```

**Check Dependencies:**

```bash
# Ensure SDK is properly linked
bun install
```

**Common Build Fixes:**

| Error | Cause | Fix |
| ------- | ------- | ----- |
| Cannot find module | Missing dependency | Add to package.json |
| Type error in SDK | SDK version mismatch | Update SDK |
| Import error | Wrong import path | Use `@metorial/mcp-server-sdk` |

**Verify metorial.json:**

```json
{
  "name": "server-name",
  "runtime": "typescript.deno"
}
```

### Step 2b: Runtime Errors

**Enable Debug Logging:**

```typescript
// Add at top of server.ts
process.env.DEBUG = 'mcp:*';
```

**Check Server Startup:**

```bash
# Build and inspect output
bun run build prepare <serverId> --out ./debug-output
cd debug-output
# Examine generated files
```

**Common Runtime Fixes:**

| Error | Cause | Fix |
| ------- | ------- | ----- |
| Config undefined | Missing env var | Check Config interface |
| Network error | API unreachable | Verify API endpoint |
| JSON parse error | Invalid response | Add response validation |

### Step 2c: Auth Issues

**OAuth Flow Checklist:**

- [ ] `getAuthForm` returns correct fields
- [ ] `getAuthorizationUrl` builds valid URL
- [ ] Redirect URI matches OAuth app config
- [ ] `handleCallback` exchanges code correctly
- [ ] Token response includes required fields

**Debug OAuth:**

```typescript
metorial.setOauthHandler({
  getAuthorizationUrl: async (input) => {
    console.log('OAuth input:', JSON.stringify(input, null, 2));
    // ... rest of implementation
  },
  handleCallback: async (input) => {
    console.log('Callback input:', JSON.stringify(input, null, 2));
    // ... rest of implementation
  }
});
```

**Common Auth Fixes:**

| Error | Cause | Fix |
| ------- | ------- | ----- |
| Invalid redirect | URL mismatch | Update OAuth app settings |
| Token expired | No refresh logic | Implement token refresh |
| Scope error | Missing permissions | Add required scopes |

### Step 2d: Integration Issues

**Test API Directly:**

```typescript
// Add temporary debug code
const response = await fetch(apiUrl, {
  headers: { Authorization: `Bearer ${config.token}` }
});
console.log('Status:', response.status);
console.log('Body:', await response.text());
```

**Common Integration Fixes:**

| Error | Cause | Fix |
| ------- | ------- | ----- |
| 401 Unauthorized | Bad token | Verify token format |
| 403 Forbidden | Missing scope | Request additional permissions |
| 404 Not Found | Wrong endpoint | Check API documentation |
| 429 Too Many Requests | Rate limited | Add retry logic |

### Step 2e: Registration Issues

**Verify Tool Registration:**

```typescript
// Tools must use snake_case names
server.registerTool(
  'tool_name',  // ✓ Correct
  // NOT 'tool-name' or 'toolName'
  { ... },
  handler
);
```

**Verify Resource Registration:**

```typescript
// Resources use kebab-case
server.registerResource(
  'resource-name',  // ✓ Correct
  new ResourceTemplate('service://resource/{id}', { list: undefined }),
  { ... },
  handler
);
```

**Check Schema:**

```typescript
// Zod schemas must be objects for inputSchema
inputSchema: {
  param: z.string().describe('Description')  // ✓ Correct
}
// NOT: z.object({ param: z.string() })
```

## Quick Diagnostic Commands

```bash
# Check if server is in index
jq '.[] | select(.id == "<serverId>")' catalog/index.json

# Verify server files exist
ls -la servers/<name>/

# Check for TypeScript errors
bunx tsc --noEmit -p servers/<name>/tsconfig.json

# Build with verbose output
DEBUG=* bun run build single <name>
```

## Error Reference

### SDK Errors

| Error Message | Meaning | Solution |
| ------------ | --------- | ---------- |
| `metorial is not defined` | Wrong import | Use named import |
| `ResourceTemplate is not a constructor` | Import error | Check SDK exports |
| `z is not defined` | Missing Zod | Import from SDK |

### Build Errors

| Error Message | Meaning | Solution |
| ------------ | --------- | ---------- |
| `Cannot resolve workspace:*` | Dependency issue | Run `bun install` |
| `ENOENT metorial.json` | Missing metadata | Create metorial.json |
| `Invalid runtime` | Wrong runtime value | Use `typescript.deno` |

## Escalation

If issue persists after these steps:

1. Check `servers/github/server.ts` for reference implementation
2. Review SDK source at `packages/sdk/src/`
3. Check MCP protocol docs via Context7
