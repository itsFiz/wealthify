'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseSchema } from '@/lib/validations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, ExpenseCategory, ExpenseType, Frequency } from '@/types';
import { X, DollarSign } from 'lucide-react';
import { z } from 'zod';

type FormData = z.infer<typeof createExpenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  HOUSING: 'Housing',
  TRANSPORTATION: 'Transportation',
  FOOD: 'Food & Dining',
  UTILITIES: 'Utilities',
  ENTERTAINMENT: 'Entertainment',
  HEALTHCARE: 'Healthcare',
  BUSINESS: 'Business',
  PERSONAL: 'Personal',
  OTHER: 'Other',
};

const typeLabels: Record<ExpenseType, string> = {
  FIXED: 'Fixed',
  VARIABLE: 'Variable',
  STARTUP_BURN: 'Startup Burn',
};

const frequencyLabels: Record<Frequency, string> = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  YEARLY: 'Yearly',
  ONE_TIME: 'One-time',
};

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: expense ? {
      name: expense.name,
      category: expense.category,
      type: expense.type,
      amount: expense.amount,
      frequency: expense.frequency,
    } : {
      name: '',
      category: 'HOUSING' as ExpenseCategory,
      type: 'FIXED' as ExpenseType,
      amount: 0,
      frequency: 'MONTHLY' as Frequency,
    },
  });

  const watchedCategory = watch('category');
  const watchedType = watch('type');
  const watchedFrequency = watch('frequency');

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {expense ? 'Edit Expense' : 'Add Expense'}
              </CardTitle>
              <CardDescription>
                {expense 
                  ? 'Update your expense details' 
                  : 'Add a new expense to track your spending'
                }
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                placeholder="e.g., Rent, Groceries, Car Payment"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watchedCategory}
                  onValueChange={(value: string) => setValue('category', value as ExpenseCategory)}
                >
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value: string) => setValue('type', value as ExpenseType)}
                >
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (RM)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`pl-10 ${errors.amount ? 'border-destructive' : ''}`}
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={watchedFrequency}
                onValueChange={(value: string) => setValue('frequency', value as Frequency)}
              >
                <SelectTrigger className={errors.frequency ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency.message}</p>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 