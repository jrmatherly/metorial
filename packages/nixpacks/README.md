# @metorial-mcp-containers/nixpacks

Utilities for building Docker containers using Nixpacks for MCP servers in the Metorial ecosystem. This package provides functions to build, test, publish, and export containerized MCP servers with multi-platform support.

## Features

- **🐳 Container Building**: Build Docker images using Nixpacks with automatic configuration
- **🏗️ Build Planning**: Generate Nixpacks build plans for server inspection
- **🚀 Publishing**: Push images to container registries with retry logic
- **📦 Export**: Export container images as zip files for distribution
- **🧪 Testing**: Automatic container testing after build
- **🌐 Multi-Platform**: Support for linux/amd64 and linux/arm64 architectures
- **⚙️ CI Mode**: Specialized build mode for continuous integration pipelines
- **🔐 Type-Safe**: Full TypeScript support with type definitions

## Installation

```bash
bun add @metorial-mcp-containers/nixpacks
```

## API Reference

### `nixpacksBuild(id: string, version: string, opts: BuildOptions): Promise<void>`

Builds a Docker container for an MCP server using Nixpacks.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`
- `version` (string): Version string for the build (e.g., "1.0.0")
- `opts` (BuildOptions): Build configuration options
  - `platform` (string, optional): Target platform (e.g., "linux/amd64", "linux/arm64")
  - `publish` (boolean, optional): Whether to push the image to the registry
  - `out` (string, optional): Output directory for build artifacts
  - `ci` (boolean, optional): Enable CI mode for multi-platform builds
  - `export` (string, optional): Path to export container as zip file

**Returns:** Promise that resolves when build completes

**Throws:** Error if build fails or invalid option combinations are used

**Example:**

```typescript
import { nixpacksBuild } from '@metorial-mcp-containers/nixpacks';

// Basic build
await nixpacksBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  {}
);

// Build with platform specification
await nixpacksBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  { platform: 'linux/arm64' }
);

// Build and publish to registry
await nixpacksBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  { publish: true }
);

// CI mode for multi-platform builds
await nixpacksBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  { ci: true, platform: 'linux/amd64' }
);

// Build and export as zip
await nixpacksBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  { export: './dist/github-server.zip' }
);
```

**Build Process:**

1. Reads server manifest and prepares build directory
2. Generates Nixpacks configuration from manifest
3. Runs Nixpacks build with appropriate options
4. In CI mode: Creates buildx instance and builds for specified platform
5. Tests the built container by running it briefly
6. Optionally publishes to container registry with retry logic
7. Optionally exports container filesystem as zip file

**Container Naming:**

Built containers are tagged with:
- `ghcr.io/metorial/mcp-container--{owner}--{repo}--{server}:{version}`
- `ghcr.io/metorial/mcp-container--{owner}--{repo}--{server}:latest` (non-CI builds)

### `getContainerName(id: string): string`

Generates a standardized container name for an MCP server.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`

**Returns:** Container registry URL in lowercase

**Example:**

```typescript
import { getContainerName } from '@metorial-mcp-containers/nixpacks';

const name = getContainerName('modelcontextprotocol/servers/github');
console.log(name);
// Output: "ghcr.io/metorial/mcp-container--modelcontextprotocol--servers--github"

const name2 = getContainerName('MyOrg/MyRepo/MyServer');
console.log(name2);
// Output: "ghcr.io/metorial/mcp-container--myorg--myrepo--myserver"
```

**Naming Convention:**
- Namespace: `ghcr.io/metorial/mcp-container--`
- ID parts separated by `--` (double dash)
- All lowercase

### `nixpacksPlan(id: string, version: string): Promise<NixpacksPlan>`

Generates a Nixpacks build plan for an MCP server without building.

**Parameters:**
- `id` (string): Full server ID in format `owner/repo/server`
- `version` (string): Version string for the plan

**Returns:** Promise resolving to a `NixpacksPlan` object

**Example:**

```typescript
import { nixpacksPlan } from '@metorial-mcp-containers/nixpacks';

const plan = await nixpacksPlan('modelcontextprotocol/servers/github', '1.0.0');

console.log('Providers:', plan.providers);
console.log('Build image:', plan.buildImage);
console.log('Start command:', plan.start.cmd);

// Inspect build phases
Object.entries(plan.phases).forEach(([name, phase]) => {
  console.log(`\nPhase: ${name}`);
  console.log('Commands:', phase.cmds);
  console.log('Nix packages:', phase.nixPkgs);
});

// Check environment variables
console.log('\nVariables:', plan.variables);
```

**Use Cases:**
- Debugging build configuration
- Inspecting dependencies and packages
- Understanding build phases
- Validating Nixpacks setup

## Types

### `BuildOptions`

```typescript
interface BuildOptions {
  platform?: string;    // Target platform (e.g., "linux/amd64")
  publish?: boolean;    // Push to registry after build
  out?: string;         // Output directory for artifacts
  ci?: boolean;         // Enable CI mode for buildx
  export?: string;      // Path to export zip file
}
```

