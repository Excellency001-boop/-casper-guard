'use client';

import { useState } from 'react';
import {
  Shield,
  Plus,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Bot,
} from 'lucide-react';
import { policies, protocols } from '@/lib/mock-data';
import type { Policy } from '@/types';
import LiveNetworkBar from '@/components/LiveNetworkBar';

function PolicyCard({ policy }: { policy: Policy }) {
  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    active: { icon: CheckCircle, color: '#10b981', label: 'Active' },
    expired: { icon: Clock, color: '#94a3b8', label: 'Expired' },
    claimed: { icon: AlertTriangle, color: '#f59e0b', label: 'Claimed' },
    pending: { icon: Clock, color: '#3b82f6', label: 'Pending' },
  };

  const status = statusConfig[policy.status];
  const StatusIcon = status.icon;

  const riskCategory =
    policy.riskScore < 30 ? 'low' : policy.riskScore < 60 ? 'medium' : policy.riskScore < 80 ? 'high' : 'critical';

  return (
    <div className="bg-bg-card border border-border-main rounded-xl p-5 hover:border-accent-purple/30 transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-purple/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{policy.id}</p>
            <p className="text-xs text-text-secondary">{policy.holder}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-xs text-text-secondary">Protocol</span>
          <span className="text-xs font-medium text-text-primary">{policy.protocolCovered}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-secondary">Coverage</span>
          <span className="text-xs font-bold text-accent-green">${policy.coverageAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-secondary">Premium Rate</span>
          <span className="text-xs font-medium text-text-primary">{(policy.premiumRate * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-secondary">Premium Paid</span>
          <span className="text-xs font-medium text-accent-orange">{policy.premiumPaid.toLocaleString()} CSPR</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Risk Score</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${policy.riskScore}%`,
                  backgroundColor: riskCategory === 'low' ? '#10b981' : riskCategory === 'medium' ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className={`risk-badge-${riskCategory} px-1.5 py-0.5 rounded text-[10px] font-semibold`}>
              {policy.riskScore}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-secondary">Period</span>
          <span className="text-[10px] text-text-secondary font-mono">
            {policy.startDate} → {policy.endDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function CreatePolicyModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    holder: '',
    protocol: '',
    coverage: '',
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const selectedProtocol = protocols.find((p) => p.protocol === formData.protocol);
  const premiumRate = selectedProtocol
    ? selectedProtocol.riskScore < 30
      ? 0.025
      : selectedProtocol.riskScore < 60
        ? 0.045
        : selectedProtocol.riskScore < 80
          ? 0.065
          : 0.085
    : 0;
  const premiumAmount = formData.coverage ? parseFloat(formData.coverage) * premiumRate : 0;

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holder: formData.holder,
          protocol: formData.protocol,
          coverage: formData.coverage,
        }),
      });
      if (res.ok) setResult(await res.json());
    } catch {
      // fallback
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    const policy = (result as Record<string, unknown>).policy as Record<string, unknown> | undefined;
    const tx = (result as Record<string, unknown>).transaction as Record<string, unknown> | undefined;
    const uw = (result as Record<string, unknown>).underwriting as Record<string, unknown> | undefined;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={onClose}>
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-cyan" />
              UnderwriteAI Result
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
          </div>

          <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-accent-green" />
          </div>
          <p className="text-center text-sm font-bold text-text-primary mb-4">Policy Created Successfully</p>

          {policy && (
            <div className="bg-bg-primary rounded-lg p-3 mb-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Policy ID</span>
                <span className="text-xs font-mono text-accent-purple">{String(policy.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Coverage</span>
                <span className="text-xs font-bold text-accent-green">{Number(policy.coverageAmount).toLocaleString()} CSPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Premium Paid</span>
                <span className="text-xs font-bold text-accent-orange">{Number(policy.premiumPaid).toLocaleString()} CSPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Risk Score</span>
                <span className="text-xs font-bold">{String(policy.riskScore)}/100</span>
              </div>
            </div>
          )}

          {uw && (
            <div className="bg-bg-primary rounded-lg p-3 mb-3">
              <p className="text-xs text-text-secondary mb-1">Payment Method</p>
              <p className="text-sm font-medium text-accent-purple">{String((uw as Record<string, unknown>).paymentMethod)}</p>
            </div>
          )}

          {tx && (
            <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3">
              <p className="text-xs text-accent-purple font-semibold mb-1">On-chain Transaction</p>
              <p className="text-[10px] text-accent-purple/80 font-mono break-all">TX: {String((tx as Record<string, unknown>).txHash)}</p>
              <p className="text-[10px] text-text-secondary mt-1">Block #{String(result.blockHeight)} · Gas: {String((tx as Record<string, unknown>).gasCost)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-bg-card border border-border-main rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-purple" />
            Create Insurance Policy
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Wallet / ENS Name</label>
            <input
              type="text"
              placeholder="yourname.cspr"
              value={formData.holder}
              onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Protocol to Insure</label>
            <select
              value={formData.protocol}
              onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
            >
              <option value="">Select protocol...</option>
              {protocols.map((p) => (
                <option key={p.protocol} value={p.protocol}>
                  {p.protocol} — Risk: {p.riskScore}/100
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Coverage Amount (CSPR)</label>
            <input
              type="number"
              placeholder="10000"
              value={formData.coverage}
              onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>

          {selectedProtocol && formData.coverage && (
            <div className="bg-bg-primary rounded-lg p-4 space-y-2 border border-border-main">
              <h3 className="text-xs font-semibold text-text-primary mb-2">AI Risk Assessment</h3>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Risk Score</span>
                <span className={`text-xs font-bold ${selectedProtocol.riskScore < 30 ? 'text-accent-green' : selectedProtocol.riskScore < 60 ? 'text-accent-orange' : 'text-accent-red'}`}>
                  {selectedProtocol.riskScore}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Premium Rate</span>
                <span className="text-xs font-medium text-text-primary">{(premiumRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Quarterly Premium</span>
                <span className="text-xs font-bold text-accent-orange">{premiumAmount.toFixed(0)} CSPR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Payment Method</span>
                <span className="text-xs font-medium text-accent-purple">x402 Micropayment</span>
              </div>
              {selectedProtocol.alerts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border-main">
                  <p className="text-[10px] text-accent-orange flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {selectedProtocol.alerts[0]}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!formData.holder || !formData.protocol || !formData.coverage || processing}
            className="w-full bg-accent-purple hover:bg-accent-purple/90 disabled:bg-accent-purple/30 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Bot className="w-4 h-4 animate-spin" />
                UnderwriteAI processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Create Policy & Pay Premium via x402
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? policies : policies.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 max-w-7xl">
      <LiveNetworkBar />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Insurance Policies</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage and create AI-underwritten DeFi protection
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent-purple hover:bg-accent-purple/90 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
        {['all', 'active', 'claimed', 'expired', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-main'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>

      {showCreate && <CreatePolicyModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
