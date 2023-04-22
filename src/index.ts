import { Turn } from 'mint-works/dist/turn';
import { SupabaseDatabase } from './database';
import { CreateGamePlayer, applyTurn, createGame, getTurns } from './engine';

/**
 * The bindings assigned to the Worker.
 * @see {@link https://developers.cloudflare.com/workers/runtime-apis/kv/#referencing-kv-from-workers}
 * @param NAMESPACE_NAME The KV namespace.
 * @example
 * const url = await env.NAMESPACE_NAME.get('URL');
 */
export interface Env {
  SUPABASE_URL: KVNamespace;
  SUPABASE_KEY: KVNamespace;
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
};

interface PutTurnBody {
  turn: Turn;
}

interface PostGameBody {
  players: Array<CreateGamePlayer>;
}

/**
 * Handle incoming HTTP requests.
 * @param {FetchPayload} payload The payload containing the request, env and ctx.
 * @returns The response outcome to the request.
 */
async function handleFetch({ request, env }: FetchPayload): Promise<Response> {
  const path = new URL(request.url).pathname;
  const pathArray = path.split('/').filter((item) => item !== '');

  const workerPath = pathArray.shift();
  const servicePath = pathArray.shift();

  if (workerPath !== 'api') return new Response(`${workerPath} Not Found`, { status: 404 });

  const gameId = pathArray[0];

  if (!gameId) return new Response(`Game ID Not Found`, { status: 404 });

  const database = new SupabaseDatabase({ key: env.SUPABASE_URL, url: env.SUPABASE_KEY });

  switch (servicePath) {
    case 'turn': {
      switch (request.method) {
        case 'GET': {
          const turns = await getTurns({
            gameId,
            database,
          });
          return new Response(JSON.stringify(turns), { status: 200 });
        }
        case 'PUT': {
          const { turn }: PutTurnBody = await request.json();
          try {
            await applyTurn({
              gameId,
              turn,
              database,
            });
            return new Response(JSON.stringify({ success: true }), { status: 200 });
          } catch (error) {
            return new Response(JSON.stringify({ success: false, error }), { status: 500 });
          }
        }
        default:
          return new Response(`Invalid Method ${request.method}`, { status: 405 });
      }
    }

    case 'game':
      switch (request.method) {
        case 'POST': {
          const { players }: PostGameBody = await request.json();
          try {
            const gameId = await createGame({
              players,
              database,
            });
            return new Response(JSON.stringify({ gameId }), { status: 200 });
          } catch (error) {
            return new Response(JSON.stringify({ success: false, error }), { status: 500 });
          }
        }
        default:
          return new Response(`Invalid Method ${request.method}`, { status: 405 });
      }

    default:
      return new Response(`${servicePath} Not Found`, { status: 404 });
  }
}
