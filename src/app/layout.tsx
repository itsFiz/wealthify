import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileDock } from "@/components/MobileDock";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wealthify - Smart Finance Goal Engine",
  description: "Transform your financial dreams into achievable milestones with gamified tracking and smart goal planning.",
  keywords: ["finance", "goals", "budgeting", "wealth", "savings", "investment", "financial planning"],
  authors: [{ name: "Wealthify Team" }],
  creator: "Wealthify",
  publisher: "Wealthify",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wealthify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Wealthify - Smart Finance Goal Engine",
    description: "Transform your financial dreams into achievable milestones with gamified tracking and smart goal planning.",
    url: 'https://wealthify.app',
    siteName: 'Wealthify',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wealthify - Smart Finance Goal Engine',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wealthify - Smart Finance Goal Engine",
    description: "Transform your financial dreams into achievable milestones with gamified tracking and smart goal planning.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  // PWA Manifest
  manifest: '/manifest.json',
  // Apple-specific meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wealthify',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Wealthify',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#3b82f6',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-touch-icon-57x57.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/mstile-144x144.png" />
        
        {/* PWA Theme Color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        
        {/* Viewport for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        
        {/* Prevent zoom on input focus for iOS */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Splash Screen for iOS */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body className={cn("h-full bg-background font-sans antialiased")}>
        <ThemeProvider defaultTheme="dark" storageKey="wealthify-ui-theme">
          <SessionProvider>
            <div className="flex h-full">
              {/* Sidebar - always show on desktop, hidden on mobile */}
              <div className="hidden lg:block lg:flex-shrink-0">
                <Sidebar />
              </div>
              
              {/* Main content */}
              <div className="flex-1 flex flex-col min-h-0 lg:ml-0">
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
            
            {/* Mobile Dock - only show on mobile */}
            <MobileDock />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
