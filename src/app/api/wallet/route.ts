import { NextResponse } from 'next/server';
import { getAgentWallet } from '@/lib/casper-wallet';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet — Show the agent wallet public key and (in dev) the private key hex
 * so it can be saved as CASPER_AGENT_PRIVATE_KEY env var for persistence across deploys.
 */
export async function GET() {
  try {
    const wallet = await getAgentWallet();
    const publicKeyHex = wallet.publicKey.toHex();

    // Only expose private key in development for initial setup
    const isDev = process.env.NODE_ENV === 'development';
    const hasStoredKey = !!process.env.CASPER_AGENT_PRIVATE_KEY;

    return NextResponse.json({
      publicKey: publicKeyHex,
      network: 'casper-test',
      keyAlgorithm: 'ED25519',
      persistent: hasStoredKey,
      ...(isDev && !hasStoredKey
        ? {
            setupInstructions: 'Copy the privateKeyHex below and set it as CASPER_AGENT_PRIVATE_KEY in your Vercel env vars',
            privateKeyHex: Buffer.from(wallet.toBytes()).toString('hex'),
            note: 'Set this as CASPER_AGENT_PRIVATE_KEY in Vercel → Settings → Environment Variables',
          }
        : {}),
      faucetUrl: `https://testnet.cspr.live/tools/faucet`,
      accountUrl: `https://testnet.cspr.live/account/${publicKeyHex}`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
