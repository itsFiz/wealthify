import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createIncomeStreamSchema } from '@/lib/validations';
import { generateIncomeEntries } from '@/lib/utils/entryGeneration';
import { z } from 'zod';

// GET /api/income - Get all income streams for authenticated user
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

    const incomeStreams = await prisma.incomeStream.findMany({
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
    const incomeStreamsWithNumbers = incomeStreams.map(stream => ({
      ...stream,
      expectedMonthly: Number(stream.expectedMonthly),
      actualMonthly: stream.actualMonthly ? Number(stream.actualMonthly) : null,
      entries: stream.entries?.map(entry => ({
        ...entry,
        amount: Number(entry.amount),
      })) || [],
    }));

    return NextResponse.json(incomeStreamsWithNumbers);
  } catch (error) {
    console.error('Error fetching income streams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/income - Create new income stream
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
    const validatedData = createIncomeStreamSchema.parse(body);

    const incomeStream = await prisma.incomeStream.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        expectedMonthly: validatedData.expectedMonthly,
        actualMonthly: validatedData.actualMonthly || validatedData.expectedMonthly,
        frequency: validatedData.frequency,
        earnedDate: validatedData.earnedDate ? new Date(validatedData.earnedDate) : null,
        userId: user.id,
      },
    });

    console.log(`💰 Created income stream: ${incomeStream.name} - RM${incomeStream.expectedMonthly}/month`);

    // Automatically generate monthly entries from creation date to current month
    try {
      const result = await generateIncomeEntries(incomeStream.id);
      console.log(`✅ ${result.message}`);
    } catch (entryError) {
      console.error('❌ Failed to auto-generate entries:', entryError);
      // Don't fail the entire request if entry generation fails
    }

    // Convert Decimal fields to numbers for JSON serialization
    const incomeStreamWithNumbers = {
      ...incomeStream,
      expectedMonthly: Number(incomeStream.expectedMonthly),
      actualMonthly: incomeStream.actualMonthly ? Number(incomeStream.actualMonthly) : null,
    };

    return NextResponse.json(incomeStreamWithNumbers, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    
    console.error('Error creating income stream:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 