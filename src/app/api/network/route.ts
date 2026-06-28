import { NextResponse } from 'next/server';
import { getNetworkStats } from '@/lib/casper-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getNetworkStats();

    return NextResponse.json({
      connected: stats.blockHeight > 0,
      timestamp: new Date().toISOString(),
      network: {
        name: 'casper-test',
        blockHeight: stats.blockHeight,
        era: stats.era,
        lastBlockTimestamp: stats.timestamp,
        proposer: stats.proposer ? stats.proposer.slice(0, 16) + '...' : null,
        recentDeployCount: stats.recentDeploys.length,
        recentTransferCount: stats.recentTransfers.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: String(error) },
      { status: 500 }
    );
  }
}
