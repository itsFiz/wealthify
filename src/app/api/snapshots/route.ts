import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMonthlyIncome, calculateMonthlyExpenses, calculateBurnRate, calculateSavingsRate, calculateHealthScore, calculateMonthlyChange } from '@/lib/calculations/index';
import type { IncomeStream, Expense } from '@/types';

// GET /api/snapshots - Get user's monthly snapshots for trends
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const monthsBack = parseInt(searchParams.get('months') || '6');

    // Get snapshots for the last N months
    const snapshots = await prisma.monthlySnapshot.findMany({
      where: { 
        userId: user.id,
        month: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - monthsBack, 1)
        }
      },
      orderBy: { month: 'desc' },
    });

    // Convert Decimal fields to numbers
    const processedSnapshots = snapshots.map(snapshot => ({
      ...snapshot,
      totalIncome: Number(snapshot.totalIncome),
      totalExpenses: Number(snapshot.totalExpenses),
      totalSavings: Number(snapshot.totalSavings),
      burnRate: Number(snapshot.burnRate),
      savingsRate: Number(snapshot.savingsRate),
      totalGoalsValue: Number(snapshot.totalGoalsValue),
      totalGoalsProgress: Number(snapshot.totalGoalsProgress),
      incomeChangePercent: snapshot.incomeChangePercent ? Number(snapshot.incomeChangePercent) : null,
      expenseChangePercent: snapshot.expenseChangePercent ? Number(snapshot.expenseChangePercent) : null,
      savingsChangePercent: snapshot.savingsChangePercent ? Number(snapshot.savingsChangePercent) : null,
    }));

    return NextResponse.json(processedSnapshots);
  } catch (error) {
    console.error('Error fetching monthly snapshots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/snapshots - Create/update monthly snapshot
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        incomeStreams: { where: { isActive: true } },
        expenses: { where: { isActive: true } },
        goals: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current month (first day)
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Calculate current financial metrics
    const totalIncome = calculateMonthlyIncome(user.incomeStreams as unknown as IncomeStream[]);
    const totalExpenses = calculateMonthlyExpenses(user.expenses as unknown as Expense[]);
    const totalSavings = totalIncome - totalExpenses;
    const burnRate = calculateBurnRate(totalExpenses, totalIncome);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);
    
    // Calculate goal metrics
    const activeGoals = user.goals.filter(goal => !goal.isCompleted);
    const completedGoals = user.goals.filter(goal => goal.isCompleted);
    const totalGoalsValue = user.goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
    const totalGoalsProgress = user.goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
    
    // Calculate health score
    const avgGoalProgress = totalGoalsValue > 0 ? (totalGoalsProgress / totalGoalsValue) * 100 : 0;
    const healthScore = calculateHealthScore(burnRate, savingsRate, avgGoalProgress);

    // Get previous month's snapshot for trend calculation
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const previousSnapshot = await prisma.monthlySnapshot.findUnique({
      where: { 
        userId_month: {
          userId: user.id,
          month: previousMonth
        }
      }
    });

    // Calculate trends
    let incomeChangePercent = null;
    let expenseChangePercent = null;
    let savingsChangePercent = null;
    let healthScoreChange = null;

    if (previousSnapshot) {
      const incomeChange = calculateMonthlyChange(totalIncome, Number(previousSnapshot.totalIncome));
      const expenseChange = calculateMonthlyChange(totalExpenses, Number(previousSnapshot.totalExpenses));
      const savingsChange = calculateMonthlyChange(totalSavings, Number(previousSnapshot.totalSavings));
      
      incomeChangePercent = incomeChange.type === 'positive' ? incomeChange.value : -incomeChange.value;
      expenseChangePercent = expenseChange.type === 'positive' ? expenseChange.value : -expenseChange.value;
      savingsChangePercent = savingsChange.type === 'positive' ? savingsChange.value : -savingsChange.value;
      healthScoreChange = healthScore - previousSnapshot.healthScore;
    }

    // Create or update snapshot
    const snapshot = await prisma.monthlySnapshot.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth
        }
      },
      update: {
        totalIncome,
        totalExpenses,
        totalSavings,
        burnRate,
        savingsRate,
        healthScore,
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        totalGoalsValue,
        totalGoalsProgress,
        incomeStreamsCount: user.incomeStreams.length,
        expensesCount: user.expenses.length,
        incomeChangePercent,
        expenseChangePercent,
        savingsChangePercent,
        healthScoreChange,
      },
      create: {
        userId: user.id,
        month: currentMonth,
        totalIncome,
        totalExpenses,
        totalSavings,
        burnRate,
        savingsRate,
        healthScore,
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        totalGoalsValue,
        totalGoalsProgress,
        incomeStreamsCount: user.incomeStreams.length,
        expensesCount: user.expenses.length,
        incomeChangePercent,
        expenseChangePercent,
        savingsChangePercent,
        healthScoreChange,
      }
    });

    // Convert Decimal fields to numbers
    const processedSnapshot = {
      ...snapshot,
      totalIncome: Number(snapshot.totalIncome),
      totalExpenses: Number(snapshot.totalExpenses),
      totalSavings: Number(snapshot.totalSavings),
      burnRate: Number(snapshot.burnRate),
      savingsRate: Number(snapshot.savingsRate),
      totalGoalsValue: Number(snapshot.totalGoalsValue),
      totalGoalsProgress: Number(snapshot.totalGoalsProgress),
      incomeChangePercent: snapshot.incomeChangePercent ? Number(snapshot.incomeChangePercent) : null,
      expenseChangePercent: snapshot.expenseChangePercent ? Number(snapshot.expenseChangePercent) : null,
      savingsChangePercent: snapshot.savingsChangePercent ? Number(snapshot.savingsChangePercent) : null,
    };

    return NextResponse.json(processedSnapshot, { status: 201 });
  } catch (error) {
    console.error('Error creating monthly snapshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 