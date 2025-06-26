'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/forgot-password',
    '/privacy',
    '/terms',
    '/contact',
    '/demo'
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/auth/')
  );

  useEffect(() => {
    // Only redirect if:
    // 1. Session is definitely unauthenticated (not loading)
    // 2. User is on a protected route
    // 3. Not already on auth pages
    if (status === 'unauthenticated' && !isPublicRoute) {
      console.log('Session expired, redirecting to sign-in...');
      router.push('/auth/signin?message=Session expired. Please sign in again.');
    }
  }, [status, isPublicRoute, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated and on protected route, show nothing (redirect will happen)
  if (status === 'unauthenticated' && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting to sign-in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 