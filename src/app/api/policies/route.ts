import { NextResponse } from 'next/server';
import { getLatestBlock } from '@/lib/casper-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holder, protocol, coverage } = body;

    if (!holder || !protocol || !coverage) {
      return NextResponse.json(
        { error: 'Missing required fields: holder, protocol, coverage' },
        { status: 400 }
      );
    }

    const blockResult = await getLatestBlock().catch(() => null);
    const blockHeight = blockResult?.block_height ?? 0;

    const riskScores: Record<string, number> = {
      CasperSwap: 22,
      'CSPR.trade': 45,
      FriendlyMarket: 68,
      NexusDEX: 82,
      CasperLend: 15,
      CasperBridge: 55,
    };

    const riskScore = riskScores[protocol] ?? 50;
    const premiumRate =
      riskScore < 30 ? 0.025 : riskScore < 60 ? 0.045 : riskScore < 80 ? 0.065 : 0.085;
    const premiumAmount = parseFloat(coverage) * premiumRate;

    const policyId = `POL-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    const policy = {
      agent: 'UnderwriteAI',
      timestamp: new Date().toISOString(),
      blockHeight,
      policy: {
        id: policyId,
        holder,
        protocolCovered: protocol,
        coverageAmount: parseFloat(coverage),
        premiumRate,
        premiumPaid: Math.round(premiumAmount),
        riskScore,
        status: 'active',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      underwriting: {
        riskAssessment: {
          protocolRisk: riskScore,
          category: riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : riskScore < 80 ? 'high' : 'critical',
          factors: [
            `Protocol TVL stability`,
            `Smart contract audit status`,
            `Historical incident frequency`,
            `Governance decentralization score`,
          ],
        },
        premiumCalculation: {
          baseRate: premiumRate,
          coverageAmount: parseFloat(coverage),
          quarterlyPremium: Math.round(premiumAmount),
          annualizedRate: (premiumRate * 4 * 100).toFixed(1) + '%',
        },
        paymentMethod: 'x402 Micropayment',
      },
      transaction: {
        txHash,
        type: 'policy_creation',
        x402PaymentId: 'x402-' + Math.random().toString(36).slice(2, 10),
        gasCost: '2.5 CSPR',
      },
    };

    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json(
      { error: 'UnderwriteAI error', details: String(error) },
      { status: 500 }
    );
  }
}
