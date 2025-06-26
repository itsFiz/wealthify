import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createExpenseSchema } from '@/lib/validations';
import { generateExpenseEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';

// GET /api/expenses - Get all expenses for authenticated user
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

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      include: {
        entries: {
          orderBy: { month: 'desc' },
          take: 12, // Last 12 months
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const expensesWithNumbers = expenses.map(expense => ({
      ...expense,
      amount: Number(expense.amount),
      entries: expense.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    }));

    return NextResponse.json(expensesWithNumbers);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/expenses - Create new expense
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
    const validatedData = createExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        name: validatedData.name,
        category: validatedData.category,
        type: validatedData.type,
        amount: validatedData.amount,
        frequency: validatedData.frequency,
        incurredDate: validatedData.incurredDate ? new Date(validatedData.incurredDate) : null,
        userId: user.id,
      },
      include: {
        entries: true,
      },
    });

    console.log(`💸 Created expense: ${expense.name} - RM${expense.amount}/month`);

    // Automatically generate monthly entries from creation date to current month
    try {
      const result = await generateExpenseEntries(expense.id);
      console.log(`✅ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to auto-generate expense entries:', entryError);
      // Don't fail the entire request if entry generation fails
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

    return NextResponse.json(expenseWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 