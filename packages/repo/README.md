# @metorial-mcp-containers/repo

Utilities for working with git repositories in the Metorial ecosystem. This package provides functions for cloning, caching, and querying git repositories for server discovery and manifest generation.

## Features

- **📥 Repository Caching**: Clone and cache repositories to temporary directories
- **🌿 Branch Detection**: Automatically detect default branch names
- **📁 Directory Enumeration**: List all directories in a repository
- **🔍 File Search**: Find files in repositories with subdirectory fallback
- **⚡ Performance**: Repository caching prevents redundant clones
- **🔐 Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @metorial-mcp-containers/repo
```

## API Reference

### `ensureRepo(repoUrl: string, commit?: string): Promise<string>`

Clones a git repository to a temporary directory and caches it for future calls. Subsequent calls with the same URL return the cached directory path.

**Parameters:**
- `repoUrl` (string): Git repository URL (HTTPS or SSH)
- `commit` (string, optional): Specific commit hash to checkout

**Returns:** Promise resolving to absolute path of the cloned repository

**Example:**

```typescript
import { ensureRepo } from '@metorial-mcp-containers/repo';

// Clone a repository
const repoPath = await ensureRepo('https://github.com/modelcontextprotocol/servers');
console.log(repoPath); // "/tmp/repo-xyz123"

// Subsequent calls return cached path
const samePath = await ensureRepo('https://github.com/modelcontextprotocol/servers');
console.log(repoPath === samePath); // true

// Clone at specific commit
const commitPath = await ensureRepo(
  'https://github.com/owner/repo',
  'abc123def456'
);
```

**Notes:**
- Repositories are cached in memory for the lifetime of the process
- Uses `@metorial-mcp-containers/temp-dir` for temporary storage
- Automatically handles cloning errors with descriptive messages

### `getDefaultBranch(repoUrl: string): Promise<string>`

Retrieves the default branch name from a git repository without cloning it.

**Parameters:**
- `repoUrl` (string): Git repository URL

**Returns:** Promise resolving to the default branch name (e.g., "main", "master")

**Throws:** Error if no default branch is found

**Example:**

```typescript
import { getDefaultBranch } from '@metorial-mcp-containers/repo';

// Get default branch
const branch = await getDefaultBranch('https://github.com/modelcontextprotocol/servers');
console.log(branch); // "main"

// Handle different conventions
const legacyBranch = await getDefaultBranch('https://github.com/older/repo');
console.log(legacyBranch); // "master"

// Use in repository operations
try {
  const defaultBranch = await getDefaultBranch(repoUrl);
  console.log(`Cloning from ${defaultBranch} branch`);
} catch (error) {
  console.error('Could not determine default branch:', error.message);
}
```

**Notes:**
- Uses `git ls-remote --symref` to query remote repository
- Does not require cloning the repository
- Fast operation suitable for repository discovery

### `getDirsInRepo(repoUrl: string): Promise<string[]>`

Lists all directories in a repository. Clones the repository using `ensureRepo` if not already cached.

**Parameters:**
- `repoUrl` (string): Git repository URL

**Returns:** Promise resolving to array of relative directory paths (excluding the repository root)

**Example:**

```typescript
import { getDirsInRepo } from '@metorial-mcp-containers/repo';

// List all directories
const dirs = await getDirsInRepo('https://github.com/modelcontextprotocol/servers');

console.log(dirs);
// [
//   '/src',
//   '/src/github',
//   '/src/gitlab',
//   '/packages',
//   '/packages/client',
//   ...
// ]

// Filter for specific patterns
const serverDirs = dirs.filter(d => d.includes('/servers/'));

// Count subdirectories
const srcDirs = dirs.filter(d => d.startsWith('/src/')).length;
console.log(`Found ${srcDirs} directories in src/`);
```

**Notes:**
- Uses `klaw` for efficient directory traversal
- Paths are relative to repository root, starting with `/`
- Excludes the root directory itself
- Repository is cached after first call

### `getFile(fileNames: string[], repoUrl: string, subdirectory: string): Promise<string | null>`

Searches for a file in a repository, starting from a subdirectory and working up to the root. Returns the first matching file content found.

**Parameters:**
- `fileNames` (string[]): Array of file names to search for (e.g., `['package.json', 'metorial.json']`)
- `repoUrl` (string): Git repository URL
- `subdirectory` (string): Starting subdirectory path (relative to repository root)

**Returns:** Promise resolving to file content as UTF-8 string, or `null` if no file found

**Example:**

```typescript
import { getFile } from '@metorial-mcp-containers/repo';

// Find package.json starting from deep subdirectory
const packageJson = await getFile(
  ['package.json'],
  'https://github.com/modelcontextprotocol/servers',
  'packages/github/src'
);

if (packageJson) {
  const pkg = JSON.parse(packageJson);
  console.log(pkg.name); // "@modelcontextprotocol/server-github"
}

// Search for multiple file names
const config = await getFile(
  ['metorial.json', 'mcp.json', 'config.json'],
  repoUrl,
  'src/server'
);

// Search with fallback behavior
const readme = await getFile(
  ['README.md'],
  repoUrl,
  'packages/deeply/nested/path'
);
// Searches: packages/deeply/nested/path/README.md
//           packages/deeply/nested/README.md
//           packages/deeply/README.md
//           packages/README.md
//           README.md (at root)
```

**Notes:**
- Searches from deepest subdirectory to root
- Tries each file name at each directory level
- Returns first match found
- Returns `null` if no file found at any level
- Useful for finding configuration files in monorepos

## Common Patterns

### Repository Discovery

```typescript
import {
  ensureRepo,
  getDefaultBranch,
  getDirsInRepo,
  getFile
} from '@metorial-mcp-containers/repo';

