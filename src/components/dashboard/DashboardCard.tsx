import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  subtitle,
  trend,
  badge,
  icon,
  className 
}: DashboardCardProps) {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className={cn('metric-card relative overflow-hidden', className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {badge && (
            <Badge 
              variant={badge.variant}
              className="text-xs px-2 py-1 bg-primary/20 text-primary border-primary/30"
            >
              {badge.text}
            </Badge>
          )}
          {icon && (
            <div className="text-muted-foreground opacity-60">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-3xl font-bold stat-number">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          {trend && (
            <div className={cn(
              'flex items-center space-x-1 text-sm',
              getTrendColor(trend.type)
            )}>
              <span className="text-lg">
                {getTrendIcon(trend.type)}
              </span>
              <span className="font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs opacity-70">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
} 