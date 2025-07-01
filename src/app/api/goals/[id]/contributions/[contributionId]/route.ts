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

    // Await the params to get the actual values
    const { id, contributionId } = await params;

    // Verify the goal belongs to the user and get the contribution
    const contribution = await prisma.goalContribution.findFirst({
      where: {
        id: contributionId,
        goalId: id,
        goal: {
          userId: user.id,
        },
      },
      include: {
        goal: true,
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found or access denied' }, 
        { status: 404 }
      );
    }

    // Delete the contribution and update the goal's current amount
    const deletedContribution = await prisma.$transaction(async (tx) => {
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
          isCompleted: contribution.goal.currentAmount.sub(contribution.amount).lt(contribution.goal.targetAmount),
        },
        include: {
          contributions: {
            orderBy: { month: 'desc' }
          }
        }
      });

      return { deleted, updatedGoal };
    });

    // Convert Decimal fields to numbers for JSON serialization
    const response = {
      contribution: {
        ...deletedContribution.deleted,
        amount: Number(deletedContribution.deleted.amount),
      },
      goal: {
        ...deletedContribution.updatedGoal,
        targetAmount: Number(deletedContribution.updatedGoal.targetAmount),
        currentAmount: Number(deletedContribution.updatedGoal.currentAmount),
        initialAssetPrice: deletedContribution.updatedGoal.initialAssetPrice 
          ? Number(deletedContribution.updatedGoal.initialAssetPrice) 
          : null,
        depreciationRate: deletedContribution.updatedGoal.depreciationRate 
          ? Number(deletedContribution.updatedGoal.depreciationRate) 
          : null,
        downPaymentRatio: deletedContribution.updatedGoal.downPaymentRatio 
          ? Number(deletedContribution.updatedGoal.downPaymentRatio) 
          : null,
        projectedPrice: deletedContribution.updatedGoal.projectedPrice 
          ? Number(deletedContribution.updatedGoal.projectedPrice) 
          : null,
        contributions: deletedContribution.updatedGoal.contributions?.map(contrib => ({
          ...contrib,
          amount: Number(contrib.amount),
        })) || [],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 