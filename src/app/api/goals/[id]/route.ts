import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateGoalSchema } from '@/lib/validations';
import { z } from 'zod';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_KEY!
  }
});

// GET /api/goals/[id] - Get specific goal
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

    const goal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id 
      },
      include: {
        contributions: {
          orderBy: { month: 'desc' },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const goalWithNumbers = {
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      initialAssetPrice: goal.initialAssetPrice ? Number(goal.initialAssetPrice) : undefined,
      depreciationRate: goal.depreciationRate ? Number(goal.depreciationRate) : undefined,
      downPaymentRatio: goal.downPaymentRatio ? Number(goal.downPaymentRatio) : undefined,
      projectedPrice: goal.projectedPrice ? Number(goal.projectedPrice) : undefined,
      contributions: goal.contributions?.map(contribution => ({
        ...contribution,
        amount: Number(contribution.amount),
      })) || [],
    };

    return NextResponse.json(goalWithNumbers);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/goals/[id] - Update goal
export async function PUT(
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

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id 
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type');
    let body: Record<string, unknown>;
    let imageFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData();
      
      // Extract goal data
      const goalDataStr = formData.get('goalData') as string;
      if (!goalDataStr) {
        return NextResponse.json({ error: 'Goal data is required' }, { status: 400 });
      }
      
      body = JSON.parse(goalDataStr);
      imageFile = formData.get('image') as File | null;
    } else {
      // Handle JSON data (no file upload)
      body = await request.json();
    }

    console.log('📥 Received goal update data:', body);

    // Convert targetDate string back to Date object for validation
    const processedBody = {
      ...body,
      targetDate: new Date(body.targetDate as string),
    };

    console.log('🔄 Processed goal update data:', processedBody);

    const validatedData = updateGoalSchema.parse(processedBody);
    console.log('✅ Validated goal update data:', validatedData);

    let imageUrl: string | undefined = existingGoal.imageUrl || undefined;

    // Handle image upload if present
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('📸 Processing image upload:', imageFile.name, imageFile.type, imageFile.size);
        
        // Validate file type and size
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
          return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // Delete old image if exists
        if (existingGoal.imageUrl) {
          try {
            const oldKey = existingGoal.imageUrl.split('.r2.cloudflarestorage.com/')[1];
            if (oldKey) {
              const deleteCommand = new DeleteObjectCommand({
                Bucket: 'f12',
                Key: oldKey,
              });
              await s3Client.send(deleteCommand);
              console.log('🗑️ Old image deleted:', oldKey);
            }
          } catch (deleteError) {
            console.warn('⚠️ Failed to delete old image:', deleteError);
          }
        }

        // Generate unique filename
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `goals/${user.id}/${uuidv4()}.${fileExtension}`;
        
        // Convert file to buffer
        const fileBuffer = await imageFile.arrayBuffer();
        
        // Upload to Cloudflare R2
        const uploadCommand = new PutObjectCommand({
          Bucket: 'f12',
          Key: fileName,
          Body: new Uint8Array(fileBuffer),
          ContentType: imageFile.type,
          Metadata: {
            userId: user.id,
            goalName: validatedData.name || existingGoal.name,
            uploadedAt: new Date().toISOString(),
          }
        });

        await s3Client.send(uploadCommand);
        
        // Generate the public URL
        imageUrl = `https://f12.${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
        
        console.log('✅ Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Error uploading image:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    // Calculate if goal should be completed based on current amount vs target amount
    // Use existing values if not provided in the update
    const currentAmount = validatedData.currentAmount ?? Number(existingGoal.currentAmount);
    const targetAmount = validatedData.targetAmount ?? Number(existingGoal.targetAmount);
    const shouldBeCompleted = currentAmount >= targetAmount;

    const updatedGoal = await prisma.goal.update({
      where: { id: id },
      data: {
        ...validatedData,
        imageUrl: imageUrl,
        // Ensure completion status is consistent with current amount
        isCompleted: shouldBeCompleted,
      },
      include: {
        contributions: {
          orderBy: { month: 'desc' },
        },
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

    return NextResponse.json(goalWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error updating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - Delete goal
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

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: id,
        userId: user.id 
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Delete associated image if exists
    if (existingGoal.imageUrl) {
      try {
        const oldKey = existingGoal.imageUrl.split('.r2.cloudflarestorage.com/')[1];
        if (oldKey) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: 'f12',
            Key: oldKey,
          });
          await s3Client.send(deleteCommand);
          console.log('🗑️ Goal image deleted:', oldKey);
        }
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete goal image:', deleteError);
      }
    }

    // Delete goal (contributions are deleted automatically due to cascade)
    console.log(`🗑️ Deleting goal ${id}...`);
    await prisma.goal.delete({
      where: { id: id },
    });
    console.log(`✅ Goal ${id} deleted successfully`);

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 