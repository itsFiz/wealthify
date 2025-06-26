import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/calculations/index';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3
} from 'lucide-react';

interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  type: 'currency' | 'percentage' | 'number';
  target?: number;
  status?: 'improved' | 'declined' | 'stable';
}

interface ComparisonTableProps {
  title: string;
  data: ComparisonData[];
  currentPeriod: string;
  previousPeriod: string;
  className?: string;
}

export function ComparisonTable({ 
  title, 
  data, 
  currentPeriod, 
  previousPeriod, 
  className = '' 
}: ComparisonTableProps) {
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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percent: 0 };
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { value: change, percent };
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'improved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Improved</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Declined</Badge>;
      case 'stable':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">Stable</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={`metric-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Metric</th>
                <th className="text-right py-3 font-medium">{currentPeriod}</th>
                <th className="text-right py-3 font-medium">{previousPeriod}</th>
                <th className="text-right py-3 font-medium">Change</th>
                <th className="text-right py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const change = calculateChange(item.current, item.previous);
                return (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-muted/20">
                    <td className="py-4 font-medium">{item.metric}</td>
                    <td className="py-4 text-right font-mono">
                      {formatValue(item.current, item.type)}
                    </td>
                    <td className="py-4 text-right font-mono text-muted-foreground">
                      {formatValue(item.previous, item.type)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {getChangeIcon(change.value)}
                        <div className="text-right">
                          <div className={`font-mono text-sm ${
                            change.value > 0 ? 'text-green-600' : 
                            change.value < 0 ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                            {change.value > 0 ? '+' : ''}{formatValue(change.value, item.type)}
                          </div>
                          <div className={`text-xs ${
                            change.percent > 0 ? 'text-green-600' : 
                            change.percent < 0 ? 'text-red-600' : 'text-muted-foreground'
                          }`}>
                            {change.percent > 0 ? '+' : ''}{change.percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(item => calculateChange(item.current, item.previous).value > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Improved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.filter(item => calculateChange(item.current, item.previous).value < 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Declined</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {data.filter(item => calculateChange(item.current, item.previous).value === 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Unchanged</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 