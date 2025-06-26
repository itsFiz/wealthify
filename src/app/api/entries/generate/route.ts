import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  generateMissingIncomeEntries, 
  generateMissingExpenseEntries 
} from '@/lib/utils/entryGeneration';

// POST /api/entries/generate - Generate missing entries for existing income streams and expenses
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
    const { type } = body; // 'income', 'expense', or 'all'

    let incomeGenerated = 0;
    let expenseGenerated = 0;

    try {
      if (type === 'income' || type === 'all') {
        console.log(`🔄 Generating missing income entries for user: ${user.email}`);
        const incomeResult = await generateMissingIncomeEntries(user.id);
        incomeGenerated = incomeResult.generatedCount;
        console.log(`✅ ${incomeResult.message}`);
      }

      if (type === 'expense' || type === 'all') {
        console.log(`🔄 Generating missing expense entries for user: ${user.email}`);
        const expenseResult = await generateMissingExpenseEntries(user.id);
        expenseGenerated = expenseResult.generatedCount;
        console.log(`✅ ${expenseResult.message}`);
      }

      const totalGenerated = incomeGenerated + expenseGenerated;

      return NextResponse.json({
        success: true,
        message: `Generated ${totalGenerated} missing entries`,
        details: {
          incomeEntries: incomeGenerated,
          expenseEntries: expenseGenerated,
          total: totalGenerated
        }
      });
    } catch (error) {
      console.error('❌ Error generating entries:', error);
      return NextResponse.json({ 
        error: 'Failed to generate entries', 
        details: (error as Error).message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in generate entries endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 