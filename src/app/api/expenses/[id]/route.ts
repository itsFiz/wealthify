import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateExpenseSchema } from '@/lib/validations';
import { deleteExpenseEntries, generateExpenseEntries, updateExpenseEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';

// GET /api/expenses/[id] - Get specific expense
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

    const expense = await prisma.expense.findFirst({
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

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const expenseWithNumbers = {
      ...expense,
      amount: Number(expense.amount),
      entries: expense.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    };

    return NextResponse.json(expenseWithNumbers);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/expenses/[id] - Update expense
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: id,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        userId: true,
        category: true,
        amount: true,
        frequency: true,
        incurredDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('💸 Received expense update data:', body);
    
    const validatedData = updateExpenseSchema.parse(body);
    console.log('✅ Validated expense data:', validatedData);

    // Prepare update data with proper date conversion
    const { incurredDate: incurredDateString, endDate: endDateString, ...restValidatedData } = validatedData;
    const updateData: typeof restValidatedData & { incurredDate?: Date; endDate?: Date } = {
      ...restValidatedData,
    };

    // Convert incurredDate string to Date object if provided
    if (incurredDateString) {
      updateData.incurredDate = new Date(incurredDateString);
      console.log('📅 Converted incurredDate from string to Date:', updateData.incurredDate);
    }

    // Convert endDate string to Date object if provided
    if (endDateString) {
      updateData.endDate = new Date(endDateString);
      console.log('📅 Converted endDate from string to Date:', updateData.endDate);
    }

    console.log('🔄 Final update data:', updateData);

    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: updateData,
      include: {
        entries: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    console.log('✅ Successfully updated expense:', updatedExpense.id);

    // Check if incurredDate, endDate, or amount changed and regenerate entries
    const oldIncurredDate = existingExpense.incurredDate ? new Date(existingExpense.incurredDate) : null;
    const newIncurredDate = validatedData.incurredDate ? new Date(validatedData.incurredDate) : null;
    const incurredDateChanged = (oldIncurredDate?.getTime() !== newIncurredDate?.getTime());
    
    const oldEndDate = existingExpense.endDate ? new Date(existingExpense.endDate) : null;
    const newEndDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    const endDateChanged = (oldEndDate?.getTime() !== newEndDate?.getTime());
    
    const oldAmount = Number(existingExpense.amount);
    const newAmount = validatedData.amount !== undefined ? Number(validatedData.amount) : oldAmount;
    const amountChanged = validatedData.amount !== undefined && (newAmount !== oldAmount);

    if (incurredDateChanged || endDateChanged || amountChanged) {
        try {
        console.log('🔄 Handling entry changes:');
        console.log(`   - Incurred date changed: ${incurredDateChanged} (${oldIncurredDate?.toLocaleDateString() || 'null'} → ${newIncurredDate?.toLocaleDateString() || 'null'})`);
        console.log(`   - End date changed: ${endDateChanged} (${oldEndDate?.toLocaleDateString() || 'null'} → ${newEndDate?.toLocaleDateString() || 'null'})`);
        console.log(`   - Amount changed: ${amountChanged} (RM${oldAmount} → RM${newAmount})`);
        
        if (incurredDateChanged) {
          // If incurred date changed, we need to regenerate all entries
          console.log('🔄 Incurred date changed - regenerating all entries');
          const deleteResult = await deleteExpenseEntries(id);
          console.log(`🗑️ ${deleteResult.message}`);
          
          const generateResult = await generateExpenseEntries(id);
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
            
            const deletedEntries = await prisma.expenseEntry.deleteMany({
              where: {
                expenseId: id,
                month: {
                  gte: nextMonthAfterEnd, // Delete from next month onwards
                },
              },
            });
            console.log(`🗑️ Deleted ${deletedEntries.count} entries from ${nextMonthAfterEnd.toLocaleDateString()} onwards (keeping ${endDate.toLocaleDateString()} entry)`);
          }
          // DO NOT regenerate entries when ending an expense - keep historical entries intact
        } else if (amountChanged) {
          // If only amount changed, update current and future entries
          console.log('🔄 Amount changed - updating current and future entries');
          const updateResult = await updateExpenseEntries(id, newAmount);
          console.log(`✅ ${updateResult.message}`);
        }
        } catch (entryError) {
        console.error('❌ Failed to handle expense entry changes:', entryError);
        // Don't fail the entire request if entry handling fails
      }
    }

    // Convert Decimal fields to numbers for JSON serialization
    const expenseWithNumbers = {
      ...updatedExpense,
      amount: Number(updatedExpense.amount),
      entries: updatedExpense.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    };

    return NextResponse.json(expenseWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error for expense update:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('❌ Error updating expense:', error);
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      cause: (error as Error & { cause?: unknown }).cause
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] - Delete expense
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: id,
        userId: user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete associated entries first
    try {
      const result = await deleteExpenseEntries(id);
      console.log(`🗑️ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to delete expense entries:', entryError);
      // Continue with expense deletion even if entry deletion fails
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: id },
    });

    console.log(`✅ Successfully deleted expense: ${existingExpense.name}`);
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 