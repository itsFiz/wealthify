import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const createOneTimeExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().transform(str => new Date(str)),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

// GET /api/one-time-expense - Get all one-time expense entries with filtering
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

    // Build where clause based on filters
    const whereClause: Prisma.OneTimeExpenseWhereInput = {
      userId: user.id,
    };

    // Only add date filters if they are provided
    if (year || month) {
      const dateClause: Prisma.DateTimeFilter = {};
      
      if (year && month) {
        // Specific year and month
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        dateClause.gte = startDate;
        dateClause.lte = endDate;
      } else if (year) {
        // Entire year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        dateClause.gte = startDate;
        dateClause.lte = endDate;
      }
      
      whereClause.date = dateClause;
    }

    const entries = await prisma.oneTimeExpense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const entriesWithNumbers = entries.map((entry) => ({
      ...entry,
      amount: Number(entry.amount),
    }));

    return NextResponse.json(entriesWithNumbers);
  } catch (error) {
    console.error('Error fetching one-time expense entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/one-time-expense - Create new one-time expense entry
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
    const validatedData = createOneTimeExpenseSchema.parse(body);

    const entry = await prisma.oneTimeExpense.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        amount: validatedData.amount,
        date: validatedData.date,
        category: validatedData.category,
        notes: validatedData.notes,
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
    
    console.error('Error creating one-time expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 