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
  // Handle edge cases for empty data
  if (totalIncome <= 0) {
    return totalExpenses > 0 ? 100 : 0; // 100% if expenses exist, 0% if both zero
  }
  return Math.min(100, (totalExpenses / totalIncome) * 100);
}

/**
 * Calculate financial health score (0-100)
 * Based on burn rate, savings rate, and goal progress
 */
export function calculateHealthScore(
  burnRate: number,
  savingsRate: number,
  goalProgressAverage: number = 0 // Default to 0 for new users
): number {
  // Ensure no NaN values
  const safeBurnRate = isNaN(burnRate) ? 0 : burnRate;
  const safeSavingsRate = isNaN(savingsRate) ? 0 : savingsRate;
  const safeGoalProgress = isNaN(goalProgressAverage) ? 0 : goalProgressAverage;
  
  // Burn rate score (40 points max) - lower is better
  let burnScore = 40;
  if (safeBurnRate > 85) burnScore = 5;
  else if (safeBurnRate > 70) burnScore = 15;
  else if (safeBurnRate > 50) burnScore = 30;
  
  // Savings rate score (40 points max) - higher is better  
  let savingsScore = 10;
  if (safeSavingsRate > 30) savingsScore = 40;
  else if (safeSavingsRate > 20) savingsScore = 35;
  else if (safeSavingsRate > 10) savingsScore = 25;
  
  // Goal progress score (20 points max)
  const goalScore = Math.min(20, (safeGoalProgress / 100) * 20);
  
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
  if (totalIncome <= 0) return 0; // No income = 0% savings rate
  const savings = Math.max(0, totalIncome - totalExpenses);
  return (savings / totalIncome) * 100;
}

/**
 * Calculate monthly expense total from expense array
 */
export function calculateMonthlyExpenses(expenses: Expense[]): number {
  return expenses
    .filter(expense => expense.isActive !== false) // Include active expenses (default to true if undefined)
    .reduce((total, expense) => {
      const amount = Number(expense.amount) || 0;
      switch (expense.frequency) {
        case 'MONTHLY':
          return total + amount;
        case 'WEEKLY':
          return total + (amount * 4.33); // Average weeks per month
        case 'YEARLY':
          return total + (amount / 12);
        case 'ONE_TIME':
          return total; // Don't include one-time expenses in monthly calculations
        default:
          return total + amount; // Default to monthly
      }
    }, 0);
}

/**
 * Calculate monthly income total from income streams
 */
