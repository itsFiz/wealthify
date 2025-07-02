import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createPurchasePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  purchaseType: z.enum(['house', 'vehicle', 'wedding', 'business', 'custom']),
  targetAmount: z.number().min(0, 'Target amount must be positive'),
  currentSaved: z.number().min(0, 'Current saved must be positive'),
  desiredTimelineMonths: z.number().min(1, 'Timeline must be at least 1 month'),
  downPaymentRatio: z.number().min(0).max(1).optional(),
  appreciationRate: z.number().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

const updatePurchasePlanSchema = createPurchasePlanSchema.partial().extend({
  id: z.string().min(1, 'Plan ID is required'),
});

// GET /api/purchase-plans - Get user's purchase plans
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

    const purchasePlans = await prisma.purchasePlan.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const response = purchasePlans.map(plan => ({
      ...plan,
      targetAmount: Number(plan.targetAmount),
      currentSaved: Number(plan.currentSaved),
      downPaymentRatio: plan.downPaymentRatio ? Number(plan.downPaymentRatio) : null,
      appreciationRate: plan.appreciationRate ? Number(plan.appreciationRate) : null,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching purchase plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/purchase-plans - Create a new purchase plan
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

    const body = await request.json();
    const validatedData = createPurchasePlanSchema.parse(body);

    const purchasePlan = await prisma.purchasePlan.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        purchaseType: validatedData.purchaseType,
        targetAmount: validatedData.targetAmount,
        currentSaved: validatedData.currentSaved,
        desiredTimelineMonths: validatedData.desiredTimelineMonths,
        downPaymentRatio: validatedData.downPaymentRatio,
        appreciationRate: validatedData.appreciationRate,
        notes: validatedData.notes,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const response = {
      ...purchasePlan,
      targetAmount: Number(purchasePlan.targetAmount),
      currentSaved: Number(purchasePlan.currentSaved),
      downPaymentRatio: purchasePlan.downPaymentRatio ? Number(purchasePlan.downPaymentRatio) : null,
      appreciationRate: purchasePlan.appreciationRate ? Number(purchasePlan.appreciationRate) : null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error creating purchase plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/purchase-plans - Update a purchase plan
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = updatePurchasePlanSchema.parse(body);

    // Verify the plan belongs to the user
    const existingPlan = await prisma.purchasePlan.findFirst({
      where: { 
        id: validatedData.id,
        userId: user.id 
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Purchase plan not found' }, { status: 404 });
    }

    const updateData: {
      name?: string;
      purchaseType?: string;
      targetAmount?: number;
      currentSaved?: number;
      desiredTimelineMonths?: number;
      downPaymentRatio?: number | null;
      appreciationRate?: number | null;
      notes?: string | null;
    } = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.purchaseType !== undefined) updateData.purchaseType = validatedData.purchaseType;
    if (validatedData.targetAmount !== undefined) updateData.targetAmount = validatedData.targetAmount;
    if (validatedData.currentSaved !== undefined) updateData.currentSaved = validatedData.currentSaved;
    if (validatedData.desiredTimelineMonths !== undefined) updateData.desiredTimelineMonths = validatedData.desiredTimelineMonths;
    if (validatedData.downPaymentRatio !== undefined) updateData.downPaymentRatio = validatedData.downPaymentRatio;
    if (validatedData.appreciationRate !== undefined) updateData.appreciationRate = validatedData.appreciationRate;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const purchasePlan = await prisma.purchasePlan.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    // Convert Decimal fields to numbers for JSON serialization
    const response = {
      ...purchasePlan,
      targetAmount: Number(purchasePlan.targetAmount),
      currentSaved: Number(purchasePlan.currentSaved),
      downPaymentRatio: purchasePlan.downPaymentRatio ? Number(purchasePlan.downPaymentRatio) : null,
      appreciationRate: purchasePlan.appreciationRate ? Number(purchasePlan.appreciationRate) : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error updating purchase plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/purchase-plans - Delete a purchase plan (soft delete)
export async function DELETE(request: NextRequest) {
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
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Verify the plan belongs to the user
    const existingPlan = await prisma.purchasePlan.findFirst({
      where: { 
        id: planId,
        userId: user.id 
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Purchase plan not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.purchasePlan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Purchase plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 