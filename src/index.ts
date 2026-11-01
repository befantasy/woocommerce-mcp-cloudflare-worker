import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server.js';

export interface Env {
  WORDPRESS_SITE_URL: string;
  WOOCOMMERCE_CONSUMER_KEY: string;
  WOOCOMMERCE_CONSUMER_SECRET: string;
  WORDPRESS_USERNAME?: string;
  WORDPRESS_APP_PASSWORD?: string;
  MCP_AUTH_TOKEN?: string;
  WOOCOMMERCE_MCP_READ_ONLY?: string;
}

let transportInstance: WebStandardStreamableHTTPServerTransport | null = null;
let serverInstance: ReturnType<typeof createServer> | null = null;

function syncProcessEnv(env: Env) {
  if (typeof process === 'undefined') {
    (globalThis as any).process = { env: {} };
  } else if (!process.env) {
    (process as any).env = {};
  }
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string') {
      process.env[k] = v;
    }
  }
}

async function getOrCreateTransport(): Promise<WebStandardStreamableHTTPServerTransport> {
  if (!transportInstance) {
    transportInstance = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    serverInstance = createServer();
    await serverInstance.connect(transportInstance);
  }
  return transportInstance;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    syncProcessEnv(env);

    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
        },
      });
    }

    // 2. Health check and info page
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify(
          {
            name: 'WooCommerce MCP Server for Cloudflare Workers',
            version: '1.2.0',
            status: 'online',
            endpoint: '/mcp',
            docs: 'Connect your AI clients (Claude Desktop, Cursor, ChatGPT) via Streamable HTTP/SSE to /mcp',
          },
          null,
          2
        ),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 3. MCP Endpoint (/mcp)
    if (url.pathname === '/mcp') {
      // Check Bearer Token if configured
      if (env.MCP_AUTH_TOKEN) {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.MCP_AUTH_TOKEN}`) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing MCP_AUTH_TOKEN' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      const transport = await getOrCreateTransport();
      const response = await transport.handleRequest(request);

      // Ensure CORS headers on the outgoing response
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
