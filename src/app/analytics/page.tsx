'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatCurrency, formatPercentage, calculateBalanceProjections } from '@/lib/calculations/index';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, ReferenceLine
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Calendar,
  Download,
  Filter,
  Target,
  Wallet,
  DollarSign,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUpDown,
  CircleDollarSign,
  Calculator,
  Clock,
  Eye,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFinancialInsights, generateComparisonData } from '@/lib/analytics/insights';
import { InsightsPanel } from '@/components/analytics/InsightsPanel';
import { ComparisonTable } from '@/components/analytics/ComparisonTable';

// Minimalist color scheme
const COLORS = {
  primary: '#6366f1',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  neutral: '#6b7280',
  background: '#f8fafc',
  muted: '#e2e8f0'
};

// Simple pie chart colors
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface MonthlySnapshot {
  id: string;
  month: Date;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  burnRate: number;
  savingsRate: number;
  healthScore: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  totalGoalsValue: number;
  totalGoalsProgress: number;
  incomeChangePercent: number | null;
  expenseChangePercent: number | null;
  savingsChangePercent: number | null;
  healthScoreChange: number | null;
}

interface AnalyticsData {
  snapshots: MonthlySnapshot[];
  goalPerformance: any[];
  incomeStreamPerformance: any[];
  expenseBreakdown: any[];
  projections: any[];
  insights: {
    topGrowthCategory: string;
    topSavingsOpportunity: string;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  };
  detailedIncomeStreams: any[];
  detailedExpenses: any[];
  incomeEntries: any[];
  expenseEntries: any[];
}

