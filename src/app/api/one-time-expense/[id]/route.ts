import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateOneTimeExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  date: z.string().transform(str => new Date(str)).optional(),
  category: z.string().min(1, 'Category is required').optional(),
  notes: z.string().optional(),
});

// GET /api/one-time-expense/[id] - Get specific one-time expense entry
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

    const entry = await prisma.oneTimeExpense.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const entryWithNumbers = {
      ...entry,
      amount: Number(entry.amount),
    };

    return NextResponse.json(entryWithNumbers);
  } catch (error) {
    console.error('Error fetching one-time expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/one-time-expense/[id] - Update one-time expense entry
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

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.oneTimeExpense.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateOneTimeExpenseSchema.parse(body);

    const updatedEntry = await prisma.oneTimeExpense.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Convert Decimal fields to numbers for JSON serialization
    const entryWithNumbers = {
      ...updatedEntry,
      amount: Number(updatedEntry.amount),
    };

    return NextResponse.json(entryWithNumbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error updating one-time expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/one-time-expense/[id] - Delete one-time expense entry
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

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.oneTimeExpense.findFirst({
      where: { 
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    await prisma.oneTimeExpense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting one-time expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 