**Option Constraints:**
- Cannot use `out` and `ci` together
- `ci` mode requires `platform` to be specified
- `export` creates a zip of the container's `/app` directory

### `NixpacksPlan`

```typescript
interface NixpacksPlan {
  providers: string[];              // Detected providers (e.g., ["node"])
  buildImage: string;               // Base build image
  variables: Record<string, string>; // Environment variables
  phases: Record<string, {
    dependsOn: string[];            // Phase dependencies
    cmds: string[];                 // Commands to execute
    cacheDirectories: string[];     // Directories to cache
    paths: string[];                // PATH additions
    nixPkgs: string[];              // Nix packages to install
    nixOverlays: string[];          // Nix overlays to apply
    nixpkgsArchive: string;         // Nixpkgs version
  }>;
  start: {
    cmd: string;                    // Container start command
  };
}
```

## Complete Examples

### Building Multiple Versions

```typescript
import { nixpacksBuild, getContainerName } from '@metorial-mcp-containers/nixpacks';

async function buildMultipleVersions(serverId: string, versions: string[]) {
  const containerName = getContainerName(serverId);
  console.log(`Building ${versions.length} versions for ${containerName}\n`);

  for (const version of versions) {
    try {
      console.log(`Building version ${version}...`);
      await nixpacksBuild(serverId, version, {});
      console.log(`✓ Built ${version}`);
    } catch (error) {
      console.error(`✗ Failed to build ${version}:`, error.message);
    }
  }
}

await buildMultipleVersions('modelcontextprotocol/servers/github', [
  '1.0.0',
  '1.1.0',
  '1.2.0'
]);
```

### Multi-Platform CI Build

```typescript
import { nixpacksBuild } from '@metorial-mcp-containers/nixpacks';

async function buildMultiPlatform(serverId: string, version: string) {
  const platforms = ['linux/amd64', 'linux/arm64'];

  console.log(`Building ${serverId}@${version} for multiple platforms\n`);

  // Build for each platform in parallel
  await Promise.all(
    platforms.map(async (platform) => {
      console.log(`Building for ${platform}...`);
      await nixpacksBuild(serverId, version, {
        ci: true,
        platform
      });
      console.log(`✓ Built for ${platform}`);
    })
  );

  console.log('\n✓ Multi-platform build complete');
}

await buildMultiPlatform('modelcontextprotocol/servers/github', '1.0.0');
```

### Build and Export for Distribution

