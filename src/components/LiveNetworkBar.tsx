'use client';

import { useNetworkData } from '@/hooks/use-live-data';
import { Activity, Radio, Cpu } from 'lucide-react';

export default function LiveNetworkBar() {
  const { data, loading } = useNetworkData(20000);

  if (loading || !data) return null;

  return (
    <div className="bg-bg-card/80 border border-border-main rounded-lg px-3 py-2 flex items-center gap-3 sm:gap-5 text-[10px] sm:text-xs overflow-x-auto">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full ${data.connected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
        <span className="text-text-secondary font-medium">
          {data.connected ? 'Casper Testnet' : 'Disconnected'}
        </span>
      </div>

      {data.connected && (
        <>
          <div className="flex items-center gap-1 shrink-0">
            <Cpu className="w-3 h-3 text-accent-purple" />
            <span className="text-text-primary font-mono font-bold">
              #{data.network.blockHeight.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Radio className="w-3 h-3 text-accent-cyan" />
            <span className="text-text-secondary">Era {data.network.era.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Activity className="w-3 h-3 text-accent-orange" />
            <span className="text-text-secondary">{data.network.recentDeployCount} deploys</span>
          </div>

          <span className="text-text-secondary/50 ml-auto shrink-0">
            Live from api.testnet.cspr.live
          </span>
        </>
      )}
    </div>
  );
}
