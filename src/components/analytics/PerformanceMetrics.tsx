import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage } from '@/lib/calculations/index';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  
  Activity
} from 'lucide-react';

interface PerformanceData {
  label: string;
  value: number;
  target?: number;
  previous?: number;
  trend?: 'up' | 'down' | 'stable';
  type: 'currency' | 'percentage' | 'number';
  status?: 'excellent' | 'good' | 'warning' | 'danger';
  description?: string;
}

interface PerformanceMetricsProps {
  title: string;
  metrics: PerformanceData[];
  className?: string;
}

export function PerformanceMetrics({ title, metrics, className = '' }: PerformanceMetricsProps) {
  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toLocaleString();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'good':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'danger':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-muted-foreground bg-muted/30';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`metric-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{metric.label}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metric.status)}
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {metric.status || 'neutral'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.type)}
                  </div>
                  {metric.previous && (
                    <div className="text-sm text-muted-foreground">
                      vs {formatValue(metric.previous, metric.type)}
                    </div>
                  )}
                </div>

                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Target: {formatValue(metric.target, metric.type)}</span>
                      <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((metric.value / metric.target) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                )}

                {metric.description && (
                  <div className="text-sm text-muted-foreground">
                    {metric.description}
                  </div>
                )}
              </div>

              {metric.previous && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Change:</span>
                  <span className={
                    metric.value > metric.previous ? 'text-green-600' : 
                    metric.value < metric.previous ? 'text-red-600' : 'text-muted-foreground'
                  }>
                    {metric.value > metric.previous ? '+' : ''}
                    {formatValue(metric.value - metric.previous, metric.type)}
                    {' '}
                    ({((metric.value - metric.previous) / metric.previous * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 