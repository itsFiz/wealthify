interface Insight {
  type: 'opportunity' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'income' | 'expenses' | 'goals' | 'savings' | 'general';
  actionable?: boolean;
  recommendation?: string;
  potentialSaving?: number;
  timeline?: string;
}

interface AnalyticsData {
  snapshots: any[];
  goalPerformance: any[];
  incomeStreamPerformance: any[];
  expenseBreakdown: any[];
  monthlyIncome: number;
  monthlyExpenses: number;
  currentBalance: number;
  burnRate: number;
  savingsRate: number;
}

export function generateFinancialInsights(data: AnalyticsData): Insight[] {
  const insights: Insight[] = [];
  
  // Income Analysis
  if (data.incomeStreamPerformance.length > 0) {
    const underperformingStreams = data.incomeStreamPerformance.filter(s => s.variance < -10);
    const highVarianceStreams = data.incomeStreamPerformance.filter(s => Math.abs(s.variance) > 25);
    
    if (underperformingStreams.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Income Streams Underperforming',
        description: `${underperformingStreams.length} income source(s) are performing below expectations.`,
        impact: 'high',
        category: 'income',
        actionable: true,
        recommendation: 'Review and optimize underperforming income streams or consider diversification.',
        timeline: '1-2 months'
      });
    }
    
    if (highVarianceStreams.length > 0) {
      insights.push({
        type: 'tip',
        title: 'Income Stability Risk',
        description: 'Some income sources show high volatility, which could affect financial planning.',
        impact: 'medium',
        category: 'income',
        actionable: true,
        recommendation: 'Consider building more stable income sources to reduce financial risk.'
      });
    }
  }

  // Expense Analysis
  if (data.expenseBreakdown.length > 0) {
    const largestExpense = data.expenseBreakdown.reduce((prev, current) => 
      (prev.amount > current.amount) ? prev : current
    );
    
    if (largestExpense.percentage > 40) {
      insights.push({
        type: 'opportunity',
        title: 'High Expense Category Detected',
        description: `${largestExpense.category} accounts for ${largestExpense.percentage.toFixed(1)}% of your expenses.`,
        impact: 'high',
        category: 'expenses',
        actionable: true,
        recommendation: `Review ${largestExpense.category} expenses for potential optimization opportunities.`,
        potentialSaving: largestExpense.amount * 0.15, // 15% potential reduction
        timeline: '2-4 weeks'
      });
    }
    
    // Look for trending expense categories
    if (data.snapshots.length >= 2) {
      const currentMonth = data.snapshots[0];
      const previousMonth = data.snapshots[1];
      const expenseIncrease = ((currentMonth.totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses) * 100;
      
      if (expenseIncrease > 15) {
        insights.push({
          type: 'warning',
          title: 'Expenses Trending Upward',
          description: `Your expenses increased by ${expenseIncrease.toFixed(1)}% this month.`,
          impact: 'high',
          category: 'expenses',
          actionable: true,
          recommendation: 'Review recent spending patterns and identify areas to cut back.',
          timeline: 'This week'
        });
      }
    }
  }

  // Burn Rate Analysis
  if (data.burnRate > 80) {
    insights.push({
      type: 'warning',
      title: 'Critical Burn Rate',
      description: `Your burn rate of ${data.burnRate.toFixed(1)}% indicates you're spending most of your income.`,
      impact: 'high',
      category: 'savings',
      actionable: true,
      recommendation: 'Immediate expense reduction needed. Consider emergency budget adjustments.',
      timeline: 'This week'
    });
  } else if (data.burnRate > 60) {
    insights.push({
      type: 'opportunity',
      title: 'Optimize Spending',
      description: `With a ${data.burnRate.toFixed(1)}% burn rate, there's room for improvement in your savings.`,
      impact: 'medium',
      category: 'savings',
      actionable: true,
      recommendation: 'Target reducing expenses by 10-15% to improve your savings rate.',
      potentialSaving: data.monthlyExpenses * 0.125,
      timeline: '1-2 months'
    });
  }

  // Savings Rate Analysis
  if (data.savingsRate < 10) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `Your savings rate of ${data.savingsRate.toFixed(1)}% is below the recommended 20% minimum.`,
      impact: 'high',
      category: 'savings',
      actionable: true,
      recommendation: 'Focus on increasing income or reducing expenses to reach a 20% savings rate.',
      timeline: '3-6 months'
    });
  } else if (data.savingsRate > 30) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Savings Rate!',
      description: `Your ${data.savingsRate.toFixed(1)}% savings rate exceeds financial best practices.`,
      impact: 'high',
      category: 'savings',
      recommendation: 'Consider investing excess savings for long-term wealth building.'
    });
  }

  // Goal Analysis
  if (data.goalPerformance.length > 0) {
    const offTrackGoals = data.goalPerformance.filter(g => !g.isOnTrack);
    const completedGoals = data.goalPerformance.filter(g => g.progress >= 100);
    
    if (offTrackGoals.length > 0) {
      const totalRequired = offTrackGoals.reduce((sum, goal) => sum + goal.requiredMonthly, 0);
      insights.push({
        type: 'warning',
        title: 'Goals Behind Schedule',
        description: `${offTrackGoals.length} goal(s) may not meet their target dates at current pace.`,
        impact: 'medium',
        category: 'goals',
        actionable: true,
        recommendation: `Consider increasing monthly contributions by ${((totalRequired / data.monthlyIncome) * 100).toFixed(1)}% of income.`,
        timeline: 'Next month'
      });
    }
    
    if (completedGoals.length > 0) {
      insights.push({
        type: 'achievement',
        title: 'Goals Achieved!',
        description: `Congratulations! You've completed ${completedGoals.length} financial goal(s).`,
        impact: 'high',
        category: 'goals',
        recommendation: 'Set new ambitious goals to continue your financial growth journey.'
      });
    }
  }

  // Emergency Fund Analysis
  const emergencyFundMonths = data.currentBalance / data.monthlyExpenses;
  if (emergencyFundMonths < 3) {
    insights.push({
      type: 'opportunity',
      title: 'Build Emergency Fund',
      description: `Your current balance covers ${emergencyFundMonths.toFixed(1)} months of expenses.`,
      impact: 'high',
      category: 'savings',
      actionable: true,
      recommendation: 'Prioritize building a 3-6 month emergency fund for financial security.',
      potentialSaving: data.monthlyExpenses * 3 - data.currentBalance,
      timeline: '6-12 months'
    });
  } else if (emergencyFundMonths >= 6) {
    insights.push({
      type: 'achievement',
      title: 'Strong Emergency Fund',
      description: `Your emergency fund covers ${emergencyFundMonths.toFixed(1)} months of expenses.`,
      impact: 'medium',
      category: 'savings',
      recommendation: 'Consider investing excess emergency funds for higher returns.'
    });
  }

  // Trend Analysis
  if (data.snapshots.length >= 3) {
    const recentSnapshots = data.snapshots.slice(0, 3);
    const avgIncome = recentSnapshots.reduce((sum, s) => sum + s.totalIncome, 0) / 3;
    const avgExpenses = recentSnapshots.reduce((sum, s) => sum + s.totalExpenses, 0) / 3;
    
    const incomeGrowth = ((recentSnapshots[0].totalIncome - recentSnapshots[2].totalIncome) / recentSnapshots[2].totalIncome) * 100;
    
    if (incomeGrowth > 10) {
      insights.push({
        type: 'achievement',
        title: 'Strong Income Growth',
        description: `Your income has grown ${incomeGrowth.toFixed(1)}% over the last 3 months.`,
        impact: 'high',
        category: 'income',
        recommendation: 'Capitalize on this growth by increasing savings and investment contributions.'
      });
    }
  }

  // Financial Health Tips
  if (data.monthlyIncome > 0 && data.monthlyExpenses > 0) {
    const wealthBuildingCapacity = (data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome;
    
    if (wealthBuildingCapacity > 0.3) {
      insights.push({
        type: 'tip',
        title: 'High Wealth Building Potential',
        description: 'You have strong capacity for wealth building with your current income-expense ratio.',
        impact: 'medium',
        category: 'general',
        recommendation: 'Consider accelerating investments in diversified portfolios or real estate.'
      });
    }
  }

  return insights;
}

