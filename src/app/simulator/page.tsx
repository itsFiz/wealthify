'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Home, 
  Car, 
  Heart, 
  Briefcase, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  PiggyBank,
  BarChart3,
  Wallet,
  Flame,
  Shield,
  Trash2
} from 'lucide-react';
import { 
  //analyzeAffordability, 
  calculateMonthlyIncome, 
  calculateMonthlyExpenses,
  calculateBurnRate,
  calculateSavingsRate,
  calculateEmergencyRunway,
  calculateAccumulatedBalance,
  formatCurrency,
  formatPercentage
} from '@/lib/calculations/index';
import toast from 'react-hot-toast';
import type { IncomeStream, Expense, Goal, PurchasePlan } from '@/types';

interface SimulationInputs {
  purchaseType: 'house' | 'vehicle' | 'wedding' | 'business' | 'custom';
  targetAmount: number;
  currentSaved: number;
  desiredTimelineMonths: number;
  downPaymentRatio?: number;
  appreciationRate?: number;
}

interface PurchaseTypeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultAmount: number;
  hasDownPayment: boolean;
  hasAppreciation: boolean;
  defaultAppreciationRate?: number;
}

const PURCHASE_TYPES: Record<string, PurchaseTypeConfig> = {
  house: { 
    label: 'House Down Payment', 
    icon: Home, 
    color: 'text-green-600',
    defaultAmount: 100000,
    hasDownPayment: true,
    hasAppreciation: true,
    defaultAppreciationRate: -0.03 // 3% appreciation
  },
  vehicle: { 
    label: 'Vehicle Purchase', 
    icon: Car, 
    color: 'text-blue-600',
    defaultAmount: 80000,
    hasDownPayment: true,
    hasAppreciation: true,
    defaultAppreciationRate: 0.057 // 5.7% depreciation
  },
  wedding: { 
    label: 'Wedding Savings', 
    icon: Heart, 
    color: 'text-pink-600',
    defaultAmount: 20000,
    hasDownPayment: false,
    hasAppreciation: false
  },
  business: { 
    label: 'Business Capital', 
    icon: Briefcase, 
    color: 'text-purple-600',
    defaultAmount: 50000,
    hasDownPayment: false,
    hasAppreciation: false
  },
  custom: { 
    label: 'Custom', 
    icon: Target, 
    color: 'text-gray-600',
    defaultAmount: 10000,
    hasDownPayment: false,
    hasAppreciation: false
  }
};

