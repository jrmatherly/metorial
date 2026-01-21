# @metorial-mcp-containers/server-config

Utilities for extracting server configuration from README files in the Metorial ecosystem. This package analyzes repository README files to automatically discover CLI arguments, environment variables, and metadata for MCP servers.

## Features

- **📖 README Parsing**: Extract structured configuration from markdown README files
- **🔍 Smart Detection**: Automatically identifies CLI arguments and environment variables
- **📝 Metadata Extraction**: Parses server title, description, and configuration
- **🎯 MCP Server Blocks**: Recognizes and parses `mcpServers` JSON configuration blocks
- **🧹 Filtering**: Excludes common non-configuration patterns (e.g., HTTP verbs, common words)
- **🔐 Type-Safe**: Full TypeScript support

## Installation

```bash
bun add @metorial-mcp-containers/server-config
```

## API Reference

### `getServerConfigRaw(repoUrl: string, subdirectory: string): Promise<ServerConfigRaw>`

Fetches and parses server configuration from a repository's README file. This is the main entry point for extracting configuration information.

**Parameters:**
- `repoUrl` (string): Git repository URL
- `subdirectory` (string): Path to server directory within the repository

**Returns:** Promise resolving to a `ServerConfigRaw` object with:
- `title` (string | null): Server title extracted from README
- `description` (string | null): Server description from README
- `cliArguments` (object | null): Detected CLI arguments with keys
- `environmentVariables` (array | null): Detected environment variable keys

**Example:**

```typescript
import { getServerConfigRaw } from '@metorial-mcp-containers/server-config';

// Extract configuration from a repository
const config = await getServerConfigRaw(
  'https://github.com/modelcontextprotocol/servers',
  'src/github'
);

console.log(config.title); // "GitHub MCP Server"
console.log(config.description); // "MCP server for GitHub API"

// Access CLI arguments
if (config.cliArguments) {
  config.cliArguments.arguments.forEach(arg => {
    console.log(`CLI arg: ${arg.key}`);
  });
}

// Access environment variables
if (config.environmentVariables) {
  config.environmentVariables.forEach(envVar => {
    console.log(`Env var: ${envVar.key}`);
  });
}
```

**Notes:**
- Automatically searches for README files using common naming conventions (README.md, readme.md, etc.)
- Falls back through parent directories if README not found in subdirectory
- Returns null values for fields that cannot be extracted
- Uses `@metorial-mcp-containers/repo` package for file retrieval

### `parseReadme(readme: string): ParsedReadme`

Parses a README markdown string to extract server configuration. This function handles the actual parsing logic.

**Parameters:**
- `readme` (string): README file content as markdown text

**Returns:** `ParsedReadme` object with:
- `title` (string | null): Extracted server title
- `description` (string | null): Extracted server description
- `cliArguments` (object): Object with `arguments` array
- `environmentVariables` (array): Array of detected environment variables

**Example:**

```typescript
import { parseReadme } from '@metorial-mcp-containers/server-config';

const readmeContent = `
# My MCP Server

This server provides access to My Service API.

## Configuration

Set the following environment variables:
- API_KEY: Your API key
- BASE_URL: Service base URL

Use these CLI arguments:
\`\`\`bash
my-server --api-key YOUR_KEY --base-url https://api.example.com
\`\`\`
`;

const parsed = parseReadme(readmeContent);

console.log(parsed.title); // "My MCP Server"
console.log(parsed.description); // "This server provides access to My Service API."
console.log(parsed.cliArguments.arguments); // [{ key: '--api-key' }, { key: '--base-url' }]
console.log(parsed.environmentVariables); // [{ key: 'API_KEY' }, { key: 'BASE_URL' }]
```

**Parsing Logic:**

1. **Title Extraction**: Searches for:
   - HTML `<h1>` tags: `<h1>Title</h1>`
   - Markdown headers: `# Title`

2. **Description Extraction**: Takes the first non-empty paragraph after the title, excluding:
   - Lines starting with `(`
   - Lines starting with `!` (images)
   - Lines starting with `[` (links)

3. **MCP Server Blocks**: Detects and parses JSON configuration blocks containing `"mcpServers":` key

4. **CLI Arguments**: Extracts patterns like `--argument-name` using regex:
   - Pattern: `--[a-zA-Z0-9][a-zA-Z0-9-_]+`
   - Filters out common non-arguments (e.g., `--help`, `--version`, `--config`)

