import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MilestoneProgress } from '@/components/ui/animated-progress';
import { GoalContributionsList } from '@/components/goals/GoalContributionsList';
import { cn } from '@/lib/utils';
import { calculateGoalProgress, formatCurrency } from '@/lib/calculations/index';
import type { Goal } from '@/types';
import { GOAL_CATEGORY_CONFIGS } from '@/types';
import { 
  Target, 
  Calendar,
  TrendingUp,
  Trophy,
  Zap,
  Star,
  Plus,
  Edit,
  Car,
  Home,
  Shield,
  CreditCard,
  TrendingUp as Investment,
  Plane,
  Briefcase,
  Archive,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';

interface GoalDetailsViewProps {
  goal: Goal;
  onAddContribution?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  onDeleteContribution?: (contributionId: string) => Promise<void>;
  isDeletingContribution?: string;
  className?: string;
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  Shield,
  CreditCard,
  Home,
  Car,
  TrendingUp,
  Investment,
  Plane,
  Briefcase,
  Archive,
};

export function GoalDetailsView({
  goal,
  onAddContribution,
  onEdit,
  onClose,
  onDeleteContribution,
  isDeletingContribution,
  className,
}: GoalDetailsViewProps) {
  const progress = calculateGoalProgress(goal);
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  // Ensure targetDate is a Date object
  const targetDate = new Date(goal.targetDate);
  const timeRemaining = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Get category configuration
  const categoryConfig = GOAL_CATEGORY_CONFIGS[goal.category];
  
  // Calculate milestone levels (every 25%)
  const milestones = [25, 50, 75, 100];
  const completedMilestones = milestones.filter(m => progress >= m);
  


  const getMilestoneIcon = (milestone: number) => {
    switch (milestone) {
      case 25: return <Zap className="h-3 w-3" />;
      case 50: return <Star className="h-3 w-3" />;
      case 75: return <TrendingUp className="h-3 w-3" />;
      case 100: return <Trophy className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  // Sort contributions by date (most recent first)
  const sortedContributions = goal.contributions?.sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  ) || [];

  return (
    <div className={cn("w-full max-w-4xl mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={cn("p-3 rounded-xl bg-muted/30", categoryConfig.color)}>
              {React.createElement(
                iconMap[categoryConfig.icon as keyof typeof iconMap] || Target,
                { className: cn('h-8 w-8', categoryConfig.color) }
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {goal.name}
              </h1>
              {goal.description && (
                <p className="text-muted-foreground mb-3">
                  {goal.description}
                </p>
              )}
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={progress >= 100 ? 'default' : 'secondary'}
                  className={cn(
                    "font-bold",
                    progress >= 100 && "bg-green-500 text-white animate-pulse"
                  )}
                >
                  {categoryConfig.label}
                </Badge>
                <Badge 
                  variant={progress >= 100 ? 'default' : 'secondary'}
                  className={cn(
                    "font-bold",
                    progress >= 100 && "bg-green-500 text-white animate-pulse"
                  )}
                >
                  Level {Math.ceil(progress / 25) || 1}
                </Badge>
                {goal.isCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </Button>
            )}
            {onAddContribution && !goal.isCompleted && (
              <Button onClick={onAddContribution} className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Contribution
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Progress Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Progress Overview</span>
          </h2>
          
          {/* Goal Image */}
          {goal.imageUrl && (
            <div className="relative rounded-xl overflow-hidden max-h-64">
              <Image 
                src={goal.imageUrl} 
                alt={goal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-lg font-bold">{progress.toFixed(1)}% Complete</div>
                <div className="text-sm opacity-90">
                  {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                </div>
              </div>
            </div>
          )}
          
          {/* Animated Progress */}
          <div className="space-y-4">
            <MilestoneProgress
              value={progress}
              className="h-6"
              completedMilestones={completedMilestones}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={cn("text-2xl font-bold", progress >= 100 ? "text-green-600" : "text-blue-600")}>
                  {formatCurrency(goal.currentAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Current Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(goal.targetAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Target Amount</div>
              </div>
              <div className="text-center">
                <div className={cn("text-2xl font-bold", progress >= 75 ? "text-green-600" : progress >= 50 ? "text-yellow-600" : "text-orange-600")}>
                  {formatCurrency(remainingAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  timeRemaining < 30 ? "text-red-600" :
                  timeRemaining < 90 ? "text-yellow-600" :
                  "text-blue-600"
                )}>
                  {timeRemaining > 0 ? `${timeRemaining} days` : 'Overdue'}
                </div>
                <div className="text-sm text-muted-foreground">Time Left</div>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          {completedMilestones.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">🏆 Achievements Unlocked</h3>
              <div className="flex flex-wrap gap-2">
                {completedMilestones.map((milestone) => (
                  <Badge
                    key={milestone}
                    variant="outline"
                    className={cn(
                      "bg-gradient-to-r border",
                      milestone === 100 ? "from-green-100 to-green-200 border-green-400 text-green-800" :
                      milestone === 75 ? "from-blue-100 to-blue-200 border-blue-400 text-blue-800" :
                      milestone === 50 ? "from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800" :
                      "from-orange-100 to-orange-200 border-orange-400 text-orange-800"
                    )}
                  >
                    {getMilestoneIcon(milestone)}
                    <span className="ml-1">{milestone}% Club</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Goal Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Goal Details</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">Timeline</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Date:</span>
                  <span>{targetDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{Math.ceil((targetDate.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Priority & Status</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Priority:</span>
                  <Badge variant="outline" className={cn(
                    goal.priority <= 3 ? 'border-red-500 text-red-700' :
                    goal.priority <= 6 ? 'border-yellow-500 text-yellow-700' :
                    'border-green-500 text-green-700'
                  )}>
                    {goal.priority}/10 - {
                      goal.priority <= 3 ? 'High' :
                      goal.priority <= 6 ? 'Medium' :
                      'Low'
                    }
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={goal.isCompleted ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                    {goal.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className={cn("font-semibold", progress >= 100 ? "text-green-600" : progress >= 75 ? "text-blue-600" : progress >= 50 ? "text-yellow-600" : "text-orange-600")}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Contribution History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Contribution History</span>
            </h2>
            {sortedContributions.length > 0 && (
              <Badge variant="outline">
                {sortedContributions.length} Contributions
              </Badge>
            )}
          </div>
          
          <GoalContributionsList
            contributions={sortedContributions}
            goalName={goal.name}
            onDeleteContribution={onDeleteContribution || (async () => {})}
            isDeleting={isDeletingContribution}
          />
        </div>
      </div>
    </div>
  );
} 