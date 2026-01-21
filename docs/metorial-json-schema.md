# metorial.json Configuration Schema

> **When to Load**: When creating new MCP servers, configuring server metadata, or troubleshooting configuration issues.

## Overview

Every MCP server in the Metorial platform requires a configuration file that defines its metadata, runtime settings, configuration requirements, and build instructions. This schema enables the Metorial platform to:

- **Identify and catalog** MCP servers across the ecosystem
- **Configure runtime** requirements and execution environments
- **Build containers** using Docker/Nixpacks with appropriate dependencies
- **Manage user configuration** through environment variables, CLI arguments, or files
- **Deploy servers** with proper OAuth integration and resource management

The configuration schema is defined in `packages/manifest/src/types/schema.ts` using Zod validation and is used across:
- **33 custom servers** in the `servers/` directory
- **408+ catalog servers** in the `catalog/` directory
- The Metorial platform build and deployment pipeline

## Quick Start: Minimal Configuration

For most custom MCP servers built within the Metorial monorepo, you only need two fields:

**File:** `servers/<server-name>/metorial.json`

```json
{
  "name": "GitHub MCP Server",
  "runtime": "typescript.deno"
}
```

**That's it!** With just `name` and `runtime`, the Metorial build system automatically:
- Detects package manager from lockfiles
- Infers repository metadata from directory location
- Uses standard build/install/start commands based on runtime
- Applies sensible defaults for configuration

**When to use this minimal approach:**
- ✅ Building custom servers within the Metorial monorepo (`servers/` directory)
- ✅ Using standard Metorial SDK patterns (`@metorial/mcp-server-sdk`)
- ✅ Following conventional Node.js/TypeScript/Python project structure
- ✅ No custom build requirements or system dependencies
- ✅ Standard runtime environment is sufficient

**Available runtimes:**
- `typescript.deno` - Deno runtime (preferred for new servers)
- `typescript.node` - Node.js runtime (for Node-specific dependencies)
- `python` - Python runtime

**When you need more:** If your server requires custom build commands, system dependencies, or specific configuration, see the full schema documentation below.

## File Locations

The configuration schema supports two file naming conventions depending on the server type:

### metorial.json (Custom Servers)

**Location:** `servers/<server-name>/metorial.json`

**Purpose:** Minimal configuration for custom servers built within the Metorial monorepo.

**Usage:** All 33 custom servers in `servers/` directory use this approach.

**Required Fields:** `name` and `runtime` only

**Example:**
```json
{
  "name": "GitHub MCP Server",
  "runtime": "typescript.deno"
}
```

**When to Use:**
- Building custom servers within the Metorial monorepo
- Using standard Metorial SDK patterns
- No custom build requirements needed
- Default configuration is sufficient
- Repository metadata is inferred from directory location

### manifest.json (Catalog Servers)

**Location:** `catalog/<owner>/<repo>/<subdirectory>/manifest.json`

**Purpose:** Complete configuration for third-party servers indexed in the Metorial catalog.

**Usage:** All 408+ catalog servers use this approach.

**Required Fields:** All schema fields (`id`, `fullId`, `repo`, `config`, `subdirectory`, `title`, `description`, and optionally `build`)

**Example:**
```json
{
  "id": "mcp-server",
  "fullId": "devflowinc/trieve/mcp-server",
  "repo": {
    "provider": "github.com",
    "owner": "devflowinc",
    "repo": "trieve",
    "branch": "main",
    "url": "https://github.com/devflowinc/trieve"
  },
  "config": {
    "argumentsTemplate": null,
    "configValues": [
      {
        "title": "trieve-api-key",
        "description": null,
        "default": null,
        "required": false,
        "fields": [
          {
            "type": "environment",
            "key": "TRIEVE_API_KEY"
          }
        ]
      }
    ]
  },
  "subdirectory": "clients/mcp-server",
  "title": "trieve-mcp-server",
  "description": "A Model Context Protocol (MCP) server for Trieve API"
}
```

**When to Use:**
- Indexing third-party MCP servers in the catalog
- Servers from external GitHub repositories
- Servers requiring explicit repository metadata
- Servers with custom configuration requirements
- Servers with specialized build processes

## Key Differences

| Aspect | metorial.json | manifest.json |
|--------|---------------|---------------|
| **Location** | `servers/` directory | `catalog/` directory |
| **Server Type** | Custom Metorial servers | Third-party catalog servers |
| **Fields Required** | 2 (name, runtime) | 8+ (all schema fields) |
| **Repository Info** | Inferred from location | Explicitly defined |
| **Typical Use Case** | Internal development | External integration |
| **Build Process** | Standard Metorial build | May include custom build config |
| **Total Count** | 33 servers | 408+ servers |

## Schema Structure

The complete schema (required for `manifest.json`, simplified for `metorial.json`) includes:

### Top-Level Fields

- **id** - Unique identifier for the server
- **fullId** - Fully qualified identifier (owner/repo/id format)
- **repo** - Repository information (provider, owner, repo, branch, url)
- **config** - Configuration schema with argumentsTemplate and configValues array
- **subdirectory** - Subdirectory within repository where server code resides
- **title** - Human-readable title for the server
- **description** - Detailed description of server functionality (optional/nullable)
- **build** - Build configuration for containerization (optional/nullable)

### Simplified Fields (metorial.json only)

- **name** - Server display name (equivalent to title)
- **runtime** - Execution environment (typescript.deno, typescript.node, python)

The full field-by-field documentation follows in the sections below.

## Top-Level Fields

### id

**Type:** `string`
**Required:** Yes
**Used in:** `manifest.json` only

The unique identifier for the MCP server within its repository. This is typically the directory name or the npm package name without the owner prefix.

