import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/calculations/index';
import type { Goal, GoalCategory } from '@/types';
import { GOAL_CATEGORIES, GOAL_CATEGORY_CONFIGS } from '@/types';
import { 
  Target, 
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Edit,
  Upload,
  X,
  Shield,
  CreditCard,
  Home,
  Car,
  TrendingUp,
  Plane,
  Briefcase,
  Archive
} from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Shield,
  CreditCard,
  Home,
  Car,
  TrendingUp,
  Plane,
  Briefcase,
  Archive,
};

interface GoalFormData {
  name: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  priority: number;
  category: string;
  image?: File;
}

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GoalForm({ goal, onSubmit, onCancel, isSubmitting = false }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    name: goal?.name || '',
    description: goal?.description || '',
    targetAmount: goal?.targetAmount || 0,
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    priority: goal?.priority || 5,
    category: goal?.category || 'savings',
    image: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(
    goal?.imageUrl || null
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Goal name is too long (max 100 characters)';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description is too long (max 500 characters)';
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
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
      await onSubmit({
        ...formData,
        targetDate: formData.targetDate,
      });
    } catch (error) {
      console.error('Error submitting goal form:', error);
    }
  };

  const updateFormData = (field: keyof GoalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous image error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImagePreview(goal?.imageUrl || null);
  };

  const isEditing = !!goal;
  const categoryConfig = GOAL_CATEGORY_CONFIGS[formData.category as keyof typeof GOAL_CATEGORY_CONFIGS];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {isEditing ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">
              {isEditing ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? 'Update your goal details' : 'Set a new financial target to achieve'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Goal Name
            </Label>
            <div className="relative">
              <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Emergency Fund, New Car, House Down Payment"
                className={cn(
                  'pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                  errors.name ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('description', e.target.value)}
                placeholder="Describe your goal and why it's important to you..."
                className={cn(
                  'pl-10 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                  errors.description ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Target Amount & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-sm font-semibold text-foreground">
                Target Amount (RM)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.targetAmount || ''}
                  onChange={(e) => updateFormData('targetAmount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={cn(
                    'pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                    errors.targetAmount ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                  )}
                />
              </div>
              {errors.targetAmount && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>{errors.targetAmount}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate" className="text-sm font-semibold text-foreground">
                Target Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => updateFormData('targetDate', e.target.value)}
                  className={cn(
                    'pl-10 bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all outline-none ring-0 focus-visible:outline-none focus-visible:ring-0',
                    errors.targetDate ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                  )}
                />
              </div>
              {errors.targetDate && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>{errors.targetDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Category & Priority */}
          <div className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-foreground">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger className={cn(
                  'bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all',
                  errors.category ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                  {GOAL_CATEGORIES.map((category: GoalCategory) => {
                    const config = GOAL_CATEGORY_CONFIGS[category];
                    const IconComponent = iconMap[config.icon as keyof typeof iconMap];
                    return (
                      <SelectItem key={category} value={category} className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                        <div className="flex items-center space-x-3">
                          {IconComponent && (
                            <IconComponent className={cn('h-4 w-4', config.color)} />
                          )}
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-foreground">
                Priority Level
              </Label>
              <Select value={formData.priority.toString()} onValueChange={(value) => updateFormData('priority', parseInt(value))}>
                <SelectTrigger className={cn(
                  'bg-gray-50/80 border-gray-200/60 backdrop-blur-sm focus:bg-white/90 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 transition-all',
                  errors.priority ? 'border-destructive focus:border-destructive focus:shadow-destructive/20' : ''
                )}>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent className="z-[300] max-h-[200px] overflow-y-auto bg-white border shadow-lg">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => {
                    const getPriorityColor = (p: number) => {
                      if (p <= 3) return 'bg-red-500';
                      if (p <= 6) return 'bg-yellow-500';
                      return 'bg-green-500';
                    };
                    
                    const getPriorityLabel = (p: number) => {
                      if (p <= 3) return 'High Priority';
                      if (p <= 6) return 'Medium Priority';
                      return 'Low Priority';
                    };

                    return (
                      <SelectItem key={priority} value={priority.toString()} className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={cn('w-3 h-3 rounded-full', getPriorityColor(priority))} />
                          <span>Level {priority}</span>
                          <span className="text-xs text-muted-foreground">({getPriorityLabel(priority)})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Level 1-3: High Priority • Level 4-6: Medium Priority • Level 7-10: Low Priority
              </p>
              {errors.priority && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>{errors.priority}</span>
                </p>
              )}
            </div>
          </div>

          {/* Goal Image */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-semibold text-foreground">
              Goal Image (Optional)
            </Label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Goal preview" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload an image to visualize your goal
                </p>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  Choose Image
                </Button>
              </div>
            )}
            
            {errors.image && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                <span>{errors.image}</span>
              </p>
            )}
          </div>

          {/* Preview */}
          {formData.name && formData.targetAmount && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Preview</h4>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {categoryConfig && (
                    <div className="flex items-center space-x-2">
                      {React.createElement(
                        iconMap[categoryConfig.icon as keyof typeof iconMap] || Target,
                        { className: cn('h-5 w-5', categoryConfig.color) }
                      )}
                      <span className="text-sm text-muted-foreground">{categoryConfig.label}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    formData.priority <= 3 ? 'bg-red-500' :
                    formData.priority <= 6 ? 'bg-yellow-500' : 'bg-green-500'
                  )} />
                  <span className="text-sm text-muted-foreground">
                    Priority {formData.priority} ({
                      formData.priority <= 3 ? 'High' :
                      formData.priority <= 6 ? 'Medium' : 'Low'
                    })
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold">
                {formData.name} - {formatCurrency(formData.targetAmount)}
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {formData.targetDate ? new Date(formData.targetDate).toLocaleDateString() : 'No date set'}
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
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isEditing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{isEditing ? 'Update Goal' : 'Create Goal'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 