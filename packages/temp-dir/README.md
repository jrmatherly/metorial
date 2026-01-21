# @metorial-mcp-containers/temp-dir

Temporary directory management utility for the Metorial ecosystem. This package provides a simple function for creating temporary directories with automatic cleanup on application shutdown.

## Features

- **🧹 Automatic Cleanup**: Temp directories are automatically removed when cleanup is triggered
- **🎯 Unique Directories**: Each call creates a uniquely named directory using nanoid
- **📁 Isolated Paths**: All temp directories are created under a common `metorial` prefix
- **🔐 Type-Safe**: Full TypeScript support with async/await
- **⚡ Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
bun add @metorial-mcp-containers/temp-dir
```

## Quick Start

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';

// Create a temporary directory
const tempDir = await getTempDir();
// "/tmp/metorial/midx_a1B2c3D4e5F6g7H"

// Use it for file operations
await writeFile(path.join(tempDir, 'data.json'), JSON.stringify(data));

// Cleanup happens automatically on shutdown
// No need to manually remove the directory
```

## API Reference

### `getTempDir(prefix?: string): Promise<string>`

Creates a temporary directory with automatic cleanup registration. The directory is created under `os.tmpdir()/metorial/` with a unique ID generated using nanoid.

**Parameters:**
- `prefix` (string, optional): Prefix for the unique directory name. Default: `"midx"`

**Returns:** Promise<string> - Absolute path to the created temporary directory

**Automatic Cleanup:** The directory is automatically registered for cleanup using `@metorial-mcp-containers/cleanup`. When your application shuts down or cleanup is triggered, the directory and all its contents will be removed.

**Examples:**

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';

// Default prefix (midx)
const tempDir1 = await getTempDir();
// "/tmp/metorial/midx_a1B2c3D4e5F6g7H"

// Custom prefix
const tempDir2 = await getTempDir('build');
// "/tmp/metorial/build_x9Y8z7W6v5U4t3S"

const tempDir3 = await getTempDir('cache');
// "/tmp/metorial/cache_p1Q2r3S4t5U6v7W"
```

## Common Patterns

### Build Artifacts

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function buildProject() {
  const buildDir = await getTempDir('build');

  // Compile assets to temp directory
  await compileSources(buildDir);
  await bundleAssets(buildDir);

  // Read final bundle
  const bundle = await fs.readFile(
    path.join(buildDir, 'bundle.js'),
    'utf-8'
  );

  return bundle;
  // Temp directory automatically cleaned up on shutdown
}
```

### File Processing Pipeline

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function processImages(images: string[]) {
  const workDir = await getTempDir('images');

  for (const image of images) {
    // Download to temp directory
    const tempPath = path.join(workDir, path.basename(image));
    await downloadFile(image, tempPath);

    // Process image
    const processed = await optimizeImage(tempPath);

    // Upload result
    await uploadFile(processed);
  }

  // All temp files cleaned up automatically
}
```

### Test Fixtures

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import { beforeEach, afterEach, test } from 'bun:test';
import { cleanup } from '@metorial-mcp-containers/cleanup';
import path from 'path';
import fs from 'fs-extra';

let testDir: string;

beforeEach(async () => {
  testDir = await getTempDir('test');

  // Create test fixtures
  await fs.writeFile(
    path.join(testDir, 'fixture.json'),
    JSON.stringify({ test: true })
  );
});

afterEach(async () => {
  // Cleanup temp directories
  await cleanup();
});

test('processes fixture file', async () => {
  const fixturePath = path.join(testDir, 'fixture.json');
  const data = await processFile(fixturePath);
  // Test assertions...
});
```

### Archive Extraction

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import { extractTar } from './archive';

