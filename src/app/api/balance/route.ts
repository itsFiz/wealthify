import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateStartingBalanceSchema = z.object({
  startingBalance: z.number().min(0, 'Starting balance cannot be negative'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// GET /api/balance - Get user's current balance and recent entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        balanceEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 balance updates
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle cases where user doesn't have balance fields yet (existing users)
    // Convert Decimal fields to numbers for JSON serialization with fallbacks
    const response = {
      currentBalance: user.currentBalance ? Number(user.currentBalance) : 0,
      startingBalance: user.startingBalance ? Number(user.startingBalance) : 0,
      balanceUpdatedAt: user.balanceUpdatedAt || null,
      recentEntries: user.balanceEntries ? user.balanceEntries.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
        previousAmount: Number(entry.previousAmount),
        changeAmount: Number(entry.changeAmount),
      })) : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/balance - Update user's balance
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
    const validatedData = updateStartingBalanceSchema.parse(body);

    const previousBalance = Number(user.currentBalance);
    const newBalance = validatedData.startingBalance;
    const changeAmount = newBalance - previousBalance;

    // Update user's current balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentBalance: newBalance,
        balanceUpdatedAt: new Date(),
        // Set starting balance if this is the first update
        startingBalance: user.startingBalance.equals(0) ? newBalance : user.startingBalance,
      },
    });

    // Create balance entry for tracking
    const balanceEntry = await prisma.balanceEntry.create({
      data: {
        userId: user.id,
        amount: newBalance,
        previousAmount: previousBalance,
        changeAmount: changeAmount,
        entryType: 'MANUAL_UPDATE',
        notes: validatedData.notes,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const response = {
      currentBalance: Number(updatedUser.currentBalance),
      previousBalance,
      changeAmount,
      balanceEntry: {
        ...balanceEntry,
        amount: Number(balanceEntry.amount),
        previousAmount: Number(balanceEntry.previousAmount),
        changeAmount: Number(balanceEntry.changeAmount),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 