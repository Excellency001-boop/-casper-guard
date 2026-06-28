import { NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/mcp-client';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getNetworkStatus();
    const wallet = await getAgentWallet();

    return NextResponse.json({
      connected: true,
      timestamp: status.timestamp,
      dataSource: status.source === 'mcp' ? 'Casper MCP Server' : 'Casper Testnet REST API',
      mcpConnected: status.source === 'mcp',
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
      },
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      timestamp: new Date().toISOString(),
      dataSource: 'offline',
      mcpConnected: false,
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
