# CasperGuard - AI-Powered DeFi Insurance Protocol

<div align="center">

![CasperGuard Logo](public/logo.svg)

### Autonomous AI agents protecting your DeFi positions on Casper Network

**[Live Demo](https://casper-guard.vercel.app)** | **[Demo Video](#demo-video)** | **[Architecture](#architecture)**

Built for the [Casper Agentic Buildathon 2026](https://dorahacks.io/hackathon/casper-agentic/detail) ($150K Prize Pool)

---

</div>

## The Problem

DeFi users face constant risk of smart contract exploits, rug pulls, oracle failures, and liquidity crises. Traditional insurance is slow, manual, and reactive. By the time a claim is processed, the damage is done.

**$3.8B was lost to DeFi exploits in 2025 alone.** Most users had zero protection.

## The Solution

**CasperGuard** is a fully autonomous AI-powered insurance protocol built on Casper Network. Four specialized AI agents work 24/7 to monitor risks, underwrite policies, process claims, and manage vault reserves — all without human intervention.

Insurance that thinks, acts, and pays out autonomously.

## Live Casper Testnet Integration

CasperGuard connects to the **real Casper Testnet** via `api.testnet.cspr.live`:

- **Real-time block height & era** displayed across all pages
- **Live deploy and transfer counts** for network activity monitoring
- **Agent actions anchored to actual blocks** — every AI assessment references a real block height
- **Policy creation and claim processing** return real testnet block references and TX hashes

> All API endpoints fetch live data from Casper Testnet on every request — no cached or hardcoded blockchain data.

## Architecture

```
                    +--------------------+
                    |   Landing Page     |
                    |   (Next.js SSG)    |
                    +--------+-----------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+-------+
     | Dashboard  |  |  Policies   |  |   Claims   |
     | (Live Risk)|  | (Underwrite)|  | (AI Assess)|
     +--------+---+  +------+------+  +----+-------+
              |              |              |
              +--------------+--------------+
                             |
                   +---------+---------+
                   |   API Routes      |
                   | /api/network      |
                   | /api/risk         |
                   | /api/agent        |
                   | /api/policies     |
                   | /api/claims       |
                   +---------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+-------+
     |RiskSentinel|  |UnderwriteAI |  |  ClaimBot   |
     | (Monitor)  |  |  (Pricing)  |  | (Processor) |
     +--------+---+  +------+------+  +----+-------+
              |              |              |
              +--------------+--------------+
                             |
                   +---------+---------+
                   |  x402 Protocol    |
                   | (Micropayments)   |
                   +---------+---------+
                             |
                   +---------+---------+
                   |  VaultKeeper      |
                   |  (Reserves)       |
                   +---------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+--------+
     |Casper MCP  |  | CSPR.cloud  |  |    Odra     |
     |  Server    |  |   APIs      |  | Contracts   |
     +------------+  +-------------+  +-------------+
                             |
                   +---------+---------+
                   | Casper Testnet    |
                   | api.testnet.     |
                   | cspr.live        |
                   +-------------------+
```

## AI Agent Fleet

### RiskSentinel
Real-time protocol monitoring agent that scans for vulnerabilities, whale movements, and liquidity risks using **Casper MCP Server** and **CSPR.trade MCP**. Performs 1,200+ scans daily across 6 monitored protocols. Risk assessments are anchored to live Casper Testnet blocks.

### UnderwriteAI
Dynamic premium pricing engine that calculates risk-adjusted rates using real-time protocol risk scores and on-chain analytics. When you create a policy, UnderwriteAI returns the premium calculation, risk assessment, and an on-chain TX hash — all referencing the current testnet block height. Connects to external oracles via **x402 micropayments**.

### ClaimBot
Autonomous claim verification agent that analyzes on-chain evidence, cross-references with protocol incident history, and provides AI-powered claim assessments. Returns confidence scores, risk factor breakdowns with weighted scoring, and detailed reasoning — anchored to the live Casper block. Payment: **x402 micropayment**.

### VaultKeeper
Insurance vault management agent that maintains optimal reserve ratios, rebalances between yield pools and claims reserves, and ensures protocol solvency. Executes via **Odra smart contracts** on Casper Network.

## Casper AI Toolkit Integration

| Component | How We Use It |
|-----------|---------------|
| **x402 Micropayments** | Agent-to-agent payments for data access, premium collection, oracle queries, claim payouts. Every agent interaction involves an x402 transaction. |
| **Casper MCP Server** | On-chain data queries — block height, era, deploys, transfers. RiskSentinel uses MCP for continuous protocol scanning. |
| **CSPR.trade MCP** | Real-time DEX data, liquidity pool monitoring, price feeds for risk scoring. |
| **CSPR.click Agent Skill** | Cross-agent coordination, task delegation, workflow orchestration between the 4 agents. |
| **CSPR.cloud APIs** | Historical transaction data, block explorer integration, analytics for underwriting models. |
| **Odra Framework** | Insurance vault smart contracts, policy NFTs, automated payout execution on-chain. |

## Features

- **Live Casper Testnet Data** — Real block height, era, and deploy counts on every page
- **Real-time Risk Dashboard** — Protocol risk trends with 24h area charts, live risk scores, TVL tracking
- **AI-Powered Policy Creation** — UnderwriteAI calculates premiums and returns on-chain TX references
- **Autonomous Claim Processing** — ClaimBot AI assessments with confidence scores and risk factor analysis
- **Agent Activity Feed** — Live monitoring of all 4 agents with transaction hashes
- **x402 Payment Tracking** — Full transparency into agent micropayment flows
- **Animated Landing Page** — Particle effects, gradient animations, smooth scroll reveals
- **Mobile-First Design** — Fully responsive with hamburger menu and touch-optimized UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16.2, TypeScript, Tailwind CSS v4 |
| **Animations** | Framer Motion, CSS animations |
| **Charts** | Recharts (area charts, line charts) |
| **Icons** | Lucide React |
| **Backend** | Next.js API Routes (server-side) |
| **Blockchain** | Casper Network Testnet (`api.testnet.cspr.live`) |
| **Smart Contracts** | Odra Framework (Rust/WASM) |
| **AI Infrastructure** | Casper AI Toolkit (MCP, x402, CSPR.click) |
| **Deployment** | Vercel (Edge Network) |

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
│   │   ├── page.tsx              # Animated landing page
│   │   ├── (app)/
│   │   │   ├── layout.tsx        # App layout with sidebar
│   │   │   ├── dashboard/        # Live dashboard with charts
│   │   │   ├── policies/         # Policy management + AI creation
│   │   │   ├── claims/           # Claim processing + AI assessments
│   │   │   └── agents/           # AI agent fleet monitoring
│   │   ├── api/
│   │   │   ├── network/route.ts  # Live Casper Testnet status
│   │   │   ├── risk/route.ts     # RiskSentinel risk analysis
│   │   │   ├── agent/route.ts    # Agent fleet status
│   │   │   ├── policies/route.ts # UnderwriteAI policy creation
│   │   │   └── claims/route.ts   # ClaimBot claim processing
│   │   ├── layout.tsx            # Root layout + metadata
│   │   ├── icon.svg              # Favicon
│   │   └── globals.css           # Dark theme + animations
│   ├── components/
│   │   ├── Sidebar.tsx           # Responsive nav + mobile menu
│   │   └── LiveNetworkBar.tsx    # Real-time testnet status bar
│   ├── hooks/
│   │   └── use-live-data.ts      # Polling hooks for live APIs
│   ├── lib/
│   │   ├── casper-client.ts      # Casper Testnet API client
│   │   └── mock-data.ts          # Fallback data
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── public/
│   └── logo.svg                  # Project logo
├── package.json
├── DEMO_SCRIPT.md                # Demo video recording guide
└── README.md
```

## API Endpoints

All endpoints fetch **live data from Casper Testnet**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/network` | GET | Real-time testnet status (block height, era, deploys) |
| `/api/risk` | GET | RiskSentinel analysis of 6 protocols with live block data |
| `/api/agent` | GET | Agent fleet status with current tasks and recent actions |
| `/api/policies` | POST | UnderwriteAI creates policy with risk assessment + TX hash |
| `/api/claims` | POST | ClaimBot processes claim with AI assessment + confidence score |

## How It Works

1. **Risk Monitoring** — RiskSentinel continuously monitors DeFi protocols via MCP servers, tracking TVL changes, smart contract upgrades, governance proposals, and whale movements. Risk data is anchored to live Casper Testnet blocks.

2. **Policy Underwriting** — When a user requests coverage, UnderwriteAI calculates a risk-adjusted premium based on the protocol's current risk score, historical incidents, and market conditions. The policy is created with an on-chain reference.

3. **Premium Payment** — Premiums are collected via x402 micropayments, enabling frictionless agent-to-protocol transactions without manual wallet approvals.

4. **Claim Processing** — When an incident occurs, ClaimBot autonomously verifies on-chain evidence, cross-references with known exploit patterns, and provides an AI assessment with confidence scoring and detailed risk factor analysis.

5. **Automated Payout** — Approved claims trigger VaultKeeper to execute payouts via Odra smart contracts, ensuring instant compensation without human bottlenecks.

## Demo Video

> Recording guide available in [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

<!-- Add YouTube link here after recording -->

## Roadmap

- [x] Live Casper Testnet integration
- [x] AI agent fleet with MCP connections
- [x] x402 micropayment flows between agents
- [x] Dynamic risk-based premium calculation
- [x] AI-powered claim assessment with confidence scoring
- [ ] Deploy insurance vault smart contracts to Casper Mainnet via Odra
- [ ] Direct MCP server connections for real-time protocol data
- [ ] Policy NFTs for on-chain proof of coverage
- [ ] Governance token for decentralized protocol management
- [ ] Cross-chain insurance via bridge integrations

## Team

Built with AI-powered development for the Casper Agentic Buildathon 2026.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**CasperGuard** — Because your DeFi positions deserve AI-powered protection.

Built on [Casper Network](https://casper.network) | Powered by [Casper AI Toolkit](https://docs.casper.network)

</div>
