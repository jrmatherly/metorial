# /server-list - List All Servers

List all available MCP servers (custom and cataloged).

## Execution

### Custom Servers (servers/)

```bash
echo "=== Custom Servers ==="
for dir in servers/*/; do
  name=$(basename "$dir")
  if [ -f "$dir/metorial.json" ]; then
    title=$(jq -r '.name // .title // "untitled"' "$dir/metorial.json")
    runtime=$(jq -r '.runtime // "unknown"' "$dir/metorial.json")
    echo "- $name ($runtime)"
  fi
done
```

### Catalog Servers (sample)

```bash
echo "=== Catalog Servers (first 20) ==="
jq -r '.[0:20][] | "- \(.id) (\(.owner)/\(.repo))"' catalog/index.json
echo "... and $(jq 'length - 20' catalog/index.json) more"
```

### By Category

```bash
echo "=== Custom Server Categories ==="
echo "Productivity: airtable, confluence, jira, notion, slack"
echo "Google Suite: gmail, google-calendar, google-docs, google-drive, google-sheets"
echo "Development: github, gitlab, vercel"
echo "Communication: discord, whatsapp"
echo "Business: hubspot, quickbooks, salesforce, stripe"
echo "AI/Search: brave, context7, exa, firecrawl, perplexity, tavily"
echo "Storage: dropbox, supabase"
```

## Output Format

```
## Available Servers

### Custom (33 servers)
| Server | Runtime | Category |
|--------|---------|----------|
| github | typescript.deno | Development |
| slack | typescript.deno | Productivity |
| ... | ... | ... |

### Cataloged (408 servers)
Top categories:
- Kubernetes/Container: 15 servers
- Databases: 25 servers
- AI/LLM: 30 servers
- Cloud: 20 servers
- Dev Tools: 50 servers

Use `jq '.[] | select(.id | contains("keyword"))' catalog/index.json` to search.
```
