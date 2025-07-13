import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { goalContributionSchema } from '@/lib/validations';
import { z } from 'zod';
import { IncomeType, Frequency, ExpenseCategory, ExpenseType } from '@/types';

// GET /api/goals/[id]/contributions - Get contributions for a specific goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const contributions = await prisma.goalContribution.findMany({
      where: { goalId: id },
      orderBy: { month: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const contributionsWithNumbers = contributions.map(contribution => ({
      ...contribution,
      amount: Number(contribution.amount),
    }));

    return NextResponse.json(contributionsWithNumbers);
  } catch (error) {
    console.error('Error fetching goal contributions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals/[id]/contributions - Add new contribution to goal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await request.json();
    
    console.log('🔍 Raw request body:', body);
    console.log('🔍 Body keys:', Object.keys(body));
    console.log('🔍 Amount:', body.amount, 'Type:', typeof body.amount);
    console.log('🔍 Month:', body.month, 'Type:', typeof body.month);
    
    // Validate and convert amount
    const processedAmount = Number(body.amount);
    if (isNaN(processedAmount) || processedAmount <= 0) {
      console.error('❌ Invalid amount:', body.amount);
      return NextResponse.json({ 
        error: 'Invalid amount', 
        details: { amount: body.amount }
      }, { status: 400 });
    }

    // Validate and convert date
    let processedMonth;
    try {
      // body.month will always be a string from JSON.parse
      processedMonth = new Date(body.month);
      if (isNaN(processedMonth.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      console.error('❌ Invalid date:', body.month, error);
      return NextResponse.json({ 
        error: 'Invalid date format', 
        details: { month: body.month }
      }, { status: 400 });
    }

    const processedBody = {
      ...body,
      amount: processedAmount,
      month: processedMonth,
    };



    console.log('🔍 About to validate:', processedBody);
    const validatedData = goalContributionSchema.parse(processedBody);
    console.log('🔍 Validation successful:', validatedData);

    // Calculate the actual balance based on income/expenses/goal contributions
    const userIncomeStreams = await prisma.incomeStream.findMany({
      where: { userId: user.id, isActive: true },
    });

    const userExpenses = await prisma.expense.findMany({
      where: { userId: user.id, isActive: true },
    });

    const userGoalContributions = await prisma.goalContribution.findMany({
      where: { goal: { userId: user.id } },
      include: { goal: true },
    });

    // Convert to the format expected by calculateAccumulatedBalance
    const incomeStreamsForCalculation = userIncomeStreams.map(stream => ({
      ...stream,
      expectedMonthly: Number(stream.expectedMonthly),
      actualMonthly: stream.actualMonthly ? Number(stream.actualMonthly) : Number(stream.expectedMonthly),
      earnedDate: stream.earnedDate || undefined, // Convert null to undefined
      endDate: stream.endDate || undefined, // Convert null to undefined
      createdAt: stream.createdAt,
      isActive: stream.isActive,
      type: stream.type as IncomeType, // Cast Prisma enum to TypeScript enum
      frequency: stream.frequency as Frequency, // Cast Prisma enum to TypeScript enum
    }));

    const expensesForCalculation = userExpenses.map(expense => ({
      ...expense,
      amount: Number(expense.amount),
      incurredDate: expense.incurredDate || undefined, // Convert null to undefined
      endDate: expense.endDate || undefined, // Convert null to undefined
      createdAt: expense.createdAt,
      isActive: expense.isActive,
      category: expense.category as ExpenseCategory, // Cast Prisma enum to TypeScript enum
      type: expense.type as ExpenseType, // Cast Prisma enum to TypeScript enum
      frequency: expense.frequency as Frequency, // Cast Prisma enum to TypeScript enum
    }));

    const goalContributionsForCalculation = userGoalContributions.map(contrib => ({
      amount: Number(contrib.amount),
      month: contrib.month,
    }));

    // Import the calculation function
    const { calculateAccumulatedBalance } = await import('@/lib/calculations/index');
    
    const startingBalance = Number(user.startingBalance || 0);
    const balanceCalculation = calculateAccumulatedBalance(
      startingBalance,
      incomeStreamsForCalculation,
      expensesForCalculation,
      goalContributionsForCalculation
    );

    const actualBalance = balanceCalculation.currentCalculatedBalance;
    const databaseBalance = Number(user.currentBalance || 0);
    
    console.log('🔍 Starting balance:', startingBalance);
    console.log('🔍 Database balance:', databaseBalance);
    console.log('🔍 Calculated balance:', actualBalance);
    console.log('🔍 Required amount:', validatedData.amount);
    console.log('🔍 Balance check:', actualBalance < validatedData.amount);
    
    if (actualBalance < validatedData.amount) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        details: {
          required: validatedData.amount,
          available: actualBalance,
          shortfall: validatedData.amount - actualBalance
        }
      }, { status: 400 });
    }

    console.log('🔍 Starting database transaction...');
    // Create the contribution and update balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the contribution
      const contribution = await tx.goalContribution.create({
        data: {
          goalId: id,
          amount: validatedData.amount,
          month: validatedData.month,
          notes: validatedData.notes,
        },
      });

      // Update goal's current amount
      const updatedGoal = await tx.goal.update({
        where: { id: id },
        data: {
          currentAmount: {
            increment: validatedData.amount,
          },
          // Auto-complete goal if target is reached or exceeded
          isCompleted: Number(goal.currentAmount) + validatedData.amount >= Number(goal.targetAmount),
        },
        include: {
          contributions: {
            orderBy: { month: 'desc' },
            take: 12,
          },
        },
      });

      // Update user's current balance to the new calculated balance after contribution
      const newBalanceAfterContribution = actualBalance - validatedData.amount;
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          currentBalance: newBalanceAfterContribution,
        },
      });

      // Create balance entry for tracking the contribution
      const balanceEntry = await tx.balanceEntry.create({
        data: {
          userId: user.id,
          amount: Number(updatedUser.currentBalance),
          previousAmount: actualBalance, // Use actual calculated balance as previous
          changeAmount: -validatedData.amount,
          entryType: 'GOAL_CONTRIBUTION',
          notes: `Contribution to goal: ${goal.name}${validatedData.notes ? ` - ${validatedData.notes}` : ''}`,
        },
      });

      console.log('🔍 Database transaction completed successfully');
      return { contribution, updatedGoal, updatedUser, balanceEntry };
    });

    // Convert Decimal fields to numbers for JSON serialization
    const contributionWithNumbers = {
      ...result.contribution,
      amount: Number(result.contribution.amount),
    };

    const goalWithNumbers = {
      ...result.updatedGoal,
      targetAmount: Number(result.updatedGoal.targetAmount),
      currentAmount: Number(result.updatedGoal.currentAmount),
      initialAssetPrice: result.updatedGoal.initialAssetPrice ? Number(result.updatedGoal.initialAssetPrice) : undefined,
      depreciationRate: result.updatedGoal.depreciationRate ? Number(result.updatedGoal.depreciationRate) : undefined,
      downPaymentRatio: result.updatedGoal.downPaymentRatio ? Number(result.updatedGoal.downPaymentRatio) : undefined,
      projectedPrice: result.updatedGoal.projectedPrice ? Number(result.updatedGoal.projectedPrice) : undefined,
      contributions: result.updatedGoal.contributions?.map(contrib => ({
        ...contrib,
        amount: Number(contrib.amount),
      })) || [],
    };

    const balanceEntryWithNumbers = {
      ...result.balanceEntry,
      amount: Number(result.balanceEntry.amount),
      previousAmount: Number(result.balanceEntry.previousAmount),
      changeAmount: Number(result.balanceEntry.changeAmount),
    };

    return NextResponse.json({ 
      contribution: contributionWithNumbers,
      goal: goalWithNumbers,
      balanceEntry: balanceEntryWithNumbers,
      newBalance: Number(result.updatedUser.currentBalance),
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error caught in catch block:', error);
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      console.error('❌ Validation error details:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error creating goal contribution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
} 