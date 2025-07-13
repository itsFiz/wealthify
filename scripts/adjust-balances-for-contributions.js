const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function adjustBalancesForContributions() {
  console.log('🔄 Starting balance adjustment for historical goal contributions...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        goals: {
          include: {
            contributions: true,
          },
        },
      },
    });

    console.log(`📊 Found ${users.length} users to process`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`);
      
      // Calculate total contributions for this user
      const totalContributions = user.goals.reduce((total, goal) => {
        return total + goal.contributions.reduce((goalTotal, contrib) => {
          return goalTotal + Number(contrib.amount);
        }, 0);
      }, 0);

      if (totalContributions > 0) {
        console.log(`💰 User has RM${totalContributions.toFixed(2)} in total contributions`);
        
        const currentBalance = Number(user.currentBalance || 0);
        const newBalance = currentBalance - totalContributions;
        
        console.log(`💳 Current balance: RM${currentBalance.toFixed(2)} → New balance: RM${newBalance.toFixed(2)}`);
        
        // Update user's current balance
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentBalance: newBalance,
          },
        });

        // Create balance entry for tracking
        await prisma.balanceEntry.create({
          data: {
            userId: user.id,
            amount: newBalance,
            previousAmount: currentBalance,
            changeAmount: -totalContributions,
            entryType: 'CORRECTION',
            notes: 'Balance adjustment for historical goal contributions',
          },
        });

        console.log(`✅ Updated balance for ${user.email}`);
      } else {
        console.log(`ℹ️ No contributions found for ${user.email}`);
      }
    }

    console.log('\n🎉 Balance adjustment completed successfully!');
  } catch (error) {
    console.error('❌ Error during balance adjustment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  adjustBalancesForContributions()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { adjustBalancesForContributions }; 