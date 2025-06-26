import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createExpenseSchema, updateExpenseSchema } from '@/lib/validations';
import { updateExpenseEntries, deleteExpenseEntries, generateExpenseEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';

// GET /api/expenses/[id] - Get specific expense
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

    const expense = await prisma.expense.findFirst({
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
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
    const updateData: any = {
      ...validatedData,
      amount: validatedData.amount,
    };

    // Convert incurredDate string to Date object if provided
    if (validatedData.incurredDate) {
      updateData.incurredDate = new Date(validatedData.incurredDate);
      console.log('📅 Converted incurredDate from string to Date:', updateData.incurredDate);
    }

    console.log('🔄 Final update data:', updateData);

    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
      include: {
        entries: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    console.log('✅ Successfully updated expense:', updatedExpense.id);

    // Check if incurredDate or amount changed and regenerate entries
    const oldIncurredDate = existingExpense.incurredDate ? new Date(existingExpense.incurredDate) : null;
    const newIncurredDate = validatedData.incurredDate ? new Date(validatedData.incurredDate) : null;
    const incurredDateChanged = (oldIncurredDate?.getTime() !== newIncurredDate?.getTime());
    
    const oldAmount = Number(existingExpense.amount);
    const newAmount = validatedData.amount !== undefined ? Number(validatedData.amount) : oldAmount;
    const amountChanged = validatedData.amount !== undefined && (newAmount !== oldAmount);

    if (incurredDateChanged || amountChanged) {
      try {
        console.log('🔄 Regenerating entries due to changes:');
        console.log(`   - Incurred date changed: ${incurredDateChanged} (${oldIncurredDate?.toLocaleDateString() || 'null'} → ${newIncurredDate?.toLocaleDateString() || 'null'})`);
        console.log(`   - Amount changed: ${amountChanged} (RM${oldAmount} → RM${newAmount})`);
        
        // Delete existing entries and regenerate from the new date
        const deleteResult = await deleteExpenseEntries(params.id);
        console.log(`🗑️ ${deleteResult.message}`);
        
        // Regenerate entries with new date/amount
        const generateResult = await generateExpenseEntries(params.id);
        console.log(`✅ ${generateResult.message}`);
      } catch (entryError) {
        console.error('❌ Failed to regenerate expense entries:', entryError);
        // Don't fail the entire request if entry regeneration fails
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
      cause: (error as any).cause
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] - Delete expense
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete associated entries first
    try {
      const result = await deleteExpenseEntries(params.id);
      console.log(`🗑️ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to delete expense entries:', entryError);
      // Continue with expense deletion even if entry deletion fails
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: params.id },
    });

    console.log(`✅ Successfully deleted expense: ${existingExpense.name}`);
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 