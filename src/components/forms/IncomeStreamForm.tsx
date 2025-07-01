import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { IncomeStream, IncomeType, Frequency } from '@/types';
import { 
  DollarSign,
  Briefcase,
  TrendingUp,
  Building,
  Users,
  Banknote,
  Wallet,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

interface IncomeStreamFormData {
  name: string;
  type: IncomeType;
  expectedMonthly: number;
  actualMonthly?: number;
  frequency: Frequency;
  isActive: boolean;
  earnedDate: string; // Date when income was earned/received
}

interface IncomeStreamFormProps {
  incomeStream?: IncomeStream;
  onSubmit: (data: IncomeStreamFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const incomeTypes = [
  { value: 'SALARY' as const, label: 'Salary', icon: Briefcase, color: 'text-blue-500' },
  { value: 'FREELANCE' as const, label: 'Freelance', icon: Users, color: 'text-green-500' },
  { value: 'BUSINESS' as const, label: 'Business', icon: Building, color: 'text-purple-500' },
  { value: 'INVESTMENT' as const, label: 'Investment', icon: TrendingUp, color: 'text-orange-500' },
  { value: 'PASSIVE' as const, label: 'Passive Income', icon: Wallet, color: 'text-cyan-500' },
  { value: 'OTHER' as const, label: 'Other', icon: Banknote, color: 'text-gray-500' },
];

const frequencies = [
  { value: 'MONTHLY' as const, label: 'Monthly', icon: Calendar, color: 'text-blue-500', description: 'Recurring monthly income' },
  { value: 'WEEKLY' as const, label: 'Weekly', icon: CalendarDays, color: 'text-green-500', description: 'Recurring weekly income' },
  { value: 'YEARLY' as const, label: 'Yearly', icon: CalendarRange, color: 'text-purple-500', description: 'Annual income (bonus, etc.)' },
  { value: 'ONE_TIME' as const, label: 'One-time', icon: Clock, color: 'text-orange-500', description: 'Single payment or project' },
];

export function IncomeStreamForm({ incomeStream, onSubmit, onCancel, isSubmitting = false }: IncomeStreamFormProps) {
  const [formData, setFormData] = useState<IncomeStreamFormData>({
    name: incomeStream?.name || '',
    type: incomeStream?.type || ('SALARY' as IncomeType),
    expectedMonthly: incomeStream?.expectedMonthly || 0,
    actualMonthly: incomeStream?.actualMonthly || undefined,
    frequency: incomeStream?.frequency || ('MONTHLY' as Frequency),
    isActive: incomeStream?.isActive ?? true,
    earnedDate: incomeStream?.earnedDate 
      ? new Date(incomeStream.earnedDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0], // Default to today's date if no existing date
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Income stream name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name is too long';
    }

    if (!formData.expectedMonthly || formData.expectedMonthly <= 0) {
      newErrors.expectedMonthly = 'Expected monthly amount must be greater than 0';
    }

    if (formData.actualMonthly !== undefined && formData.actualMonthly < 0) {
      newErrors.actualMonthly = 'Actual monthly amount cannot be negative';
    }

    if (!formData.type) {
      newErrors.type = 'Please select an income type';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Please select a frequency';
    }

    if (!formData.earnedDate) {
      newErrors.earnedDate = 'Please select the date when income was earned';
    } else {
      const earnedDate = new Date(formData.earnedDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (earnedDate > today) {
        newErrors.earnedDate = 'Earned date cannot be in the future';
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
      console.error('Error submitting income stream form:', error);
    }
  };

  const updateFormData = (field: keyof IncomeStreamFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = incomeTypes.find(t => t.value === type);
    return typeData ? typeData.icon : DollarSign;
  };

  const getTypeColor = (type: string) => {
    const typeData = incomeTypes.find(t => t.value === type);
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
          <DollarSign className="h-6 w-6 text-primary" />
          <span>{incomeStream ? 'Edit Income Stream' : 'Add Income Stream'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Income Stream Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Income Stream Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Main Job, Freelance Work, Side Business"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Income Type and Frequency Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Income Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Income Type</Label>
              <Select 
                value={formData.type}
                onValueChange={(value: string) => updateFormData('type', value as IncomeType)}
              >
                <SelectTrigger className={cn(
                  "w-full bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0",
                  errors.type ? 'border-destructive' : ''
                )}>
                  <SelectValue placeholder="Select income type">
                    {formData.type && (
                      <div className="flex items-center space-x-2">
                        {React.createElement(getTypeIcon(formData.type), {
                          className: cn('h-4 w-4', getTypeColor(formData.type))
                        })}
                        <span>
                          {incomeTypes.find(t => t.value === formData.type)?.label}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[300] bg-white/98 backdrop-blur-xl border border-gray-200/60 shadow-2xl outline-none ring-0" position="popper" sideOffset={4}>
                  {incomeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="focus:bg-primary/10 hover:bg-primary/5 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0">
                      <div className="flex items-center space-x-2">
                        <type.icon className={cn('h-4 w-4', type.color)} />
                        <span>{type.label}</span>
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

          {/* Expected Monthly Amount */}
          <div className="space-y-2">
            <Label htmlFor="expectedMonthly">
              {formData.frequency === 'MONTHLY' ? 'Monthly Amount (RM)' : 
               formData.frequency === 'WEEKLY' ? 'Weekly Amount (RM) - Will convert to monthly' :
               formData.frequency === 'YEARLY' ? 'Yearly Amount (RM) - Will convert to monthly' :
               'One-time Amount (RM) - Will convert to monthly'}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="expectedMonthly"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.expectedMonthly || ''}
                onChange={(e) => updateFormData('expectedMonthly', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={cn(
                  'pl-10',
                  errors.expectedMonthly ? 'border-destructive' : ''
                )}
              />
            </div>
            {formData.frequency !== 'MONTHLY' && formData.expectedMonthly > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                {formData.frequency === 'WEEKLY' && 
                  `Monthly equivalent: RM ${(formData.expectedMonthly * 4.33).toFixed(2)}`}
                {formData.frequency === 'YEARLY' && 
                  `Monthly equivalent: RM ${(formData.expectedMonthly / 12).toFixed(2)}`}
                {formData.frequency === 'ONE_TIME' && 
                  `Monthly impact: RM ${formData.expectedMonthly.toFixed(2)} (one-time)`}
              </div>
            )}
            {errors.expectedMonthly && (
              <p className="text-sm text-destructive">{errors.expectedMonthly}</p>
            )}
          </div>

          {/* Actual Monthly Amount */}
          <div className="space-y-2">
            <Label htmlFor="actualMonthly">
              Actual Amount (RM) - Optional
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="actualMonthly"
                type="number"
                step="0.01"
                min="0"
                value={formData.actualMonthly || ''}
                onChange={(e) => updateFormData('actualMonthly', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
                className={cn(
                  'pl-10',
                  errors.actualMonthly ? 'border-destructive' : ''
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Leave empty to use expected amount for calculations
            </p>
            {errors.actualMonthly && (
              <p className="text-sm text-destructive">{errors.actualMonthly}</p>
            )}
          </div>

          {/* Earned Date */}
          <div className="space-y-2">
            <Label htmlFor="earnedDate">
              Date Earned/Received
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="earnedDate"
                type="date"
                value={formData.earnedDate}
                onChange={(e) => updateFormData('earnedDate', e.target.value)}
                className={cn(
                  'pl-10',
                  errors.earnedDate ? 'border-destructive' : ''
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.frequency === 'ONE_TIME' 
                ? 'When did you receive this one-time income?' 
                : 'Date this income amount was received (e.g., last pay date)'}
            </p>
            {errors.earnedDate && (
              <p className="text-sm text-destructive">{errors.earnedDate}</p>
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
                  {incomeStream ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {incomeStream ? 'Update Income Stream' : 'Create Income Stream'}
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