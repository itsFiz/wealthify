import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage, calculateLifestyleMetrics } from '@/lib/calculations/index';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Target,
  Activity,
  Calendar,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import type { IncomeStream, Expense } from '@/types';

interface LifestyleAnalysisData {
  requiredIncome: number;
  currentIncome: number;
  emergencyRunwayMonths: number;
  burnRate: number;
  scenarios: {
    current: number;
    incomeDown20: number;
    incomeDown30: number;
    expensesUp15: number;
    expensesUp25: number;
  };
  affordability: 'excellent' | 'good' | 'tight' | 'stressed';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

interface LifestyleAnalysisCardProps {
  title: string;
  data: LifestyleAnalysisData;
  incomeStreams?: IncomeStream[];
  expenses?: Expense[];
}

export function LifestyleAnalysisCard({ 
  title, 
  data, 
  incomeStreams = [], 
  expenses = [] 
}: LifestyleAnalysisCardProps) {
  // Calculate enhanced metrics with frequency awareness
  const lifestyleMetrics = calculateLifestyleMetrics(incomeStreams, expenses);
  
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="h-4 w-4 text-green-500" />;
      case 'moderate': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical': return <Zap className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'border-green-500 bg-green-50';
      case 'moderate': return 'border-yellow-500 bg-yellow-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'critical': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAffordabilityColor = (affordability: string) => {
    switch (affordability) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'tight': return 'text-yellow-600';
      case 'stressed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`metric-card ${getRiskColor(lifestyleMetrics.sustainabilityRating)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getRiskIcon(lifestyleMetrics.sustainabilityRating)}
            <Badge 
              variant={lifestyleMetrics.sustainabilityRating === 'excellent' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {lifestyleMetrics.sustainabilityRating}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income vs Expenses Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Income & Expense Analysis</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recurring Income/Expenses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Recurring Monthly</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Income:</span>
                  <span className="font-semibold">{formatCurrency(lifestyleMetrics.recurringIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Expenses:</span>
                  <span className="font-semibold">{formatCurrency(lifestyleMetrics.recurringExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Burn Rate:</span>
                  <span className="font-bold">{formatPercentage(lifestyleMetrics.recurringBurnRate)}</span>
                </div>
              </div>
            </div>

            {/* One-time Income/Expenses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">One-time</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Income:</span>
                  <span className="font-semibold">{formatCurrency(lifestyleMetrics.oneTimeIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Expenses:</span>
                  <span className="font-semibold">{formatCurrency(lifestyleMetrics.oneTimeExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Net Impact:</span>
                  <span className={`font-bold ${lifestyleMetrics.oneTimeIncome - lifestyleMetrics.oneTimeExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(lifestyleMetrics.oneTimeIncome - lifestyleMetrics.oneTimeExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Risk Assessment</h4>
          
          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{lifestyleMetrics.riskScore}/100</div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{lifestyleMetrics.incomeSourceCount}</div>
              <div className="text-xs text-muted-foreground">Income Sources</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(lifestyleMetrics.oneTimeIncomeRatio * 100)}
              </div>
              <div className="text-xs text-muted-foreground">One-time Dependency</div>
            </div>
          </div>
        </div>

        {/* Emergency Fund Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Emergency Preparedness</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Emergency Fund Needed:</span>
              <span className="font-semibold">{formatCurrency(lifestyleMetrics.emergencyFundNeeded)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Based on Recurring Expenses:</span>
              <span className="text-muted-foreground">6 months × {formatCurrency(lifestyleMetrics.recurringExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Stress Test Scenarios</h4>
          
          <div className="space-y-2">
            {[
              { label: 'Current Situation', value: data.scenarios.current, icon: Activity },
              { label: 'Income Down 20%', value: data.scenarios.incomeDown20, icon: TrendingDown },
              { label: 'Income Down 30%', value: data.scenarios.incomeDown30, icon: TrendingDown },
              { label: 'Expenses Up 15%', value: data.scenarios.expensesUp15, icon: TrendingUp },
              { label: 'Expenses Up 25%', value: data.scenarios.expensesUp25, icon: TrendingUp },
            ].map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <div className="flex items-center space-x-2">
                  <scenario.icon className={`h-4 w-4 ${
                    scenario.value < 60 ? 'text-green-500' : 
                    scenario.value < 80 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <span className="text-sm">{scenario.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={Math.min(scenario.value, 100)} 
                    className="w-16 h-2"
                  />
                  <span className={`text-sm font-medium ${
                    scenario.value < 60 ? 'text-green-600' : 
                    scenario.value < 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(scenario.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Recommendations</h4>
          
          <div className="space-y-2">
            {[
              lifestyleMetrics.recurringBurnRate > 70 && 'Reduce recurring monthly expenses to improve financial stability',
              lifestyleMetrics.incomeSourceCount < 2 && 'Diversify income sources to reduce dependency risk',
              lifestyleMetrics.oneTimeIncomeRatio > 0.3 && 'Reduce reliance on one-time income for sustainability',
              lifestyleMetrics.riskScore > 60 && 'Focus on building emergency fund and reducing expenses',
              lifestyleMetrics.totalBurnRate < 50 && 'Great job! Consider increasing savings or investment allocation',
            ].filter(Boolean).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Lifestyle Sustainability:</span>
            <span className={`font-bold text-lg capitalize ${getAffordabilityColor(lifestyleMetrics.sustainabilityRating)}`}>
              {lifestyleMetrics.sustainabilityRating}
            </span>
          </div>
          <div className="mt-2">
            <Progress 
              value={Math.max(0, 100 - lifestyleMetrics.riskScore)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>High Risk</span>
              <span>Low Risk</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 