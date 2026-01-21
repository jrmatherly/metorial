import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Creates an MCP server instance with typed configuration.
 *
 * This function sets up an MCP (Model Context Protocol) server with the specified
 * metadata and configuration type. It registers the server with the global runtime
 * and invokes the setup callback when the server starts.
 *
 * @template Config - The type of the configuration object that will be passed to the setup callback
 *
 * @param opts - Server metadata
 * @param opts.name - The name of the MCP server
 * @param opts.version - The version of the MCP server (semver format)
 * @param cb - Setup callback function that receives the server instance and parsed configuration.
 *             This is where you should register resources and tools using server.registerResource()
 *             and server.registerTool()
 *
 * @returns A promise that resolves when the server is registered with the runtime
 *
 * @remarks
 * **Behavior:**
 * 1. Registers the server with the global Metorial runtime
 * 2. When started, creates an MCP server instance with the provided metadata
 * 3. Calls the setup callback with the server instance and parsed configuration
 * 4. Returns the configured server to be started on stdio transport
 *
 * The configuration is parsed from environment variables or runtime arguments and
 * passed to your setup callback with full type safety.
 *
 * @example
 * ```typescript
 * interface Config {
 *   token: string;
 *   apiUrl?: string;
 * }
 *
 * metorial.createServer<Config>(
 *   { name: 'my-server', version: '1.0.0' },
 *   async (server, config) => {
 *     // config.token is typed as string
 *     // config.apiUrl is typed as string | undefined
 *
 *     // Register resources and tools here
 *     server.registerTool('example_tool', {
 *       title: 'Example Tool',
 *       description: 'Does something useful',
 *       inputSchema: { /* ... */ }
 *     }, async (params) => {
 *       // Tool implementation
 *       return { content: [{ type: 'text', text: 'Result' }] };
 *     });
 *   }
 * );
 * ```
 */
export let createServer = async <Config>(
  opts: { name: string; version: string },
  cb: (server: McpServer, args: Config) => unknown
) => {
  // @ts-ignore
  globalThis.__metorial_setServer__({
    type: 'metorial.server::v1',
    start: async (args: any) => {
      let server = new McpServer(opts);
      await cb(server, args);
      return server;
    }
  });
};
