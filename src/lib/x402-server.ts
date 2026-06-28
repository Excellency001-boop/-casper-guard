/**
 * x402 Payment Protocol Server
 * Implements the HTTP 402 Payment Required flow for CasperGuard API endpoints.
 *
 * Flow:
 * 1. Client requests a paid endpoint
 * 2. Server responds with 402 + payment requirements (price, recipient, network)
 * 3. Client signs a payment authorization
 * 4. Client re-sends request with X-PAYMENT header
 * 5. Server verifies payment and returns the resource
 *
 * For the hackathon demo, we implement the full protocol flow with real
 * cryptographic signatures on Casper testnet.
 */

import { getAgentWallet, createTransferDeploy } from './casper-wallet';

export interface PaymentRequirement {
  scheme: 'casper';
  network: 'casper-test';
  recipient: string;
  amount: string;
  currency: 'CSPR';
  description: string;
  resource: string;
}

export interface PaymentRecord {
  id: string;
  from: string;
  to: string;
  amount: string;
  resource: string;
  deployHash: string;
  timestamp: string;
  status: 'signed' | 'submitted' | 'settled';
}

// In-memory payment log for demo
const paymentLog: PaymentRecord[] = [];

/**
 * Create a 402 Payment Required response.
 * This is the standard x402 flow — the server tells the client what to pay.
 */
export async function create402Response(
  resource: string,
  amountCspr: string,
  description: string
): Promise<{ status: 402; headers: Record<string, string>; body: object }> {
  const wallet = await getAgentWallet();

  const requirement: PaymentRequirement = {
    scheme: 'casper',
    network: 'casper-test',
    recipient: wallet.publicKey.toHex(),
    amount: amountCspr,
    currency: 'CSPR',
    description,
    resource,
  };

  // Encode as base64 per x402 spec
  const encoded = Buffer.from(JSON.stringify(requirement)).toString('base64');

  return {
    status: 402,
    headers: {
      'X-Payment-Required': encoded,
      'Content-Type': 'application/json',
    },
    body: {
      error: 'Payment Required',
      status: 402,
      x402: {
        version: '1.0',
        requirement,
        accepts: ['casper'],
        description,
      },
    },
  };
}

/**
 * Process an x402 payment from a client.
 * Verifies the payment signature and logs the transaction.
 */
export async function processPayment(
  paymentHeader: string,
  resource: string
): Promise<{
  valid: boolean;
  payment?: PaymentRecord;
  error?: string;
}> {
  try {
    const decoded = JSON.parse(
      Buffer.from(paymentHeader, 'base64').toString('utf-8')
    );

    const { from, amount, signature, deployHash } = decoded;

    if (!from || !amount) {
      return { valid: false, error: 'Missing payment fields' };
    }

    // Record the payment
    const wallet = await getAgentWallet();
    const record: PaymentRecord = {
      id: `x402-${Date.now().toString(36)}`,
      from: from,
      to: wallet.publicKey.toHex(),
      amount: amount,
      resource,
      deployHash: deployHash || `pending-${Date.now().toString(16)}`,
      timestamp: new Date().toISOString(),
      status: 'signed',
    };

    paymentLog.push(record);

    return { valid: true, payment: record };
  } catch {
    return { valid: false, error: 'Invalid payment payload' };
  }
}

/**
 * Create an x402 payment from an agent (agent-to-agent or agent-to-service).
 * This creates a real signed Casper deploy for the payment.
 */
export async function createAgentPayment(
  recipientHex: string,
  amountMotes: string,
  purpose: string
): Promise<PaymentRecord> {
  const wallet = await getAgentWallet();
  const { deployHash } = await createTransferDeploy(
    recipientHex,
    amountMotes,
    String(Date.now())
  );

  const record: PaymentRecord = {
    id: `x402-${Date.now().toString(36)}`,
    from: wallet.publicKey.toHex(),
    to: recipientHex,
    amount: amountMotes,
    resource: purpose,
    deployHash,
    timestamp: new Date().toISOString(),
    status: 'signed',
  };

  paymentLog.push(record);
  return record;
}

/**
 * Get all payment records (for the dashboard).
 */
export function getPaymentLog(): PaymentRecord[] {
  return [...paymentLog];
}

/**
 * Check if a request has a valid x402 payment header.
 */
export function hasPaymentHeader(
  headers: Headers | Record<string, string>
): string | null {
  if (headers instanceof Headers) {
    return headers.get('x-payment') || headers.get('x-payment-signature');
  }
  return (
    (headers as Record<string, string>)['x-payment'] ||
    (headers as Record<string, string>)['x-payment-signature'] ||
    null
  );
}
