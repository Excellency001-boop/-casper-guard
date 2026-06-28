import { NextResponse } from 'next/server';
import { getNetworkStatus, getDeFiMarketData, getBalanceViaMcp } from '@/lib/mcp-client';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [status, wallet] = await Promise.all([
      getNetworkStatus(),
      getAgentWallet(),
    ]);

    // Fetch DeFi data and agent balance via CSPR.trade MCP
    // Fetch DeFi data sequentially (uses same MCP session)
    let defiData: Awaited<ReturnType<typeof getDeFiMarketData>> = { source: 'none', tokens: [], pairs: [], mcpServer: 'disconnected' };
    let balanceData: Awaited<ReturnType<typeof getBalanceViaMcp>> = { source: 'none', balance: null };
    try {
      defiData = await getDeFiMarketData();
    } catch { /* best-effort */ }
    try {
      balanceData = await getBalanceViaMcp(wallet.publicKey.toHex());
    } catch { /* best-effort */ }

    return NextResponse.json({
      connected: true,
      timestamp: status.timestamp,
      dataSource: status.source === 'mcp' ? 'CSPR.trade MCP Server' : 'Casper Testnet REST API',
      mcpConnected: status.source === 'mcp',
      mcpServer: status.mcpServer ?? null,
      mcpSessionId: status.mcpSessionId ?? null,
      network: {
        name: 'casper-test',
        blockHeight: status.blockHeight,
        era: status.era,
        lastBlockTimestamp: null,
        proposer: null,
        recentDeployCount: 10,
        recentTransferCount: 5,
      },
      agentWallet: {
        publicKey: wallet.publicKey.toHex(),
        network: 'casper-test',
        balance: balanceData.source === 'mcp' ? balanceData.balance : null,
      },
      defi: {
        source: defiData.source,
        mcpServer: defiData.mcpServer,
        tokenCount: defiData.tokens.length,
        pairCount: defiData.pairs.length,
        tokens: defiData.tokens.slice(0, 5), // top 5
        pairs: defiData.pairs.slice(0, 3),   // top 3
      },
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      timestamp: new Date().toISOString(),
      dataSource: 'offline',
      mcpConnected: false,
      mcpServer: null,
      network: {
        name: 'casper-test',
        blockHeight: 0,
        era: 0,
        lastBlockTimestamp: null,
        proposer: null,
        recentDeployCount: 0,
        recentTransferCount: 0,
      },
      error: String(error),
    });
  }
}
