import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glow' | 'minimal';
  showPercentage?: boolean;
  animated?: boolean;
  colors?: {
    from: string;
    to: string;
    trail?: string;
  };
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  size = 'md',
  variant = 'gradient',
  showPercentage = false,
  animated = true,
  colors = {
    from: 'from-primary',
    to: 'to-cyan-500',
    trail: 'bg-muted/30'
  }
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4'
  };

  const getProgressColorClass = () => {
    switch (variant) {
      case 'gradient':
        return `bg-gradient-to-r ${colors.from} ${colors.to}`;
      case 'glow':
        return `bg-gradient-to-r ${colors.from} ${colors.to} shadow-lg shadow-primary/50`;
      case 'minimal':
        return 'bg-primary';
      default:
        return `bg-gradient-to-r ${colors.from} ${colors.to}`;
    }
  };

  const getTrailClass = () => {
    return colors.trail || 'bg-muted/30';
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Progress track */}
      <div 
        className={cn(
          'relative overflow-hidden rounded-full',
          sizeClasses[size],
          getTrailClass(),
          variant === 'glow' && 'shadow-inner'
        )}
      >
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            getProgressColorClass(),
            animated && 'animate-pulse-subtle',
            variant === 'glow' && 'relative'
          )}
          style={{ 
            width: `${percentage}%`,
            transition: animated ? 'width 1000ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          {/* Shimmer effect for glow variant */}
          {variant === 'glow' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none opacity-20" />
      </div>

      {/* Percentage display */}
      {showPercentage && (
        <div className="flex justify-end mt-1">
          <span className="text-xs font-medium text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Milestone Progress Bar with markers
interface MilestoneProgressProps extends AnimatedProgressProps {
  milestones?: number[];
  milestoneIcons?: React.ReactNode[];
  completedMilestones?: number[];
}

export function MilestoneProgress({
  value,
  max = 100,
  milestones = [25, 50, 75, 100],
  milestoneIcons,
  completedMilestones = [],
  className,
  ...props
}: MilestoneProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('relative w-full', className)}>
      <AnimatedProgress value={value} max={max} {...props} />
      
      {/* Milestone markers */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-full pointer-events-none">
        {milestones.map((milestone, index) => {
          const isCompleted = completedMilestones.includes(milestone);
          const isCurrent = percentage >= milestone - 5 && percentage < milestone + 5;
          
          return (
            <div
              key={milestone}
              className="relative flex items-center justify-center"
              style={{ 
                left: `${milestone}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300',
                  isCompleted
                    ? 'bg-primary text-white border-primary shadow-lg scale-110 animate-bounce-subtle'
                    : isCurrent
                    ? 'bg-white border-primary text-primary animate-pulse scale-105'
                    : 'bg-background border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {milestoneIcons?.[index] || milestone}
              </div>
              
              {/* Milestone glow effect */}
              {(isCompleted || isCurrent) && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// XP-style progress bar
interface XPProgressProps extends Omit<AnimatedProgressProps, 'value'> {
  level?: number;
  currentXP?: number;
  nextLevelXP?: number;
  showLevel?: boolean;
}

export function XPProgress({
  level = 1,
  currentXP = 0,
  nextLevelXP = 100,
  showLevel = true,
  className,
  ...props
}: XPProgressProps) {
  
  return (
    <div className={cn('space-y-2', className)}>
      {showLevel && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Level {level}</span>
          <span className="text-muted-foreground">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
      )}
      
      <AnimatedProgress
        value={currentXP}
        max={nextLevelXP}
        variant="glow"
        colors={{
          from: 'from-yellow-400',
          to: 'to-orange-500',
          trail: 'bg-yellow-100/20'
        }}
        {...props}
      />
    </div>
  );
} 