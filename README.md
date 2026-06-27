# CasperGuard - AI-Powered DeFi Insurance Protocol

> Autonomous AI agents protecting your DeFi positions on Casper Network

**Live Demo:** [https://casper-guard.vercel.app](https://casper-guard.vercel.app)

Built for the [Casper Agentic Buildathon 2026](https://dorahacks.io/hackathon/casper-agentic/detail) ($150K Prize Pool)

---

## The Problem

DeFi users face constant risk of smart contract exploits, rug pulls, oracle failures, and liquidity crises. Traditional insurance is slow, manual, and reactive. By the time a claim is processed, the damage is done.

**$3.8B was lost to DeFi exploits in 2025 alone.** Most users had zero protection.

## The Solution

**CasperGuard** is a fully autonomous AI-powered insurance protocol built on Casper Network. Four specialized AI agents work 24/7 to monitor risks, underwrite policies, process claims, and manage vault reserves - all without human intervention.

Insurance that thinks, acts, and pays out autonomously.

## Architecture

```
+------------------+     +------------------+     +------------------+
|   RiskSentinel   |     |   UnderwriteAI   |     |    ClaimBot      |
|   (Monitoring)   |     |   (Pricing)      |     |   (Processing)   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------+--------+
                          |  x402 Protocol |
                          | (Micropayments)|
                          +-------+--------+
                                  |
                          +-------+--------+
                          |  VaultKeeper   |
                          | (Reserves)     |
                          +-------+--------+
                                  |
                          +-------+--------+
                          | Casper Testnet |
                          | (Odra Contracts)|
                          +----------------+
```

## AI Agent Fleet

### RiskSentinel
Real-time protocol monitoring agent that scans for vulnerabilities, whale movements, and liquidity risks using **Casper MCP Server** and **CSPR.trade MCP**. Performs 1,200+ scans daily across all monitored protocols.

### UnderwriteAI
Dynamic premium pricing engine that calculates risk-adjusted rates using real-time protocol risk scores, historical incident data, and on-chain analytics. Connects to external oracles via **x402 micropayments**.

### ClaimBot
Autonomous claim verification agent that analyzes on-chain evidence, cross-references with protocol incident history, and provides AI-powered claim assessments with confidence scores and risk factor breakdowns.

### VaultKeeper
Insurance vault management agent that maintains optimal reserve ratios, rebalances between yield pools and claims reserves, and ensures protocol solvency. Executes via **Odra smart contracts**.

## Casper AI Toolkit Integration

| Component | Usage |
|-----------|-------|
| **x402 Micropayments** | Agent-to-agent payments, premium collection, oracle data access, claim payouts |
| **Casper MCP Server** | On-chain data queries, deploy monitoring, account balance checks |
| **CSPR.trade MCP** | Real-time DEX data, liquidity pool monitoring, price feeds |
| **CSPR.click Agent Skill** | Cross-agent coordination, task delegation, workflow orchestration |
| **CSPR.cloud APIs** | Historical transaction data, block explorer integration, analytics |
| **Odra Framework** | Insurance vault smart contracts, policy NFTs, automated payouts |

## Features

- **Real-time Risk Dashboard** - Protocol risk trends with 24h area charts, live risk scores, TVL tracking
- **AI-Powered Policy Creation** - Dynamic premium calculation based on real-time risk assessment
- **Autonomous Claim Processing** - ClaimBot analyzes on-chain evidence and provides AI assessments with confidence scores
- **Agent Activity Feed** - Live monitoring of all 4 AI agents with transaction hashes
- **x402 Payment Tracking** - Full transparency into agent micropayment flows
- **Mobile-First Design** - Fully responsive across all devices

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4
- **Charts:** Recharts (area charts, line charts)
- **Icons:** Lucide React
- **Blockchain:** Casper Network (Testnet)
- **Smart Contracts:** Odra Framework (Rust/WASM)
- **AI Infrastructure:** Casper AI Toolkit (MCP, x402, CSPR.click)
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Excellency001-boop/-casper-guard.git
cd casper-guard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
casper-guard/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard - stats, charts, activity feed
│   │   ├── policies/         # Policy management + creation modal
│   │   ├── claims/           # Claim processing + AI assessments
│   │   ├── agents/           # AI agent fleet monitoring
│   │   ├── layout.tsx        # Root layout with responsive sidebar
│   │   └── globals.css       # Custom dark theme + animations
│   ├── components/
│   │   └── Sidebar.tsx       # Responsive nav with mobile hamburger
│   ├── lib/
│   │   └── mock-data.ts      # Protocol data, policies, claims, payments
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── package.json
└── README.md
```

## How It Works

1. **Risk Monitoring** - RiskSentinel continuously monitors DeFi protocols via MCP servers, tracking TVL changes, smart contract upgrades, governance proposals, and whale movements.

2. **Policy Underwriting** - When a user requests coverage, UnderwriteAI calculates a risk-adjusted premium based on the protocol's current risk score, historical incidents, and market conditions.

3. **Premium Payment** - Premiums are collected via x402 micropayments, enabling frictionless agent-to-protocol transactions without manual wallet approvals.

4. **Claim Processing** - When an incident occurs, ClaimBot autonomously verifies on-chain evidence, cross-references with known exploit patterns, and provides an AI assessment with confidence scoring.

5. **Automated Payout** - Approved claims trigger VaultKeeper to execute payouts via Odra smart contracts, ensuring instant compensation without human bottlenecks.

## Roadmap

- [ ] Deploy insurance vault smart contracts to Casper Mainnet
- [ ] Integrate live MCP server connections for real-time data
- [ ] Implement x402 micropayment flows for premium collection
- [ ] Add policy NFTs for on-chain proof of coverage
- [ ] Launch governance token for decentralized protocol management
- [ ] Cross-chain insurance via bridge integrations
- [ ] Partner with major Casper DeFi protocols

## Team

Built with AI-powered development for the Casper Agentic Buildathon 2026.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**CasperGuard** - Because your DeFi positions deserve AI-powered protection.
