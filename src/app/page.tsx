'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Bot,
  Zap,
  Eye,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Lock,
  Activity,
  Globe,
  Cpu,
  ChevronDown,
} from 'lucide-react';

const agents = [
  {
    name: 'RiskSentinel',
    icon: Eye,
    color: '#8b5cf6',
    desc: 'Real-time protocol monitoring using MCP Servers. Scans 1,200+ data points daily for vulnerabilities, whale movements & liquidity risks.',
    tag: 'Casper MCP + CSPR.trade',
  },
  {
    name: 'ClaimBot',
    icon: Shield,
    color: '#3b82f6',
    desc: 'Autonomous claim verification with AI-powered evidence analysis. 96% accuracy with sub-3-minute processing.',
    tag: 'CSPR.cloud APIs',
  },
  {
    name: 'UnderwriteAI',
    icon: TrendingUp,
    color: '#06b6d4',
    desc: 'Dynamic premium pricing engine. Calculates risk-adjusted rates from real-time protocol scores & historical data.',
    tag: 'x402 Micropayments',
  },
  {
    name: 'VaultKeeper',
    icon: DollarSign,
    color: '#10b981',
    desc: 'Insurance vault management. Maintains 89% reserve ratio, rebalances yield pools & executes automated payouts.',
    tag: 'Odra Smart Contracts',
  },
];

const stats = [
  { value: '$2.45M', label: 'Total Value Locked', icon: DollarSign },
  { value: '147', label: 'Active Policies', icon: Shield },
  { value: '1,284', label: 'Agent Operations', icon: Bot },
  { value: '96%', label: 'AI Accuracy', icon: CheckCircle },
];

const toolkitItems = [
  { name: 'x402 Protocol', desc: 'Agent micropayments', color: '#f59e0b' },
  { name: 'Casper MCP', desc: 'On-chain data queries', color: '#8b5cf6' },
  { name: 'CSPR.trade', desc: 'DEX data feeds', color: '#3b82f6' },
  { name: 'CSPR.click', desc: 'Agent coordination', color: '#06b6d4' },
  { name: 'CSPR.cloud', desc: 'Analytics APIs', color: '#10b981' },
  { name: 'Odra Framework', desc: 'Smart contracts', color: '#ef4444' },
];

function ParticleField() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent-purple/30 animate-pulse-glow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">CasperGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Agents</a>
            <a href="#toolkit" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Toolkit</a>
            <a href="#how" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
          </div>
          <Link
            href="/dashboard"
            className="bg-accent-purple hover:bg-accent-purple/90 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-accent-purple/25 flex items-center gap-2"
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6">
        <ParticleField />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-slide-up inline-flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs sm:text-sm text-accent-purple font-medium">Live on Casper Testnet</span>
          </div>

          <h1
            className="animate-slide-up text-4xl sm:text-5xl md:text-7xl font-black text-text-primary leading-[1.1] mb-6"
            style={{ animationDelay: '0.1s' }}
          >
            AI Agents That{' '}
            <span className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan bg-clip-text text-transparent">
              Protect
            </span>{' '}
            Your DeFi
          </h1>

          <p
            className="animate-slide-up text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animationDelay: '0.2s' }}
          >
            Four autonomous AI agents monitor risks, underwrite policies, process claims, and manage vault reserves — all without human intervention. Built on Casper Network.
          </p>

          <div
            className="animate-slide-up flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all hover:shadow-xl hover:shadow-accent-purple/30 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Shield className="w-5 h-5" />
              Launch Dashboard
            </Link>
            <a
              href="https://github.com/Excellency001-boop/-casper-guard"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-card hover:bg-bg-card-hover border border-border-main text-text-primary px-8 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Globe className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>

        <div
          className="animate-slide-up absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animationDelay: '1s' }}
        >
          <span className="text-xs text-text-secondary">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-text-secondary animate-bounce" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-border-main bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-slide-up text-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-accent-purple" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Fleet */}
      <section id="agents" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-slide-up text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-accent-purple uppercase tracking-widest">Autonomous Protection</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary mt-3 mb-4">
              Meet Your AI Agent Fleet
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
              Four specialized agents working 24/7 to monitor, assess, insure, and protect your DeFi positions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="animate-slide-up group bg-bg-card border border-border-main rounded-2xl p-6 sm:p-8 hover:border-accent-purple/30 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${agent.color}15` }}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary">{agent.name}</h3>
                      <span
                        className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
                      >
                        {agent.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{agent.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Casper AI Toolkit */}
      <section id="toolkit" className="py-20 sm:py-28 px-4 sm:px-6 bg-bg-secondary/30 border-y border-border-main">
        <div className="max-w-7xl mx-auto">
          <div className="animate-slide-up text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">Full Stack Integration</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary mt-3 mb-4">
              Powered by Casper AI Toolkit
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
              Deep integration with every component of the Casper AI ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {toolkitItems.map((item, i) => (
              <div
                key={item.name}
                className="animate-slide-up bg-bg-card border border-border-main rounded-xl p-5 sm:p-6 text-center hover:border-accent-purple/20 transition-all"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-3"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}40` }}
                />
                <p className="text-sm sm:text-base font-bold text-text-primary">{item.name}</p>
                <p className="text-xs text-text-secondary mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-slide-up text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-accent-green uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary mt-3 mb-4">
              How CasperGuard Works
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              {
                step: '01',
                title: 'Continuous Monitoring',
                desc: 'RiskSentinel monitors DeFi protocols via Casper MCP Server — tracking TVL changes, contract upgrades, governance proposals, and whale movements in real-time.',
                icon: Eye,
                color: '#8b5cf6',
              },
              {
                step: '02',
                title: 'AI Underwriting',
                desc: 'UnderwriteAI calculates dynamic premium rates based on risk scores. Premiums are collected instantly via x402 micropayments — no manual wallet approvals needed.',
                icon: TrendingUp,
                color: '#06b6d4',
              },
              {
                step: '03',
                title: 'Claim Verification',
                desc: 'When an incident occurs, ClaimBot autonomously verifies on-chain evidence, cross-references exploit patterns, and provides AI assessment with confidence scoring.',
                icon: Cpu,
                color: '#3b82f6',
              },
              {
                step: '04',
                title: 'Automated Payout',
                desc: 'Approved claims trigger VaultKeeper to execute instant payouts via Odra smart contracts — no human bottlenecks, no delays.',
                icon: DollarSign,
                color: '#10b981',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="animate-slide-up flex gap-4 sm:gap-6 items-start bg-bg-card border border-border-main rounded-2xl p-5 sm:p-8 hover:border-accent-purple/20 transition-all"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-text-secondary/20">{item.step}</span>
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mt-2"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: item.color }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-slide-up relative bg-gradient-to-br from-accent-purple/10 via-bg-card to-accent-cyan/10 border border-accent-purple/20 rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary mb-4">
                Your DeFi Deserves AI Protection
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto mb-8">
                Stop worrying about exploits, rug pulls, and liquidity crises. Let autonomous AI agents guard your positions 24/7.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-90 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all hover:shadow-xl hover:shadow-accent-purple/30"
              >
                <Shield className="w-5 h-5" />
                Launch Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-main py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">CasperGuard</span>
            <span className="text-xs text-text-secondary">|</span>
            <span className="text-xs text-text-secondary">Casper Agentic Buildathon 2026</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="text-accent-purple">x402</span>
              <span>·</span>
              <span className="text-accent-blue">MCP</span>
              <span>·</span>
              <span className="text-accent-cyan">Odra</span>
            </span>
            <span>Built on Casper Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
