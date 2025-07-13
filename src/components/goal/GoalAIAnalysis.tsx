import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Zap, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Calculator,
  PiggyBank,
  ArrowRight,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  CalendarDays,
  Activity
} from 'lucide-react';
import { 
  formatCurrency
} from '@/lib/calculations/index';
import type { Goal, IncomeStream, Expense } from '@/types';
import { cn } from '@/lib/utils';

interface GoalAIAnalysisProps {
  goal: Goal;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeStreams: IncomeStream[];
  expenses: Expense[];
  className?: string;
}

interface AnalysisScenario {
  id: string;
  name: string;
  description: string;
  monthlyContribution: number;
  timelineMonths: number;
  completionDate: Date;
  feasibility: 'excellent' | 'good' | 'challenging' | 'difficult';
  impactOnLifestyle: 'minimal' | 'moderate' | 'significant' | 'major';
  recommendations: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StrategicInsight {
  type: 'income' | 'timeline' | 'optimization' | 'risk' | 'opportunity' | 'contribution' | 'consistency';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
}

interface ContributionAnalysis {
  totalContributions: number;
  averageMonthlyContribution: number;
  highestContribution: number;
  lowestContribution: number;
  contributionConsistency: 'excellent' | 'good' | 'fair' | 'poor';
  contributionTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  monthsWithContributions: number;
  totalMonthsSinceStart: number;
  consistencyScore: number; // 0-100
  projectedCompletionDate: Date;
  projectedCompletionAmount: number;
  isOnTrack: boolean;
  monthlyVariance: number; // Standard deviation of contributions
}

export function GoalAIAnalysis({
  goal,
  monthlyIncome,
  monthlyExpenses,
  incomeStreams,
  expenses,
  className
}: GoalAIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    scenarios: AnalysisScenario[];
    insights: StrategicInsight[];
    riskAssessment: string;
    optimizationStrategies: string[];
    contributionAnalysis: ContributionAnalysis;
  } | null>(null);

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const targetDate = new Date(goal.targetDate);
  const monthsToTarget = Math.max(0, 
    Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  const analyzeContributions = (): ContributionAnalysis => {
    const contributions = goal.contributions || [];
    
    if (contributions.length === 0) {
      return {
        totalContributions: 0,
        averageMonthlyContribution: 0,
        highestContribution: 0,
        lowestContribution: 0,
        contributionConsistency: 'poor',
        contributionTrend: 'stable',
        monthsWithContributions: 0,
        totalMonthsSinceStart: Math.max(1, Math.ceil((new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))),
        consistencyScore: 0,
        projectedCompletionDate: targetDate,
        projectedCompletionAmount: goal.currentAmount,
        isOnTrack: false,
        monthlyVariance: 0
      };
    }

    // Sort contributions by date
    const sortedContributions = [...contributions].sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    const amounts = sortedContributions.map(c => c.amount);
    const totalContributions = amounts.reduce((sum, amount) => sum + amount, 0);
    const averageMonthlyContribution = totalContributions / contributions.length;
    const highestContribution = Math.max(...amounts);
    const lowestContribution = Math.min(...amounts);

    // Calculate consistency (standard deviation)
    const mean = averageMonthlyContribution;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const monthlyVariance = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (monthlyVariance / mean) * 100);

    // Determine consistency level
    let contributionConsistency: 'excellent' | 'good' | 'fair' | 'poor';
    if (consistencyScore >= 90) contributionConsistency = 'excellent';
    else if (consistencyScore >= 75) contributionConsistency = 'good';
    else if (consistencyScore >= 50) contributionConsistency = 'fair';
    else contributionConsistency = 'poor';

    // Analyze trend
    const recentContributions = sortedContributions.slice(-3);
    const olderContributions = sortedContributions.slice(0, 3);
    const recentAverage = recentContributions.reduce((sum, c) => sum + c.amount, 0) / recentContributions.length;
    const olderAverage = olderContributions.reduce((sum, c) => sum + c.amount, 0) / olderContributions.length;
    
    let contributionTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (recentContributions.length >= 2 && olderContributions.length >= 2) {
      const trendChange = ((recentAverage - olderAverage) / olderAverage) * 100;
      if (trendChange > 20) contributionTrend = 'increasing';
      else if (trendChange < -20) contributionTrend = 'decreasing';
      else if (consistencyScore < 60) contributionTrend = 'volatile';
      else contributionTrend = 'stable';
    } else {
      contributionTrend = 'stable';
    }

    // Calculate months since goal creation
    const totalMonthsSinceStart = Math.max(1, Math.ceil((new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthsWithContributions = contributions.length;

    // Project completion based on current average
    const projectedCompletionDate = new Date(Date.now() + (remainingAmount / averageMonthlyContribution) * 30 * 24 * 60 * 60 * 1000);
    const projectedCompletionAmount = goal.currentAmount + (averageMonthlyContribution * monthsToTarget);
    const isOnTrack = projectedCompletionAmount >= goal.targetAmount;

    return {
      totalContributions,
      averageMonthlyContribution,
      highestContribution,
      lowestContribution,
      contributionConsistency,
      contributionTrend,
      monthsWithContributions,
      totalMonthsSinceStart,
      consistencyScore,
      projectedCompletionDate,
      projectedCompletionAmount,
      isOnTrack,
      monthlyVariance
    };
  };

  const generateAnalysis = useCallback(() => {
    setIsLoading(true);
    
    // Simulate AI analysis processing
    setTimeout(() => {
      const contributionAnalysis = analyzeContributions();
      const scenarios = generateScenarios(contributionAnalysis);
      const insights = generateInsights(contributionAnalysis);
      const riskAssessment = assessRisks(contributionAnalysis);
      const optimizationStrategies = generateOptimizationStrategies(contributionAnalysis);
      
      setAnalysis({
        scenarios,
        insights,
        riskAssessment,
        optimizationStrategies,
        contributionAnalysis
      });
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const generateScenarios = (contributionAnalysis: ContributionAnalysis): AnalysisScenario[] => {
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const requiredMonthlySavings = remainingAmount / monthsToTarget;
    const currentAverage = contributionAnalysis.averageMonthlyContribution;
    
    const scenarios: AnalysisScenario[] = [
      {
        id: 'current-pace',
        name: 'Current Contribution Pace',
        description: `Continue with your current average of ${formatCurrency(currentAverage)} monthly`,
        monthlyContribution: currentAverage,
        timelineMonths: Math.ceil(remainingAmount / currentAverage),
        completionDate: new Date(Date.now() + Math.ceil(remainingAmount / currentAverage) * 30 * 24 * 60 * 60 * 1000),
        feasibility: currentAverage >= requiredMonthlySavings ? 'excellent' : 'good',
        impactOnLifestyle: 'minimal',
        recommendations: [
          'Maintain current contribution consistency',
          'Consider small increases during bonus periods',
          'Automate contributions for consistency'
        ],
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      },
      {
        id: 'conservative',
        name: 'Conservative Approach',
        description: 'Steady, sustainable savings with minimal lifestyle impact',
        monthlyContribution: Math.min(monthlySurplus * 0.3, requiredMonthlySavings),
        timelineMonths: Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.3, requiredMonthlySavings)),
        completionDate: new Date(Date.now() + Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.3, requiredMonthlySavings)) * 30 * 24 * 60 * 60 * 1000),
        feasibility: monthlySurplus * 0.3 >= requiredMonthlySavings ? 'excellent' : 'good',
        impactOnLifestyle: 'minimal',
        recommendations: [
          'Maintain current lifestyle',
          'Focus on consistent contributions',
          'Consider side income opportunities'
        ],
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      },
      {
        id: 'moderate',
        name: 'Balanced Strategy',
        description: 'Optimal balance between speed and sustainability',
        monthlyContribution: Math.min(monthlySurplus * 0.5, requiredMonthlySavings * 1.2),
        timelineMonths: Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.5, requiredMonthlySavings * 1.2)),
        completionDate: new Date(Date.now() + Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.5, requiredMonthlySavings * 1.2)) * 30 * 24 * 60 * 60 * 1000),
        feasibility: monthlySurplus * 0.5 >= requiredMonthlySavings ? 'good' : 'challenging',
        impactOnLifestyle: 'moderate',
        recommendations: [
          'Reduce discretionary spending',
          'Optimize recurring expenses',
          'Explore income diversification'
        ],
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800'
      },
      {
        id: 'aggressive',
        name: 'Accelerated Timeline',
        description: 'Fast-track completion with focused financial discipline',
        monthlyContribution: Math.min(monthlySurplus * 0.7, requiredMonthlySavings * 1.5),
        timelineMonths: Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.7, requiredMonthlySavings * 1.5)),
        completionDate: new Date(Date.now() + Math.ceil(remainingAmount / Math.min(monthlySurplus * 0.7, requiredMonthlySavings * 1.5)) * 30 * 24 * 60 * 60 * 1000),
        feasibility: monthlySurplus * 0.7 >= requiredMonthlySavings ? 'challenging' : 'difficult',
        impactOnLifestyle: 'significant',
        recommendations: [
          'Significant expense reduction',
          'Pursue additional income sources',
          'Consider temporary sacrifices'
        ],
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      }
    ];

    return scenarios;
  };

  const generateInsights = (contributionAnalysis: ContributionAnalysis): StrategicInsight[] => {
    const insights: StrategicInsight[] = [];
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const requiredMonthlySavings = remainingAmount / monthsToTarget;

    // Contribution-based insights
    if (contributionAnalysis.totalContributions > 0) {
      // Consistency insights
      if (contributionAnalysis.contributionConsistency === 'excellent') {
        insights.push({
          type: 'contribution',
          title: 'Excellent Contribution Consistency',
          description: `Your contributions are very consistent with only ${formatCurrency(contributionAnalysis.monthlyVariance)} variance. This shows strong financial discipline.`,
          impact: 'positive',
          priority: 'medium',
          actionable: false
        });
      } else if (contributionAnalysis.contributionConsistency === 'poor') {
        insights.push({
          type: 'consistency',
          title: 'Inconsistent Contribution Pattern',
          description: `Your contributions vary significantly (${formatCurrency(contributionAnalysis.monthlyVariance)} variance). Consider setting up automated transfers.`,
          impact: 'negative',
          priority: 'high',
          actionable: true,
          action: 'Set up automated monthly contributions'
        });
      }

      // Trend insights
      if (contributionAnalysis.contributionTrend === 'increasing') {
        insights.push({
          type: 'contribution',
          title: 'Positive Contribution Trend',
          description: 'Your contributions are increasing over time, showing improving financial capacity.',
          impact: 'positive',
          priority: 'medium',
          actionable: false
        });
      } else if (contributionAnalysis.contributionTrend === 'decreasing') {
        insights.push({
          type: 'contribution',
          title: 'Declining Contribution Trend',
          description: 'Your contributions are decreasing. Review your financial priorities and budget.',
          impact: 'negative',
          priority: 'high',
          actionable: true,
          action: 'Review budget and financial priorities'
        });
      }

      // On-track analysis
      if (contributionAnalysis.isOnTrack) {
        insights.push({
          type: 'timeline',
          title: 'On Track for Goal Completion',
          description: `At your current pace, you'll reach your goal by ${contributionAnalysis.projectedCompletionDate.toLocaleDateString()}.`,
          impact: 'positive',
          priority: 'medium',
          actionable: false
        });
      } else {
        insights.push({
          type: 'timeline',
          title: 'Behind Schedule',
          description: `At your current pace, you'll need ${Math.ceil(remainingAmount / contributionAnalysis.averageMonthlyContribution)} months instead of ${monthsToTarget}.`,
          impact: 'negative',
          priority: 'high',
          actionable: true,
          action: 'Increase monthly contributions or extend timeline'
        });
      }

      // Frequency insights
      const contributionRate = contributionAnalysis.monthsWithContributions / contributionAnalysis.totalMonthsSinceStart;
      if (contributionRate < 0.5) {
        insights.push({
          type: 'consistency',
          title: 'Low Contribution Frequency',
          description: `You've contributed in only ${Math.round(contributionRate * 100)}% of months since starting. Consider more regular contributions.`,
          impact: 'negative',
          priority: 'high',
          actionable: true,
          action: 'Set up monthly contribution reminders'
        });
      }
    } else {
      insights.push({
        type: 'contribution',
        title: 'No Contributions Yet',
        description: 'You haven\'t made any contributions to this goal yet. Start with a small amount to build momentum.',
        impact: 'negative',
        priority: 'high',
        actionable: true,
        action: 'Make your first contribution today'
      });
    }

    // Income insights
    if (requiredMonthlySavings > monthlySurplus) {
      insights.push({
        type: 'income',
        title: 'Income Gap Identified',
        description: `You need ${formatCurrency(requiredMonthlySavings - monthlySurplus)} more monthly income to meet your timeline.`,
        impact: 'negative',
        priority: 'high',
        actionable: true,
        action: 'Consider income diversification strategies'
      });
    }

    // Timeline insights
    if (monthsToTarget < 6) {
      insights.push({
        type: 'timeline',
        title: 'Timeline Pressure',
        description: 'Your goal timeline is quite aggressive. Consider extending the deadline for better feasibility.',
        impact: 'negative',
        priority: 'high',
        actionable: true,
        action: 'Review and adjust target date'
      });
    }

    // Optimization insights
    if (expenses.length > 0) {
      const highestExpense = expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max);
      insights.push({
        type: 'optimization',
        title: 'Expense Optimization Opportunity',
        description: `${highestExpense.name} is your largest expense. Reducing it by 20% could accelerate your goal by ${Math.ceil((highestExpense.amount * 0.2 * 12) / requiredMonthlySavings)} months.`,
        impact: 'positive',
        priority: 'medium',
        actionable: true,
        action: 'Review and optimize expenses'
      });
    }

    // Risk insights
    if (monthlySurplus < monthlyIncome * 0.1) {
      insights.push({
        type: 'risk',
        title: 'Low Savings Buffer',
        description: 'Your monthly surplus is less than 10% of income, creating financial vulnerability.',
        impact: 'negative',
        priority: 'high',
        actionable: true,
        action: 'Build emergency fund first'
      });
    }

    // Opportunity insights
    if (incomeStreams.length === 1) {
      insights.push({
        type: 'opportunity',
        title: 'Income Diversification Opportunity',
        description: 'You have a single income source. Adding a side hustle could accelerate your goal significantly.',
        impact: 'positive',
        priority: 'medium',
        actionable: true,
        action: 'Explore additional income sources'
      });
    }

    return insights;
  };

  const assessRisks = (contributionAnalysis: ContributionAnalysis): string => {
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const requiredMonthlySavings = remainingAmount / monthsToTarget;
    
    if (contributionAnalysis.totalContributions === 0) {
      return 'High risk - No contributions made yet, goal may not be achievable';
    }
    
    if (!contributionAnalysis.isOnTrack) {
      return 'Moderate risk - Current pace insufficient to meet timeline';
    }
    
    if (contributionAnalysis.contributionConsistency === 'poor') {
      return 'Moderate risk - Inconsistent contributions may lead to timeline delays';
    }
    
    if (requiredMonthlySavings > monthlySurplus * 0.8) {
      return 'High risk - Goal requires more than 80% of available surplus';
    } else if (requiredMonthlySavings > monthlySurplus * 0.5) {
      return 'Moderate risk - Goal requires significant portion of available surplus';
    } else if (requiredMonthlySavings > monthlySurplus * 0.3) {
      return 'Low risk - Goal is well within financial capacity';
    } else {
      return 'Minimal risk - Goal can be achieved comfortably';
    }
  };

  const generateOptimizationStrategies = (contributionAnalysis: ContributionAnalysis): string[] => {
    const strategies = [];
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const requiredMonthlySavings = remainingAmount / monthsToTarget;

    // Contribution-based strategies
    if (contributionAnalysis.contributionConsistency === 'poor') {
      strategies.push('Set up automated monthly contributions for consistency');
      strategies.push('Create a dedicated savings account for this goal');
    }

    if (contributionAnalysis.contributionTrend === 'decreasing') {
      strategies.push('Review and adjust your budget to maintain contribution levels');
      strategies.push('Consider reducing other discretionary expenses');
    }

    if (!contributionAnalysis.isOnTrack) {
      strategies.push(`Increase monthly contributions by ${formatCurrency(requiredMonthlySavings - contributionAnalysis.averageMonthlyContribution)}`);
      strategies.push('Consider extending the goal timeline for better feasibility');
    }

    if (requiredMonthlySavings > monthlySurplus) {
      strategies.push('Increase income through side hustles or career advancement');
      strategies.push('Reduce discretionary expenses by 20-30%');
      strategies.push('Consider extending the goal timeline');
    }

    if (expenses.length > 5) {
      strategies.push('Consolidate or eliminate redundant expenses');
      strategies.push('Negotiate better rates on recurring services');
    }

    if (incomeStreams.length === 1) {
      strategies.push('Diversify income sources through investments or side businesses');
    }

    if (monthsToTarget > 24) {
      strategies.push('Consider investing surplus funds for compound growth');
    }

    return strategies;
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
      case 'challenging': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50';
      case 'difficult': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'minimal': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      case 'significant': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50';
      case 'major': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getConsistencyColor = (consistency: string) => {
    switch (consistency) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI-Powered Strategic Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Intelligent insights and optimization strategies for your goal
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Analyzing your goal with AI...</span>
          </div>
        </Card>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Contribution Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Contribution Analysis</span>
              </CardTitle>
              <CardDescription>
                AI analysis of your contribution patterns and consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(analysis.contributionAnalysis.averageMonthlyContribution)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Monthly</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.contributionAnalysis.consistencyScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Consistency Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.contributionAnalysis.monthsWithContributions}/{analysis.contributionAnalysis.totalMonthsSinceStart}
                  </div>
                  <div className="text-sm text-muted-foreground">Months Active</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className={cn("text-sm", getConsistencyColor(analysis.contributionAnalysis.contributionConsistency))}>
                    {analysis.contributionAnalysis.contributionConsistency}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Consistency</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    Contribution Trends
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trend:</span>
                      <Badge variant="outline" className={cn(
                        analysis.contributionAnalysis.contributionTrend === 'increasing' ? 'border-green-500 text-green-700' :
                        analysis.contributionAnalysis.contributionTrend === 'decreasing' ? 'border-red-500 text-red-700' :
                        analysis.contributionAnalysis.contributionTrend === 'volatile' ? 'border-orange-500 text-orange-700' :
                        'border-blue-500 text-blue-700'
                      )}>
                        {analysis.contributionAnalysis.contributionTrend}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Highest:</span>
                      <span className="font-medium">{formatCurrency(analysis.contributionAnalysis.highestContribution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lowest:</span>
                      <span className="font-medium">{formatCurrency(analysis.contributionAnalysis.lowestContribution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Variance:</span>
                      <span className="font-medium">{formatCurrency(analysis.contributionAnalysis.monthlyVariance)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Projection
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On Track:</span>
                      <Badge variant={analysis.contributionAnalysis.isOnTrack ? 'default' : 'destructive'}>
                        {analysis.contributionAnalysis.isOnTrack ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Date:</span>
                      <span className="font-medium">{analysis.contributionAnalysis.projectedCompletionDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Target Date:</span>
                      <span className="font-medium">{targetDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Amount:</span>
                      <span className="font-medium">{formatCurrency(analysis.contributionAnalysis.projectedCompletionAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span>Savings Scenarios</span>
              </CardTitle>
              <CardDescription>
                Different approaches to achieve your goal with varying timelines and lifestyle impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {analysis.scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-md",
                      scenario.bgColor,
                      scenario.borderColor
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-2xl font-bold", scenario.color)}>
                          {formatCurrency(scenario.monthlyContribution)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">Timeline</div>
                        <div className="text-lg font-bold">{scenario.timelineMonths} months</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Completion</div>
                        <div className="text-sm font-bold">{scenario.completionDate.toLocaleDateString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Feasibility</div>
                        <Badge className={cn("text-xs", getFeasibilityColor(scenario.feasibility))}>
                          {scenario.feasibility}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Lifestyle Impact</div>
                        <Badge className={cn("text-xs", getImpactColor(scenario.impactOnLifestyle))}>
                          {scenario.impactOnLifestyle}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Key Recommendations:</div>
                      <ul className="text-sm space-y-1">
                        {scenario.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0 text-primary" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Strategic Insights</span>
              </CardTitle>
              <CardDescription>
                AI-generated insights to optimize your goal achievement strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border",
                      insight.impact === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      insight.impact === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        insight.impact === 'positive' ? 'bg-green-100 dark:bg-green-900/50' :
                        insight.impact === 'negative' ? 'bg-red-100 dark:bg-red-900/50' :
                        'bg-blue-100 dark:bg-blue-900/50'
                      )}>
                        {insight.type === 'income' && <TrendingUp className="h-4 w-4" />}
                        {insight.type === 'timeline' && <Clock className="h-4 w-4" />}
                        {insight.type === 'optimization' && <Zap className="h-4 w-4" />}
                        {insight.type === 'risk' && <AlertTriangle className="h-4 w-4" />}
                        {insight.type === 'opportunity' && <Star className="h-4 w-4" />}
                        {insight.type === 'contribution' && <PiggyBank className="h-4 w-4" />}
                        {insight.type === 'consistency' && <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              insight.priority === 'high' ? 'border-red-500 text-red-700' :
                              insight.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-green-500 text-green-700'
                            )}
                          >
                            {insight.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.actionable && insight.action && (
                          <div className="text-sm font-medium text-primary">
                            💡 {insight.action}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment & Optimization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium">{analysis.riskAssessment}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>Optimization Strategies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.optimizationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
} 