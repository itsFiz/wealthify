import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity, PiggyBank } from 'lucide-react';
import { IncomeStream, Expense } from '../../types';

interface FinancialSummaryProps {
  incomeStreams: IncomeStream[];
  expenses: Expense[];
  currentSavings?: number;
  totalDebt?: number;
}

export function FinancialSummary({ 
  incomeStreams, 
  expenses, 
  currentSavings = 0, 
  totalDebt = 0 
}: FinancialSummaryProps) {
  const totalMonthlyIncome = incomeStreams.reduce((sum, stream) => 
    sum + (stream.actualMonthly || stream.expectedMonthly), 0
  );

  const totalMonthlyExpenses = expenses
    .filter(expense => expense.frequency === 'MONTHLY')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;
  const burnRate = totalMonthlyIncome > 0 ? (totalMonthlyExpenses / totalMonthlyIncome) * 100 : 0;
  
  // Simple Net Worth Calculation
  const netWorth = currentSavings - totalDebt;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSavingsColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Net Worth Card - Featured */}
      {(currentSavings > 0 || totalDebt > 0) && (
        <Card className="metric-card border-primary/20 bg-gradient-to-r from-primary/5 to-cyan-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Net Worth</CardTitle>
                  <p className="text-sm text-muted-foreground">Your financial position</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              <span className={netWorth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netWorth)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Savings</span>
                <div className="font-semibold text-green-600">{formatCurrency(currentSavings)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Debt</span>
                <div className="font-semibold text-red-600">{formatCurrency(totalDebt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Flow Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {incomeStreams.length} stream{incomeStreams.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlySavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate.toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge 
                variant="outline" 
                className={getSavingsColor(savingsRate)}
              >
                {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Burn Rate: {burnRate.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 