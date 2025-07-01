import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, ExpenseType, Frequency } from '@/types';
import { 
  CreditCard,
  Home,
  Car,
  Utensils,
  Zap,
  Gamepad2,
  Heart,
  Archive,
  DollarSign,
  Briefcase,
  User,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ExpenseFormData {
  name: string;
  category: ExpenseCategory;
  type: ExpenseType;
  amount: number;
  frequency: Frequency;
  isActive: boolean;
  incurredDate: string; // Date when expense was incurred/paid
}

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const expenseCategories = [
  { value: 'HOUSING' as const, label: 'Housing', icon: Home, color: 'text-blue-500' },
  { value: 'TRANSPORTATION' as const, label: 'Transportation', icon: Car, color: 'text-green-500' },
  { value: 'FOOD' as const, label: 'Food & Dining', icon: Utensils, color: 'text-orange-500' },
  { value: 'UTILITIES' as const, label: 'Utilities', icon: Zap, color: 'text-yellow-500' },
  { value: 'HEALTHCARE' as const, label: 'Healthcare', icon: Heart, color: 'text-red-500' },
  { value: 'ENTERTAINMENT' as const, label: 'Entertainment', icon: Gamepad2, color: 'text-purple-500' },
  { value: 'BUSINESS' as const, label: 'Business', icon: Briefcase, color: 'text-cyan-500' },
  { value: 'PERSONAL' as const, label: 'Personal', icon: User, color: 'text-pink-500' },
  { value: 'OTHER' as const, label: 'Other', icon: Archive, color: 'text-gray-500' },
];

const expenseTypes = [
  { value: 'FIXED' as const, label: 'Fixed', icon: Activity, color: 'text-blue-500', description: 'Same amount every period' },
  { value: 'VARIABLE' as const, label: 'Variable', icon: TrendingUp, color: 'text-green-500', description: 'Amount varies period to period' },
  { value: 'STARTUP_BURN' as const, label: 'Startup Burn', icon: Zap, color: 'text-orange-500', description: 'One-time startup expense' },
];

const frequencies = [
  { value: 'MONTHLY' as const, label: 'Monthly', icon: Calendar, color: 'text-blue-500', description: 'Recurring monthly expense' },
  { value: 'WEEKLY' as const, label: 'Weekly', icon: CalendarDays, color: 'text-green-500', description: 'Recurring weekly expense' },
  { value: 'YEARLY' as const, label: 'Yearly', icon: CalendarRange, color: 'text-purple-500', description: 'Annual expense (insurance, etc.)' },
  { value: 'ONE_TIME' as const, label: 'One-time', icon: Clock, color: 'text-orange-500', description: 'Single purchase or payment' },
];

export function ExpenseForm({ expense, onSubmit, onCancel, isSubmitting = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: expense?.name || '',
    category: expense?.category || ('OTHER' as ExpenseCategory),
    type: expense?.type || ('FIXED' as ExpenseType),
    amount: expense?.amount || 0,
    frequency: expense?.frequency || ('MONTHLY' as Frequency),
    isActive: expense?.isActive ?? true,
    incurredDate: expense?.incurredDate 
      ? new Date(expense.incurredDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0], // Default to today's date if no existing date
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name is too long';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a type';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Please select a frequency';
    }

    if (!formData.incurredDate) {
      newErrors.incurredDate = 'Please select the date when expense was incurred';
    } else {
      const incurredDate = new Date(formData.incurredDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (incurredDate > today) {
        newErrors.incurredDate = 'Expense date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting expense form:', error);
    }
  };

  const updateFormData = (field: keyof ExpenseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = expenseCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : CreditCard;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = expenseCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.color : 'text-primary';
  };

  const getTypeIcon = (type: string) => {
    const typeData = expenseTypes.find(t => t.value === type);
    return typeData ? typeData.icon : Activity;
  };

  const getTypeColor = (type: string) => {
    const typeData = expenseTypes.find(t => t.value === type);
    return typeData ? typeData.color : 'text-primary';
  };

  const getFrequencyIcon = (frequency: string) => {
    const frequencyData = frequencies.find(f => f.value === frequency);
    return frequencyData ? frequencyData.icon : Clock;
  };

  const getFrequencyColor = (frequency: string) => {
    const frequencyData = frequencies.find(f => f.value === frequency);
    return frequencyData ? frequencyData.color : 'text-primary';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <span>{expense ? 'Edit Expense' : 'Add Expense'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expense Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Expense Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Rent, Groceries, Car Payment"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category}
              onValueChange={(value: string) => updateFormData('category', value as ExpenseCategory)}
            >
              <SelectTrigger className={cn(
                "w-full bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0",
                errors.category ? 'border-destructive' : ''
              )}>
                <SelectValue placeholder="Select a category">
                  {formData.category && (
                    <div className="flex items-center space-x-2">
                      {React.createElement(getCategoryIcon(formData.category), {
                        className: cn('h-4 w-4', getCategoryColor(formData.category))
                      })}
                      <span>
                        {expenseCategories.find(cat => cat.value === formData.category)?.label}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center space-x-2">
                      <category.icon className={cn('h-4 w-4', category.color)} />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Type and Frequency Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expense Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Expense Type</Label>
              <Select 
                value={formData.type}
                onValueChange={(value: string) => updateFormData('type', value as ExpenseType)}
              >
                <SelectTrigger className={cn(
                  "w-full bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0",
                  errors.type ? 'border-destructive' : ''
                )}>
                  <SelectValue placeholder="Select type">
                    {formData.type && (
                      <div className="flex items-center space-x-2">
                        {React.createElement(getTypeIcon(formData.type), {
                          className: cn('h-4 w-4', getTypeColor(formData.type))
                        })}
                        <span>
                          {expenseTypes.find(t => t.value === formData.type)?.label}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                      <div className="flex items-center space-x-2">
                        <type.icon className={cn('h-4 w-4', type.color)} />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={formData.frequency}
                onValueChange={(value: string) => updateFormData('frequency', value as Frequency)}
              >
                <SelectTrigger className={cn(
                  "w-full bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0",
                  errors.frequency ? 'border-destructive' : ''
                )}>
                  <SelectValue placeholder="Select frequency">
                    {formData.frequency && (
                      <div className="flex items-center space-x-2">
                        {React.createElement(getFrequencyIcon(formData.frequency), {
                          className: cn('h-4 w-4', getFrequencyColor(formData.frequency))
                        })}
                        <span>
                          {frequencies.find(f => f.value === formData.frequency)?.label}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value} className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                      <div className="flex items-center space-x-2">
                        <freq.icon className={cn('h-4 w-4', freq.color)} />
                        <div>
                          <div className="font-medium">{freq.label}</div>
                          <div className="text-xs text-muted-foreground">{freq.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency}</p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              {formData.frequency === 'MONTHLY' ? 'Monthly Amount (RM)' : 
               formData.frequency === 'WEEKLY' ? 'Weekly Amount (RM) - Will convert to monthly' :
               formData.frequency === 'YEARLY' ? 'Yearly Amount (RM) - Will convert to monthly' :
               'One-time Amount (RM) - Will convert to monthly'}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={cn(
                  'pl-10',
                  errors.amount ? 'border-destructive' : ''
                )}
              />
            </div>
            {formData.frequency !== 'MONTHLY' && formData.amount > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                {formData.frequency === 'WEEKLY' && 
                  `Monthly equivalent: RM ${(formData.amount * 4.33).toFixed(2)}`}
                {formData.frequency === 'YEARLY' && 
                  `Monthly equivalent: RM ${(formData.amount / 12).toFixed(2)}`}
                {formData.frequency === 'ONE_TIME' && 
                  `Monthly impact: RM ${formData.amount.toFixed(2)} (one-time)`}
              </div>
            )}
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Incurred Date */}
          <div className="space-y-2">
            <Label htmlFor="incurredDate">
              Date Incurred/Paid
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="incurredDate"
                type="date"
                value={formData.incurredDate}
                onChange={(e) => updateFormData('incurredDate', e.target.value)}
                className={cn(
                  'pl-10',
                  errors.incurredDate ? 'border-destructive' : ''
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.frequency === 'ONE_TIME' 
                ? 'When did you pay this one-time expense?' 
                : 'Date this expense was paid (e.g., bill due date, purchase date)'}
            </p>
            {errors.incurredDate && (
              <p className="text-sm text-destructive">{errors.incurredDate}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select 
              value={formData.isActive.toString()}
              onValueChange={(value: string) => updateFormData('isActive', value === 'true')}
            >
              <SelectTrigger className="bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                <SelectItem value="true" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="false" className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    <span>Inactive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/95 hover:to-primary/85 shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {expense ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {expense ? 'Update Expense' : 'Create Expense'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 