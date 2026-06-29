'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Shield,
  TrendingUp,
  DollarSign,
  Eye,
  Search,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { agentActivities, x402Payments } from '@/lib/mock-data';
import LiveNetworkBar from '@/components/LiveNetworkBar';
import { useAgentData } from '@/hooks/use-live-data';

const agents = [
  {
    name: 'RiskSentinel',
    type: 'risk-monitor' as const,
    description: 'Monitors DeFi protocols for vulnerabilities, whale movements, and liquidity risks using Casper MCP Server',
    status: 'active',
    color: '#8b5cf6',
    icon: Eye,
    stats: { scansToday: 1247, alertsRaised: 3, protocolsMonitored: 6 },
    mcpConnections: ['Casper MCP Server', 'CSPR.trade MCP'],
    lastAction: '2 minutes ago',
  },
  {
    name: 'ClaimBot',
    type: 'claim-processor' as const,
    description: 'Autonomously verifies on-chain evidence, assesses claims using AI risk models, and executes payouts',
    status: 'active',
    color: '#3b82f6',
    icon: Shield,
    stats: { claimsProcessed: 23, avgProcessTime: '2.5 min', accuracy: '96%' },
    mcpConnections: ['Casper MCP Server', 'CSPR.cloud APIs'],
    lastAction: '3 minutes ago',
  },
  {
    name: 'UnderwriteAI',
    type: 'underwriter' as const,
    description: 'Calculates dynamic premium rates based on real-time protocol risk scores and historical data',
    status: 'active',
    color: '#06b6d4',
    icon: TrendingUp,
    stats: { policiesUnderwritten: 147, premiumsCollected: '185K CSPR', rateAdjustments: 12 },
    mcpConnections: ['Casper MCP Server', 'External Oracles via x402'],
    lastAction: '5 minutes ago',
  },
  {
    name: 'VaultKeeper',
    type: 'vault-manager' as const,
    description: 'Manages the insurance vault reserves, rebalances between yield pools and claims reserves',
    status: 'active',
    color: '#10b981',
    icon: DollarSign,
    stats: { rebalances: 8, reserveRatio: '89%', yieldGenerated: '12.3K CSPR' },
    mcpConnections: ['Casper MCP Server', 'Odra Smart Contracts'],
    lastAction: '7 minutes ago',
  },
];

