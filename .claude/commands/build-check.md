# /build-check - Build System Status

Check build system readiness and recent builds.

## Execution

### 1. Prerequisites Check

```bash
echo "=== Prerequisites ==="
command -v bun &> /dev/null && echo "bun: $(bun --version)" || echo "bun: MISSING"
command -v docker &> /dev/null && echo "docker: $(docker --version)" || echo "docker: MISSING"
command -v nixpacks &> /dev/null && echo "nixpacks: $(nixpacks --version 2>/dev/null || echo 'installed')" || echo "nixpacks: MISSING (optional)"
```

### 2. Docker Status

```bash
echo "=== Docker Images ==="
docker images | grep metorial | head -10 || echo "No metorial images found"
```

### 3. Recent Build Artifacts

```bash
echo "=== Build Scripts ==="
ls -la scripts/build/src/
```

### 4. Server Build Configs

```bash
echo "=== Server Runtimes ==="
for f in servers/*/metorial.json; do
  server=$(dirname "$f" | xargs basename)
  runtime=$(jq -r '.runtime // "not specified"' "$f")
  echo "$server: $runtime"
done
```

## Quick Build Test

To verify build system works:

```bash
# Test build (dry run)
bun run build prepare github --out /tmp/test-build

# Check output
ls -la /tmp/test-build/

# Cleanup
rm -rf /tmp/test-build
```

## Output Format

```
## Build System Status

**Bun:** v1.x.x
**Docker:** v2x.x.x (running)
**Nixpacks:** available

### Recent Images
| Image | Tag | Size | Created |
|-------|-----|------|---------|
| mcp-github | latest | 150MB | 2 days ago |

### Build Health
- All prerequisites: OK
- Docker daemon: Running
- Registry access: OK
```
