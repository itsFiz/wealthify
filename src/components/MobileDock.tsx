'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
 // Target,
  Calculator,
  FileText,
  Settings,
  LogOut,
  //Wallet,
  PieChart,
  Award,
  User,
  HelpCircle,
  Calendar,
  //CreditCard,
  Plus,
  //Menu,
  X
} from 'lucide-react';
import Image from 'next/image';

interface MobileDockProps {
  className?: string;
}

const dockItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview',
  },
//   {
//     name: 'Goals',
//     href: '/goals',
//     icon: Target,
//     description: 'Financial goals',
//   },
  {
    name: 'Entries',
    href: '/entries',
    icon: Calendar,
    description: 'Transactions',
    badge: 'New',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Analytics',
  },
  {
    name: 'Simulator',
    href: '/simulator',
    icon: Calculator,
    description: 'Calculator',
  },
];

const moreItems = [
  {
    name: 'Budgets',
    href: '/budgets',
    icon: PieChart,
    description: 'Budget planning',
  },
  {
    name: 'Achievements',
    href: '/achievements',
    icon: Award,
    description: 'Milestones',
    badge: '3',
  },
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

export function MobileDock({ className }: MobileDockProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showMore, setShowMore] = useState(false);

  // Don't show dock on auth pages or landing page
  if (pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  // Hide dock if not authenticated (after loading)
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <>
      {/* Main Dock */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50',
          'lg:hidden', // Hide on desktop
          className
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {dockItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <motion.div 
                  className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-lg border border-primary/30"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        rotate: isActive ? [0, -10, 10, 0] : 0,
                      }}
                      transition={{
                        scale: { type: "spring", stiffness: 400, damping: 10 },
                        rotate: { duration: 0.6, ease: "easeInOut" }
                      }}
                    >
                      <item.icon
                        className={cn(
                          'h-6 w-6 transition-all duration-200',
                          isActive 
                            ? 'text-primary' 
                            : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'
                        )}
                      />
                    </motion.div>
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary text-white border-0">
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <motion.span 
                    className={cn(
                      'text-xs font-medium transition-colors relative z-10',
                      isActive 
                        ? 'text-primary' 
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'
                    )}
                    animate={{
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
          
          {/* More Button */}
          <motion.button
            onClick={() => setShowMore(!showMore)}
            className="flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="relative"
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {showMore ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-all duration-200" />
              ) : (
                <Plus className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-all duration-200" />
              )}
            </motion.div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">
              More
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div 
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMore(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Menu Panel */}
            <motion.div 
              className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <motion.div 
                className="p-4 border-b border-gray-200/50 dark:border-gray-700/50"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  {session?.user?.image ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full ring-2 ring-primary/50"
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 ring-2 ring-primary/50"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <User className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* More Items Grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {moreItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        <Link href={item.href} onClick={() => setShowMore(false)}>
                          <motion.div 
                            className={cn(
                              'flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200 group relative',
                              isActive
                                ? 'bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/30'
                                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                            whileHover={{ 
                              scale: 1.05,
                              y: -2,
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {/* Active indicator for more items */}
                            {isActive && (
                              <motion.div
                                layoutId="activeMoreItem"
                                className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan-500/5 rounded-xl border border-primary/20"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                            
                            <div className="relative z-10">
                              <motion.div
                                animate={{
                                  scale: isActive ? 1.1 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <item.icon
                                  className={cn(
                                    'h-6 w-6 transition-colors',
                                    isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'
                                  )}
                                />
                              </motion.div>
                              {item.badge && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary text-white border-0">
                                    {item.badge}
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                            <div className="text-center relative z-10">
                              <p className={cn(
                                'text-sm font-medium transition-colors',
                                isActive ? 'text-primary' : 'text-gray-900 dark:text-gray-100 group-hover:text-primary'
                              )}>
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Logout Button */}
              <motion.div 
                className="p-4 border-t border-gray-200/50 dark:border-gray-700/50"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding to prevent content from being hidden behind dock */}
      <div className="h-20 lg:hidden" />
    </>
  );
} 