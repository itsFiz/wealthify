import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create test users with different roles
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@wealthify.com',
      password: await bcrypt.hash('password123', 12),
      role: 'SUPER_ADMIN' as const,
      permissions: ['*'], // All permissions
      isActive: true,
    },
    {
      name: 'Admin User',
      email: 'admin@wealthify.com',
      password: await bcrypt.hash('password123', 12),
      role: 'ADMIN' as const,
      permissions: ['user:read', 'user:write', 'analytics:read', 'support:write'],
      isActive: true,
    },
    {
      name: 'Ahmad Rahman',
      email: 'ahmad@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'PREMIUM_USER' as const,
      permissions: ['premium:access', 'advanced:analytics'],
      isActive: true,
    },
    {
      name: 'Siti Nurhaliza',
      email: 'siti@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'USER' as const,
      permissions: [],
      isActive: true,
    },
    {
      name: 'Test User',
      email: 'test@wealthify.com',
      password: await bcrypt.hash('password123', 12),
      role: 'USER' as const,
      permissions: [],
      isActive: true,
    }
  ]

  const createdUsers = []
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData,
    })
    createdUsers.push(user)
    console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`)
  }

  // Create sample financial data for Ahmad (Premium User)
  const ahmad = createdUsers.find(u => u.email === 'ahmad@example.com')!
  
  // Income Streams for Ahmad
  const ahmadIncomes = [
    {
      userId: ahmad.id,
      name: 'Software Engineer Salary',
      type: 'SALARY' as const,
      expectedMonthly: 8500.00,
      actualMonthly: 8500.00,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Freelance Web Development',
      type: 'FREELANCE' as const,
      expectedMonthly: 2000.00,
      actualMonthly: 2300.00,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Investment Dividends',
      type: 'INVESTMENT' as const,
      expectedMonthly: 500.00,
      actualMonthly: 480.00,
      isActive: true,
    }
  ]

  for (const incomeData of ahmadIncomes) {
    const income = await prisma.incomeStream.create({
      data: incomeData,
    })
    console.log(`💰 Created income stream: ${income.name} - RM${income.expectedMonthly}/month`)

    // Create income entries for the last 3 months
    for (let i = 0; i < 3; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      month.setDate(1) // First day of month

      await prisma.incomeEntry.create({
        data: {
          incomeStreamId: income.id,
          amount: incomeData.actualMonthly || incomeData.expectedMonthly,
          month: month,
          notes: i === 0 ? 'Current month' : `${i} months ago`,
        },
      })
    }
  }

  // Expenses for Ahmad
  const ahmadExpenses = [
    {
      userId: ahmad.id,
      name: 'Apartment Rent',
      category: 'HOUSING' as const,
      type: 'FIXED' as const,
      amount: 2500.00,
      frequency: 'MONTHLY' as const,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Car Loan Payment',
      category: 'TRANSPORTATION' as const,
      type: 'FIXED' as const,
      amount: 800.00,
      frequency: 'MONTHLY' as const,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Groceries & Food',
      category: 'FOOD' as const,
      type: 'VARIABLE' as const,
      amount: 600.00,
      frequency: 'MONTHLY' as const,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Utilities (Electric, Water, Internet)',
      category: 'UTILITIES' as const,
      type: 'FIXED' as const,
      amount: 350.00,
      frequency: 'MONTHLY' as const,
      isActive: true,
    },
    {
      userId: ahmad.id,
      name: 'Entertainment & Dining',
      category: 'ENTERTAINMENT' as const,
      type: 'VARIABLE' as const,
      amount: 400.00,
      frequency: 'MONTHLY' as const,
      isActive: true,
    }
  ]

  for (const expenseData of ahmadExpenses) {
    const expense = await prisma.expense.create({
      data: expenseData,
    })
    console.log(`💸 Created expense: ${expense.name} - RM${expense.amount}/month`)

    // Create expense entries for the last 3 months
    for (let i = 0; i < 3; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      month.setDate(1)

      // Add some variation to variable expenses
      let amount = expenseData.amount
      if (expenseData.type === 'VARIABLE') {
        amount = expenseData.amount * (0.8 + Math.random() * 0.4) // ±20% variation
      }

      await prisma.expenseEntry.create({
        data: {
          expenseId: expense.id,
          amount: amount,
          month: month,
          notes: i === 0 ? 'Current month' : `${i} months ago`,
        },
      })
    }
  }

  // Goals for Ahmad
  const ahmadGoals = [
    {
      userId: ahmad.id,
      name: 'Emergency Fund',
      description: '6 months of expenses saved',
      targetAmount: 30000.00,
      currentAmount: 12500.00,
      targetDate: new Date('2024-12-31'),
      priority: 1,
      category: 'EMERGENCY_FUND' as const,
      isCompleted: false,
    },
    {
      userId: ahmad.id,
      name: 'Toyota GR86 Purchase',
      description: 'Down payment for dream sports car',
      targetAmount: 25000.00,
      currentAmount: 8200.00,
      targetDate: new Date('2025-06-30'),
      priority: 2,
      category: 'VEHICLE' as const,
      isCompleted: false,
    },
    {
      userId: ahmad.id,
      name: 'Property Investment',
      description: 'Down payment for investment property in KL',
      targetAmount: 80000.00,
      currentAmount: 15000.00,
      targetDate: new Date('2026-03-31'),
      priority: 3,
      category: 'PROPERTY' as const,
      isCompleted: false,
    },
    {
      userId: ahmad.id,
      name: 'Japan Vacation',
      description: '2-week trip to Japan with family',
      targetAmount: 8000.00,
      currentAmount: 8000.00,
      targetDate: new Date('2024-05-01'),
      priority: 4,
      category: 'VACATION' as const,
      isCompleted: true,
    }
  ]

  for (const goalData of ahmadGoals) {
    const goal = await prisma.goal.create({
      data: goalData,
    })
    console.log(`🎯 Created goal: ${goal.name} - RM${goal.currentAmount}/RM${goal.targetAmount}`)

    // Create goal contributions for the last few months
    if (Number(goal.currentAmount) > 0) {
      const monthlyContribution = Number(goal.currentAmount) / 3
      for (let i = 0; i < 3; i++) {
        const month = new Date()
        month.setMonth(month.getMonth() - i)
        month.setDate(15) // Mid-month contribution

        await prisma.goalContribution.create({
          data: {
            goalId: goal.id,
            amount: monthlyContribution,
            month: month,
            notes: `Monthly savings contribution`,
          },
        })
      }
    }
  }

  // Create sample financial data for Siti (Regular User)
  const siti = createdUsers.find(u => u.email === 'siti@example.com')!
  
  // Simple income for Siti
  const sitiIncome = await prisma.incomeStream.create({
    data: {
      userId: siti.id,
      name: 'Marketing Executive Salary',
      type: 'SALARY' as const,
      expectedMonthly: 4500.00,
      actualMonthly: 4500.00,
      isActive: true,
    },
  })
  console.log(`💰 Created income for Siti: ${sitiIncome.name}`)

  // Simple goal for Siti
  const sitiGoal = await prisma.goal.create({
    data: {
      userId: siti.id,
      name: 'Emergency Savings',
      description: 'Building up emergency fund',
      targetAmount: 15000.00,
      currentAmount: 3200.00,
      targetDate: new Date('2025-01-31'),
      priority: 1,
      category: 'EMERGENCY_FUND' as const,
      isCompleted: false,
    },
  })
  console.log(`🎯 Created goal for Siti: ${sitiGoal.name}`)

  // Create budget summaries for Ahmad
  for (let i = 0; i < 3; i++) {
    const month = new Date()
    month.setMonth(month.getMonth() - i)
    month.setDate(1)

    const totalIncome = 11280.00 // Sum of Ahmad's income
    const totalExpenses = 4650.00 // Sum of Ahmad's expenses
    const totalSavings = totalIncome - totalExpenses
    const burnRate = (totalExpenses / totalIncome) * 100
    const healthScore = Math.max(20, Math.min(100, 100 - burnRate + 20))

    await prisma.budget.create({
      data: {
        userId: ahmad.id,
        month: month,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        totalSavings: totalSavings,
        burnRate: burnRate,
        healthScore: Math.round(healthScore),
      },
    })
  }
  console.log(`📊 Created budget summaries for Ahmad`)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Test Users Created:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  createdUsers.forEach(user => {
    console.log(`👤 ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🏷️  Role: ${user.role}`)
    console.log(`   🔑 Permissions: ${user.permissions.length > 0 ? user.permissions.join(', ') : 'Default user permissions'}`)
    console.log(`   ✅ Status: ${user.isActive ? 'Active' : 'Inactive'}`)
    console.log('   ─────────────────────────────────────────────────')
  })
  
  console.log('\n💡 You can now login with any of these test accounts!')
  console.log('💡 Ahmad has comprehensive financial data for testing dashboard features')
  console.log('💡 Siti has basic data for testing regular user experience')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 