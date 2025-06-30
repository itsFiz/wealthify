import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createExpenseEntrySchema = z.object({
  expenseId: z.string(),
  amount: z.number().positive(),
  month: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
});

// GET /api/expense-entries - Get all expense entries with filtering
export async function GET(request: NextRequest) {
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
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const expenseId = searchParams.get('expenseId');

    // Build where clause based on filters
    const whereClause: {
      expense: { userId: string };
      month?: { gte?: Date; lte?: Date };
      expenseId?: string;
    } = {
      expense: {
        userId: user.id,
      },
    };

    // Only add date filters if they are provided
    if (year || month) {
      const monthClause: { gte?: Date; lte?: Date } = {};
      
      if (year && month) {
        // Specific year and month
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        monthClause.gte = startDate;
        monthClause.lte = endDate;
      } else if (year) {
        // Entire year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        monthClause.gte = startDate;
        monthClause.lte = endDate;
      }
      
      whereClause.month = monthClause;
    }

    if (expenseId) {
      whereClause.expenseId = expenseId;
    }

    const entries = await prisma.expenseEntry.findMany({
      where: whereClause,
      include: {
        expense: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
          },
        },
      },
      orderBy: { month: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const entriesWithNumbers = entries.map(entry => ({
      ...entry,
      amount: Number(entry.amount),
    }));

    return NextResponse.json(entriesWithNumbers);
  } catch (error) {
    console.error('Error fetching expense entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/expense-entries - Create new expense entry
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
    const validatedData = createExpenseEntrySchema.parse(body);

    // Verify the expense belongs to the user
    const expense = await prisma.expense.findFirst({
      where: {
        id: validatedData.expenseId,
        userId: user.id,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if entry already exists for this month
    const existingEntry = await prisma.expenseEntry.findFirst({
      where: {
        expenseId: validatedData.expenseId,
        month: {
          gte: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth(), 1),
          lt: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth() + 1, 1),
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'Entry already exists for this month' }, { status: 400 });
    }

    const entry = await prisma.expenseEntry.create({
      data: {
        expenseId: validatedData.expenseId,
        amount: validatedData.amount,
        month: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth(), 1),
        notes: validatedData.notes,
      },
      include: {
        expense: {
          select: {
            id: true,
            name: true,
            category: true,
            type: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const entryWithNumbers = {
      ...entry,
      amount: Number(entry.amount),
    };

    return NextResponse.json(entryWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error creating expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 