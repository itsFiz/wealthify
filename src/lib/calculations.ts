import type { Goal, GoalForecast, ASSET_DEPRECIATION_RATES } from '@/types';

/**
 * Local currency formatter to avoid circular imports
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Universal projected price calculator for both appreciation and depreciation
 * 
 * @param initialPrice - Original price (e.g., RM270000)
 * @param rate - Annual rate (as decimal: 0.035 = 3.5%)
 * @param years - Number of years until target date
 * @param isAppreciating - true = appreciation, false = depreciation
 * @returns projectedPrice - Price at target year
 */
export function getProjectedGoalPrice(
  initialPrice: number,
  rate: number,
  years: number,
  isAppreciating: boolean
): number {
  const multiplier = isAppreciating ? (1 + rate) : (1 - rate);
  return +(initialPrice * Math.pow(multiplier, years)).toFixed(2);
}

/**
 * Calculate down payment target amount
 */
export function getDownpaymentTarget(
  projectedPrice: number,
  downpaymentRatio: number
): number {
  return +(projectedPrice * downpaymentRatio).toFixed(2);
}

/**
 * Calculate monthly savings required
 */
export function getMonthlySavingRequired(
  totalNeeded: number,
  monthsLeft: number
): number {
  return +(totalNeeded / monthsLeft).toFixed(2);
}

/**
 * Calculate projected asset price based on depreciation/appreciation
 * Enhanced to handle both depreciating and appreciating assets
 */
export function calculateProjectedPrice(
  initialPrice: number,
  depreciationRate: number,
  yearsToTarget: number
): number {
  if (depreciationRate < 0) {
    // Negative rate = appreciation (like property)
    return initialPrice * Math.pow(1 + Math.abs(depreciationRate), yearsToTarget);
  }
  // Positive rate = depreciation
  return initialPrice * Math.pow(1 - depreciationRate, yearsToTarget);
}

/**
 * Enhanced property-specific projection with additional costs
 */
export function calculatePropertyProjectedPrice(
  initialPrice: number,
  appreciationRate: number,
  yearsToTarget: number,
  includeClosingCosts: boolean = false
): {
  projectedPrice: number;
  totalWithCosts: number;
  closingCosts: number;
} {
  const projectedPrice = initialPrice * Math.pow(1 + appreciationRate, yearsToTarget);
  
  // Estimate closing costs (legal fees, stamp duty, etc.) - typically 3-5% in Malaysia
  const closingCosts = includeClosingCosts ? projectedPrice * 0.04 : 0; // 4% average
  const totalWithCosts = projectedPrice + closingCosts;
  
  return {
    projectedPrice,
    totalWithCosts,
    closingCosts
  };
}

/**
 * Calculate down payment requirements with flexible options
 */
export function calculateDownPaymentOptions(
  projectedPrice: number,
  includeClosingCosts: boolean = false
): {
  option10: number;
  option20: number;
  option30: number;
  fullCash: number;
  closingCosts: number;
} {
  const closingCosts = includeClosingCosts ? projectedPrice * 0.04 : 0;
  
  return {
    option10: (projectedPrice * 0.1) + closingCosts,
    option20: (projectedPrice * 0.2) + closingCosts,
    option30: (projectedPrice * 0.3) + closingCosts,
    fullCash: projectedPrice + closingCosts,
    closingCosts
  };
}

/**
 * Calculate monthly savings needed for a goal
 */
export function calculateMonthlySavingsRequired(
  targetAmount: number,
  currentAmount: number,
  monthsRemaining: number
): number {
  const remainingAmount = targetAmount - currentAmount;
  return Math.max(0, remainingAmount / monthsRemaining);
}

/**
 * Property-specific monthly savings calculator with appreciation buffer
 */
