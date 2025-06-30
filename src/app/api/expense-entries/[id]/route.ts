import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/expense-entries/[id] - Get specific expense entry
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

    const entry = await prisma.expenseEntry.findFirst({
      where: { 
        id: params.id,
        expense: {
          userId: user.id,
        },
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
    console.error('Error fetching expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expense-entries/[id] - Delete specific expense entry
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
    const existingEntry = await prisma.expenseEntry.findFirst({
      where: { 
        id: params.id,
        expense: {
          userId: user.id,
        },
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

    if (!existingEntry) {
      return NextResponse.json({ error: 'Expense entry not found' }, { status: 404 });
    }

    await prisma.expenseEntry.delete({
      where: { id: params.id },
    });

    console.log(`✅ Successfully deleted expense entry: ${existingEntry.expense.name} for ${existingEntry.month.toLocaleDateString()}`);
    return NextResponse.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 