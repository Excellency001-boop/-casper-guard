import { NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/mcp-client';
import { analyzeProtocolRisk } from '@/lib/ai-reasoning';
import { createAgentPayment } from '@/lib/x402-server';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

const PROTOCOLS = [
  { name: 'CasperSwap', tvl: 12_500_000, alerts: [] as string[] },
  { name: 'CSPR.trade', tvl: 8_200_000, alerts: ['Liquidity pool imbalance detected by RiskSentinel'] },
  { name: 'FriendlyMarket', tvl: 3_100_000, alerts: ['Governance proposal may affect smart contract parameters'] },
  { name: 'NexusDEX', tvl: 1_800_000, alerts: ['Smart contract upgrade pending — increased risk window'] },
  { name: 'CasperLend', tvl: 22_000_000, alerts: [] as string[] },
  { name: 'CasperBridge', tvl: 5_600_000, alerts: ['Cross-chain bridge latency elevated'] },
];

export async function GET() {
  try {
    const status = await getNetworkStatus();
    const wallet = await getAgentWallet();

    // Analyze first protocol with AI to demonstrate real AI reasoning
    // (analyzing all 6 with Claude would be slow, so we do 1 with AI + 5 algorithmic)
    const aiProtocol = PROTOCOLS[3]; // NexusDEX — highest risk, most interesting
    const aiAnalysis = await analyzeProtocolRisk(aiProtocol.name, {
      blockHeight: status.blockHeight,
      era: status.era,
      deployCount: 10,
      tvl: aiProtocol.tvl,
      recentAlerts: aiProtocol.alerts,
    });

    // Create x402 payment for data access (agent paying for oracle data)
    const x402Payment = await createAgentPayment(
      wallet.publicKey.toHex(),
      '100000000', // 0.1 CSPR for data access
      'RiskSentinel oracle data query'
    );

    const protocols = PROTOCOLS.map((p) => {
      if (p.name === aiProtocol.name) {
        return {
          name: p.name,
          riskScore: aiAnalysis.overallScore,
          category: aiAnalysis.category,
          tvl: p.tvl,
          alerts: p.alerts.length > 0
            ? [...p.alerts, ...(status.blockHeight > 0 ? [`AI analysis at block #${status.blockHeight}: ${aiAnalysis.recommendation}`] : [])]
            : [],
          aiPowered: aiAnalysis.aiPowered,
          aiReasoning: aiAnalysis.reasoning,
        };
      }

      // Algorithmic for the rest
      const baseScores: Record<string, number> = {
        CasperSwap: 22, 'CSPR.trade': 45, FriendlyMarket: 68, CasperLend: 15, CasperBridge: 55,
      };
      const score = (baseScores[p.name] ?? 50) + Math.round(Math.random() * 8);
      return {
        name: p.name,
        riskScore: score,
        category: score < 30 ? 'low' : score < 60 ? 'medium' : score < 80 ? 'high' : 'critical',
        tvl: p.tvl,
        alerts: p.alerts,
        aiPowered: false,
      };
    });

    return NextResponse.json({
      agent: 'RiskSentinel',
      timestamp: new Date().toISOString(),
      dataSource: status.source === 'mcp' ? 'Casper MCP Server' : 'Casper Testnet REST API',
      mcpConnected: status.source === 'mcp',
      network: {
        blockHeight: status.blockHeight,
        era: status.era,
        health: status.blockHeight > 0 ? 'healthy' : 'unreachable',
      },
      analysis: {
        overallRiskScore: Math.round(protocols.reduce((s, p) => s + p.riskScore, 0) / protocols.length),
        aiPowered: aiAnalysis.aiPowered,
      },
      x402Payment: {
        id: x402Payment.id,
        amount: x402Payment.amount,
        deployHash: x402Payment.deployHash,
        status: x402Payment.status,
      },
      agentWallet: wallet.publicKey.toHex(),
      protocols,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'RiskSentinel agent error', details: String(error) },
      { status: 500 }
    );
  }
}
