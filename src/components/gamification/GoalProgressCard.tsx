import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calculateGoalProgress, formatCurrency } from '@/lib/calculations';
import type { Goal } from '@/types';
import { 
  Target, 
  Calendar,
  TrendingUp,
  Trophy,
  Zap,
  Star,
  Plus
} from 'lucide-react';

interface GoalProgressCardProps {
  goal: Goal;
  onAddContribution?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function GoalProgressCard({
  goal,
  onAddContribution,
  onViewDetails,
  className,
}: GoalProgressCardProps) {
  const progress = calculateGoalProgress(goal);
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const timeRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate milestone levels (every 25%)
  const milestones = [25, 50, 75, 100];
  const currentMilestone = milestones.find(m => progress < m) || 100;
  const completedMilestones = milestones.filter(m => progress >= m);
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (progress >= 25) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getMilestoneIcon = (milestone: number) => {
    switch (milestone) {
      case 25: return <Zap className="h-3 w-3" />;
      case 50: return <Star className="h-3 w-3" />;
      case 75: return <TrendingUp className="h-3 w-3" />;
      case 100: return <Trophy className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'VEHICLE': return '🚗';
      case 'PROPERTY': return '🏠';
      case 'EMERGENCY_FUND': return '🆘';
      case 'DEBT_PAYOFF': return '💳';
      case 'INVESTMENT': return '📈';
      case 'VACATION': return '✈️';
      case 'BUSINESS': return '💼';
      default: return '🎯';
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2",
        progress >= 100 ? "border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50" :
        progress >= 75 ? "border-blue-500/50 bg-gradient-to-br from-blue-50 to-purple-50" :
        progress >= 50 ? "border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-orange-50" :
        "border-gray-300 hover:border-primary/50",
        className
      )}
    >
      {/* Gamification Effects */}
      {progress >= 100 && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse" />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryEmoji(goal.category)}</span>
            <div>
              <CardTitle className="text-lg font-bold">
                {goal.name}
              </CardTitle>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={progress >= 100 ? 'default' : 'secondary'}
              className={cn(
                "font-bold",
                progress >= 100 && "bg-green-500 text-white animate-pulse"
              )}
            >
              Level {Math.ceil(progress / 25) || 1}
            </Badge>
            {progress >= 100 && (
              <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar with XP styling */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-3 bg-gray-200 rounded-full overflow-hidden"
            />
            <div 
              className={cn(
                "absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ease-out",
                getProgressColor(progress)
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            
            {/* Milestone markers */}
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 flex items-center justify-center"
                style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all",
                    completedMilestones.includes(milestone)
                      ? "bg-primary text-white border-primary shadow-lg scale-110"
                      : milestone === currentMilestone
                      ? "bg-white border-primary text-primary animate-pulse"
                      : "bg-gray-200 border-gray-300 text-gray-500"
                  )}
                >
                  {getMilestoneIcon(milestone)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current Amount</p>
            <p className="font-bold text-green-600">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Target Amount</p>
            <p className="font-bold">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-bold text-orange-600">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Time Left</p>
            <p className={cn(
              "font-bold",
              timeRemaining < 30 ? "text-red-600" :
              timeRemaining < 90 ? "text-yellow-600" :
              "text-blue-600"
            )}>
              {timeRemaining > 0 ? `${timeRemaining} days` : 'Overdue'}
            </p>
          </div>
        </div>

        {/* Achievement Badges */}
        {completedMilestones.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {completedMilestones.map((milestone) => (
              <Badge
                key={milestone}
                variant="outline"
                className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800"
              >
                {getMilestoneIcon(milestone)}
                <span className="ml-1">{milestone}% Club</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {onAddContribution && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onAddContribution}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Contribution
            </Button>
          )}
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 