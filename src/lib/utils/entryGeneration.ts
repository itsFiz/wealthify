import { prisma } from '@/lib/db';

export interface GenerationResult {
  success: boolean;
  message: string;
  generatedCount: number;
}

/**
 * Get the start of a month (1st day, 00:00:00)
 */
function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Generate months between two dates (inclusive)
 */
function generateMonthsBetween(startDate: Date, endDate: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Convert frequency-based amount to monthly amount
 */
function convertToMonthlyAmount(amount: number, frequency: string): number {
  const numAmount = Number(amount) || 0;
  
  switch (frequency) {
    case 'WEEKLY':
      return numAmount * 4.33; // Average weeks per month
    case 'BI_WEEKLY':
      return numAmount * 2.17; // Bi-weekly to monthly
    case 'MONTHLY':
      return numAmount;
    case 'QUARTERLY':
      return numAmount / 3;
    case 'ANNUALLY':
      return numAmount / 12;
    case 'ONE_TIME':
      return numAmount; // Full amount in the creation month only
    default:
      return numAmount;
  }
}

/**
 * Generate income entries from earnedDate (or creation date) to current month
 */
export async function generateIncomeEntries(incomeStreamId: string): Promise<GenerationResult> {
  try {
    console.log(`🔍 Starting entry generation for income stream: ${incomeStreamId}`);
    
    const incomeStream = await prisma.incomeStream.findUnique({
      where: { id: incomeStreamId },
    });

    if (!incomeStream) {
      console.error(`❌ Income stream not found: ${incomeStreamId}`);
      return { success: false, message: 'Income stream not found', generatedCount: 0 };
    }

    // Use earnedDate if provided, otherwise fall back to createdAt
    const earnedDate = incomeStream.earnedDate ? new Date(incomeStream.earnedDate) : null;
    const createdAt = new Date(incomeStream.createdAt);
    const startDate = earnedDate || createdAt;
    const currentDate = new Date();
    
    // If income stream has an end date, use it as the end point for entry generation
    const endDate = incomeStream.endDate ? new Date(incomeStream.endDate) : currentDate;
    // For end dates, we want to include the end date month itself, so we go to the end of that month
    const effectiveEndDate = incomeStream.endDate ? 
      new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0) : // Last day of end date month
      currentDate;
    
    console.log(`📊 Income Stream Details:`, {
      id: incomeStream.id,
      name: incomeStream.name,
      expectedMonthly: Number(incomeStream.expectedMonthly),
      frequency: incomeStream.frequency,
      earnedDate: earnedDate ? earnedDate.toISOString() : 'null',
      createdAt: createdAt.toISOString(),
      startDate: startDate.toISOString(),
      currentDate: currentDate.toISOString(),
    });
    
    console.log(`📅 Date Analysis:`, {
      earnedDateLocal: earnedDate ? earnedDate.toLocaleDateString() : 'null',
      createdAtLocal: createdAt.toLocaleDateString(),
      startDateLocal: startDate.toLocaleDateString(),
      currentDateLocal: currentDate.toLocaleDateString(),
      usingEarnedDate: !!earnedDate,
    });
    
    // Generate all months from start date to effective end date
    const monthsToGenerate = generateMonthsBetween(startDate, effectiveEndDate);
    
    console.log(`📅 Months to generate (${monthsToGenerate.length}):`, 
      monthsToGenerate.map(m => m.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' }))
    );
    
    let generatedCount = 0;
    let skippedCount = 0;
    let existingCount = 0;
    
    for (const month of monthsToGenerate) {
      const monthStart = getMonthStart(month.getFullYear(), month.getMonth());
      const monthEnd = getMonthStart(month.getFullYear(), month.getMonth() + 1);
      
      console.log(`🔍 Checking month: ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`);
      
      // Check if entry already exists for this month
      const existingEntry = await prisma.incomeEntry.findFirst({
        where: {
          incomeStreamId: incomeStreamId,
          month: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      });

      if (!existingEntry) {
        // For ONE_TIME frequency, only create entry for the start month
        if (incomeStream.frequency === 'ONE_TIME' && 
            (month.getMonth() !== startDate.getMonth() || 
             month.getFullYear() !== startDate.getFullYear())) {
          console.log(`⏭️ Skipping ONE_TIME entry for ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} (not start month)`);
          skippedCount++;
          continue;
        }

        const monthlyAmount = convertToMonthlyAmount(
          Number(incomeStream.expectedMonthly), 
          incomeStream.frequency
        );

        console.log(`✅ Creating entry for ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}: RM${monthlyAmount}`);

        const newEntry = await prisma.incomeEntry.create({
          data: {
            incomeStreamId: incomeStreamId,
            amount: monthlyAmount,
            month: monthStart,
            notes: `Auto-generated from ${incomeStream.name}`,
          },
        });
        
        console.log(`✅ Created entry:`, {
          id: newEntry.id,
          amount: Number(newEntry.amount),
          month: new Date(newEntry.month).toLocaleDateString(),
        });
        
        generatedCount++;
      } else {
        console.log(`⏭️ Entry already exists for ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}: RM${Number(existingEntry.amount)}`);
        existingCount++;
      }
    }

    const summary = {
      totalMonths: monthsToGenerate.length,
      generated: generatedCount,
      existing: existingCount,
      skipped: skippedCount,
    };
    
    console.log(`📊 Generation Summary:`, summary);

    return { 
      success: true, 
      message: `Generated ${generatedCount} income entries for ${incomeStream.name} (${existingCount} existing, ${skippedCount} skipped)`, 
      generatedCount 
    };
  } catch (error) {
    console.error('❌ Error generating income entries:', error);
    return { success: false, message: 'Failed to generate income entries', generatedCount: 0 };
  }
}

/**
 * Generate expense entries from incurredDate (or creation date) to current month
 */
export async function generateExpenseEntries(expenseId: string): Promise<GenerationResult> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return { success: false, message: 'Expense not found', generatedCount: 0 };
    }

    // Use incurredDate if provided, otherwise fall back to createdAt
    const startDate = new Date(expense.incurredDate || expense.createdAt);
    const currentDate = new Date();
    
    // If expense has an end date, use it as the end point for entry generation
    const endDate = expense.endDate ? new Date(expense.endDate) : currentDate;
    // For end dates, we want to include the end date month itself, so we go to the end of that month
    const effectiveEndDate = expense.endDate ? 
      new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0) : // Last day of end date month
      currentDate;
    
    console.log(`📅 Generating expense entries for ${expense.name} from ${startDate.toLocaleDateString()} to ${effectiveEndDate.toLocaleDateString()}`);
    
    // Generate all months from start date to effective end date
    const monthsToGenerate = generateMonthsBetween(startDate, effectiveEndDate);
    
    let generatedCount = 0;
    
    for (const month of monthsToGenerate) {
      // Check if entry already exists for this month
      const existingEntry = await prisma.expenseEntry.findFirst({
        where: {
          expenseId: expenseId,
          month: {
            gte: getMonthStart(month.getFullYear(), month.getMonth()),
            lt: getMonthStart(month.getFullYear(), month.getMonth() + 1),
          },
        },
      });

      if (!existingEntry) {
        // For ONE_TIME frequency, only create entry for the start month
        if (expense.frequency === 'ONE_TIME' && 
            (month.getMonth() !== startDate.getMonth() || 
             month.getFullYear() !== startDate.getFullYear())) {
          continue;
        }

        const monthlyAmount = convertToMonthlyAmount(
          Number(expense.amount), 
          expense.frequency
        );

        await prisma.expenseEntry.create({
          data: {
            expenseId: expenseId,
            amount: monthlyAmount,
            month: getMonthStart(month.getFullYear(), month.getMonth()),
            notes: `Auto-generated from ${expense.name}`,
          },
        });
        
        generatedCount++;
        console.log(`✅ Created entry for ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}: RM${monthlyAmount}`);
      } else {
        console.log(`⏭️ Entry already exists for ${month.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`);
      }
    }

    return { 
      success: true, 
      message: `Generated ${generatedCount} expense entries for ${expense.name}`, 
      generatedCount 
    };
  } catch (error) {
    console.error('Error generating expense entries:', error);
    return { success: false, message: 'Failed to generate expense entries', generatedCount: 0 };
  }
}