async function extractAndProcess(archivePath: string) {
  const extractDir = await getTempDir('extract');

  // Extract archive to temp directory
  await extractTar(archivePath, extractDir);

  // Process extracted files
  const files = await fs.readdir(extractDir);
  const results = await Promise.all(
    files.map(file => processFile(path.join(extractDir, file)))
  );

  return results;
  // Extracted files cleaned up automatically
}
```

### Download and Transform

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function downloadAndConvert(url: string, format: string) {
  const downloadDir = await getTempDir('download');

  // Download file
  const downloadPath = path.join(downloadDir, 'source');
  await downloadFile(url, downloadPath);

  // Convert format
  const outputPath = path.join(downloadDir, `output.${format}`);
  await convertFile(downloadPath, outputPath, format);

  // Read and return converted file
  return await fs.readFile(outputPath);
  // Temp files cleaned up automatically
}
```

### Caching Build Artifacts

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function buildWithCache(sourceFiles: string[]) {
  const cacheDir = await getTempDir('cache');

  const results = [];

  for (const file of sourceFiles) {
    const cacheKey = generateCacheKey(file);
    const cachePath = path.join(cacheDir, cacheKey);

    // Check cache
    if (await fs.pathExists(cachePath)) {
      results.push(await fs.readFile(cachePath, 'utf-8'));
      continue;
    }

    // Build and cache
    const result = await buildFile(file);
    await fs.writeFile(cachePath, result);
    results.push(result);
  }

  return results;
  // Cache directory cleaned up on shutdown
}
```

### Multi-Stage Processing

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function multiStageProcess(input: string) {
  // Each stage gets its own temp directory
  const stage1Dir = await getTempDir('stage1');
  const stage2Dir = await getTempDir('stage2');
  const stage3Dir = await getTempDir('stage3');

  // Stage 1: Parse
  const parsed = await parseInput(input);
  await fs.writeFile(
    path.join(stage1Dir, 'parsed.json'),
    JSON.stringify(parsed)
  );

  // Stage 2: Transform
  const transformed = await transformData(parsed);
  await fs.writeFile(
    path.join(stage2Dir, 'transformed.json'),
    JSON.stringify(transformed)
  );

  // Stage 3: Generate output
  const output = await generateOutput(transformed);
  await fs.writeFile(
    path.join(stage3Dir, 'output.txt'),
    output
  );

  return output;
  // All stage directories cleaned up automatically
}
```

### Temporary Workspace

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function createWorkspace() {
  const workspace = await getTempDir('workspace');

  // Create workspace structure
  await fs.ensureDir(path.join(workspace, 'src'));
  await fs.ensureDir(path.join(workspace, 'dist'));
  await fs.ensureDir(path.join(workspace, 'cache'));

  // Initialize workspace files
  await fs.writeFile(
    path.join(workspace, 'config.json'),
    JSON.stringify({ version: '1.0.0' })
  );

  return {
    root: workspace,
    src: path.join(workspace, 'src'),
    dist: path.join(workspace, 'dist'),
    cache: path.join(workspace, 'cache')
  };
}

// Use workspace
const workspace = await createWorkspace();
await processProject(workspace);
// Entire workspace cleaned up on shutdown
```

## How It Works

The `getTempDir` function combines three key utilities:

```typescript
import { registerCleanup } from '@metorial-mcp-containers/cleanup';
import { generateId } from '@metorial-mcp-containers/id';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

let PREFIX = 'metorial';

export let getTempDir = async (prefix = 'midx') => {
  // Generate unique directory path
  let tempDir = path.join(os.tmpdir(), PREFIX, generateId(prefix));

  // Create directory
  await fs.ensureDir(tempDir);

  // Register automatic cleanup
  registerCleanup(() => fs.remove(tempDir));

  return tempDir;
};
```

**Execution Flow:**

1. **Path Generation**: Combines OS temp directory + `metorial` prefix + unique ID
2. **Directory Creation**: Creates the directory and any necessary parent directories
3. **Cleanup Registration**: Registers cleanup handler to remove directory on shutdown
4. **Return Path**: Returns absolute path to the created directory

**Directory Structure:**

```
/tmp/
└── metorial/
    ├── midx_a1B2c3D4e5F6g7H/
    ├── build_x9Y8z7W6v5U4t3S/
    └── cache_p1Q2r3S4t5U6v7W/
