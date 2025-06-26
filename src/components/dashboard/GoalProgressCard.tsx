import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GoalProgressCardProps {
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  priority: number;
  className?: string;
}

export function GoalProgressCard({
  name,
  category,
  currentAmount,
  targetAmount,
  targetDate,
  priority,
  className
}: GoalProgressCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  
  // Calculate level based on progress milestones
  const getLevel = (progress: number) => {
    if (progress >= 100) return 5;
    if (progress >= 75) return 4;
    if (progress >= 50) return 3;
    if (progress >= 25) return 2;
    return 1;
  };

  const getNextMilestone = (progress: number) => {
    if (progress >= 100) return 100;
    if (progress >= 75) return 100;
    if (progress >= 50) return 75;
    if (progress >= 25) return 50;
    return 25;
  };

  const getMilestoneReward = (milestone: number) => {
    const rewards = {
      25: '🥉 Bronze Achievement',
      50: '🥈 Silver Milestone', 
      75: '🥇 Gold Progress',
      100: '🏆 Goal Completed!'
    };
    return rewards[milestone as keyof typeof rewards];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      'VEHICLE': '🚗',
      'EMERGENCY_FUND': '🆘', 
      'PROPERTY': '🏠',
      'INVESTMENT': '📈',
      'VACATION': '✈️',
      'BUSINESS': '💼',
      'OTHER': '🎯'
    };
    return emojis[category as keyof typeof emojis] || '🎯';
  };

  const level = getLevel(progress);
  const nextMilestone = getNextMilestone(progress);

  return (
    <Card className={cn('goal-card relative overflow-hidden group', className)}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-primary/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getCategoryEmoji(category)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Target: {targetDate}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={priority <= 2 ? 'default' : 'secondary'}
              className="achievement-glow text-xs font-medium bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 border-yellow-400/30"
            >
              Level {level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Progress Bar with Glow Effect */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-primary">
              {progress.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-3 progress-glow bg-muted/30" 
            />
            {/* Milestone markers */}
            <div className="absolute inset-0 flex justify-between items-center px-1">
              {[25, 50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={cn(
                    'w-1 h-5 rounded-full transition-colors',
                    progress >= milestone 
                      ? 'bg-primary shadow-lg shadow-primary/50' 
                      : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Amount Progress */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold stat-number">
              {formatCurrency(currentAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatCurrency(targetAmount)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(targetAmount - currentAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              remaining
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {progress < 100 && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-primary">
                  Next Milestone: {nextMilestone}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {getMilestoneReward(nextMilestone)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary">
                  {formatCurrency((nextMilestone / 100) * targetAmount - currentAmount)}
                </div>
                <div className="text-xs text-muted-foreground">to go</div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {progress >= 100 && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-lg font-bold text-green-400 mb-1">
                Goal Completed!
              </div>
              <div className="text-sm text-green-300">
                Congratulations on reaching your target!
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 