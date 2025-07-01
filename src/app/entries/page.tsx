'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/calculations/index';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Search,
  GiftIcon,
  Loader,
  Utensils,
  Car,
  Home,
  Zap,
  ShoppingBag,
  Heart,
  Gamepad2,
  Briefcase,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface IncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category?: string;
  notes?: string;
  createdAt: Date;
  // For recurring entries
  incomeStream?: {
    id: string;
    name: string;
    type: string;
  };
  // For one-time entries
  isOneTime?: boolean;
}

interface ExpenseEntry {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category?: string;
  notes?: string;
  createdAt: Date;
  // For recurring entries
  expense?: {
    id: string;
    name: string;
    category: string;
  };
  // For one-time entries
  isOneTime?: boolean;
}

interface ApiRecurringIncomeEntry {
  id: string;
  amount: number;
  month: string;
  notes?: string;
  createdAt: string;
  incomeStream?: {
    id: string;
    name: string;
    type: string;
  };
}

interface ApiRecurringExpenseEntry {
  id: string;
  amount: number;
  month: string;
  notes?: string;
  createdAt: string;
  expense?: {
    id: string;
    name: string;
    category: string;
  };
}

interface ApiOneTimeIncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

interface ApiOneTimeExpenseEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export default function EntriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  
  // Data states
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'custom' | 'preset'>('preset');
  const [presetFilter, setPresetFilter] = useState<'current-month' | 'last-3-months' | 'last-6-months' | 'last-year' | 'all-time'>('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Form states
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showEditIncomeForm, setShowEditIncomeForm] = useState(false);
  const [showEditExpenseForm, setShowEditExpenseForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [isSubmittingIncome, setIsSubmittingIncome] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit states
  const [editingIncomeEntry, setEditingIncomeEntry] = useState<IncomeEntry | null>(null);
  const [editingExpenseEntry, setEditingExpenseEntry] = useState<ExpenseEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<{ id: string; name: string; type: 'income' | 'expense' } | null>(null);

  // Form data states
  const [incomeFormData, setIncomeFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'FREELANCE',
    notes: ''
  });
  
  const [expenseFormData, setExpenseFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'FOOD',
    notes: ''
  });

  const [editIncomeFormData, setEditIncomeFormData] = useState({
    name: '',
    amount: '',
    date: '',
    category: '',
    notes: ''
  });
  
  const [editExpenseFormData, setEditExpenseFormData] = useState({
    name: '',
    amount: '',
    date: '',
    category: '',
    notes: ''
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Helper function to build query string based on filter type
      const buildQueryString = () => {
        const params = new URLSearchParams();
        
        if (filterType === 'preset') {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          
          switch (presetFilter) {
            case 'current-month':
              params.append('year', currentYear.toString());
              params.append('month', currentMonth.toString());
              break;
            case 'last-3-months':
              // Fix: Calculate exactly 3 months ago
              const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
              params.append('startDate', threeMonthsAgo.toISOString().split('T')[0]);
              params.append('endDate', now.toISOString().split('T')[0]);
              break;
            case 'last-6-months':
              const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
              params.append('startDate', sixMonthsAgo.toISOString().split('T')[0]);
              params.append('endDate', now.toISOString().split('T')[0]);
              break;
            case 'last-year':
              const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);
              params.append('startDate', lastYear.toISOString().split('T')[0]);
              params.append('endDate', now.toISOString().split('T')[0]);
              break;
            case 'all-time':
              // No date filters for all-time
              break;
          }
        } else {
          // Custom date range
          if (customStartDate) {
            params.append('startDate', customStartDate);
          }
          if (customEndDate) {
            params.append('endDate', customEndDate);
          }
        }
        
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
      };

      // Fetch both recurring and one-time entries
      const [
        recurringIncomeRes, 
        recurringExpenseRes, 
        oneTimeIncomeRes, 
        oneTimeExpenseRes
      ] = await Promise.all([
        fetch(`/api/income-entries${buildQueryString()}`),
        fetch(`/api/expense-entries${buildQueryString()}`),
        fetch(`/api/one-time-income${buildQueryString()}`),
        fetch(`/api/one-time-expense${buildQueryString()}`)
      ]);

      // Process recurring income entries
      if (recurringIncomeRes.ok) {
        const recurringIncomeData = await recurringIncomeRes.json() as ApiRecurringIncomeEntry[];
        const formattedRecurringIncome = recurringIncomeData.map((entry: ApiRecurringIncomeEntry) => ({
          id: entry.id,
          name: entry.incomeStream?.name || 'Unknown Income Stream',
          amount: entry.amount,
          date: new Date(entry.month),
          category: entry.incomeStream?.type || 'OTHER',
          notes: entry.notes,
          createdAt: new Date(entry.createdAt),
          incomeStream: entry.incomeStream,
          isOneTime: false
        }));
        
        // Process one-time income entries
        let oneTimeIncomeData: IncomeEntry[] = [];
        if (oneTimeIncomeRes.ok) {
          const oneTimeData = await oneTimeIncomeRes.json() as ApiOneTimeIncomeEntry[];
          oneTimeIncomeData = oneTimeData.map((entry: ApiOneTimeIncomeEntry) => ({
            ...entry,
            date: new Date(entry.date),
            createdAt: new Date(entry.createdAt),
            isOneTime: true
          }));
        }
        
        // Combine both types
        setIncomeEntries([...formattedRecurringIncome, ...oneTimeIncomeData]);
      }

      // Process recurring expense entries
      if (recurringExpenseRes.ok) {
        const recurringExpenseData = await recurringExpenseRes.json() as ApiRecurringExpenseEntry[];
        const formattedRecurringExpenses = recurringExpenseData.map((entry: ApiRecurringExpenseEntry) => ({
          id: entry.id,
          name: entry.expense?.name || 'Unknown Expense',
          amount: entry.amount,
          date: new Date(entry.month),
          category: entry.expense?.category || 'OTHER',
          notes: entry.notes,
          createdAt: new Date(entry.createdAt),
          expense: entry.expense,
          isOneTime: false
        }));
        
        // Process one-time expense entries
        let oneTimeExpenseData: ExpenseEntry[] = [];
        if (oneTimeExpenseRes.ok) {
          const oneTimeData = await oneTimeExpenseRes.json() as ApiOneTimeExpenseEntry[];
          oneTimeExpenseData = oneTimeData.map((entry: ApiOneTimeExpenseEntry) => ({
            ...entry,
            date: new Date(entry.date),
            createdAt: new Date(entry.createdAt),
            isOneTime: true
          }));
        }
        
        // Combine both types
        setExpenseEntries([...formattedRecurringExpenses, ...oneTimeExpenseData]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filterType, presetFilter, customStartDate, customEndDate]);

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchData();
    }
  }, [user?.id, authLoading, fetchData]);

  // Create income entry
  const handleCreateIncomeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingIncome) return;
    
    setIsSubmittingIncome(true);
    
    try {
      const response = await fetch('/api/one-time-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incomeFormData,
          amount: parseFloat(incomeFormData.amount),
          date: incomeFormData.date,
        }),
      });

      if (response.ok) {
        toast.success('One-time income entry added successfully!');
        setShowIncomeForm(false);
        setIncomeFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'FREELANCE',
          notes: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create income entry');
      }
    } catch (error) {
      console.error('Error creating income entry:', error);
      toast.error('Failed to create income entry');
    } finally {
      setIsSubmittingIncome(false);
    }
  };

  // Create expense entry
  const handleCreateExpenseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingExpense) return;
    
    setIsSubmittingExpense(true);
    
    try {
      const response = await fetch('/api/one-time-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseFormData,
          amount: parseFloat(expenseFormData.amount),
          date: expenseFormData.date,
        }),
      });

      if (response.ok) {
        toast.success('One-time expense entry added successfully!');
        setShowExpenseForm(false);
        setExpenseFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'FOOD',
          notes: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create expense entry');
      }
    } catch (error) {
      console.error('Error creating expense entry:', error);
      toast.error('Failed to create expense entry');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Edit income entry
  const handleEditIncomeEntry = (entry: IncomeEntry) => {
    if (!entry.isOneTime) {
      toast.error('Only one-time entries can be edited');
      return;
    }
    
    setEditingIncomeEntry(entry);
    setEditIncomeFormData({
      name: entry.name,
      amount: entry.amount.toString(),
      date: entry.date.toISOString().split('T')[0],
      category: entry.category || 'FREELANCE',
      notes: entry.notes || ''
    });
    setShowEditIncomeForm(true);
  };

  // Edit expense entry
  const handleEditExpenseEntry = (entry: ExpenseEntry) => {
    if (!entry.isOneTime) {
      toast.error('Only one-time entries can be edited');
      return;
    }
    
    setEditingExpenseEntry(entry);
    setEditExpenseFormData({
      name: entry.name,
      amount: entry.amount.toString(),
      date: entry.date.toISOString().split('T')[0],
      category: entry.category || 'FOOD',
      notes: entry.notes || ''
    });
    setShowEditExpenseForm(true);
  };

  // Update income entry
  const handleUpdateIncomeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUpdatingIncome || !editingIncomeEntry) return;
    
    setIsUpdatingIncome(true);
    
    try {
      const response = await fetch(`/api/one-time-income/${editingIncomeEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editIncomeFormData,
          amount: parseFloat(editIncomeFormData.amount),
          date: editIncomeFormData.date,
        }),
      });

      if (response.ok) {
        toast.success('Income entry updated successfully!');
        setShowEditIncomeForm(false);
        setEditingIncomeEntry(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update income entry');
      }
    } catch (error) {
      console.error('Error updating income entry:', error);
      toast.error('Failed to update income entry');
    } finally {
      setIsUpdatingIncome(false);
    }
  };

  // Update expense entry
  const handleUpdateExpenseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUpdatingExpense || !editingExpenseEntry) return;
    
    setIsUpdatingExpense(true);
    
    try {
      const response = await fetch(`/api/one-time-expense/${editingExpenseEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editExpenseFormData,
          amount: parseFloat(editExpenseFormData.amount),
          date: editExpenseFormData.date,
        }),
      });

      if (response.ok) {
        toast.success('Expense entry updated successfully!');
        setShowEditExpenseForm(false);
        setEditingExpenseEntry(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update expense entry');
      }
    } catch (error) {
      console.error('Error updating expense entry:', error);
      toast.error('Failed to update expense entry');
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  // Delete entry
  const handleDeleteEntry = (entry: IncomeEntry | ExpenseEntry, type: 'income' | 'expense') => {
    setDeletingEntry({ id: entry.id, name: entry.name, type });
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingEntry || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Determine the endpoint based on entry type
      let endpoint: string;
      
      // Check if this is a one-time entry or recurring entry
      const isOneTimeEntry = (deletingEntry.type === 'income' && 
        incomeEntries.find(e => e.id === deletingEntry.id)?.isOneTime) ||
        (deletingEntry.type === 'expense' && 
        expenseEntries.find(e => e.id === deletingEntry.id)?.isOneTime);
      
      if (isOneTimeEntry) {
        // One-time entry endpoints
        endpoint = deletingEntry.type === 'income' 
          ? `/api/one-time-income/${deletingEntry.id}`
          : `/api/one-time-expense/${deletingEntry.id}`;
      } else {
        // Recurring entry endpoints
        endpoint = deletingEntry.type === 'income' 
          ? `/api/income-entries/${deletingEntry.id}`
          : `/api/expense-entries/${deletingEntry.id}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        const entryTypeLabel = isOneTimeEntry ? 'One-time' : 'Recurring';
        toast.success(`${entryTypeLabel} ${deletingEntry.type} entry deleted successfully!`);
        setShowDeleteConfirm(false);
        setDeletingEntry(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter entries based on search term
  const filteredIncomeEntries = incomeEntries.filter(entry =>
    (entry.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredExpenseEntries = expenseEntries.filter(entry =>
    (entry.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalIncome = filteredIncomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = filteredExpenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const netFlow = totalIncome - totalExpenses;

  // Get filter display text
  const getFilterDisplayText = () => {
    if (filterType === 'preset') {
      switch (presetFilter) {
        case 'current-month':
          return 'Current Month';
        case 'last-3-months':
          return 'Last 3 Months';
        case 'last-6-months':
          return 'Last 6 Months';
        case 'last-year':
          return 'Last Year';
        case 'all-time':
          return 'All Time';
        default:
          return 'Current Month';
      }
    } else {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        const end = new Date(customEndDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        return `${start} - ${end}`;
      } else if (customStartDate) {
        return `From ${new Date(customStartDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}`;
      } else if (customEndDate) {
        return `Until ${new Date(customEndDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}`;
      }
      return 'Custom Range';
    }
  };

  // Get filter description
  const getFilterDescription = () => {
    if (filterType === 'preset') {
      switch (presetFilter) {
        case 'current-month':
          return `${new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} entries`;
        case 'last-3-months':
          return 'Last 3 months of entries';
        case 'last-6-months':
          return 'Last 6 months of entries';
        case 'last-year':
          return 'Last 12 months of entries';
        case 'all-time':
          return 'All entries in your account';
        default:
          return 'Current month entries';
      }
    } else {
      if (customStartDate && customEndDate) {
        return `Custom date range entries`;
      }
      return 'Custom filtered entries';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Overlay for Data Refetching */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg font-medium text-gray-700">Updating data...</span>
            </div>
          </div>
        )}

        <div className="container mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-80 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Spinner in Center */}
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg font-medium text-gray-700">Loading your financial data...</span>
            </div>
          </div>

          {/* Tabs and Content Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            
            {/* Entry Cards Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600">Please sign in to manage your financial entries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay for Data Refetching */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <Loader className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium text-gray-700">Updating data...</span>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Comprehensive Financial Entries</h1>
            <p className="text-gray-600 mt-1">
              View all your financial activity - both recurring monthly entries and one-time transactions
            </p>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div>• <strong>Recurring entries:</strong> Monthly income streams and expenses (automated from Dashboard)</div>
              <div>• <strong>One-time entries:</strong> Specific date transactions like freelance payments, medical bills, etc.</div>
              <div>• <strong>Comprehensive view:</strong> Complete monthly breakdown for analysis and tracking</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowIncomeForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add One-Time Income
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add One-Time Expense
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Filter Type Selection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter Options:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={filterType === 'preset' ? 'default' : 'outline'}
                    onClick={() => setFilterType('preset')}
                    className="text-xs"
                  >
                    Quick Filters
                  </Button>
                  <Button
                    size="sm"
                    variant={filterType === 'custom' ? 'default' : 'outline'}
                    onClick={() => setFilterType('custom')}
                    className="text-xs"
                  >
                    Custom Range
                  </Button>
                </div>
              </div>

              {/* Preset Filters */}
              {filterType === 'preset' && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={presetFilter === 'current-month' ? 'default' : 'outline'}
                    onClick={() => setPresetFilter('current-month')}
                    className="text-xs"
                  >
                    Current Month
                  </Button>
                  <Button
                    size="sm"
                    variant={presetFilter === 'last-3-months' ? 'default' : 'outline'}
                    onClick={() => setPresetFilter('last-3-months')}
                    className="text-xs"
                  >
                    Last 3 Months
                  </Button>
                  <Button
                    size="sm"
                    variant={presetFilter === 'last-6-months' ? 'default' : 'outline'}
                    onClick={() => setPresetFilter('last-6-months')}
                    className="text-xs"
                  >
                    Last 6 Months
                  </Button>
                  <Button
                    size="sm"
                    variant={presetFilter === 'last-year' ? 'default' : 'outline'}
                    onClick={() => setPresetFilter('last-year')}
                    className="text-xs"
                  >
                    Last Year
                  </Button>
                  <Button
                    size="sm"
                    variant={presetFilter === 'all-time' ? 'default' : 'outline'}
                    onClick={() => setPresetFilter('all-time')}
                    className="text-xs"
                  >
                    All Time
                  </Button>
                </div>
              )}

              {/* Custom Date Range */}
              {filterType === 'custom' && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="startDate" className="text-xs font-medium text-gray-600">From:</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-40 text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="endDate" className="text-xs font-medium text-gray-600">To:</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-40 text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}

              {/* Search */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search entries by name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              {/* Active Filter Display */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Active Filter:</span>
                  <Badge variant="secondary" className="text-xs">
                    {getFilterDisplayText()}
                  </Badge>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{getFilterDescription()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {filteredIncomeEntries.length + filteredExpenseEntries.length} total entries
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Income
                    <span className="text-xs text-blue-600 font-medium ml-1">
                      ({getFilterDisplayText()})
                    </span>
                  </p>
                  <div className="text-2xl font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getFilterDescription()} • {filteredIncomeEntries.length} entries
                  </div>
                </div>
                <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Expenses
                    <span className="text-xs text-blue-600 font-medium ml-1">
                      ({getFilterDisplayText()})
                    </span>
                  </p>
                  <div className="text-2xl font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getFilterDescription()} • {filteredExpenseEntries.length} entries
                  </div>
                </div>
                <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Net Flow
                    <span className="text-xs text-blue-600 font-medium ml-1">
                      ({getFilterDisplayText()})
                    </span>
                  </p>
                  <div className={`text-2xl font-semibold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netFlow)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getFilterDescription()} net flow
                  </div>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${netFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <DollarSign className={`h-4 w-4 ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Tables */}
        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="income" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              All Income Entries ({filteredIncomeEntries.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              All Expenses ({filteredExpenseEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">All Income Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredIncomeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredIncomeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{entry.name}</h4>
                              {entry.isOneTime ? (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  One-time
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {entry.isOneTime 
                                ? new Date(entry.date).toLocaleDateString('en-MY', { 
                                    day: 'numeric', month: 'long', year: 'numeric' 
                                  })
                                : new Date(entry.date).toLocaleDateString('en-MY', { 
                                    month: 'long', year: 'numeric' 
                                  })
                              }
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(entry.amount)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                              {entry.category || 'OTHER'}
                          </Badge>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {entry.isOneTime && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditIncomeEntry(entry)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEntry(entry, 'income')}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No income entries found</h3>
                    <p className="text-gray-600 mb-4">
                      No recurring or one-time income entries match your current filters
                    </p>
                    <Button onClick={() => setShowIncomeForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add One-Time Income
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">All Expense Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenseEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredExpenseEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{entry.name}</h4>
                              {entry.isOneTime ? (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  One-time
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {entry.isOneTime 
                                ? new Date(entry.date).toLocaleDateString('en-MY', { 
                                    day: 'numeric', month: 'long', year: 'numeric' 
                                  })
                                : new Date(entry.date).toLocaleDateString('en-MY', { 
                                    month: 'long', year: 'numeric' 
                                  })
                              }
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">
                            {formatCurrency(entry.amount)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                              {entry.category || 'OTHER'}
                          </Badge>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {entry.isOneTime && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditExpenseEntry(entry)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEntry(entry, 'expense')}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expense entries found</h3>
                    <p className="text-gray-600 mb-4">
                      No recurring or one-time expense entries match your current filters
                    </p>
                    <Button onClick={() => setShowExpenseForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add One-Time Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Income Form Modal */}
        {showIncomeForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Plus className="h-6 w-6 text-green-600" />
                  </div>
                <div>
                    <h3 className="text-xl font-bold gradient-text">Add One-Time Income</h3>
                    <p className="text-sm text-muted-foreground mt-1">Record a specific income transaction</p>
                  </div>
                </div>
                </div>

              <div className="p-6">
                <form onSubmit={handleCreateIncomeEntry} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Income Name</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={incomeFormData.name}
                        onChange={(e) => setIncomeFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Freelance Project, Affiliate Commission"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-foreground">Amount (RM)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                    required
                  />
                    </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                        id="date"
                        type="date"
                        value={incomeFormData.date}
                        onChange={(e) => setIncomeFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                    required
                  />
                    </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category</Label>
                    <Select value={incomeFormData.category} onValueChange={(value) => 
                      setIncomeFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                        <SelectItem value="FREELANCE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span>Freelance</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="AFFILIATE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>Affiliate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ADSENSE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Eye className="h-4 w-4 text-purple-600" />
                            <span>AdSense</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GIGS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span>Gigs</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BONUS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Plus className="h-4 w-4 text-yellow-600" />
                            <span>Bonus</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GIFT" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <GiftIcon className="h-4 w-4 text-pink-600" />
                            <span>Gift</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes (optional)</Label>
                    <div className="relative">
                      <Edit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="notes"
                    value={incomeFormData.notes}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional details..."
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                  />
                    </div>
                </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowIncomeForm(false)}
                      className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
                    >
                    Cancel
                  </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingIncome}
                      className="flex-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-700 hover:via-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:shadow-green-600/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmittingIncome ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Income
                        </>
                      )}
                  </Button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Plus className="h-6 w-6 text-red-600" />
                  </div>
                <div>
                    <h3 className="text-xl font-bold gradient-text">Add One-Time Expense</h3>
                    <p className="text-sm text-muted-foreground mt-1">Record a specific expense transaction</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateExpenseEntry} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Expense Name</Label>
                    <div className="relative">
                      <TrendingDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={expenseFormData.name}
                        onChange={(e) => setExpenseFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Medical Bill, Car Repair"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-foreground">Amount (RM)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={expenseFormData.amount}
                        onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={expenseFormData.date}
                        onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category</Label>
                    <Select value={expenseFormData.category} onValueChange={(value) => 
                      setExpenseFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                      <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                        <SelectItem value="FOOD" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Utensils className="h-4 w-4 text-orange-600" />
                            <span>Food & Dining</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TRANSPORTATION" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span>Transportation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HOUSING" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Home className="h-4 w-4 text-green-600" />
                            <span>Housing & Rent</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="UTILITIES" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span>Utilities</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SHOPPING" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <ShoppingBag className="h-4 w-4 text-purple-600" />
                            <span>Shopping</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HEALTHCARE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-4 w-4 text-red-600" />
                            <span>Healthcare</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ENTERTAINMENT" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Gamepad2 className="h-4 w-4 text-indigo-600" />
                            <span>Entertainment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSINESS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Briefcase className="h-4 w-4 text-gray-600" />
                            <span>Business</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="OTHER" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes (optional)</Label>
                    <div className="relative">
                      <Edit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="notes"
                        value={expenseFormData.notes}
                        onChange={(e) => setExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional details..."
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowExpenseForm(false)}
                      className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingExpense}
                      className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:shadow-red-600/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmittingExpense ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Income Form Modal */}
        {showEditIncomeForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Plus className="h-6 w-6 text-green-600" />
                  </div>
                <div>
                    <h3 className="text-xl font-bold gradient-text">Edit One-Time Income</h3>
                    <p className="text-sm text-muted-foreground mt-1">Update a specific income transaction</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdateIncomeEntry} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Income Name</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={editIncomeFormData.name}
                        onChange={(e) => setEditIncomeFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Freelance Project, Affiliate Commission"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-foreground">Amount (RM)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                        value={editIncomeFormData.amount}
                        onChange={(e) => setEditIncomeFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                    required
                  />
                    </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                        id="date"
                        type="date"
                        value={editIncomeFormData.date}
                        onChange={(e) => setEditIncomeFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                    required
                  />
                    </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category</Label>
                    <Select value={editIncomeFormData.category} onValueChange={(value) => 
                      setEditIncomeFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                        <SelectItem value="FREELANCE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span>Freelance</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="AFFILIATE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>Affiliate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ADSENSE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Eye className="h-4 w-4 text-purple-600" />
                            <span>AdSense</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GIGS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span>Gigs</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BONUS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Plus className="h-4 w-4 text-yellow-600" />
                            <span>Bonus</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GIFT" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <GiftIcon className="h-4 w-4 text-pink-600" />
                            <span>Gift</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes (optional)</Label>
                    <div className="relative">
                      <Edit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="notes"
                        value={editIncomeFormData.notes}
                        onChange={(e) => setEditIncomeFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional details..."
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowEditIncomeForm(false)}
                      className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isUpdatingIncome}
                      className="flex-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-700 hover:via-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:shadow-green-600/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isUpdatingIncome ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Update Income
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Expense Form Modal */}
        {showEditExpenseForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Plus className="h-6 w-6 text-red-600" />
                  </div>
                <div>
                    <h3 className="text-xl font-bold gradient-text">Edit One-Time Expense</h3>
                    <p className="text-sm text-muted-foreground mt-1">Update a specific expense transaction</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdateExpenseEntry} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Expense Name</Label>
                    <div className="relative">
                      <TrendingDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={editExpenseFormData.name}
                        onChange={(e) => setEditExpenseFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Medical Bill, Car Repair"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold text-foreground">Amount (RM)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editExpenseFormData.amount}
                        onChange={(e) => setEditExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-foreground">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={editExpenseFormData.date}
                        onChange={(e) => setEditExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">Category</Label>
                    <Select value={editExpenseFormData.category} onValueChange={(value) => 
                      setEditExpenseFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                        <SelectItem value="FOOD" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Utensils className="h-4 w-4 text-orange-600" />
                            <span>Food & Dining</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TRANSPORTATION" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span>Transportation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HOUSING" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Home className="h-4 w-4 text-green-600" />
                            <span>Housing & Rent</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="UTILITIES" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span>Utilities</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SHOPPING" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <ShoppingBag className="h-4 w-4 text-purple-600" />
                            <span>Shopping</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HEALTHCARE" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-4 w-4 text-red-600" />
                            <span>Healthcare</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ENTERTAINMENT" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Gamepad2 className="h-4 w-4 text-indigo-600" />
                            <span>Entertainment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSINESS" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Briefcase className="h-4 w-4 text-gray-600" />
                            <span>Business</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="OTHER" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                          <div className="flex items-center space-x-3">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes (optional)</Label>
                    <div className="relative">
                      <Edit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="notes"
                        value={editExpenseFormData.notes}
                        onChange={(e) => setEditExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional details..."
                        className="pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all"
                      />
                    </div>
                </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowEditExpenseForm(false)}
                      className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
                    >
                    Cancel
                  </Button>
                    <Button 
                      type="submit" 
                      disabled={isUpdatingExpense}
                      className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:shadow-red-600/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isUpdatingExpense ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Update Expense
                        </>
                      )}
                  </Button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingEntry && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-600">Delete Entry</h3>
                    <p className="text-sm text-muted-foreground mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/80 rounded-lg border border-red-200/60">
                    {(() => {
                      const isOneTimeEntry = (deletingEntry.type === 'income' && 
                        incomeEntries.find(e => e.id === deletingEntry.id)?.isOneTime) ||
                        (deletingEntry.type === 'expense' && 
                        expenseEntries.find(e => e.id === deletingEntry.id)?.isOneTime);
                      
                      return (
                        <>
                          <p className="text-sm text-gray-800">
                            Are you sure you want to delete <strong className="text-red-600">&quot;{deletingEntry.name}&quot;</strong>?
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            {isOneTimeEntry ? (
                              <>This one-time {deletingEntry.type} entry will be permanently removed from your records.</>
                            ) : (
                              <>This will only delete this specific month&apos;s {deletingEntry.type} entry. The recurring {deletingEntry.type} stream will remain active and continue generating future entries.</>
                            )}
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletingEntry(null);
                      }}
                      className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:shadow-red-600/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isDeleting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Entry
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 