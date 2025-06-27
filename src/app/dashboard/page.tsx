'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { GoalProgressCard } from '@/components/gamification/GoalProgressCard';
import { LifestyleAnalysisCard } from '@/components/dashboard/LifestyleAnalysisCard';
import { GoalModal } from '@/components/modals/GoalModal';
import { IncomeStreamModal } from '@/components/modals/IncomeStreamModal';
import { ExpenseModal } from '@/components/modals/ExpenseModal';
import { ContributionModal } from '@/components/modals/ContributionModal';
import { GoalDetailsModal } from '@/components/modals/GoalDetailsModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { BalanceUpdateForm } from '@/components/forms/BalanceUpdateForm';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatPercentage, getBurnRateColor, getHealthScoreColor, calculateAccumulatedBalance } from '@/lib/calculations/index';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Target,
  Zap,
  Plus,
  ArrowRight,
  PieChart,
  BarChart3,
  Trophy,
  Activity,
  Home,
  Car,
  Shield,
  CreditCard,
  DollarSign,
  Calculator,
  Flame,
  AlertCircle,
  Menu,
  Edit,
  Trash2
} from 'lucide-react';
import type { Goal, IncomeStream, Expense } from '@/types';

// Types for monthly snapshots
interface MonthlySnapshot {
  id: string;
  month: Date;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  burnRate: number;
  savingsRate: number;
  healthScore: number;
  startingBalance: number;
  endingBalance: number;
  balanceChange: number;
  balanceChangePercent: number | null;
  incomeChangePercent: number | null;
  expenseChangePercent: number | null;
  savingsChangePercent: number | null;
  healthScoreChange: number | null;
}

// Interface for delete confirmation state
interface DeleteConfirmation {
  isOpen: boolean;
  type: 'goal' | 'income' | 'expense';
  itemId: string;
  itemName: string;
  isDeleting: boolean;
}

