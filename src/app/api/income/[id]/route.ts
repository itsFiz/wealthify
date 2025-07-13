import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateIncomeStreamSchema } from '@/lib/validations';
import { deleteIncomeStreamEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';
import { generateIncomeEntries } from '@/lib/utils/entryGeneration';

// GET /api/income/[id] - Get specific income stream
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

    const incomeStream = await prisma.incomeStream.findFirst({
      where: { 
        id: id,
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

    // Check if income stream exists and belongs to user
    const existingStream = await prisma.incomeStream.findFirst({
      where: { 
        id: id,
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
    const { earnedDate: earnedDateString, endDate: endDateString, ...restValidatedData } = validatedData;
    const updateData: typeof restValidatedData & { earnedDate?: Date; endDate?: Date } = {
      ...restValidatedData,
    };

    // Convert earnedDate string to Date object if provided
    if (earnedDateString) {
      updateData.earnedDate = new Date(earnedDateString);
      console.log('📅 Converted earnedDate from string to Date:', updateData.earnedDate);
    }

    // Convert endDate string to Date object if provided
    if (endDateString) {
      updateData.endDate = new Date(endDateString);
      console.log('📅 Converted endDate from string to Date:', updateData.endDate);
    }

    console.log('🔄 Final update data:', updateData);

    const updatedStream = await prisma.incomeStream.update({
      where: { id: id },
      data: updateData,
      include: {
        entries: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    console.log('✅ Successfully updated income stream:', updatedStream.id);

    // Check if earnedDate, endDate, or amount changed and handle entry updates
    const oldEarnedDate = existingStream.earnedDate ? new Date(existingStream.earnedDate) : null;
    const newEarnedDate = validatedData.earnedDate ? new Date(validatedData.earnedDate) : null;
    const earnedDateChanged = (oldEarnedDate?.getTime() !== newEarnedDate?.getTime());
    
    const oldEndDate = existingStream.endDate ? new Date(existingStream.endDate) : null;
    const newEndDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    const endDateChanged = (oldEndDate?.getTime() !== newEndDate?.getTime());
    
    const oldAmount = Number(existingStream.actualMonthly || existingStream.expectedMonthly);
    const newAmount = Number(
      (validatedData.actualMonthly !== undefined ? validatedData.actualMonthly : existingStream.actualMonthly) ||
      (validatedData.expectedMonthly !== undefined ? validatedData.expectedMonthly : existingStream.expectedMonthly)
    );
    const amountChanged = (newAmount !== oldAmount);

    if (earnedDateChanged) {
      // If earned date changed, we need to regenerate all entries
      console.log('🔄 Earned date changed - regenerating all entries');
      const deleteResult = await deleteIncomeStreamEntries(id);
      console.log(`🗑️ ${deleteResult.message}`);
      
      const generateResult = await generateIncomeEntries(id);
      console.log(`✅ ${generateResult.message}`);
    } else if (endDateChanged) {
      // If only end date changed, only delete future entries after the end date
      console.log('🔄 End date changed - removing future entries only');
      const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
      
      if (endDate) {
        // Delete entries after the end date (keep the end date month, delete from next month onwards)
        const nextMonthAfterEnd = new Date(endDate);
        nextMonthAfterEnd.setMonth(nextMonthAfterEnd.getMonth() + 1);
        nextMonthAfterEnd.setDate(1); // Start of next month
        
        const deletedEntries = await prisma.incomeEntry.deleteMany({
          where: {
            incomeStreamId: id,
            month: {
              gte: nextMonthAfterEnd,
            },
          },
        });
        console.log(`🗑️ Deleted ${deletedEntries.count} entries from ${nextMonthAfterEnd.toLocaleDateString()} onwards`);
      }
    } else if (amountChanged) {
      // If only amount changed, update existing entries
      console.log('🔄 Amount changed - updating existing entries');
      try {
        const updateResult = await prisma.incomeEntry.updateMany({
          where: {
            incomeStreamId: id,
          },
          data: {
            amount: newAmount,
          },
        });
        console.log(`✅ Updated ${updateResult.count} entries with new amount`);
      } catch (entryError) {
        console.error('❌ Failed to update income entries:', entryError);
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
      cause: (error as Error & { cause?: unknown }).cause
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/income/[id] - Delete income stream
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

    // Check if income stream exists and belongs to user
    const existingStream = await prisma.incomeStream.findFirst({
      where: { 
        id: id,
        userId: user.id,
      },
    });

    if (!existingStream) {
      return NextResponse.json({ error: 'Income stream not found' }, { status: 404 });
    }

    // Delete associated entries first
    try {
      const result = await deleteIncomeStreamEntries(id);
      console.log(`🗑️ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to delete income entries:', entryError);
      // Continue with stream deletion even if entry deletion fails
    }

    // Delete the income stream
    await prisma.incomeStream.delete({
      where: { id: id },
    });

    console.log(`✅ Successfully deleted income stream: ${existingStream.name}`);
    return NextResponse.json({ message: 'Income stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting income stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 