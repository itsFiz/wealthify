import type { Goal, IncomeStream, Expense, GoalCalculation, AffordabilityResult } from '@/types';

/**
 * Calculate monthly savings required to reach a goal
 */
export function calculateMonthlySavings(
  targetAmount: number,
  currentAmount: number,
  monthsRemaining: number
): number {
  if (monthsRemaining <= 0) return 0;
  return Math.max(0, (targetAmount - currentAmount) / monthsRemaining);
}

/**
 * Calculate timeline to reach a goal with current monthly savings
 */
export function calculateGoalTimeline(
  targetAmount: number,
  currentAmount: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return Infinity;
  return Math.ceil(Math.max(0, (targetAmount - currentAmount) / monthlySavings));
}

/**
 * Calculate burn rate (expenses as percentage of income)
 */
export function calculateBurnRate(
  totalExpenses: number,
  totalIncome: number
): number {
  if (totalIncome <= 0) return 100;
  return Math.min(100, (totalExpenses / totalIncome) * 100);
}

/**
 * Calculate financial health score (0-100)
 * Based on burn rate, savings rate, and goal progress
 */
export function calculateHealthScore(
  burnRate: number,
  savingsRate: number,
  goalProgressAverage: number = 50
): number {
  // Burn rate score (40 points max)
  const burnScore = burnRate < 50 ? 40 : burnRate < 70 ? 30 : burnRate < 85 ? 15 : 5;
  
  // Savings rate score (40 points max)
  const savingsScore = savingsRate > 30 ? 40 : savingsRate > 20 ? 35 : savingsRate > 10 ? 25 : 10;
  
  // Goal progress score (20 points max)
  const goalScore = Math.min(20, (goalProgressAverage / 100) * 20);
  
  return Math.round(burnScore + savingsScore + goalScore);
}

/**
 * Calculate required income increase to meet goal savings target
 */
export function calculateIncomeIncrease(
  currentIncome: number,
  currentExpenses: number,
  goalMonthlySavings: number
): number {
  const currentSavings = Math.max(0, currentIncome - currentExpenses);
  const additionalSavingsNeeded = Math.max(0, goalMonthlySavings - currentSavings);
  return additionalSavingsNeeded;
}

/**
 * Calculate savings rate as percentage of income
 */
export function calculateSavingsRate(
  totalIncome: number,
  totalExpenses: number
): number {
  if (totalIncome <= 0) return 0;
  const savings = Math.max(0, totalIncome - totalExpenses);
  return (savings / totalIncome) * 100;
}

/**
 * Calculate monthly expense total from expense array
 */
export function calculateMonthlyExpenses(expenses: Expense[]): number {
  return expenses
    .filter(expense => expense.isActive)
    .reduce((total, expense) => {
      switch (expense.frequency) {
        case 'MONTHLY':
          return total + expense.amount;
        case 'WEEKLY':
          return total + (expense.amount * 4.33); // Average weeks per month
        case 'YEARLY':
          return total + (expense.amount / 12);
        case 'ONE_TIME':
          return total; // Don't include one-time expenses in monthly calculations
        default:
          return total + expense.amount; // Default to monthly
      }
    }, 0);
}

/**
 * Calculate monthly income total from income streams
 */
export function calculateMonthlyIncome(incomeStreams: IncomeStream[]): number {
  return incomeStreams
    .filter(stream => stream.isActive)
    .reduce((total, stream) => {
      return total + (stream.actualMonthly || stream.expectedMonthly);
    }, 0);
}

/**
 * Comprehensive goal analysis
 */
export function analyzeGoal(
  goal: Goal,
  monthlyIncome: number,
  monthlyExpenses: number
): GoalCalculation {
  const monthsRemaining = Math.max(0, 
    Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
  );
  
  const requiredMonthlySavings = calculateMonthlySavings(
    goal.targetAmount,
    goal.currentAmount,
    monthsRemaining
  );
  
  const currentMonthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const incomeGap = calculateIncomeIncrease(monthlyIncome, monthlyExpenses, requiredMonthlySavings);
  
  return {
    monthsRemaining,
    requiredMonthlySavings,
    currentMonthlySavings,
    incomeGap,
    isAchievable: incomeGap <= (monthlyIncome * 0.3) // Achievable if gap is <30% of current income
  };
}

/**
 * Affordability analysis for any target amount
 */
export function analyzeAffordability(
  targetAmount: number,
  currentAmount: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  targetTimelineMonths?: number
): AffordabilityResult {
  const currentMonthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  
  // If no timeline specified, calculate based on current savings rate
  const timelineMonths = targetTimelineMonths || 
    calculateGoalTimeline(targetAmount, currentAmount, currentMonthlySavings);
  
  const requiredMonthlySavings = calculateMonthlySavings(
    targetAmount,
    currentAmount,
    timelineMonths
  );
  
  const incomeIncrease = calculateIncomeIncrease(
    monthlyIncome,
    monthlyExpenses,
    requiredMonthlySavings
  );
  
  const requiredIncome = monthlyIncome + incomeIncrease;
  
  return {
    timelineMonths: isFinite(timelineMonths) ? timelineMonths : 0,
    requiredIncome,
    currentIncome: monthlyIncome,
    incomeIncrease,
    feasible: incomeIncrease <= (monthlyIncome * 0.5) // Feasible if requires <50% income increase
  };
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
}

/**
 * Get color coding for burn rate
 */
export function getBurnRateColor(burnRate: number): string {
  if (burnRate < 60) return 'text-green-600';
  if (burnRate < 80) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get color coding for health score
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency === 'MYR' ? 'MYR' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate net worth from assets and debts
 */
export function calculateNetWorth(
  totalAssets: number,
  totalDebts: number
): number {
  return totalAssets - totalDebts;
}

/**
 * Predict goal completion date based on current savings rate
 */
export function predictGoalCompletion(
  goal: Goal,
  monthlyContribution: number
): Date {
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  if (monthlyContribution <= 0 || remainingAmount <= 0) {
    return goal.targetDate;
  }
  
  const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
  
  return completionDate;
}

/**
 * Calculate monthly allocation recommendations for multiple goals
 */
export function calculateGoalAllocations(
  goals: Goal[],
  availableMonthlySavings: number
): Array<{ goalId: string; recommendedAllocation: number; percentage: number }> {
  if (availableMonthlySavings <= 0 || goals.length === 0) {
    return goals.map(goal => ({
      goalId: goal.id,
      recommendedAllocation: 0,
      percentage: 0
    }));
  }

  // Sort goals by priority (higher priority = lower number)
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);
  
  const allocations = sortedGoals.map(goal => {
    const analysis = analyzeGoal(goal, availableMonthlySavings + 1000, 1000); // Mock values for calculation
    const urgency = goal.targetDate.getTime() - new Date().getTime();
    const priorityWeight = 1 / goal.priority;
    const urgencyWeight = urgency < 0 ? 2 : 1 / (urgency / (1000 * 60 * 60 * 24 * 365)); // Years to target
    
    return {
      goalId: goal.id,
      weight: priorityWeight * urgencyWeight,
      requiredMonthlySavings: analysis.requiredMonthlySavings
    };
  });

  const totalWeight = allocations.reduce((sum, alloc) => sum + alloc.weight, 0);
  
  return allocations.map(alloc => {
    const percentage = (alloc.weight / totalWeight) * 100;
    const recommendedAllocation = (alloc.weight / totalWeight) * availableMonthlySavings;
    
    return {
      goalId: alloc.goalId,
      recommendedAllocation: Math.round(recommendedAllocation),
      percentage: Math.round(percentage)
    };
  });
} 