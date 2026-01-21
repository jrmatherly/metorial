/**
 * @metorial/mcp-server-sdk
 *
 * Core SDK for building MCP (Model Context Protocol) servers.
 * Provides utilities for creating servers with OAuth authentication,
 * resource registration, and tool registration.
 *
 * @example
 * ```typescript
 * import { metorial, z } from '@metorial/mcp-server-sdk';
 *
 * interface Config {
 *   token: string;
 * }
 *
 * metorial.createServer<Config>(
 *   { name: 'my-server', version: '1.0.0' },
 *   async (server, config) => {
 *     // Register resources and tools here
 *   }
 * );
 * ```
 */

import { setCallbackHandler } from './callbacks.ts';
import { setOauthHandler } from './oauth.ts';
import { createServer } from './server.ts';

export * from '@modelcontextprotocol/sdk/server/index.js';
export * from '@modelcontextprotocol/sdk/server/mcp.js';

export * from 'zod';

/**
 * The main SDK object providing methods for creating and configuring MCP servers.
 *
 * @property {Function} createServer - Creates an MCP server with typed configuration
 * @property {Function} setOauthHandler - Configures OAuth authentication flow (must be called before createServer)
 * @property {Function} setCallbackHandler - Sets callback handlers for server events
 *
 * @example
 * ```typescript
 * // Create a simple server
 * metorial.createServer<{ apiKey: string }>(
 *   { name: 'my-service', version: '1.0.0' },
 *   async (server, config) => {
 *     server.registerTool('hello', {
 *       title: 'Say Hello',
 *       description: 'Returns a greeting',
 *       inputSchema: { name: z.string() }
 *     }, async ({ name }) => {
 *       return { content: [{ type: 'text', text: `Hello, ${name}!` }] };
 *     });
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Server with OAuth
 * metorial.setOauthHandler({
 *   getAuthForm: () => ({ fields: [] }),
 *   getAuthorizationUrl: async (input) => ({
 *     authorizationUrl: `https://api.example.com/oauth?client_id=${input.clientId}`
 *   }),
 *   handleCallback: async (input) => ({
 *     access_token: 'token',
 *     token_type: 'Bearer'
 *   })
 * });
 *
 * metorial.createServer<{ token: string }>(
 *   { name: 'oauth-server', version: '1.0.0' },
 *   async (server, config) => {
 *     // Use config.token for authenticated requests
 *   }
 * );
 * ```
 */
export let metorial = {
  createServer,
  setOauthHandler,
  setCallbackHandler
};
