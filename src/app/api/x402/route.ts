/**
 * x402 Payment Protocol Demo Endpoint
 * Demonstrates the full HTTP 402 payment flow:
 * 1. GET without payment → returns 402 with payment requirements
 * 2. GET with X-PAYMENT header → processes payment and returns data
 * 3. GET /api/x402?payments=true → returns payment log
 */
import { NextResponse } from 'next/server';
import {
  create402Response,
  hasPaymentHeader,
  processPayment,
  getPaymentLog,
} from '@/lib/x402-server';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Return payment log
  if (url.searchParams.get('payments') === 'true') {
    const wallet = await getAgentWallet();
    return NextResponse.json({
      agent: 'VaultKeeper',
      agentWallet: wallet.publicKey.toHex(),
      payments: getPaymentLog(),
      totalPayments: getPaymentLog().length,
    });
  }

  // Check for payment header
  const paymentHeader = hasPaymentHeader(request.headers);

  if (!paymentHeader) {
    // Return 402 Payment Required
    const response = await create402Response(
      '/api/x402',
      '0.1',
      'Access to CasperGuard premium risk data feed'
    );

    return NextResponse.json(response.body, {
      status: 402,
      headers: response.headers,
    });
  }

  // Process the payment
  const result = await processPayment(paymentHeader, '/api/x402');

  if (!result.valid) {
    return NextResponse.json(
      { error: 'Payment verification failed', details: result.error },
      { status: 402 }
    );
  }

  // Payment accepted — return the premium data
  const wallet = await getAgentWallet();
  return NextResponse.json({
    status: 'paid',
    x402: {
      paymentId: result.payment?.id,
      deployHash: result.payment?.deployHash,
      amount: result.payment?.amount,
    },
    data: {
      agent: 'RiskSentinel',
      premiumRiskFeed: {
        protocols: [
          { name: 'NexusDEX', riskScore: 82, alert: 'CRITICAL — upgrade pending' },
          { name: 'FriendlyMarket', riskScore: 68, alert: 'HIGH — governance change' },
          { name: 'CasperBridge', riskScore: 55, alert: 'MEDIUM — latency elevated' },
        ],
        generatedAt: new Date().toISOString(),
        nextUpdate: '30 seconds',
      },
    },
    agentWallet: wallet.publicKey.toHex(),
  });
}
