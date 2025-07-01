import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations/index';

interface GoalContribution {
  id: string;
  amount: number;
  month: Date;
  notes?: string;
  createdAt: Date;
}

interface GoalContributionsListProps {
  contributions: GoalContribution[];
  goalName: string;
  onDeleteContribution: (contributionId: string) => Promise<void>;
  isDeleting?: string; // ID of contribution being deleted
}

export function GoalContributionsList({ 
  contributions, 
  goalName, 
  onDeleteContribution,
  isDeleting 
}: GoalContributionsListProps) {

  const sortedContributions = [...contributions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

  if (contributions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Contributions Yet</h3>
          <p className="text-muted-foreground">
            Start building towards your &quot;{goalName}&quot; goal by making your first contribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Contribution History</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {contributions.length} contributions
          </Badge>
        </CardTitle>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Contributed</div>
          <div className="text-xl font-bold text-primary">{formatCurrency(totalContributions)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Balance Transfer Explanation */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">How Goal Contributions Work</span>
          </div>
          <p className="text-xs text-blue-700">
            Contributions move money from your available balance to goal progress. 
            They&apos;re not expenses - your total balance stays the same, but money is now &quot;committed&quot; to this goal.
          </p>
        </div>

        {sortedContributions.map((contribution) => (
          <div 
            key={contribution.id} 
            className="group border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-semibold text-green-600">
                    +{formatCurrency(contribution.amount)}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(contribution.month).toLocaleDateString('en-MY', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(contribution.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {contribution.notes && (
                  <div className="mt-2 flex items-start space-x-2">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{contribution.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteContribution(contribution.id)}
                  disabled={isDeleting === contribution.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {isDeleting === contribution.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Average contribution: {formatCurrency(totalContributions / contributions.length)}
            </span>
            <span className="text-muted-foreground">
              Last contribution: {new Date(Math.max(...contributions.map(c => new Date(c.createdAt).getTime()))).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 