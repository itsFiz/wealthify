import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/goals/[id]/contributions/[contributionId] - Delete a specific contribution
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contributionId: string }> }
) {
  try {
    const { id, contributionId } = await params;
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

    // Get the contribution and verify goal ownership
    const contribution = await prisma.goalContribution.findFirst({
      where: { 
        id: contributionId,
        goal: {
          id: id,
          userId: user.id,
        },
      },
      include: {
        goal: true,
      },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Delete the contribution and update the goal's current amount in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete the contribution
      const deleted = await tx.goalContribution.delete({
        where: { id: contributionId },
      });

      // Update the goal's current amount by subtracting the deleted contribution
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: {
            decrement: contribution.amount,
          },
          // Check if goal should no longer be marked as completed
          // Use consistent logic: goal is completed only if currentAmount >= targetAmount
          isCompleted: contribution.goal.currentAmount.sub(contribution.amount).gte(contribution.goal.targetAmount),
        },
        include: {
          contributions: {
            orderBy: { month: 'desc' }
          }
        }
      });

      // Update user's current balance by adding back the contribution amount
      const currentBalance = Number(user.currentBalance || 0);
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          currentBalance: {
            increment: contribution.amount,
          },
        },
      });

      // Create balance entry for tracking the contribution reversal
      const balanceEntry = await tx.balanceEntry.create({
        data: {
          userId: user.id,
          amount: Number(updatedUser.currentBalance),
          previousAmount: currentBalance,
          changeAmount: Number(contribution.amount),
          entryType: 'GOAL_CONTRIBUTION',
          notes: `Reversed contribution to goal: ${contribution.goal.name}${contribution.notes ? ` - ${contribution.notes}` : ''}`,
        },
      });

      return { deleted, updatedGoal, updatedUser, balanceEntry };
    });

    // Convert Decimal fields to numbers for JSON serialization
    const deletedContributionWithNumbers = {
      ...result.deleted,
      amount: Number(result.deleted.amount),
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
      contribution: deletedContributionWithNumbers,
      goal: goalWithNumbers,
      balanceEntry: balanceEntryWithNumbers,
      newBalance: Number(result.updatedUser.currentBalance),
    });
  } catch (error) {
    console.error('Error deleting goal contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 