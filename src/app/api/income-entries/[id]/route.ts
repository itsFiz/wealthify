import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/income-entries/[id] - Get specific income entry
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

    const entry = await prisma.incomeEntry.findFirst({
      where: { 
        id: id,
        incomeStream: {
          userId: user.id,
        },
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

    if (!entry) {
      return NextResponse.json({ error: 'Income entry not found' }, { status: 404 });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const entryWithNumbers = {
      ...entry,
      amount: Number(entry.amount),
    };

    return NextResponse.json(entryWithNumbers);
  } catch (error) {
    console.error('Error fetching income entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/income-entries/[id] - Delete specific income entry
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

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.incomeEntry.findFirst({
      where: { 
        id: id,
        incomeStream: {
          userId: user.id,
        },
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

    if (!existingEntry) {
      return NextResponse.json({ error: 'Income entry not found' }, { status: 404 });
    }

    await prisma.incomeEntry.delete({
      where: { id: id },
    });

    console.log(`✅ Successfully deleted income entry: ${existingEntry.incomeStream.name} for ${existingEntry.month.toLocaleDateString()}`);
    return NextResponse.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 