5. **Environment Variables**: Extracts uppercase patterns with underscores:
   - Pattern: `[A-Z][A-Z0-9_]{5,}` (minimum 6 characters)
   - Filters out common non-variables (e.g., `README`, `LICENSE`, `HTTP` verbs)

**Notes:**
- Returns empty arrays rather than null for missing configuration
- Filters are applied to reduce false positives
- Prioritizes MCP server configuration blocks when present

## Types

### `ServerConfigRaw`

```typescript
interface ServerConfigRaw {
  title: string | null;                // Server title from README
  description: string | null;          // Server description
  cliArguments: {
    arguments: Array<{                 // CLI argument specifications
      key: string;                     // e.g., '--api-key'
    }>;
  } | null;
  environmentVariables: Array<{
    key: string;                       // e.g., 'API_KEY'
  }> | null;
}
```

### `ParsedReadme`

```typescript
interface ParsedReadme {
  title: string | null;
  description: string | null;
  cliArguments: {
    arguments: Array<{ key: string }>;
  };
  environmentVariables: Array<{ key: string }>;
}
```

## Complete Example

```typescript
import { getServerConfigRaw, parseReadme } from '@metorial-mcp-containers/server-config';
import { ensureRepo, getFile } from '@metorial-mcp-containers/repo';

// Example 1: Extract configuration from a repository
async function analyzeServer(repoUrl: string, subdirectory: string) {
  const config = await getServerConfigRaw(repoUrl, subdirectory);

  console.log('=== Server Configuration ===');
  console.log(`Title: ${config.title || 'Unknown'}`);
  console.log(`Description: ${config.description || 'None'}`);

  console.log('\nCLI Arguments:');
  if (config.cliArguments?.arguments.length) {
    config.cliArguments.arguments.forEach(arg => {
      console.log(`  ${arg.key}`);
    });
  } else {
    console.log('  None detected');
  }

  console.log('\nEnvironment Variables:');
  if (config.environmentVariables?.length) {
    config.environmentVariables.forEach(env => {
      console.log(`  ${env.key}`);
    });
  } else {
    console.log('  None detected');
  }

  return config;
}

// Example 2: Parse README directly
async function parseReadmeFile(repoUrl: string, subdirectory: string) {
  // Get README content
  await ensureRepo(repoUrl);
  const readmeContent = await getFile(
    ['README.md', 'readme.md'],
    repoUrl,
    subdirectory
  );

  if (!readmeContent) {
    console.log('No README found');
    return null;
  }

  // Parse the README
  const parsed = parseReadme(readmeContent);

  return parsed;
}

// Example 3: Detect configuration from MCP server block
const readmeWithMCPBlock = `
# GitHub Server

MCP server for GitHub API integration.

## Configuration

\`\`\`json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
\`\`\`
`;

const parsed = parseReadme(readmeWithMCPBlock);
console.log(parsed); // Contains CLI args and env vars from MCP block

// Example 4: Batch analyze multiple servers
async function analyzeAllServers(servers: Array<{ repoUrl: string; subdirectory: string }>) {
  const results = await Promise.all(
    servers.map(async ({ repoUrl, subdirectory }) => {
      try {
        const config = await getServerConfigRaw(repoUrl, subdirectory);
        return {
          success: true,
          repoUrl,
          subdirectory,
          config
        };
      } catch (error) {
        return {
          success: false,
          repoUrl,
          subdirectory,
          error: error.message
        };
      }
    })
  );

  // Summary
  const successful = results.filter(r => r.success);
  console.log(`Analyzed ${successful.length}/${results.length} servers successfully`);

  return results;
}

// Run examples
await analyzeServer(
  'https://github.com/modelcontextprotocol/servers',
  'src/github'
);
```

## Best Practices

### README Format

For best parsing results, structure READMEs like this:

```markdown
# Server Title

Brief description of what the server does.

## Configuration

### Environment Variables

- `API_KEY`: Your API key (required)
- `BASE_URL`: Service base URL (optional)

### CLI Arguments

\`\`\`bash
server --api-key YOUR_KEY --base-url https://api.example.com
\`\`\`
```

### MCP Server Blocks

Include MCP server configuration blocks for precise detection:

```markdown
## Installation

Add to your MCP settings:

\`\`\`json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server.js", "--api-key", "YOUR_KEY"],
      "env": {
        "API_KEY": "your-key-here",
        "DEBUG": "true"
      }
    }
  }
}
\`\`\`
```

### Error Handling

Always handle potential errors when parsing:

