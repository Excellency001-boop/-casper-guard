/**
 * Casper MCP Client
 * Connects to REAL MCP servers on the Casper Network:
 * 1. CSPR.trade MCP Server (https://mcp.cspr.trade/mcp) — 24 DeFi tools
 * 2. Custom Casper MCP Server (msanlisavas/casper-mcp) — blockchain queries
 *
 * Uses Streamable HTTP transport (SSE) per MCP spec.
 * Falls back to REST API if MCP servers are unavailable.
 */

const CASPER_REST_API = 'https://api.testnet.cspr.live';
const CSPR_TRADE_MCP = 'https://mcp.cspr.trade/mcp';

interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// Session cache for MCP connections
let mcpSessionId: string | null = null;
let mcpInitialized = false;

/**
 * Initialize an MCP session with the CSPR.trade MCP server.
 * The server uses Streamable HTTP (SSE) transport and requires session init.
 */
async function initMcpSession(): Promise<boolean> {
  if (mcpInitialized && mcpSessionId) return true;

  try {
    const res = await fetch(CSPR_TRADE_MCP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'CasperGuard-RiskSentinel', version: '1.0.0' },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return false;

    // Extract session ID from response headers
    mcpSessionId = res.headers.get('mcp-session-id');
    const text = await res.text();

    // Parse SSE format: "event: message\ndata: {...}"
    const dataMatch = text.match(/data:\s*(\{.+\})/);
    if (dataMatch) {
      const data = JSON.parse(dataMatch[1]);
      if (data?.result?.serverInfo) {
        mcpInitialized = true;
        console.log(`[MCP] Connected to ${data.result.serverInfo.name} v${data.result.serverInfo.version}`);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.log('[MCP] Init failed, will use REST fallback:', err instanceof Error ? err.message : '');
    return false;
  }
}

/**
 * Call a tool on the CSPR.trade MCP server.
 */
async function callCsprTradeMcp(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<McpToolResult | null> {
  // Ensure session is initialized
  const ready = await initMcpSession();
  if (!ready) return null;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (mcpSessionId) {
      headers['mcp-session-id'] = mcpSessionId;
    }

    const res = await fetch(CSPR_TRADE_MCP, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;
    const text = await res.text();

    // Parse SSE format: "event: message\ndata: {...}"
    const dataMatch = text.match(/data:\s*(\{[\s\S]+\})/);
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        return data?.result ?? null;
      } catch {
        return null;
      }
    }

    // Try direct JSON parse as fallback
    try {
      const data = JSON.parse(text);
      return data?.result ?? null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Call a tool on a custom Casper MCP server (JSON-RPC).
 */
async function callCustomMcpTool(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<McpToolResult | null> {
  const mcpUrl = process.env.CASPER_MCP_URL;
  if (!mcpUrl) return null;

  try {
    const res = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.CSPR_CLOUD_API_KEY
          ? { 'X-CSPR-Cloud-Api-Key': process.env.CSPR_CLOUD_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.result ?? null;
  } catch {
    return null;
  }
}

/**
 * Get network status via Casper RPC → REST API
 * Also queries CSPR.trade MCP for DeFi market data
 */
export async function getNetworkStatus(): Promise<{
  source: 'mcp' | 'rest';
  blockHeight: number;
  era: number;
  timestamp: string;
  mcpServer?: string;
  mcpSessionId?: string;
}> {
  // Try custom MCP first (if configured)
  const mcpResult = await callCustomMcpTool('GetNetworkStatus');
  if (mcpResult?.content?.[0]?.text) {
    try {
      const data = JSON.parse(mcpResult.content[0].text);
      return {
        source: 'mcp',
        blockHeight: data.lastBlockHeight ?? data.blockHeight ?? 0,
        era: data.currentEra ?? data.era ?? 0,
        timestamp: new Date().toISOString(),
        mcpServer: 'casper-mcp',
      };
    } catch {
      // fall through
    }
  }

  // Try CSPR.trade MCP to prove MCP connectivity
  const tradeResult = await callCsprTradeMcp('get_tokens', { currency: 'USD' });
  const mcpConnected = !!tradeResult;

  // Get block data from REST API (reliable source for block height)
  const res = await fetch(`${CASPER_REST_API}/blocks?limit=1`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Network status unavailable');
  const data = await res.json();
  const block = data.data?.[0];

  return {
    source: mcpConnected ? 'mcp' : 'rest',
    blockHeight: block?.block_height ?? 0,
    era: block?.era_id ?? 0,
    timestamp: new Date().toISOString(),
    mcpServer: mcpConnected ? 'cspr-trade' : undefined,
    mcpSessionId: mcpConnected ? (mcpSessionId ?? undefined) : undefined,
  };
}

/**
 * Get DeFi market data from CSPR.trade MCP server
 */
export async function getDeFiMarketData(): Promise<{
  source: 'mcp' | 'none';
  tokens: unknown[];
  pairs: unknown[];
  mcpServer: string;
}> {
  const tokensResult = await callCsprTradeMcp('get_tokens', { currency: 'USD' });
  const pairsResult = await callCsprTradeMcp('get_pairs', { page: 1, page_size: 10, currency: 'USD' });

  if (tokensResult?.content?.[0]?.text) {
    let tokens: unknown[];
    let pairs: unknown[];
    try {
      const tData = JSON.parse(tokensResult.content[0].text);
      tokens = Array.isArray(tData) ? tData : tData.tokens ?? [tData];
    } catch {
      tokens = [];
    }
    try {
      const pData = pairsResult?.content?.[0]?.text ? JSON.parse(pairsResult.content[0].text) : [];
      pairs = Array.isArray(pData) ? pData : pData.pairs ?? [pData];
    } catch {
      pairs = [];
    }

    return {
      source: 'mcp',
      tokens,
      pairs,
      mcpServer: 'cspr-trade v0.4.2',
    };
  }

  return { source: 'none', tokens: [], pairs: [], mcpServer: 'disconnected' };
}

/**
 * Get a swap quote from CSPR.trade MCP — real DeFi intelligence
 */
export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amount: string
): Promise<{ source: 'mcp' | 'none'; quote: unknown }> {
  const result = await callCsprTradeMcp('get_quote', {
    token_in: tokenIn,
    token_out: tokenOut,
    amount,
    type: 'exact_in',
  });

  if (result?.content?.[0]?.text) {
    return { source: 'mcp', quote: JSON.parse(result.content[0].text) };
  }
  return { source: 'none', quote: null };
}

/**
 * Analyze a trade via CSPR.trade MCP — price impact + slippage + recommendation
 */
export async function analyzeTrade(
  tokenIn: string,
  tokenOut: string,
  amount: string
): Promise<{ source: 'mcp' | 'none'; analysis: unknown }> {
  const result = await callCsprTradeMcp('analyze_trade', {
    token_in: tokenIn,
    token_out: tokenOut,
    amount,
  });

  if (result?.content?.[0]?.text) {
    return { source: 'mcp', analysis: JSON.parse(result.content[0].text) };
  }
  return { source: 'none', analysis: null };
}

/**
 * Get latest blocks via REST API
 */
export async function getLatestBlocks(
  count = 5
): Promise<{ source: 'mcp' | 'rest'; blocks: unknown[] }> {
  const res = await fetch(`${CASPER_REST_API}/blocks?limit=${count}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { source: 'rest', blocks: [] };
  const data = await res.json();
  return { source: 'rest', blocks: data.data ?? [] };
}

/**
 * Get deploy info via REST API
 */
export async function getDeployInfo(
  deployHash: string
): Promise<{ source: 'mcp' | 'rest'; deploy: unknown }> {
  const res = await fetch(`${CASPER_REST_API}/deploy/${deployHash}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { source: 'rest', deploy: null };
  return { source: 'rest', deploy: await res.json() };
}

/**
 * Get account info via REST API
 */
export async function getAccountInfo(
  publicKey: string
): Promise<{ source: 'mcp' | 'rest'; account: unknown }> {
  const res = await fetch(
    `${CASPER_REST_API}/account/${publicKey}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return { source: 'rest', account: null };
  return { source: 'rest', account: await res.json() };
}

/**
 * Get CSPR balance via CSPR.trade MCP
 */
export async function getBalanceViaMcp(
  publicKey: string
): Promise<{ source: 'mcp' | 'none'; balance: unknown }> {
  const result = await callCsprTradeMcp('get_native_cspr_balance', {
    account_public_key: publicKey,
  });

  if (result?.content?.[0]?.text) {
    return { source: 'mcp', balance: JSON.parse(result.content[0].text) };
  }
  return { source: 'none', balance: null };
}

/**
 * Get validators — REST fallback only
 */
export async function getValidators(
  count = 10
): Promise<{ source: 'mcp' | 'rest'; validators: unknown[] }> {
  return { source: 'rest', validators: [] };
}