**Examples:**
```json
"id": "mcp-server"
"id": "github"
"id": "google-calendar"
```

**Conventions:**
- Use kebab-case for multi-word identifiers
- Should match the server's directory name when possible
- Must be unique within the repository

---

### fullId

**Type:** `string`
**Required:** Yes
**Used in:** `manifest.json` only

The fully qualified identifier combining owner, repository, and server ID in the format `{owner}/{repo}/{id}`. This creates a globally unique identifier across the entire Metorial catalog.

**Examples:**
```json
"fullId": "devflowinc/trieve/mcp-server"
"fullId": "metorial/metorial/github"
"fullId": "owner/repository/server-name"
```

**Format:** `{repo.owner}/{repo.repo}/{id}`

**Purpose:**
- Ensures global uniqueness across all catalog servers
- Used for server discovery and routing
- Maps to catalog file structure: `catalog/{owner}/{repo}/{subdirectory}/manifest.json`

---

### repo

**Type:** `object`
**Required:** Yes
**Used in:** `manifest.json` only

Repository metadata identifying the source code location for the MCP server. Required for catalog servers to enable cloning, building, and versioning.

**Schema:**
```typescript
{
  provider: string,    // Git provider domain
  owner: string,       // Repository owner/organization
  repo: string,        // Repository name
  branch: string,      // Git branch to use
  url: string         // Complete repository URL
}
```

**Example:**
```json
"repo": {
  "provider": "github.com",
  "owner": "devflowinc",
  "repo": "trieve",
  "branch": "main",
  "url": "https://github.com/devflowinc/trieve"
}
```

**Field Details:**

- **provider**: Git hosting service domain (e.g., `github.com`, `gitlab.com`)
- **owner**: GitHub username or organization name
- **repo**: Repository name
- **branch**: Git branch containing the server code (typically `main` or `master`)
- **url**: Full HTTPS URL to the repository

**Notes:**
- For custom servers in `servers/`, this information is inferred from the monorepo context
- The `url` should be publicly accessible for catalog servers
- The `branch` determines which version of the code is built

---

### config

**Type:** `object`
**Required:** Yes
**Used in:** Both `manifest.json` and `metorial.json`

Configuration schema defining how users provide runtime configuration to the MCP server. Supports environment variables, CLI arguments, and file-based configuration.

**Schema:**
```typescript
{
  argumentsTemplate: string | null | undefined,
  configValues: Array<{
    title: string,
    description: string | null | undefined,
    default: string | null | undefined,
    required: boolean,
    fields: Array<{
      type: 'environment' | 'cli' | 'file',
      key: string
    }>
  }>
}
```

**Example:**
```json
"config": {
  "argumentsTemplate": null,
  "configValues": [
    {
      "title": "api-key",
      "description": "API key for authentication",
      "default": null,
      "required": true,
      "fields": [
        {
          "type": "environment",
          "key": "API_KEY"
        }
      ]
    },
    {
      "title": "endpoint",
      "description": "API endpoint URL",
      "default": "https://api.example.com",
      "required": false,
      "fields": [
        {
          "type": "environment",
          "key": "API_ENDPOINT"
        },
        {
          "type": "cli",
          "key": "--endpoint"
        }
      ]
    }
  ]
}
```

**Field Details:**

- **argumentsTemplate** (optional/nullable): Template string for CLI arguments passed to the server
- **configValues** (required): Array of configuration parameters

**ConfigValue Object:**
- **title** (required): Configuration parameter name (kebab-case recommended)
- **description** (optional/nullable): Human-readable description of the parameter
- **default** (optional/nullable): Default value if not provided by user
- **required** (required): Boolean indicating if this parameter must be provided
- **fields** (required): Array of field mappings showing how this value is passed to the server

**Field Object:**
- **type** (required): How the value is passed - `"environment"` (env var), `"cli"` (CLI argument), or `"file"` (config file)
- **key** (required): The environment variable name, CLI flag, or file key

**Common Patterns:**

```json
// Environment variable only
{
  "title": "github-token",
  "required": true,
  "fields": [{ "type": "environment", "key": "GITHUB_TOKEN" }]
}

// Multiple field types for same value
{
  "title": "api-url",
  "required": false,
  "default": "https://api.default.com",
  "fields": [
    { "type": "environment", "key": "API_URL" },
    { "type": "cli", "key": "--api-url" }
  ]
}
```

**Complete Example with All Field Types:**

```json
{
  "config": {
    "argumentsTemplate": null,
    "configValues": [
      {
        "title": "api-key",
        "description": "API key for authentication",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "environment",
            "key": "API_KEY"
          }
        ]
      },
      {
        "title": "user-token",
        "description": "User authentication token",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "cli",
            "key": "--user-token"
          }
        ]
      },
      {
        "title": "config-path",
        "description": "Path to configuration file",
        "default": "~/.config/app/config.json",
        "required": false,
        "fields": [
          {
            "type": "file",
            "key": "configPath"
          }
        ]
      },
      {
        "title": "endpoint",
        "description": "API endpoint URL (supports multiple input methods)",
        "default": "https://api.example.com",
        "required": false,
        "fields": [
          {
            "type": "environment",
            "key": "API_ENDPOINT"
          },
          {
            "type": "cli",
            "key": "--endpoint"
          },
          {
            "type": "file",
            "key": "endpoint"
          }
        ]
      }
    ]
  }
}
```

This example demonstrates:
- **Environment variable** (`API_KEY`) - typically for secrets
- **CLI argument** (`--user-token`) - for command-line configuration
- **File-based** (`configPath`) - for file path references
- **Multiple types** (`endpoint`) - allowing flexible configuration from any source

---

### subdirectory

