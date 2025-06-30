'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/calculations/index';
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Wallet,
  CreditCard,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  incomeByCategory: Array<{ name: string; value: number; color: string }>;
  expensesByCategory: Array<{ name: string; value: number; color: string }>;
  monthlyTrends: Array<{ 
    month: string; 
    income: number; 
    expenses: number; 
    net: number;
    date: string;
  }>;
  topIncomeStreams: Array<{ name: string; amount: number; type: string }>;
  topExpenses: Array<{ name: string; amount: number; category: string }>;
  financialHealth: {
    savingsRate: number;
    expenseRatio: number;
    incomeGrowth: number;
    expenseGrowth: number;
  };
}

const INCOME_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];
const EXPENSE_COLORS = ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'];

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching analytics data for user:', user.id);
      
      // Fetch all necessary data
      const [
        incomeStreamsRes,
        expensesRes,
        incomeEntriesRes,
        expenseEntriesRes,
        oneTimeIncomeRes,
        oneTimeExpenseRes
      ] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/expenses'),
        fetch('/api/income-entries'),
        fetch('/api/expense-entries'),
        fetch('/api/one-time-income'),
        fetch('/api/one-time-expense')
      ]);

      console.log('API Response Status:', {
        incomeStreams: incomeStreamsRes.status,
        expenses: expensesRes.status,
        incomeEntries: incomeEntriesRes.status,
        expenseEntries: expenseEntriesRes.status,
        oneTimeIncome: oneTimeIncomeRes.status,
        oneTimeExpense: oneTimeExpenseRes.status
      });

      // Parse responses with error handling
      const parseResponse = async (res: Response, name: string) => {
        if (!res.ok) {
          console.error(`${name} API failed:`, res.status, res.statusText);
          return [];
        }
        try {
          const data = await res.json();
          console.log(`${name} data:`, data?.length || 0, 'items');
          return data || [];
        } catch (error) {
          console.error(`Error parsing ${name} response:`, error);
          return [];
        }
      };

      const [
        incomeStreams,
        expenses,
        incomeEntries,
        expenseEntries,
        oneTimeIncome,
        oneTimeExpense
      ] = await Promise.all([
        parseResponse(incomeStreamsRes, 'Income Streams'),
        parseResponse(expensesRes, 'Expenses'),
        parseResponse(incomeEntriesRes, 'Income Entries'),
        parseResponse(expenseEntriesRes, 'Expense Entries'),
        parseResponse(oneTimeIncomeRes, 'One-time Income'),
        parseResponse(oneTimeExpenseRes, 'One-time Expense')
      ]);

      // Process data for analytics
      const processedData = processAnalyticsData({
        incomeStreams,
        expenses,
        incomeEntries,
        expenseEntries,
        oneTimeIncome,
        oneTimeExpense
      });

      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Process raw data into analytics format
  const processAnalyticsData = (data: any): AnalyticsData => {
    const { incomeStreams, expenses, incomeEntries, expenseEntries, oneTimeIncome, oneTimeExpense } = data;

    console.log('=== ANALYTICS DATA PROCESSING START ===');
    console.log('Raw data received:', {
      incomeStreams: incomeStreams?.length || 0,
      expenses: expenses?.length || 0,
      incomeEntries: incomeEntries?.length || 0,
      expenseEntries: expenseEntries?.length || 0,
      oneTimeIncome: oneTimeIncome?.length || 0,
      oneTimeExpense: oneTimeExpense?.length || 0
    });

    // Log sample data to see structure
    if (incomeEntries?.length > 0) {
      console.log('Sample income entry:', incomeEntries[0]);
    }
    if (expenseEntries?.length > 0) {
      console.log('Sample expense entry:', expenseEntries[0]);
    }
    if (oneTimeIncome?.length > 0) {
      console.log('Sample one-time income:', oneTimeIncome[0]);
    }
    if (oneTimeExpense?.length > 0) {
      console.log('Sample one-time expense:', oneTimeExpense[0]);
    }

    // Calculate totals
    const totalRecurringIncome = incomeEntries?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
    const totalOneTimeIncome = oneTimeIncome?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
    const totalIncome = totalRecurringIncome + totalOneTimeIncome;

    const totalRecurringExpenses = expenseEntries?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
    const totalOneTimeExpenses = oneTimeExpense?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
    const totalExpenses = totalRecurringExpenses + totalOneTimeExpenses;

    const netFlow = totalIncome - totalExpenses;

    console.log('=== TOTALS CALCULATED ===');
    console.log('Total recurring income:', totalRecurringIncome);
    console.log('Total one-time income:', totalOneTimeIncome);
    console.log('Total income:', totalIncome);
    console.log('Total recurring expenses:', totalRecurringExpenses);
    console.log('Total one-time expenses:', totalOneTimeExpenses);
    console.log('Total expenses:', totalExpenses);
    console.log('Net flow:', netFlow);

    // Income by category
    console.log('=== PROCESSING INCOME BY CATEGORY ===');
    const incomeByCategory = processIncomeByCategory([...(incomeEntries || []), ...(oneTimeIncome || [])]);
    console.log('Income by category result:', incomeByCategory);
    
    // Expenses by category
    console.log('=== PROCESSING EXPENSES BY CATEGORY ===');
    const expensesByCategory = processExpensesByCategory([...(expenseEntries || []), ...(oneTimeExpense || [])]);
    console.log('Expenses by category result:', expensesByCategory);

    // Monthly trends
    console.log('=== PROCESSING MONTHLY TRENDS ===');
    const monthlyTrends = processMonthlyTrends(incomeEntries || [], expenseEntries || [], oneTimeIncome || [], oneTimeExpense || []);

    // Top income streams
    const topIncomeStreams = (incomeStreams || [])
      .map((stream: any) => ({
        name: stream.name,
        amount: Number(stream.actualMonthly || stream.expectedMonthly),
        type: stream.type
      }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5);

    console.log('Top income streams:', topIncomeStreams);

    // Top expenses
    const topExpenses = (expenses || [])
      .map((expense: any) => ({
        name: expense.name,
        amount: Number(expense.amount),
        category: expense.category
      }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5);

    console.log('Top expenses:', topExpenses);

    // Financial health metrics
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    
    // Calculate growth rates (simplified - would need historical data for accuracy)
    const incomeGrowth = 5.2; // Placeholder
    const expenseGrowth = 2.8; // Placeholder

    const result = {
      totalIncome,
      totalExpenses,
      netFlow,
      incomeByCategory,
      expensesByCategory,
      monthlyTrends,
      topIncomeStreams,
      topExpenses,
      financialHealth: {
        savingsRate,
        expenseRatio,
        incomeGrowth,
        expenseGrowth
      }
    };

    console.log('=== FINAL ANALYTICS DATA ===');
    console.log('Final processed data:', result);
    console.log('=== ANALYTICS DATA PROCESSING END ===');
    return result;
  };

  // Process income by category
  const processIncomeByCategory = (allIncomeEntries: any[]) => {
    const categoryTotals: { [key: string]: number } = {};
    
    allIncomeEntries.forEach(entry => {
      const category = entry.category || (entry.incomeStream?.type) || 'OTHER';
      categoryTotals[category] = (categoryTotals[category] || 0) + entry.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name: formatCategoryName(name),
        value,
        color: INCOME_COLORS[index % INCOME_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Process expenses by category  
  const processExpensesByCategory = (allExpenseEntries: any[]) => {
    const categoryTotals: { [key: string]: number } = {};
    
    allExpenseEntries.forEach(entry => {
      const category = entry.category || (entry.expense?.category) || 'OTHER';
      categoryTotals[category] = (categoryTotals[category] || 0) + entry.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name: formatCategoryName(name),
        value,
        color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Process monthly trends
  const processMonthlyTrends = (incomeEntries: any[], expenseEntries: any[], oneTimeIncome: any[], oneTimeExpense: any[]) => {
    console.log('=== MONTHLY TRENDS PROCESSING START ===');
    const monthlyData: { [key: string]: { income: number; expenses: number; month: string; date: string } } = {};

    console.log('Processing monthly trends with:', {
      incomeEntries: incomeEntries.length,
      expenseEntries: expenseEntries.length,
      oneTimeIncome: oneTimeIncome.length,
      oneTimeExpense: oneTimeExpense.length
    });

    // Log all entries to see their data structure
    console.log('All income entries:', incomeEntries);
    console.log('All expense entries:', expenseEntries);
    console.log('All one-time income:', oneTimeIncome);
    console.log('All one-time expenses:', oneTimeExpense);

    // Process recurring income entries
    console.log('=== PROCESSING RECURRING INCOME ENTRIES ===');
    incomeEntries.forEach((entry, index) => {
      console.log(`Processing income entry ${index}:`, entry);
      try {
        const date = new Date(entry.month);
        console.log('Parsed date:', date);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        console.log('Month key:', monthKey, 'Month name:', monthName);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName, date: monthKey };
        }
        
        monthlyData[monthKey].income += entry.amount;
        console.log('Updated monthly data for', monthKey, ':', monthlyData[monthKey]);
      } catch (error) {
        console.error('Error processing income entry:', error, entry);
      }
    });

    // Process recurring expense entries
    console.log('=== PROCESSING RECURRING EXPENSE ENTRIES ===');
    expenseEntries.forEach((entry, index) => {
      console.log(`Processing expense entry ${index}:`, entry);
      try {
        const date = new Date(entry.month);
        console.log('Parsed date:', date);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        console.log('Month key:', monthKey, 'Month name:', monthName);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName, date: monthKey };
        }
        
        monthlyData[monthKey].expenses += entry.amount;
        console.log('Updated monthly data for', monthKey, ':', monthlyData[monthKey]);
      } catch (error) {
        console.error('Error processing expense entry:', error, entry);
      }
    });

    // Process one-time income entries
    console.log('=== PROCESSING ONE-TIME INCOME ENTRIES ===');
    oneTimeIncome.forEach((entry, index) => {
      console.log(`Processing one-time income entry ${index}:`, entry);
      try {
        const date = new Date(entry.date);
        console.log('Parsed date:', date);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        console.log('Month key:', monthKey, 'Month name:', monthName);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName, date: monthKey };
        }
        
        monthlyData[monthKey].income += entry.amount;
        console.log('Updated monthly data for', monthKey, ':', monthlyData[monthKey]);
      } catch (error) {
        console.error('Error processing one-time income entry:', error, entry);
      }
    });

    // Process one-time expense entries
    console.log('=== PROCESSING ONE-TIME EXPENSE ENTRIES ===');
    oneTimeExpense.forEach((entry, index) => {
      console.log(`Processing one-time expense entry ${index}:`, entry);
      try {
        const date = new Date(entry.date);
        console.log('Parsed date:', date);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        console.log('Month key:', monthKey, 'Month name:', monthName);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName, date: monthKey };
        }
        
        monthlyData[monthKey].expenses += entry.amount;
        console.log('Updated monthly data for', monthKey, ':', monthlyData[monthKey]);
      } catch (error) {
        console.error('Error processing one-time expense entry:', error, entry);
      }
    });

    console.log('=== MONTHLY DATA AGGREGATED ===');
    console.log('Monthly data object:', monthlyData);
    console.log('Monthly data keys:', Object.keys(monthlyData));

    // If no data, create some placeholder data for the current month
    if (Object.keys(monthlyData).length === 0) {
      console.log('No monthly data found, creating placeholder');
      const currentDate = new Date();
      const monthKey = currentDate.toISOString().slice(0, 7);
      const monthName = currentDate.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
      
      monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName, date: monthKey };
      console.log('Placeholder data created:', monthlyData[monthKey]);
    }

    const result = Object.values(monthlyData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12) // Last 12 months
      .map(item => ({
        ...item,
        net: item.income - item.expenses
      }));

    console.log('=== FINAL MONTHLY TRENDS RESULT ===');
    console.log('Final monthly trends result:', result);
    console.log('Result length:', result.length);
    console.log('=== MONTHLY TRENDS PROCESSING END ===');
    return result;
  };

  // Format category names
  const formatCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'FREELANCE': 'Freelance',
      'AFFILIATE': 'Affiliate',
      'ADSENSE': 'AdSense',
      'GIGS': 'Gigs',
      'BONUS': 'Bonus',
      'GIFT': 'Gift',
      'FOOD': 'Food & Dining',
      'TRANSPORTATION': 'Transportation',
      'HOUSING': 'Housing',
      'UTILITIES': 'Utilities',
      'SHOPPING': 'Shopping',
      'HEALTHCARE': 'Healthcare',
      'ENTERTAINMENT': 'Entertainment',
      'BUSINESS': 'Business',
      'OTHER': 'Other'
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchAnalyticsData();
    }
  }, [user?.id, authLoading, selectedTimeRange, selectedYear]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <p className="text-gray-600">Please sign in to view your financial analytics.</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600">Add some income and expense data to see analytics.</p>
        </div>
      </div>
    );
  }

  // Ensure we have minimum data structure for charts
  const safeAnalyticsData = {
    ...analyticsData,
    monthlyTrends: analyticsData.monthlyTrends.length > 0 ? analyticsData.monthlyTrends : [
      { month: 'Current', income: 0, expenses: 0, net: 0, date: new Date().toISOString().slice(0, 7) }
    ],
    incomeByCategory: analyticsData.incomeByCategory.length > 0 ? analyticsData.incomeByCategory : [
      { name: 'No Income Data', value: 0, color: '#D1FAE5' }
    ],
    expensesByCategory: analyticsData.expensesByCategory.length > 0 ? analyticsData.expensesByCategory : [
      { name: 'No Expense Data', value: 0, color: '#FEE2E2' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your financial performance and trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(safeAnalyticsData.totalIncome)}
                  </div>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      +{safeAnalyticsData.financialHealth.incomeGrowth}%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(safeAnalyticsData.totalExpenses)}
                  </div>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600 font-medium">
                      +{safeAnalyticsData.financialHealth.expenseGrowth}%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Flow</p>
                  <div className={`text-2xl font-bold ${safeAnalyticsData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(safeAnalyticsData.netFlow)}
                  </div>
                  <div className="flex items-center mt-2">
                    {safeAnalyticsData.netFlow >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${safeAnalyticsData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {safeAnalyticsData.netFlow >= 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${safeAnalyticsData.netFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Wallet className={`h-6 w-6 ${safeAnalyticsData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Savings Rate</p>
                  <div className={`text-2xl font-bold ${safeAnalyticsData.financialHealth.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {safeAnalyticsData.financialHealth.savingsRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center mt-2">
                    <Target className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">
                      Target: 20%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Activity className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {/* Income vs Expenses Trends */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Income vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeAnalyticsData.monthlyTrends}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#incomeGradient)"
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#EF4444"
                        fillOpacity={1}
                        fill="url(#expenseGradient)"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Net Flow Chart */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Net Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeAnalyticsData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="net" 
                        name="Net Flow"
                        radius={[4, 4, 0, 0]}
                      >
                        {safeAnalyticsData.monthlyTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Income Breakdown */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={safeAnalyticsData.incomeByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {safeAnalyticsData.incomeByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {safeAnalyticsData.incomeByCategory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={safeAnalyticsData.expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {safeAnalyticsData.expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {safeAnalyticsData.expensesByCategory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Income Sources */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Top Income Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeAnalyticsData.topIncomeStreams.map((stream, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{stream.name}</h4>
                          <p className="text-sm text-gray-600">{formatCategoryName(stream.type)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(stream.amount)}
                          </div>
                          <div className="text-xs text-gray-500">per month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Expenses */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Top Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeAnalyticsData.topExpenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{expense.name}</h4>
                          <p className="text-sm text-gray-600">{formatCategoryName(expense.category)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="text-xs text-gray-500">per month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health Score */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Financial Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {safeAnalyticsData.financialHealth.savingsRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Savings Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {safeAnalyticsData.financialHealth.savingsRate >= 20 ? 'Excellent' : 
                       safeAnalyticsData.financialHealth.savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {safeAnalyticsData.financialHealth.expenseRatio.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Expense Ratio</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {safeAnalyticsData.financialHealth.expenseRatio <= 80 ? 'Good' : 'High'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      +{safeAnalyticsData.financialHealth.incomeGrowth.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Income Growth</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {safeAnalyticsData.financialHealth.incomeGrowth > 0 ? 'Positive' : 'Flat'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      +{safeAnalyticsData.financialHealth.expenseGrowth.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Expense Growth</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {safeAnalyticsData.financialHealth.expenseGrowth < safeAnalyticsData.financialHealth.incomeGrowth ? 'Controlled' : 'Watch'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 