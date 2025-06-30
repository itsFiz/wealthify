'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { 
  PieChart, 
  Plus, 
  Edit, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Activity,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations/index';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: React.ReactNode;
  color: string;
}

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [budgets] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Housing',
      budgeted: 2800,
      spent: 2500,
      icon: <Home className="h-4 w-4" />,
      color: 'bg-red-500'
    },
    {
      id: '2', 
      name: 'Food & Dining',
      budgeted: 1000,
      spent: 850,
      icon: <Utensils className="h-4 w-4" />,
      color: 'bg-orange-500'
    },
    {
      id: '3',
      name: 'Transportation',
      budgeted: 600,
      spent: 420,
      icon: <Car className="h-4 w-4" />,
      color: 'bg-yellow-500'
    },
    {
      id: '4',
      name: 'Shopping',
      budgeted: 500,
      spent: 680,
      icon: <ShoppingBag className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    {
      id: '5',
      name: 'Entertainment',
      budgeted: 400,
      spent: 290,
      icon: <Activity className="h-4 w-4" />,
      color: 'bg-purple-500'
    },
    {
      id: '6',
      name: 'Business',
      budgeted: 1500,
      spent: 1500,
      icon: <Briefcase className="h-4 w-4" />,
      color: 'bg-green-500'
    }
  ]);

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  const getBudgetStatus = (budgeted: number, spent: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return { status: 'over', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (percentage > 80) return { status: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { status: 'good', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
              Budget Management
            </h1>
            <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
              Track and manage your monthly spending by category
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Total Budgeted</span>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalBudgeted)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly budget allocation
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Total Spent</span>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className={`text-xs font-medium ${
                  totalSpent > totalBudgeted ? 'text-red-500' : 'text-green-500'
                }`}>
                  {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Remaining</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                remainingBudget < 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {formatCurrency(Math.abs(remainingBudget))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {remainingBudget < 0 ? 'Over budget' : 'Left to spend'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Budget Categories</h2>
            <Badge variant="outline" className="text-sm">
              {budgets.length} Categories
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.budgeted) * 100;
              const status = getBudgetStatus(budget.budgeted, budget.spent);
              const remaining = budget.budgeted - budget.spent;

              return (
                <Card key={budget.id} className="metric-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${status.bg}`}>
                          {budget.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{budget.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${status.bg} ${status.color} border-0`}>
                          {percentage.toFixed(0)}%
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <AnimatedProgress
                      value={Math.min(percentage, 100)}
                      colors={{
                        from: percentage > 100 ? 'from-red-400' :
                              percentage > 80 ? 'from-yellow-400' : 'from-green-400',
                        to: percentage > 100 ? 'to-red-600' :
                            percentage > 80 ? 'to-orange-500' : 'to-green-600',
                        trail: 'bg-muted/20'
                      }}
                      variant="gradient"
                      size="md"
                    />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {remaining > 0 ? 'Remaining' : 'Over budget'}
                      </span>
                      <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>

                    {percentage > 100 && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">
                          Over budget by {formatCurrency(budget.spent - budget.budgeted)}
                        </span>
                      </div>
                    )}

                    {percentage > 80 && percentage <= 100 && (
                      <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600">
                          Approaching budget limit
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Budget Summary */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Budget Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Category Breakdown</h4>
                <div className="space-y-2">
                  {budgets.map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${budget.color}`} />
                        <span className="text-sm">{budget.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {((budget.budgeted / totalBudgeted) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Budget Health</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">On Track</span>
                    <span className="text-sm font-bold text-green-600">
                      {budgets.filter(b => (b.spent / b.budgeted) <= 0.8).length} categories
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">At Risk</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {budgets.filter(b => (b.spent / b.budgeted) > 0.8 && (b.spent / b.budgeted) <= 1).length} categories
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over Budget</span>
                    <span className="text-sm font-bold text-red-600">
                      {budgets.filter(b => (b.spent / b.budgeted) > 1).length} categories
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 