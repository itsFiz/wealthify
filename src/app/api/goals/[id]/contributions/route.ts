import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { goalContributionSchema } from '@/lib/validations';
import { z } from 'zod';

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
    
    // Convert date string to Date object for validation
    const processedBody = {
      ...body,
      goalId: id,
      month: new Date(body.month),
    };

    const validatedData = goalContributionSchema.parse(processedBody);

    // Create the contribution
    const contribution = await prisma.goalContribution.create({
      data: {
        goalId: id,
        amount: validatedData.amount,
        month: validatedData.month,
        notes: validatedData.notes,
      },
    });

    // Update goal's current amount
    const updatedGoal = await prisma.goal.update({
      where: { id: id },
      data: {
        currentAmount: {
          increment: validatedData.amount,
        },
        // Auto-complete goal if target is reached
        isCompleted: Number(goal.currentAmount) + validatedData.amount >= Number(goal.targetAmount),
      },
      include: {
        contributions: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const contributionWithNumbers = {
      ...contribution,
      amount: Number(contribution.amount),
    };

    const goalWithNumbers = {
      ...updatedGoal,
      targetAmount: Number(updatedGoal.targetAmount),
      currentAmount: Number(updatedGoal.currentAmount),
      initialAssetPrice: updatedGoal.initialAssetPrice ? Number(updatedGoal.initialAssetPrice) : undefined,
      depreciationRate: updatedGoal.depreciationRate ? Number(updatedGoal.depreciationRate) : undefined,
      downPaymentRatio: updatedGoal.downPaymentRatio ? Number(updatedGoal.downPaymentRatio) : undefined,
      projectedPrice: updatedGoal.projectedPrice ? Number(updatedGoal.projectedPrice) : undefined,
      contributions: updatedGoal.contributions?.map(contrib => ({
        ...contrib,
        amount: Number(contrib.amount),
      })) || [],
    };

    return NextResponse.json({ 
      contribution: contributionWithNumbers,
      goal: goalWithNumbers,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error creating goal contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 