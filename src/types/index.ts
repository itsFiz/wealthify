// Prisma enums
export enum IncomeType {
  SALARY = 'SALARY',
  BUSINESS = 'BUSINESS',
  FREELANCE = 'FREELANCE',
  INVESTMENT = 'INVESTMENT',
  PASSIVE = 'PASSIVE',
  OTHER = 'OTHER',
}

export enum ExpenseCategory {
  HOUSING = 'HOUSING',
  TRANSPORTATION = 'TRANSPORTATION',
  FOOD = 'FOOD',
  UTILITIES = 'UTILITIES',
  ENTERTAINMENT = 'ENTERTAINMENT',
  HEALTHCARE = 'HEALTHCARE',
  BUSINESS = 'BUSINESS',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER',
}

export enum ExpenseType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  STARTUP_BURN = 'STARTUP_BURN',
}

export enum Frequency {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

export enum GoalCategory {
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  DEBT_PAYOFF = 'DEBT_PAYOFF',
  PROPERTY = 'PROPERTY',
  VEHICLE = 'VEHICLE',
  INVESTMENT = 'INVESTMENT',
  VACATION = 'VACATION',
  BUSINESS = 'BUSINESS',
  OTHER = 'OTHER',
}

// Array of all goal categories for iteration
export const GOAL_CATEGORIES = Object.values(GoalCategory);

// Application types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Simple Financial Position
  currentSavings?: number; // Total liquid savings
  totalDebt?: number; // Total debt amount
  // netWorth calculated as: currentSavings - totalDebt
}

export interface IncomeStream {
  id: string;
  userId: string;
  name: string;
  type: IncomeType;
  expectedMonthly: number;
  actualMonthly?: number;
  frequency: Frequency;
  earnedDate?: Date;
  endDate?: Date; // Date when income stream was ended
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  entries?: IncomeEntry[];
}

export interface IncomeEntry {
  id: string;
  incomeStreamId: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  category: ExpenseCategory;
  type: ExpenseType;
  amount: number;
  frequency: Frequency;
  incurredDate?: Date; // Date when expense was incurred/paid
  endDate?: Date; // Date when expense was ended
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  entries?: ExpenseEntry[];
}

export interface ExpenseEntry {
  id: string;
  expenseId: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: number;
  category: GoalCategory;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  contributions?: GoalContribution[];
  // Image upload
  imageUrl?: string;
  // New depreciation fields
  isAssetGoal?: boolean;
  initialAssetPrice?: number;
  depreciationRate?: number; // Annual depreciation rate (0.06 = 6%)
  downPaymentRatio?: number; // 0.2 = 20% down payment
  projectedPrice?: number; // Calculated projected price
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  month: Date;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  burnRate: number;
  healthScore: number;
  createdAt: Date;
}

// UI/Form types
export interface CreateIncomeStreamData {
  name: string;
  type: IncomeType;
  expectedMonthly: number;
  actualMonthly?: number;
  frequency: Frequency;
  earnedDate?: Date;
}

export interface CreateExpenseData {
  name: string;
  category: ExpenseCategory;
  type: ExpenseType;
  amount: number;
  frequency: Frequency;
  incurredDate?: Date;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: Date;
  priority?: number;
  category: GoalCategory;
}

// Dashboard types
export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  burnRate: number;
  totalSavings: number;
  healthScore: number;
  activeGoals: Goal[];
  recentTransactions: (IncomeEntry | ExpenseEntry)[];
}

// Calculator types
export interface GoalCalculation {
  monthsRemaining: number;
  requiredMonthlySavings: number;
  currentMonthlySavings: number;
  incomeGap: number;
  isAchievable: boolean;
}

export interface AffordabilityResult {
  timelineMonths: number;
  requiredIncome: number;
  currentIncome: number;
  incomeIncrease: number;
  feasible: boolean;
}

