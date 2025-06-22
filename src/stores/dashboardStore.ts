import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  IncomeStream, 
  Expense, 
  Goal, 
  DashboardData,
  GoalCalculation 
} from '@/types';
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateBurnRate,
  calculateSavingsRate,
  calculateHealthScore,
  analyzeGoal
} from '@/lib/calculations';

interface DashboardState {
  // Data
  incomeStreams: IncomeStream[];
  expenses: Expense[];
  goals: Goal[];
  
  // Computed values
  monthlyIncome: number;
  monthlyExpenses: number;
  burnRate: number;
  savingsRate: number;
  healthScore: number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setIncomeStreams: (streams: IncomeStream[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGoals: (goals: Goal[]) => void;
  addIncomeStream: (stream: IncomeStream) => void;
  updateIncomeStream: (id: string, updates: Partial<IncomeStream>) => void;
  removeIncomeStream: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
  getDashboardData: () => DashboardData;
  getGoalAnalysis: (goalId: string) => GoalCalculation | null;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      incomeStreams: [],
      expenses: [],
      goals: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      burnRate: 0,
      savingsRate: 0,
      healthScore: 0,
      isLoading: false,
      error: null,

      // Actions
      setIncomeStreams: (streams) => {
        set((state) => {
          const monthlyIncome = calculateMonthlyIncome(streams);
          const burnRate = calculateBurnRate(state.monthlyExpenses, monthlyIncome);
          const savingsRate = calculateSavingsRate(monthlyIncome, state.monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            incomeStreams: streams,
            monthlyIncome,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      setExpenses: (expenses) => {
        set((state) => {
          const monthlyExpenses = calculateMonthlyExpenses(expenses);
          const burnRate = calculateBurnRate(monthlyExpenses, state.monthlyIncome);
          const savingsRate = calculateSavingsRate(state.monthlyIncome, monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            expenses,
            monthlyExpenses,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      setGoals: (goals) => {
        set({ goals });
      },

      addIncomeStream: (stream) => {
        set((state) => {
          const newStreams = [...state.incomeStreams, stream];
          const monthlyIncome = calculateMonthlyIncome(newStreams);
          const burnRate = calculateBurnRate(state.monthlyExpenses, monthlyIncome);
          const savingsRate = calculateSavingsRate(monthlyIncome, state.monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            incomeStreams: newStreams,
            monthlyIncome,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      updateIncomeStream: (id, updates) => {
        set((state) => {
          const newStreams = state.incomeStreams.map(stream =>
            stream.id === id ? { ...stream, ...updates } : stream
          );
          const monthlyIncome = calculateMonthlyIncome(newStreams);
          const burnRate = calculateBurnRate(state.monthlyExpenses, monthlyIncome);
          const savingsRate = calculateSavingsRate(monthlyIncome, state.monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            incomeStreams: newStreams,
            monthlyIncome,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      removeIncomeStream: (id) => {
        set((state) => {
          const newStreams = state.incomeStreams.filter(stream => stream.id !== id);
          const monthlyIncome = calculateMonthlyIncome(newStreams);
          const burnRate = calculateBurnRate(state.monthlyExpenses, monthlyIncome);
          const savingsRate = calculateSavingsRate(monthlyIncome, state.monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            incomeStreams: newStreams,
            monthlyIncome,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      addExpense: (expense) => {
        set((state) => {
          const newExpenses = [...state.expenses, expense];
          const monthlyExpenses = calculateMonthlyExpenses(newExpenses);
          const burnRate = calculateBurnRate(monthlyExpenses, state.monthlyIncome);
          const savingsRate = calculateSavingsRate(state.monthlyIncome, monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            expenses: newExpenses,
            monthlyExpenses,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      updateExpense: (id, updates) => {
        set((state) => {
          const newExpenses = state.expenses.map(expense =>
            expense.id === id ? { ...expense, ...updates } : expense
          );
          const monthlyExpenses = calculateMonthlyExpenses(newExpenses);
          const burnRate = calculateBurnRate(monthlyExpenses, state.monthlyIncome);
          const savingsRate = calculateSavingsRate(state.monthlyIncome, monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            expenses: newExpenses,
            monthlyExpenses,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      removeExpense: (id) => {
        set((state) => {
          const newExpenses = state.expenses.filter(expense => expense.id !== id);
          const monthlyExpenses = calculateMonthlyExpenses(newExpenses);
          const burnRate = calculateBurnRate(monthlyExpenses, state.monthlyIncome);
          const savingsRate = calculateSavingsRate(state.monthlyIncome, monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          return {
            expenses: newExpenses,
            monthlyExpenses,
            burnRate,
            savingsRate,
            healthScore,
          };
        });
      },

      addGoal: (goal) => {
        set((state) => ({
          goals: [...state.goals, goal],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }));
      },

      removeGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter(goal => goal.id !== id),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      refreshData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real app, these would be API calls
          // For now, we'll just recalculate with existing data
          const state = get();
          const monthlyIncome = calculateMonthlyIncome(state.incomeStreams);
          const monthlyExpenses = calculateMonthlyExpenses(state.expenses);
          const burnRate = calculateBurnRate(monthlyExpenses, monthlyIncome);
          const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
          const healthScore = calculateHealthScore(burnRate, savingsRate);
          
          set({
            monthlyIncome,
            monthlyExpenses,
            burnRate,
            savingsRate,
            healthScore,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh data',
            isLoading: false 
          });
        }
      },

      getDashboardData: () => {
        const state = get();
        return {
          totalIncome: state.monthlyIncome,
          totalExpenses: state.monthlyExpenses,
          burnRate: state.burnRate,
          totalSavings: state.monthlyIncome - state.monthlyExpenses,
          healthScore: state.healthScore,
          activeGoals: state.goals.filter(goal => !goal.isCompleted),
          recentTransactions: [], // Would be populated from recent entries
        };
      },

      getGoalAnalysis: (goalId) => {
        const state = get();
        const goal = state.goals.find(g => g.id === goalId);
        if (!goal) return null;
        
        return analyzeGoal(goal, state.monthlyIncome, state.monthlyExpenses);
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
); 