// Custom tooltip component for minimalist design
const MinimalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {
              entry.dataKey === 'burnRate' || entry.dataKey === 'savingsRate' || entry.dataKey === 'healthScore' || entry.dataKey === 'confidence' 
                ? `${Number(entry.value).toFixed(1)}${entry.dataKey === 'confidence' ? '%' : entry.dataKey === 'healthScore' ? '/100' : '%'}`
                : formatCurrency(Number(entry.value))
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { incomeStreams, expenses, goals, monthlyIncome, monthlyExpenses } = useDashboardStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [selectedView, setSelectedView] = useState('trends');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get period mapping
      const monthsMap = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24 };
      const months = monthsMap[selectedPeriod as keyof typeof monthsMap] || 6;
      
      // Fetch monthly snapshots
      const snapshotsResponse = await fetch(`/api/snapshots?months=${months}`);
      let snapshots = [];
      if (snapshotsResponse.ok) {
        snapshots = await snapshotsResponse.json();
        snapshots = snapshots.map((snapshot: any) => ({
          ...snapshot,
          month: new Date(snapshot.month),
          // Ensure all numeric fields are properly converted
          totalIncome: Number(snapshot.totalIncome) || 0,
          totalExpenses: Number(snapshot.totalExpenses) || 0,
          totalSavings: Number(snapshot.totalSavings) || 0,
          burnRate: Number(snapshot.burnRate) || 0,
          savingsRate: Number(snapshot.savingsRate) || 0,
          healthScore: Number(snapshot.healthScore) || 0,
        }));
      }

      // Fetch current balance
      const balanceResponse = await fetch('/api/balance');
      let fetchedBalance = 0;
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        fetchedBalance = Number(balanceData.currentBalance) || 0;
        setCurrentBalance(fetchedBalance);
      }

      // Calculate the date range for fetching entries (last 12-24 months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);
      
      // Always fetch at least last 12 months for better trend analysis
      const minStartDate = new Date();
      minStartDate.setMonth(endDate.getMonth() - 12);
      const actualStartDate = startDate < minStartDate ? startDate : minStartDate;
      
      console.log(`📊 Fetching entries from ${actualStartDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

      // Fetch income entries (expanded range)
      const incomeEntriesResponse = await fetch(`/api/income-entries`); // Fetch all entries
      let incomeEntries = [];
      if (incomeEntriesResponse.ok) {
        const allIncomeEntries = await incomeEntriesResponse.json();
        // Filter client-side for the date range we need
        incomeEntries = allIncomeEntries.filter((entry: any) => {
          const entryDate = new Date(entry.month);
          return entryDate >= actualStartDate && entryDate <= endDate;
        }).map((entry: any) => ({
          ...entry,
          month: new Date(entry.month),
          amount: Number(entry.amount) || 0,
        }));
        console.log(`📈 Filtered ${incomeEntries.length} income entries from ${allIncomeEntries.length} total`);
      } else {
        console.log('⚠️ Failed to fetch income entries:', incomeEntriesResponse.status);
      }

      // Fetch expense entries (expanded range)
      const expenseEntriesResponse = await fetch(`/api/expense-entries`); // Fetch all entries
      let expenseEntries = [];
      if (expenseEntriesResponse.ok) {
        const allExpenseEntries = await expenseEntriesResponse.json();
        // Filter client-side for the date range we need
        expenseEntries = allExpenseEntries.filter((entry: any) => {
          const entryDate = new Date(entry.month);
          return entryDate >= actualStartDate && entryDate <= endDate;
        }).map((entry: any) => ({
          ...entry,
          month: new Date(entry.month),
          amount: Number(entry.amount) || 0,
        }));
        console.log(`📉 Filtered ${expenseEntries.length} expense entries from ${allExpenseEntries.length} total`);
      } else {
        console.log('⚠️ Failed to fetch expense entries:', expenseEntriesResponse.status);
      }

      // Fetch detailed income streams data for performance analysis
      const incomeResponse = await fetch('/api/income');
      let detailedIncomeStreams = [];
      if (incomeResponse.ok) {
        detailedIncomeStreams = await incomeResponse.json();
      }

      // Fetch detailed expenses data for breakdown analysis
      const expenseResponse = await fetch('/api/expenses');
      let detailedExpenses = [];
      if (expenseResponse.ok) {
        detailedExpenses = await expenseResponse.json();
      }

      // Calculate goal performance with validation
      const goalPerformance = goals.map(goal => {
        const targetAmount = Number(goal.targetAmount) || 0;
        const currentAmount = Number(goal.currentAmount) || 0;
        const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        const daysRemaining = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
        const requiredMonthly = monthsRemaining > 0 ? (targetAmount - currentAmount) / monthsRemaining : 0;
        
        return {
          id: goal.id,
          name: goal.name,
          progress: Math.min(100, Math.max(0, progress)),
          currentAmount,
          targetAmount,
          daysRemaining,
          monthsRemaining,
          requiredMonthly: Math.max(0, requiredMonthly),
          isOnTrack: requiredMonthly <= (monthlyIncome - monthlyExpenses) * 0.3, // 30% of savings
          category: goal.category,
          priority: goal.priority,
        };
      });

      // Calculate income stream performance with validation
      const incomeStreamPerformance = detailedIncomeStreams.map((stream: any) => {
        const expected = Number(stream.expectedMonthly) || 0;
        const actual = Number(stream.actualMonthly || stream.expectedMonthly) || 0;
        const variance = expected > 0 ? ((actual - expected) / expected) * 100 : 0;
        
        return {
          id: stream.id,
          name: stream.name,
          type: stream.type,
          expected,
          actual,
          variance,
          reliability: Math.abs(variance) < 10 ? 'high' : Math.abs(variance) < 25 ? 'medium' : 'low',
          createdAt: new Date(stream.createdAt),
          frequency: stream.frequency,
        };
      });

      // Calculate expense breakdown with categories and validation
      const expenseCategories = detailedExpenses.reduce((acc: any, expense: any) => {
        const category = expense.category || 'Other';
        const amount = Number(expense.amount) || 0;
        if (!acc[category]) {
          acc[category] = { category, amount: 0, count: 0, items: [] };
        }
        acc[category].amount += amount;
        acc[category].count += 1;
        acc[category].items.push(expense.name);
        return acc;
      }, {});

      const expenseBreakdown = Object.values(expenseCategories).map((cat: any) => ({
        ...cat,
        percentage: monthlyExpenses > 0 ? (cat.amount / monthlyExpenses) * 100 : 0,
      }));

      // Generate balance projections with validation
      const projections = calculateBalanceProjections(
        fetchedBalance, 
        Number(monthlyIncome) || 0, 
        Number(monthlyExpenses) || 0, 
        12
      );

      // Generate insights
      const insights = {
        topGrowthCategory: incomeStreamPerformance.length > 0 
          ? incomeStreamPerformance.reduce((prev: any, current: any) => prev.variance > current.variance ? prev : current).name
          : 'No income data',
        topSavingsOpportunity: expenseBreakdown.length > 0
          ? expenseBreakdown.reduce((prev: any, current: any) => prev.amount > current.amount ? prev : current).category
          : 'No expense data',
        riskLevel: (monthlyExpenses / monthlyIncome) > 0.8 ? 'high' as const : 
                   (monthlyExpenses / monthlyIncome) > 0.6 ? 'medium' as const : 'low' as const,
        recommendation: monthlyIncome > monthlyExpenses 
          ? 'Consider increasing goal contributions'
          : 'Focus on expense optimization',
      };

      setAnalyticsData({
        snapshots,
        goalPerformance,
        incomeStreamPerformance,
        expenseBreakdown,
        projections,
        insights,
        detailedIncomeStreams,
        detailedExpenses,
        incomeEntries,
        expenseEntries,
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when period changes or user is available
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchAnalyticsData();
    }
  }, [user?.id, authLoading, selectedPeriod]);

  // Export data functionality
  const handleExportData = async () => {
    if (!analyticsData) return;
    
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        period: selectedPeriod,
        snapshots: analyticsData.snapshots,
        summary: {
          totalIncome: monthlyIncome,
          totalExpenses: monthlyExpenses,
          savingsRate: ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100,
          goalCount: goals.length,
          incomeStreamCount: analyticsData.incomeStreamPerformance.length,
        }
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wealthify-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600">Please sign in to view your analytics.</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600">Unable to load analytics. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const trendData = analyticsData.snapshots.map(snapshot => ({
    month: snapshot.month.toLocaleDateString('en-MY', { month: 'short' }),
    income: Number(snapshot.totalIncome) || 0,
    expenses: Number(snapshot.totalExpenses) || 0,
    savings: Number(snapshot.totalSavings) || 0,
    burnRate: Number(snapshot.burnRate) || 0,
    savingsRate: Number(snapshot.savingsRate) || 0,
    healthScore: Number(snapshot.healthScore) || 0,
    netWorth: Number(currentBalance) + Number(snapshot.totalSavings) || 0,
  })).reverse(); // Reverse to show chronological order

  // Prepare detailed income trend data from actual entries
  const incomeStreamTrendData = (() => {
    console.log('🔍 Debug income entries data:', {
      incomeEntries: analyticsData.incomeEntries?.length || 0,
      sampleEntry: analyticsData.incomeEntries?.[0],
      dateRange: analyticsData.incomeEntries?.length > 0 ? {
        earliest: new Date(Math.min(...analyticsData.incomeEntries.map((e: any) => new Date(e.month).getTime()))).toLocaleDateString(),
        latest: new Date(Math.max(...analyticsData.incomeEntries.map((e: any) => new Date(e.month).getTime()))).toLocaleDateString()
      } : 'No entries'
    });

    if (!analyticsData.incomeEntries || analyticsData.incomeEntries.length === 0) {
      return [];
    }

    // Create a map of month -> total income
    const monthlyTotals = new Map<string, number>();
    
    analyticsData.incomeEntries.forEach((entry: any) => {
      const monthKey = new Date(entry.month).toLocaleDateString('en-MY', { 
        month: 'short', 
        year: 'numeric' 
      });
      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + Number(entry.amount));
    });

    // Convert to array and sort by date
    const sortedEntries = Array.from(monthlyTotals.entries())
      .map(([monthKey, total]) => {
        // Parse the monthKey back to a date for proper sorting
        const [month, year] = monthKey.split(' ');
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        const date = new Date(parseInt(year), monthIndex, 1);
        
        return {
          month: monthKey,
          income: total,
          date: date
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log('📊 Processed income trend data:', sortedEntries);
    return sortedEntries;
  })();

  // Prepare detailed expense trend data from actual entries
  const expenseStreamTrendData = (() => {
    console.log('🔍 Debug expense entries data:', {
      expenseEntries: analyticsData.expenseEntries?.length || 0,
      sampleEntry: analyticsData.expenseEntries?.[0],
      dateRange: analyticsData.expenseEntries?.length > 0 ? {
        earliest: new Date(Math.min(...analyticsData.expenseEntries.map((e: any) => new Date(e.month).getTime()))).toLocaleDateString(),
        latest: new Date(Math.max(...analyticsData.expenseEntries.map((e: any) => new Date(e.month).getTime()))).toLocaleDateString()
      } : 'No entries'
    });

    if (!analyticsData.expenseEntries || analyticsData.expenseEntries.length === 0) {
      return [];
    }

    // Create a map of month -> total expenses
    const monthlyTotals = new Map<string, number>();
    
    analyticsData.expenseEntries.forEach((entry: any) => {
      const monthKey = new Date(entry.month).toLocaleDateString('en-MY', { 
        month: 'short', 
        year: 'numeric' 
      });
      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + Number(entry.amount));
    });

    // Convert to array and sort by date
    const sortedEntries = Array.from(monthlyTotals.entries())
      .map(([monthKey, total]) => {
        // Parse the monthKey back to a date for proper sorting
        const [month, year] = monthKey.split(' ');
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        const date = new Date(parseInt(year), monthIndex, 1);
        
        return {
          month: monthKey,
          expenses: total,
          date: date
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log('📊 Processed expense trend data:', sortedEntries);
    return sortedEntries;
  })();

  const projectionData = analyticsData.projections.map(proj => ({
    month: proj.month.toLocaleDateString('en-MY', { month: 'short' }),
    projectedBalance: Number(proj.projectedBalance) || 0,
    projectedIncome: Number(proj.projectedIncome) || 0,
    projectedExpenses: Number(proj.projectedExpenses) || 0,
    confidence: Number(proj.confidenceLevel) * 100 || 0,
  }));

  // Debug final chart data
  console.log('📊 Final chart data:', {
    incomeStreamTrendData,
    expenseStreamTrendData,
    trendData: trendData.slice(0, 2), // Just first 2 items for brevity
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Financial insights and trends</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-20 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="2Y">2Y</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleExportData} className="bg-gray-900 hover:bg-gray-800 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Analytics Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <div className="text-2xl font-semibold text-gray-900">
                    {analyticsData.snapshots.length >= 2 ? 
                      (() => {
                        const current = Number(analyticsData.snapshots[0].totalIncome) || 0;
                        const previous = Number(analyticsData.snapshots[1].totalIncome) || 0;
                        if (previous === 0) return '0.0%';
                        const growth = ((current - previous) / previous * 100);
                        return `${growth.toFixed(1)}%`;
                      })()
                      : '0.0%'}
                  </div>
                </div>
                <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <TrendingUpDown className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <div className="text-2xl font-semibold text-gray-900">
                    {analyticsData.snapshots.length > 0 ? 
                      `${Number(analyticsData.snapshots[0].healthScore) || 0}/100` 
                      : '0/100'}
                  </div>
                </div>
                <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Goals on Track</p>
                  <div className="text-2xl font-semibold text-gray-900">
                    {analyticsData.goalPerformance.filter(g => g.isOnTrack).length}/{analyticsData.goalPerformance.length}
                  </div>
                </div>
                <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Runway</p>
                  <div className="text-2xl font-semibold text-gray-900">
                    {(() => {
                      const expenses = Number(monthlyExpenses) || 0;
                      const balance = Number(currentBalance) || 0;
                      if (expenses === 0) return '∞';
                      return `${(balance / expenses).toFixed(1)}M`;
                    })()}
                  </div>
                </div>
                <div className="h-8 w-8 bg-orange-50 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="trends" className="data-[state=active]:bg-gray-100">Trends</TabsTrigger>
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-gray-100">Breakdown</TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gray-100">Goals</TabsTrigger>
            <TabsTrigger value="projections" className="data-[state=active]:bg-gray-100">Projections</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-gray-100">Insights</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Income vs Expenses Trend */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke={COLORS.success} 
                        fill="url(#incomeGrad)"
                        strokeWidth={2}
                        name="Income"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke={COLORS.danger} 
                        fill="url(#expenseGrad)"
                        strokeWidth={2}
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Savings Rate & Health Score */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Financial Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={trendData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Bar 
                        yAxisId="left"
                        dataKey="savingsRate" 
                        fill={COLORS.primary}
                        name="Savings Rate (%)"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="healthScore" 
                        stroke={COLORS.danger}
                        strokeWidth={2}
                        dot={{ r: 3, fill: COLORS.danger }}
                        name="Health Score"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* New Income and Expense Trend Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Income Trends */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Income Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={incomeStreamTrendData}>
                      <defs>
                        <linearGradient id="incomeLineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke={COLORS.success} 
                        fill="url(#incomeLineGrad)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLORS.success, strokeWidth: 2, stroke: '#ffffff' }}
                        name="Monthly Income"
                      />
                      {/* Add trend line reference if data has growth */}
                      {incomeStreamTrendData.length >= 2 && (() => {
                        const firstIncome = incomeStreamTrendData[0]?.income || 0;
                        const lastIncome = incomeStreamTrendData[incomeStreamTrendData.length - 1]?.income || 0;
                        const avgIncome = (firstIncome + lastIncome) / 2;
                        return avgIncome > 0 ? (
                          <ReferenceLine 
                            y={avgIncome} 
                            stroke={COLORS.success} 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.5}
                            label={{ value: "Average", position: "right" }}
                          />
                        ) : null;
                      })()}
                    </LineChart>
                  </ResponsiveContainer>
                  {incomeStreamTrendData.length > 0 ? (
                    <div className="mt-4 text-xs text-gray-500">
                      Showing actual income entries from {incomeStreamTrendData.length} months of data
                      <br />
                      <span className="text-gray-400">
                        Date range: {incomeStreamTrendData.length > 0 ? 
                          `${incomeStreamTrendData[0]?.month} to ${incomeStreamTrendData[incomeStreamTrendData.length - 1]?.month}` 
                          : 'No data'}
                        <br />
                        Total entries: {analyticsData.incomeEntries?.length || 0} transactions
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      <div className="text-orange-600 mb-2">No income entries found</div>
                      <div className="space-y-1">
                        <div>• Add income entries in the <strong>Entries</strong> page</div>
                        <div>• Or click <strong>"Generate Missing"</strong> to auto-create from income streams</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Trends */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Expense Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={expenseStreamTrendData}>
                      <defs>
                        <linearGradient id="expenseLineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke={COLORS.danger} 
                        fill="url(#expenseLineGrad)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLORS.danger, strokeWidth: 2, stroke: '#ffffff' }}
                        name="Monthly Expenses"
                      />
                      {/* Add trend line reference if data exists */}
                      {expenseStreamTrendData.length >= 2 && (() => {
                        const firstExpense = expenseStreamTrendData[0]?.expenses || 0;
                        const lastExpense = expenseStreamTrendData[expenseStreamTrendData.length - 1]?.expenses || 0;
                        const avgExpense = (firstExpense + lastExpense) / 2;
                        return avgExpense > 0 ? (
                          <ReferenceLine 
                            y={avgExpense} 
                            stroke={COLORS.danger} 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.5}
                            label={{ value: "Average", position: "right" }}
                          />
                        ) : null;
                      })()}
                    </LineChart>
                  </ResponsiveContainer>
                  {expenseStreamTrendData.length > 0 ? (
                    <div className="mt-4 text-xs text-gray-500">
                      Showing actual expense entries from {expenseStreamTrendData.length} months of data
                      <br />
                      <span className="text-gray-400">
                        Date range: {expenseStreamTrendData.length > 0 ? 
                          `${expenseStreamTrendData[0]?.month} to ${expenseStreamTrendData[expenseStreamTrendData.length - 1]?.month}` 
                          : 'No data'}
                        <br />
                        Total entries: {analyticsData.expenseEntries?.length || 0} transactions
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      <div className="text-orange-600 mb-2">No expense entries found</div>
                      <div className="space-y-1">
                        <div>• Add expense entries in the <strong>Entries</strong> page</div>
                        <div>• Or click <strong>"Generate Missing"</strong> to auto-create from expenses</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Burn Rate Trend */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Burn Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip content={<MinimalTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="burnRate" 
                      stroke={COLORS.danger} 
                      fill="url(#burnGrad)"
                      strokeWidth={2}
                      name="Burn Rate %"
                    />
                    <ReferenceLine y={50} stroke={COLORS.danger} strokeDasharray="2 2" strokeOpacity={0.5} />
                    <ReferenceLine y={30} stroke={COLORS.success} strokeDasharray="2 2" strokeOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Expense Breakdown */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={analyticsData.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="amount"
                      >
                        {analyticsData.expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<MinimalTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {analyticsData.expenseBreakdown.slice(0, 4).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="text-gray-600">{category.category}</span>
                        </div>
                        <span className="font-medium text-gray-900">{category.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Income Stream Performance */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Income Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analyticsData.incomeStreamPerformance}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Bar dataKey="expected" fill={COLORS.muted} name="Expected" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="actual" fill={COLORS.success} name="Actual" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Expense Breakdown */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.expenseBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <div>
                          <span className="font-medium text-gray-900">{category.category}</span>
                          <p className="text-sm text-gray-600">{category.count} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6">
              {/* Goal Progress Chart */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Goal Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analyticsData.goalPerformance} layout="horizontal">
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Bar 
                        dataKey="progress" 
                        fill={COLORS.primary}
                        radius={[0, 4, 4, 0]}
                        name="Progress %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Goal Performance Details */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Goal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.goalPerformance.map((goal) => (
                      <div key={goal.id} className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{goal.name}</h4>
                            <Badge variant="outline" className="mt-1">{goal.category}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold text-gray-900">{goal.progress.toFixed(1)}%</div>
                            <Badge variant={goal.isOnTrack ? "default" : "destructive"}>
                              {goal.isOnTrack ? "On Track" : "At Risk"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-3 text-sm">
                          <div>
                            <div className="text-gray-600">Current / Target</div>
                            <div className="font-medium text-gray-900">
                              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Required Monthly</div>
                            <div className="font-medium text-gray-900">{formatCurrency(goal.requiredMonthly)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Time Remaining</div>
                            <div className="font-medium text-gray-900">{goal.monthsRemaining} months</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6">
            <div className="grid gap-6">
              {/* Balance Projections */}
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">12-Month Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={projectionData}>
                      <defs>
                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip content={<MinimalTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="projectedBalance" 
                        stroke={COLORS.primary} 
                        fill="url(#balanceGrad)"
                        strokeWidth={2}
                        name="Projected Balance"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke={COLORS.neutral}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        dot={false}
                        name="Confidence %"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Scenario Analysis */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium text-gray-900">Best Case</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-green-600 mb-2">
                        {(() => {
                          const balance = Number(currentBalance) || 0;
                          const income = Number(monthlyIncome) || 0;
                          const expenses = Number(monthlyExpenses) || 0;
                          const projection = balance + (income * 1.2 - expenses * 0.9) * 12;
                          return formatCurrency(Math.max(0, projection));
                        })()}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">Projected balance in 12 months</div>
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Income increase:</span>
                          <span className="text-green-600">+20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expense reduction:</span>
                          <span className="text-green-600">-10%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium text-gray-900">Worst Case</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-red-600 mb-2">
                        {(() => {
                          const balance = Number(currentBalance) || 0;
                          const income = Number(monthlyIncome) || 0;
                          const expenses = Number(monthlyExpenses) || 0;
                          const projection = balance + (income * 0.8 - expenses * 1.15) * 12;
                          return formatCurrency(Math.max(0, projection));
                        })()}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">Projected balance in 12 months</div>
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Income decrease:</span>
                          <span className="text-red-600">-20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expense increase:</span>
                          <span className="text-red-600">+15%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Enhanced Insights Panel */}
              <InsightsPanel
                insights={generateFinancialInsights({
                  snapshots: analyticsData.snapshots,
                  goalPerformance: analyticsData.goalPerformance,
                  incomeStreamPerformance: analyticsData.incomeStreamPerformance,
                  expenseBreakdown: analyticsData.expenseBreakdown,
                  monthlyIncome,
                  monthlyExpenses,
                  currentBalance,
                  burnRate: analyticsData.snapshots.length > 0 ? analyticsData.snapshots[0].burnRate : 0,
                  savingsRate: analyticsData.snapshots.length > 0 ? analyticsData.snapshots[0].savingsRate : 0,
                })}
                onActionClick={(insight) => {
                  console.log('Action clicked for insight:', insight);
                  toast.success(`Taking action on: ${insight.title}`);
                }}
              />

              {/* Period Comparison */}
              {analyticsData.snapshots.length >= 2 && (
                <ComparisonTable
                  title="Period Comparison"
                  data={generateComparisonData(analyticsData.snapshots)}
                  currentPeriod={analyticsData.snapshots[0].month.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}
                  previousPeriod={analyticsData.snapshots[1].month.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 