export default function SimulatorPage() {
  const { data: session } = useSession();
  
  // Financial data state
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Purchase plans state
  const [purchasePlans, setPurchasePlans] = useState<PurchasePlan[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Scenario selection state
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioSortOrder, setScenarioSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Simulation inputs
  const [inputs, setInputs] = useState<SimulationInputs>({
    purchaseType: 'wedding',
    targetAmount: 20000,
    currentSaved: 0,
    desiredTimelineMonths: 12,
    downPaymentRatio: 0.2,
    appreciationRate: 0
  });

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch all financial data in parallel
        const [incomeRes, expensesRes, goalsRes, balanceRes, plansRes] = await Promise.all([
          fetch('/api/income'),
          fetch('/api/expenses'),
          fetch('/api/goals'),
          fetch('/api/balance'),
          fetch('/api/purchase-plans')
        ]);

        if (incomeRes.ok) {
          const incomeData = await incomeRes.json();
          setIncomeStreams(incomeData.map((income: Record<string, unknown>) => ({
            ...income,
            expectedMonthly: Number(income.expectedMonthly),
            actualMonthly: income.actualMonthly ? Number(income.actualMonthly) : undefined,
          })));
        } else {
          toast.error('Failed to load income data');
        }

        if (expensesRes.ok) {
          const expensesData = await expensesRes.json();
          setExpenses(expensesData.map((expense: Record<string, unknown>) => ({
            ...expense,
            amount: Number(expense.amount),
          })));
        } else {
          toast.error('Failed to load expenses data');
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          setGoals(goalsData.map((goal: Record<string, unknown>) => ({
            ...goal,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            targetDate: new Date(goal.targetDate as string),
          })));
        } else {
          toast.error('Failed to load goals data');
        }

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setStartingBalance(Number(balanceData.startingBalance) || 0);
        } else {
          toast.error('Failed to load balance data');
        }

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPurchasePlans(plansData.map((plan: Record<string, unknown>) => ({
            ...plan,
            createdAt: new Date(plan.createdAt as string),
            updatedAt: new Date(plan.updatedAt as string),
          })));
        } else {
          toast.error('Failed to load purchase plans data');
        }

        // Show success message if all data loaded successfully
        toast.success('Financial data loaded successfully');

      } catch (error) {
        console.error('Error fetching financial data:', error);
        toast.error('Failed to load financial data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [session?.user?.id]);

  // Calculate current balance using accumulated balance calculation
  useEffect(() => {
    if (incomeStreams.length > 0 || expenses.length > 0) {
      const balanceCalculation = calculateAccumulatedBalance(
        startingBalance,
        incomeStreams,
        expenses,
        [] // No goal contributions in simulator for now
      );
      setCurrentBalance(balanceCalculation.currentCalculatedBalance);
    } else {
      setCurrentBalance(startingBalance);
    }
  }, [startingBalance, incomeStreams, expenses]);

  // Save purchase plan
  const savePurchasePlan = async () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }
    
    setSavingPlan(true);
    try {
      // Get selected scenario details if one is selected
      const selectedScenarioData = selectedScenario ? scenarios.find(s => s.id === selectedScenario) : null;
      
      const response = await fetch('/api/purchase-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planName.trim(),
          purchaseType: inputs.purchaseType,
          targetAmount: inputs.targetAmount,
          currentSaved: inputs.currentSaved,
          desiredTimelineMonths: inputs.desiredTimelineMonths,
          downPaymentRatio: inputs.downPaymentRatio,
          appreciationRate: inputs.appreciationRate,
          notes: selectedScenarioData 
            ? `Saved on ${new Date().toLocaleDateString()} | Selected: ${selectedScenarioData.name} (${formatPercentage(selectedScenarioData.savingsRate * 100)})`
            : `Saved on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        const newPlan = await response.json();
        setPurchasePlans(prev => [newPlan, ...prev]);
        setPlanName('');
        setShowSaveModal(false);
        setSelectedScenario(null); // Reset selection after saving
        toast.success('Purchase plan saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving purchase plan:', error);
      toast.error('Failed to save purchase plan');
    } finally {
      setSavingPlan(false);
    }
  };

  // Load purchase plan
  const loadPurchasePlan = (plan: PurchasePlan) => {
    setInputs({
      purchaseType: plan.purchaseType,
      targetAmount: plan.targetAmount,
      currentSaved: plan.currentSaved,
      desiredTimelineMonths: plan.desiredTimelineMonths,
      downPaymentRatio: plan.downPaymentRatio || 0.2,
      appreciationRate: plan.appreciationRate || 0,
    });
    setSelectedScenario(null); // Reset scenario selection when loading a plan
    toast.success(`Loaded "${plan.name}" plan with ${formatCurrency(plan.targetAmount)} target`);
  };

  // Handle scenario selection
  const handleScenarioSelection = (scenarioId: string | null) => {
    const wasSelected = selectedScenario !== null;
    setSelectedScenario(scenarioId);
    
    // If selecting a scenario, update the desired timeline to match the scenario's actual timeline
    if (scenarioId) {
      const selectedScenarioData = scenarios.find(s => s.id === scenarioId);
      if (selectedScenarioData && selectedScenarioData.timelineMonths !== inputs.desiredTimelineMonths) {
        setInputs(prev => ({
          ...prev,
          desiredTimelineMonths: selectedScenarioData.timelineMonths
        }));
        toast.success(`Timeline updated to ${selectedScenarioData.timelineMonths} months to match selected scenario`);
      }
    } else if (wasSelected) {
      // User deselected a scenario
      toast('Scenario selection cleared');
    }
  };

  // Delete purchase plan
  const deletePurchasePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/purchase-plans?id=${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPurchasePlans(prev => prev.filter(plan => plan.id !== planId));
        toast.success('Purchase plan deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting purchase plan:', error);
      toast.error('Failed to delete purchase plan');
    }
  };

  // Calculate current financial metrics
  const financialMetrics = useMemo(() => {
    const monthlyIncome = calculateMonthlyIncome(incomeStreams);
    const monthlyExpenses = calculateMonthlyExpenses(expenses);
    const monthlyCashFlow = monthlyIncome - monthlyExpenses; // Renamed for clarity
    const burnRate = calculateBurnRate(monthlyExpenses, monthlyIncome);
    const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
    const emergencyRunway = calculateEmergencyRunway(currentBalance, monthlyExpenses);
    
    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow, // This is monthly surplus, not actual savings
      burnRate,
      savingsRate,
      emergencyRunway
    };
  }, [incomeStreams, expenses, currentBalance]);

  // Generate purchase scenarios
  const scenarios = useMemo(() => {
    const { monthlyIncome, monthlyCashFlow } = financialMetrics;
    const { targetAmount, currentSaved } = inputs;
    
    if (monthlyIncome <= 0) return [];

    const savingsRates = [
      { rate: 0.01, category: 'Conservative', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/50', borderColor: 'border-green-200 dark:border-green-800' },
      { rate: 0.025, category: 'Conservative', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/50', borderColor: 'border-green-200 dark:border-green-800' },
      { rate: 0.05, category: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/50', borderColor: 'border-blue-200 dark:border-blue-800' },
      { rate: 0.10, category: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/50', borderColor: 'border-blue-200 dark:border-blue-800' },
      { rate: 0.15, category: 'Aggressive', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/50', borderColor: 'border-orange-200 dark:border-orange-800' },
      { rate: 0.20, category: 'Very Aggressive', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/50', borderColor: 'border-red-200 dark:border-red-800' },
      { rate: 0.25, category: 'Extreme', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/50', borderColor: 'border-purple-200 dark:border-purple-800' }
    ];
    
    const generatedScenarios = savingsRates.map((savingsConfig, index) => {
      const { rate, category, color, bgColor, borderColor } = savingsConfig;
      const monthlyAmount = monthlyIncome * rate;
      
      const timelineMonths = Math.ceil((targetAmount - currentSaved) / monthlyAmount);
      const feasible = monthlyAmount <= monthlyCashFlow && timelineMonths > 0;
      
      // Calculate remaining cash flow after this savings commitment
      const remainingCashFlow = monthlyCashFlow - monthlyAmount;

      return {
        id: `scenario-${index}`,
        name: `Save ${formatPercentage(rate * 100)} of Income`,
        savingsRate: rate,
        monthlyAmount,
        timelineMonths: isFinite(timelineMonths) ? timelineMonths : 999,
        feasible,
        impactOnEmergencyFund: remainingCashFlow,
        impactOnGoals: [], // TODO: Calculate impact on existing goals
        category,
        color,
        bgColor,
        borderColor
      };
    }).filter(scenario => scenario.timelineMonths < 999 && scenario.timelineMonths > 0);

    // Sort scenarios by savings rate
    return generatedScenarios.sort((a, b) => {
      if (scenarioSortOrder === 'desc') {
        return b.savingsRate - a.savingsRate; // Highest to lowest
      } else {
        return a.savingsRate - b.savingsRate; // Lowest to highest
      }
    });
  }, [financialMetrics, inputs, scenarioSortOrder]);

  // Show toast for no scenarios
  useEffect(() => {
    if (!loading && scenarios.length === 0 && financialMetrics.monthlyIncome > 0) {
      toast.error('No feasible scenarios found. Consider increasing income or reducing target amount.');
    }
  }, [scenarios.length, financialMetrics.monthlyIncome, loading]);

  // Handle input changes
  const updateInput = (field: keyof SimulationInputs, value: number | string) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      
      // Auto-update target amount when purchase type changes
      if (field === 'purchaseType') {
        const purchaseType = PURCHASE_TYPES[value as keyof typeof PURCHASE_TYPES];
        newInputs.targetAmount = purchaseType.defaultAmount;
        newInputs.appreciationRate = purchaseType.defaultAppreciationRate || 0;
        
        // Show toast notification for purchase type change
        toast.success(`Switched to ${purchaseType.label} planning`);
      }
      
      return newInputs;
    });
  };

  // Calculate projected price with appreciation/depreciation
  const projectedPrice = useMemo(() => {
    const { targetAmount, desiredTimelineMonths, appreciationRate } = inputs;
    if (!appreciationRate) return targetAmount;
    
    const years = desiredTimelineMonths / 12;
    return targetAmount * Math.pow(1 + appreciationRate, years);
  }, [inputs]);

  // Get recommended scenario
  const recommendedScenario = useMemo(() => {
    const feasibleScenarios = scenarios.filter(s => s.feasible);
    if (feasibleScenarios.length === 0) return null;
    
    // Find scenario closest to desired timeline
    return feasibleScenarios.reduce((best, current) => {
      const bestDiff = Math.abs(best.timelineMonths - inputs.desiredTimelineMonths);
      const currentDiff = Math.abs(current.timelineMonths - inputs.desiredTimelineMonths);
      return currentDiff < bestDiff ? current : best;
    });
  }, [scenarios, inputs.desiredTimelineMonths]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Financial Simulator</h1>
            <p className="text-muted-foreground">
              Plan your next major purchase with smart affordability analysis
            </p>
          </div>
        </div>
      </div>

      {/* Current Financial Overview */}
      <Card className="metric-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Your Current Financial Position
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
              </div>
              <p className="text-3xl font-bold stat-number text-green-600">
                {formatCurrency(financialMetrics.monthlyIncome)}
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
              </div>
              <p className="text-3xl font-bold stat-number text-red-600">
                {formatCurrency(financialMetrics.monthlyExpenses)}
              </p>
            </div>
                          <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Monthly Surplus</p>
                </div>
                <p className="text-3xl font-bold stat-number text-blue-600">
                  {formatCurrency(financialMetrics.monthlyCashFlow)}
                </p>
                <p className="text-xs text-muted-foreground">Income - Expenses</p>
              </div>
                          <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                </div>
                <p className="text-3xl font-bold stat-number text-purple-600">
                  {formatCurrency(currentBalance)}
                </p>
                <p className="text-xs text-muted-foreground">Bank/Savings Account</p>
              </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Savings Rate</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatPercentage(financialMetrics.savingsRate)}
                </Badge>
              </div>
              <Progress value={financialMetrics.savingsRate} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Burn Rate</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatPercentage(financialMetrics.burnRate)}
                </Badge>
              </div>
              <Progress value={financialMetrics.burnRate} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Emergency Fund</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {financialMetrics.emergencyRunway.toFixed(1)} months
                </Badge>
              </div>
              <Progress value={Math.min(100, (financialMetrics.emergencyRunway / 6) * 100)} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase Planning Input */}
        <div className="lg:col-span-1">
          <Card className="metric-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Purchase Planning
              </CardTitle>
              <CardDescription>
                Configure your target purchase and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {/* Purchase Type */}
              <div className="space-y-2">
                <Label htmlFor="purchase-type" className="text-sm font-medium">Purchase Type</Label>
                <Select 
                  value={inputs.purchaseType} 
                  onValueChange={(value) => updateInput('purchaseType', value)}
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                    <SelectValue placeholder="Select purchase type" />
                  </SelectTrigger>
                  <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                    {Object.entries(PURCHASE_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={key} value={key} className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-gray-100 rounded">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                            </div>
                            <span className="font-medium">{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="target-amount" className="text-sm font-medium">Target Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target-amount"
                    type="number"
                    value={inputs.targetAmount}
                    onChange={(e) => updateInput('targetAmount', Number(e.target.value))}
                    placeholder="Enter target amount"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Current Saved */}
              <div className="space-y-2">
                <Label htmlFor="current-saved" className="text-sm font-medium">Already Saved</Label>
                <div className="relative">
                  <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-saved"
                    type="number"
                    value={inputs.currentSaved}
                    onChange={(e) => updateInput('currentSaved', Number(e.target.value))}
                    placeholder="Amount already saved"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Desired Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-sm font-medium">
                  Desired Timeline (months)
                  {selectedScenario && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Auto-updated
                    </Badge>
                  )}
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timeline"
                    type="number"
                    value={inputs.desiredTimelineMonths}
                    onChange={(e) => updateInput('desiredTimelineMonths', Number(e.target.value))}
                    placeholder="Months to achieve goal"
                    className={`pl-10 h-11 ${selectedScenario ? 'border-primary/50 bg-primary/5' : ''}`}
                  />
                </div>
                {selectedScenario && (
                  <p className="text-xs text-muted-foreground">
                    Timeline automatically adjusted to match selected scenario
                  </p>
                )}
              </div>

              {/* Down Payment Ratio (for applicable purchases) */}
              {PURCHASE_TYPES[inputs.purchaseType].hasDownPayment && (
                <div className="space-y-2">
                  <Label htmlFor="down-payment" className="text-sm font-medium">Down Payment %</Label>
                  <Select 
                    value={(inputs.downPaymentRatio || 0.2).toString()} 
                    onValueChange={(value) => updateInput('downPaymentRatio', Number(value))}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                      <SelectValue placeholder="Select down payment %" />
                    </SelectTrigger>
                    <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                      <SelectItem value="0.1" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">10%</SelectItem>
                      <SelectItem value="0.15" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">15%</SelectItem>
                      <SelectItem value="0.2" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">20%</SelectItem>
                      <SelectItem value="0.25" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">25%</SelectItem>
                      <SelectItem value="0.3" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">30%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Projection Info */}
              {PURCHASE_TYPES[inputs.purchaseType].hasAppreciation && Math.abs(inputs.appreciationRate || 0) > 0 && (
                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Price Projection</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current price:</span>
                      <span className="font-medium">{formatCurrency(inputs.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Projected price ({inputs.desiredTimelineMonths}m):</span>
                      <span className="font-bold text-primary">{formatCurrency(projectedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {inputs.appreciationRate! > 0 ? 'Depreciation' : 'Appreciation'} rate:
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {formatPercentage(Math.abs(inputs.appreciationRate!) * 100)} annually
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

                            {/* Selected Scenario Info */}
                            {selectedScenario && (
                              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Selected Scenario</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Savings Rate:</span>
                                    <span className="font-medium">
                                      {scenarios.find(s => s.id === selectedScenario)?.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Monthly Amount:</span>
                                    <span className="font-medium">
                                      {formatCurrency(scenarios.find(s => s.id === selectedScenario)?.monthlyAmount || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Timeline:</span>
                                    <span className="font-medium">
                                      {scenarios.find(s => s.id === selectedScenario)?.timelineMonths} months
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Save Plan Button */}
                            <Button
                onClick={() => {
                  if (inputs.targetAmount <= 0) {
                    toast.error('Please enter a valid target amount');
                    return;
                  }
                  setShowSaveModal(true);
                  toast.success('Opening save plan modal');
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={inputs.targetAmount <= 0}
              >
                <Target className="h-4 w-4 mr-2" />
                Save This Plan
                {selectedScenario && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    with scenario
                  </Badge>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios Analysis */}
        <div className="lg:col-span-2">
          <Card className="metric-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Savings Scenarios
              </CardTitle>
              <CardDescription>
                Compare different monthly savings rates to reach your goal. Click any scenario to select it for your plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {scenarios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <AlertTriangle className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No feasible scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Your current income may be too low for this goal. Consider:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Increase Income</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Reduce Target</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium">Extend Timeline</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timeline Validation Note */}
                  {(() => {
                    const { monthlyIncome, monthlyCashFlow } = financialMetrics;
                    const { targetAmount, currentSaved, desiredTimelineMonths } = inputs;
                    const requiredMonthlySavings = (targetAmount - currentSaved) / desiredTimelineMonths;
                    const maxAffordableSavings = monthlyCashFlow;
                    
                    if (requiredMonthlySavings > maxAffordableSavings && monthlyCashFlow > 0) {
                      return (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                                Timeline Too Aggressive
                              </h4>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                                To reach {formatCurrency(targetAmount)} in {desiredTimelineMonths} months, you need to save {formatCurrency(requiredMonthlySavings)} monthly, 
                                but your current monthly surplus is only {formatCurrency(monthlyCashFlow)}.
                              </p>
                              <div className="text-xs text-orange-600 dark:text-orange-400">
                                <p>• Required monthly savings: {formatCurrency(requiredMonthlySavings)}</p>
                                <p>• Available monthly surplus: {formatCurrency(monthlyCashFlow)}</p>
                                <p>• Shortfall: {formatCurrency(requiredMonthlySavings - monthlyCashFlow)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    if (monthlyCashFlow <= 0) {
                      return (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                                No Monthly Surplus Available
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                Your monthly expenses ({formatCurrency(monthlyIncome)}) exceed your monthly income ({formatCurrency(monthlyIncome)}), 
                                leaving no surplus for savings.
                              </p>
                              <div className="text-xs text-red-600 dark:text-red-400">
                                <p>• Monthly income: {formatCurrency(monthlyIncome)}</p>
                                <p>• Monthly expenses: {formatCurrency(financialMetrics.monthlyExpenses)}</p>
                                <p>• Monthly surplus: {formatCurrency(monthlyCashFlow)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                                    })()}

                  {/* Recommended Scenario */}
                  {recommendedScenario && (
                    <div 
                      onClick={() => handleScenarioSelection(selectedScenario === recommendedScenario.id ? null : recommendedScenario.id)}
                      className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        selectedScenario === recommendedScenario.id
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                              Recommended Plan
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${recommendedScenario.color} ${recommendedScenario.borderColor}`}
                            >
                              {recommendedScenario.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedScenario === recommendedScenario.id && (
                              <Badge variant="default" className="text-xs bg-primary">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Best balance of timeline and financial health
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <PiggyBank className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-green-700 dark:text-green-300">Monthly Savings</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              {formatCurrency(recommendedScenario.monthlyAmount)}
                            </p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {formatPercentage(recommendedScenario.savingsRate * 100)} of income
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-green-700 dark:text-green-300">Timeline</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              {recommendedScenario.timelineMonths} months
                            </p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {Math.round(recommendedScenario.timelineMonths / 12 * 10) / 10} years
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <Wallet className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-green-700 dark:text-green-300">Remaining Surplus</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              {formatCurrency(recommendedScenario.impactOnEmergencyFund)}
                            </p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              Available monthly
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Scenarios */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        All Scenarios
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOrder = scenarioSortOrder === 'desc' ? 'asc' : 'desc';
                          setScenarioSortOrder(newOrder);
                          toast.success(`Scenarios sorted by ${newOrder === 'desc' ? 'highest' : 'lowest'} savings rate first`);
                        }}
                        className="text-xs"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {scenarioSortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {scenarios.map((scenario) => (
                        <div 
                          key={scenario.id}
                          onClick={() => scenario.feasible && handleScenarioSelection(selectedScenario === scenario.id ? null : scenario.id)}
                          className={`group p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                            scenario.feasible 
                              ? selectedScenario === scenario.id
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary/30' 
                              : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${scenario.bgColor}`}>
                                <PiggyBank className={`h-4 w-4 ${scenario.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{scenario.name}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${scenario.color} ${scenario.borderColor}`}
                                  >
                                    {scenario.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedScenario === scenario.id && (
                                    <Badge variant="default" className="text-xs bg-primary">
                                      Selected
                                    </Badge>
                                  )}
                                  {!scenario.feasible && (
                                    <Badge variant="destructive" className="text-xs">
                                      Not feasible
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {formatCurrency(scenario.monthlyAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">per month</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Timeline: <span className="font-medium">{scenario.timelineMonths} months</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Remaining Surplus: <span className="font-medium">{formatCurrency(scenario.impactOnEmergencyFund)}</span></span>
                            </div>
                          </div>

                          {/* Progress visualization */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress to goal</span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round((inputs.currentSaved / inputs.targetAmount) * 100)}%
                              </Badge>
                            </div>
                            <Progress 
                              value={(inputs.currentSaved / inputs.targetAmount) * 100} 
                              className="h-3"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Category Legend */}
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <h5 className="font-medium text-sm mb-3 text-center">Savings Rate Categories</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/50 rounded border border-green-200 dark:border-green-800"></div>
                          <span className="text-green-600 font-medium">Conservative</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/50 rounded border border-blue-200 dark:border-blue-800"></div>
                          <span className="text-blue-600 font-medium">Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/50 rounded border border-orange-200 dark:border-orange-800"></div>
                          <span className="text-orange-600 font-medium">Aggressive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/50 rounded border border-red-200 dark:border-red-800"></div>
                          <span className="text-red-600 font-medium">Very Aggressive</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/50 rounded border border-purple-200 dark:border-purple-800"></div>
                        <span className="text-purple-600 font-medium text-xs">Extreme</span>
                      </div>
                    </div>

                    {/* Instruction text */}
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        💡 Click any scenario above to select it for your purchase plan
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Purchase Plans */}
      <Card className="metric-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Saved Purchase Plans
          </CardTitle>
          <CardDescription>
            Your previously saved purchase plans for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {purchasePlans.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No saved plans yet</h3>
              <p className="text-muted-foreground">
                Save your current purchase plan to access it later
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {purchasePlans.map((plan) => {
                const purchaseType = PURCHASE_TYPES[plan.purchaseType];
                const Icon = purchaseType.icon;
                
                return (
                  <div 
                    key={plan.id}
                    className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Icon className={`h-4 w-4 ${purchaseType.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {purchaseType.label} • {formatCurrency(plan.targetAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadPurchasePlan(plan)}
                          className="text-xs"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
                              deletePurchasePlan(plan.id);
                            } else {
                              toast('Delete cancelled');
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Timeline:</span>
                        <p className="font-medium">{plan.desiredTimelineMonths} months</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Saved:</span>
                        <p className="font-medium">{formatCurrency(plan.currentSaved)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <p className="font-medium">{plan.updatedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      {recommendedScenario && (
        <Card className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Financial Impact Analysis
            </CardTitle>
            <CardDescription>
              How this purchase plan affects your overall financial health
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Emergency Fund Impact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Emergency Fund</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Current runway:</span>
                      <Badge variant="outline">{financialMetrics.emergencyRunway.toFixed(1)} months</Badge>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">After purchase plan:</span>
                      <Badge variant="outline">
                        {(financialMetrics.emergencyRunway - 
                          (recommendedScenario.monthlyAmount / financialMetrics.monthlyExpenses)
                        ).toFixed(1)} months
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(100, ((financialMetrics.emergencyRunway - 
                        (recommendedScenario.monthlyAmount / financialMetrics.monthlyExpenses)) / 6) * 100
                      )} 
                      className="h-3" 
                    />
                  </div>
                  <div className={`p-3 rounded-lg ${
                    financialMetrics.emergencyRunway < 3 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  }`}>
                    <p className="text-sm font-medium">
                      {financialMetrics.emergencyRunway < 3 
                        ? 'Consider building emergency fund first'
                        : 'Emergency fund remains healthy'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings Rate Impact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Overall Savings Rate</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Current rate:</span>
                      <Badge variant="outline">{formatPercentage(financialMetrics.savingsRate)}</Badge>
                    </div>
                                      <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">New rate:</span>
                    <Badge variant="outline">
                      {formatPercentage(((financialMetrics.monthlyCashFlow - recommendedScenario.monthlyAmount) / financialMetrics.monthlyIncome) * 100)}
                    </Badge>
                  </div>
                  <Progress 
                    value={((financialMetrics.monthlyCashFlow - recommendedScenario.monthlyAmount) / financialMetrics.monthlyIncome) * 100} 
                    className="h-3" 
                  />
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium">
                      Target: 20% savings rate for healthy finances
                    </p>
                  </div>
                </div>
              </div>

              {/* Goal Impact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">Existing Goals</h4>
                </div>
                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No existing goals to impact</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">Active goals:</span>
                          <Badge variant="outline">{goals.filter(g => !g.isCompleted).length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {goals.slice(0, 2).map(goal => (
                            <div key={goal.id} className="flex justify-between text-sm">
                              <span className="truncate font-medium">{goal.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm font-medium">
                          This purchase may delay other goals. Consider prioritizing based on urgency.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Smart Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Positive Insights
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        Your target is achievable with {formatPercentage(recommendedScenario.savingsRate * 100)} monthly savings
                      </p>
                    </div>
                    {financialMetrics.emergencyRunway > 6 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Strong emergency fund allows for aggressive saving
                        </p>
                      </div>
                    )}
                    {recommendedScenario.timelineMonths <= inputs.desiredTimelineMonths && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          You can meet your desired timeline
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Considerations
                  </h5>
                  <div className="space-y-3">
                    {financialMetrics.emergencyRunway < 3 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Consider building emergency fund to 3-6 months first
                        </p>
                      </div>
                    )}
                    {recommendedScenario.timelineMonths > inputs.desiredTimelineMonths * 1.5 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Consider increasing income or extending timeline for better balance
                        </p>
                      </div>
                    )}
                    {((financialMetrics.monthlyCashFlow - recommendedScenario.monthlyAmount) / financialMetrics.monthlyIncome) * 100 < 10 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          Low remaining cash flow may impact financial flexibility
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Plan Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Save Purchase Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Give your plan a name to save it for later
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="plan-name" className="text-sm font-medium">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., House Down Payment Plan"
                  className="mt-1"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Plan Summary:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{PURCHASE_TYPES[inputs.purchaseType].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-medium">{formatCurrency(inputs.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="font-medium">{inputs.desiredTimelineMonths} months</span>
                  </div>
                  {selectedScenario && (
                    <div className="flex justify-between">
                      <span>Selected Scenario:</span>
                      <span className="font-medium text-primary">
                        {scenarios.find(s => s.id === selectedScenario)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveModal(false);
                  setPlanName('');
                  toast('Save plan cancelled');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={savePurchasePlan}
                disabled={!planName.trim() || savingPlan}
                className="flex-1"
              >
                {savingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Plan'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