export function calculatePropertyMonthlySavings(
  currentPrice: number,
  appreciationRate: number,
  yearsToTarget: number,
  downPaymentRatio: number,
  currentSavings: number,
  includeClosingCosts: boolean = false,
  appreciationBuffer: number = 0.01 // Extra 1% buffer for price volatility
): {
  monthlyRequired: number;
  projectedPrice: number;
  downPaymentNeeded: number;
  totalCostWithBuffer: number;
  monthsToTarget: number;
} {
  const monthsToTarget = yearsToTarget * 12;
  
  // Apply appreciation rate + buffer for safety
  const effectiveRate = appreciationRate + appreciationBuffer;
  const projectedPrice = currentPrice * Math.pow(1 + effectiveRate, yearsToTarget);
  
  const closingCosts = includeClosingCosts ? projectedPrice * 0.04 : 0;
  const downPaymentNeeded = (projectedPrice * downPaymentRatio) + closingCosts;
  
  const remainingAmount = downPaymentNeeded - currentSavings;
  const monthlyRequired = Math.max(0, remainingAmount / monthsToTarget);
  
  return {
    monthlyRequired,
    projectedPrice,
    downPaymentNeeded,
    totalCostWithBuffer: downPaymentNeeded,
    monthsToTarget
  };
}

/**
 * Calculate affordability score (0-100) based on income
 */
export function calculateAffordabilityScore(
  monthlyRequired: number,
  monthlyIncome: number,
  currentSavingsRate: number
): number {
  const availableForSavings = monthlyIncome * (currentSavingsRate / 100);
  const affordabilityRatio = availableForSavings / monthlyRequired;
  
  if (affordabilityRatio >= 1) return 100;
  if (affordabilityRatio >= 0.8) return 80 + (affordabilityRatio - 0.8) * 100;
  if (affordabilityRatio >= 0.6) return 60 + (affordabilityRatio - 0.6) * 100;
  if (affordabilityRatio >= 0.4) return 40 + (affordabilityRatio - 0.4) * 100;
  return affordabilityRatio * 100;
}

/**
 * Enhanced recommendations with property-specific advice
 */
export function generateGoalRecommendations(
  monthlyRequired: number,
  monthlyIncome: number,
  currentSavingsRate: number,
  goalName: string,
  isPropertyGoal: boolean = false
): string[] {
  const availableForSavings = monthlyIncome * (currentSavingsRate / 100);
  const shortfall = monthlyRequired - availableForSavings;
  const recommendations: string[] = [];

  if (shortfall <= 0) {
    recommendations.push(`✅ You're on track! Current savings can cover this goal.`);
    if (isPropertyGoal) {
      recommendations.push(`🏠 Consider opening a dedicated property savings account for better returns.`);
    }
    return recommendations;
  }

  // Income increase needed
  const incomeIncreaseNeeded = shortfall / 0.2; // Assuming 20% savings rate
  recommendations.push(`💰 Increase income by RM${Math.round(incomeIncreaseNeeded).toLocaleString()} to maintain current lifestyle`);

  // Savings rate increase
  const newSavingsRate = (monthlyRequired / monthlyIncome) * 100;
  if (newSavingsRate <= 50) {
    recommendations.push(`📈 Increase savings rate from ${currentSavingsRate}% to ${newSavingsRate.toFixed(1)}%`);
  }

  // Timeline extension
  const affordableMonths = availableForSavings > 0 ? monthlyRequired / availableForSavings : 1;
  if (affordableMonths > 1 && affordableMonths <= 2) {
    const additionalMonths = Math.ceil((affordableMonths - 1) * 12);
    recommendations.push(`⏰ Extend timeline by ${additionalMonths} months to make it affordable`);
  }

  // Property-specific recommendations
  if (isPropertyGoal) {
    recommendations.push(`🏦 Consider property investment trusts (REITs) as alternative exposure`);
    recommendations.push(`🔍 Monitor market cycles - property prices can fluctuate significantly`);
    recommendations.push(`💡 Look into first-time buyer programs for potential incentives`);
  } else {
    recommendations.push(`🏦 Consider financing options or reduce down payment if applicable`);
  }

  return recommendations;
}

/**
 * Calculate property ROI projections (if bought as investment)
 */
