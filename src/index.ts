/**
 * The bindings assigned to the Worker.
 * @see {@link https://developers.cloudflare.com/workers/runtime-apis/kv/#referencing-kv-from-workers}
 * @param NAMESPACE_NAME The KV namespace.
 * @example
 * const url = await env.NAMESPACE_NAME.get('URL');
 */
export interface Env {
  NAMESPACE_NAME: KVNamespace;
  ENV_VAR_NAME: string;
}

export default {
  /**
   * The fetch handler is called whenever a client makes a request to the worker endpoint.
   * @see {@link https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#syntax-module-worker}
   * @param request The incoming HTTP request.
   * @param env The bindings assigned to the Worker.
   * @param ctx The context of the Worker.
   * @returns The response outcome to the request.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleFetch({ request, env, ctx });
  },
  /**
   * The scheduled handler is called whenever a scheduled cron event is triggered.
   * @see {@link https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/#syntax-module-worker}
   * @param controller The scheduled event information.
   * @param env The bindings assigned to the Worker.
   * @param ctx The context of the Worker.
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    return handleScheduled({ controller, env, ctx });
  },
};

/**
 * Handle incoming HTTP requests.
 * @param {FetchPayload} payload The payload containing the request, env and ctx.
 * @returns The response outcome to the request.
 */
async function handleFetch({ request, env, ctx }: FetchPayload): Promise<Response> {
  const envVar = env.ENV_VAR_NAME;
  return new Response('Response from worker');
}

/**
 * Handle incoming scheduled cron events.
 * @param {ScheduledPayload} payload The payload containing the controller, env and ctx.
 */
async function handleScheduled({ controller, env, ctx }: ScheduledPayload): Promise<void> {
  return;
}
