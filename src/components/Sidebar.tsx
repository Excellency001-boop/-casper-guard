'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Bot,
  Zap,
  Activity,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/claims', label: 'Claims', icon: AlertTriangle },
  { href: '/agents', label: 'AI Agents', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-bg-secondary border-b border-border-main flex items-center justify-between px-4 z-50 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-text-primary">CasperGuard</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-lg bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border-main flex flex-col z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-border-main">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">CasperGuard</h1>
              <p className="text-xs text-text-secondary">DeFi Insurance AI</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.label === 'Claims' && (
                  <span className="ml-auto bg-accent-red/20 text-accent-red text-xs px-2 py-0.5 rounded-full font-semibold">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-main">
          <div className="bg-bg-card rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Activity className="w-3 h-3 text-accent-green" />
              <span>Network Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm text-text-primary font-medium">Casper Testnet</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Zap className="w-3 h-3 text-accent-orange" />
              <span>4 Agents Active</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-text-secondary">
              Powered by Casper AI Toolkit
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] text-text-secondary">
              <span className="text-accent-purple">x402</span>
              <span>·</span>
              <span className="text-accent-blue">MCP</span>
              <span>·</span>
              <span className="text-accent-cyan">Odra</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
