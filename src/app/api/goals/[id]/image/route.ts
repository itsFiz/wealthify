import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_KEY!
  }
});

export async function DELETE(
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

    // Get goal and verify ownership
    const goal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (!goal.imageUrl) {
      return NextResponse.json({ error: 'No image to delete' }, { status: 400 });
    }

    try {
      // Extract filename from URL
      const urlParts = goal.imageUrl.split('/');
      const filename = urlParts.slice(-3).join('/'); // goals/{userId}/{filename}

      // Delete from R2
      const deleteCommand = new DeleteObjectCommand({
        Bucket: 'f12',
        Key: filename
      });

      await s3Client.send(deleteCommand);

      // Update goal to remove image URL
      const updatedGoal = await prisma.goal.update({
        where: { id: id },
        data: { imageUrl: null },
        include: {
          contributions: true,
        },
      });

      // Convert Decimal fields to numbers for JSON serialization
      const goalWithNumbers = {
        ...updatedGoal,
        targetAmount: Number(updatedGoal.targetAmount),
        currentAmount: Number(updatedGoal.currentAmount),
        initialAssetPrice: updatedGoal.initialAssetPrice ? Number(updatedGoal.initialAssetPrice) : undefined,
        depreciationRate: updatedGoal.depreciationRate ? Number(updatedGoal.depreciationRate) : undefined,
        downPaymentRatio: updatedGoal.downPaymentRatio ? Number(updatedGoal.downPaymentRatio) : undefined,
        projectedPrice: updatedGoal.projectedPrice ? Number(updatedGoal.projectedPrice) : undefined,
        contributions: updatedGoal.contributions?.map(contribution => ({
          ...contribution,
          amount: Number(contribution.amount),
        })) || [],
      };

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        goal: goalWithNumbers
      });

    } catch (deleteError) {
      console.error('Error deleting file from R2:', deleteError);
      
      // Still update database even if R2 deletion fails
      const updatedGoal = await prisma.goal.update({
        where: { id: id },
        data: { imageUrl: null },
        include: {
          contributions: true,
        },
      });

      // Convert Decimal fields to numbers for JSON serialization
      const goalWithNumbers = {
        ...updatedGoal,
        targetAmount: Number(updatedGoal.targetAmount),
        currentAmount: Number(updatedGoal.currentAmount),
        initialAssetPrice: updatedGoal.initialAssetPrice ? Number(updatedGoal.initialAssetPrice) : undefined,
        depreciationRate: updatedGoal.depreciationRate ? Number(updatedGoal.depreciationRate) : undefined,
        downPaymentRatio: updatedGoal.downPaymentRatio ? Number(updatedGoal.downPaymentRatio) : undefined,
        projectedPrice: updatedGoal.projectedPrice ? Number(updatedGoal.projectedPrice) : undefined,
        contributions: updatedGoal.contributions?.map(contribution => ({
          ...contribution,
          amount: Number(contribution.amount),
        })) || [],
      };

      return NextResponse.json({
        success: true,
        message: 'Image reference deleted from database (file may still exist in storage)',
        goal: goalWithNumbers
      });
    }

  } catch (error) {
    console.error('Error deleting goal image:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 