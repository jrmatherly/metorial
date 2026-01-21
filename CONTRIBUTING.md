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

## Debugging and Troubleshooting

This section covers common issues you may encounter while developing MCP servers and their solutions. For build-specific issues, also see the **[Troubleshooting Builds](#troubleshooting-builds)** section above.

### Common Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| **Server not appearing in catalog** | Manifest not generated or invalid | Run `bun add-server` again, verify `catalog/<server-id>/manifest.json` exists |
| **"Module not found" errors** | Missing dependency or incorrect import | Check `package.json`, run `bun install`, verify import paths match actual file locations |
| **OAuth flow not working** | Incorrect redirect URI or missing scopes | Verify `redirectUri` in `setOauthHandler()` matches your OAuth app settings, check required scopes |
| **Server starts but tools not appearing** | Tools not registered or schema errors | Check `registerTool()` calls, validate `inputSchema` follows JSON Schema format |
| **Resource templates not working** | Invalid template syntax | Review `.claude/rules/servers.md` for template syntax, use `{variable}` format |
| **Environment variables not available** | Not passed to container | Check Docker run command includes `-e VAR=value`, verify variable names in config |
| **"Permission denied" errors** | File permissions or Docker access | Check file permissions with `ls -la`, ensure Docker daemon is running |
| **Type errors in TypeScript** | Runtime mismatch or missing types | Verify `runtime` in `metorial.json`, check SDK import: `import { ... } from '@metorial/mcp-server-sdk'` |
| **Container exits immediately** | Entry point error or missing dependencies | Check `build.startCmd` points to correct file, review Docker logs: `docker logs <container-id>` |
| **Rate limiting or API errors** | API configuration or quota issues | Verify API keys/tokens are valid, check API provider's rate limits and quotas |
| **Local test works, container fails** | Environment differences | Ensure all dependencies in `package.json`, check for hardcoded paths, verify runtime matches |
| **Workspace dependency errors** | Version mismatch across packages | Run `bun run check-versions`, update versions in `package.json` to match workspace |

### Debugging Workflow

When you encounter an issue, follow this systematic debugging approach:

**1. Identify the failure point:**
```bash
# Check which stage is failing
bun run build single <serverId>    # Build stage
docker run <image-id>               # Runtime stage
bun run server.ts                   # Local execution
```

**2. Gather diagnostic information:**
```bash
# View detailed build logs
bun run build single <serverId> 2>&1 | tee debug.log

# Inspect Nixpacks detection
cd servers/<server-name>
nixpacks plan .

# Check Docker container logs
docker ps -a                        # Find container ID
docker logs <container-id>          # View logs
docker inspect <container-id>       # View configuration
```

**3. Isolate the problem:**
```bash
# Test dependencies locally
cd servers/<server-name>
bun install
bun run server.ts

# Verify configuration
cat metorial.json                   # Check syntax and values
cat package.json                    # Verify dependencies

# Test inside container
docker run -it <image-id> /bin/bash
# Then run commands manually inside container
```

**4. Common fixes:**

| Symptom | Diagnostic Command | Typical Fix |
|---------|-------------------|-------------|
| Build fails | `nixpacks plan .` | Add missing dependencies to `package.json` |
| Import errors | `bun run server.ts` | Fix import paths or add missing packages |
| Container crashes | `docker logs <id>` | Update `build.startCmd` or add runtime dependencies |
| Missing tools | Test MCP protocol | Check `registerTool()` calls and schemas |
| Configuration errors | `cat metorial.json` | Validate against schema in `docs/metorial-json-schema.md` |

### Getting Help

If you're still stuck after trying these solutions:

**1. Search existing issues:**
```bash
# Check if someone else had the same problem
https://github.com/metorial/mcp-containers/issues
```

**2. Gather information for your issue report:**
- Error messages (full output)
- Build logs (`bun run build single <serverId> 2>&1 | tee build.log`)
- Your `metorial.json` configuration
- Your `package.json` dependencies
- Steps to reproduce the issue
- Expected vs actual behavior

**3. Create a detailed issue:**
- Use a descriptive title: "Build fails with 'command not found' for postgresql"
- Include all diagnostic information from step 2
- Describe what you've already tried
- Tag with appropriate labels (e.g., `bug`, `build-system`, `documentation`)

**4. Ask for clarification:**
- If documentation is unclear, ask for improvements
- If error messages are confusing, request better error handling
- If you're unsure about best practices, ask for guidance

### Quick Reference: Common Commands

Keep these commands handy for quick troubleshooting:

```bash
# Development
bun install                         # Install/update dependencies
bun add-server                      # Interactive server creation
bun run build single <serverId>     # Build specific server
bun run build all                   # Build all servers

# Validation
bun run check-versions              # Verify package versions
bun run format:check                # Check code formatting
bun run lint:md                     # Check markdown formatting

# Debugging
nixpacks plan .                     # Show detected build plan (run in server directory)
docker images                       # List built images
docker ps -a                        # List all containers
docker logs <container-id>          # View container logs
docker run -it <image-id> /bin/bash # Debug inside container

# Cleanup
docker system prune                 # Remove unused containers/images
rm -rf node_modules && bun install  # Fresh dependency install
```

## Before You Submit

Before submitting your pull request, complete this comprehensive checklist to ensure your contribution meets project standards and is ready for review.

### Pre-Submission Checklist

Use this checklist to verify your changes are complete and ready for submission:

#### 1. Code Quality and Conventions

| Check | Description | Command |
|-------|-------------|---------|
| ✅ **Naming conventions** | Tool names use snake_case, resources use kebab-case, config keys use camelCase | Review code manually |
| ✅ **Project patterns** | Code follows existing patterns from similar servers | Compare with reference servers in `servers/` |
| ✅ **No debugging code** | Remove console.log, print statements, or debugging artifacts | `grep -r "console.log" servers/<name>/` |
| ✅ **Error handling** | Proper error handling for API calls and edge cases | Review try-catch blocks and error responses |
| ✅ **TypeScript types** | Interfaces defined, no `any` types without justification | Check for type safety |

#### 2. Build and Testing

| Check | Description | Command |
|-------|-------------|---------|
| ✅ **Build succeeds** | Server builds without errors | `bun run build single <serverId>` |
| ✅ **No warnings** | Build completes without warnings or can explain necessary warnings | Review build output |
| ✅ **Container runs** | Container starts successfully | `docker run <image-id>` |
| ✅ **Local testing** | Server works correctly outside container | `cd servers/<name> && bun run server.ts` |
| ✅ **Dependencies** | All dependencies listed in package.json | Verify imports match dependencies |

#### 3. Configuration and Manifest

| Check | Description | Command |
|-------|-------------|---------|
| ✅ **metorial.json valid** | Configuration follows schema | Compare against `docs/metorial-json-schema.md` |
| ✅ **Runtime correct** | Runtime matches implementation (typescript.deno/node/python) | Check `runtime` field |
| ✅ **Manifest generated** | Server appears in catalog with valid manifest | `cat catalog/<server-id>/manifest.json` |
| ✅ **Required fields** | All required fields present (name, version, description) | Review manifest completeness |

#### 4. Code Formatting

| Check | Description | Command |
|-------|-------------|---------|
| ✅ **Prettier formatted** | Code follows Prettier rules | `bun run format:check` |
| ✅ **Markdown linted** | Documentation passes markdownlint | `bun run lint:md` |
| ✅ **No trailing whitespace** | Files have no trailing whitespace or hard tabs | Automatic with formatters |
| ✅ **Single newline at EOF** | All files end with single newline | Automatic with formatters |

#### 5. Documentation

| Check | Description | Verification |
|-------|-------------|--------------|
| ✅ **README (if needed)** | Custom servers include README if complex | Check `servers/<name>/README.md` |
| ✅ **Inline comments** | Complex logic has explanatory comments | Review code clarity |
| ✅ **Config documented** | Configuration options documented if not obvious | Check interface comments |
| ✅ **OAuth documented** | OAuth scopes and setup documented if applicable | Review OAuth handler |

#### 6. Git and Commits

| Check | Description | Example |
|-------|-------------|---------|
| ✅ **Clear commit messages** | Commits follow type: description format | `feat: Add Stripe MCP server` |
| ✅ **Focused commits** | Each commit represents a single logical change | Review commit history |
| ✅ **No merge commits** | Branch rebased if needed | `git rebase main` |
| ✅ **Feature branch** | Working on dedicated branch | `add-<server-name>-server` |

#### 7. Final Validation

Before pushing, run these commands to catch any remaining issues:

```bash
# Format all code
bun run format

# Fix markdown issues
bun run lint:md:fix

# Verify build succeeds
bun run build single <serverId>

# Check package versions (if you modified dependencies)
bun run check-versions
```

### Quick Pre-Submit Commands

Run this sequence before submitting:

```bash
# Auto-fix formatting issues
bun run format
bun run lint:md:fix

# Validate build
bun run build single <serverId>

# Commit with clear message
git add .
git commit -m "feat: Add <server-name> MCP server"

# Push to your fork
git push origin your-branch-name
```

### Common Pre-Submission Issues

| Issue | How to Fix |
|-------|-----------|
| Build fails | Review build logs, check dependencies, verify runtime configuration |
| Formatting errors | Run `bun run format` and `bun run lint:md:fix` |
| Missing from catalog | Re-run `bun add-server` or manually verify manifest exists |
| Type errors | Check imports from `@metorial/mcp-server-sdk`, verify runtime matches code |
| Container fails to start | Verify `build.startCmd`, test locally first, check Docker logs |

### If Your Checklist is Incomplete

**Don't worry!** It's better to:
- Submit with known issues clearly documented in PR description
- Ask for help in the PR comments
- Iterate based on reviewer feedback

**Example PR note:**
> Note: Build succeeds but I'm not sure if my OAuth scope configuration is optimal. Looking for feedback on the `setOauthHandler()` setup.

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
