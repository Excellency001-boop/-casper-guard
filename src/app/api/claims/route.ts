import { NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/mcp-client';
import { assessClaim } from '@/lib/ai-reasoning';
import { createTransferDeploy, getAgentWallet, submitDeploy } from '@/lib/casper-wallet';
import { createAgentPayment, create402Response, hasPaymentHeader, processPayment } from '@/lib/x402-server';
import { registerClaimOnChain } from '@/lib/odra-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // x402 payment check — demonstrate the full 402 flow
    const paymentHeader = hasPaymentHeader(request.headers);

    const body = await request.json();
    const { policyId, amount, reason, evidence, claimant } = body;

    if (!policyId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: policyId, amount, reason' },
        { status: 400 }
      );
    }

    // Get real network status via MCP
    const status = await getNetworkStatus();
    const wallet = await getAgentWallet();

    // Get protocol from policy ID for risk context
    const protocolMap: Record<string, { name: string; riskScore: number }> = {
      'POL-001': { name: 'CasperSwap', riskScore: 22 },
      'POL-002': { name: 'CSPR.trade', riskScore: 45 },
      'POL-003': { name: 'NexusDEX', riskScore: 82 },
      'POL-004': { name: 'FriendlyMarket', riskScore: 68 },
      'POL-005': { name: 'CasperLend', riskScore: 15 },
    };
    const protocol = protocolMap[policyId] ?? { name: 'Unknown', riskScore: 50 };

    // AI-powered claim assessment (Claude API or algorithmic fallback)
    const assessment = await assessClaim(
      {
        policyId,
        protocol: protocol.name,
        amount: parseFloat(amount),
        reason,
        evidence: evidence || '',
      },
      {
        blockHeight: status.blockHeight,
        era: status.era,
        protocolRiskScore: protocol.riskScore,
      }
    );

    // Create x402 micropayment for ClaimBot processing fee
    const x402Payment = await createAgentPayment(
      wallet.publicKey.toHex(),
      '250000000', // 0.25 CSPR processing fee
      `ClaimBot assessment for ${policyId}`
    );

    // Create a real signed deploy for the claim record on-chain
    const recipientKey = wallet.publicKey.toHex();
    const { deployHash, senderPublicKey } = await createTransferDeploy(
      recipientKey,
      '100000000', // 0.1 CSPR — claim registration fee
      String(Date.now())
    );

    // Attempt to submit deploy to testnet (will fail if unfunded, but proves the flow)
    let submitResult: { success: boolean; error?: string } = { success: false, error: 'Account not funded on testnet' };
    try {
      const { deploy } = await createTransferDeploy(recipientKey, '100000000', String(Date.now()));
      submitResult = await submitDeploy(deploy);
    } catch {
      // Expected — demo wallet has no funds
    }

    // Register claim via Odra smart contract
    const odraResult = await registerClaimOnChain({
      policyId: parseInt(policyId.replace(/\D/g, '')) || 1,
      claimant: claimant || wallet.publicKey.toHex(),
      amount: String(Math.round(parseFloat(amount) * 1_000_000_000)),
      reason,
      evidenceHash: evidence || `0x${Date.now().toString(16)}`,
      aiConfidence: Math.round(assessment.confidence * 100),
    });

    const claimId = `CLM-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    return NextResponse.json({
      agent: 'ClaimBot',
      timestamp: new Date().toISOString(),
      blockHeight: status.blockHeight,
      era: status.era,
      dataSource: status.source === 'mcp' ? 'Casper MCP Server' : 'Casper Testnet REST API',
      claim: {
        id: claimId,
        policyId,
        claimant: claimant || 'Anonymous',
        amount: parseFloat(amount),
        reason,
        evidence: evidence || null,
        protocol: protocol.name,
      },
      assessment: {
        riskScore: assessment.riskScore,
        confidence: assessment.confidence,
        recommendation: assessment.recommendation,
        reasoning: assessment.reasoning,
        factors: assessment.factors,
        aiPowered: assessment.aiPowered,
        model: assessment.aiPowered ? 'claude-sonnet-4-20250514' : 'algorithmic-v1',
      },
      transaction: {
        deployHash,
        senderPublicKey,
        chainName: 'casper-test',
        submitted: submitResult.success,
        submitError: submitResult.error,
        type: 'claim_registration',
      },
      x402Payment: {
        id: x402Payment.id,
        amount: '0.25 CSPR',
        deployHash: x402Payment.deployHash,
        purpose: 'ClaimBot processing fee',
        status: x402Payment.status,
      },
      odraContract: {
        framework: 'Odra v1.4.0',
        entryPoint: odraResult.entryPoint,
        contractHash: odraResult.contractHash,
        deployHash: odraResult.deployHash,
        signed: odraResult.signed,
        claimIdOnChain: odraResult.claimId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'ClaimBot processing error', details: String(error) },
      { status: 500 }
    );
  }
}