/**
 * Update existing income stream entries when amount changes
 */
export async function updateIncomeStreamEntries(incomeStreamId: string, newAmount: number): Promise<GenerationResult> {
  try {
    const incomeStream = await prisma.incomeStream.findUnique({
      where: { id: incomeStreamId },
    });

    if (!incomeStream) {
      return { success: false, message: 'Income stream not found', generatedCount: 0 };
    }

    const currentDate = new Date();
    const currentMonthStart = getMonthStart(currentDate.getFullYear(), currentDate.getMonth());
    
    const monthlyAmount = convertToMonthlyAmount(newAmount, incomeStream.frequency);

    // Update current and future entries (don't touch historical entries)
    const updatedEntries = await prisma.incomeEntry.updateMany({
      where: {
        incomeStreamId: incomeStreamId,
        month: {
          gte: currentMonthStart,
        },
      },
      data: {
        amount: monthlyAmount,
      },
    });

    return { 
      success: true, 
      message: `Updated ${updatedEntries.count} current/future income entries`, 
      generatedCount: updatedEntries.count 
    };
  } catch (error) {
    console.error('Error updating income stream entries:', error);
    return { success: false, message: 'Failed to update income entries', generatedCount: 0 };
  }
}

/**
 * Update existing expense entries when amount changes
 */
