import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createIncomeStreamSchema, updateIncomeStreamSchema } from '@/lib/validations';
import { updateIncomeStreamEntries, deleteIncomeStreamEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';
import { generateIncomeEntries } from '@/lib/utils/entryGeneration';

// GET /api/income/[id] - Get specific income stream
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const incomeStream = await prisma.incomeStream.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
      include: {
        entries: {
          orderBy: { month: 'desc' },
        },
      },
    });

    if (!incomeStream) {
      return NextResponse.json({ error: 'Income stream not found' }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const incomeStreamWithNumbers = {
      ...incomeStream,
      expectedMonthly: Number(incomeStream.expectedMonthly),
      actualMonthly: incomeStream.actualMonthly ? Number(incomeStream.actualMonthly) : null,
      entries: incomeStream.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    };

    return NextResponse.json(incomeStreamWithNumbers);
  } catch (error) {
    console.error('Error fetching income stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/income/[id] - Update income stream
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if income stream exists and belongs to user
    const existingStream = await prisma.incomeStream.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingStream) {
      return NextResponse.json({ error: 'Income stream not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('💰 Received income stream update data:', body);
    
    const validatedData = updateIncomeStreamSchema.parse(body);
    console.log('✅ Validated income stream data:', validatedData);

    // Prepare update data with proper date conversion
    const updateData: any = {
      ...validatedData,
      expectedMonthly: validatedData.expectedMonthly,
      actualMonthly: validatedData.actualMonthly,
    };

    // Convert earnedDate string to Date object if provided
    if (validatedData.earnedDate) {
      updateData.earnedDate = new Date(validatedData.earnedDate);
      console.log('📅 Converted earnedDate from string to Date:', updateData.earnedDate);
    }

    console.log('🔄 Final update data:', updateData);

    const updatedStream = await prisma.incomeStream.update({
      where: { id: params.id },
      data: updateData,
      include: {
        entries: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    console.log('✅ Successfully updated income stream:', updatedStream.id);

    // Check if earnedDate or amount changed and regenerate entries
    const oldEarnedDate = existingStream.earnedDate ? new Date(existingStream.earnedDate) : null;
    const newEarnedDate = validatedData.earnedDate ? new Date(validatedData.earnedDate) : null;
    const earnedDateChanged = (oldEarnedDate?.getTime() !== newEarnedDate?.getTime());
    
    const oldAmount = Number(existingStream.actualMonthly || existingStream.expectedMonthly);
    const newAmount = Number(
      (validatedData.actualMonthly !== undefined ? validatedData.actualMonthly : existingStream.actualMonthly) ||
      (validatedData.expectedMonthly !== undefined ? validatedData.expectedMonthly : existingStream.expectedMonthly)
    );
    const amountChanged = (newAmount !== oldAmount);

    if (earnedDateChanged || amountChanged) {
      try {
        console.log('🔄 Regenerating entries due to changes:');
        console.log(`   - Earned date changed: ${earnedDateChanged} (${oldEarnedDate?.toLocaleDateString() || 'null'} → ${newEarnedDate?.toLocaleDateString() || 'null'})`);
        console.log(`   - Amount changed: ${amountChanged} (RM${oldAmount} → RM${newAmount})`);
        
        // Delete existing entries and regenerate from the new date
        const deleteResult = await deleteIncomeStreamEntries(params.id);
        console.log(`🗑️ ${deleteResult.message}`);
        
        // Regenerate entries with new date/amount
        const generateResult = await generateIncomeEntries(params.id);
        console.log(`✅ ${generateResult.message}`);
      } catch (entryError) {
        console.error('❌ Failed to regenerate income entries:', entryError);
        // Don't fail the entire request if entry regeneration fails
      }
    }

    // Convert Decimal fields to numbers for JSON serialization
    const incomeStreamWithNumbers = {
      ...updatedStream,
      expectedMonthly: Number(updatedStream.expectedMonthly),
      actualMonthly: updatedStream.actualMonthly ? Number(updatedStream.actualMonthly) : null,
      entries: updatedStream.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    };

    return NextResponse.json(incomeStreamWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error for income stream update:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error updating income stream:', error);
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      cause: (error as any).cause
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/income/[id] - Delete income stream
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if income stream exists and belongs to user
    const existingStream = await prisma.incomeStream.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingStream) {
      return NextResponse.json({ error: 'Income stream not found' }, { status: 404 });
    }

    // Delete associated entries first
    try {
      const result = await deleteIncomeStreamEntries(params.id);
      console.log(`🗑️ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to delete income entries:', entryError);
      // Continue with stream deletion even if entry deletion fails
    }

    // Delete the income stream
    await prisma.incomeStream.delete({
      where: { id: params.id },
    });

    console.log(`✅ Successfully deleted income stream: ${existingStream.name}`);
    return NextResponse.json({ message: 'Income stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting income stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 