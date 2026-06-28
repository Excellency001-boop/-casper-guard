'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bot,
  DollarSign,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  vaultStats,
  protocols,
  agentActivities,
  x402Payments,
  riskHistory,
} from '@/lib/mock-data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import LiveNetworkBar from '@/components/LiveNetworkBar';
import { useRiskData } from '@/hooks/use-live-data';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subtext && (
            <p className="text-xs text-text-secondary mt-1">{subtext}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ category }: { category: string }) {
  return (
    <span
      className={`risk-badge-${category} px-2 py-0.5 rounded-full text-xs font-semibold inline-block`}
    >
      {category.toUpperCase()}
    </span>
  );
}

function AgentActivityItem({ activity }: { activity: (typeof agentActivities)[0] }) {
  const statusIcon = {
    success: <CheckCircle className="w-4 h-4 text-accent-green" />,
    warning: <AlertTriangle className="w-4 h-4 text-accent-orange" />,
    error: <XCircle className="w-4 h-4 text-accent-red" />,
    info: <Activity className="w-4 h-4 text-accent-blue" />,
  };

  const agentColors: Record<string, string> = {
    'risk-monitor': '#8b5cf6',
    'claim-processor': '#3b82f6',
    underwriter: '#06b6d4',
    'vault-manager': '#10b981',
  };

  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-bg-card/50 hover:bg-bg-card-hover transition-colors">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${agentColors[activity.agentType]}20` }}
      >
        <Bot
          className="w-4 h-4"
          style={{ color: agentColors[activity.agentType] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-text-primary">
            {activity.agentName}
          </span>
          {statusIcon[activity.status]}
          <span className="text-xs text-text-secondary ml-auto">{timeAgo}</span>
        </div>
        <p className="text-xs text-text-secondary font-medium">{activity.action}</p>
        <p className="text-xs text-text-secondary/70 mt-0.5 truncate">
          {activity.details}
        </p>
        {activity.txHash && (
          <p className="text-[10px] text-accent-purple mt-1 font-mono">
            TX: {activity.txHash.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { data: riskData } = useRiskData(30000);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const liveProtocols = riskData?.protocols ?? protocols;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Live Network Bar */}
      <LiveNetworkBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            Insurance Vault Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            AI-powered DeFi protection on Casper Network
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-bg-card border border-border-main rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] sm:text-xs text-text-secondary">All systems operational</span>
          </div>
          <Link
            href="/policies"
            className="bg-accent-purple hover:bg-accent-purple/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Shield className="w-4 h-4" />
            New Policy
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Value Locked"
          value={`$${(vaultStats.totalValueLocked / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="#8b5cf6"
          subtext="Insurance vault reserves"
        />
        <StatCard
          label="Active Policies"
          value={vaultStats.totalPolicies.toString()}
          icon={Shield}
          color="#3b82f6"
          subtext={`${vaultStats.activeClaims} claims pending`}
        />
        <StatCard
          label="Reserve Ratio"
          value={`${(vaultStats.reserveRatio * 100).toFixed(0)}%`}
          icon={Activity}
          color="#10b981"
          subtext="Healthy — target 85%"
        />
        <StatCard
          label="Agent Transactions"
          value={vaultStats.agentTransactions.toLocaleString()}
          icon={Bot}
          color="#06b6d4"
          subtext="Autonomous operations"
        />
      </div>

      {/* Charts + Protocol Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Risk Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Protocol Risk Trends (24h)
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-red" /> NexusDEX
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-orange" /> FriendlyMarket
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-green" /> CasperLend
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={riskHistory}>
              <defs>
                <linearGradient id="riskRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="nexusDEX" stroke="#ef4444" fill="url(#riskRed)" strokeWidth={2} />
              <Area type="monotone" dataKey="friendlyMarket" stroke="#f59e0b" fill="url(#riskOrange)" strokeWidth={2} />
              <Area type="monotone" dataKey="casperLend" stroke="#10b981" fill="url(#riskGreen)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Protocol Risk List */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Monitored Protocols
            </h2>
            {riskData && (
              <span className="text-[10px] text-accent-green font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <div className="space-y-3">
            {(riskData?.protocols ?? protocols).map((p) => {
              const name = 'name' in p ? p.name : ('protocol' in p ? (p as typeof protocols[0]).protocol : '');
              const score = p.riskScore;
              const cat = p.category;
              const tvl = p.tvl;
              const alerts = p.alerts;
              return (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-bg-primary/50 hover:bg-bg-card-hover transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {name}
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    TVL: ${(tvl / 1_000_000).toFixed(1)}M
                  </p>
                  {alerts.length > 0 && (
                    <p className="text-[10px] text-accent-orange mt-0.5 truncate max-w-[180px]">
                      {alerts[0]}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <RiskBadge category={cat} />
                  <p className="text-[10px] mt-1 text-text-secondary font-mono">
                    {score}/100
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Activity + x402 Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Agent Activity Feed */}
        <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent-purple" />
              Live Agent Activity
            </h2>
            <Link
              href="/agents"
              className="text-xs text-accent-purple hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {agentActivities.map((a) => (
              <AgentActivityItem key={a.id} activity={a} />
            ))}
          </div>
        </div>

        {/* x402 Micropayments */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-accent-orange" />
            x402 Payments
          </h2>
          <div className="space-y-2">
            {x402Payments.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg bg-bg-primary/50 hover:bg-bg-card-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text-primary">
                    {p.from}
                  </span>
                  <span className="text-xs text-accent-green font-mono">
                    {p.amount < 1 ? `${p.amount * 1000}m` : ''} {p.amount >= 1 ? p.amount.toLocaleString() : ''} CSPR
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                  <ArrowRight className="w-3 h-3" />
                  <span>{p.to}</span>
                </div>
                <p className="text-[10px] text-text-secondary/70 mt-1">
                  {p.purpose}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
