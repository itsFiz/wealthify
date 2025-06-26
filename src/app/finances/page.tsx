'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Car,
  Home,
  Utensils,
  Zap,
  Heart,
  Briefcase,
  User,
  MoreHorizontal,
  PiggyBank,
  Save
} from 'lucide-react';
import { IncomeStream, Expense, IncomeType, ExpenseCategory, ExpenseType, Frequency } from '@/types';
import { IncomeStreamForm } from '@/components/finances/IncomeStreamForm';
import { ExpenseForm } from '@/components/finances/ExpenseForm';
import { IncomeStreamCard } from '@/components/finances/IncomeStreamCard';
import { ExpenseCard } from '@/components/finances/ExpenseCard';
import { FinancialSummary } from '../../components/finances/FinancialSummary';

export default function FinancesPage() {
  const { data: session, status } = useSession();
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simple Net Worth State
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [isEditingNetWorth, setIsEditingNetWorth] = useState(false);
  const [tempSavings, setTempSavings] = useState<string>('');
  const [tempDebt, setTempDebt] = useState<string>('');
  
  // Form states
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeStream | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Fetch data
  const fetchIncomeStreams = async () => {
    try {
      const response = await fetch('/api/income');
      if (!response.ok) throw new Error('Failed to fetch income streams');
      const data = await response.json();
      setIncomeStreams(data);
    } catch (error) {
      console.error('Error fetching income streams:', error);
      setError('Failed to load income streams');
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchIncomeStreams(), fetchExpenses()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  // CRUD handlers
  const handleCreateIncome = async (data: {
    name: string;
    type: IncomeType;
    expectedMonthly: number;
    actualMonthly?: number;
  }) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create income stream');
      
      await fetchIncomeStreams();
      setShowIncomeForm(false);
    } catch (error) {
      console.error('Error creating income stream:', error);
      setError('Failed to create income stream');
    }
  };

  const handleUpdateIncome = async (id: string, data: {
    name: string;
    type: IncomeType;
    expectedMonthly: number;
    actualMonthly?: number;
  }) => {
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update income stream');
      
      await fetchIncomeStreams();
      setEditingIncome(null);
    } catch (error) {
      console.error('Error updating income stream:', error);
      setError('Failed to update income stream');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income stream?')) return;
    
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete income stream');
      
      await fetchIncomeStreams();
    } catch (error) {
      console.error('Error deleting income stream:', error);
      setError('Failed to delete income stream');
    }
  };

  const handleCreateExpense = async (data: {
    name: string;
    category: ExpenseCategory;
    type: ExpenseType;
    amount: number;
    frequency: Frequency;
  }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create expense');
      
      await fetchExpenses();
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error creating expense:', error);
      setError('Failed to create expense');
    }
  };

  const handleUpdateExpense = async (id: string, data: {
    name: string;
    category: ExpenseCategory;
    type: ExpenseType;
    amount: number;
    frequency: Frequency;
  }) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update expense');
      
      await fetchExpenses();
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      setError('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete expense');
      
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    }
  };

  const handleUpdateNetWorth = () => {
    const savings = parseFloat(tempSavings) || 0;
    const debt = parseFloat(tempDebt) || 0;
    setCurrentSavings(savings);
    setTotalDebt(debt);
    setIsEditingNetWorth(false);
  };

  const startEditingNetWorth = () => {
    setTempSavings(currentSavings.toString());
    setTempDebt(totalDebt.toString());
    setIsEditingNetWorth(true);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to manage your finances.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your income streams and expenses to track your financial health.
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <span className="text-sm">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Net Worth Quick Update */}
      <Card className="mb-6 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <CardTitle>Financial Position</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startEditingNetWorth}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNetWorth ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="savings">Current Savings (RM)</Label>
                <Input
                  id="savings"
                  type="number"
                  step="0.01"
                  value={tempSavings}
                  onChange={(e) => setTempSavings(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt">Total Debt (RM)</Label>
                <Input
                  id="debt"
                  type="number"
                  step="0.01"
                  value={tempDebt}
                  onChange={(e) => setTempDebt(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <Button onClick={handleUpdateNetWorth} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingNetWorth(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Track your savings and debt to see your complete financial picture
            </p>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <FinancialSummary 
        incomeStreams={incomeStreams} 
        expenses={expenses}
        currentSavings={currentSavings}
        totalDebt={totalDebt}
      />

      {/* Main Content */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Income Streams
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Income Streams</h2>
              <p className="text-muted-foreground">
                Track all your income sources and monitor your earning potential.
              </p>
            </div>
            <Button 
              onClick={() => setShowIncomeForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Income Stream
            </Button>
          </div>

          {incomeStreams.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Income Streams Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first income source to track your earnings.
                </p>
                <Button onClick={() => setShowIncomeForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Income Stream
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {incomeStreams.map((income) => (
                <IncomeStreamCard
                  key={income.id}
                  incomeStream={income}
                  onEdit={() => setEditingIncome(income)}
                  onDelete={() => handleDeleteIncome(income.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Expenses</h2>
              <p className="text-muted-foreground">
                Monitor your spending patterns and optimize your budget allocation.
              </p>
            </div>
            <Button 
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Expenses Tracked</h3>
                <p className="text-muted-foreground mb-4">
                  Add your expenses to understand your spending patterns and optimize your budget.
                </p>
                <Button onClick={() => setShowExpenseForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Expense
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setEditingExpense(expense)}
                  onDelete={() => handleDeleteExpense(expense.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showIncomeForm && (
        <IncomeStreamForm
          onSubmit={handleCreateIncome}
          onCancel={() => setShowIncomeForm(false)}
        />
      )}

      {editingIncome && (
        <IncomeStreamForm
          incomeStream={editingIncome}
          onSubmit={(data) => handleUpdateIncome(editingIncome.id, data)}
          onCancel={() => setEditingIncome(null)}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onSubmit={handleCreateExpense}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}

      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={(data) => handleUpdateExpense(editingExpense.id, data)}
          onCancel={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
} 