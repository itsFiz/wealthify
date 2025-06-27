'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  Calculator,
  FileText,
  Settings,
  LogOut,
  Wallet,
  PieChart,
  BarChart3,
  Zap,
  Award,
  User,
  HelpCircle,
  Bell,
  Calendar,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Financial overview',
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Detailed insights',
        badge: 'New',
      },
    ],
  },
  {
    title: 'Financial Management',
    items: [
      {
        name: 'Finances',
        href: '/finances',
        icon: Wallet,
        description: 'Manage all finances',
      },
      {
        name: 'Entries',
        href: '/entries',
        icon: Calendar,
        description: 'Monthly transactions',
        badge: 'New',
      },
      {
        name: 'Goals',
        href: '/goals',
        icon: Target,
        description: 'Financial goals',
      },
      {
        name: 'Budgets',
        href: '/budgets',
        icon: PieChart,
        description: 'Budget planning',
      },
      {
        name: 'Debts',
        href: '/debts',
        icon: CreditCard,
        description: 'Debt management',
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        name: 'Simulator',
        href: '/simulator',
        icon: Calculator,
        description: 'Affordability calculator',
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: FileText,
        description: 'Financial reports',
      },
      {
        name: 'Achievements',
        href: '/achievements',
        icon: Award,
        description: 'Your milestones',
        badge: '3',
      },
    ],
  },
];

const bottomItems = [
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Account settings',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Support center',
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show sidebar on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className={cn('flex h-full w-64 flex-col sidebar-glass', className)}>
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Wealthify
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Hide sidebar if not authenticated (after loading)
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className={cn('flex h-full w-64 flex-col sidebar-glass', className)}>
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">
            Wealthify
          </span>
        </Link>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center space-x-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="h-10 w-10 rounded-full ring-2 ring-primary/50"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 ring-2 ring-primary/50">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6 px-3">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-primary/20 to-cyan-500/10 text-primary shadow-lg shadow-primary/20 border border-primary/30'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon
                            className={cn(
                              'h-4 w-4 transition-colors',
                              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm">{item.name}</span>
                            <span className="text-xs text-muted-foreground/60">
                              {item.description}
                            </span>
                          </div>
                        </div>
                        {item.badge && (
                          <Badge
                            variant={item.badge === 'New' ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs px-2 py-0.5",
                              item.badge === 'New' 
                                ? "bg-gradient-to-r from-primary/30 to-cyan-500/30 text-primary border-primary/40" 
                                : "bg-white/10 text-muted-foreground border-white/20"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-3">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-cyan-500/10 text-primary shadow-lg shadow-primary/20 border border-primary/30'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Logout Button */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 