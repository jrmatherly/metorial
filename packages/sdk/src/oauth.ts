/**
 * A form field for OAuth authentication flows.
 *
 * Supports text input, password input, and select dropdown fields.
 * Used by `getAuthForm()` to define custom fields needed for OAuth configuration.
 *
 * @example Text field
 * ```typescript
 * {
 *   type: 'text',
 *   label: 'API Endpoint',
 *   key: 'apiUrl',
 *   isRequired: false,
 *   placeholder: 'https://api.example.com'
 * }
 * ```
 *
 * @example Select field
 * ```typescript
 * {
 *   type: 'select',
 *   label: 'Environment',
 *   key: 'environment',
 *   isRequired: true,
 *   options: [
 *     { label: 'Production', value: 'prod' },
 *     { label: 'Staging', value: 'staging' }
 *   ]
 * }
 * ```
 */
export type FormField =
  | {
      type: 'text' | 'password';
      label: string;
      key: string;
      isRequired?: boolean;
      placeholder?: string;
    }
  | {
      type: 'select';
      label: string;
      key: string;
      isRequired?: boolean;
      options: {
        label: string;
        value: string;
      }[];
    };

/**
 * OAuth authentication form definition.
 *
 * Contains the collection of fields needed for OAuth configuration.
 * Returned by `getAuthForm()` to define custom authentication parameters.
 */
export type Form = {
  fields: FormField[];
};

/**
 * Configures OAuth authentication flow for an MCP server.
 *
 * **Must be called before `metorial.createServer()`.**
 *
 * This function sets up the OAuth handlers that enable the server to authenticate
 * with external services using the OAuth 2.0 protocol. It handles the complete
 * OAuth flow including authorization URL generation, callback handling, and
 * optional token refresh.
 *
 * @param c - OAuth handler configuration object
 * @param c.getAuthForm - Optional function that returns custom form fields needed for OAuth configuration.
 *   These fields will be collected from the user and passed to other handlers via the `fields` parameter.
 * @param c.getAuthorizationUrl - **Required.** Function that generates the OAuth authorization URL.
 *   Receives client credentials, redirect URI, state, and custom fields.
 *   Can return just the URL string or an object with the URL and optional PKCE code verifier.
 * @param c.handleCallback - **Required.** Function that handles the OAuth callback and exchanges
 *   the authorization code for access tokens. Receives the authorization code, client credentials,
 *   and optional code verifier for PKCE flows.
 * @param c.refreshAccessToken - Optional function that refreshes an expired access token using
 *   a refresh token. Only needed if the OAuth provider supports token refresh.
 *
 * @throws {Error} If `getAuthorizationUrl` is not provided
 * @throws {Error} If `handleCallback` is not provided
 *
 * @example Basic OAuth setup
 * ```typescript
 * import { metorial } from '@metorial/mcp-server-sdk';
 *
 * metorial.setOauthHandler({
 *   getAuthorizationUrl: async ({ clientId, redirectUri, state }) => {
 *     const params = new URLSearchParams({
 *       client_id: clientId,
 *       redirect_uri: redirectUri,
 *       state,
 *       response_type: 'code',
 *       scope: 'read write'
 *     });
 *     return `https://oauth.example.com/authorize?${params}`;
 *   },
 *   handleCallback: async ({ clientId, clientSecret, code, redirectUri }) => {
 *     const response = await fetch('https://oauth.example.com/token', {
 *       method: 'POST',
 *       body: JSON.stringify({
 *         client_id: clientId,
 *         client_secret: clientSecret,
 *         code,
 *         redirect_uri: redirectUri,
 *         grant_type: 'authorization_code'
 *       })
 *     });
 *     return response.json();
 *   }
 * });
 *
 * metorial.createServer({ name: 'my-server', version: '1.0.0' }, async (server, config) => {
 *   // Server setup...
 * });
 * ```
 *
 * @example With custom fields and PKCE
 * ```typescript
 * metorial.setOauthHandler({
 *   getAuthForm: () => ({
 *     fields: [
 *       {
 *         type: 'select',
 *         label: 'Environment',
 *         key: 'environment',
 *         isRequired: true,
 *         options: [
 *           { label: 'Production', value: 'prod' },
 *           { label: 'Sandbox', value: 'sandbox' }
 *         ]
 *       }
 *     ]
 *   }),
 *   getAuthorizationUrl: async ({ fields, clientId, redirectUri, state }) => {
 *     const codeVerifier = generateCodeVerifier();
 *     const codeChallenge = await generateCodeChallenge(codeVerifier);
 *     const baseUrl = fields.environment === 'prod'
 *       ? 'https://oauth.example.com'
 *       : 'https://sandbox-oauth.example.com';
 *
 *     return {
 *       authorizationUrl: `${baseUrl}/authorize?client_id=${clientId}&...`,
 *       codeVerifier
 *     };
 *   },
 *   handleCallback: async ({ clientId, clientSecret, code, codeVerifier }) => {
 *     // Exchange code for tokens with PKCE...
 *   },
 *   refreshAccessToken: async ({ refreshToken, clientId, clientSecret }) => {
 *     // Refresh the access token...
 *   }
 * });
 * ```
 */
export let setOauthHandler = (c: {
  getAuthForm?: () => Promise<Form> | Form;
  getAuthorizationUrl: (d: {
    fields: Record<string, string>;
    clientId: string;
    clientSecret: string;
    state: string;
    redirectUri: string;
  }) => Promise<
    | string
    | {
        authorizationUrl: string;
        codeVerifier?: string;
      }
  >;
  handleCallback: (d: {
    fields: Record<string, string>;
    clientId: string;
    clientSecret: string;
    code: string;
    state: string;
    redirectUri: string;
    fullUrl: string;
    codeVerifier?: string;
  }) => Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    [key: string]: any;
  }>;
  refreshAccessToken?: (data: {
    fields: Record<string, string>;
    refreshToken: string;
    redirectUri: string;
    clientId: string;
    clientSecret: string;
  }) => Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    [key: string]: any;
  }>;
}) => {
  if (c.getAuthorizationUrl === undefined) {
    throw new Error('getAuthorizationUrl is required');
  }
  if (c.handleCallback === undefined) {
    throw new Error('handleCallback is required');
  }

  // @ts-ignore
  globalThis.__metorial_setMcpAuth__({
    getAuthForm: c.getAuthForm,
    getAuthorizationUrl: c.getAuthorizationUrl,
    handleCallback: c.handleCallback,
    refreshAccessToken: c.refreshAccessToken
  });
};
