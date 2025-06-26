import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expense, ExpenseCategory, ExpenseType, Frequency } from '@/types';
import { 
  Edit, 
  Trash2, 
  Home,
  Car,
  Utensils,
  Zap,
  Heart,
  Briefcase,
  User,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case 'HOUSING':
      return <Home className="h-4 w-4" />;
    case 'TRANSPORTATION':
      return <Car className="h-4 w-4" />;
    case 'FOOD':
      return <Utensils className="h-4 w-4" />;
    case 'UTILITIES':
      return <Zap className="h-4 w-4" />;
    case 'HEALTHCARE':
      return <Heart className="h-4 w-4" />;
    case 'BUSINESS':
      return <Briefcase className="h-4 w-4" />;
    case 'PERSONAL':
      return <User className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: ExpenseCategory) => {
  switch (category) {
    case 'HOUSING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'TRANSPORTATION':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'FOOD':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'UTILITIES':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'HEALTHCARE':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'BUSINESS':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'PERSONAL':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getTypeColor = (type: ExpenseType) => {
  switch (type) {
    case 'FIXED':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    case 'VARIABLE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'STARTUP_BURN':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCategory = (category: ExpenseCategory) => {
  switch (category) {
    case 'HOUSING':
      return 'Housing';
    case 'TRANSPORTATION':
      return 'Transportation';
    case 'FOOD':
      return 'Food & Dining';
    case 'UTILITIES':
      return 'Utilities';
    case 'ENTERTAINMENT':
      return 'Entertainment';
    case 'HEALTHCARE':
      return 'Healthcare';
    case 'BUSINESS':
      return 'Business';
    case 'PERSONAL':
      return 'Personal';
    default:
      return 'Other';
  }
};

const formatType = (type: ExpenseType) => {
  switch (type) {
    case 'FIXED':
      return 'Fixed';
    case 'VARIABLE':
      return 'Variable';
    case 'STARTUP_BURN':
      return 'Startup Burn';
    default:
      return type;
  }
};

const formatFrequency = (frequency: Frequency) => {
  switch (frequency) {
    case 'MONTHLY':
      return 'Monthly';
    case 'WEEKLY':
      return 'Weekly';
    case 'YEARLY':
      return 'Yearly';
    case 'ONE_TIME':
      return 'One-time';
    default:
      return frequency;
  }
};

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <Card className="metric-card hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)}`}>
              {getCategoryIcon(expense.category)}
            </div>
            <div>
              <CardTitle className="text-lg">{expense.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getCategoryColor(expense.category)}>
                  {formatCategory(expense.category)}
                </Badge>
                <Badge variant="outline" className={getTypeColor(expense.type)}>
                  {formatType(expense.type)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 hover:bg-primary/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold text-red-600">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Frequency</span>
            <span className="font-medium">
              {formatFrequency(expense.frequency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${expense.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{expense.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {expense.entries?.length || 0} entries
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 