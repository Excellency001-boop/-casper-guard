/**
 * Odra Smart Contract API
 * Exposes the CasperGuard InsuranceVault Odra contract interactions.
 *
 * GET  → Returns vault stats, contract ABI, and deployment status
 * POST → Interacts with contract entry points (create_policy, register_claim, etc.)
 */
import { NextResponse } from 'next/server';
import {
  getVaultStats,
  getContractABI,
  createPolicyOnChain,
  registerClaimOnChain,
  logPaymentOnChain,
} from '@/lib/odra-client';
import { getAgentWallet } from '@/lib/casper-wallet';
import { getNetworkStatus } from '@/lib/mcp-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stats, status, wallet] = await Promise.all([
      getVaultStats(),
      getNetworkStatus(),
      getAgentWallet(),
    ]);

    const abi = getContractABI();

    return NextResponse.json({
      agent: 'VaultKeeper',
      timestamp: new Date().toISOString(),
      blockHeight: status.blockHeight,
      era: status.era,
      dataSource: status.source === 'mcp' ? 'Casper MCP Server' : 'Casper Testnet REST API',
      contract: {
        framework: 'Odra v1.4.0',
        language: 'Rust → WASM',
        name: 'InsuranceVault',
        hash: stats.contractHash,
        deployed: stats.contractDeployed,
        chainName: 'casper-test',
        entryPointCount: abi.entryPoints.length,
      },
      vault: {
        tvl: `${(parseInt(stats.tvl) / 1_000_000_000).toFixed(1)} CSPR`,
        tvlMotes: stats.tvl,
        totalPremiums: `${(parseInt(stats.totalPremiums) / 1_000_000_000).toFixed(1)} CSPR`,
        totalClaimsPaid: `${(parseInt(stats.totalClaimsPaid) / 1_000_000_000).toFixed(1)} CSPR`,
        reserveRatio: `${(stats.reserveRatio / 100).toFixed(1)}%`,
        policyCount: stats.policyCount,
        claimCount: stats.claimCount,
      },
      abi,
      agentWallet: wallet.publicKey.toHex(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Contract query failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const wallet = await getAgentWallet();
    const status = await getNetworkStatus();

    switch (action) {
      case 'create_policy': {
        const { holder, protocol, coverageAmount, premiumRate, durationEras, riskScore } = body;
        const result = await createPolicyOnChain({
          holder: holder || wallet.publicKey.toHex(),
          protocol: protocol || 'CasperSwap',
          coverageAmount: coverageAmount || '1000000000',
          premiumRate: premiumRate || 250,
          durationEras: durationEras || 12,
          riskScore: riskScore || 35,
        });

        return NextResponse.json({
          agent: 'UnderwriteAI',
          action: 'create_policy',
          blockHeight: status.blockHeight,
          era: status.era,
          result,
          agentWallet: wallet.publicKey.toHex(),
        });
      }

      case 'register_claim': {
        const { policyId, claimant, amount, reason, evidenceHash, aiConfidence } = body;
        const result = await registerClaimOnChain({
          policyId: policyId || 1,
          claimant: claimant || wallet.publicKey.toHex(),
          amount: amount || '500000000',
          reason: reason || 'Smart contract exploit',
          evidenceHash: evidenceHash || `0x${Date.now().toString(16)}`,
          aiConfidence: aiConfidence || 85,
        });

        return NextResponse.json({
          agent: 'ClaimBot',
          action: 'register_claim',
          blockHeight: status.blockHeight,
          era: status.era,
          result,
          agentWallet: wallet.publicKey.toHex(),
        });
      }

      case 'log_payment': {
        const { from, to, paymentAmount, purpose, paymentDeployHash } = body;
        const result = await logPaymentOnChain({
          from: from || wallet.publicKey.toHex(),
          to: to || wallet.publicKey.toHex(),
          amount: paymentAmount || '100000000',
          purpose: purpose || 'x402 micropayment',
          deployHash: paymentDeployHash || `0x${Date.now().toString(16)}`,
        });

        return NextResponse.json({
          agent: 'VaultKeeper',
          action: 'log_payment',
          blockHeight: status.blockHeight,
          era: status.era,
          result,
          agentWallet: wallet.publicKey.toHex(),
        });
      }

      case 'get_abi': {
        return NextResponse.json({
          abi: getContractABI(),
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Unknown action',
            availableActions: ['create_policy', 'register_claim', 'log_payment', 'get_abi'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Contract interaction failed', details: String(error) },
      { status: 500 }
    );
  }
}