// Chart data types
export interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface GoalProgressData {
  goalId: string;
  goalName: string;
  progress: number;
  targetAmount: number;
  currentAmount: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// New interfaces for depreciation forecasting
export interface AssetDepreciation {
  assetType: string;
  annualDepreciationRate: number;
  description: string;
}

export interface GoalForecast {
  goalId: string;
  currentPrice: number;
  projectedPrice: number;
  yearsToTarget: number;
  monthlyRequiredSavings: number;
  monthlyRequiredDownPayment?: number;
  affordabilityScore: number; // 0-100 based on current income
  recommendations: string[];
}

export interface PurchasePlan {
  id: string;
  userId: string;
  name: string;
  purchaseType: 'house' | 'vehicle' | 'wedding' | 'business' | 'custom';
  targetAmount: number;
  currentSaved: number;
  desiredTimelineMonths: number;
  downPaymentRatio?: number;
  appreciationRate?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined asset depreciation rates
export const ASSET_DEPRECIATION_RATES: Record<string, AssetDepreciation> = {
  VEHICLE_SPORTS: {
    assetType: 'Sports Car (GR86, etc.)',
    annualDepreciationRate: 0.057, // 5.7% based on your data
    description: 'Sports cars typically depreciate 25.7% over 5 years'
  },
  VEHICLE_LUXURY: {
    assetType: 'Luxury Vehicle',
    annualDepreciationRate: 0.065, // 6.5%
    description: 'Luxury vehicles depreciate faster than sports cars'
  },
  VEHICLE_STANDARD: {
    assetType: 'Standard Vehicle',
    annualDepreciationRate: 0.045, // 4.5%
    description: 'Standard vehicles have slower depreciation'
  },
  PROPERTY_RESIDENTIAL: {
    assetType: 'Residential Property',
    annualDepreciationRate: -0.03, // Negative = appreciation
    description: 'Property typically appreciates 3% annually in Malaysia'
  },
  PROPERTY_COMMERCIAL: {
    assetType: 'Commercial Property',
    annualDepreciationRate: -0.025, // 2.5% appreciation
    description: 'Commercial properties with stable 2-3% growth'
  },
  PROPERTY_PRIME_LOCATION: {
    assetType: 'Prime Location Property',
    annualDepreciationRate: -0.05, // 5% appreciation
    description: 'KL city center, prime areas with higher growth potential'
  },
  PROPERTY_AFFORDABLE: {
    assetType: 'Affordable Housing',
    annualDepreciationRate: -0.02, // 2% appreciation
    description: 'Government-backed affordable housing schemes'
  },
  PROPERTY_INVESTMENT: {
    assetType: 'Investment Property',
    annualDepreciationRate: -0.035, // 3.5% appreciation
    description: 'Properties bought specifically for rental income'
  },
  ELECTRONICS: {
    assetType: 'Electronics/Tech',
    annualDepreciationRate: 0.15, // 15%
    description: 'Technology depreciates rapidly'
  }
};

// Goal category configuration for smart form behavior
export interface GoalCategoryConfig {
  category: GoalCategory;
  label: string;
  icon: string; // Lucide icon name
  color: string;
  description: string;
  hasForecasting: boolean; // Enable price forecasting
  forecastType: 'APPRECIATION' | 'DEPRECIATION' | 'STATIC' | 'NONE';
  isAssetGoal: boolean;
  defaultRates?: number[]; // Suggested rates for dropdowns
  showDownPayment: boolean;
  suggestedTimeline: string; // Helper text for timeline
}

// Predefined goal category configurations
export const GOAL_CATEGORY_CONFIGS: Record<GoalCategory, GoalCategoryConfig> = {
  [GoalCategory.EMERGENCY_FUND]: {
    category: GoalCategory.EMERGENCY_FUND,
    label: 'Emergency Fund',
    icon: 'Shield',
    color: 'text-red-600',
    description: 'Build a safety net for unexpected expenses (3-6 months of expenses)',
    hasForecasting: false,
    forecastType: 'STATIC',
    isAssetGoal: false,
    showDownPayment: false,
    suggestedTimeline: 'Aim for 6-12 months to build emergency fund'
  },
  [GoalCategory.DEBT_PAYOFF]: {
    category: GoalCategory.DEBT_PAYOFF,
    label: 'Debt Payoff',
    icon: 'CreditCard',
    color: 'text-orange-600', 
    description: 'Pay off existing debts (credit cards, loans, etc.)',
    hasForecasting: false,
    forecastType: 'STATIC',
    isAssetGoal: false,
    showDownPayment: false,
    suggestedTimeline: 'Target aggressive payoff for high-interest debt'
  },
  [GoalCategory.PROPERTY]: {
    category: GoalCategory.PROPERTY,
    label: 'Property Purchase',
    icon: 'Home',
    color: 'text-green-600',
    description: 'Buy residential or investment property with appreciation forecasting',
    hasForecasting: true,
    forecastType: 'APPRECIATION',
    isAssetGoal: true,
    defaultRates: [-0.02, -0.025, -0.03, -0.035, -0.05], // 2% to 5% appreciation
    showDownPayment: true,
    suggestedTimeline: 'Property purchases typically require 2-5 years of planning'
  },
  [GoalCategory.VEHICLE]: {
    category: GoalCategory.VEHICLE,
    label: 'Vehicle Purchase',
    icon: 'Car',
    color: 'text-blue-600',
    description: 'Buy a car, motorcycle, or other vehicle with depreciation forecasting',
    hasForecasting: true,
    forecastType: 'DEPRECIATION',
    isAssetGoal: true,
    defaultRates: [0.045, 0.057, 0.065], // 4.5% to 6.5% depreciation
    showDownPayment: true,
    suggestedTimeline: 'Vehicle goals typically span 1-3 years'
  },
  [GoalCategory.INVESTMENT]: {
    category: GoalCategory.INVESTMENT,
    label: 'Investment Goal',
    icon: 'TrendingUp', 
    color: 'text-purple-600',
    description: 'Build investment portfolio or reach investment milestones',
    hasForecasting: true,
    forecastType: 'APPRECIATION',
    isAssetGoal: false,
    defaultRates: [-0.05, -0.07, -0.10], // 5% to 10% returns
    showDownPayment: false,
    suggestedTimeline: 'Long-term investments work best (5+ years)'
  },
  [GoalCategory.VACATION]: {
    category: GoalCategory.VACATION,
    label: 'Vacation/Travel',
    icon: 'Plane',
    color: 'text-cyan-600',
    description: 'Save for dream vacation or travel experiences',
    hasForecasting: false,
    forecastType: 'STATIC',
    isAssetGoal: false,
    showDownPayment: false,
    suggestedTimeline: 'Plan 6-18 months ahead for best flight deals'
  },
  [GoalCategory.BUSINESS]: {
    category: GoalCategory.BUSINESS,
    label: 'Business Goal',
    icon: 'Briefcase',
    color: 'text-yellow-600',
    description: 'Start a business or expand existing operations',
    hasForecasting: false,
    forecastType: 'STATIC',
    isAssetGoal: false,
    showDownPayment: false,
    suggestedTimeline: 'Business goals vary widely - plan accordingly'
  },
  [GoalCategory.OTHER]: {
    category: GoalCategory.OTHER,
    label: 'Other Goal',
    icon: 'Archive',
    color: 'text-gray-600',
    description: 'Custom financial goal with optional forecasting',
    hasForecasting: true,
    forecastType: 'NONE',
    isAssetGoal: false,
    showDownPayment: false,
    suggestedTimeline: 'Set realistic timeline based on goal amount'
  }
}; 