export function calculateMonthlyIncome(incomeStreams: IncomeStream[]): number {
  return incomeStreams
    .filter(stream => stream.isActive !== false) // Include active streams (default to true if undefined)
    .reduce((total, stream) => {
      const amount = Number(stream.actualMonthly || stream.expectedMonthly) || 0;
      const frequency = stream.frequency || 'MONTHLY';
      return total + convertToMonthlyAmount(amount, frequency);
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
  // Ensure targetDate is a Date object before calling getTime()
  const targetDate = new Date(goal.targetDate);
  const monthsRemaining = Math.max(0, 
    Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
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
export function formatCurrency(
  amount: number, 
  currency: string = 'MYR',
  options?: { showZero?: boolean; placeholder?: string }
): string {
  // Handle NaN, null, undefined
  if (isNaN(amount) || amount === null || amount === undefined) {
    return options?.placeholder || 'RM 0';
  }
  
  // Handle zero values
  if (amount === 0 && !options?.showZero) {
    return options?.placeholder || 'RM 0';
  }
  
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
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
    return new Date(goal.targetDate); // Ensure it's a Date object
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
    // Ensure targetDate is a Date object before calling getTime()
    const targetDate = new Date(goal.targetDate);
    const urgency = targetDate.getTime() - new Date().getTime();
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

/**
 * Calculate required income for maintaining current lifestyle
 */
export function calculateRequiredIncome(
  currentExpenses: number,
  targetSavingsRate: number = 0.2 // 20% default savings rate
): number {
  return currentExpenses / (1 - targetSavingsRate);
}

/**
 * Calculate emergency fund runway in months
 */
export function calculateEmergencyRunway(
  currentSavings: number,
  monthlyExpenses: number
): number {
  if (monthlyExpenses <= 0) return currentSavings > 0 ? Infinity : 0;
  if (currentSavings <= 0) return 0;
  return currentSavings / monthlyExpenses;
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncomeRatio(
  totalMonthlyDebt: number,
  totalMonthlyIncome: number
): number {
  if (totalMonthlyIncome <= 0) return 0;
  return Math.min(100, (totalMonthlyDebt / totalMonthlyIncome) * 100);
}

/**
 * Calculate projected burn rate under different scenarios
 */
export function calculateBurnRateScenarios(
  currentIncome: number,
  currentExpenses: number
): {
  current: number;
  incomeDown20: number;
  incomeDown30: number;
  expensesUp15: number;
  expensesUp25: number;
} {
  const current = calculateBurnRate(currentExpenses, currentIncome);
  
  return {
    current,
    incomeDown20: calculateBurnRate(currentExpenses, currentIncome * 0.8),
    incomeDown30: calculateBurnRate(currentExpenses, currentIncome * 0.7),
    expensesUp15: calculateBurnRate(currentExpenses * 1.15, currentIncome),
    expensesUp25: calculateBurnRate(currentExpenses * 1.25, currentIncome),
  };
}

/**
 * Calculate income needed for specific emergency fund target
 */
export function calculateIncomeForEmergencyFund(
  monthlyExpenses: number,
  targetMonths: number = 6,
  currentSavings: number = 0,
  timeHorizonMonths: number = 12
): number {
  const targetEmergencyFund = monthlyExpenses * targetMonths;
  const additionalSavingsNeeded = Math.max(0, targetEmergencyFund - currentSavings);
  const monthlySavingsRequired = additionalSavingsNeeded / timeHorizonMonths;
  
  // Assuming 20% savings rate, calculate required income
  return (monthlyExpenses + monthlySavingsRequired) / 0.8;
}

/**
 * Analyze lifestyle affordability based on income and goals
 */
export function analyzeLifestyleAffordability(
  monthlyIncome: number,
  monthlyExpenses: number,
  goals: { targetAmount: number; monthsToTarget: number }[]
): {
  currentAffordability: 'excellent' | 'good' | 'tight' | 'stressed';
  monthlyGoalAllocation: number;
  remainingAfterGoals: number;
  recommendedIncomeIncrease: number;
} {
  const currentSavings = monthlyIncome - monthlyExpenses;
  const totalMonthlyGoalSavings = goals.reduce((sum, goal) => 
    sum + (goal.targetAmount / goal.monthsToTarget), 0
  );
  
  const remainingAfterGoals = currentSavings - totalMonthlyGoalSavings;
  
  let currentAffordability: 'excellent' | 'good' | 'tight' | 'stressed';
  if (remainingAfterGoals > monthlyIncome * 0.1) currentAffordability = 'excellent';
  else if (remainingAfterGoals > 0) currentAffordability = 'good';
  else if (remainingAfterGoals > -monthlyIncome * 0.05) currentAffordability = 'tight';
  else currentAffordability = 'stressed';
  
  const recommendedIncomeIncrease = remainingAfterGoals < 0 ? 
    Math.abs(remainingAfterGoals) + (monthlyIncome * 0.1) : 0;
  
  return {
    currentAffordability,
    monthlyGoalAllocation: totalMonthlyGoalSavings,
    remainingAfterGoals,
    recommendedIncomeIncrease,
  };
}

/**
 * Calculate financial health score with lifestyle factors
 */
export function calculateEnhancedHealthScore(
  burnRate: number,
  savingsRate: number,
  debtToIncomeRatio: number = 0,
  emergencyFundMonths: number = 0,
  goalProgressAverage: number = 50
): number {
  // Burn rate score (25 points max)
  let burnScore = 0;
  if (burnRate < 30) burnScore = 25;
  else if (burnRate < 50) burnScore = 20;
  else if (burnRate < 70) burnScore = 15;
  else if (burnRate < 85) burnScore = 10;
  else burnScore = 5;
  
  // Savings rate score (25 points max)
  let savingsScore = 0;
  if (savingsRate > 30) savingsScore = 25;
  else if (savingsRate > 20) savingsScore = 20;
  else if (savingsRate > 10) savingsScore = 15;
  else if (savingsRate > 5) savingsScore = 10;
  else savingsScore = 5;
  
  // Debt ratio score (20 points max)
  let debtScore = 0;
  if (debtToIncomeRatio < 10) debtScore = 20;
  else if (debtToIncomeRatio < 20) debtScore = 15;
  else if (debtToIncomeRatio < 30) debtScore = 10;
  else if (debtToIncomeRatio < 40) debtScore = 5;
  else debtScore = 0;
  
  // Emergency fund score (20 points max)
  let emergencyScore = 0;
  if (emergencyFundMonths >= 6) emergencyScore = 20;
  else if (emergencyFundMonths >= 3) emergencyScore = 15;
  else if (emergencyFundMonths >= 1) emergencyScore = 10;
  else emergencyScore = 0;
  
  // Goal progress score (10 points max)
  const goalScore = Math.min(10, (goalProgressAverage / 100) * 10);
  
  return Math.round(burnScore + savingsScore + debtScore + emergencyScore + goalScore);
}

/**
 * Get risk assessment for current financial situation
 */
export function assessFinancialRisk(
  burnRate: number,
  emergencyFundMonths: number,
  debtToIncomeRatio: number,
  incomeStreams: number
): {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  // Assess burn rate risk
  if (burnRate > 80) {
    riskFactors.push('Very high burn rate');
    recommendations.push('Reduce expenses immediately');
  } else if (burnRate > 60) {
    riskFactors.push('High burn rate');
    recommendations.push('Review and optimize expenses');
  }
  
  // Assess emergency fund risk
  if (emergencyFundMonths < 1) {
    riskFactors.push('No emergency fund');
    recommendations.push('Build emergency fund urgently');
  } else if (emergencyFundMonths < 3) {
    riskFactors.push('Insufficient emergency fund');
    recommendations.push('Increase emergency fund to 3-6 months');
  }
  
  // Assess debt risk
  if (debtToIncomeRatio > 40) {
    riskFactors.push('High debt burden');
    recommendations.push('Focus on debt reduction');
  } else if (debtToIncomeRatio > 25) {
    riskFactors.push('Moderate debt burden');
    recommendations.push('Consider debt consolidation');
  }
  
  // Assess income diversification risk
  if (incomeStreams < 2) {
    riskFactors.push('Single income source');
    recommendations.push('Diversify income streams');
  }
  
  // Determine overall risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  if (riskFactors.length === 0) riskLevel = 'low';
  else if (riskFactors.length <= 1) riskLevel = 'moderate';
  else if (riskFactors.length <= 2) riskLevel = 'high';
  else riskLevel = 'critical';
  
  return {
    riskLevel,
    riskFactors,
    recommendations,
  };
}

/**
 * Safe percentage formatting
 */
export function formatPercentage(
  value: number,
  options?: { decimals?: number; placeholder?: string }
): string {
  if (isNaN(value) || value === null || value === undefined) {
    return options?.placeholder || '0%';
  }
  
  const decimals = options?.decimals ?? 1;
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate month-over-month change percentage
 */
export function calculateMonthlyChange(
  currentValue: number,
  previousValue: number
): { value: number; type: 'positive' | 'negative' | 'neutral' } {
  if (isNaN(currentValue) || isNaN(previousValue) || previousValue === 0) {
    return { value: 0, type: 'neutral' };
  }
  
  const change = ((currentValue - previousValue) / previousValue) * 100;
  
  return {
    value: Math.abs(change),
    type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
  };
}

// Helper function to convert any frequency to monthly amount
export function convertToMonthlyAmount(amount: number, frequency: string): number {
  if (isNaN(amount) || amount <= 0) return 0;
  
  switch (frequency) {
    case 'WEEKLY':
      return amount * 4.33; // Average weeks per month
    case 'YEARLY':
      return amount / 12;
    case 'ONE_TIME':
      return 0; // One-time amounts should not affect monthly calculations
    case 'MONTHLY':
    default:
      return amount;
  }
}

// Enhanced lifestyle analysis with frequency consideration
export function calculateLifestyleMetrics(
  incomeStreams: any[],
  expenses: any[]
) {
  // Calculate total monthly income from all streams
  const totalMonthlyIncome = incomeStreams.reduce((total, stream) => {
    const amount = stream.actualMonthly || stream.expectedMonthly || 0;
    const frequency = stream.frequency || 'MONTHLY';
    return total + convertToMonthlyAmount(Number(amount), frequency);
  }, 0);

  // Calculate total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((total, expense) => {
    const amount = expense.amount || 0;
    const frequency = expense.frequency || 'MONTHLY';
    return total + convertToMonthlyAmount(Number(amount), frequency);
  }, 0);

  // Calculate recurring vs one-time breakdown
  const recurringIncome = incomeStreams.reduce((total, stream) => {
    if (stream.frequency === 'ONE_TIME') return total;
    const amount = stream.actualMonthly || stream.expectedMonthly || 0;
    const frequency = stream.frequency || 'MONTHLY';
    return total + convertToMonthlyAmount(Number(amount), frequency);
  }, 0);

  const recurringExpenses = expenses.reduce((total, expense) => {
    if (expense.frequency === 'ONE_TIME') return total;
    const amount = expense.amount || 0;
    const frequency = expense.frequency || 'MONTHLY';
    return total + convertToMonthlyAmount(Number(amount), frequency);
  }, 0);

  const oneTimeIncome = incomeStreams.reduce((total, stream) => {
    if (stream.frequency !== 'ONE_TIME') return total;
    const amount = stream.actualMonthly || stream.expectedMonthly || 0;
    return total + Number(amount);
  }, 0);

  const oneTimeExpenses = expenses.reduce((total, expense) => {
    if (expense.frequency !== 'ONE_TIME') return total;
    const amount = expense.amount || 0;
    return total + Number(amount);
  }, 0);

  // Calculate lifestyle sustainability
  const recurringBurnRate = recurringIncome > 0 ? (recurringExpenses / recurringIncome) * 100 : 0;
  const totalBurnRate = totalMonthlyIncome > 0 ? (totalMonthlyExpenses / totalMonthlyIncome) * 100 : 0;
  
  // Calculate emergency fund months needed
  const emergencyFundNeeded = recurringExpenses * 6; // 6 months of recurring expenses
  
  // Calculate lifestyle risk score (0-100, lower is better)
  let riskScore = 0;
  if (recurringBurnRate > 80) riskScore += 40;
  else if (recurringBurnRate > 60) riskScore += 20;
  else if (recurringBurnRate > 40) riskScore += 10;
  
  // Add risk for income diversification
  const incomeSourceCount = incomeStreams.filter(s => s.frequency !== 'ONE_TIME' && s.isActive).length;
  if (incomeSourceCount < 2) riskScore += 20;
  
  // Add risk for one-time dependency
  const oneTimeIncomeRatio = totalMonthlyIncome > 0 ? (oneTimeIncome / totalMonthlyIncome) : 0;
  if (oneTimeIncomeRatio > 0.3) riskScore += 15;
  
  return {
    totalMonthlyIncome,
    totalMonthlyExpenses,
    recurringIncome,
    recurringExpenses,
    oneTimeIncome,
    oneTimeExpenses,
    recurringBurnRate,
    totalBurnRate,
    emergencyFundNeeded,
    riskScore: Math.min(riskScore, 100),
    incomeSourceCount,
    oneTimeIncomeRatio,
    sustainabilityRating: riskScore < 20 ? 'excellent' : 
                         riskScore < 40 ? 'good' : 
                         riskScore < 60 ? 'moderate' : 
                         riskScore < 80 ? 'risky' : 'critical'
  };
}

/**
 * Calculate projected balance for future months
 */
export function calculateBalanceProjections(
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  monthsToProject: number = 6
): Array<{
  month: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  projectedBalance: number;
  confidenceLevel: number;
}> {
  const projections = [];
  let runningBalance = currentBalance;
  
  for (let i = 1; i <= monthsToProject; i++) {
    const projectionMonth = new Date();
    projectionMonth.setMonth(projectionMonth.getMonth() + i);
    projectionMonth.setDate(1); // First day of month
    
    // Apply some variance to make projections more realistic
    const incomeVariance = 1 + (Math.random() - 0.5) * 0.1; // ±5% variance
    const expenseVariance = 1 + (Math.random() - 0.5) * 0.15; // ±7.5% variance
    
    const projectedIncome = monthlyIncome * incomeVariance;
    const projectedExpenses = monthlyExpenses * expenseVariance;
    const projectedSavings = projectedIncome - projectedExpenses;
    
    runningBalance += projectedSavings;
    
    // Confidence decreases over time
    const confidenceLevel = Math.max(0.3, 0.95 - (i * 0.1));
    
    projections.push({
      month: projectionMonth,
      projectedIncome,
      projectedExpenses,
      projectedSavings,
      projectedBalance: runningBalance,
      confidenceLevel,
    });
  }
  
  return projections;
}

/**
 * Calculate balance change from income/expense entries
 */
export function calculateBalanceChange(
  incomeStreams: any[],
  expenses: any[],
  previousBalance: number,
  earnedDate?: Date
): {
  newBalance: number;
  balanceChange: number;
  breakdownByCategory: {
    totalIncome: number;
    totalExpenses: number;
    netChange: number;
  };
} {
  const totalIncome = calculateMonthlyIncome(incomeStreams);
  const totalExpenses = calculateMonthlyExpenses(expenses);
  const netChange = totalIncome - totalExpenses;
  const newBalance = previousBalance + netChange;
  
  return {
    newBalance,
    balanceChange: netChange,
    breakdownByCategory: {
      totalIncome,
      totalExpenses,
      netChange,
    },
  };
}

/**
 * Enhanced financial runway calculation with balance consideration
 */
export function calculateFinancialRunway(
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpenses: number
): {
  totalRunwayMonths: number;
  balanceOnlyRunway: number;
  sustainableRunway: boolean;
  monthlyNetFlow: number;
  breakEvenDate: Date | null;
} {
  const monthlyNetFlow = monthlyIncome - monthlyExpenses;
  const balanceOnlyRunway = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : Infinity;
  
  let totalRunwayMonths: number;
  let sustainableRunway: boolean;
  let breakEvenDate: Date | null = null;
  
  if (monthlyNetFlow >= 0) {
    // Positive cash flow - runway is infinite
    totalRunwayMonths = Infinity;
    sustainableRunway = true;
  } else {
    // Negative cash flow - calculate when money runs out
    totalRunwayMonths = balanceOnlyRunway;
    sustainableRunway = false;
    
    if (isFinite(totalRunwayMonths)) {
      breakEvenDate = new Date();
      breakEvenDate.setMonth(breakEvenDate.getMonth() + Math.floor(totalRunwayMonths));
    }
  }
  
  return {
    totalRunwayMonths: isFinite(totalRunwayMonths) ? totalRunwayMonths : 999,
    balanceOnlyRunway,
    sustainableRunway,
    monthlyNetFlow,
    breakEvenDate,
  };
}

/**
 * Calculate enhanced lifestyle affordability with balance projections
 */
export function calculateLifestyleAffordability(
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  targetLifestyleCost: number,
  emergencyFundTarget: number = 6 // months
): {
  canAfford: boolean;
  monthsToAfford: number;
  incomeRequiredForAffordability: number;
  balanceImpact: {
    currentRunway: number;
    newRunway: number;
    impactOnEmergencyFund: number;
  };
  recommendations: string[];
} {
  const currentNetFlow = monthlyIncome - monthlyExpenses;
  const newNetFlow = monthlyIncome - (monthlyExpenses + targetLifestyleCost);
  
  const currentRunway = calculateFinancialRunway(currentBalance, monthlyIncome, monthlyExpenses);
  const newRunway = calculateFinancialRunway(currentBalance, monthlyIncome, monthlyExpenses + targetLifestyleCost);
  
  const emergencyFundNeeded = (monthlyExpenses + targetLifestyleCost) * emergencyFundTarget;
  const impactOnEmergencyFund = currentBalance - emergencyFundNeeded;
  
  const canAfford = newNetFlow >= 0 && currentBalance >= emergencyFundNeeded;
  
  let monthsToAfford = 0;
  if (!canAfford && currentNetFlow > 0) {
    const additionalIncomeNeeded = targetLifestyleCost;
    monthsToAfford = additionalIncomeNeeded / currentNetFlow;
  }
  
  const incomeRequiredForAffordability = monthlyExpenses + targetLifestyleCost + (emergencyFundNeeded / 12);
  
  const recommendations: string[] = [];
  if (!canAfford) {
    if (newNetFlow < 0) {
      recommendations.push('Increase income to maintain positive cash flow');
    }
    if (impactOnEmergencyFund < 0) {
      recommendations.push(`Build emergency fund to RM${formatCurrency(emergencyFundNeeded)}`);
    }
    if (monthsToAfford > 0 && monthsToAfford < 24) {
      recommendations.push(`Consider waiting ${Math.ceil(monthsToAfford)} months to improve financial position`);
    }
  }
  
  return {
    canAfford,
    monthsToAfford,
    incomeRequiredForAffordability,
    balanceImpact: {
      currentRunway: currentRunway.totalRunwayMonths,
      newRunway: newRunway.totalRunwayMonths,
      impactOnEmergencyFund,
    },
    recommendations,
  };
}

/**
 * Smart monthly snapshot creation with balance tracking
 */
export function createEnhancedMonthlySnapshot(
  userId: string,
  month: Date,
  currentBalance: number,
  previousBalance: number,
  incomeStreams: any[],
  expenses: any[],
  goals: any[],
  isProjected: boolean = false
) {
  const totalIncome = calculateMonthlyIncome(incomeStreams);
  const totalExpenses = calculateMonthlyExpenses(expenses);
  const totalSavings = totalIncome - totalExpenses;
  const burnRate = calculateBurnRate(totalExpenses, totalIncome);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);
  
  // Calculate goal metrics
  const activeGoals = goals.filter((goal: any) => !goal.isCompleted);
  const completedGoals = goals.filter((goal: any) => goal.isCompleted);
  const totalGoalsValue = goals.reduce((sum: number, goal: any) => sum + Number(goal.targetAmount), 0);
  const totalGoalsProgress = goals.reduce((sum: number, goal: any) => sum + Number(goal.currentAmount), 0);
  
  // Calculate health score
  const avgGoalProgress = totalGoalsValue > 0 ? (totalGoalsProgress / totalGoalsValue) * 100 : 0;
  const healthScore = calculateHealthScore(burnRate, savingsRate, avgGoalProgress);
  
  // Balance calculations
  const balanceChange = currentBalance - previousBalance;
  const balanceChangePercent = previousBalance > 0 ? (balanceChange / previousBalance) * 100 : 0;
  
  return {
    userId,
    month,
    totalIncome,
    totalExpenses,
    totalSavings,
    burnRate,
    savingsRate,
    healthScore,
    startingBalance: previousBalance,
    endingBalance: currentBalance,
    balanceChange,
    balanceChangePercent,
    isProjected,
    activeGoalsCount: activeGoals.length,
    completedGoalsCount: completedGoals.length,
    totalGoalsValue,
    totalGoalsProgress,
    incomeStreamsCount: incomeStreams.length,
    expensesCount: expenses.length,
  };
}

/**
 * Calculate accumulated balance from recurring income/expenses over time
 * This handles the core logic: if income/expense was added in March and it's now May,
 * calculate 2 months of accumulated impact
 */
export function calculateAccumulatedBalance(
  startingBalance: number,
  incomeStreams: any[],
  expenses: any[],
  fromDate?: Date
): {
  currentCalculatedBalance: number;
  monthlyBreakdown: Array<{
    month: Date;
    monthlyIncome: number;
    monthlyExpenses: number;
    netFlow: number;
    runningBalance: number;
  }>;
  totalAccumulatedIncome: number;
  totalAccumulatedExpenses: number;
} {
  const startDate = fromDate || new Date(Math.min(
    ...incomeStreams.map(s => new Date(s.earnedDate || s.createdAt).getTime()),
    ...expenses.map(e => new Date(e.incurredDate || e.createdAt).getTime())
  ));
  
  const currentDate = new Date();
  const monthlyBreakdown = [];
  let runningBalance = startingBalance;
  let totalAccumulatedIncome = 0;
  let totalAccumulatedExpenses = 0;
  
  // Generate monthly calculations from start date to current date
  const current = new Date(startDate);
  current.setDate(1); // Start from first day of month
  
  while (current <= currentDate) {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    // Calculate income for this month
    incomeStreams.forEach(stream => {
      const streamStartDate = new Date(stream.earnedDate || stream.createdAt);
      
      // Only include if stream was active in this month
      if (streamStartDate <= current && stream.isActive) {
        const amount = Number(stream.actualMonthly || stream.expectedMonthly);
        
        switch (stream.frequency) {
          case 'MONTHLY':
            monthlyIncome += amount;
            break;
          case 'WEEKLY':
            monthlyIncome += amount * 4.33;
            break;
          case 'YEARLY':
            monthlyIncome += amount / 12;
            break;
          case 'ONE_TIME':
            // Only add one-time income in the month it was earned
            if (streamStartDate.getMonth() === current.getMonth() && 
                streamStartDate.getFullYear() === current.getFullYear()) {
              monthlyIncome += amount;
            }
            break;
        }
      }
    });
    
    // Calculate expenses for this month
    expenses.forEach(expense => {
      const expenseStartDate = new Date(expense.incurredDate || expense.createdAt);
      
      // Only include if expense was active in this month
      if (expenseStartDate <= current && expense.isActive) {
        const amount = Number(expense.amount);
        
        switch (expense.frequency) {
          case 'MONTHLY':
            monthlyExpenses += amount;
            break;
          case 'WEEKLY':
            monthlyExpenses += amount * 4.33;
            break;
          case 'YEARLY':
            monthlyExpenses += amount / 12;
            break;
          case 'ONE_TIME':
            // Only add one-time expense in the month it was incurred
            if (expenseStartDate.getMonth() === current.getMonth() && 
                expenseStartDate.getFullYear() === current.getFullYear()) {
              monthlyExpenses += amount;
            }
            break;
        }
      }
    });
    
    const netFlow = monthlyIncome - monthlyExpenses;
    runningBalance += netFlow;
    
    totalAccumulatedIncome += monthlyIncome;
    totalAccumulatedExpenses += monthlyExpenses;
    
    monthlyBreakdown.push({
      month: new Date(current),
      monthlyIncome,
      monthlyExpenses,
      netFlow,
      runningBalance,
    });
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }
  
  return {
    currentCalculatedBalance: runningBalance,
    monthlyBreakdown,
    totalAccumulatedIncome,
    totalAccumulatedExpenses,
  };
} 