import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wealthify - Smart Finance Goal Engine",
  description: "Transform your financial dreams into achievable milestones with gamified tracking and smart goal planning.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full bg-background font-sans antialiased")}>
        <ThemeProvider defaultTheme="dark" storageKey="wealthify-ui-theme">
          <SessionProvider>
            <div className="flex h-full">
              {/* Sidebar - only show on authenticated routes */}
              <Sidebar className="hidden lg:flex" />
              
              {/* Main content */}
              <div className="flex-1 flex flex-col min-h-0">
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