async function discoverServers(repoUrl: string) {
  // Get default branch for reference
  const branch = await getDefaultBranch(repoUrl);
  console.log(`Scanning ${branch} branch`);

  // Clone repository
  const repoPath = await ensureRepo(repoUrl);
  console.log(`Repository cloned to ${repoPath}`);

  // Find all directories
  const dirs = await getDirsInRepo(repoUrl);

  // Search for server manifests
  const servers = [];

  for (const dir of dirs) {
    const manifest = await getFile(
      ['metorial.json', 'mcp.json'],
      repoUrl,
      dir
    );

    if (manifest) {
      servers.push({
        path: dir,
        config: JSON.parse(manifest)
      });
    }
  }

  console.log(`Found ${servers.length} servers`);
  return servers;
}
```

### Configuration File Loading

```typescript
import { getFile } from '@metorial-mcp-containers/repo';

async function loadServerConfig(repoUrl: string, serverPath: string) {
  // Try multiple config file names
  const configFiles = [
    'metorial.json',
    'mcp.json',
    'package.json'
  ];

  const content = await getFile(configFiles, repoUrl, serverPath);

  if (!content) {
    throw new Error(`No configuration found at ${serverPath}`);
  }

  return JSON.parse(content);
}

// Usage
const config = await loadServerConfig(
  'https://github.com/owner/repo',
  'packages/my-server'
);
```

### Monorepo Package Discovery

```typescript
import { getDirsInRepo, getFile } from '@metorial-mcp-containers/repo';

async function findPackages(repoUrl: string) {
  const dirs = await getDirsInRepo(repoUrl);

  // Filter directories that likely contain packages
  const packageDirs = dirs.filter(d =>
    d.includes('/packages/') || d.includes('/servers/')
  );

  // Check each for package.json
  const packages = [];

  for (const dir of packageDirs) {
    const packageJson = await getFile(['package.json'], repoUrl, dir);

    if (packageJson) {
      const pkg = JSON.parse(packageJson);
      packages.push({
        path: dir,
        name: pkg.name,
        version: pkg.version
      });
    }
  }

  return packages;
}
```

### Repository Comparison

```typescript
import { getDefaultBranch, getDirsInRepo } from '@metorial-mcp-containers/repo';

async function compareRepositories(repo1: string, repo2: string) {
  // Compare default branches
  const [branch1, branch2] = await Promise.all([
    getDefaultBranch(repo1),
    getDefaultBranch(repo2)
  ]);

  console.log(`${repo1}: ${branch1}`);
  console.log(`${repo2}: ${branch2}`);

  // Compare directory structures
  const [dirs1, dirs2] = await Promise.all([
    getDirsInRepo(repo1),
    getDirsInRepo(repo2)
  ]);

  const commonDirs = dirs1.filter(d => dirs2.includes(d));
  const uniqueToRepo1 = dirs1.filter(d => !dirs2.includes(d));
  const uniqueToRepo2 = dirs2.filter(d => !dirs1.includes(d));

  return {
    common: commonDirs.length,
    uniqueToFirst: uniqueToRepo1.length,
    uniqueToSecond: uniqueToRepo2.length
  };
}
```

## Best Practices

### Repository URL Formats

Both HTTPS and SSH URLs are supported:

```typescript
// HTTPS (preferred for public repositories)
await ensureRepo('https://github.com/owner/repo');

// SSH (for private repositories with SSH keys)
await ensureRepo('git@github.com:owner/repo.git');

// GitLab
await ensureRepo('https://gitlab.com/owner/repo');

// Self-hosted
await ensureRepo('https://git.company.com/team/project');
```

### Error Handling

Always handle potential errors when working with repositories:

```typescript
import { ensureRepo, getFile } from '@metorial-mcp-containers/repo';

async function safeGetFile(
  files: string[],
  repoUrl: string,
  subdirectory: string
) {
  try {
    // Ensure repository is accessible
    await ensureRepo(repoUrl);

    const content = await getFile(files, repoUrl, subdirectory);

    if (!content) {
      console.warn(`No files found: ${files.join(', ')}`);
      return null;
    }

    return content;
  } catch (error) {
    console.error(`Failed to access repository: ${error.message}`);
    return null;
  }
}
```

### Performance Optimization

Leverage repository caching for multiple operations:

```typescript
import { ensureRepo, getDirsInRepo, getFile } from '@metorial-mcp-containers/repo';

async function multipleOperations(repoUrl: string) {
  // First call clones the repository
  await ensureRepo(repoUrl);

  // Subsequent operations use cached clone (fast!)
  const dirs = await getDirsInRepo(repoUrl); // Uses cache
  const readme = await getFile(['README.md'], repoUrl, ''); // Uses cache

  // All operations share the same cloned repository
}
```

### File Search Strategy

Use specific-to-general file name ordering:

```typescript
import { getFile } from '@metorial-mcp-containers/repo';

// Good: Try specific config files first, fallback to generic
const config = await getFile(
  ['metorial.json', 'mcp.json', 'config.json', 'package.json'],
  repoUrl,
  subdirectory
);

// Bad: Generic files might not contain needed information
const config = await getFile(
  ['package.json', 'config.json'], // Too generic first
  repoUrl,
  subdirectory
);
```

## Related Packages

- [`@metorial-mcp-containers/temp-dir`](../temp-dir) - Temporary directory management
- [`@metorial-mcp-containers/manifest`](../manifest) - Server manifest utilities
- [`@metorial-mcp-containers/case`](../case) - String case conversion utilities

## License

MIT
