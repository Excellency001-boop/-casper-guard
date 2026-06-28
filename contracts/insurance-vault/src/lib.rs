//! CasperGuard Insurance Vault Smart Contract
//! Built with Odra framework for the Casper Network
//!
//! This contract manages the on-chain insurance protocol:
//! - Policy creation and premium collection
//! - Claims registration and payout execution
//! - Vault reserve management
//! - Agent authorization for autonomous operations

use odra::prelude::*;
use odra::{casper_types::U256, Address, Mapping, Var};

/// Insurance policy stored on-chain
#[odra::odra_type]
pub struct Policy {
    pub holder: Address,
    pub protocol_covered: String,
    pub coverage_amount: U256,
    pub premium_rate: u32, // basis points (e.g., 250 = 2.5%)
    pub premium_paid: U256,
    pub start_era: u64,
    pub end_era: u64,
    pub is_active: bool,
    pub risk_score: u32,
}

/// Insurance claim record
#[odra::odra_type]
pub struct Claim {
    pub policy_id: u64,
    pub claimant: Address,
    pub amount: U256,
    pub reason: String,
    pub evidence_hash: String,
    pub status: ClaimStatus,
    pub assessed_at_block: u64,
    pub ai_confidence: u32, // 0-100
}

/// Claim processing status
#[odra::odra_type]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
    UnderReview,
    PaidOut,
}

/// x402 micropayment record logged on-chain
#[odra::odra_type]
pub struct PaymentRecord {
    pub from: Address,
    pub to: Address,
    pub amount: U256,
    pub purpose: String,
    pub deploy_hash: String,
}

/// Main Insurance Vault Contract
#[odra::module]
pub struct InsuranceVault {
    /// Contract owner / admin
    owner: Var<Address>,
    /// Authorized AI agent addresses
    authorized_agents: Mapping<Address, bool>,
    /// Policy storage (id → policy)
    policies: Mapping<u64, Policy>,
    /// Claims storage (id → claim)
    claims: Mapping<u64, Claim>,
    /// Next policy ID counter
    next_policy_id: Var<u64>,
    /// Next claim ID counter
    next_claim_id: Var<u64>,
    /// Total value locked in the vault
    total_value_locked: Var<U256>,
    /// Total premiums collected
    total_premiums: Var<U256>,
    /// Total claims paid out
    total_claims_paid: Var<U256>,
    /// Reserve ratio target (basis points, e.g., 8500 = 85%)
    target_reserve_ratio: Var<u32>,
    /// x402 payment log
    payment_count: Var<u64>,
    payments: Mapping<u64, PaymentRecord>,
}

#[odra::module]
impl InsuranceVault {
    /// Initialize the vault with owner and default settings
    pub fn init(&mut self) {
        let caller = self.env().caller();
        self.owner.set(caller);
        self.next_policy_id.set(1);
        self.next_claim_id.set(1);
        self.total_value_locked.set(U256::zero());
        self.total_premiums.set(U256::zero());
        self.total_claims_paid.set(U256::zero());
        self.target_reserve_ratio.set(8500); // 85%
        self.payment_count.set(0);
    }

    // ─── Agent Authorization ───────────────────────────────────

    /// Authorize an AI agent to perform autonomous operations
    pub fn authorize_agent(&mut self, agent: Address) {
        self.only_owner();
        self.authorized_agents.set(&agent, true);
    }

    /// Revoke an agent's authorization
    pub fn revoke_agent(&mut self, agent: Address) {
        self.only_owner();
        self.authorized_agents.set(&agent, false);
    }

    /// Check if an address is an authorized agent
    pub fn is_authorized_agent(&self, agent: Address) -> bool {
        self.authorized_agents.get_or_default(&agent)
    }

    // ─── Policy Management ─────────────────────────────────────

    /// Create a new insurance policy (called by UnderwriteAI agent)
    #[odra(payable)]
    pub fn create_policy(
        &mut self,
        holder: Address,
        protocol_covered: String,
        coverage_amount: U256,
        premium_rate: u32,
        duration_eras: u64,
        risk_score: u32,
    ) -> u64 {
        self.only_authorized();

        let premium_paid = self.env().attached_value();
        let current_era = self.env().get_block_time(); // simplified

        let policy_id = self.next_policy_id.get_or_default();
        let policy = Policy {
            holder,
            protocol_covered,
            coverage_amount,
            premium_rate,
            premium_paid,
            start_era: current_era,
            end_era: current_era + duration_eras,
            is_active: true,
            risk_score,
        };

        self.policies.set(&policy_id, policy);
        self.next_policy_id.set(policy_id + 1);

        // Update vault totals
        let tvl = self.total_value_locked.get_or_default();
        self.total_value_locked.set(tvl + premium_paid);
        let premiums = self.total_premiums.get_or_default();
        self.total_premiums.set(premiums + premium_paid);

        policy_id
    }

    /// Get policy details
    pub fn get_policy(&self, policy_id: u64) -> Option<Policy> {
        self.policies.get(&policy_id)
    }

    /// Deactivate a policy (expiry or cancellation)
    pub fn deactivate_policy(&mut self, policy_id: u64) {
        self.only_authorized();
        if let Some(mut policy) = self.policies.get(&policy_id) {
            policy.is_active = false;
            self.policies.set(&policy_id, policy);
        }
    }

    // ─── Claims Processing ─────────────────────────────────────