**Type:** `string`
**Required:** Yes
**Used in:** `manifest.json` only

The path within the repository where the MCP server code is located. Used to clone only the relevant portion of the repository for building.

**Examples:**
```json
"subdirectory": "clients/mcp-server"
"subdirectory": "packages/github-mcp"
"subdirectory": "."
```

**Conventions:**
- Use relative paths from repository root
- Use `"."` for servers at repository root
- Use forward slashes `/` for path separators (cross-platform)
- Should match the directory containing `package.json` or equivalent

**Purpose:**
- Enables monorepo support (multiple servers per repository)
- Optimizes builds by cloning only necessary code
- Maps to catalog structure: `catalog/{owner}/{repo}/{subdirectory}/manifest.json`

---

### title

**Type:** `string`
**Required:** Yes
**Used in:** Both `manifest.json` and `metorial.json` (as `name`)

Human-readable display name for the MCP server. Shown in user interfaces, catalogs, and documentation.

**Examples:**
```json
"title": "GitHub MCP Server"
"title": "trieve-mcp-server"
"title": "Google Calendar Integration"
```

**Conventions:**
- Use clear, descriptive names
- Include "MCP Server" suffix when appropriate
- Can use spaces, hyphens, or other readable formatting
- Should be unique enough to distinguish from similar servers

**Note:** In `metorial.json` files (custom servers), this field is named `name` instead of `title`.

---

### description

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Used in:** Both `manifest.json` and `metorial.json`

Detailed description of the MCP server's functionality, features, and use cases. Displayed in catalogs and documentation to help users understand the server's purpose.

**Examples:**
```json
"description": "A Model Context Protocol (MCP) server for Trieve API"
"description": "Provides tools for GitHub repository management, issue tracking, and PR workflows"
"description": null
```

**Best Practices:**
- Keep concise but informative (1-3 sentences)
- Mention key features or integrations
- Avoid marketing language, focus on functionality
- Can be `null` if the title is self-explanatory

---

### build

**Type:** `object | null | undefined`
**Required:** No (optional/nullable)
**Used in:** Both `manifest.json` and `metorial.json`

Build configuration for containerizing the MCP server using Docker and Nixpacks. Specifies runtime requirements, commands, dependencies, and platform targets.

**Schema:**
```typescript
{
  startCommand: string | null | undefined,
  buildCommand: string | null | undefined,
  installCommand: string | null | undefined,
  nodeVersion: string | null | undefined,
  pythonVersion: string | null | undefined,
  buildDir: string | null | undefined,
  nixPackages: Array<string> | null | undefined,
  aptPackages: Array<string> | null | undefined,
  platforms: Array<'linux/arm64' | 'linux/amd64'> | null | undefined
}
```

**Example:**
```json
"build": {
  "startCommand": "node dist/index.js",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "nodeVersion": "20",
  "pythonVersion": null,
  "buildDir": null,
  "nixPackages": ["git"],
  "aptPackages": null,
  "platforms": ["linux/amd64", "linux/arm64"]
}
```

**Field Details:**

#### startCommand

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** Auto-detected based on runtime

The command executed to start the MCP server in the container. This is the container's entrypoint.

**Auto-detection behavior:**
- Node.js: `npm start` (from package.json)
- Deno: `deno run --allow-all` (from deno.json)
- Python: `python main.py` (from requirements.txt)

**Examples:**
```json
"startCommand": "node dist/index.js"
"startCommand": "deno run --allow-all server.ts"
"startCommand": "python -m server.main"
"startCommand": null  // Use auto-detection
```

**When to specify:**
- Custom entry point not following conventions
- Specific runtime flags needed
- Non-standard directory structure

---

#### buildCommand

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** Auto-detected based on runtime

The command executed during the build phase to compile or transpile the server code.

**Auto-detection behavior:**
- TypeScript projects: `npm run build` or `tsc`
- Python projects: Usually none (no build step)
- Custom build scripts: Detected from package.json scripts

**Examples:**
```json
"buildCommand": "npm run build"
"buildCommand": "tsc"
"buildCommand": "yarn build"
"buildCommand": null  // Use auto-detection or skip build step
```

**When to specify:**
- Custom build script name
- Multi-step build process
- Non-standard compilation requirements

---

#### installCommand

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** Auto-detected based on package manager

The command executed to install dependencies during the container build.

**Auto-detection behavior:**
- Detects from lockfiles: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Node.js: `npm install`, `yarn install`, or `pnpm install`
- Python: `pip install -r requirements.txt`

**Examples:**
```json
"installCommand": "npm ci"
"installCommand": "yarn install --frozen-lockfile"
"installCommand": "pip install -r requirements.txt"
"installCommand": null  // Use auto-detection
```

**When to specify:**
- Prefer specific package manager
- Need specific install flags (e.g., `--frozen-lockfile`)
- Custom dependency installation workflow

---

#### nodeVersion

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** `"20"`

The Node.js version to use in the container. Supports major versions or specific semver.

**Examples:**
```json
"nodeVersion": "20"
"nodeVersion": "18"
"nodeVersion": "18.17.0"
"nodeVersion": null  // Use default (20)
```

**Notes:**
- Only applies to Node.js/TypeScript runtimes
- Ignored for Python-only servers
- Can specify exact versions or major versions
- Default (`20`) provides latest LTS features

---

#### pythonVersion

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** `"3.11"`

The Python version to use in the container. Supports major.minor versions or specific patches.

**Examples:**
```json
"pythonVersion": "3.11"
"pythonVersion": "3.9"
"pythonVersion": "3.11.5"
"pythonVersion": null  // Use default (3.11)
```

**Notes:**
- Only applies to Python runtimes
- Ignored for Node.js-only servers
- Can specify major.minor or full versions
- Default (`3.11`) provides modern Python features

