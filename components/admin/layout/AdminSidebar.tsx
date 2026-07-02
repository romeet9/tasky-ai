'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBar, ChartLine, Gear, Users, List, Database, Flask } from '@phosphor-icons/react';
import { useDataSource } from '@/hooks/useDataSource';

interface AdminSidebarProps {
  user?: {
    uid: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
  } | null;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: ChartBar,
    description: 'Overview',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: ChartLine,
    description: 'Detailed metrics',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Gear,
    description: 'System configuration',
  },
  {
    label: 'User List',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users',
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: List,
    description: 'Audit trail',
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { source, toggleSource } = useDataSource();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#101111] border-r border-white/[0.06] flex flex-col">
      <div className="p-6 border-b border-white/[0.06]">
        <h1 className="text-[#f9f9f9] font-semibold text-lg tracking-wide">
          Tasky Admin
        </h1>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-6 py-3
                transition-all duration-200
                border-l-2
                ${isActive 
                  ? 'bg-[#FF6363]/10 border-[#FF6363] text-[#f9f9f9]' 
                  : 'border-transparent text-[#9c9c9d] hover:bg-white/[0.05] hover:text-[#cecece]'
                }
              `}
            >
              <Icon className="w-5 h-5" weight={isActive ? 'fill' : 'regular'} />
              <div className="flex flex-col">
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                <span className="text-xs text-[#6a6b6c]">{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06]">
        <button
          onClick={toggleSource}
          className="w-full px-6 py-3 flex items-center gap-3 text-[#9c9c9d] hover:bg-white/[0.05] hover:text-[#cecece] transition-all duration-200"
        >
          {source === 'demo' ? (
            <Flask className="w-4 h-4" weight="fill" />
          ) : (
            <Database className="w-4 h-4" weight="regular" />
          )}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide">
                {source === 'demo' ? 'Demo Data' : 'Live Data'}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                source === 'demo'
                  ? 'bg-[#ffbc33]/10 text-[#ffbc33] border border-[#ffbc33]/30'
                  : 'bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/30'
              }`}>
                {source === 'demo' ? 'DEMO' : 'LIVE'}
              </span>
            </div>
            <span className="text-[10px] text-[#6a6b6c]">Click to switch</span>
          </div>
        </button>
      </div>

      <div className="p-6 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6363]/20 border-2 border-[#FF6363] flex items-center justify-center">
            <span className="text-[#FF6363] font-semibold text-sm">
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#f9f9f9] font-medium text-sm truncate">
              {user?.displayName || 'Admin'}
            </p>
            <p className="text-[#6a6b6c] text-xs truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}