```typescript
import { nixpacksBuild } from '@metorial-mcp-containers/nixpacks';
import fs from 'fs-extra';

async function buildAndExport(serverId: string, version: string) {
  const exportPath = `./dist/${serverId.replace(/\//g, '-')}-${version}.zip`;

  // Ensure output directory exists
  await fs.ensureDir('./dist');

  console.log(`Building and exporting ${serverId}@${version}...`);

  await nixpacksBuild(serverId, version, {
    export: exportPath
  });

  const stats = await fs.stat(exportPath);
  console.log(`✓ Exported to ${exportPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

await buildAndExport('modelcontextprotocol/servers/github', '1.0.0');
```

### Inspect Build Plan

```typescript
import { nixpacksPlan } from '@metorial-mcp-containers/nixpacks';

async function inspectServer(serverId: string, version: string) {
  const plan = await nixpacksPlan(serverId, version);

  console.log(`Build Plan for ${serverId}@${version}\n`);
  console.log('='.repeat(50));

  // Provider information
  console.log(`\nProviders: ${plan.providers.join(', ')}`);
  console.log(`Build Image: ${plan.buildImage}`);

  // Environment variables
  if (Object.keys(plan.variables).length > 0) {
    console.log('\nEnvironment Variables:');
    Object.entries(plan.variables).forEach(([key, value]) => {
      console.log(`  ${key}=${value}`);
    });
  }

  // Build phases
  console.log('\nBuild Phases:');
  Object.entries(plan.phases).forEach(([name, phase]) => {
    console.log(`\n  ${name}:`);
    if (phase.nixPkgs.length > 0) {
      console.log(`    Nix Packages: ${phase.nixPkgs.join(', ')}`);
    }
    if (phase.cmds.length > 0) {
      console.log(`    Commands:`);
      phase.cmds.forEach(cmd => console.log(`      - ${cmd}`));
    }
  });

  // Start command
  console.log(`\nStart Command: ${plan.start.cmd}`);
}

await inspectServer('modelcontextprotocol/servers/github', '1.0.0');
```

### Build with Error Handling

```typescript
import { nixpacksBuild, nixpacksPlan } from '@metorial-mcp-containers/nixpacks';

async function safeBuild(serverId: string, version: string, publish = false) {
  try {
    // First, validate the build plan
    console.log('Generating build plan...');
    const plan = await nixpacksPlan(serverId, version);

    if (!plan.start.cmd) {
      throw new Error('No start command found in build plan');
    }

    console.log(`✓ Build plan validated`);
    console.log(`  Start command: ${plan.start.cmd}`);
    console.log(`  Providers: ${plan.providers.join(', ')}\n`);

    // Perform the build
    console.log('Building container...');
    await nixpacksBuild(serverId, version, { publish });

    console.log('\n✓ Build successful');

    if (publish) {
      console.log('✓ Published to registry');
    }

    return true;
  } catch (error) {
    console.error('\n✗ Build failed:', error.message);

    // Provide helpful debugging information
    if (error.message.includes('Failed to build')) {
      console.error('\nTroubleshooting:');
      console.error('  - Check server manifest configuration');
      console.error('  - Verify Nixpacks is installed');
      console.error('  - Review build logs above');
    }

    return false;
  }
}

const success = await safeBuild(
  'modelcontextprotocol/servers/github',
  '1.0.0',
  true
);

if (!success) {
  process.exit(1);
}
```

## Best Practices

### Version Tagging

Always use semantic versioning for consistent tagging:

```typescript
// Good: Semantic versions
await nixpacksBuild('owner/repo/server', '1.0.0', {});
await nixpacksBuild('owner/repo/server', '2.1.3', {});

// Avoid: Non-standard versions
await nixpacksBuild('owner/repo/server', 'latest', {}); // Use version numbers
await nixpacksBuild('owner/repo/server', 'dev', {});    // Not recommended
```

### CI/CD Integration

Use CI mode for automated builds in pipelines:

```typescript
// CI pipeline configuration
const isCI = process.env.CI === 'true';
const platform = process.env.BUILD_PLATFORM || 'linux/amd64';

if (isCI) {
  await nixpacksBuild(serverId, version, {
    ci: true,
    platform
  });
} else {
  await nixpacksBuild(serverId, version, {
    publish: false
  });
}
```

### Publishing Strategy

Use retry logic is built-in, but handle rate limits:

```typescript
// Publishing with proper error handling
async function publishServer(serverId: string, version: string) {
  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await nixpacksBuild(serverId, version, { publish: true });
      return;
    } catch (error) {
      attempt++;
      if (error.message.includes('rate limit')) {
        console.log(`Rate limited, waiting before retry ${attempt}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        throw error;
      }
    }
  }
}
```

### Build Validation

Always validate build plans before building:

```typescript
import { nixpacksPlan, nixpacksBuild } from '@metorial-mcp-containers/nixpacks';

async function validateAndBuild(serverId: string, version: string) {
  // Generate plan first
  const plan = await nixpacksPlan(serverId, version);

  // Validate plan
  if (plan.providers.length === 0) {
    throw new Error('No providers detected in build plan');
  }

  if (!plan.start.cmd) {
    throw new Error('No start command in build plan');
  }

  // Build with confidence
  await nixpacksBuild(serverId, version, {});
}
```

### Export for Offline Distribution

When exporting containers, include version information:

```typescript
import { nixpacksBuild, getContainerName } from '@metorial-mcp-containers/nixpacks';
import path from 'path';

async function exportForDistribution(serverId: string, version: string) {
  const containerName = getContainerName(serverId);
  const fileName = `${path.basename(containerName)}-${version}.zip`;
  const exportPath = path.join('./exports', fileName);

  await nixpacksBuild(serverId, version, {
    export: exportPath
  });

  console.log(`Exported: ${fileName}`);
  return exportPath;
}
```

## Error Handling

The `nixpacksBuild` function throws errors for various failure scenarios:

```typescript
import { nixpacksBuild } from '@metorial-mcp-containers/nixpacks';

try {
  await nixpacksBuild('owner/repo/server', '1.0.0', {
    ci: true,
    out: './output'  // Invalid: ci and out together
  });
} catch (error) {
  // Error: "Cannot use out and ci together"
}

try {
  await nixpacksBuild('owner/repo/server', '1.0.0', {
    ci: true  // Invalid: ci without platform
  });
} catch (error) {
  // Error: "Cannot use ci without platform"
}

try {
  await nixpacksBuild('invalid/server/id', '1.0.0', {});
} catch (error) {
  // Error: "Failed to build invalid/server/id (1.0.0)"
}
```

## Related Packages

- [`@metorial-mcp-containers/manifest`](../manifest) - Read server manifests and build configuration
- [`@metorial-mcp-containers/delay`](../delay) - Async delay utility used in build process
- [`@metorial-mcp-containers/repo`](../repo) - Repository URL parsing and management

## Dependencies

This package requires:
- **Nixpacks**: Must be installed globally or available in PATH
- **Docker**: For building and running containers
- **Docker Buildx**: For multi-platform builds (CI mode)

Install Nixpacks:
```bash
# macOS
brew install nixpacks

# Linux
curl -sSL https://nixpacks.com/install.sh | sh

# Or via cargo
cargo install nixpacks
```

## License

MIT
