/**
 * Result returned by a callback handler after processing an event.
 *
 * When a callback event is processed, the handler should return an object
 * containing the event type and result data, or null if no action is needed.
 *
 * @property {string} type - The type of event that was processed
 * @property {Record<string, any>} result - The result data from processing the event
 */
export type CallbackHandlerResult = {
  type: string;
  result: Record<string, any>;
} | null;

/**
 * Result returned by a polling handler.
 *
 * When polling for events, the handler should return an array of event objects,
 * or null if there are no new events to process.
 */
export type PollingResult = Record<string, any>[] | null;

/**
 * Configures callback handlers for server events.
 *
 * This function sets up handlers for managing webhooks and polling-based events
 * in your MCP server. It supports both push-based callbacks (webhooks) and
 * pull-based polling for events.
 *
 * **Must be called before `metorial.createServer()`.**
 *
 * @param {Object} c - Callback handler configuration
 * @param {Function} [c.install] - Optional handler for webhook installation.
 *   Called when a webhook needs to be registered with an external service.
 *   Receives callbackUrl and callbackId for setting up the webhook.
 * @param {Function} c.handle - Required handler for processing callback events.
 *   Called when a webhook event is received. Must return a CallbackHandlerResult
 *   containing the event type and result data, or null if no action is needed.
 * @param {Function} [c.poll] - Optional handler for polling-based events.
 *   Called periodically to check for new events. Should return an array of events
 *   or null if there are no new events. Can use setState to maintain state between polls.
 *
 * @throws {Error} If the required 'handle' function is not provided
 *
 * @example
 * ```typescript
 * metorial.setCallbackHandler({
 *   install: async ({ callbackUrl, callbackId }) => {
 *     // Register webhook with external service
 *     await api.registerWebhook(callbackUrl);
 *   },
 *   handle: async ({ callbackId, eventId, payload }) => {
 *     // Process incoming webhook event
 *     return {
 *       type: 'notification',
 *       result: { processed: true, data: payload }
 *     };
 *   },
 *   poll: async ({ callbackId, state, setState }) => {
 *     // Poll for new events
 *     const events = await api.getEvents(state.lastEventId);
 *     if (events.length > 0) {
 *       setState({ lastEventId: events[events.length - 1].id });
 *     }
 *     return events;
 *   }
 * });
 * ```
 */
export let setCallbackHandler = (c: {
  install?: (data: { callbackUrl: string; callbackId: string }) => Promise<unknown> | unknown;
  handle?: (data: {
    callbackId: string;
    eventId: string;
    payload: any;
  }) => Promise<CallbackHandlerResult> | CallbackHandlerResult;
  poll?: (data: {
    callbackId: string;
    setState: (v: any) => void;
    state: Record<string, any>;
  }) => Promise<PollingResult> | PollingResult;
}) => {
  if (c.handle === undefined) {
    throw new Error('handle is required');
  }

  // @ts-ignore
  globalThis.__metorial_setCallbackHandler__({
    installHook: c.install,
    handleHook: c.handle,
    pollHook: c.poll
  });
};