---

#### buildDir

**Type:** `string | null | undefined`
**Required:** No (optional/nullable)
**Default:** Uses `subdirectory` value

The directory to use as the build context within the repository. Rarely needed as `subdirectory` is typically sufficient.

**Examples:**
```json
"buildDir": "dist"
"buildDir": "build/output"
"buildDir": null  // Use subdirectory value
```

**When to specify:**
- Build output in different directory than source
- Complex monorepo structure
- Custom build context requirements

**Notes:**
- Most servers can omit this field
- Defaults to the `subdirectory` value
- Relative to repository root

---

#### nixPackages

**Type:** `Array<string> | null | undefined`
**Required:** No (optional/nullable)
**Default:** `[]` (empty array)

Array of Nix package names to install in the container. Used for system-level dependencies available in the Nix package repository.

**Examples:**
```json
"nixPackages": ["git", "curl"]
"nixPackages": ["postgresql", "redis"]
"nixPackages": []  // No additional packages
"nixPackages": null  // No additional packages
```

**Common packages:**
- `git` - Git version control
- `curl` - HTTP client
- `jq` - JSON processor
- `postgresql` - PostgreSQL client
- `redis` - Redis client
- `ffmpeg` - Media processing
- `imagemagick` - Image processing

**When to use:**
- Server requires command-line tools
- System utilities needed at runtime
- Database clients or other services

**Notes:**
- Search available packages at https://search.nixos.org/packages
- Prefer Nix packages over apt packages for reproducibility
- Empty array or null means no additional packages

---

#### aptPackages

**Type:** `Array<string> | null | undefined`
**Required:** No (optional/nullable)
**Default:** `[]` (empty array)

Array of APT package names to install in the container. Used for system libraries not available or outdated in Nix.

**Examples:**
```json
"aptPackages": ["libssl-dev"]
"aptPackages": ["build-essential", "libpq-dev"]
"aptPackages": []  // No additional packages
"aptPackages": null  // No additional packages
```

**Common packages:**
- `libssl-dev` - OpenSSL development files
- `build-essential` - C/C++ compilation tools
- `libpq-dev` - PostgreSQL development files
- `python3-dev` - Python development files
- `pkg-config` - Package configuration tool

**When to use:**
- Native module compilation dependencies
- System libraries for specific packages
- Development headers needed for builds

**Notes:**
- Use sparingly; prefer nixPackages when possible
- Adds to build time and image size
- Empty array or null means no additional packages

---

#### platforms

**Type:** `Array<'linux/arm64' | 'linux/amd64'> | null | undefined`
**Required:** No (optional/nullable)
**Default:** `["linux/amd64", "linux/arm64"]` (both platforms)

Target CPU architectures for multi-platform container builds. Determines which platforms the server can run on.

**Examples:**
```json
"platforms": ["linux/amd64", "linux/arm64"]  // Both platforms (default)
"platforms": ["linux/amd64"]  // Intel/AMD only
"platforms": ["linux/arm64"]  // ARM only (Apple Silicon, AWS Graviton)
"platforms": null  // Use default (both platforms)
```

**Platform details:**
- **linux/amd64**: x86_64 architecture (Intel/AMD processors)
  - Standard cloud servers
  - Most desktop/laptop systems
  - Traditional server infrastructure

- **linux/arm64**: ARM64 architecture
  - Apple Silicon (M1/M2/M3)
  - AWS Graviton instances
  - Raspberry Pi 4/5
  - Modern ARM servers

**When to limit platforms:**
- Native dependencies only support one architecture
- Build time optimization (single platform faster)
- Target environment is known and fixed

**Notes:**
- Default builds for both platforms (maximum compatibility)
- Multi-platform builds take longer but increase compatibility
- Most servers should support both platforms

**When to Use:**

- **Omit entirely**: For standard Node.js/TypeScript/Python servers with conventional structure
- **Minimal config**: When only runtime version differs from defaults
- **Full config**: For complex builds requiring system dependencies, multi-stage builds, or custom commands

**Default Behavior (when `build` is null):**

The Metorial build system automatically detects:
- Package manager from lockfiles (`package-lock.json`, `yarn.lock`, `requirements.txt`)
- Runtime from file extensions (`.ts`, `.js`, `.py`)
- Standard install/build/start commands based on ecosystem conventions

**Common Patterns:**

```json
// Node.js with specific version
"build": {
  "nodeVersion": "20"
}

// Python with system dependencies
"build": {
  "pythonVersion": "3.11",
  "nixPackages": ["postgresql"]
}

// Custom build workflow
"build": {
  "installCommand": "yarn install",
  "buildCommand": "yarn build",
  "startCommand": "node dist/server.js",
  "nodeVersion": "20"
}

// Multi-platform with dependencies
"build": {
  "platforms": ["linux/amd64", "linux/arm64"],
  "nixPackages": ["git", "jq"],
  "nodeVersion": "20"
}
```

### Complete Example with All Build Options

Here's a comprehensive example demonstrating all available build configuration options:

**File:** `servers/example-server/metorial.json`

