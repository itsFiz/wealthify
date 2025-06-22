import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/Navbar'
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  PieChart, 
  Wallet, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-block">
                <Badge variant="outline" className="rounded-full px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <Wallet className="mr-2 h-4 w-4 text-primary" />
                  Smart Finance Goal Engine
                </Badge>
              </div>
              
              <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Turn Every{' '}
                <span className="text-primary">Money</span>{' '}
                Into a{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-pulse">
                    Milestone
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-30 animate-pulse" />
                </span>
              </h1>
              
              <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Turn your financial dreams into achievable milestones with gamified tracking and smart goal planning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-400">
                  <Link href="/auth/signup">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-lg px-8 py-6">
                  <Link href="/demo">
                    View Demo
                  </Link>
                </Button>
              </div>
              
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 User Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Free to Start</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Features That{' '}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Matter
                </span>
              </h2>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Everything you need to take control of your financial future, gamified and simplified.
              </p>
            </div>
            
            <div className="mx-auto max-w-7xl grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Multi-Stream Income</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Track salary, business revenue, freelance income, and investments all in one unified dashboard.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Smart Goal Planning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Set milestone goals for houses, cars, emergency funds, and watch your progress unfold with visual timelines.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Affordability Calculator</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Calculate required savings, income gaps, and realistic timelines for achieving your financial goals.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Burn Rate Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Monitor your spending patterns and optimize your budget allocation for maximum savings potential.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Gamified Experience</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Level up your financial health with progress bars, achievements, and milestone celebrations.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 metric-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Health Score</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Get a comprehensive financial health score based on your income, expenses, and savings rate.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Ready to Achieve Your{' '}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Goals?
                </span>
              </h2>
              <p className="mb-12 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Join thousands of users who are already on their journey to financial freedom. 
                Start your transformation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-400">
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Image src="/wealthifylogo.png" alt="Wealthify Logo" width={32} height={32} />
              </div>
              <p className="text-sm text-muted-foreground">
                Built by{' '}
                <Link
                  href="https://f12.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                  F12.GG
                </Link>
                . Part of the 17 Domains from LifeOS.
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
