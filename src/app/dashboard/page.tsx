'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { GoalProgressCard } from '@/components/gamification/GoalProgressCard';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatCurrency, getBurnRateColor, getHealthScoreColor } from '@/lib/calculations';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Target,
  Zap,
  Plus,
  ArrowRight,
  PieChart,
  BarChart3,
  Trophy,
  Activity
} from 'lucide-react';
import type { Goal, IncomeStream, Expense } from '@/types';
import { IncomeType, ExpenseCategory, ExpenseType, Frequency, GoalCategory } from '@/types';

// Mock data for demonstration
const mockIncomeStreams: IncomeStream[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Software Engineer Salary',
    type: IncomeType.SALARY,
    expectedMonthly: 8000,
    actualMonthly: 8000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Freelance Projects',
    type: IncomeType.FREELANCE,
    expectedMonthly: 2000,
    actualMonthly: 2500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Investment Dividends',
    type: IncomeType.INVESTMENT,
    expectedMonthly: 500,
    actualMonthly: 450,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Rent',
    category: ExpenseCategory.HOUSING,
    type: ExpenseType.FIXED,
    amount: 2500,
    frequency: Frequency.MONTHLY,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Groceries',
    category: ExpenseCategory.FOOD,
    type: ExpenseType.VARIABLE,
    amount: 800,
    frequency: Frequency.MONTHLY,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Startup Burn',
    category: ExpenseCategory.BUSINESS,
    type: ExpenseType.STARTUP_BURN,
    amount: 1500,
    frequency: Frequency.MONTHLY,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockGoals: Goal[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Toyota GT86',
    description: 'Dream sports car purchase',
    targetAmount: 90000,
    currentAmount: 32000,
    targetDate: new Date('2024-12-31'),
    priority: 1,
    category: GoalCategory.VEHICLE,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Emergency Fund',
    description: '6 months of expenses',
    targetAmount: 18000,
    currentAmount: 15000,
    targetDate: new Date('2024-06-30'),
    priority: 1,
    category: GoalCategory.EMERGENCY_FUND,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Property Down Payment',
    description: 'Down payment for first home',
    targetAmount: 35000,
    currentAmount: 8000,
    targetDate: new Date('2025-12-31'),
    priority: 2,
    category: GoalCategory.PROPERTY,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Dashboard() {
  const {
    incomeStreams,
    expenses,
    goals,
    monthlyIncome,
    monthlyExpenses,
    burnRate,
    savingsRate,
    healthScore,
    isLoading,
    error,
    setIncomeStreams,
    setExpenses,
    setGoals,
  } = useDashboardStore();

  // Initialize with mock data
  useEffect(() => {
    setIncomeStreams(mockIncomeStreams);
    setExpenses(mockExpenses);
    setGoals(mockGoals);
  }, [setIncomeStreams, setExpenses, setGoals]);

  const totalSavings = monthlyIncome - monthlyExpenses;
  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your wealth-building journey with real-time insights
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Last updated</div>
            <div className="text-sm font-medium">Just now</div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Monthly Income"
            value="RM 10,950"
            subtitle="3 active streams"
            trend={{
              value: 8.2,
              label: "vs last month",
              type: "positive"
            }}
            badge={{
              text: "Strong",
              variant: "default"
            }}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          
          <DashboardCard
            title="Monthly Expenses"
            value="RM 4,800"
            subtitle="Including startup burn"
            trend={{
              value: -2.1,
              label: "vs last month", 
              type: "positive"
            }}
            badge={{
              text: "Controlled",
              variant: "secondary"
            }}
            icon={<TrendingDown className="h-4 w-4" />}
          />
          
          <DashboardCard
            title="Monthly Savings"
            value="RM 6,150"
            subtitle="56.2% savings rate"
            trend={{
              value: 12.5,
              label: "vs last month",
              type: "positive"
            }}
            badge={{
              text: "Excellent",
              variant: "default"
            }}
            icon={<Wallet className="h-4 w-4" />}
          />
          
          <DashboardCard
            title="Health Score"
            value="85/100"
            subtitle="Financial wellness"
            trend={{
              value: 5.0,
              label: "vs last month",
              type: "positive"
            }}
            badge={{
              text: "Great",
              variant: "default"
            }}
            icon={<Target className="h-4 w-4" />}
          />
        </div>

        {/* Goals Progress */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              🎯 Active Goals
            </h2>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              3 Goals Active
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {mockGoals.map((goal) => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                onAddContribution={() => console.log(`Add contribution to ${goal.name}`)}
                onViewDetails={() => console.log(`View details for ${goal.name}`)}
              />
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Income Breakdown */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Income Streams</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Software Engineer Salary</span>
                  </div>
                  <span className="font-semibold">RM 8,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Freelance Projects</span>
                  </div>
                  <span className="font-semibold">RM 2,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Investment Dividends</span>
                  </div>
                  <span className="font-semibold">RM 450</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span>Monthly Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Rent & Utilities</span>
                  </div>
                  <span className="font-semibold">RM 2,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Startup Business Burn</span>
                  </div>
                  <span className="font-semibold">RM 1,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Food & Groceries</span>
                  </div>
                  <span className="font-semibold">RM 800</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 