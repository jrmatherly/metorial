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

### 3. Testing Your Changes

Before committing, ensure your changes work correctly:

**For new MCP servers:**
- ✅ Run `bun run build single <serverId>` and verify it completes successfully
- ✅ Check that the server appears in `catalog/` with correct manifest
- ✅ Verify all required fields in `metorial.json` are present
- ✅ Test the server container locally (if possible)

**For other changes:**
- ✅ Run relevant build commands to ensure nothing breaks
- ✅ Test the affected functionality
- ✅ Verify no unintended side effects

### 4. Commit Guidelines

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