function AgentCard({ agent }: { agent: (typeof agents)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = agent.icon;
  const activities = agentActivities.filter((a) => a.agentName === agent.name);
  const payments = x402Payments.filter(
    (p) => p.from === agent.name || p.to === agent.name
  );

  return (
    <div className="bg-bg-card border border-border-main rounded-xl overflow-hidden hover:border-accent-purple/30 transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${agent.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: agent.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-text-primary">{agent.name}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs text-accent-green font-medium">Active</span>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{agent.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {Object.entries(agent.stats).map(([key, value]) => (
            <div key={key} className="bg-bg-primary rounded-lg p-2.5 text-center">
              <p className="text-xs text-text-secondary mb-0.5">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </p>
              <p className="text-sm font-bold text-text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-text-secondary">MCP:</span>
          {agent.mcpConnections.map((c) => (
            <span key={c} className="text-[10px] bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-full whitespace-nowrap">
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-main">
          <span className="text-[10px] text-text-secondary flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last action: {agent.lastAction}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent-purple hover:underline flex items-center gap-1"
          >
            {expanded ? 'Hide' : 'View'} Activity
            <ArrowRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border-main bg-bg-primary/50 p-4 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-xs font-semibold text-text-secondary mb-2">Recent Activity</p>
          {activities.length > 0 ? (
            activities.map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-bg-card/50">
                <div className="mt-0.5">
                  {a.status === 'success' ? <CheckCircle className="w-3 h-3 text-accent-green" /> :
                   a.status === 'warning' ? <AlertTriangle className="w-3 h-3 text-accent-orange" /> :
                   a.status === 'error' ? <XCircle className="w-3 h-3 text-accent-red" /> :
                   <Activity className="w-3 h-3 text-accent-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary">{a.action}</p>
                  <p className="text-[10px] text-text-secondary truncate">{a.details}</p>
                  {a.txHash && (
                    <p className="text-[10px] text-accent-purple font-mono mt-0.5">TX: {a.txHash}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-secondary">No recent activity</p>
          )}

          {payments.length > 0 && (
            <>
              <p className="text-xs font-semibold text-text-secondary mt-3 mb-2">x402 Payments</p>
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-card/50">
                  <div>
                    <p className="text-xs text-text-primary">
                      {p.from === agent.name ? `→ ${p.to}` : `← ${p.from}`}
                    </p>
                    <p className="text-[10px] text-text-secondary">{p.purpose}</p>
                  </div>
                  <span className="text-xs font-mono text-accent-green">
                    {p.amount < 1 ? `${(p.amount * 1000).toFixed(0)}m` : p.amount.toLocaleString()} CSPR
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AgentRunPanel() {
  const [running, setRunning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastRun, setLastRun] = useState<any>(null);
  const [protocol, setProtocol] = useState('NexusDEX');

  const runCycle = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/agent?run=true&protocol=${encodeURIComponent(protocol)}`);
      const data = await res.json();
      setLastRun(data.latestRun);
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  return (
    <div className="gradient-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent-purple" />
            Autonomous Agent Cycle
          </h2>
          <p className="text-[10px] text-text-secondary mt-0.5">READ blockchain → ANALYZE risk → DECIDE action → SIGN deploy → LOG receipt</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="text-xs bg-bg-primary border border-border-main rounded-lg px-2 py-1.5 text-text-primary"
          >
            <option>CasperSwap</option>
            <option>NexusDEX</option>
            <option>CSPR.trade</option>
            <option>FriendlyMarket</option>
            <option>CasperLend</option>
            <option>CasperBridge</option>
          </select>
          <button
            onClick={runCycle}
            disabled={running}
            className="flex items-center gap-1.5 bg-accent-purple hover:bg-accent-purple/80 disabled:bg-accent-purple/40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {running ? (
              <>
                <Activity className="w-3 h-3 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                Run Agent Cycle
              </>
            )}
          </button>
        </div>
      </div>

      {lastRun && (
        <div className="space-y-3">
          {/* Status bar */}
          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
              lastRun.status === 'completed' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
            }`}>
              {lastRun.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {lastRun.status}
            </span>
            <span className="text-text-secondary">{lastRun.duration}ms</span>
            <span className="text-text-secondary">Run: {lastRun.runId}</span>
          </div>

          {/* 5-step pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {/* Step 1: READ */}
            <div className="bg-bg-primary rounded-lg p-3 border border-accent-blue/20">
              <p className="text-[10px] font-bold text-accent-blue mb-1">1. READ</p>
              <p className="text-[10px] text-text-secondary">Block #{lastRun.observation?.blockHeight?.toLocaleString()}</p>
              <p className="text-[10px] text-text-secondary">Era {lastRun.observation?.era?.toLocaleString()}</p>
              <p className="text-[10px] text-text-secondary">CSPR ${lastRun.observation?.csprPrice?.toFixed(5) ?? '—'}</p>
              <p className="text-[10px] text-text-secondary">{lastRun.observation?.tokenCount} tokens</p>
              {lastRun.observation?.mcpConnected && (
                <span className="text-[8px] bg-accent-green/10 text-accent-green px-1.5 py-0.5 rounded mt-1 inline-block">MCP Live</span>
              )}
            </div>

            {/* Step 2: ANALYZE */}
            <div className="bg-bg-primary rounded-lg p-3 border border-accent-cyan/20">
              <p className="text-[10px] font-bold text-accent-cyan mb-1">2. ANALYZE</p>
              <p className="text-[10px] text-text-primary font-medium">{lastRun.analysis?.protocol}</p>
              <p className={`text-lg font-bold ${
                lastRun.analysis?.riskScore > 70 ? 'text-accent-red' :
                lastRun.analysis?.riskScore > 40 ? 'text-accent-orange' : 'text-accent-green'
              }`}>{lastRun.analysis?.riskScore}/100</p>
              <p className="text-[8px] text-text-secondary">{lastRun.analysis?.riskCategory}</p>
            </div>

            {/* Step 3: DECIDE */}
            <div className="bg-bg-primary rounded-lg p-3 border border-accent-orange/20">
              <p className="text-[10px] font-bold text-accent-orange mb-1">3. DECIDE</p>
              <p className="text-[10px] text-text-primary font-medium">{lastRun.decision?.action?.replace(/_/g, ' ')}</p>
              <span className={`text-[8px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                lastRun.decision?.urgency === 'critical' ? 'bg-accent-red/10 text-accent-red' :
                lastRun.decision?.urgency === 'high' ? 'bg-accent-orange/10 text-accent-orange' :
                'bg-accent-green/10 text-accent-green'
              }`}>{lastRun.decision?.urgency} urgency</span>
            </div>

            {/* Step 4: ACT */}
            <div className="bg-bg-primary rounded-lg p-3 border border-accent-purple/20">
              <p className="text-[10px] font-bold text-accent-purple mb-1">4. ACT</p>
              <p className="text-[10px] text-text-secondary">Signed: {lastRun.action?.signed ? 'Yes' : 'No'}</p>
              {lastRun.action?.submitted !== undefined && (
                <p className={`text-[10px] ${lastRun.action.submitted ? 'text-accent-green' : 'text-accent-orange'}`}>
                  {lastRun.action.submitted ? 'Submitted to testnet' : 'Signed (pending)'}
                </p>
              )}
              <p className="text-[8px] text-text-secondary font-mono break-all mt-1">
                {lastRun.action?.deployHash?.slice(0, 16)}...
              </p>
              {lastRun.action?.signed && (
                <a href={lastRun.action.explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[8px] text-accent-purple hover:underline mt-1 inline-block">
                  View on Explorer
                </a>
              )}
            </div>

            {/* Step 5: LOG */}
            <div className="bg-bg-primary rounded-lg p-3 border border-accent-green/20">
              <p className="text-[10px] font-bold text-accent-green mb-1">5. LOG</p>
              <p className="text-[10px] text-text-secondary">Agent: {lastRun.agent}</p>
              <p className="text-[10px] text-text-secondary">{new Date(lastRun.timestamp).toLocaleTimeString()}</p>
              <span className="text-[8px] bg-accent-green/10 text-accent-green px-1.5 py-0.5 rounded mt-1 inline-block">Receipt Saved</span>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-bg-primary rounded-lg p-3 border border-border-main">
            <p className="text-[10px] font-bold text-text-secondary mb-1">Agent Reasoning</p>
            <p className="text-[10px] text-text-primary leading-relaxed">{lastRun.decision?.justification}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [liveCount, setLiveCount] = useState(0);
  const { data: agentData } = useAgentData(15000);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <LiveNetworkBar />

      {agentData && (
        <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
          <span className="text-accent-purple font-semibold">Live Agent Status</span>
          <span className="text-text-secondary">
            All agents scanning block #{agentData.blockHeight.toLocaleString()} · Era {agentData.era.toLocaleString()}
          </span>
          <span className="text-text-secondary/50 sm:ml-auto">
            Data: Casper Testnet
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">AI Agent Fleet</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Autonomous agents protecting DeFi positions on Casper Network
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] sm:text-xs text-accent-green font-medium">4/4 Online</span>
          </div>
          <div className="flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <Zap className="w-3 h-3 text-accent-purple" />
            <span className="text-[10px] sm:text-xs text-accent-purple font-medium">
              {1284 + liveCount} Ops
            </span>
          </div>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="gradient-border p-5">
        <h2 className="text-sm font-bold text-text-primary mb-4">Agent Architecture — Casper AI Toolkit Integration</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
          <div className="bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-[10px] font-bold text-text-primary">RiskSentinel</p>
            <p className="text-[8px] text-text-secondary mt-0.5">MCP Queries</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-[10px] font-bold text-text-primary">ClaimBot</p>
            <p className="text-[8px] text-text-secondary mt-0.5">Evidence Analysis</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3 border border-accent-orange/30">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-accent-orange" />
            </div>
            <p className="text-[10px] font-bold text-accent-orange">x402 Protocol</p>
            <p className="text-[8px] text-text-secondary mt-0.5">Micropayments</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-accent-cyan" />
            </div>
            <p className="text-[10px] font-bold text-text-primary">UnderwriteAI</p>
            <p className="text-[8px] text-text-secondary mt-0.5">Risk Pricing</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-[10px] font-bold text-text-primary">VaultKeeper</p>
            <p className="text-[8px] text-text-secondary mt-0.5">Odra Contracts</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />
          <span className="text-[10px] text-text-secondary px-2">Casper Testnet via MCP + CSPR.click Agent Skill</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />
        </div>
      </div>

      {/* Autonomous Agent Cycle — Run Live */}
      <AgentRunPanel />

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}
