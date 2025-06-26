import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ArrowRight, 
  ArrowDown,
  ArrowUp,
  Wallet,
  Calendar,
  Info,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations/index';

interface FinancialConceptsExplainerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function FinancialConceptsExplainer({ isOpen = true, onClose }: FinancialConceptsExplainerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'goals' | 'balance'>('overview');

  if (!isOpen) return null;

  const TabButton = ({ tab, icon, label }: { tab: typeof activeTab, icon: React.ReactNode, label: string }) => (
    <Button
      variant={activeTab === tab ? "default" : "ghost"}
      size="sm"
      onClick={() => setActiveTab(tab)}
      className="flex items-center space-x-2"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-6 w-6 text-primary" />
            <span>How Your Financial System Works</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-4">
          <TabButton tab="overview" icon={<Wallet className="h-4 w-4" />} label="Overview" />
          <TabButton tab="income" icon={<TrendingUp className="h-4 w-4" />} label="Income" />
          <TabButton tab="expenses" icon={<TrendingDown className="h-4 w-4" />} label="Expenses" />
          <TabButton tab="goals" icon={<Target className="h-4 w-4" />} label="Goals" />
          <TabButton tab="balance" icon={<DollarSign className="h-4 w-4" />} label="Balance" />
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Financial Flow Overview</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Income Streams</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-green-600">+Balance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Expenses</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-red-600">-Balance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Goal Contributions</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-blue-600">Balance Transfer</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Example Flow</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Starting Balance</span>
                      <span className="font-mono">{formatCurrency(5000)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>+ Monthly Income</span>
                      <span className="font-mono">+{formatCurrency(4000)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>- Monthly Expenses</span>
                      <span className="font-mono">-{formatCurrency(2500)}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Available Balance</span>
                      <span className="font-mono">{formatCurrency(6500)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Goal Contribution</span>
                      <span className="font-mono">→{formatCurrency(1000)}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Final Available</span>
                      <span className="font-mono">{formatCurrency(5500)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Goal Progress</span>
                      <span className="font-mono">{formatCurrency(1000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Income Streams - Money Coming In</span>
              </h3>
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Recurring Income</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Monthly:</strong> Salary, business revenue</li>
                      <li>• <strong>Weekly:</strong> Part-time work, gig income</li>
                      <li>• <strong>Yearly:</strong> Bonuses, tax refunds</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">One-Time Income</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Freelance project payments</li>
                      <li>• Asset sales</li>
                      <li>• Gifts or windfalls</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium mb-2">🔄 Recurring Calculation Example</div>
                  <p className="text-sm text-muted-foreground">
                    If you add a RM3,000/month salary in March 2025, and it's now May 2025:
                    <br />• March: +RM3,000 • April: +RM3,000 • May: +RM3,000
                    <br />• <strong>Total accumulated: RM9,000</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center space-x-2">
                <TrendingDown className="h-5 w-5" />
                <span>Expenses - Money Going Out</span>
              </h3>
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Fixed Expenses</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Rent/mortgage payments</li>
                      <li>• Insurance premiums</li>
                      <li>• Loan payments</li>
                      <li>• Subscriptions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Variable Expenses</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Food and groceries</li>
                      <li>• Transportation</li>
                      <li>• Entertainment</li>
                      <li>• Utilities (varies by usage)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium mb-2">🔄 Recurring Calculation Example</div>
                  <p className="text-sm text-muted-foreground">
                    If you add RM1,500/month rent in March 2025, and it's now May 2025:
                    <br />• March: -RM1,500 • April: -RM1,500 • May: -RM1,500
                    <br />• <strong>Total accumulated: -RM4,500</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Goals - NOT Expenses, But Balance Transfers</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Key Concept: Goals are Internal Transfers</span>
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                      <div className="font-medium text-green-700 mb-1">✅ What Goals Do:</div>
                      <ul className="space-y-1 text-green-700">
                        <li>• Move money from "available" to "committed"</li>
                        <li>• Track progress toward targets</li>
                        <li>• Help with financial discipline</li>
                        <li>• Total balance stays the same</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-red-700 mb-1">❌ What Goals Don't Do:</div>
                      <ul className="space-y-1 text-red-700">
                        <li>• Reduce your total balance</li>
                        <li>• Count as expenses in calculations</li>
                        <li>• Affect your burn rate directly</li>
                        <li>• Leave your financial system</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium mb-2">💡 Example: Car Fund Goal</div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      <div className="font-medium">Before Contribution</div>
                      <div className="font-medium">After Contribution</div>
                      <div className="font-medium">What Changed</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>Available: RM6,500</div>
                      <div>Available: RM5,500</div>
                      <div className="text-blue-600">-RM1,000 available</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>Car Goal: RM0</div>
                      <div>Car Goal: RM1,000</div>
                      <div className="text-blue-600">+RM1,000 committed</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold border-t pt-1">
                      <div>Total: RM6,500</div>
                      <div>Total: RM6,500</div>
                      <div className="text-green-600">No change!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Balance Calculation - The Smart System</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium mb-3">🧮 How Balance is Calculated</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">1</Badge>
                      <span><strong>Starting Balance:</strong> What you manually set</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">2</Badge>
                      <span><strong>+ Accumulated Income:</strong> All income from start dates to now</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">3</Badge>
                      <span><strong>- Accumulated Expenses:</strong> All expenses from start dates to now</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">4</Badge>
                      <span><strong>= Current Balance:</strong> Your actual financial position</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm font-medium mb-2">📅 Timeline Example</div>
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-4 gap-2 font-medium">
                      <div>Month</div>
                      <div>Income</div>
                      <div>Expenses</div>
                      <div>Balance</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>Starting</div>
                      <div>-</div>
                      <div>-</div>
                      <div>RM5,000</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>March 2025</div>
                      <div className="text-green-600">+RM4,000</div>
                      <div className="text-red-600">-RM2,500</div>
                      <div>RM6,500</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>April 2025</div>
                      <div className="text-green-600">+RM4,000</div>
                      <div className="text-red-600">-RM2,500</div>
                      <div>RM8,000</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>May 2025</div>
                      <div className="text-green-600">+RM4,000</div>
                      <div className="text-red-600">-RM2,500</div>
                      <div className="font-semibold">RM9,500</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 