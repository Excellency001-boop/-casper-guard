/**
 * Casper MCP Client
 * Connects to the Casper MCP Server (msanlisavas/casper-mcp) via HTTP transport
 * to query on-chain data using the Model Context Protocol.
 *
 * Falls back to REST API if MCP server is unavailable.
 */

const CASPER_REST_API = 'https://api.testnet.cspr.live';

interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Call a Casper MCP tool via direct HTTP JSON-RPC.
 * This implements the MCP protocol over HTTP without needing a persistent connection.
 */
async function callMcpTool(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<McpToolResult | null> {
  const mcpUrl = process.env.CASPER_MCP_URL || 'http://localhost:3001/mcp';

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
 * Get network status via MCP → falls back to REST API
 */
export async function getNetworkStatus(): Promise<{
  source: 'mcp' | 'rest';
  blockHeight: number;
  era: number;
  timestamp: string;
}> {
  // Try MCP first
  const mcpResult = await callMcpTool('GetNetworkStatus');
  if (mcpResult?.content?.[0]?.text) {
    try {
      const data = JSON.parse(mcpResult.content[0].text);
      return {
        source: 'mcp',
        blockHeight: data.lastBlockHeight ?? data.blockHeight ?? 0,
        era: data.currentEra ?? data.era ?? 0,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // fall through
    }
  }

  // Fallback to REST
  const res = await fetch(`${CASPER_REST_API}/blocks?limit=1`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Both MCP and REST failed');
  const data = await res.json();
  const block = data.data?.[0];
  return {
    source: 'rest',
    blockHeight: block?.block_height ?? 0,
    era: block?.era_id ?? 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get latest blocks via MCP → falls back to REST API
 */
export async function getLatestBlocks(
  count = 5
): Promise<{ source: 'mcp' | 'rest'; blocks: unknown[] }> {
  const mcpResult = await callMcpTool('GetLatestBlocks', { count });
  if (mcpResult?.content?.[0]?.text) {
    try {
      const data = JSON.parse(mcpResult.content[0].text);
      return { source: 'mcp', blocks: Array.isArray(data) ? data : data.blocks ?? [data] };
    } catch {
      // fall through
    }
  }

  const res = await fetch(`${CASPER_REST_API}/blocks?limit=${count}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { source: 'rest', blocks: [] };
  const data = await res.json();
  return { source: 'rest', blocks: data.data ?? [] };
}

/**
 * Get deploy info via MCP → falls back to REST API
 */
export async function getDeployInfo(
  deployHash: string
): Promise<{ source: 'mcp' | 'rest'; deploy: unknown }> {
  const mcpResult = await callMcpTool('GetDeploy', { deployHash });
  if (mcpResult?.content?.[0]?.text) {
    try {
      return { source: 'mcp', deploy: JSON.parse(mcpResult.content[0].text) };
    } catch {
      // fall through
    }
  }

  const res = await fetch(`${CASPER_REST_API}/deploy/${deployHash}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { source: 'rest', deploy: null };
  return { source: 'rest', deploy: await res.json() };
}

/**
 * Get account info via MCP → falls back to REST API
 */
export async function getAccountInfo(
  publicKey: string
): Promise<{ source: 'mcp' | 'rest'; account: unknown }> {
  const mcpResult = await callMcpTool('GetAccountInfo', { publicKey });
  if (mcpResult?.content?.[0]?.text) {
    try {
      return { source: 'mcp', account: JSON.parse(mcpResult.content[0].text) };
    } catch {
      // fall through
    }
  }

  const res = await fetch(
    `${CASPER_REST_API}/account/${publicKey}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return { source: 'rest', account: null };
  return { source: 'rest', account: await res.json() };
}

/**
 * Get validators via MCP
 */
export async function getValidators(
  count = 10
): Promise<{ source: 'mcp' | 'rest'; validators: unknown[] }> {
  const mcpResult = await callMcpTool('GetValidators', { count });
  if (mcpResult?.content?.[0]?.text) {
    try {
      const data = JSON.parse(mcpResult.content[0].text);
      return { source: 'mcp', validators: Array.isArray(data) ? data : data.validators ?? [] };
    } catch {
      // fall through
    }
  }
  return { source: 'rest', validators: [] };
}
