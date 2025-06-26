import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArrowUpRight, ChevronDown, TrendingUp, CreditCard, Clock, Star, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="container mx-auto navbar-glass rounded-2xl">
        <div className="flex h-16 items-center px-6">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2 transition-all hover:scale-105" href="/">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Image src="/wealthifylogo.png" alt="Wealthify Logo" width={20} height={20} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Wealthify
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              {/* Products Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 transition-all duration-200 hover:text-primary hover:scale-105 text-foreground/70">
                  <span>Products</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4 navbar-glass rounded-xl">
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/tracking" className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Tracking</div>
                        <div className="text-sm text-muted-foreground">Link all your assets and debts</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/transactions" className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Transactions</div>
                        <div className="text-sm text-muted-foreground">Edit and automate transactions effortlessly</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/budgeting" className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Budgeting</div>
                        <div className="text-sm text-muted-foreground">Set limits, track budgets, and optimize finances</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/assistant" className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Assistant</div>
                        <div className="text-sm text-muted-foreground">Ask anything, get answers fast</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Resources Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 transition-all duration-200 hover:text-primary hover:scale-105 text-foreground/70">
                  <span>Resources</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 p-2 navbar-glass rounded-xl">
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/blog">
                      <div className="font-medium">Blog</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/documentation">
                      <div className="font-medium">Documentation</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/support">
                      <div className="font-medium">Support</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Link href="/community">
                      <div className="font-medium">Community</div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/pricing"
                className="transition-all duration-200 hover:text-primary hover:scale-105 text-foreground/70"
              >
                Pricing
              </Link>
              <Link
                href="/contribute"
                className="transition-all duration-200 hover:text-primary hover:scale-105 text-foreground/70"
              >
                Contribute
              </Link>
            </nav>

            {/* Mobile Menu */}
            <div className="flex md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="glassmorphism-button">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 navbar-glass rounded-xl"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/tracking" className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Tracking</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/budgeting" className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Budgeting</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="flex items-center">
                      <span>Pricing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/blog" className="flex items-center">
                      <span>Blog</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center">
                      <span>Support</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <Button size="sm" asChild className="navbar-cta-button rounded-lg px-4 py-2">
                <Link href="/auth/signup">
                  <span className="hidden sm:inline">Open App</span>
                  <span className="sm:hidden">App</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile CTA */}
            <div className="flex md:hidden">
              <Button size="sm" asChild className="navbar-cta-button rounded-lg px-3 py-2">
                <Link href="/auth/signup">
                  <span>App</span>
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 