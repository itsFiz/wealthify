import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createIncomeEntrySchema = z.object({
  incomeStreamId: z.string(),
  amount: z.number().positive(),
  month: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
});

// GET /api/income-entries - Get all income entries with filtering
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
    const incomeStreamId = searchParams.get('incomeStreamId');

    // Build where clause based on filters
    const whereClause: any = {
      incomeStream: {
        userId: user.id,
      },
    };

    // Only add date filters if they are provided
    if (year || month) {
      const monthClause: any = {};
      
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

    if (incomeStreamId) {
      whereClause.incomeStreamId = incomeStreamId;
    }

    const entries = await prisma.incomeEntry.findMany({
      where: whereClause,
      include: {
        incomeStream: {
          select: {
            id: true,
            name: true,
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
    console.error('Error fetching income entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/income-entries - Create new income entry
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
    const validatedData = createIncomeEntrySchema.parse(body);

    // Verify the income stream belongs to the user
    const incomeStream = await prisma.incomeStream.findFirst({
      where: {
        id: validatedData.incomeStreamId,
        userId: user.id,
      },
    });

    if (!incomeStream) {
      return NextResponse.json({ error: 'Income stream not found' }, { status: 404 });
    }

    // Check if entry already exists for this month
    const existingEntry = await prisma.incomeEntry.findFirst({
      where: {
        incomeStreamId: validatedData.incomeStreamId,
        month: {
          gte: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth(), 1),
          lt: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth() + 1, 1),
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'Entry already exists for this month' }, { status: 400 });
    }

    const entry = await prisma.incomeEntry.create({
      data: {
        incomeStreamId: validatedData.incomeStreamId,
        amount: validatedData.amount,
        month: new Date(validatedData.month.getFullYear(), validatedData.month.getMonth(), 1),
        notes: validatedData.notes,
      },
      include: {
        incomeStream: {
          select: {
            id: true,
            name: true,
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
    
    console.error('Error creating income entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 