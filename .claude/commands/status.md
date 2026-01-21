# /status - Project Status Check

Run comprehensive project status checks.

## Execution

Run these checks in sequence:

### 1. Git Status

```bash
git status
```

### 2. Server Count

```bash
echo "Custom servers: $(ls -d servers/*/ 2>/dev/null | wc -l | tr -d ' ')"
echo "Catalog servers: $(jq 'length' catalog/index.json)"
```

### 3. Package Status

```bash
echo "=== Package versions ==="
for pkg in packages/*/package.json; do
  name=$(jq -r '.name' "$pkg")
  version=$(jq -r '.version' "$pkg")
  echo "$name: $version"
done
```

### 4. Recent Changes

```bash
echo "=== Recent commits ==="
git log --oneline -5
```

### 5. Build Readiness

```bash
echo "=== Build system check ==="
if command -v bun &> /dev/null; then
  echo "Bun: $(bun --version)"
else
  echo "Bun: NOT INSTALLED"
fi

if command -v docker &> /dev/null; then
  echo "Docker: $(docker --version | cut -d' ' -f3)"
else
  echo "Docker: NOT INSTALLED"
fi
```

## Output Format

Report status in this format:

```
## Project Status

**Git Branch:** main (clean/dirty)
**Custom Servers:** 33
**Catalog Servers:** 408
**Build Tools:** bun v1.x, docker v2x.x

### Recent Activity
- commit message 1
- commit message 2
- commit message 3

### Pending Changes
- list any uncommitted changes
```