```

## Best Practices

### Use Descriptive Prefixes

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';

// Good: Clear purpose from prefix
const buildDir = await getTempDir('build');
const cacheDir = await getTempDir('cache');
const testDir = await getTempDir('test');

// Less clear: Generic prefixes
const tempDir1 = await getTempDir('temp');
const tempDir2 = await getTempDir('tmp');
```

### Organize Files Within Temp Directories

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function organizedWorkspace() {
  const workspace = await getTempDir('workspace');

  // Create organized structure
  const dirs = {
    input: path.join(workspace, 'input'),
    output: path.join(workspace, 'output'),
    intermediate: path.join(workspace, 'intermediate')
  };

  await Promise.all(
    Object.values(dirs).map(dir => fs.ensureDir(dir))
  );

  return dirs;
}
```

### Handle Cleanup Explicitly in Long-Running Processes

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import { cleanup } from '@metorial-mcp-containers/cleanup';

async function processBatch(batches: any[][]) {
  for (const batch of batches) {
    const tempDir = await getTempDir('batch');

    // Process batch
    await processBatchFiles(batch, tempDir);

    // Cleanup this batch's temp directory immediately
    await cleanup();
    // This frees up disk space between batches
  }
}
```

### Error Handling

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function safeFileProcessing(file: string) {
  const tempDir = await getTempDir('process');

  try {
    const tempPath = path.join(tempDir, 'working');
    await fs.copy(file, tempPath);

    const result = await processFile(tempPath);
    return result;
  } catch (error) {
    console.error('Processing failed:', error);
    // Temp directory still cleaned up automatically
    throw error;
  }
}
```

### Combine Multiple Operations

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import path from 'path';
import fs from 'fs-extra';

async function complexOperation(files: string[]) {
  // Single temp directory for related operations
  const workDir = await getTempDir('complex');

  // Download phase
  const downloadDir = path.join(workDir, 'downloads');
  await fs.ensureDir(downloadDir);
  await Promise.all(
    files.map(file => downloadFile(file, downloadDir))
  );

  // Processing phase
  const processDir = path.join(workDir, 'processed');
  await fs.ensureDir(processDir);
  await processFiles(downloadDir, processDir);

  // Output phase
  const outputDir = path.join(workDir, 'output');
  await fs.ensureDir(outputDir);
  await generateOutput(processDir, outputDir);

  // Return results
  return await fs.readdir(outputDir);
  // Entire work directory cleaned up automatically
}
```

## Performance Considerations

- **Directory Creation**: Uses `fs.ensureDir` which creates parent directories if needed
- **Cleanup**: Cleanup is deferred until shutdown or explicit `cleanup()` call
- **Disk Space**: Each temp directory consumes disk space until cleanup
- **ID Generation**: Uses nanoid for fast, unique directory names
- **OS Temp Directory**: Uses `os.tmpdir()` which respects OS conventions

**Long-Running Processes:**

If your application creates many temporary directories, consider periodic cleanup:

```typescript
import { getTempDir } from '@metorial-mcp-containers/temp-dir';
import { cleanup } from '@metorial-mcp-containers/cleanup';

async function processLargeDataset(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    const tempDir = await getTempDir('item');
    await processItem(items[i], tempDir);

    // Cleanup every 100 items to free disk space
    if (i % 100 === 0) {
      await cleanup();
    }
  }
}
```

## Related Packages

- [`@metorial-mcp-containers/cleanup`](../cleanup) - Cleanup function registry (used internally)
- [`@metorial-mcp-containers/id`](../id) - Unique ID generation (used internally)

## License

MIT