export async function updateExpenseEntries(expenseId: string, newAmount: number): Promise<GenerationResult> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return { success: false, message: 'Expense not found', generatedCount: 0 };
    }

    const currentDate = new Date();
    const currentMonthStart = getMonthStart(currentDate.getFullYear(), currentDate.getMonth());
    
    const monthlyAmount = convertToMonthlyAmount(newAmount, expense.frequency);

    // Update current and future entries (don't touch historical entries)
    const updatedEntries = await prisma.expenseEntry.updateMany({
      where: {
        expenseId: expenseId,
        month: {
          gte: currentMonthStart,
        },
      },
      data: {
        amount: monthlyAmount,
      },
    });

    return { 
      success: true, 
      message: `Updated ${updatedEntries.count} current/future expense entries`, 
      generatedCount: updatedEntries.count 
    };
  } catch (error) {
    console.error('Error updating expense entries:', error);
    return { success: false, message: 'Failed to update expense entries', generatedCount: 0 };
  }
}

/**
 * Delete all entries related to an income stream
 */
export async function deleteIncomeStreamEntries(incomeStreamId: string): Promise<GenerationResult> {
  try {
    const deletedEntries = await prisma.incomeEntry.deleteMany({
      where: {
        incomeStreamId: incomeStreamId,
      },
    });

    return { 
      success: true, 
      message: `Deleted ${deletedEntries.count} related income entries`, 
      generatedCount: deletedEntries.count 
    };
  } catch (error) {
    console.error('Error deleting income stream entries:', error);
    return { success: false, message: 'Failed to delete income entries', generatedCount: 0 };
  }
}

/**
 * Delete all entries related to an expense
 */
export async function deleteExpenseEntries(expenseId: string): Promise<GenerationResult> {
  try {
    const deletedEntries = await prisma.expenseEntry.deleteMany({
      where: {
        expenseId: expenseId,
      },
    });

    return { 
      success: true, 
      message: `Deleted ${deletedEntries.count} related expense entries`, 
      generatedCount: deletedEntries.count 
    };
  } catch (error) {
    console.error('Error deleting expense entries:', error);
    return { success: false, message: 'Failed to delete expense entries', generatedCount: 0 };
  }
}

/**
 * Generate missing entries for all existing income streams
 */
export async function generateMissingIncomeEntries(userId: string): Promise<GenerationResult> {
  try {
    const incomeStreams = await prisma.incomeStream.findMany({
      where: { userId },
    });

    let totalGenerated = 0;
    
    for (const stream of incomeStreams) {
      const result = await generateIncomeEntries(stream.id);
      totalGenerated += result.generatedCount;
    }

    return { 
      success: true, 
      message: `Generated ${totalGenerated} missing income entries for ${incomeStreams.length} streams`, 
      generatedCount: totalGenerated 
    };
  } catch (error) {
    console.error('Error generating missing income entries:', error);
    return { success: false, message: 'Failed to generate missing income entries', generatedCount: 0 };
  }
}

/**
 * Generate missing entries for all existing expenses
 */
export async function generateMissingExpenseEntries(userId: string): Promise<GenerationResult> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    let totalGenerated = 0;
    
    for (const expense of expenses) {
      const result = await generateExpenseEntries(expense.id);
      totalGenerated += result.generatedCount;
    }

    return { 
      success: true, 
      message: `Generated ${totalGenerated} missing expense entries for ${expenses.length} expenses`, 
      generatedCount: totalGenerated 
    };
  } catch (error) {
    console.error('Error generating missing expense entries:', error);
    return { success: false, message: 'Failed to generate missing expense entries', generatedCount: 0 };
  }
}

/**
 * Generate entries for the upcoming month (to be called on month transition)
 */
export async function generateUpcomingMonthEntries(userId: string) {
  try {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    // Generate income entries for next month
    const incomeStreams = await prisma.incomeStream.findMany({
      where: { 
        userId,
        isActive: true,
      },
    });

    let totalGenerated = 0;

    for (const stream of incomeStreams) {
      const existingEntry = await prisma.incomeEntry.findFirst({
        where: {
          incomeStreamId: stream.id,
          month: {
            gte: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
            lt: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1),
          },
        },
      });

      if (!existingEntry) {
        await prisma.incomeEntry.create({
          data: {
            incomeStreamId: stream.id,
            amount: stream.actualMonthly || stream.expectedMonthly,
            month: new Date(nextMonth),
            notes: `Auto-generated for ${nextMonth.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`,
          },
        });
        totalGenerated++;
      }
    }

    // Generate expense entries for next month
    const expenses = await prisma.expense.findMany({
      where: { 
        userId,
        isActive: true,
      },
    });

    for (const expense of expenses) {
      const existingEntry = await prisma.expenseEntry.findFirst({
        where: {
          expenseId: expense.id,
          month: {
            gte: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
            lt: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1),
          },
        },
      });

      if (!existingEntry) {
        await prisma.expenseEntry.create({
          data: {
            expenseId: expense.id,
            amount: expense.amount,
            month: new Date(nextMonth),
            notes: `Auto-generated for ${nextMonth.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`,
          },
        });
        totalGenerated++;
      }
    }
    
    console.log(`✅ Generated ${totalGenerated} entries for upcoming month`);
    return totalGenerated;
  } catch (error) {
    console.error('Error generating upcoming month entries:', error);
    throw error;
  }
} 