import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Goal, GoalContribution } from '@/types';
import { 
  Target, 
  DollarSign,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';

interface ContributionFormData {
  amount: number;
  month: Date;
  notes?: string;
}

interface ContributionFormProps {
  goal: Goal;
  onSubmit: (data: ContributionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ContributionForm({ goal, onSubmit, onCancel, isSubmitting = false }: ContributionFormProps) {
  const [formData, setFormData] = useState<ContributionFormData>({
    amount: 0,
    month: new Date(),
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Contribution amount must be greater than 0';
    }

    if (!formData.month || formData.month > new Date()) {
      newErrors.month = 'Contribution date cannot be in the future';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes are too long (max 500 characters)';
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
      console.error('Error submitting contribution form:', error);
    }
  };

  const updateFormData = (field: keyof ContributionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const progressAfterContribution = Math.min(100, ((goal.currentAmount + formData.amount) / goal.targetAmount) * 100);

  return (
    <div className="w-full max-w-lg mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">
              Add Contribution
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Contribute to "{goal.name}"
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Goal Summary */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Goal Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current</p>
              <p className="font-bold text-green-600">RM{goal.currentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-bold">RM{goal.targetAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-bold text-orange-600">RM{remainingAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Progress</p>
              <p className="font-bold text-blue-600">{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contribution Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
              Contribution Amount (RM)
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
                  'pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                  errors.amount ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.amount}</span>
              </p>
            )}
            
            {/* Quick Amount Suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateFormData('amount', Math.min(remainingAmount, 100))}
                className="text-xs"
              >
                RM100
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateFormData('amount', Math.min(remainingAmount, 500))}
                className="text-xs"
              >
                RM500
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateFormData('amount', Math.min(remainingAmount, 1000))}
                className="text-xs"
              >
                RM1,000
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateFormData('amount', remainingAmount)}
                className="text-xs"
              >
                Complete Goal (RM{remainingAmount.toLocaleString()})
              </Button>
            </div>
          </div>

          {/* Contribution Date */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-semibold text-foreground">
              Contribution Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="month"
                type="date"
                value={formData.month.toISOString().split('T')[0]}
                onChange={(e) => updateFormData('month', new Date(e.target.value))}
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  'pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                  errors.month ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}
              />
            </div>
            {errors.month && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.month}</span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
              Notes (Optional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Add a note about this contribution..."
                rows={3}
                className={cn(
                  'w-full pl-10 pt-3 pb-3 pr-3 bg-gray-50/80 border border-gray-200/60 backdrop-blur-sm rounded-md text-sm placeholder:text-muted-foreground focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all disabled:cursor-not-allowed disabled:opacity-50 resize-none outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                  errors.notes ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}
              />
            </div>
            {errors.notes && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.notes}</span>
              </p>
            )}
          </div>

          {/* Progress Preview */}
          {formData.amount > 0 && (
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
              <div className="text-sm font-semibold text-blue-800 mb-2">
                📊 Progress After Contribution
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New Total:</span>
                  <span className="font-bold">RM{(goal.currentAmount + formData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span className="font-bold text-blue-600">{progressAfterContribution.toFixed(1)}%</span>
                </div>
                {progressAfterContribution >= 100 && (
                  <div className="text-center p-2 bg-green-100 rounded text-green-800 font-semibold text-sm">
                    🎉 Congratulations! You'll complete this goal!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1 bg-gray-100/70 hover:bg-gray-200/70 backdrop-blur-sm border border-gray-200/60"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/95 hover:to-primary/85 shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] transition-all duration-200 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Contribution</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 