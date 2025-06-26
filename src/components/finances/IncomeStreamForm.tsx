'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createIncomeStreamSchema } from '@/lib/validations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeStream, IncomeType } from '@/types';
import { X, DollarSign } from 'lucide-react';
import { z } from 'zod';

type FormData = z.infer<typeof createIncomeStreamSchema>;

interface IncomeStreamFormProps {
  incomeStream?: IncomeStream;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const incomeTypeLabels: Record<IncomeType, string> = {
  SALARY: 'Salary',
  BUSINESS: 'Business Revenue',
  FREELANCE: 'Freelance Work',
  INVESTMENT: 'Investment Returns',
  PASSIVE: 'Passive Income',
  OTHER: 'Other',
};

export function IncomeStreamForm({ incomeStream, onSubmit, onCancel }: IncomeStreamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createIncomeStreamSchema),
    defaultValues: incomeStream ? {
      name: incomeStream.name,
      type: incomeStream.type,
      expectedMonthly: incomeStream.expectedMonthly,
      actualMonthly: incomeStream.actualMonthly || undefined,
    } : {
      name: '',
      type: 'SALARY' as IncomeType,
      expectedMonthly: 0,
      actualMonthly: undefined,
    },
  });

  const watchedType = watch('type');

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
                {incomeStream ? 'Edit Income Stream' : 'Add Income Stream'}
              </CardTitle>
              <CardDescription>
                {incomeStream 
                  ? 'Update your income stream details' 
                  : 'Add a new source of income to track your earnings'
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
              <Label htmlFor="name">Income Stream Name</Label>
              <Input
                id="name"
                placeholder="e.g., Full-time Salary, Freelance Projects"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Income Type</Label>
              <Select
                value={watchedType}
                onValueChange={(value: string) => setValue('type', value as IncomeType)}
              >
                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select income type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(incomeTypeLabels).map(([value, label]) => (
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

            <div className="space-y-2">
              <Label htmlFor="expectedMonthly">Expected Monthly Amount (RM)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expectedMonthly"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`pl-10 ${errors.expectedMonthly ? 'border-destructive' : ''}`}
                  {...register('expectedMonthly', { valueAsNumber: true })}
                />
              </div>
              {errors.expectedMonthly && (
                <p className="text-sm text-destructive">{errors.expectedMonthly.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualMonthly">Actual Monthly Amount (RM)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="actualMonthly"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Leave empty to use expected amount"
                  className={`pl-10 ${errors.actualMonthly ? 'border-destructive' : ''}`}
                  {...register('actualMonthly', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                />
              </div>
              {errors.actualMonthly && (
                <p className="text-sm text-destructive">{errors.actualMonthly.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional: Enter actual amount if different from expected
              </p>
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
                {isSubmitting ? 'Saving...' : incomeStream ? 'Update' : 'Add Income Stream'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 