import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IncomeStream, IncomeType } from '@/types';
import { 
  Edit, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Briefcase,
  Building,
  Users,
  Wallet,
} from 'lucide-react';

interface IncomeStreamCardProps {
  incomeStream: IncomeStream;
  onEdit: () => void;
  onDelete: () => void;
}

const getIncomeTypeIcon = (type: IncomeType) => {
  switch (type) {
    case 'SALARY':
      return <Briefcase className="h-4 w-4" />;
    case 'BUSINESS':
      return <Building className="h-4 w-4" />;
    case 'FREELANCE':
      return <Users className="h-4 w-4" />;
    case 'INVESTMENT':
      return <TrendingUp className="h-4 w-4" />;
    case 'PASSIVE':
      return <Wallet className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getIncomeTypeColor = (type: IncomeType) => {
  switch (type) {
    case 'SALARY':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'BUSINESS':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'FREELANCE':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'INVESTMENT':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'PASSIVE':
      return 'bg-teal-50 text-teal-700 border-teal-200';
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

const formatIncomeType = (type: IncomeType) => {
  switch (type) {
    case 'SALARY':
      return 'Salary';
    case 'BUSINESS':
      return 'Business';
    case 'FREELANCE':
      return 'Freelance';
    case 'INVESTMENT':
      return 'Investment';
    case 'PASSIVE':
      return 'Passive';
    default:
      return 'Other';
  }
};

export function IncomeStreamCard({ incomeStream, onEdit, onDelete }: IncomeStreamCardProps) {
  const actualAmount = incomeStream.actualMonthly || incomeStream.expectedMonthly;
  const variance = incomeStream.actualMonthly 
    ? ((incomeStream.actualMonthly - incomeStream.expectedMonthly) / incomeStream.expectedMonthly) * 100
    : 0;

  return (
    <Card className="metric-card hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getIncomeTypeColor(incomeStream.type)}`}>
              {getIncomeTypeIcon(incomeStream.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{incomeStream.name}</CardTitle>
              <Badge variant="outline" className={getIncomeTypeColor(incomeStream.type)}>
                {formatIncomeType(incomeStream.type)}
              </Badge>
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
            <span className="text-sm text-muted-foreground">Monthly Amount</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(actualAmount)}
            </span>
          </div>
          
          {incomeStream.actualMonthly && incomeStream.actualMonthly !== incomeStream.expectedMonthly && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Expected</span>
              <span className="text-muted-foreground">
                {formatCurrency(incomeStream.expectedMonthly)}
              </span>
            </div>
          )}
          
          {variance !== 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Variance</span>
              <span className={`font-medium ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${incomeStream.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{incomeStream.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {incomeStream.entries?.length || 0} entries
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 