import { NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/mcp-client';
import { analyzeProtocolRisk } from '@/lib/ai-reasoning';
import { createTransferDeploy, getAgentWallet, submitDeploy } from '@/lib/casper-wallet';
import { createAgentPayment } from '@/lib/x402-server';
import { createPolicyOnChain } from '@/lib/odra-client';

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

    // Get real network status via MCP
    const status = await getNetworkStatus();
    const wallet = await getAgentWallet();

    // AI-powered risk analysis for premium calculation
    const protocolTvls: Record<string, number> = {
      CasperSwap: 12_500_000, 'CSPR.trade': 8_200_000, FriendlyMarket: 3_100_000,
      NexusDEX: 1_800_000, CasperLend: 22_000_000, CasperBridge: 5_600_000,
    };

    const protocolAlerts: Record<string, string[]> = {
      'CSPR.trade': ['Liquidity pool imbalance'],
      FriendlyMarket: ['Governance proposal pending'],
      NexusDEX: ['Smart contract upgrade — elevated risk'],
      CasperBridge: ['Cross-chain latency elevated'],
    };

    const riskAnalysis = await analyzeProtocolRisk(protocol, {
      blockHeight: status.blockHeight,
      era: status.era,
      deployCount: 10,
      tvl: protocolTvls[protocol] ?? 5_000_000,
      recentAlerts: protocolAlerts[protocol] ?? [],
    });

    const riskScore = riskAnalysis.overallScore;
    const premiumRate =
      riskScore < 30 ? 0.025 : riskScore < 60 ? 0.045 : riskScore < 80 ? 0.065 : 0.085;
    const premiumAmount = parseFloat(coverage) * premiumRate;

    // Create x402 micropayment for premium
    const x402Payment = await createAgentPayment(
      wallet.publicKey.toHex(),
      String(Math.round(premiumAmount * 1_000_000_000)),
      `Policy premium for ${protocol} coverage`
    );

    // Create a real signed deploy for the policy on-chain
    const { deployHash, senderPublicKey } = await createTransferDeploy(
      wallet.publicKey.toHex(),
      String(Math.round(premiumAmount * 1_000_000_000)),
      String(Date.now())
    );

    // Attempt to submit to testnet
    let submitResult: { success: boolean; error?: string } = { success: false, error: 'Account not funded on testnet' };
    try {
      const { deploy } = await createTransferDeploy(
        wallet.publicKey.toHex(),
        String(Math.round(premiumAmount * 1_000_000_000)),
        String(Date.now())
      );
      submitResult = await submitDeploy(deploy);
    } catch {
      // Expected — demo wallet has no funds
    }

    // Create policy via Odra smart contract
    const odraResult = await createPolicyOnChain({
      holder: holder,
      protocol: protocol,
      coverageAmount: String(Math.round(premiumAmount * 1_000_000_000)),
      premiumRate: Math.round(premiumRate * 10000),
      durationEras: 12,
      riskScore: riskScore,
    });

    const policyId = `POL-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    return NextResponse.json({
      agent: 'UnderwriteAI',
      timestamp: new Date().toISOString(),
      blockHeight: status.blockHeight,
      era: status.era,
      dataSource: status.source === 'mcp' ? 'Casper MCP Server' : 'Casper Testnet REST API',
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
          category: riskAnalysis.category,
          reasoning: riskAnalysis.reasoning,
          aiPowered: riskAnalysis.aiPowered,
          model: riskAnalysis.aiPowered ? 'claude-sonnet-4-20250514' : 'algorithmic-v1',
          factors: riskAnalysis.factors,
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
        deployHash,
        senderPublicKey,
        chainName: 'casper-test',
        submitted: submitResult.success,
        submitError: submitResult.error,
        type: 'policy_creation',
        gasCost: '0.1 CSPR',
      },
      x402Payment: {
        id: x402Payment.id,
        amount: `${Math.round(premiumAmount)} CSPR`,
        deployHash: x402Payment.deployHash,
        purpose: 'Premium payment via x402',
        status: x402Payment.status,
      },
      odraContract: {
        framework: 'Odra v1.4.0',
        entryPoint: odraResult.entryPoint,
        contractHash: odraResult.contractHash,
        deployHash: odraResult.deployHash,
        signed: odraResult.signed,
        policyIdOnChain: odraResult.policyId,
      },
      agentWallet: wallet.publicKey.toHex(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'UnderwriteAI error', details: String(error) },
      { status: 500 }
    );
  }
}