export function calculatePropertyROI(
  purchasePrice: number,
  downPayment: number,
  monthlyRental: number,
  appreciationRate: number,
  yearsHeld: number,
  monthlyExpenses: number = 0 // Maintenance, taxes, etc.
): {
  totalRentalIncome: number;
  capitalGains: number;
  totalROI: number;
  annualROI: number;
  cashOnCashReturn: number;
} {
  const monthsHeld = yearsHeld * 12;
  const totalRentalIncome = (monthlyRental - monthlyExpenses) * monthsHeld;
  
  const futurePrice = purchasePrice * Math.pow(1 + appreciationRate, yearsHeld);
  const capitalGains = futurePrice - purchasePrice;
  
  const totalReturn = totalRentalIncome + capitalGains;
  const totalROI = (totalReturn / downPayment) * 100;
  const annualROI = totalROI / yearsHeld;
  
  const annualRentalReturn = (monthlyRental - monthlyExpenses) * 12;
  const cashOnCashReturn = (annualRentalReturn / downPayment) * 100;
  
  return {
    totalRentalIncome,
    capitalGains,
    totalROI,
    annualROI,
    cashOnCashReturn
  };
}

/**
 * Create comprehensive goal forecast with enhanced property logic
 */
export function createGoalForecast(
  goal: Goal,
  monthlyIncome: number,
  currentSavingsRate: number
): GoalForecast {
  const currentDate = new Date();
  const targetDate = new Date(goal.targetDate); // Ensure it's a Date object
  const yearsToTarget = (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const monthsToTarget = Math.max(1, yearsToTarget * 12);

  let projectedPrice = goal.targetAmount;
  let currentPrice = goal.targetAmount;
  const isPropertyGoal = goal.category === 'PROPERTY' || (goal.isAssetGoal && goal.depreciationRate !== undefined && goal.depreciationRate < 0);

  // If it's an asset goal with depreciation/appreciation data
  if (goal.isAssetGoal && goal.initialAssetPrice && goal.depreciationRate !== undefined) {
    currentPrice = goal.initialAssetPrice;
    
    if (isPropertyGoal) {
      // Use enhanced property calculation
      const propertyProjection = calculatePropertyProjectedPrice(
        goal.initialAssetPrice,
        Math.abs(goal.depreciationRate), // Convert negative to positive for appreciation
        yearsToTarget,
        true // Include closing costs
      );
      projectedPrice = propertyProjection.totalWithCosts;
    } else {
      // Standard depreciation calculation
      projectedPrice = calculateProjectedPrice(
        goal.initialAssetPrice,
        goal.depreciationRate,
        yearsToTarget
      );
    }
  }

  // Calculate required savings (full amount or down payment)
  const targetSavingsAmount = goal.downPaymentRatio 
    ? projectedPrice * goal.downPaymentRatio 
    : projectedPrice;

  const monthlyRequired = calculateMonthlySavingsRequired(
    targetSavingsAmount,
    goal.currentAmount,
    monthsToTarget
  );

  const monthlyRequiredDownPayment = goal.downPaymentRatio
    ? calculateMonthlySavingsRequired(
        projectedPrice * goal.downPaymentRatio,
        goal.currentAmount,
        monthsToTarget
      )
    : undefined;

  const affordabilityScore = calculateAffordabilityScore(
    monthlyRequired,
    monthlyIncome,
    currentSavingsRate
  );

  const recommendations = generateGoalRecommendations(
    monthlyRequired,
    monthlyIncome,
    currentSavingsRate,
    goal.name,
    isPropertyGoal
  );

  return {
    goalId: goal.id,
    currentPrice,
    projectedPrice,
    yearsToTarget,
    monthlyRequiredSavings: monthlyRequired,
    monthlyRequiredDownPayment,
    affordabilityScore,
    recommendations
  };
}

/**
 * Format currency for display
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return `RM${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RM${(amount / 1000).toFixed(0)}k`;
  }
  return formatCurrency(amount);
} 