    /// Register a new claim (called by ClaimBot agent)
    pub fn register_claim(
        &mut self,
        policy_id: u64,
        claimant: Address,
        amount: U256,
        reason: String,
        evidence_hash: String,
        ai_confidence: u32,
    ) -> u64 {
        self.only_authorized();

        // Verify policy exists and is active
        let policy = self.policies.get(&policy_id);
        if policy.is_none() {
            self.env().revert(VaultError::PolicyNotFound);
        }

        let claim_id = self.next_claim_id.get_or_default();
        let claim = Claim {
            policy_id,
            claimant,
            amount,
            reason,
            evidence_hash,
            status: ClaimStatus::Pending,
            assessed_at_block: self.env().get_block_time(),
            ai_confidence,
        };

        self.claims.set(&claim_id, claim);
        self.next_claim_id.set(claim_id + 1);

        claim_id
    }

    /// Approve and pay out a claim (called by ClaimBot after AI assessment)
    pub fn approve_claim(&mut self, claim_id: u64) {
        self.only_authorized();

        if let Some(mut claim) = self.claims.get(&claim_id) {
            claim.status = ClaimStatus::Approved;
            self.claims.set(&claim_id, claim.clone());

            // Transfer payout to claimant
            self.env().transfer_tokens(&claim.claimant, &claim.amount);

            // Update totals
            let paid = self.total_claims_paid.get_or_default();
            self.total_claims_paid.set(paid + claim.amount);

            // Mark as paid
            claim.status = ClaimStatus::PaidOut;
            self.claims.set(&claim_id, claim);
        }
    }

    /// Reject a claim
    pub fn reject_claim(&mut self, claim_id: u64) {
        self.only_authorized();

        if let Some(mut claim) = self.claims.get(&claim_id) {
            claim.status = ClaimStatus::Rejected;
            self.claims.set(&claim_id, claim);
        }
    }

    /// Get claim details
    pub fn get_claim(&self, claim_id: u64) -> Option<Claim> {
        self.claims.get(&claim_id)
    }

    // ─── x402 Payment Logging ──────────────────────────────────

    /// Log an x402 micropayment on-chain (agent-to-agent payments)
    pub fn log_payment(
        &mut self,
        from: Address,
        to: Address,
        amount: U256,
        purpose: String,
        deploy_hash: String,
    ) {
        self.only_authorized();

        let payment_id = self.payment_count.get_or_default();
        let record = PaymentRecord {
            from,
            to,
            amount,
            purpose,
            deploy_hash,
        };

        self.payments.set(&payment_id, record);
        self.payment_count.set(payment_id + 1);
    }

    // ─── Vault Stats ───────────────────────────────────────────

    /// Get total value locked
    pub fn get_tvl(&self) -> U256 {
        self.total_value_locked.get_or_default()
    }

    /// Get total premiums collected
    pub fn get_total_premiums(&self) -> U256 {
        self.total_premiums.get_or_default()
    }

    /// Get total claims paid
    pub fn get_total_claims_paid(&self) -> U256 {
        self.total_claims_paid.get_or_default()
    }

    /// Get current reserve ratio (basis points)
    pub fn get_reserve_ratio(&self) -> u32 {
        let tvl = self.total_value_locked.get_or_default();
        let paid = self.total_claims_paid.get_or_default();
        if tvl.is_zero() {
            return 10000; // 100% if no funds
        }
        let remaining = tvl.saturating_sub(paid);
        // (remaining / tvl) * 10000
        let ratio = (remaining * U256::from(10000)) / tvl;
        ratio.as_u32()
    }

    /// Get next policy ID (total policies created)
    pub fn get_policy_count(&self) -> u64 {
        self.next_policy_id.get_or_default().saturating_sub(1)
    }

    /// Get next claim ID (total claims filed)
    pub fn get_claim_count(&self) -> u64 {
        self.next_claim_id.get_or_default().saturating_sub(1)
    }

    // ─── Internal Helpers ──────────────────────────────────────

    fn only_owner(&self) {
        if self.env().caller() != self.owner.get_or_revert_with(VaultError::NotOwner) {
            self.env().revert(VaultError::NotOwner);
        }
    }

    fn only_authorized(&self) {
        let caller = self.env().caller();
        let is_owner = self.owner.get().map_or(false, |o| o == caller);
        let is_agent = self.authorized_agents.get_or_default(&caller);
        if !is_owner && !is_agent {
            self.env().revert(VaultError::NotAuthorized);
        }
    }
}

/// Contract error types
#[odra::odra_error]
pub enum VaultError {
    NotOwner = 1,
    NotAuthorized = 2,
    PolicyNotFound = 3,
    ClaimNotFound = 4,
    InsufficientFunds = 5,
    PolicyExpired = 6,
    InvalidAmount = 7,
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostEnv, HostRef};

    #[test]
    fn test_vault_init() {
        let env = odra_test::env();
        let vault = InsuranceVaultHostRef::deploy(&env, InsuranceVaultInitArgs {});
        assert_eq!(vault.get_policy_count(), 0);
        assert_eq!(vault.get_claim_count(), 0);
        assert_eq!(vault.get_tvl(), U256::zero());
    }

    #[test]
    fn test_agent_authorization() {
        let env = odra_test::env();
        let mut vault = InsuranceVaultHostRef::deploy(&env, InsuranceVaultInitArgs {});
        let agent = env.get_account(1);

        assert!(!vault.is_authorized_agent(agent));
        vault.authorize_agent(agent);
        assert!(vault.is_authorized_agent(agent));
        vault.revoke_agent(agent);
        assert!(!vault.is_authorized_agent(agent));
    }
}
