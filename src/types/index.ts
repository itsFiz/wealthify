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

// Application types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeStream {
  id: string;
  userId: string;
  name: string;
  type: IncomeType;
  expectedMonthly: number;
  actualMonthly?: number;
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
}

export interface CreateExpenseData {
  name: string;
  category: ExpenseCategory;
  type: ExpenseType;
  amount: number;
  frequency: Frequency;
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