```typescript
import { getServerConfigRaw } from '@metorial-mcp-containers/server-config';

async function safeGetConfig(repoUrl: string, subdirectory: string) {
  try {
    const config = await getServerConfigRaw(repoUrl, subdirectory);

    // Check for missing data
    if (!config.title) {
      console.warn('No title found in README');
    }

    if (!config.cliArguments?.arguments.length &&
        !config.environmentVariables?.length) {
      console.warn('No configuration detected');
    }

    return config;
  } catch (error) {
    console.error(`Failed to get config: ${error.message}`);
    return null;
  }
}
```

### Filtering False Positives

The parser automatically filters common false positives:

```typescript
// These are NOT detected as environment variables:
// README, LICENSE, APPDATA, GET, POST, PUT, DELETE, PATCH
// OPTIONS, HEAD, PATH, TEMP, TMP, REQUEST, RESPONSE

// These are NOT detected as CLI arguments:
// --help, --version, --config, --debug, --verbose
// --directory, --init, --quiet, --rm
```

## Common Patterns

### Validate Extracted Configuration

```typescript
import { getServerConfigRaw } from '@metorial-mcp-containers/server-config';

async function validateConfig(repoUrl: string, subdirectory: string) {
  const config = await getServerConfigRaw(repoUrl, subdirectory);

  // Check required fields
  if (!config.title) {
    throw new Error('Server title is required');
  }

  // Validate CLI arguments
  const hasCliArgs = config.cliArguments?.arguments.length > 0;

  // Validate environment variables
  const hasEnvVars = config.environmentVariables?.length > 0;

  if (!hasCliArgs && !hasEnvVars) {
    console.warn('No configuration found - server may not require setup');
  }

  return {
    valid: true,
    hasCliArgs,
    hasEnvVars
  };
}
```

### Merge with Manual Configuration

```typescript
import { getServerConfigRaw } from '@metorial-mcp-containers/server-config';

async function getMergedConfig(
  repoUrl: string,
  subdirectory: string,
  manualConfig: Partial<ServerConfigRaw>
) {
  const autoConfig = await getServerConfigRaw(repoUrl, subdirectory);

  return {
    title: manualConfig.title || autoConfig.title,
    description: manualConfig.description || autoConfig.description,
    cliArguments: manualConfig.cliArguments || autoConfig.cliArguments,
    environmentVariables: manualConfig.environmentVariables || autoConfig.environmentVariables
  };
}
```

### Configuration Comparison

```typescript
import { getServerConfigRaw } from '@metorial-mcp-containers/server-config';

async function compareConfigs(
  repo1: { url: string; path: string },
  repo2: { url: string; path: string }
) {
  const [config1, config2] = await Promise.all([
    getServerConfigRaw(repo1.url, repo1.path),
    getServerConfigRaw(repo2.url, repo2.path)
  ]);

  const cliArgs1 = config1.cliArguments?.arguments.map(a => a.key) || [];
  const cliArgs2 = config2.cliArguments?.arguments.map(a => a.key) || [];

  const envVars1 = config1.environmentVariables?.map(e => e.key) || [];
  const envVars2 = config2.environmentVariables?.map(e => e.key) || [];

  return {
    commonCliArgs: cliArgs1.filter(a => cliArgs2.includes(a)),
    commonEnvVars: envVars1.filter(e => envVars2.includes(e)),
    uniqueToCli1: cliArgs1.filter(a => !cliArgs2.includes(a)),
    uniqueToEnv1: envVars1.filter(e => !envVars2.includes(e))
  };
}
```

## Implementation Details

### README File Discovery

The package searches for README files using these filenames (in order):
- `README.md`
- `README`
- `readme.md`
- `readme`
- `ReadMe.md`
- `ReadMe`
- `readme.txt`
- `README.txt`
- `ReadMe.txt`

### Excluded Patterns

**Environment Variables** (not detected as configuration):
```
README, LICENSE, LICENSES, APPDATA, GET, POST, PUT, DELETE,
PATCH, OPTIONS, HEAD, PATH, TEMP, TMP, RESPONSE, REQUEST,
INSTALL, CHANGELOG, FEATURES, CONTRIBUTING, CONTRIBUTORS, VERSION
```

**CLI Arguments** (not detected as configuration):
```
--directory, --help, --version, --verbose, --quiet,
--debug, --init, --config, --config-file, --config-path,
--config-dir, --rm, --platform, --client
```

## Related Packages

- [`@metorial-mcp-containers/repo`](../repo) - Repository file access
- [`@metorial-mcp-containers/unique`](../unique) - Array deduplication utilities
- [`@metorial-mcp-containers/manifest`](../manifest) - Server manifest management

## License

MIT
