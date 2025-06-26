'use client';

import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface IncomeEntry {
  id: string;
  incomeStreamId: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
  incomeStream: {
    id: string;
    name: string;
    type: string;
  };
}

interface ExpenseEntry {
  id: string;
  expenseId: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
  expense: {
    id: string;
    name: string;
    category: string;
    type: string;
  };
}

interface IncomeStream {
  id: string;
  name: string;
  type: string;
  expectedMonthly: number;
}

interface Expense {
  id: string;
  name: string;
  category: string;
  type: string;
  amount: number;
}

export default function EntriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  
  // Data states
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [incomeFormData, setIncomeFormData] = useState({
    incomeStreamId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    notes: ''
  });
  const [expenseFormData, setExpenseFormData] = useState({
    expenseId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    notes: ''
  });

  // Fetch data
  const fetchData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Helper function to build query string only when filters are applied
      const buildQueryString = () => {
        const params = new URLSearchParams();
        if (selectedYear !== 'all') {
          params.append('year', selectedYear);
        }
        if (selectedMonth !== 'all') {
          params.append('month', selectedMonth);
        }
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
      };

      // Fetch income streams and expenses for dropdowns
      const [incomeStreamsRes, expensesRes, incomeEntriesRes, expenseEntriesRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/expenses'),
        fetch(`/api/income-entries${buildQueryString()}`),
        fetch(`/api/expense-entries${buildQueryString()}`)
      ]);

      if (incomeStreamsRes.ok) {
        const data = await incomeStreamsRes.json();
        setIncomeStreams(data);
      }

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        setExpenses(data);
      }

      if (incomeEntriesRes.ok) {
        const data = await incomeEntriesRes.json();
        setIncomeEntries(data);
      }

      if (expenseEntriesRes.ok) {
        const data = await expenseEntriesRes.json();
        setExpenseEntries(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchData();
    }
  }, [user?.id, authLoading, selectedYear, selectedMonth]);

  // Generate missing entries
  const handleGenerateMissingEntries = async () => {
    try {
      const response = await fetch('/api/entries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`✅ Generated ${result.details.total} missing entries! (${result.details.incomeEntries} income, ${result.details.expenseEntries} expense)`);
        fetchData(); // Refresh the data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate entries');
      }
    } catch (error) {
      console.error('Error generating entries:', error);
      toast.error('Failed to generate entries');
    }
  };

  // Create income entry
  const handleCreateIncomeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/income-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incomeFormData,
          amount: parseFloat(incomeFormData.amount),
          month: `${incomeFormData.month}-01`, // Convert to full date
        }),
      });

      if (response.ok) {
        toast.success('Income entry added successfully!');
        setShowIncomeForm(false);
        setIncomeFormData({
          incomeStreamId: '',
          amount: '',
          month: new Date().toISOString().slice(0, 7),
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
    }
  };

  // Create expense entry
  const handleCreateExpenseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/expense-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseFormData,
          amount: parseFloat(expenseFormData.amount),
          month: `${expenseFormData.month}-01`, // Convert to full date
        }),
      });

      if (response.ok) {
        toast.success('Expense entry added successfully!');
        setShowExpenseForm(false);
        setExpenseFormData({
          expenseId: '',
          amount: '',
          month: new Date().toISOString().slice(0, 7),
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
    }
  };

  // Filter entries based on search term
  const filteredIncomeEntries = incomeEntries.filter(entry =>
    entry.incomeStream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenseEntries = expenseEntries.filter(entry =>
    entry.expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalIncome = filteredIncomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = filteredExpenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const netFlow = totalIncome - totalExpenses;

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
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
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Financial Entries</h1>
            <p className="text-gray-600 mt-1">
              Track actual monthly income and expense transactions
            </p>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div>• <strong>Dashboard balance</strong> uses auto-calculated amounts from income streams/expenses</div>
              <div>• <strong>Analytics trends</strong> use these actual monthly entries for historical analysis</div>
              <div>• Use "Generate Missing" to auto-create entries from your income streams and expenses</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleGenerateMissingEntries} variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Generate Missing
            </Button>
            <Button onClick={() => setShowIncomeForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Quick toggle for All Time vs Current Month */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={selectedYear === 'all' && selectedMonth === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedMonth('all');
                  }}
                  className="text-xs"
                >
                  All Time
                </Button>
                <Button
                  size="sm"
                  variant={selectedYear !== 'all' && selectedMonth !== 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedYear(new Date().getFullYear().toString());
                    setSelectedMonth((new Date().getMonth() + 1).toString());
                  }}
                  className="text-xs"
                >
                  Current Month
                </Button>
              </div>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = i + 1;
                    const monthName = new Date(2024, i).toLocaleDateString('en-MY', { month: 'long' });
                    return (
                      <SelectItem key={monthNum} value={monthNum.toString()}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
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
                    {(selectedYear !== 'all' || selectedMonth !== 'all') ? (
                      <span className="text-xs text-blue-600 font-medium"> (Current Month)</span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium"> (All Time)</span>
                    )}
                  </p>
                  <div className="text-2xl font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedYear === 'all' && selectedMonth === 'all') 
                      ? `All-time income from ${filteredIncomeEntries.length} entries`
                      : `${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} - ${filteredIncomeEntries.length} entries`
                    }
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
                    {(selectedYear !== 'all' || selectedMonth !== 'all') ? (
                      <span className="text-xs text-blue-600 font-medium"> (Current Month)</span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium"> (All Time)</span>
                    )}
                  </p>
                  <div className="text-2xl font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedYear === 'all' && selectedMonth === 'all') 
                      ? `All-time expenses from ${filteredExpenseEntries.length} entries`
                      : `${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} - ${filteredExpenseEntries.length} entries`
                    }
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
                    {(selectedYear !== 'all' || selectedMonth !== 'all') ? (
                      <span className="text-xs text-blue-600 font-medium"> (Current Month)</span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium"> (All Time)</span>
                    )}
                  </p>
                  <div className={`text-2xl font-semibold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netFlow)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedYear === 'all' && selectedMonth === 'all') 
                      ? 'Lifetime net flow'
                      : `${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} net flow`
                    }
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
              Income Entries ({filteredIncomeEntries.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              Expense Entries ({filteredExpenseEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Income Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredIncomeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredIncomeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{entry.incomeStream.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(entry.month).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(entry.amount)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.incomeStream.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No income entries</h3>
                    <p className="text-gray-600 mb-4">
                      {incomeStreams.length === 0 
                        ? "Create income streams first, then add monthly entries"
                        : "Start tracking your monthly income by adding entries"
                      }
                    </p>
                    <Button onClick={() => setShowIncomeForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Expense Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenseEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredExpenseEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{entry.expense.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(entry.month).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">
                            {formatCurrency(entry.amount)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.expense.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expense entries</h3>
                    <p className="text-gray-600 mb-4">
                      {expenses.length === 0 
                        ? "Create expenses first, then add monthly entries"
                        : "Start tracking your monthly expenses by adding entries"
                      }
                    </p>
                    <Button onClick={() => setShowExpenseForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Income Form Modal */}
        {showIncomeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Income Entry</h3>
              <form onSubmit={handleCreateIncomeEntry} className="space-y-4">
                <div>
                  <Label htmlFor="incomeStream">Income Stream</Label>
                  <Select value={incomeFormData.incomeStreamId} onValueChange={(value) => 
                    setIncomeFormData(prev => ({ ...prev, incomeStreamId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select income stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeStreams.map((stream) => (
                        <SelectItem key={stream.id} value={stream.id}>
                          {stream.name} - {formatCurrency(stream.expectedMonthly)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (RM)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={incomeFormData.month}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, month: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={incomeFormData.notes}
                    onChange={(e) => setIncomeFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowIncomeForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    Add Entry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Expense Entry</h3>
              <form onSubmit={handleCreateExpenseEntry} className="space-y-4">
                <div>
                  <Label htmlFor="expense">Expense</Label>
                  <Select value={expenseFormData.expenseId} onValueChange={(value) => 
                    setExpenseFormData(prev => ({ ...prev, expenseId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenses.map((expense) => (
                        <SelectItem key={expense.id} value={expense.id}>
                          {expense.name} - {formatCurrency(expense.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (RM)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={expenseFormData.month}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, month: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={expenseFormData.notes}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    Add Entry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 