```json
{
  "name": "Example MCP Server",
  "runtime": "typescript.node",
  "build": {
    "startCommand": "node dist/index.js",
    "buildCommand": "npm run build",
    "installCommand": "npm ci --production=false",
    "nodeVersion": "20",
    "pythonVersion": "3.11",
    "buildDir": "dist",
    "nixPackages": ["git", "curl", "jq"],
    "aptPackages": ["libssl-dev", "build-essential"],
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

**What each option does:**

- **startCommand**: Runs the compiled server from the `dist` directory
- **buildCommand**: Executes TypeScript compilation via npm script
- **installCommand**: Installs all dependencies including devDependencies for build
- **nodeVersion**: Uses Node.js 20 (latest LTS)
- **pythonVersion**: Includes Python 3.11 runtime (for hybrid servers)
- **buildDir**: Specifies build output directory
- **nixPackages**: Installs system utilities (git for version control, curl for HTTP, jq for JSON processing)
- **aptPackages**: Adds native libraries (OpenSSL dev files, C++ build tools)
- **platforms**: Builds for both Intel/AMD (amd64) and ARM (arm64) architectures

**Use this complete configuration when:**
- Server requires custom build workflow
- System dependencies (Git, native libraries) are needed
- Specific runtime versions are required
- Multiple platforms must be explicitly supported
- Hybrid runtime (Node.js + Python) is needed

**For most servers:** Omit the `build` section entirely and let auto-detection handle configuration.

---

### Complete Catalog Example with All Fields

For catalog servers (`manifest.json`), here's a comprehensive example demonstrating ALL available schema fields:

**File:** `catalog/example-org/example-repo/example-server/manifest.json`

```json
{
  "id": "example-server",
  "fullId": "example-org/example-repo/example-server",
  "repo": {
    "provider": "github.com",
    "owner": "example-org",
    "repo": "example-repo",
    "branch": "main",
    "url": "https://github.com/example-org/example-repo"
  },
  "config": {
    "argumentsTemplate": "{{API_ENDPOINT}} --verbose",
    "configValues": [
      {
        "title": "api-key",
        "description": "API key for authentication",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "environment",
            "key": "API_KEY"
          }
        ]
      },
      {
        "title": "organization-id",
        "description": "Organization identifier",
        "default": null,
        "required": true,
        "fields": [
          {
            "type": "environment",
            "key": "ORG_ID"
          }
        ]
      },
      {
        "title": "api-endpoint",
        "description": "API endpoint URL",
        "default": "https://api.example.com",
        "required": false,
        "fields": [
          {
            "type": "environment",
            "key": "API_ENDPOINT"
          },
          {
            "type": "cli",
            "key": "{{API_ENDPOINT}}"
          }
        ]
      },
      {
        "title": "config-file",
        "description": "Path to configuration file",
        "default": "~/.config/example/config.json",
        "required": false,
        "fields": [
          {
            "type": "file",
            "key": "configPath"
          }
        ]
      }
    ]
  },
  "subdirectory": "packages/mcp-server",
  "title": "Example MCP Server",
  "description": "A comprehensive Model Context Protocol (MCP) server demonstrating all configuration schema fields. This server provides tools for interacting with the Example API, including resource management, data querying, and webhook integration.",
  "build": {
    "startCommand": "node dist/index.js",
    "buildCommand": "npm run build",
    "installCommand": "npm ci",
    "nodeVersion": "20",
    "pythonVersion": null,
    "buildDir": null,
    "nixPackages": ["git", "curl"],
    "aptPackages": ["libssl-dev"],
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

**What each top-level field does:**

- **id**: Unique identifier within the repository (`example-server`)
- **fullId**: Globally unique identifier across catalog (`example-org/example-repo/example-server`)
- **repo**: Complete repository metadata for cloning and building
  - **provider**: Git hosting service (`github.com`)
  - **owner**: Repository owner/organization (`example-org`)
  - **repo**: Repository name (`example-repo`)
  - **branch**: Git branch to build from (`main`)
  - **url**: Full repository URL for cloning
- **config**: User configuration schema
  - **argumentsTemplate**: Template for CLI arguments passed to server
  - **configValues**: Array of configuration parameters
    - **api-key**: Required environment variable for authentication
    - **organization-id**: Required environment variable for org context
    - **api-endpoint**: Optional endpoint URL (environment + CLI support)
    - **config-file**: Optional file path configuration
- **subdirectory**: Path to server code within repository (`packages/mcp-server`)
- **title**: Human-readable display name (`Example MCP Server`)
- **description**: Detailed functionality description
- **build**: Complete build configuration
  - **startCommand**: Container entrypoint command
  - **buildCommand**: TypeScript compilation command
  - **installCommand**: Dependency installation command
  - **nodeVersion**: Node.js 20 (LTS)
  - **pythonVersion**: Not needed (null)
  - **buildDir**: Use subdirectory (null)
  - **nixPackages**: System utilities (git, curl)
  - **aptPackages**: Native libraries (OpenSSL dev files)
  - **platforms**: Multi-platform support (Intel/AMD + ARM)

**When to use this complete catalog configuration:**

- ✅ Indexing third-party MCP servers in the Metorial catalog
- ✅ Servers from external GitHub repositories
- ✅ Servers requiring explicit repository and build metadata
- ✅ Servers with multiple configuration parameters
- ✅ Servers with system dependencies or custom build workflows
- ✅ Servers targeting multiple CPU architectures

**Contrast with minimal metorial.json:**

Custom servers in the `servers/` directory only need `name` and `runtime` because repository metadata and build configuration are inferred from the monorepo context. Catalog servers require all fields explicitly because they reference external repositories that the build system must clone and configure independently.

---

## Best Practices and Common Patterns

### When to Use Minimal vs Full Schema

The choice between minimal configuration (`metorial.json`) and full schema (`manifest.json`) depends on your server's location and requirements:

#### Use Minimal Configuration (metorial.json) When:

✅ **Building custom servers within the Metorial monorepo**
- Located in `servers/` directory
- Part of the main Metorial repository
- Using standard Metorial SDK patterns
- Repository context can be inferred

✅ **Following standard conventions**
- Using conventional Node.js/TypeScript/Python project structure
- Standard `package.json`, `deno.json`, or `requirements.txt`
- No custom build commands needed
- Auto-detection works for your use case

✅ **Simple runtime requirements**
- Default runtime versions are sufficient
- No native system dependencies
- Standard package manager works (npm, yarn, pip)
- No multi-stage build requirements

**Example minimal configuration:**
```json
{
  "name": "My Custom MCP Server",
  "runtime": "typescript.deno"
}
```

#### Use Full Schema (manifest.json) When:

✅ **Indexing third-party servers in the catalog**
- Located in `catalog/` directory
- From external GitHub repositories
- Repository metadata must be explicit
- Not part of the Metorial monorepo

✅ **Custom build requirements**
- Specific runtime versions needed
- Custom install/build/start commands
- System dependencies required (Nix packages, APT packages)
- Non-standard project structure

✅ **Complex configuration needs**
- Multiple configuration parameters
- OAuth integration required
- File-based configuration
- Custom CLI argument templates

**Example full schema:**
```json
{
  "id": "my-server",
  "fullId": "owner/repo/my-server",
  "repo": { ... },
  "config": { ... },
  "subdirectory": ".",
  "title": "My Server",
  "description": "Server description",
  "build": {
    "nodeVersion": "18",
    "nixPackages": ["git"],
    "platforms": ["linux/amd64"]
  }
}
```

#### Decision Matrix

| Scenario | Configuration Type | Required Fields |
|----------|-------------------|----------------|
| New server in `servers/` directory | Minimal (metorial.json) | `name`, `runtime` |
| Third-party server in catalog | Full (manifest.json) | All schema fields |
| Custom build with system deps | Either (add `build` section) | Base + `build` object |
| Standard TypeScript/Node project | Minimal (metorial.json) | `name`, `runtime` |
| Monorepo with subdirectories | Full (manifest.json) | All fields + `subdirectory` |
| Python server with pip | Minimal (metorial.json) | `name`, `runtime: "python"` |

---

### Handling Native Dependencies

Native dependencies (C/C++ libraries, system tools, compilation tools) require special configuration in the `build` section.

#### Nix Packages vs APT Packages

**Prefer Nix packages (`nixPackages`) when:**
- ✅ Package is available in Nix repository (search at https://search.nixos.org/packages)
- ✅ You need reproducible builds across environments
- ✅ Installing runtime tools or utilities (git, curl, jq)
- ✅ Package has good Nix support

**Use APT packages (`aptPackages`) when:**
- ✅ Package not available or outdated in Nix
- ✅ Installing development headers (e.g., `libssl-dev`, `libpq-dev`)
- ✅ Need specific version only available via APT
- ✅ Building native Node.js modules

#### Common Native Dependency Patterns

**Pattern 1: Node.js with native modules**
```json
{
  "name": "Server with Native Modules",
  "runtime": "typescript.node",
  "build": {
    "aptPackages": ["build-essential", "python3"],
    "nodeVersion": "20"
  }
}
```

**Why:** Many npm packages with native code require C++ build tools (`build-essential`) and Python for node-gyp.

---

**Pattern 2: Database client dependencies**
```json
{
  "name": "PostgreSQL MCP Server",
  "runtime": "typescript.node",
  "build": {
    "nixPackages": ["postgresql"],
    "aptPackages": ["libpq-dev"]
  }
}
```

**Why:**
- `postgresql` (Nix) provides the `psql` command-line tool
- `libpq-dev` (APT) provides development headers for native PostgreSQL bindings

---

**Pattern 3: Image/media processing**
```json
{
  "name": "Image Processing Server",
  "runtime": "typescript.node",
  "build": {
    "nixPackages": ["imagemagick", "ffmpeg"],
    "nodeVersion": "20"
  }
}
```

**Why:** Media processing libraries are well-supported in Nix and don't require APT packages.

---

**Pattern 4: Git operations**
```json
{
  "name": "GitHub MCP Server",
  "runtime": "typescript.deno",
  "build": {
    "nixPackages": ["git"]
  }
}
```

**Why:** Git operations at runtime require the `git` command-line tool.

---

**Pattern 5: Crypto/SSL dependencies**
```json
{
  "name": "Secure API Server",
  "runtime": "typescript.node",
  "build": {
    "aptPackages": ["libssl-dev"],
    "nodeVersion": "20"
  }
}
```

**Why:** Native crypto modules often need OpenSSL development headers.

---

#### Native Dependency Troubleshooting

**Problem:** Build fails with "command not found"
```
Error: git: command not found
```

**Solution:** Add the command to `nixPackages`:
```json
{
  "build": {
    "nixPackages": ["git"]
  }
}
```

---

**Problem:** Build fails with "missing header files"
```
Error: fatal error: openssl/ssl.h: No such file or directory
```

**Solution:** Add development headers to `aptPackages`:
```json
{
  "build": {
    "aptPackages": ["libssl-dev"]
  }
}
```

---

**Problem:** Native module compilation fails
```
Error: node-gyp rebuild failed
```

**Solution:** Add build tools:
```json
{
  "build": {
    "aptPackages": ["build-essential", "python3"],
    "nodeVersion": "20"
  }
}
```

---

### Platform Selection Guidance

The `platforms` field in the `build` section determines which CPU architectures your server supports.

#### Default Behavior

**Default:** `["linux/amd64", "linux/arm64"]` (both platforms)

When `platforms` is omitted or null, the build system creates containers for both architectures, maximizing compatibility.

#### Platform Details

**linux/amd64 (x86_64)**
- Intel and AMD processors
- Most cloud providers (AWS EC2, Google Cloud, Azure)
- Traditional desktop and laptop computers
- Standard CI/CD runners
- **Use case:** Maximum compatibility, standard deployments

**linux/arm64 (aarch64)**
- Apple Silicon (M1, M2, M3, M4 chips)
- AWS Graviton instances
- Raspberry Pi 4/5
- Modern ARM-based servers
- **Use case:** Better performance on ARM, cost savings (Graviton), local development on Apple Silicon

#### When to Build for Both Platforms

✅ **Build for both platforms (default) when:**
- Maximizing compatibility is important
- Server will be deployed to diverse environments
- No platform-specific dependencies
- Pure JavaScript/TypeScript/Python code
- Build time is acceptable (multi-platform builds take 2-3x longer)

**Example:**
```json
{
  "build": {
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

or simply omit the field:
```json
{
  "build": {}
}
```

#### When to Limit to Single Platform

✅ **Build for linux/amd64 only when:**
- Native dependencies don't support ARM64
- Using pre-compiled binaries for x86_64
- Faster builds needed (CI/CD optimization)
- Target deployment is known to be Intel/AMD

**Example:**
```json
{
  "build": {
    "platforms": ["linux/amd64"]
  }
}
```

---

✅ **Build for linux/arm64 only when:**
- Exclusively deploying to ARM environments (AWS Graviton, Apple Silicon)
- Native dependencies are ARM-optimized
- Taking advantage of ARM performance benefits
- Target environment is known to be ARM

**Example:**
```json
{
  "build": {
    "platforms": ["linux/arm64"]
  }
}
```

#### Platform-Specific Dependency Issues

**Problem:** Build fails on ARM64 but succeeds on AMD64
```
Error: No prebuilt binaries available for linux/arm64
```

**Solutions:**

1. **Check if native dependencies support ARM64:**
   - Review package documentation
   - Check npm/PyPI for platform support
   - Search for ARM64-specific issues

2. **Build from source instead of using prebuilt binaries:**
   ```json
   {
     "build": {
       "aptPackages": ["build-essential", "python3"],
       "platforms": ["linux/amd64", "linux/arm64"]
     }
   }
   ```

3. **Limit to AMD64 if ARM64 is not supported:**
   ```json
   {
     "build": {
       "platforms": ["linux/amd64"]
     }
   }
   ```

---

**Problem:** Build takes too long with multi-platform
```
Build time: 15 minutes for dual-platform vs 5 minutes for single
```

**Solution:** If targeting specific environment, use single platform:
```json
{
  "build": {
    "platforms": ["linux/amd64"]  // or ["linux/arm64"] for ARM-only
  }
}
```

#### Platform Selection Decision Tree

```
Do you need ARM support (Apple Silicon, Graviton)?
├─ NO → Use ["linux/amd64"] for faster builds
└─ YES
    └─ Do all dependencies support ARM64?
        ├─ YES → Use both platforms (default) for maximum compatibility
        └─ NO → Can dependencies build from source on ARM?
            ├─ YES → Add build tools to aptPackages, use both platforms
            └─ NO → Use ["linux/amd64"] only
```

---

### Common Errors and Solutions

#### Error: "Invalid runtime specified"

**Problem:**
```
Error: Invalid runtime: "node"
```

**Cause:** Incorrect runtime value in configuration.

**Solution:** Use valid runtime values:
```json
{
  "runtime": "typescript.node"   // ✅ Correct
  // "runtime": "node"           // ❌ Invalid
  // "runtime": "typescript"     // ❌ Invalid
  // "runtime": "deno"           // ❌ Invalid
}
```

**Valid runtimes:**
- `"typescript.deno"`
- `"typescript.node"`
- `"python"`

---

#### Error: "Missing required field"

**Problem:**
```
Error: Missing required field: name
```

**Cause:** Required field omitted from configuration.

**Solution:** Ensure minimum required fields are present:

**For metorial.json:**
```json
{
  "name": "My Server",      // ✅ Required
  "runtime": "typescript.deno"  // ✅ Required
}
```

**For manifest.json:**
```json
{
  "id": "my-server",           // ✅ Required
  "fullId": "owner/repo/id",   // ✅ Required
  "repo": { ... },             // ✅ Required
  "config": { ... },           // ✅ Required
  "subdirectory": ".",         // ✅ Required
  "title": "My Server",        // ✅ Required
  "description": null          // ✅ Required (can be null)
}
```

---

#### Error: "Build command failed"

**Problem:**
```
Error: npm run build failed with exit code 1
```

**Cause:** Build command not appropriate for project or dependencies missing.

**Solution 1:** Let auto-detection handle it (remove custom buildCommand):
```json
{
  "build": {
    // Remove or set to null
    "buildCommand": null
  }
}
```

**Solution 2:** Ensure dependencies are installed first:
```json
{
  "build": {
    "installCommand": "npm ci",
    "buildCommand": "npm run build"
  }
}
```

**Solution 3:** Check that build script exists in package.json:
```json
// package.json
{
  "scripts": {
    "build": "tsc"  // ✅ Script exists
  }
}
```

---

#### Error: "Module not found"

**Problem:**
```
Error: Cannot find module '@metorial/mcp-server-sdk'
```

**Cause:** Dependencies not installed or incorrect install command.

**Solution:** Verify install command and lockfile:
```json
{
  "build": {
    "installCommand": "npm ci"  // For package-lock.json
    // "installCommand": "yarn install"  // For yarn.lock
    // "installCommand": "pnpm install"  // For pnpm-lock.yaml
  }
}
```

---

#### Error: "Platform not supported"

**Problem:**
```
Error: Package 'example-native-module' does not support linux/arm64
```

**Cause:** Native dependency doesn't have ARM64 support.

**Solution 1:** Add build tools to compile from source:
```json
{
  "build": {
    "aptPackages": ["build-essential", "python3"],
    "platforms": ["linux/amd64", "linux/arm64"]
  }
}
```

**Solution 2:** Limit to supported platform:
```json
{
  "build": {
    "platforms": ["linux/amd64"]
  }
}
```

---

#### Error: "Config value type mismatch"

**Problem:**
```
Error: Expected type 'environment' but got 'env'
```

**Cause:** Invalid config field type.

**Solution:** Use correct field types:
```json
{
  "config": {
    "configValues": [
      {
        "fields": [
          { "type": "environment", "key": "API_KEY" },  // ✅ Correct
          // { "type": "env", "key": "API_KEY" }       // ❌ Invalid
          { "type": "cli", "key": "--api-key" },       // ✅ Correct
          { "type": "file", "key": "apiKey" }          // ✅ Correct
        ]
      }
    ]
  }
}
```

**Valid types:**
- `"environment"` - Environment variable
- `"cli"` - Command-line argument
- `"file"` - File-based configuration

---

#### Error: "Invalid fullId format"

**Problem:**
```
Error: fullId must match format: owner/repo/id
```

**Cause:** Incorrect fullId format in manifest.json.

**Solution:** Ensure format matches `{owner}/{repo}/{id}`:
```json
{
  "id": "my-server",
  "fullId": "my-org/my-repo/my-server",  // ✅ Correct: owner/repo/id
  // "fullId": "my-server"               // ❌ Invalid: missing owner/repo
  // "fullId": "my-org/my-server"        // ❌ Invalid: missing repo
  "repo": {
    "owner": "my-org",      // Must match fullId
    "repo": "my-repo"       // Must match fullId
  }
}
```

---

### Additional Best Practices

#### 1. Configuration Naming Conventions

**Use consistent naming patterns:**

```json
{
  "config": {
    "configValues": [
      {
        "title": "api-key",           // ✅ kebab-case for titles
        "fields": [
          { "type": "environment", "key": "API_KEY" },      // ✅ UPPER_SNAKE_CASE for env vars
          { "type": "cli", "key": "--api-key" },            // ✅ kebab-case for CLI flags
          { "type": "file", "key": "apiKey" }               // ✅ camelCase for file keys
        ]
      }
    ]
  }
}
```

#### 2. Version Pinning

**Pin runtime versions for reproducibility:**

```json
{
  "build": {
    "nodeVersion": "20",      // ✅ Specific major version
    // "nodeVersion": "20.10.0"  // ✅ Even more specific (patch version)
    // "nodeVersion": "latest"   // ❌ Avoid - causes inconsistent builds
  }
}
```

#### 3. Minimal Dependencies

**Only include dependencies you actually need:**

```json
{
  "build": {
    "nixPackages": ["git"],                    // ✅ Only if server uses git
    // "nixPackages": ["git", "curl", "jq"]    // ❌ Avoid adding unused packages
    "aptPackages": []                          // ✅ Empty if not needed
  }
}
```

**Why:** Reduces image size, build time, and attack surface.

#### 4. Default Values

**Provide sensible defaults for optional configuration:**

```json
{
  "config": {
    "configValues": [
      {
        "title": "api-endpoint",
        "default": "https://api.example.com",  // ✅ Sensible default
        "required": false,                     // ✅ Optional with default
        "fields": [...]
      },
      {
        "title": "api-key",
        "default": null,      // ✅ No default for secrets
        "required": true,     // ✅ Must be provided by user
        "fields": [...]
      }
    ]
  }
}
```

#### 5. Description Clarity

**Write clear, actionable descriptions:**

```json
{
  "config": {
    "configValues": [
      {
        "title": "github-token",
        "description": "Personal access token with repo scope for GitHub API access",  // ✅ Clear and specific
        // "description": "Token"                                                      // ❌ Too vague
        "required": true,
        "fields": [...]
      }
    ]
  }
}
```

#### 6. OAuth Configuration

**For servers requiring OAuth, document scope requirements:**

```json
{
  "description": "GitHub MCP server with OAuth integration. Required scopes: repo, read:user, read:org"
}
```

#### 7. Testing Configuration Changes

**Always test configuration changes:**

1. **Validate JSON syntax:**
   ```bash
   cat metorial.json | jq .
   ```

2. **Test build locally:**
   ```bash
   bun run build single <server-id>
   ```

3. **Verify runtime requirements:**
   - Check that specified `nodeVersion`/`pythonVersion` is available
   - Confirm `nixPackages` exist in Nix repository
   - Validate `aptPackages` are available in Ubuntu repositories

---

## Summary

### Quick Reference

| Task | Approach |
|------|----------|
| **New custom server** | Use minimal config: `name` + `runtime` |
| **Catalog third-party server** | Use full schema: all fields required |
| **Add system dependencies** | Use `nixPackages` (preferred) or `aptPackages` |
| **Multi-platform support** | Omit `platforms` for both, specify for single |
| **Custom build commands** | Add `build` section with explicit commands |
| **Native modules** | Add `build-essential` and `python3` to `aptPackages` |
| **Database clients** | Use Nix for CLI tools, APT for dev headers |
| **Configuration secrets** | Use environment variables with `required: true` |

### Decision Flow

1. **Start minimal** - Use just `name` and `runtime`
2. **Add build config** - Only if auto-detection doesn't work
3. **Add dependencies** - Only packages you actually need
4. **Limit platforms** - Only if compatibility issues arise
5. **Test incrementally** - Verify each change with local build

### Getting Help

- **Schema validation errors:** Check `packages/manifest/src/types/schema.ts`
- **Build failures:** Review build logs in Docker output
- **Native dependencies:** Search https://search.nixos.org/packages
- **Platform issues:** Check package documentation for architecture support

---

**That's it!** Start with the minimal configuration and only add complexity as needed. The Metorial build system's auto-detection handles most cases automatically.