// Interface for action confirmation state (toggle, end, edit)
interface ActionConfirmation {
  isOpen: boolean;
  type: 'goal' | 'income' | 'expense';
  action: 'toggle' | 'end' | 'edit';
  itemId: string;
  itemName: string;
  currentStatus?: boolean;
  isProcessing: boolean;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    incomeStreams,
    expenses,
    goals,
    monthlyIncome,
    monthlyExpenses,
    burnRate,
    savingsRate,
    healthScore,
    isLoading,
    error,
    setIncomeStreams,
    setExpenses,
    setGoals,
    addGoal,
    updateGoal,
    removeGoal,
    addIncomeStream,
    updateIncomeStream,
    removeIncomeStream,
    addExpense,
    updateExpense,
    removeExpense,
  } = useDashboardStore();

  // Monthly snapshots for trends
  const [currentSnapshot, setCurrentSnapshot] = useState<MonthlySnapshot | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [startingBalance, setStartingBalance] = useState<number>(0);

  // Modal states
  const [goalModal, setGoalModal] = useState<{
    isOpen: boolean;
    goal?: Goal;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    goal: undefined,
    isSubmitting: false,
  });

  const [incomeStreamModal, setIncomeStreamModal] = useState<{
    isOpen: boolean;
    incomeStream?: IncomeStream;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    incomeStream: undefined,
    isSubmitting: false,
  });

  const [expenseModal, setExpenseModal] = useState<{
    isOpen: boolean;
    expense?: Expense;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    expense: undefined,
    isSubmitting: false,
  });

  const [contributionModal, setContributionModal] = useState<{
    isOpen: boolean;
    goal?: Goal;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    goal: undefined,
    isSubmitting: false,
  });

  const [goalDetailsModal, setGoalDetailsModal] = useState<{
    isOpen: boolean;
    goal?: Goal;
  }>({
    isOpen: false,
    goal: undefined,
  });

  const [balanceUpdateModal, setBalanceUpdateModal] = useState<{
    isOpen: boolean;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    isSubmitting: false,
  });

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    type: 'goal',
    itemId: '',
    itemName: '',
    isDeleting: false,
  });

  // Action confirmation modal state (for toggle, end, edit actions)
  const [actionConfirmation, setActionConfirmation] = useState<ActionConfirmation>({
    isOpen: false,
    type: 'goal',
    action: 'toggle',
    itemId: '',
    itemName: '',
    currentStatus: undefined,
    isProcessing: false,
  });

  // Contribution deletion state
  const [isDeletingContribution, setIsDeletingContribution] = useState<string>('');

  // Fetch user-specific data
  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      // Fetch user balance (starting balance only)
      const balanceResponse = await fetch('/api/balance');
      let fetchedStartingBalance = 0;
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        fetchedStartingBalance = balanceData.startingBalance || 0;
        setStartingBalance(fetchedStartingBalance);
        console.log('💰 Starting balance fetched:', fetchedStartingBalance);
      } else {
        console.log('⚠️ Balance fetch failed:', balanceResponse.status, await balanceResponse.text());
        // If balance API fails, set default starting balance to 0
        setStartingBalance(0);
      }

      // Fetch income streams
      const incomeResponse = await fetch('/api/income');
      let processedIncome: any[] = [];
      if (incomeResponse.ok) {
        const incomeData = await incomeResponse.json();
        // Convert Decimal fields to numbers
        processedIncome = incomeData.map((stream: any) => ({
          ...stream,
          expectedMonthly: Number(stream.expectedMonthly),
          actualMonthly: Number(stream.actualMonthly || stream.expectedMonthly),
        }));
        setIncomeStreams(processedIncome);
      }

      // Fetch expenses
      const expenseResponse = await fetch('/api/expenses');
      let processedExpenses: any[] = [];
      if (expenseResponse.ok) {
        const expenseData = await expenseResponse.json();
        // Convert Decimal fields to numbers
        processedExpenses = expenseData.map((expense: any) => ({
          ...expense,
          amount: Number(expense.amount),
        }));
        setExpenses(processedExpenses);
      }

      // Fetch goals
      const goalsResponse = await fetch('/api/goals');
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        // Convert date strings to Date objects and process other fields
        const processedGoals = goalsData.map((goal: any) => ({
          ...goal,
          targetDate: new Date(goal.targetDate),
          createdAt: new Date(goal.createdAt),
          updatedAt: new Date(goal.updatedAt),
          targetAmount: Number(goal.targetAmount),
          currentAmount: Number(goal.currentAmount),
          initialAssetPrice: goal.initialAssetPrice ? Number(goal.initialAssetPrice) : undefined,
          depreciationRate: goal.depreciationRate ? Number(goal.depreciationRate) : undefined,
          downPaymentRatio: goal.downPaymentRatio ? Number(goal.downPaymentRatio) : undefined,
        }));
        setGoals(processedGoals);
      }

      // Fetch or create current month snapshot for trends
      await fetchCurrentSnapshot();

      // Calculate proper accumulated balance based on the FETCHED data (not stale React state)
      if (processedIncome.length > 0 || processedExpenses.length > 0) {
        const balanceCalculation = calculateAccumulatedBalance(
          fetchedStartingBalance, // Use fetched starting balance
          processedIncome,        // Use locally fetched data
          processedExpenses       // Use locally fetched data
        );
        
        // Update the calculated current balance
        setCurrentBalance(balanceCalculation.currentCalculatedBalance);
        
        console.log('💰 Balance Calculation (Fixed):', {
          startingBalance: fetchedStartingBalance,
          calculatedBalance: balanceCalculation.currentCalculatedBalance,
          totalAccumulatedIncome: balanceCalculation.totalAccumulatedIncome,
          totalAccumulatedExpenses: balanceCalculation.totalAccumulatedExpenses,
          incomeStreamsCount: processedIncome.length,
          expensesCount: processedExpenses.length,
          monthlyBreakdown: balanceCalculation.monthlyBreakdown
        });
      } else {
        // No income/expenses yet, current balance = starting balance
        setCurrentBalance(fetchedStartingBalance);
        console.log('💰 Balance Set to Starting Balance:', fetchedStartingBalance);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch current month snapshot for trend data
  const fetchCurrentSnapshot = async () => {
    try {
      // First try to create/update current snapshot
      const createResponse = await fetch('/api/snapshots', {
        method: 'POST',
      });
      
      if (createResponse.ok) {
        const snapshot = await createResponse.json();
        setCurrentSnapshot(snapshot);
      }
    } catch (error) {
      console.error('Error fetching current snapshot:', error);
      // Set default values to prevent NaN
      setCurrentSnapshot({
        id: 'default',
        month: new Date(),
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        burnRate: 0,
        savingsRate: 0,
        healthScore: 0,
        startingBalance: 0,
        endingBalance: 0,
        balanceChange: 0,
        balanceChangePercent: null,
        incomeChangePercent: null,
        expenseChangePercent: null,
        savingsChangePercent: null,
        healthScoreChange: null,
      });
    }
  };

  // Initialize with user data when user is available
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchUserData();
    }
  }, [user?.id, authLoading]);

  // Safe calculations with fallbacks to prevent NaN
  const safeMonthlyIncome = isNaN(monthlyIncome) ? 0 : monthlyIncome;
  const safeMonthlyExpenses = isNaN(monthlyExpenses) ? 0 : monthlyExpenses;
  const safeBurnRate = isNaN(burnRate) ? 0 : burnRate;
  const safeSavingsRate = isNaN(savingsRate) ? 0 : savingsRate;
  const safeHealthScore = isNaN(healthScore) ? 0 : healthScore;
  const safeTotalSavings = safeMonthlyIncome - safeMonthlyExpenses;

  // Helper function to format trend data
  const formatTrend = (changePercent: number | null, label: string) => {
    if (changePercent === null || changePercent === 0) {
      return undefined;
    }
    return {
      value: Math.abs(changePercent),
      label,
      type: changePercent > 0 ? 'positive' as const : 'negative' as const
    };
  };

  // Goal CRUD operations
  const handleCreateGoal = async (formData: any) => {
    setGoalModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Filter data to match the createGoalSchema
      const goalData = {
        name: formData.name,
        description: formData.description,
        targetAmount: formData.targetAmount,
        targetDate: new Date(formData.targetDate),
        priority: formData.priority,
        category: formData.category,
      };

      console.log('🎯 Sending goal data to API:', goalData);
      console.log('📅 Target date type:', typeof goalData.targetDate, goalData.targetDate);
      console.log('🖼️ Has image:', !!formData.image);

      let response: Response;

      if (formData.image) {
        // Handle multipart form data for image upload
        const formDataToSend = new FormData();
        
        // Add goal data as JSON string
        formDataToSend.append('goalData', JSON.stringify({
          ...goalData,
          targetDate: goalData.targetDate.toISOString(),
        }));
        
        // Add image file
        formDataToSend.append('image', formData.image);
        
        console.log('📤 Sending multipart form data with image');
        
        response = await fetch('/api/goals', {
          method: 'POST',
          body: formDataToSend, // Don't set Content-Type header, let browser set it
        });
      } else {
        // Handle regular JSON data without image
        console.log('📤 Sending JSON data without image');
        
        response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...goalData,
            targetDate: goalData.targetDate.toISOString(),
          }),
        });
      }

      console.log('📡 API response status:', response.status);

      if (response.ok) {
        const newGoal = await response.json();
        // Ensure dates are properly converted
        const processedGoal = {
          ...newGoal,
          targetDate: new Date(newGoal.targetDate),
          createdAt: new Date(newGoal.createdAt),
          updatedAt: new Date(newGoal.updatedAt),
          targetAmount: Number(newGoal.targetAmount),
          currentAmount: Number(newGoal.currentAmount),
          initialAssetPrice: newGoal.initialAssetPrice ? Number(newGoal.initialAssetPrice) : undefined,
          depreciationRate: newGoal.depreciationRate ? Number(newGoal.depreciationRate) : undefined,
          downPaymentRatio: newGoal.downPaymentRatio ? Number(newGoal.downPaymentRatio) : undefined,
        };
        addGoal(processedGoal);
        
        // Show success toast with different messages for image upload
        if (formData.image && newGoal.imageUrl) {
          toast.success(`🎯📸 Goal "${formData.name}" created with image uploaded successfully!`, {
            duration: 6000,
          });
        } else if (formData.image && !newGoal.imageUrl) {
          toast.success(`🎯 Goal "${formData.name}" created successfully!`, {
            duration: 5000,
          });
          toast.error('⚠️ Image upload failed, but goal was created', {
            duration: 4000,
          });
        } else {
          toast.success(`🎯 Goal "${formData.name}" created successfully!`, {
            duration: 5000,
          });
        }
        
        setGoalModal({ isOpen: false, goal: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);
        toast.error(`Failed to create goal: ${errorData.error || 'Unknown error'}`);
        throw new Error(`Failed to create goal: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal. Please try again.');
      setGoalModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleUpdateGoal = async (formData: any) => {
    if (!goalModal.goal) return;
    
    setGoalModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      let response: Response;

      if (formData.image) {
        // Handle multipart form data for image upload
        const formDataToSend = new FormData();
        
        // Add goal data as JSON string
        formDataToSend.append('goalData', JSON.stringify({
          ...formData,
          targetDate: new Date(formData.targetDate).toISOString(),
        }));
        
        // Add image file
        formDataToSend.append('image', formData.image);
        
        console.log('📤 Updating goal with image upload');
        
        response = await fetch(`/api/goals/${goalModal.goal.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Handle regular JSON data without image
        response = await fetch(`/api/goals/${goalModal.goal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            targetDate: new Date(formData.targetDate).toISOString(),
          }),
        });
      }

      console.log('📡 API response status:', response.status);
      console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseText = await response.text();
        console.log('📡 Raw response text:', responseText);
        
        let updatedGoal;
        try {
          updatedGoal = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          console.error('❌ Response text that failed to parse:', responseText);
          toast.error('Server returned invalid response. Please check the console for details.');
          throw new Error('Invalid JSON response from server');
        }
        
        // Ensure dates are properly converted
        const processedGoal = {
          ...updatedGoal,
          targetDate: new Date(updatedGoal.targetDate),
          createdAt: new Date(updatedGoal.createdAt),
          updatedAt: new Date(updatedGoal.updatedAt),
          targetAmount: Number(updatedGoal.targetAmount),
          currentAmount: Number(updatedGoal.currentAmount),
          initialAssetPrice: updatedGoal.initialAssetPrice ? Number(updatedGoal.initialAssetPrice) : undefined,
          depreciationRate: updatedGoal.depreciationRate ? Number(updatedGoal.depreciationRate) : undefined,
          downPaymentRatio: updatedGoal.downPaymentRatio ? Number(updatedGoal.downPaymentRatio) : undefined,
        };
        updateGoal(goalModal.goal.id, processedGoal);
        
        // Show success toast with different messages for image upload
        if (formData.image && updatedGoal.imageUrl) {
          toast.success(`✅📸 Goal "${formData.name}" updated with new image uploaded successfully!`);
        } else if (formData.image && !updatedGoal.imageUrl) {
          toast.success(`✅ Goal "${formData.name}" updated successfully!`);
          toast.error('⚠️ Image upload failed, but goal was updated', {
            duration: 4000,
          });
        } else {
          toast.success(`✅ Goal "${formData.name}" updated successfully!`);
        }
        
        setGoalModal({ isOpen: false, goal: undefined, isSubmitting: false });
      } else {
        const responseText = await response.text();
        console.error('❌ API error response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Error response is not JSON:', responseText);
          toast.error(`Server error (${response.status}): ${responseText}`);
          throw new Error(`Server returned ${response.status}: ${responseText}`);
        }
        
        toast.error(`Failed to update goal: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      if (error instanceof Error && error.message.includes('JSON')) {
        toast.error('Server returned invalid response. Please try again or check console for details.');
      } else {
        toast.error('Failed to update goal. Please try again.');
      }
      setGoalModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeGoal(goalId);
        toast.success('🗑️ Goal deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete goal: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal. Please try again.');
      throw error;
    }
  };

  const handleGoalSubmit = async (formData: any) => {
    if (goalModal.goal) {
      await handleUpdateGoal(formData);
    } else {
      await handleCreateGoal(formData);
    }
  };

  // Income Stream CRUD operations
  const handleCreateIncomeStream = async (formData: any) => {
    setIncomeStreamModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newIncomeStream = await response.json();
        addIncomeStream(newIncomeStream);
        toast.success(`💰 Income stream "${formData.name}" added successfully!`);
        setIncomeStreamModal({ isOpen: false, incomeStream: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create income stream: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to create income stream');
      }
    } catch (error) {
      console.error('Error creating income stream:', error);
      toast.error('Failed to create income stream. Please try again.');
      setIncomeStreamModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleUpdateIncomeStream = async (formData: any) => {
    if (!incomeStreamModal.incomeStream) return;
    
    setIncomeStreamModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch(`/api/income/${incomeStreamModal.incomeStream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedIncomeStream = await response.json();
        updateIncomeStream(incomeStreamModal.incomeStream.id, updatedIncomeStream);
        toast.success(`✅ Income stream "${formData.name}" updated successfully!`);
        setIncomeStreamModal({ isOpen: false, incomeStream: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update income stream: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update income stream');
      }
    } catch (error) {
      console.error('Error updating income stream:', error);
      toast.error('Failed to update income stream. Please try again.');
      setIncomeStreamModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteIncomeStream = async (incomeStreamId: string) => {
    try {
      const response = await fetch(`/api/income/${incomeStreamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeIncomeStream(incomeStreamId);
        toast.success('🗑️ Income stream deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete income stream: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to delete income stream');
      }
    } catch (error) {
      console.error('Error deleting income stream:', error);
      toast.error('Failed to delete income stream. Please try again.');
      throw error;
    }
  };

  const handleIncomeStreamSubmit = async (formData: any) => {
    if (incomeStreamModal.incomeStream) {
      await handleUpdateIncomeStream(formData);
    } else {
      await handleCreateIncomeStream(formData);
    }
  };

  // Toggle income stream active status (temporary deactivation)
  const handleToggleIncomeStreamStatus = async (incomeStreamId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/income/${incomeStreamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        const updatedIncomeStream = await response.json();
        updateIncomeStream(incomeStreamId, updatedIncomeStream);
        toast.success(`✅ Income stream ${newStatus ? 'reactivated' : 'deactivated'} successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update income stream: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update income stream status');
      }
    } catch (error) {
      console.error('Error updating income stream status:', error);
      toast.error('Failed to update income stream status. Please try again.');
    }
  };

  // End income stream (set end date to today)
  const handleEndIncomeStream = async (incomeStreamId: string, streamName: string) => {
    const confirmEnd = confirm(`Are you sure you want to end "${streamName}"? This will stop generating new entries after today.`);
    if (!confirmEnd) return;

    try {
      const response = await fetch(`/api/income/${incomeStreamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: false,
          endDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedIncomeStream = await response.json();
        updateIncomeStream(incomeStreamId, updatedIncomeStream);
        toast.success(`💰 Income stream "${streamName}" ended successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to end income stream: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to end income stream');
      }
    } catch (error) {
      console.error('Error ending income stream:', error);
      toast.error('Failed to end income stream. Please try again.');
    }
  };

  // Expense CRUD operations
  const handleCreateExpense = async (formData: any) => {
    setExpenseModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newExpense = await response.json();
        addExpense(newExpense);
        toast.success(`💸 Expense "${formData.name}" added successfully!`);
        setExpenseModal({ isOpen: false, expense: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create expense: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense. Please try again.');
      setExpenseModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleUpdateExpense = async (formData: any) => {
    if (!expenseModal.expense) return;
    
    setExpenseModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch(`/api/expenses/${expenseModal.expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        updateExpense(expenseModal.expense.id, updatedExpense);
        toast.success(`✅ Expense "${formData.name}" updated successfully!`);
        setExpenseModal({ isOpen: false, expense: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update expense: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
      setExpenseModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Toggle expense active status (temporary deactivation)
  const handleToggleExpenseStatus = async (expenseId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        updateExpense(expenseId, updatedExpense);
        toast.success(`✅ Expense ${newStatus ? 'reactivated' : 'deactivated'} successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update expense: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update expense status');
      }
    } catch (error) {
      console.error('Error updating expense status:', error);
      toast.error('Failed to update expense status. Please try again.');
    }
  };

  // End expense (set end date to today)
  const handleEndExpense = async (expenseId: string, expenseName: string) => {
    const confirmEnd = confirm(`Are you sure you want to end "${expenseName}"? This will stop generating new entries after today.`);
    if (!confirmEnd) return;

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: false,
          endDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        updateExpense(expenseId, updatedExpense);
        toast.success(`💸 Expense "${expenseName}" ended successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to end expense: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to end expense');
      }
    } catch (error) {
      console.error('Error ending expense:', error);
      toast.error('Failed to end expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeExpense(expenseId);
        toast.success('🗑️ Expense deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete expense: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
      throw error;
    }
  };

  const handleExpenseSubmit = async (formData: any) => {
    if (expenseModal.expense) {
      await handleUpdateExpense(formData);
    } else {
      await handleCreateExpense(formData);
    }
  };

  // Contribution CRUD operations
  const handleCreateContribution = async (formData: any) => {
    if (!contributionModal.goal) return;
    
    setContributionModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch(`/api/goals/${contributionModal.goal.id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { contribution, goal: updatedGoal } = await response.json();
        
        // Update the goal in the store with the new data
        updateGoal(contributionModal.goal.id, updatedGoal);
        
        // Show success toast
        if (updatedGoal.isCompleted) {
          toast.success(`🎉 Congratulations! Goal "${updatedGoal.name}" is now complete!`, {
            duration: 8000,
          });
        } else {
          toast.success(`💰 Contribution of ${formatCurrency(contribution.amount)} added successfully!`, {
            duration: 5000,
          });
        }
        
        setContributionModal({ isOpen: false, goal: undefined, isSubmitting: false });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add contribution: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to add contribution');
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution. Please try again.');
      setContributionModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteContribution = async (contributionId: string) => {
    if (!goalDetailsModal.goal) return;
    
    setIsDeletingContribution(contributionId);
    
    try {
      const response = await fetch(`/api/goals/${goalDetailsModal.goal.id}/contributions/${contributionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const { contribution, goal: updatedGoal } = await response.json();
        
        console.log('🗑️ Contribution deleted successfully:', {
          deletedContribution: contribution,
          updatedGoal: updatedGoal,
          originalGoal: goalDetailsModal.goal
        });
        
        // Update the goal in the store with the updated data
        const processedGoal = {
          ...updatedGoal,
          targetDate: new Date(updatedGoal.targetDate),
          createdAt: new Date(updatedGoal.createdAt),
          updatedAt: new Date(updatedGoal.updatedAt),
          targetAmount: Number(updatedGoal.targetAmount),
          currentAmount: Number(updatedGoal.currentAmount),
          initialAssetPrice: updatedGoal.initialAssetPrice ? Number(updatedGoal.initialAssetPrice) : undefined,
          depreciationRate: updatedGoal.depreciationRate ? Number(updatedGoal.depreciationRate) : undefined,
          downPaymentRatio: updatedGoal.downPaymentRatio ? Number(updatedGoal.downPaymentRatio) : undefined,
        };
        
        console.log('📝 Processed goal for store update:', processedGoal);
        
        // Update the goal in the store
        updateGoal(goalDetailsModal.goal.id, processedGoal);
        
        // Update the goal details modal with the updated goal to keep it in sync
        setGoalDetailsModal(prev => ({ ...prev, goal: processedGoal }));
        
        console.log('✅ Goal updated in store and modal state');
        
        toast.success(`🗑️ Contribution of ${formatCurrency(contribution.amount)} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);
        toast.error(`Failed to delete contribution: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to delete contribution');
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      toast.error('Failed to delete contribution. Please try again.');
    } finally {
      setIsDeletingContribution('');
    }
  };

  // Modal control functions
  const openCreateGoalModal = () => {
    setGoalModal({ isOpen: true, goal: undefined, isSubmitting: false });
  };

  const openEditGoalModal = (goal: Goal) => {
    setGoalModal({ isOpen: true, goal, isSubmitting: false });
  };

  const closeGoalModal = () => {
    setGoalModal({ isOpen: false, goal: undefined, isSubmitting: false });
  };

  const openCreateIncomeStreamModal = () => {
    setIncomeStreamModal({ isOpen: true, incomeStream: undefined, isSubmitting: false });
  };

  const openEditIncomeStreamModal = (incomeStream: IncomeStream) => {
    setIncomeStreamModal({ isOpen: true, incomeStream, isSubmitting: false });
  };

  const closeIncomeStreamModal = () => {
    setIncomeStreamModal({ isOpen: false, incomeStream: undefined, isSubmitting: false });
  };

  const openCreateExpenseModal = () => {
    setExpenseModal({ isOpen: true, expense: undefined, isSubmitting: false });
  };

  const openEditExpenseModal = (expense: Expense) => {
    setExpenseModal({ isOpen: true, expense, isSubmitting: false });
  };

  const closeExpenseModal = () => {
    setExpenseModal({ isOpen: false, expense: undefined, isSubmitting: false });
  };

  const openContributionModal = (goal: Goal) => {
    setContributionModal({ isOpen: true, goal, isSubmitting: false });
  };

  const closeContributionModal = () => {
    setContributionModal({ isOpen: false, goal: undefined, isSubmitting: false });
  };

  const openGoalDetailsModal = (goal: Goal) => {
    setGoalDetailsModal({ isOpen: true, goal });
  };

  const closeGoalDetailsModal = () => {
    setGoalDetailsModal({ isOpen: false, goal: undefined });
  };

  // Starting balance update handlers (one-time setup)
  const openStartingBalanceModal = () => {
    setBalanceUpdateModal({ isOpen: true, isSubmitting: false });
  };

  const closeStartingBalanceModal = () => {
    setBalanceUpdateModal({ isOpen: false, isSubmitting: false });
  };

  const handleUpdateStartingBalance = async (formData: { balance: number; notes?: string }) => {
    setBalanceUpdateModal(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingBalance: formData.balance, notes: formData.notes }),
      });

      if (response.ok) {
        const result = await response.json();
        setStartingBalance(result.startingBalance);
        // Recalculate current balance with new starting balance
        await fetchUserData();
        toast.success(`💰 Starting balance set to ${formatCurrency(result.startingBalance)}!`);
        closeStartingBalanceModal();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update starting balance: ${errorData.error || 'Unknown error'}`);
        throw new Error('Failed to update starting balance');
      }
    } catch (error) {
      console.error('Error updating starting balance:', error);
      toast.error('Failed to update starting balance. Please try again.');
      setBalanceUpdateModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  // Delete confirmation handlers
  const openDeleteConfirmation = (type: 'goal' | 'income' | 'expense', itemId: string, itemName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      itemId,
      itemName,
      isDeleting: false,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: 'goal',
      itemId: '',
      itemName: '',
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
    
    try {
      if (deleteConfirmation.type === 'goal') {
        await handleDeleteGoal(deleteConfirmation.itemId);
      } else if (deleteConfirmation.type === 'income') {
        await handleDeleteIncomeStream(deleteConfirmation.itemId);
      } else if (deleteConfirmation.type === 'expense') {
        await handleDeleteExpense(deleteConfirmation.itemId);
      }
      closeDeleteConfirmation();
    } catch (error) {
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Action confirmation handlers
  const openActionConfirmation = (
    type: 'income' | 'expense',
    action: 'toggle' | 'end' | 'edit',
    itemId: string,
    itemName: string,
    currentStatus?: boolean
  ) => {
    setActionConfirmation({
      isOpen: true,
      type,
      action,
      itemId,
      itemName,
      currentStatus,
      isProcessing: false,
    });
  };

  const closeActionConfirmation = () => {
    setActionConfirmation({
      isOpen: false,
      type: 'goal',
      action: 'toggle',
      itemId: '',
      itemName: '',
      currentStatus: undefined,
      isProcessing: false,
    });
  };

  const confirmAction = async () => {
    setActionConfirmation(prev => ({ ...prev, isProcessing: true }));
    
    try {
      if (actionConfirmation.action === 'toggle') {
        if (actionConfirmation.type === 'income') {
          await handleToggleIncomeStreamStatus(actionConfirmation.itemId, !actionConfirmation.currentStatus);
        } else if (actionConfirmation.type === 'expense') {
          await handleToggleExpenseStatus(actionConfirmation.itemId, !actionConfirmation.currentStatus);
        }
      } else if (actionConfirmation.action === 'end') {
        if (actionConfirmation.type === 'income') {
          await handleEndIncomeStream(actionConfirmation.itemId, actionConfirmation.itemName);
        } else if (actionConfirmation.type === 'expense') {
          await handleEndExpense(actionConfirmation.itemId, actionConfirmation.itemName);
        }
      } else if (actionConfirmation.action === 'edit') {
        // For edit, we'll just open the edit modal
        if (actionConfirmation.type === 'income') {
          const stream = incomeStreams.find(s => s.id === actionConfirmation.itemId);
          if (stream) openEditIncomeStreamModal(stream);
        } else if (actionConfirmation.type === 'expense') {
          const expense = expenses.find(e => e.id === actionConfirmation.itemId);
          if (expense) openEditExpenseModal(expense);
        }
      }
      closeActionConfirmation();
    } catch (error) {
      setActionConfirmation(prev => ({ ...prev, isProcessing: false }));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => {
                // TODO: Implement mobile sidebar toggle
                console.log('Toggle mobile menu');
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
                Welcome back, {user.name || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
                Track your wealth-building journey with real-time insights
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs lg:text-sm text-muted-foreground">Last updated</div>
            <div className="text-xs lg:text-sm font-medium">Just now</div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="space-y-4">
          {/* Header with Edit Starting Balance Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Financial Overview</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={openStartingBalanceModal}
              className="flex items-center space-x-2 bg-white/50 hover:bg-white/70 border-gray-200/60 backdrop-blur-sm"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Starting Balance</span>
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <DashboardCard
              title="Current Balance"
              value={formatCurrency(currentBalance, 'MYR', { 
                placeholder: 'Set starting balance' 
              })}
              subtitle={`Auto-calculated (Start: ${formatCurrency(startingBalance)})`}
              trend={currentSnapshot?.balanceChangePercent ? {
                value: Math.abs(currentSnapshot.balanceChangePercent),
                label: "vs last month",
                type: currentSnapshot.balanceChangePercent > 0 ? "positive" : "negative"
              } : undefined}
              badge={{
                text: startingBalance === 0 ? "Setup needed" :
                      currentBalance > safeMonthlyExpenses * 3 ? "Healthy" : 
                      currentBalance > safeMonthlyExpenses ? "Building" : 
                      currentBalance > 0 ? "Low" : "Critical",
                variant: startingBalance === 0 ? "secondary" :
                        currentBalance > safeMonthlyExpenses * 3 ? "default" : "secondary"
              }}
              icon={<Wallet className="h-4 w-4" />}
              onClick={openStartingBalanceModal}
            />
            
            <DashboardCard
              title="Monthly Income"
              value={formatCurrency(safeMonthlyIncome, 'MYR', { 
                placeholder: 'No income data' 
              })}
              subtitle={`${incomeStreams.length} active streams`}
              trend={formatTrend(currentSnapshot?.incomeChangePercent ?? null, "vs last month")}
              badge={{
                text: safeMonthlyIncome > 5000 ? "Strong" : 
                      safeMonthlyIncome > 0 ? "Building" : "Setup needed",
                variant: safeMonthlyIncome > 5000 ? "default" : "secondary"
              }}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Monthly Expenses"
              value={formatCurrency(safeMonthlyExpenses, 'MYR', { 
                placeholder: 'No expense data' 
              })}
              subtitle="Including all categories"
              trend={formatTrend(currentSnapshot?.expenseChangePercent ? -currentSnapshot.expenseChangePercent : null, "vs last month")}
              badge={{
                text: safeBurnRate < 50 ? "Controlled" : 
                      safeBurnRate > 0 ? "Monitor" : "Setup needed",
                variant: safeBurnRate < 50 && safeBurnRate > 0 ? "default" : "secondary"
              }}
              icon={<TrendingDown className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Monthly Savings"
              value={formatCurrency(safeTotalSavings, 'MYR', { 
                placeholder: 'Complete setup' 
              })}
              subtitle={`${formatPercentage(safeSavingsRate)} savings rate`}
              trend={formatTrend(currentSnapshot?.savingsChangePercent ?? null, "vs last month")}
              badge={{
                text: safeSavingsRate > 20 ? "Excellent" : 
                      safeSavingsRate > 10 ? "Good" : 
                      safeSavingsRate > 0 ? "Improve" : "Setup needed",
                variant: safeSavingsRate > 20 ? "default" : "secondary"
              }}
              icon={<Wallet className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Health Score"
              value={`${safeHealthScore}/100`}
              subtitle="Financial wellness"
              trend={currentSnapshot?.healthScoreChange ? {
                value: Math.abs(currentSnapshot.healthScoreChange),
                label: "vs last month",
                type: currentSnapshot.healthScoreChange > 0 ? "positive" : "negative"
              } : undefined}
              badge={{
                text: safeHealthScore > 70 ? "Great" : 
                      safeHealthScore > 50 ? "Good" : 
                      safeHealthScore > 0 ? "Needs Attention" : "Setup needed",
                variant: safeHealthScore > 70 ? "default" : "secondary"
              }}
              icon={<Target className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Goals Progress */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Active Goals
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {activeGoals.length} Goals Active
              </Badge>
              <Button onClick={openCreateGoalModal} className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/95 hover:to-primary/85 shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>
          
          {activeGoals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="relative group">
                  <GoalProgressCard
                    goal={goal}
                    onAddContribution={() => openContributionModal(goal)}
                    onViewDetails={() => openGoalDetailsModal(goal)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditGoalModal(goal)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteConfirmation('goal', goal.id, goal.name)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="metric-card">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your wealth-building journey by setting your first financial goal.
                </p>
                <Button onClick={openCreateGoalModal} className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/95 hover:to-primary/85 shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Recurring Finance */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Active Recurring Finance
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                {incomeStreams.filter(s => s.isActive).length} Income Sources
              </Badge>
              <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
                {expenses.filter(e => e.isActive).length} Expenses
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Streams */}
            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Income Streams</span>
                  </div>
                  <Button size="sm" onClick={openCreateIncomeStreamModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeStreams.length > 0 ? (
                  <div className="space-y-3">
                    {incomeStreams.map((stream) => (
                      <div key={stream.id} className="group border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stream.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium truncate">{stream.name}</span>
                                {!stream.isActive && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">Inactive</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{stream.type} • {stream.frequency}</div>
                              {stream.earnedDate && (
                                <div className="text-xs text-muted-foreground">
                                  Since: {new Date(stream.earnedDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <span className="font-semibold text-sm">{formatCurrency(stream.actualMonthly || stream.expectedMonthly)}</span>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                        </div>
                        
                        {/* Action buttons - shown on hover */}
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('income', 'edit', stream.id, stream.name)}
                            className="h-7 w-7 p-0 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('income', 'toggle', stream.id, stream.name, stream.isActive)}
                            className={`h-7 w-7 p-0 ${stream.isActive ? 'hover:bg-orange-100' : 'hover:bg-green-100'}`}
                            title={stream.isActive ? "Deactivate temporarily" : "Reactivate"}
                          >
                            {stream.isActive ? <AlertCircle className="h-3 w-3 text-orange-600" /> : <Activity className="h-3 w-3 text-green-600" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('income', 'end', stream.id, stream.name)}
                            className="h-7 w-7 p-0 hover:bg-yellow-100"
                            title="End income source"
                          >
                            <DollarSign className="h-3 w-3 text-yellow-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteConfirmation('income', stream.id, stream.name)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-red-100"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-3">No income streams added yet.</p>
                    <Button variant="outline" onClick={openCreateIncomeStreamModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income Stream
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span>Monthly Expenses</span>
                  </div>
                  <Button size="sm" onClick={openCreateExpenseModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="group border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${expense.isActive ? 'bg-red-500' : 'bg-gray-400'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium truncate">{expense.name}</span>
                                {!expense.isActive && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">Inactive</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{expense.category} • {expense.type}</div>
                              {expense.incurredDate && (
                                <div className="text-xs text-muted-foreground">
                                  Since: {new Date(expense.incurredDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <span className="font-semibold text-sm">{formatCurrency(expense.amount)}</span>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                        </div>
                        
                        {/* Action buttons - shown on hover */}
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('expense', 'edit', expense.id, expense.name)}
                            className="h-7 w-7 p-0 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('expense', 'toggle', expense.id, expense.name, expense.isActive)}
                            className={`h-7 w-7 p-0 ${expense.isActive ? 'hover:bg-orange-100' : 'hover:bg-green-100'}`}
                            title={expense.isActive ? "Deactivate temporarily" : "Reactivate"}
                          >
                            {expense.isActive ? <AlertCircle className="h-3 w-3 text-orange-600" /> : <Activity className="h-3 w-3 text-green-600" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionConfirmation('expense', 'end', expense.id, expense.name)}
                            className="h-7 w-7 p-0 hover:bg-yellow-100"
                            title="End expense"
                          >
                            <CreditCard className="h-3 w-3 text-yellow-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteConfirmation('expense', expense.id, expense.name)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-red-100"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <TrendingDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-3">No expenses added yet.</p>
                    <Button variant="outline" className="mt-2" onClick={openCreateExpenseModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lifestyle Analysis */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Lifestyle Analysis
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Burn Rate"
              value={`${burnRate.toFixed(1)}%`}
              subtitle="Expenses vs income"
              trend={{
                value: -2.1,
                label: "vs last month",
                type: "positive"
              }}
              badge={{
                text: burnRate < 40 ? "Healthy" : burnRate < 60 ? "Moderate" : "High",
                variant: burnRate < 40 ? "default" : burnRate < 60 ? "secondary" : "destructive"
              }}
              icon={<Flame className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Required Income"
              value={formatCurrency(monthlyExpenses / 0.8)}
              subtitle="For current lifestyle"
              trend={{
                value: -5.2,
                label: "optimization",
                type: "positive"
              }}
              badge={{
                text: "Optimized",
                variant: "secondary"
              }}
              icon={<DollarSign className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Emergency Fund"
              value={`${Math.max(0, safeTotalSavings / monthlyExpenses).toFixed(1)} months`}
              subtitle="Current runway"
              trend={{
                value: 0.3,
                label: "vs target",
                type: "positive"
              }}
              badge={{
                text: safeTotalSavings / monthlyExpenses >= 6 ? "Complete" : "Building",
                variant: safeTotalSavings / monthlyExpenses >= 6 ? "default" : "secondary"
              }}
              icon={<Shield className="h-4 w-4" />}
            />
            
            <DashboardCard
              title="Debt Ratio"
              value="12.5%"
              subtitle="Debt to income"
              trend={{
                value: -8.3,
                label: "vs last year",
                type: "positive"
              }}
              badge={{
                text: "Low Risk",
                variant: "default"
              }}
              icon={<CreditCard className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Burn Rate Analysis */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Burn Rate Analysis
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Monthly Burn Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Current Burn Rate</span>
                    <span className="text-lg font-bold text-orange-500">{burnRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm font-medium">Recommended Max</span>
                    <span className="text-lg font-bold text-green-500">50%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-sm font-medium">Optimal Range</span>
                    <span className="text-lg font-bold text-blue-500">30-40%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  <span>Lifestyle Projections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>If income drops 20%</span>
                      <span className="font-semibold text-red-500">{((monthlyExpenses / (monthlyIncome * 0.8)) * 100).toFixed(1)}% burn</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>If expenses rise 15%</span>
                      <span className="font-semibold text-orange-500">{(((monthlyExpenses * 1.15) / monthlyIncome) * 100).toFixed(1)}% burn</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Emergency fund runway</span>
                      <span className="font-semibold text-green-500">{Math.max(0, safeTotalSavings / monthlyExpenses).toFixed(1)} months</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      Income needed for 6-month emergency fund:
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(monthlyExpenses * 6)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Lifestyle Analysis */}
          <div className="mt-8">
            <LifestyleAnalysisCard 
              title="Comprehensive Lifestyle Analysis"
              data={{
                requiredIncome: (monthlyExpenses / 0.8), // 20% savings rate
                currentIncome: monthlyIncome,
                emergencyRunwayMonths: Math.max(0, safeTotalSavings / monthlyExpenses),
                burnRate: burnRate,
                scenarios: {
                  current: burnRate,
                  incomeDown20: (monthlyExpenses / (monthlyIncome * 0.8)) * 100,
                  incomeDown30: (monthlyExpenses / (monthlyIncome * 0.7)) * 100,
                  expensesUp15: ((monthlyExpenses * 1.15) / monthlyIncome) * 100,
                  expensesUp25: ((monthlyExpenses * 1.25) / monthlyIncome) * 100,
                },
                affordability: burnRate < 40 ? 'excellent' : burnRate < 60 ? 'good' : burnRate < 80 ? 'tight' : 'stressed',
                riskLevel: burnRate < 40 ? 'low' : burnRate < 60 ? 'moderate' : burnRate < 80 ? 'high' : 'critical',
                recommendations: [
                  burnRate > 60 ? 'Consider reducing monthly expenses' : 'Maintain current spending habits',
                  safeTotalSavings / monthlyExpenses < 3 ? 'Build emergency fund to 3-6 months' : 'Emergency fund is healthy',
                  incomeStreams.length < 2 ? 'Diversify income sources for stability' : 'Good income diversification',
                  savingsRate < 20 ? 'Increase savings rate to 20%+' : 'Excellent savings discipline',
                ]
              }}
              incomeStreams={incomeStreams}
              expenses={expenses}
            />
          </div>
        </div>

        {/* Balance Projections */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Balance Projections
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Financial Runway</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Current Balance</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-sm font-medium">Monthly Net Flow</span>
                    <span className={`text-lg font-bold ${safeTotalSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {safeTotalSavings >= 0 ? '+' : ''}{formatCurrency(safeTotalSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                    <span className="text-sm font-medium">Runway (Current Expenses)</span>
                    <span className="text-lg font-bold text-orange-500">
                      {safeMonthlyExpenses > 0 ? `${(currentBalance / safeMonthlyExpenses).toFixed(1)} months` : '∞'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-green-500" />
                  <span>Next 6 Months Projection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 6].map((month) => {
                    const projectedBalance = currentBalance + (safeTotalSavings * month);
                    const monthName = new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
                    return (
                      <div key={month} className="flex justify-between text-sm">
                        <span>{monthName}</span>
                        <span className={`font-semibold ${projectedBalance >= currentBalance ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(projectedBalance)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Projected 6-month balance:
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(currentBalance + (safeTotalSavings * 6))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={goalModal.isOpen}
        onClose={closeGoalModal}
        goal={goalModal.goal}
        onSubmit={handleGoalSubmit}
        isSubmitting={goalModal.isSubmitting}
      />

      {/* Income Stream Modal */}
      <IncomeStreamModal
        isOpen={incomeStreamModal.isOpen}
        onClose={closeIncomeStreamModal}
        incomeStream={incomeStreamModal.incomeStream}
        onSubmit={handleIncomeStreamSubmit}
        isSubmitting={incomeStreamModal.isSubmitting}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={expenseModal.isOpen}
        onClose={closeExpenseModal}
        expense={expenseModal.expense}
        onSubmit={handleExpenseSubmit}
        isSubmitting={expenseModal.isSubmitting}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={contributionModal.isOpen}
        onClose={closeContributionModal}
        goal={contributionModal.goal}
        onSubmit={handleCreateContribution}
        isSubmitting={contributionModal.isSubmitting}
      />

      {/* Goal Details Modal */}
      <GoalDetailsModal
        isOpen={goalDetailsModal.isOpen}
        onClose={closeGoalDetailsModal}
        goal={goalDetailsModal.goal}
        onAddContribution={() => {
          closeGoalDetailsModal();
          if (goalDetailsModal.goal) {
            openContributionModal(goalDetailsModal.goal);
          }
        }}
        onEdit={() => {
          closeGoalDetailsModal();
          if (goalDetailsModal.goal) {
            openEditGoalModal(goalDetailsModal.goal);
          }
        }}
        onDeleteContribution={handleDeleteContribution}
        isDeletingContribution={isDeletingContribution}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1)}`}
        message={`Are you sure you want to delete this ${deleteConfirmation.type}? This will permanently remove all associated data.`}
        itemName={deleteConfirmation.itemName}
        isDeleting={deleteConfirmation.isDeleting}
        type={deleteConfirmation.type}
      />

      {/* Action Confirmation Modal */}
      {actionConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              {actionConfirmation.action === 'edit' && <Edit className="h-6 w-6 text-blue-500" />}
              {actionConfirmation.action === 'toggle' && (
                actionConfirmation.currentStatus ? 
                <AlertCircle className="h-6 w-6 text-orange-500" /> : 
                <Activity className="h-6 w-6 text-green-500" />
              )}
              {actionConfirmation.action === 'end' && (
                actionConfirmation.type === 'income' ? 
                <DollarSign className="h-6 w-6 text-yellow-500" /> : 
                <CreditCard className="h-6 w-6 text-yellow-500" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {actionConfirmation.action === 'edit' && `Edit ${actionConfirmation.type === 'income' ? 'Income Stream' : 'Expense'}`}
                {actionConfirmation.action === 'toggle' && 
                  `${actionConfirmation.currentStatus ? 'Deactivate' : 'Reactivate'} ${actionConfirmation.type === 'income' ? 'Income Stream' : 'Expense'}`
                }
                {actionConfirmation.action === 'end' && `End ${actionConfirmation.type === 'income' ? 'Income Stream' : 'Expense'}`}
              </h3>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="font-medium text-gray-900 dark:text-white">{actionConfirmation.itemName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{actionConfirmation.type}</p>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {actionConfirmation.action === 'edit' && 
                  `Do you want to edit "${actionConfirmation.itemName}"? This will open the edit form.`
                }
                {actionConfirmation.action === 'toggle' && actionConfirmation.currentStatus && 
                  `Are you sure you want to temporarily deactivate "${actionConfirmation.itemName}"? This will stop generating new entries but keep the ${actionConfirmation.type} record.`
                }
                {actionConfirmation.action === 'toggle' && !actionConfirmation.currentStatus && 
                  `Are you sure you want to reactivate "${actionConfirmation.itemName}"? This will resume generating new entries.`
                }
                {actionConfirmation.action === 'end' && 
                  `Are you sure you want to end "${actionConfirmation.itemName}"? This will stop generating new entries after today and set an end date.`
                }
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={closeActionConfirmation}
                className="flex-1"
                disabled={actionConfirmation.isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className={`flex-1 ${
                  actionConfirmation.action === 'edit' ? 'bg-blue-600 hover:bg-blue-700' :
                  actionConfirmation.action === 'toggle' && actionConfirmation.currentStatus ? 'bg-orange-600 hover:bg-orange-700' :
                  actionConfirmation.action === 'toggle' && !actionConfirmation.currentStatus ? 'bg-green-600 hover:bg-green-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                } text-white`}
                disabled={actionConfirmation.isProcessing}
              >
                {actionConfirmation.isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {actionConfirmation.action === 'edit' && 'Edit'}
                    {actionConfirmation.action === 'toggle' && (actionConfirmation.currentStatus ? 'Deactivate' : 'Reactivate')}
                    {actionConfirmation.action === 'end' && 'End'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Update Form */}
      {balanceUpdateModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <BalanceUpdateForm
              currentBalance={currentBalance}
              onSubmit={handleUpdateStartingBalance}
              onCancel={closeStartingBalanceModal}
              isSubmitting={balanceUpdateModal.isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
} 