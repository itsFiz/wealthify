import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/calculations/index';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Target,
  DollarSign,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

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

interface InsightsPanelProps {
  insights: Insight[];
  onActionClick?: (insight: Insight) => void;
  className?: string;
}

export function InsightsPanel({ insights, onActionClick, className = '' }: InsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income':
        return <DollarSign className="h-4 w-4" />;
      case 'expenses':
        return <TrendingUp className="h-4 w-4" />;
      case 'goals':
        return <Target className="h-4 w-4" />;
      case 'savings':
        return <Shield className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'achievement':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
      case 'tip':
        return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10';
      default:
        return 'border-l-muted bg-muted/20';
    }
  };

  const prioritySort = (a: Insight, b: Insight) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const typeOrder = { warning: 4, opportunity: 3, achievement: 2, tip: 1 };
    
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
    if (impactDiff !== 0) return impactDiff;
    
    return typeOrder[b.type] - typeOrder[a.type];
  };

  const sortedInsights = [...insights].sort(prioritySort);

  const generateInsightSummary = () => {
    const opportunities = insights.filter(i => i.type === 'opportunity').length;
    const warnings = insights.filter(i => i.type === 'warning').length;
    const totalPotentialSaving = insights
      .filter(i => i.potentialSaving)
      .reduce((sum, i) => sum + (i.potentialSaving || 0), 0);
    
    return { opportunities, warnings, totalPotentialSaving };
  };

  const summary = generateInsightSummary();

  return (
    <Card className={`metric-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Financial Insights</span>
        </CardTitle>
        
        {/* Summary Bar */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{summary.opportunities} opportunities</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>{summary.warnings} warnings</span>
          </div>
          {summary.totalPotentialSaving > 0 && (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span>Save up to {formatCurrency(summary.totalPotentialSaving)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights available at the moment.</p>
              <p className="text-sm">Keep tracking your finances to get personalized recommendations!</p>
            </div>
          ) : (
            sortedInsights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getCategoryIcon(insight.category)}
                            <span className="capitalize">{insight.category}</span>
                          </div>
                          {getImpactBadge(insight.impact)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      
                      {insight.recommendation && (
                        <div className="p-3 bg-background/50 rounded border text-sm">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {insight.potentialSaving && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>Save {formatCurrency(insight.potentialSaving)}</span>
                            </div>
                          )}
                          {insight.timeline && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{insight.timeline}</span>
                            </div>
                          )}
                        </div>
                        
                        {insight.actionable && onActionClick && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onActionClick(insight)}
                            className="text-xs"
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Action Summary */}
        {insights.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground text-center">
              💡 Tip: Focus on high-impact opportunities first for maximum benefit
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 