export function generateComparisonData(snapshots: any[]) {
  if (snapshots.length < 2) return [];
  
  const current = snapshots[0];
  const previous = snapshots[1];
  
  return [
    {
      metric: 'Total Income',
      current: current.totalIncome,
      previous: previous.totalIncome,
      type: 'currency' as const,
      status: current.totalIncome > previous.totalIncome ? 'improved' as const :
              current.totalIncome < previous.totalIncome ? 'declined' as const : 'stable' as const
    },
    {
      metric: 'Total Expenses',
      current: current.totalExpenses,
      previous: previous.totalExpenses,
      type: 'currency' as const,
      status: current.totalExpenses < previous.totalExpenses ? 'improved' as const :
              current.totalExpenses > previous.totalExpenses ? 'declined' as const : 'stable' as const
    },
    {
      metric: 'Monthly Savings',
      current: current.totalSavings,
      previous: previous.totalSavings,
      type: 'currency' as const,
      status: current.totalSavings > previous.totalSavings ? 'improved' as const :
              current.totalSavings < previous.totalSavings ? 'declined' as const : 'stable' as const
    },
    {
      metric: 'Burn Rate',
      current: current.burnRate,
      previous: previous.burnRate,
      type: 'percentage' as const,
      status: current.burnRate < previous.burnRate ? 'improved' as const :
              current.burnRate > previous.burnRate ? 'declined' as const : 'stable' as const
    },
    {
      metric: 'Savings Rate',
      current: current.savingsRate,
      previous: previous.savingsRate,
      type: 'percentage' as const,
      status: current.savingsRate > previous.savingsRate ? 'improved' as const :
              current.savingsRate < previous.savingsRate ? 'declined' as const : 'stable' as const
    },
    {
      metric: 'Health Score',
      current: current.healthScore,
      previous: previous.healthScore,
      type: 'number' as const,
      status: current.healthScore > previous.healthScore ? 'improved' as const :
              current.healthScore < previous.healthScore ? 'declined' as const : 'stable' as const
    }
  ];
} 