import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createGoalSchema } from '@/lib/validations';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

// GET /api/goals - Get all goals for authenticated user
export async function GET() {
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

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        contributions: {
          orderBy: { month: 'desc' },
          take: 12, // Last 12 months
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Convert Decimal fields to numbers for JSON serialization
    const goalsWithNumbers = goals.map(goal => ({
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
    }));

    return NextResponse.json(goalsWithNumbers);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals - Create new goal
export async function POST(request: NextRequest) {
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

    const contentType = request.headers.get('content-type');
    let body: any;
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

    console.log('📥 Received goal data:', body);

    // Convert targetDate string back to Date object for validation
    const processedBody = {
      ...body,
      targetDate: new Date(body.targetDate),
    };

    console.log('🔄 Processed goal data:', processedBody);

    const validatedData = createGoalSchema.parse(processedBody);
    console.log('✅ Validated goal data:', validatedData);

    let imageUrl: string | null = null;

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
            goalName: validatedData.name,
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

    const goal = await prisma.goal.create({
      data: {
        ...validatedData,
        userId: user.id,
        targetAmount: validatedData.targetAmount,
        currentAmount: 0,
        imageUrl: imageUrl,
      },
      include: {
        contributions: true,
      },
    });

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

    return NextResponse.json(goalWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error creating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 