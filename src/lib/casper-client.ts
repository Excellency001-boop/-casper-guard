const CSPR_LIVE_API = 'https://api.testnet.cspr.live';

async function csprLive(path: string) {
  const res = await fetch(`${CSPR_LIVE_API}${path}`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CSPR.live error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getLatestBlock() {
  const data = await csprLive('/blocks?page=1&limit=1');
  return data.data?.[0] ?? null;
}

export async function getRecentBlocks(count = 5) {
  const data = await csprLive(`/blocks?page=1&limit=${count}`);
  return data.data ?? [];
}

export async function getRecentDeploys(count = 10) {
  try {
    const data = await csprLive(`/deploys?page=1&limit=${count}`);
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentTransfers(count = 10) {
  try {
    const data = await csprLive(`/transfers?page=1&limit=${count}`);
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getValidators(count = 10) {
  try {
    const data = await csprLive(`/validators?page=1&limit=${count}`);
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getNetworkStats() {
  const [blockData, deployData, transferData] = await Promise.allSettled([
    getLatestBlock(),
    getRecentDeploys(20),
    getRecentTransfers(10),
  ]);

  const latestBlock = blockData.status === 'fulfilled' ? blockData.value : null;
  const deploys = deployData.status === 'fulfilled' ? deployData.value : [];
  const transfers = transferData.status === 'fulfilled' ? transferData.value : [];

  return {
    latestBlock,
    recentDeploys: deploys,
    recentTransfers: transfers,
    blockHeight: latestBlock?.block_height ?? 0,
    era: latestBlock?.era_id ?? 0,
    timestamp: latestBlock?.timestamp ?? null,
    proposer: latestBlock?.proposer_public_key ?? null,
  };
}
