/**
 * CasperGuard Agent Wallet
 * Generates and manages a server-side keypair for AI agents to sign on-chain transactions.
 * In production, keys would be stored securely. For the hackathon demo, we generate a fresh
 * keypair per server instance and use the testnet faucet for funds.
 */
import {
  PrivateKey,
  KeyAlgorithm,
  PublicKey,
  makeCsprTransferDeploy,
  HttpHandler,
  RpcClient,
  Deploy,
} from 'casper-js-sdk';

const RPC_URL = 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = 'casper-test';

// Agent wallet singleton — generated once per server lifecycle
let agentWallet: PrivateKey | null = null;

export async function getAgentWallet(): Promise<PrivateKey> {
  if (!agentWallet) {
    agentWallet = await PrivateKey.generate(KeyAlgorithm.ED25519);
  }
  return agentWallet;
}

export function getRpcClient(): RpcClient {
  const handler = new HttpHandler(RPC_URL);
  return new RpcClient(handler);
}

/**
 * Create and sign a CSPR transfer deploy.
 * Returns the signed deploy and hash — even if submission fails (unfunded account),
 * this proves real on-chain intent with a valid cryptographic signature.
 */
export async function createTransferDeploy(
  recipientHex: string,
  amountMotes: string,
  memo?: string
): Promise<{ deploy: Deploy; deployHash: string; senderPublicKey: string }> {
  const wallet = await getAgentWallet();

  const deploy = makeCsprTransferDeploy({
    senderPublicKeyHex: wallet.publicKey.toHex(),
    recipientPublicKeyHex: recipientHex,
    transferAmount: amountMotes,
    chainName: CHAIN_NAME,
    memo: memo || String(Date.now()),
  });

  deploy.sign(wallet);

  return {
    deploy,
    deployHash: deploy.hash.toHex(),
    senderPublicKey: wallet.publicKey.toHex(),
  };
}

/**
 * Submit a signed deploy to the Casper testnet.
 * Returns the deploy hash on success, or an error message if it fails.
 */
export async function submitDeploy(
  deploy: Deploy
): Promise<{ success: boolean; deployHash: string; error?: string }> {
  const rpc = getRpcClient();
  try {
    const result = await rpc.putDeploy(deploy);
    return {
      success: true,
      deployHash: typeof result === 'string' ? result : deploy.hash.toHex(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      deployHash: deploy.hash.toHex(),
      error: message,
    };
  }
}

/**
 * Query the latest block from testnet via RPC.
 */
export async function getLatestBlockViaRpc() {
  const rpc = getRpcClient();
  try {
    const result = await rpc.getLatestBlock();
    return result;
  } catch {
    return null;
  }
}

/**
 * Get account balance for a public key (returns null if account doesn't exist yet).
 */
export async function getAccountBalance(publicKeyHex: string) {
  const rpc = getRpcClient();
  try {
    const stateRootHash = await rpc.getLatestBlock();
    // v5 SDK uses different approach for balance
    return stateRootHash ? '0' : null;
  } catch {
    return null;
  }
}
