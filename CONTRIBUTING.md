# Contributing Guide

First off — thank you for your interest in contributing to this project!  
We welcome contributions from everyone and truly appreciate your help in improving our MCP container system or adding new MCP containers.

## What Can You Contribute?

Most contributors want to **add a new MCP server**, and we've made that super easy using a script in the `scripts/add-server` directory.
You may also contribute other things.

## Prerequisites

Before getting started, please make sure you have the following installed:

- [**Bun**](https://bun.sh/) — A fast all-in-one JavaScript runtime
- [**Docker**](https://www.docker.com/) — Used to build and run containerized environments
- [**Nixpacks**](https://nixpacks.com/docs/install) — Used to generate and build container images without needing Dockerfiles

Make sure `docker` and `nixpacks` are accessible from your command line after installation.

## Build Process

The Metorial MCP Containers project uses a sophisticated build system that combines **Nixpacks** and **Docker** to automatically containerize MCP servers without requiring manual Dockerfile creation. Understanding this process will help you troubleshoot issues and optimize your server configuration.

### Architecture Overview

```
┌─────────────────┐
│  metorial.json  │ ← Server configuration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Nixpacks     │ ← Analyzes project, generates build plan
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Docker      │ ← Builds container image
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Container  │ ← Ready to run MCP server
└─────────────────┘
```

### How It Works

**Step 1: Configuration Analysis**

The build system reads your server's configuration from `metorial.json` (for custom servers) or `manifest.json` (for catalog servers). This file specifies:

| Configuration | Purpose | Example |
|---------------|---------|---------|
| **runtime** | Execution environment | `typescript.deno`, `typescript.node`, `python` |
| **build.installCmd** | Custom dependency installation | `bun install --production` |
| **build.startCmd** | Container entry point | `bun run server.ts` |
| **build.aptPkgs** | System packages (apt) | `["git", "curl"]` |
| **build.nixPkgs** | Nix packages | `["postgresql"]` |

**Step 2: Nixpacks Analysis**

Nixpacks automatically detects your project structure and generates an optimized build plan:

- **Detects package manager:** Identifies `package.json`, `requirements.txt`, `Cargo.toml`, etc.
- **Determines runtime:** Selects appropriate Node.js, Python, Deno, or other runtime versions
- **Analyzes dependencies:** Reads lockfiles to ensure reproducible builds
- **Generates providers:** Creates provider chain (e.g., Node.js → Bun → TypeScript)

**Step 3: Docker Image Build**

Docker builds the container image using the Nixpacks-generated plan:

1. **Base image selection:** Pulls appropriate base image for the runtime
2. **Dependency installation:** Runs install commands with caching for faster rebuilds
3. **Code copying:** Adds your server implementation to the container
4. **Environment setup:** Configures runtime environment and paths
5. **Entry point configuration:** Sets up the command that runs when container starts

**Step 4: Validation**

The build system validates the resulting container:

- ✅ Container image created successfully
- ✅ All dependencies installed correctly
- ✅ Entry point is executable
- ✅ MCP server protocol is accessible

### Build Commands

The project provides convenient build commands through Bun scripts:

```bash
# Build a specific server by ID
bun run build single <serverId>

# Build all servers in the catalog
bun run build all

# Verify package versions across workspace
bun run check-versions
```

**Command breakdown:**

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `build single <serverId>` | Builds one server container | During development, testing specific servers |
| `build all` | Builds all catalog servers | Before submitting PR, ensuring no breaking changes |
| `check-versions` | Validates dependency versions | Troubleshooting version conflicts |

### Runtime Options

Choose the runtime that best fits your MCP server's technology stack:

| Runtime | Use Case | Advantages | Example Servers |
|---------|----------|------------|-----------------|
| **typescript.deno** | New TypeScript servers | Secure by default, built-in TypeScript support, modern APIs | Recommended for all new servers |
| **typescript.node** | Node.js-specific dependencies | Full npm ecosystem, maximum compatibility | Servers requiring Node-specific packages |
| **python** | Python-based servers | Python ML/data libraries, extensive package ecosystem | Servers using Python frameworks |

**Minimal configuration example:**

```json
{
  "name": "My MCP Server",
  "runtime": "typescript.deno"
}
```

For most custom servers, just specifying `name` and `runtime` is sufficient. The build system automatically handles:
- Package manager detection
- Dependency installation
- Build command inference
- Container optimization

### Build Optimization

The build system includes several optimizations for faster builds and smaller images:

**Docker layer caching:**
- Dependency layers are cached and reused when code changes but dependencies don't
- Reduces rebuild time from minutes to seconds for iterative development

**Multi-stage builds:**
- Separates build dependencies from runtime dependencies
- Results in smaller final container images

**Nixpacks providers:**
- Optimized provider chain minimizes image size
- Only includes necessary runtime components

### Troubleshooting Builds

Common build issues and their solutions:

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "command not found" during build | Missing system dependency | Add to `build.aptPkgs` or `build.nixPkgs` |
| Module/import errors | Wrong runtime specified | Change `runtime` to match your code |
| Build succeeds, container fails | Incorrect entry point | Verify `build.startCmd` points to correct file |
| Slow builds | No caching | Ensure Docker layer caching is enabled |
| Version conflicts | Mismatched dependencies | Run `bun run check-versions` |

**Debugging workflow:**

1. **Check Nixpacks plan:**
   ```bash
   cd servers/my-server
   nixpacks plan .
   ```

2. **Inspect build logs:**
   ```bash
   bun run build single my-server 2>&1 | tee build.log
   ```

3. **Test locally outside Docker:**
   ```bash
   cd servers/my-server
   bun install
   bun run server.ts
   ```

4. **Validate configuration:**
   - Ensure `metorial.json` follows the schema in `docs/metorial-json-schema.md`
   - Check that all file paths in configuration exist
   - Verify runtime matches your implementation language

### Advanced Configuration

For servers with complex build requirements, you can customize the build process:

```json
{
  "name": "Advanced MCP Server",
  "runtime": "typescript.node",
  "build": {
    "installCmd": "bun install --production && bun run compile",
    "startCmd": "node dist/server.js",
    "aptPkgs": ["git", "build-essential"],
    "nixPkgs": ["postgresql", "redis"]
  }
}
```

**When to use advanced configuration:**
- Your server requires system-level dependencies
- You need custom build steps (compilation, code generation)
- You're optimizing for production deployment
- You need specific database or service binaries

For detailed configuration options, see the **[metorial.json Schema Documentation](docs/metorial-json-schema.md)**.

## Setup Instructions

Follow these steps to get your environment ready and contribute:

1. **Fork this repository**  
   Click the "Fork" button at the top right of the repo page to create your own copy.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
   cd REPO-NAME
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Run the add-server script**
   ```bash
   bun add-server
   ```

5. **Follow the interactive prompts** to configure and create your new MCP server.
   1. Make sure to check the server manifest when prompted.
   2. The `add-server` script will run a test build to ensure everything is set up correctly.
   3. If you encounter any issues during the build, please ensure to fix them before proceeding.
   4. For detailed information about configuring your server's `metorial.json` file, see the **[metorial.json Schema Documentation](docs/metorial-json-schema.md)**.

6. **Verify your addition**
   Check the `catalog/` directory — your new server config should be listed there.

## Development Workflow

Once you've set up your environment, follow this workflow for iterative development:

### 1. Create a Feature Branch

Always work on a dedicated branch for your changes:

```bash
# Create and switch to a new branch
git checkout -b add-<server-name>-server

# Or for other contributions
git checkout -b fix-<issue-description>
git checkout -b feature-<feature-name>
```

### 2. Local Development Loop

Follow this iterative cycle while developing:

| Step | Action | Command |
|------|--------|---------|
| **Edit** | Make changes to your server implementation | Edit files in `servers/<name>/` or `catalog/` |
| **Test Build** | Build your server to verify it works | `bun run build single <serverId>` |
| **Fix Issues** | Address any build errors or warnings | Review build output and fix |
| **Iterate** | Repeat until build succeeds | — |

**Example development cycle:**

```bash
# After making changes to your server
bun run build single my-new-server

# If build fails, fix the issues and try again
# If build succeeds, test the functionality
```

### 3. Testing Your Server Locally

Thorough testing is essential before submitting your changes. The Metorial platform provides multiple ways to test your server implementation.

#### Building Your Server

The primary way to test your server is to build it using Nixpacks and Docker:

```bash
# Build a specific server
bun run build single <serverId>

# Build all servers (useful for ensuring no breaking changes)
bun run build all
```

**What happens during build:**
- Nixpacks analyzes your project structure and dependencies
- A Docker image is generated with the appropriate runtime environment
- Dependencies are installed based on your package manager
- Build scripts are executed if defined in your configuration
- The resulting container is validated for MCP compatibility

**Common build issues and solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with "command not found" | Missing runtime dependency | Add to `build.aptPkgs` or `build.nixPkgs` in metorial.json |
| Module import errors | Incorrect runtime specified | Verify `runtime` field matches your code (typescript.deno vs typescript.node) |
| Build succeeds but container fails to start | Missing environment setup | Check `build.installCmd` and `build.startCmd` configuration |
| Version mismatch errors | Outdated dependencies | Run `bun run check-versions` to verify package versions |

#### Testing with Docker Locally

Once your server builds successfully, you can test the container directly with Docker:

```bash
# Build the server first
bun run build single my-server

# Find the built image
docker images | grep my-server

# Run the container interactively
docker run -it <image-id> /bin/bash

# Or test the MCP server directly with environment variables
docker run -e CONFIG_VAR=value <image-id>
```

**Testing checklist:**
- ✅ Container starts without errors
- ✅ All required dependencies are available inside the container
- ✅ Environment variables are properly passed through
- ✅ MCP server responds to standard MCP protocol messages
- ✅ Tools and resources are registered correctly

#### Using the Test Build Feature

The `add-server` script includes an automatic test build feature that validates your configuration:

**During initial setup:**
```bash
bun add-server
# Follow prompts...
# Script automatically runs test build
# ✅ Build successful! Your server configuration is valid.
```

**Manual test build after changes:**
```bash
# After modifying your server code or configuration
bun run build single <serverId>

# Review the build output for any warnings or errors
# Fix issues and rebuild until successful
```

**What the test build validates:**
- ✅ `metorial.json` or `manifest.json` schema is valid
- ✅ Repository structure matches expected layout
- ✅ Runtime dependencies can be resolved
- ✅ Build commands execute successfully
- ✅ Container image is created without errors
- ✅ Server entry point is accessible

**Debugging failed test builds:**

1. **Check build output:** The build process provides detailed logs about what went wrong
   ```bash
   bun run build single my-server 2>&1 | tee build.log
   ```

2. **Validate configuration:** Ensure your `metorial.json` follows the schema
   ```bash
   # Reference the schema documentation
   cat docs/metorial-json-schema.md
   ```

3. **Inspect the Nixpacks plan:** See what Nixpacks detected
   ```bash
   cd servers/my-server
   nixpacks plan .
   ```

4. **Test dependencies locally:** Verify your code works outside Docker
   ```bash
   cd servers/my-server
   bun install
   bun run server.ts  # or your entry point
   ```

### 4. Testing Your Changes

Before committing, ensure your changes work correctly:

**For new MCP servers:**
- ✅ Run `bun run build single <serverId>` and verify it completes successfully
- ✅ Check that the server appears in `catalog/` with correct manifest
- ✅ Verify all required fields in `metorial.json` are present
- ✅ Test the server container locally using Docker (see section 3 above)
- ✅ Confirm all tools and resources work as expected

**For other changes:**
- ✅ Run relevant build commands to ensure nothing breaks
- ✅ Test the affected functionality
- ✅ Verify no unintended side effects

### 5. Commit Guidelines

Write clear, descriptive commit messages:

**Format:**
```bash
git commit -m "<type>: <short description>"
```

**Common types:**
- `feat:` - New MCP server or feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code improvements without changing functionality

**Examples:**
```bash
git commit -m "feat: Add Stripe MCP server"
git commit -m "fix: Resolve OAuth redirect issue in GitHub server"
git commit -m "docs: Update installation instructions"
git commit -m "chore: Update dependencies"
```

**Best practices:**
- Keep commits focused on a single change
- Write descriptive messages (not just "fix" or "update")
- Reference issue numbers if applicable: `fix: Resolve #123 - OAuth token refresh`

### 6. Code Style and Formatting

This project uses automated code formatting and linting to maintain consistency across the codebase. All contributions should follow these standards.

#### Prettier Configuration

We use [Prettier](https://prettier.io/) for code formatting with the following configuration:

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 95,
  "tabWidth": 2,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "useTabs": false
}
```

**Key formatting rules:**
- **Single quotes** for strings (e.g., `'hello'` not `"hello"`)
- **Semicolons** required at end of statements
- **95 character** line width limit
- **2 spaces** for indentation (no tabs)
- **No trailing commas** in objects/arrays
- **Arrow function parentheses** omitted when possible: `x => x + 1`

**Running Prettier:**
```bash
# Format all files
bun run format

# Check formatting without changing files
bun run format:check
```

#### Markdown Linting

We use [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) to enforce consistent markdown formatting across documentation.

**Key markdown rules:**
- **ATX-style headings** (use `# Heading` not underlined headings)
- **Dash-style lists** (use `- item` not `* item`)
- **2-space list indentation**
- **No trailing whitespace**
- **No hard tabs** (use spaces)
- **Single blank lines** only (no multiple consecutive blank lines)
- **Fenced code blocks** with language specified when applicable
- **Files end with single newline**

**Running markdown linting:**
```bash
# Lint all markdown files
bun run lint:md

# Auto-fix markdown issues where possible
bun run lint:md:fix
```

**Common markdown patterns:**

````markdown
# Use ATX-style headings
## Second level
### Third level

- Use dashes for lists
- Indent nested lists by 2 spaces
  - Like this
  - And this

```bash
# Always specify language for code blocks
npm install
```

**Bold text** uses asterisks, not underscores.
*Italic text* also uses asterisks.
````

**Files excluded from linting:**
- `catalog/**/*.md` - Third-party MCP server documentation
- `node_modules/**` - Dependencies
- Build artifacts in `build/` and `dist/`

#### Before Committing

Ensure your code passes all formatting and linting checks:

```bash
# Run all checks
bun run format:check  # Check Prettier formatting
bun run lint:md       # Check markdown linting

# Auto-fix issues
bun run format        # Fix code formatting
bun run lint:md:fix   # Fix markdown issues
```

**Pre-commit checklist:**
- ✅ Code follows Prettier formatting rules
- ✅ Markdown files pass markdownlint checks
- ✅ No trailing whitespace or hard tabs
- ✅ All files end with a single newline
- ✅ Imports and code structure follow project patterns

### 7. Naming Conventions

This project follows consistent naming conventions across all MCP servers to ensure clarity and maintainability. When implementing your server, please adhere to these standards:

| Element | Convention | Example |
|---------|------------|---------|
| Tool names | snake_case | `create_issue`, `list_repos` |
| Resource names | kebab-case | `pull-request`, `calendar-event` |
| Server directories | kebab-case | `google-calendar`, `github` |
| Config keys | camelCase | `accessToken`, `clientId` |

**Why these conventions matter:**
- **Tool names** use snake_case to match common API and CLI conventions, making them intuitive for users
- **Resource names** use kebab-case to align with URL and REST API patterns
- **Server directories** use kebab-case for consistency with npm package naming and file system compatibility
- **Config keys** use camelCase to follow JavaScript/TypeScript object property conventions

**Example implementation:**

```typescript
// ✅ Correct naming
server.registerTool('create_issue', { ... });
server.registerResource('pull-request', template, opts, handler);

interface Config {
  accessToken: string;
  clientId: string;
}

// ❌ Incorrect naming
server.registerTool('CreateIssue', { ... });  // Should be snake_case
server.registerResource('pullRequest', ...);   // Should be kebab-case
interface Config {
  access_token: string;  // Should be camelCase
}
```

**Consistency is key:** Following these conventions ensures your server integrates seamlessly with the existing ecosystem and provides a predictable experience for users.

## Before You Submit

1. Make sure your code follows any existing conventions and structure.
2. Double-check that your server shows up correctly in the `catalog/` folder.
3. Run the build and fix any errors or warnings.
4. Commit your changes with a clear message:
   ```bash
   git commit -m "Add new MCP server: <name>"
   ```
5. Push your branch to your fork:
   ```bash
   git push origin your-branch-name
   ```

## Opening a Pull Request

- Go to your fork on GitHub.
- Click **"Compare & pull request"**.
- Add a descriptive title and explain what your PR does.
- Hit **"Create pull request"**.

One of the maintainers will review your contribution and work with you to get it merged.

## Need Help?

If you run into issues or have questions:
- Check our [issues](https://github.com/metorial/mcp-containers/issues) page — someone else may have run into the same thing.
- Or feel free to open a new issue!

Thanks again for contributing ❤️
