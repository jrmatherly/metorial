---
globs: ["**/catalog/**/*.json", "**/catalog/**/*.md", "**/catalog/index.json"]
description: Third-party server catalog management patterns
---

# Catalog Management Rules

## Catalog Structure

```
catalog/
├── index.json                    # Master catalog index
└── <owner>/                      # GitHub owner
    └── <repo>/                   # Repository name
        └── <server-id>/          # Server identifier
            ├── manifest.json     # Server configuration
            ├── README.md         # Documentation
            └── versions/
                └── <commit-sha>/
                    └── version.json
```

## index.json Format

The master index lists all catalogued servers:

```json
[
  {
    "id": "server-id",
    "owner": "github-owner",
    "repo": "repo-name",
    "repoUrl": "https://github.com/owner/repo"
  }
]
```

## manifest.json Format

Each server has a manifest following the schema:

```json
{
  "id": "server-id",
  "fullId": "owner/repo/server-id",
  "repo": {
    "provider": "github",
    "owner": "owner-name",
    "repo": "repo-name",
    "branch": "main",
    "url": "https://github.com/owner/repo"
  },
  "config": {
    "argumentsTemplate": null,
    "configValues": [
      {
        "title": "API Key",
        "description": "Your API key for the service",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "environment",
            "key": "API_KEY"
          }
        ]
      }
    ]
  },
  "subdirectory": "",
  "title": "Server Display Name",
  "description": "What this server does",
  "build": {
    "startCommand": "npm start",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "nodeVersion": "20",
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

## Config Value Types

| Type | Description | Example |
| ------ | ------------- | --------- |
| `environment` | Environment variable | `API_KEY`, `TOKEN` |
| `cli` | Command line argument | `--api-key` |
| `file` | Configuration file | `config.json` |

## Version Tracking

Each version is tracked by commit SHA:

```
versions/
└── a1b2c3d4.../
    └── version.json
```

```json
{
  "version": "a1b2c3d4e5f6...",
  "timestamp": "2026-01-21T00:00:00Z"
}
```

## Adding to Catalog

Use the `bun add-server` command which:

1. Prompts for repository URL
2. Analyzes the repository
3. Creates manifest.json
4. Updates index.json
5. Creates version entry

## Do

- Use `bun add-server` for adding new servers
- Verify manifest schema compliance
- Include meaningful descriptions
- Specify all required config values
- Use correct build settings for runtime

## Do Not

- Manually edit `index.json` (use scripts)
- Create entries without valid repo URLs
- Skip config values for required settings
- Use incorrect platform specifications

## Validation

```bash
# Check all catalog entries
bun run check-versions

# Build specific catalogued server
bun run build single <owner>/<repo>/<server-id>
```

## Common Issues

| Issue | Cause | Solution |
| ------- | ------- | ---------- |
| Server not found | Missing from index.json | Run `bun add-server` |
| Build fails | Wrong runtime/commands | Update manifest.json build section |
| Missing config | Config values incomplete | Add all required fields |
