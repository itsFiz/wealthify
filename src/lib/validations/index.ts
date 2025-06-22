import { z } from 'zod';
import { IncomeType, ExpenseCategory, ExpenseType, Frequency, GoalCategory } from '@/types';

// Base validation helpers
const positiveNumber = z.number().positive('Must be a positive number');
const nonNegativeNumber = z.number().min(0, 'Must be zero or positive');
const optionalPositiveNumber = z.number().positive().optional();

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
});

// Income Stream validation schemas
export const createIncomeStreamSchema = z.object({
  name: z.string().min(1, 'Income stream name is required').max(100, 'Name too long'),
  type: z.nativeEnum(IncomeType, { errorMap: () => ({ message: 'Invalid income type' }) }),
  expectedMonthly: positiveNumber,
  actualMonthly: optionalPositiveNumber,
});

export const updateIncomeStreamSchema = createIncomeStreamSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const incomeEntrySchema = z.object({
  incomeStreamId: z.string().cuid('Invalid income stream ID'),
  amount: positiveNumber,
  month: z.date().refine(
    (date) => date <= new Date(),
    'Entry date cannot be in the future'
  ),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required').max(100, 'Name too long'),
  category: z.nativeEnum(ExpenseCategory, { errorMap: () => ({ message: 'Invalid expense category' }) }),
  type: z.nativeEnum(ExpenseType, { errorMap: () => ({ message: 'Invalid expense type' }) }),
  amount: positiveNumber,
  frequency: z.nativeEnum(Frequency, { errorMap: () => ({ message: 'Invalid frequency' }) }),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const expenseEntrySchema = z.object({
  expenseId: z.string().cuid('Invalid expense ID'),
  amount: positiveNumber,
  month: z.date().refine(
    (date) => date <= new Date(),
    'Entry date cannot be in the future'
  ),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Goal validation schemas
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  targetAmount: positiveNumber,
  targetDate: z.date().refine(
    (date) => date > new Date(),
    'Target date must be in the future'
  ),
  priority: z.number().int().min(1).max(10).default(1),
  category: z.nativeEnum(GoalCategory, { errorMap: () => ({ message: 'Invalid goal category' }) }),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  currentAmount: nonNegativeNumber.optional(),
  isCompleted: z.boolean().optional(),
});

export const goalContributionSchema = z.object({
  goalId: z.string().cuid('Invalid goal ID'),
  amount: positiveNumber,
  month: z.date().refine(
    (date) => date <= new Date(),
    'Contribution date cannot be in the future'
  ),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Budget validation schemas
export const budgetSchema = z.object({
  month: z.date(),
  totalIncome: nonNegativeNumber,
  totalExpenses: nonNegativeNumber,
  totalSavings: z.number(), // Can be negative
  burnRate: z.number().min(0).max(200), // Allow up to 200% burn rate
  healthScore: z.number().int().min(0).max(100),
});

// Calculator validation schemas
export const affordabilityCalculatorSchema = z.object({
  targetAmount: positiveNumber,
  currentAmount: nonNegativeNumber.default(0),
  monthlyIncome: positiveNumber,
  monthlyExpenses: nonNegativeNumber,
  targetTimelineMonths: z.number().int().positive().optional(),
});

export const goalAnalysisSchema = z.object({
  goalId: z.string().cuid('Invalid goal ID'),
  monthlyIncome: positiveNumber,
  monthlyExpenses: nonNegativeNumber,
});

// Dashboard validation schemas
export const dashboardFiltersSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  goalCategories: z.array(z.nativeEnum(GoalCategory)).optional(),
  incomeTypes: z.array(z.nativeEnum(IncomeType)).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }
);

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  categories: z.array(z.string()).optional(),
});

// Date range validation schema
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }
);

// Bulk operations validation schemas
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID is required'),
});

export const bulkUpdateIncomeStreamsSchema = z.object({
  updates: z.array(z.object({
    id: z.string().cuid(),
    data: updateIncomeStreamSchema,
  })).min(1, 'At least one update is required'),
});

export const bulkUpdateExpensesSchema = z.object({
  updates: z.array(z.object({
    id: z.string().cuid(),
    data: updateExpenseSchema,
  })).min(1, 'At least one update is required'),
});

// Type exports for form handling
export type CreateIncomeStreamData = z.infer<typeof createIncomeStreamSchema>;
export type UpdateIncomeStreamData = z.infer<typeof updateIncomeStreamSchema>;
export type IncomeEntryData = z.infer<typeof incomeEntrySchema>;

export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>;
export type ExpenseEntryData = z.infer<typeof expenseEntrySchema>;

export type CreateGoalData = z.infer<typeof createGoalSchema>;
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;
export type GoalContributionData = z.infer<typeof goalContributionSchema>;

export type BudgetData = z.infer<typeof budgetSchema>;
export type AffordabilityCalculatorData = z.infer<typeof affordabilityCalculatorSchema>;
export type GoalAnalysisData = z.infer<typeof goalAnalysisSchema>;

export type DashboardFiltersData = z.infer<typeof dashboardFiltersSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type SearchData = z.infer<typeof searchSchema>;
export type DateRangeData = z.infer<typeof dateRangeSchema>; 