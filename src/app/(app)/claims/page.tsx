'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Bot,
  ArrowRight,
  Shield,
  FileText,
  X,
  Plus,
  Eye,
} from 'lucide-react';
import { claims, policies } from '@/lib/mock-data';
import type { Claim } from '@/types';
import LiveNetworkBar from '@/components/LiveNetworkBar';

function ClaimStatusBadge({ status }: { status: Claim['status'] }) {
  const config: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    pending: { icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    reviewing: { icon: Search, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    approved: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    rejected: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    paid: { icon: CheckCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ClaimDetail({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-bg-card border border-border-main rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-orange" />
            Claim {claim.id}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Claimant</p>
            <p className="text-sm font-semibold text-text-primary">{claim.claimant}</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Policy</p>
            <p className="text-sm font-semibold text-text-primary">{claim.policyId}</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Claim Amount</p>
            <p className="text-sm font-bold text-accent-orange">{claim.amount.toLocaleString()} CSPR</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Status</p>
            <ClaimStatusBadge status={claim.status} />
          </div>
        </div>

        <div className="bg-bg-primary rounded-lg p-4 mb-4">
          <p className="text-xs text-text-secondary mb-1">Reason</p>
          <p className="text-sm text-text-primary">{claim.reason}</p>
        </div>

        <div className="bg-bg-primary rounded-lg p-4 mb-4">
          <p className="text-xs text-text-secondary mb-1">Evidence</p>
          <p className="text-sm text-text-primary font-mono">{claim.evidence}</p>
        </div>

        {claim.aiAssessment && (
          <div className="gradient-border p-5 mb-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-accent-purple" />
              ClaimBot AI Assessment
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary mb-1">Risk Score</p>
                <p className={`text-2xl font-bold ${claim.aiAssessment.riskScore > 70 ? 'text-accent-red' : claim.aiAssessment.riskScore > 40 ? 'text-accent-orange' : 'text-accent-green'}`}>
                  {claim.aiAssessment.riskScore}
                </p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary mb-1">Confidence</p>
                <p className="text-2xl font-bold text-accent-blue">
                  {(claim.aiAssessment.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <p className="text-xs text-text-secondary mb-1">Decision</p>
                <p className={`text-lg font-bold ${
                  claim.aiAssessment.recommendation === 'approve' ? 'text-accent-green' :
                  claim.aiAssessment.recommendation === 'reject' ? 'text-accent-red' : 'text-accent-orange'
                }`}>
                  {claim.aiAssessment.recommendation.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="bg-bg-primary rounded-lg p-3 mb-4">
              <p className="text-xs text-text-secondary mb-1">AI Reasoning</p>
              <p className="text-sm text-text-primary">{claim.aiAssessment.reasoning}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-secondary mb-2">Risk Factors</p>
              {claim.aiAssessment.factors.map((f) => (
                <div key={f.name} className="bg-bg-primary rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-text-primary">{f.name}</span>
                    <span className="text-xs font-bold" style={{ color: f.score > 70 ? '#10b981' : f.score > 40 ? '#f59e0b' : '#ef4444' }}>
                      {f.score}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-card rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${f.score}%`,
                        backgroundColor: f.score > 70 ? '#10b981' : f.score > 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary">{f.description}</p>
                  <p className="text-[10px] text-text-secondary/70">Weight: {(f.weight * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {claim.txHash && (
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-3">
            <p className="text-xs text-accent-green font-semibold mb-1">Payout Executed</p>
            <p className="text-[10px] text-accent-green/80 font-mono break-all">TX: {claim.txHash}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitClaimModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ policyId: '', amount: '', reason: '', evidence: '' });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimant: 'User',
          policyId: formData.policyId,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          evidence: formData.evidence || '0x' + Math.random().toString(16).slice(2),
        }),
      });
      if (res.ok) setResult(await res.json());
    } catch {
      // show fallback
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    const r = result as Record<string, unknown>;
    const assessment = r.assessment as Record<string, unknown> | undefined;
    const claim = r.claim as Record<string, unknown> | undefined;
    const tx = r.transaction as Record<string, unknown> | undefined;
    const x402 = r.x402Payment as Record<string, unknown> | undefined;
    const odra = r.odraContract as Record<string, unknown> | undefined;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={onClose}>
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-purple" />
              ClaimBot Assessment
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
          </div>

          {/* Integration badges */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {assessment?.aiPowered ? (
              <span className="text-[10px] bg-accent-cyan/15 text-accent-cyan px-2 py-0.5 rounded-full font-semibold">AI-Powered</span>
            ) : null}
            <span className="text-[10px] bg-accent-orange/15 text-accent-orange px-2 py-0.5 rounded-full font-semibold">x402 Payment</span>
            <span className="text-[10px] bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full font-semibold">On-chain Signed</span>
            {odra && <span className="text-[10px] bg-accent-green/15 text-accent-green px-2 py-0.5 rounded-full font-semibold">Odra Contract</span>}
            <span className="text-[10px] bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded-full font-semibold">MCP: {String(r.dataSource || 'Casper Testnet')}</span>
          </div>

          {claim && (
            <div className="bg-bg-primary rounded-lg p-3 mb-3">
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Claim ID</span>
                <span className="text-sm font-mono text-accent-purple">{String(claim.id)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-secondary">Block</span>
                <span className="text-xs text-text-primary font-mono">#{String(r.blockHeight)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-secondary">Protocol</span>
                <span className="text-xs text-text-primary">{String(claim.protocol)}</span>
              </div>
            </div>
          )}

          {assessment && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-bg-primary rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary mb-1">Risk</p>
                  <p className="text-xl font-bold text-accent-orange">{String(assessment.riskScore)}</p>
                </div>
                <div className="bg-bg-primary rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary mb-1">Confidence</p>
                  <p className="text-xl font-bold text-accent-blue">{typeof assessment.confidence === 'number' && assessment.confidence < 1 ? `${(assessment.confidence * 100).toFixed(0)}%` : String(assessment.confidence)}</p>
                </div>
                <div className="bg-bg-primary rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary mb-1">Decision</p>
                  <p className={`text-sm font-bold ${String(assessment.recommendation) === 'approve' ? 'text-accent-green' : String(assessment.recommendation) === 'reject' ? 'text-accent-red' : 'text-accent-orange'}`}>
                    {String(assessment.recommendation).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-accent-cyan mb-1 flex items-center gap-1">
                  {assessment.aiPowered ? '🧠 Claude AI Reasoning' : '📊 Algorithmic Reasoning'}
                  <span className="text-[10px] text-text-secondary font-normal ml-auto">{String(assessment.model)}</span>
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">{String(assessment.reasoning)}</p>
              </div>
            </>
          )}

          {/* x402 Payment */}
          {x402 && (
            <div className="bg-accent-orange/5 border border-accent-orange/20 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-accent-orange mb-1">x402 Micropayment</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-secondary">Processing Fee</span>
                <span className="text-accent-orange font-mono">{String(x402.amount)}</span>
              </div>
              <p className="text-[10px] text-text-secondary/70 font-mono mt-1 break-all">Deploy: {String(x402.deployHash).slice(0, 32)}...</p>
            </div>
          )}

          {/* On-chain Transaction */}
          {tx && (
            <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-accent-purple font-semibold mb-1">On-chain Transaction</p>
              <p className="text-[10px] text-accent-purple/80 font-mono break-all">Deploy: {String(tx.deployHash)}</p>
              <p className="text-[10px] text-text-secondary mt-1">
                Chain: {String(tx.chainName)} · {tx.submitted ? '✅ Submitted' : '📝 Signed'}
              </p>
            </div>
          )}

          {/* Odra Contract */}
          {odra && (
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3">
              <p className="text-xs text-accent-green font-semibold mb-1">Odra Smart Contract</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Entry Point</span>
                  <span className="text-accent-green font-mono">{String(odra.entryPoint)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Framework</span>
                  <span className="text-text-primary font-mono">{String(odra.framework)}</span>
                </div>
              </div>
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
            <AlertTriangle className="w-5 h-5 text-accent-orange" />
            Submit a Claim
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Policy ID</label>
            <select
              value={formData.policyId}
              onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-purple/50"
            >
              <option value="">Select policy...</option>
              {policies.filter(p => p.status === 'active').map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.protocolCovered} ({p.holder})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Claim Amount (CSPR)</label>
            <input
              type="number"
              placeholder="5000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-purple/50"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Reason</label>
            <textarea
              placeholder="Describe the incident..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-purple/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">On-chain Evidence (TX hash / Deploy hash)</label>
            <input
              type="text"
              placeholder="0x..."
              value={formData.evidence}
              onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
              className="w-full bg-bg-primary border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-purple/50 font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.policyId || !formData.amount || !formData.reason || processing}
            className="w-full bg-accent-orange hover:bg-accent-orange/90 disabled:bg-accent-orange/30 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Bot className="w-4 h-4 animate-spin" />
                ClaimBot analyzing evidence...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Submit Claim for AI Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl">
      <LiveNetworkBar />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Insurance Claims</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            AI-powered claim processing and verification
          </p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="bg-accent-orange hover:bg-accent-orange/90 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit Claim
        </button>
      </div>

      <div className="space-y-3">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="bg-bg-card border border-border-main rounded-xl p-5 hover:border-accent-purple/30 transition-all cursor-pointer"
            onClick={() => setSelectedClaim(claim)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent-orange/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{claim.id}</p>
                  <p className="text-xs text-text-secondary">{claim.claimant} · Policy {claim.policyId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 flex-wrap pl-12 sm:pl-0">
                <div className="sm:text-right">
                  <p className="text-sm font-bold text-accent-orange">{claim.amount.toLocaleString()} CSPR</p>
                  <p className="text-[10px] text-text-secondary">
                    {new Date(claim.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <ClaimStatusBadge status={claim.status} />

                {claim.aiAssessment && (
                  <div className="flex items-center gap-2 bg-bg-primary rounded-lg px-2.5 sm:px-3 py-1.5">
                    <Bot className="w-3 h-3 text-accent-purple" />
                    <span className="text-xs text-text-secondary">AI:</span>
                    <span className={`text-xs font-bold ${
                      claim.aiAssessment.recommendation === 'approve' ? 'text-accent-green' :
                      claim.aiAssessment.recommendation === 'reject' ? 'text-accent-red' : 'text-accent-orange'
                    }`}>
                      {claim.aiAssessment.recommendation.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      ({(claim.aiAssessment.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}

                <button className="text-text-secondary hover:text-accent-purple transition-colors hidden sm:block">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary mt-2 sm:mt-3 pl-12 sm:pl-14 truncate">{claim.reason}</p>
          </div>
        ))}
      </div>

      {selectedClaim && <ClaimDetail claim={selectedClaim} onClose={() => setSelectedClaim(null)} />}
      {showSubmit && <SubmitClaimModal onClose={() => setShowSubmit(false)} />}
    </div>
  );
}
