'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkData {
  connected: boolean;
  timestamp: string;
  network: {
    name: string;
    blockHeight: number;
    era: number;
    lastBlockTimestamp: string | null;
    proposer: string | null;
    recentDeployCount: number;
    recentTransferCount: number;
  };
}

interface RiskData {
  agent: string;
  timestamp: string;
  dataSource: string;
  network: {
    blockHeight: number;
    era: number;
    health: string;
  };
  analysis: {
    overallRiskScore: number;
    deployActivity: {
      recentCount: number;
      transferCount: number;
      risk: string;
    };
  };
  protocols: Array<{
    name: string;
    riskScore: number;
    category: string;
    tvl: number;
    alerts: string[];
  }>;
}

interface AgentData {
  timestamp: string;
  networkConnected: boolean;
  blockHeight: number;
  era: number;
  agents: Array<{
    name: string;
    type: string;
    status: string;
    lastAction: string;
    currentTask: string;
    mcpConnections: string[];
    stats: Record<string, string | number>;
    recentActions: Array<{
      action: string;
      status: string;
      timestamp: string;
      details: string;
      txHash?: string;
    }>;
  }>;
}

export function useNetworkData(refreshInterval = 30000) {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/network');
      if (res.ok) setData(await res.json());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, refresh };
}

export function useRiskData(refreshInterval = 30000) {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/risk');
      if (res.ok) setData(await res.json());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, refresh };
}

export function useAgentData(refreshInterval = 15000) {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/agent');
      if (res.ok) setData(await res.json());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, refresh };
}
