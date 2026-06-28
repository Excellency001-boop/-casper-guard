/**
 * Autonomous Agent API
 *
 * GET  /api/agent           → View agent fleet status + recent run history
 * POST /api/agent           → Execute a full autonomous agent cycle
 * GET  /api/agent?run=true  → Trigger + view a cycle in one call (for demos)
 *
 * Each agent cycle: READ blockchain → ANALYZE risk → DECIDE action → SIGN deploy → LOG receipt
 */
import { NextResponse } from 'next/server';
import { executeAgentCycle, getAgentRunHistory } from '@/lib/agent-loop';
import { getNetworkStatus, getDeFiMarketData } from '@/lib/mcp-client';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const triggerRun = url.searchParams.get('run') === 'true';
  const protocol = url.searchParams.get('protocol') || 'CasperSwap';

  try {
    // If ?run=true, execute an agent cycle first
    let latestRun = null;
    if (triggerRun) {
      latestRun = await executeAgentCycle(protocol);
    }

    // Get live state for the fleet overview
    const [networkStatus, wallet] = await Promise.all([
      getNetworkStatus(),
      getAgentWallet(),
    ]);

    const history = getAgentRunHistory();

    return NextResponse.json({
      fleet: {
        name: 'CasperGuard Agent Fleet',
        type: 'autonomous-defi-insurance',
        protocol: 'Model Context Protocol (MCP)',
        network: 'casper-test',
        mcpConnected: networkStatus.source === 'mcp',
        mcpServer: networkStatus.mcpServer ?? null,
        blockHeight: networkStatus.blockHeight,
        era: networkStatus.era,
        agentWallet: wallet.publicKey.toHex(),
      },
      agents: [
        {
          name: 'RiskSentinel',
          role: 'Autonomous risk monitor — reads blockchain state, analyzes protocol risk, signs on-chain actions',
          status: 'active',
          capabilities: [
            'READ: Live blockchain data via CSPR.trade MCP (24 tools)',
            'ANALYZE: Protocol risk scoring with 4 weighted factors',
            'DECIDE: Threshold-based action selection (routine/adjust/emergency)',
            'ACT: Sign real Casper deploys with cryptographic proof',
            'LOG: Full reasoning chain with verifiable receipts',
          ],
          totalRuns: history.length,
          lastRun: history[0]?.timestamp ?? null,
        },
        {
          name: 'ClaimProcessor',
          role: 'Processes insurance claims with evidence verification and risk correlation',
          status: 'active',
          capabilities: ['Claim intake', 'Evidence hash verification', 'Risk correlation', 'Payout recommendation'],
        },
        {
          name: 'PolicyOptimizer',
          role: 'Optimizes insurance premiums based on real-time DeFi market data',
          status: 'active',
          capabilities: ['Premium calculation', 'Market data analysis via MCP', 'Rate adjustment'],
        },
        {
          name: 'ComplianceGuard',
          role: 'Monitors regulatory compliance and policy adherence',
          status: 'active',
          capabilities: ['Policy validation', 'Reserve ratio monitoring', 'Audit trail'],
        },
      ],
      // Latest triggered run (if ?run=true)
      ...(latestRun ? { latestRun } : {}),
      // Run history
      runHistory: history.slice(0, 10),
      // How to use
      usage: {
        viewFleet: 'GET /api/agent',
        triggerCycle: 'GET /api/agent?run=true',
        triggerWithProtocol: 'GET /api/agent?run=true&protocol=NexusDEX',
        postCycle: 'POST /api/agent { "protocol": "CasperSwap" }',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Agent fleet error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const protocol = (body as { protocol?: string }).protocol || 'CasperSwap';

    // Execute a full autonomous agent cycle
    const run = await executeAgentCycle(protocol);

    return NextResponse.json({
      message: 'Autonomous agent cycle completed',
      run,
      // Include history
      totalRuns: getAgentRunHistory().length,
      recentRuns: getAgentRunHistory().slice(0, 5),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Agent cycle error', details: String(error) },
      { status: 500 }
    );
  }
}
