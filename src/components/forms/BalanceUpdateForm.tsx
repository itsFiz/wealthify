import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations/index';

interface BalanceUpdateFormProps {
  currentBalance?: number;
  onSubmit: (data: { balance: number; notes?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BalanceUpdateForm({ 
  currentBalance = 0, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: BalanceUpdateFormProps) {
  const [formData, setFormData] = useState({
    balance: currentBalance,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.balance < 0) {
      newErrors.balance = 'Balance cannot be negative';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
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
      console.error('Error updating balance:', error);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const balanceChange = formData.balance - currentBalance;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span>Update Current Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Balance Display */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
            <div className="text-lg font-semibold">{formatCurrency(currentBalance)}</div>
          </div>

          {/* New Balance Input */}
          <div className="space-y-2">
            <Label htmlFor="balance">New Balance (RM)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                value={formData.balance || ''}
                onChange={(e) => updateFormData('balance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`pl-10 ${errors.balance ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.balance && (
              <p className="text-sm text-destructive">{errors.balance}</p>
            )}
          </div>

          {/* Balance Change Display */}
          {balanceChange !== 0 && (
            <div className={`p-3 rounded-lg ${
              balanceChange > 0 ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}>
              <div className="text-sm font-medium">
                {balanceChange > 0 ? 'Increase' : 'Decrease'}: {formatCurrency(Math.abs(balanceChange))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="e.g., Received salary, paid bills, etc."
              className={errors.notes ? 'border-destructive' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes}</p>
            )}
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
                  Updating...
                </>
              ) : (
                <>
                  Update Balance
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