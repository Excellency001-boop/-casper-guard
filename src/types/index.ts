export interface Policy {
  id: string;
  holder: string;
  walletAddress: string;
  protocolCovered: string;
  coverageAmount: number;
  premiumRate: number;
  premiumPaid: number;
  status: 'active' | 'expired' | 'claimed' | 'pending';
  riskScore: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  claimant: string;
  amount: number;
  reason: string;
  evidence: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'paid';
  aiAssessment?: AIAssessment;
  submittedAt: string;
  resolvedAt?: string;
  txHash?: string;
}

export interface AIAssessment {
  riskScore: number;
  confidence: number;
  recommendation: 'approve' | 'reject' | 'review';
  reasoning: string;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface AgentActivity {
  id: string;
  agentName: string;
  agentType: 'risk-monitor' | 'claim-processor' | 'underwriter' | 'vault-manager';
  action: string;
  details: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  txHash?: string;
  gasUsed?: number;
}

export interface ProtocolRisk {
  protocol: string;
  riskScore: number;
  tvl: number;
  change24h: number;
  alerts: string[];
  lastUpdated: string;
  category: 'low' | 'medium' | 'high' | 'critical';
}

export interface VaultStats {
  totalValueLocked: number;
  totalPolicies: number;
  activeClaims: number;
  totalPremiumsCollected: number;
  totalClaimsPaid: number;
  reserveRatio: number;
  agentTransactions: number;
}

export interface X402Payment {
  id: string;
  from: string;
  to: string;
  amount: number;
  purpose: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}
