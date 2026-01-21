# Suggested Commands

## Setup

```bash
# Install dependencies
bun install
```

## Development Commands

```bash
# Add a new MCP server (interactive wizard)
bun add-server

# Build servers
bun run build

# Check versions
bun run check-versions
```

## Git Commands (Darwin/macOS)

```bash
git status              # Check working tree status
git diff               # View changes
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push               # Push to remote
git pull               # Pull from remote
```

## System Commands (Darwin/macOS)

```bash
ls -la                 # List files with details
cd <path>              # Change directory
grep -r "pattern" .    # Search recursively
find . -name "*.ts"    # Find files by pattern
```

## Prerequisites for Contributing

- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Docker](https://www.docker.com/) - Container platform
- [Nixpacks](https://nixpacks.com/docs/install) - Container image builder

## Workflow for Adding a Server

1. Fork the repository
2. Clone your fork
3. Run `bun install`
4. Run `bun add-server` and follow prompts
5. Verify your server in `catalog/` or `servers/`
6. Commit and push changes
7. Create a pull request
