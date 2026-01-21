# Common MCP Server Errors Reference

Troubleshooting guide for common MCP server errors and their solutions.

## Build Errors

### TypeScript Compilation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module '@metorial/mcp-server-sdk'` | Missing dependency | Run `bun install` |
| `Type 'X' is not assignable to type 'Y'` | Type mismatch in schema | Check Zod schema types |
| `Property 'X' does not exist on type 'Config'` | Missing config property | Add to Config interface |

### Example Fixes

**Missing module:**
```bash
bun install
# or
bun add @metorial/mcp-server-sdk
```

**Type mismatch:**
```typescript
// Wrong
inputSchema: {
  count: z.string()  // But expecting number
}

// Correct
inputSchema: {
  count: z.number()
}
```

## Runtime Errors

### OAuth Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid client_id` | Wrong OAuth credentials | Check env vars |
| `Invalid redirect_uri` | Mismatch in OAuth app | Update OAuth app settings |
| `Invalid scope` | Service doesn't support scope | Check service documentation |
| `Token expired` | Access token no longer valid | Implement token refresh |

### API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid or expired token | Check authentication |
| `403 Forbidden` | Insufficient permissions | Check OAuth scopes |
| `404 Not Found` | Wrong endpoint URL | Verify API endpoint |
| `429 Too Many Requests` | Rate limited | Implement backoff |

### Example Error Handling

```typescript
async function apiRequest(endpoint: string) {
  const response = await fetch(`https://api.service.com${endpoint}`, {
    headers: { 'Authorization': `Bearer ${config.token}` }
  });

  if (response.status === 401) {
    throw new Error('Authentication failed. Token may be expired.');
  }

  if (response.status === 403) {
    throw new Error('Permission denied. Check OAuth scopes.');
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || '60';
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json();
}
```

## Configuration Errors

### metorial.json Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid runtime` | Unknown runtime value | Use `typescript.deno`, `typescript.node`, or `python` |
| `Missing name` | No name field | Add `"name": "Server Name"` |
| `Invalid JSON` | Syntax error | Validate JSON syntax |

### Valid metorial.json

```json
{
  "name": "Service Name",
  "runtime": "typescript.deno"
}
```

## Container Build Errors

### Nixpacks Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No provider found` | Can't detect language | Check file structure |
| `Build command failed` | Compilation error | Check build logs |
| `Package not found` | Missing nix package | Add to `nixPackages` in manifest |

### Docker Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Out of memory` | Build too large | Increase Docker memory |
| `Platform mismatch` | Wrong architecture | Specify `--platform` flag |
| `Permission denied` | Docker socket issue | Check Docker permissions |

## Debugging Commands

### Check Server Structure

```bash
# Verify required files exist
ls servers/<name>/
# Should show: server.ts, metorial.json, package.json, tsconfig.json

# Validate metorial.json
cat servers/<name>/metorial.json | jq .

# Check dependencies
cat servers/<name>/package.json | jq '.dependencies'
```

### Test Build

```bash
# Prepare build without containerizing
bun run build prepare <serverId> --out ./debug-output

# Check generated Dockerfile
cat ./debug-output/Dockerfile

# Build single server
bun run build single <serverId>
```

### Check Types

```bash
# Type check specific server
cd servers/<name> && tsc --noEmit

# Check for import errors
grep -n "import" servers/<name>/server.ts
```

## Common Patterns That Cause Issues

### Wrong: Hardcoded URLs

```typescript
// Bad
const response = await fetch('https://api.service.com/endpoint');

// Good
const BASE_URL = 'https://api.service.com';
const response = await fetch(`${BASE_URL}/endpoint`);
```

### Wrong: Missing Error Handling

```typescript
// Bad
const data = await response.json();

// Good
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
const data = await response.json();
```

### Wrong: Missing .describe() on Schema

```typescript
// Bad - AI won't understand parameter purpose
inputSchema: {
  id: z.string()
}

// Good - Clear description for AI
inputSchema: {
  id: z.string().describe('Unique identifier for the resource')
}
```

### Wrong: Returning Raw Response

```typescript
// Bad - May expose sensitive data
return { content: [{ type: 'text', text: JSON.stringify(response) }] };

// Good - Format and filter response
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      id: response.id,
      name: response.name,
      status: response.status
    }, null, 2)
  }]
};
```

## Quick Diagnostic Checklist

- [ ] `metorial.json` has valid `name` and `runtime`
- [ ] `package.json` includes `@metorial/mcp-server-sdk`
- [ ] `tsconfig.json` exists and has valid config
- [ ] All imports resolve correctly
- [ ] Config interface matches expected environment variables
- [ ] OAuth scopes are correct for required operations
- [ ] API endpoints are correct
- [ ] Error handling is implemented
- [ ] All Zod schemas have `.describe()`
