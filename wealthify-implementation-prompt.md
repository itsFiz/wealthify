# 🚀 Wealthify Implementation Guide for Cursor
## Comprehensive Development Prompt for Smart Finance Goal Engine

### 📋 Project Overview
Build **Wealthify** - A gamified personal finance tracker that helps users set milestone goals, track multiple income streams, and visualize progress toward major purchases (houses, cars, debt payoff, etc.).

**Domain**: wealthify.f12.gg  
**Target User**: Entrepreneurs, professionals, and creators managing multiple income sources  
**Core Value**: Transform financial planning from overwhelming to engaging through gamification and clear milestone tracking

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/ui + Recharts for data visualization
- **Database**: PostgreSQL with Prisma ORM + NeonDB
- **Hosting**: Vercel
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation

### Project Structure
```
wealthify/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── income/
│   │   ├── expenses/
│   │   ├── simulator/
│   │   └── reports/
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── charts/
│   │   └── gamification/
│   ├── lib/
│   │   ├── db/                 # Database utilities
│   │   ├── calculations/       # Financial calculators
│   │   ├── validations/        # Zod schemas
│   │   └── utils/
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript definitions
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── docs/
```

---

## 🗄️ Database Schema Design

### Core Tables
```prisma
// User & Authentication
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  incomeStreams IncomeStream[]
  expenses      Expense[]
  goals         Goal[]
  budgets       Budget[]
  
  @@map("users")
}

// Income Streams
model IncomeStream {
  id          String   @id @default(cuid())
  userId      String
  name        String   // e.g., "Full-time Salary", "Startup Revenue"
  type        IncomeType
  expectedMonthly Decimal
  actualMonthly   Decimal?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  entries     IncomeEntry[]
  
  @@map("income_streams")
}

model IncomeEntry {
  id              String   @id @default(cuid())
  incomeStreamId  String
  amount          Decimal
  month           DateTime
  notes           String?
  createdAt       DateTime @default(now())
  
  incomeStream    IncomeStream @relation(fields: [incomeStreamId], references: [id])
  
  @@map("income_entries")
}

// Expenses & Burn Tracking
model Expense {
  id          String   @id @default(cuid())
  userId      String
  name        String
  category    ExpenseCategory
  type        ExpenseType // FIXED, VARIABLE, STARTUP_BURN
  amount      Decimal
  frequency   Frequency // MONTHLY, WEEKLY, ONE_TIME
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  entries     ExpenseEntry[]
  
  @@map("expenses")
}

model ExpenseEntry {
  id         String   @id @default(cuid())
  expenseId  String
  amount     Decimal
  month      DateTime
  notes      String?
  createdAt  DateTime @default(now())
  
  expense    Expense  @relation(fields: [expenseId], references: [id])
  
  @@map("expense_entries")
}

// Goals & Milestones
model Goal {
  id              String   @id @default(cuid())
  userId          String
  name            String   // e.g., "GT86 Purchase", "House Down Payment"
  description     String?
  targetAmount    Decimal
  currentAmount   Decimal  @default(0)
  targetDate      DateTime
  priority        Int      @default(1)
  category        GoalCategory
  isCompleted     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  contributions   GoalContribution[]
  
  @@map("goals")
}

model GoalContribution {
  id        String   @id @default(cuid())
  goalId    String
  amount    Decimal
  month     DateTime
  notes     String?
  createdAt DateTime @default(now())
  
  goal      Goal     @relation(fields: [goalId], references: [id])
  
  @@map("goal_contributions")
}

// Budget Planning
model Budget {
  id              String   @id @default(cuid())
  userId          String
  month           DateTime
  totalIncome     Decimal
  totalExpenses   Decimal
  totalSavings    Decimal
  burnRate        Decimal  // Percentage
  healthScore     Int      // 1-100
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@map("budgets")
}

// Enums
enum IncomeType {
  SALARY
  BUSINESS
  FREELANCE
  INVESTMENT
  PASSIVE
  OTHER
}

enum ExpenseCategory {
  HOUSING
  TRANSPORTATION
  FOOD
  UTILITIES
  ENTERTAINMENT
  HEALTHCARE
  BUSINESS
  PERSONAL
  OTHER
}

enum ExpenseType {
  FIXED
  VARIABLE
  STARTUP_BURN
}

enum Frequency {
  MONTHLY
  WEEKLY
  YEARLY
  ONE_TIME
}

enum GoalCategory {
  EMERGENCY_FUND
  DEBT_PAYOFF
  PROPERTY
  VEHICLE
  INVESTMENT
  VACATION
  BUSINESS
  OTHER
}
```

---

## 🎯 Feature Implementation Roadmap

### Phase 1: Core Foundation (Week 1-2)
1. **Project Setup**
   - Initialize Next.js 14 project with TypeScript
   - Configure Tailwind CSS + Shadcn/ui
   - Set up Prisma with PostgreSQL
   - Configure NextAuth.js
   - Set up Vercel deployment

2. **Authentication System**
   - Login/Register pages
   - Protected routes middleware
   - User profile management

3. **Database Setup**
   - Implement Prisma schema
   - Create initial migrations
   - Seed data for development

### Phase 2: Income & Expense Management (Week 2-3)
1. **Income Stream Management**
   - CRUD operations for income streams
   - Monthly income entry forms
   - Income stream dashboard with charts

2. **Expense Tracking**
   - CRUD operations for expenses
   - Expense categorization
   - Monthly expense entry forms
   - Burn rate calculation

3. **Budget Overview**
   - Monthly budget summary
   - Income vs expenses visualization
   - Health score calculation (burn rate %)

### Phase 3: Goals & Milestones (Week 3-4)
1. **Goal Management System**
   - CRUD operations for financial goals
   - Goal progress tracking
   - Goal priority management

2. **Contribution Tracking**
   - Monthly goal contributions
   - Progress visualization
   - Achievement milestones

3. **Affordability Calculator**
   - Goal timeline calculator
   - Required monthly savings calculator
   - Income gap analysis

### Phase 4: Advanced Features (Week 4-5)
1. **Financial Simulator**
   - "What if" scenarios
   - Income increase simulator
   - Goal timeline optimization

2. **Dashboard & Analytics**
   - Comprehensive financial dashboard
   - Net worth tracking
   - Progress charts and visualizations

3. **Gamification Elements**
   - Progress bars with XP-style visuals
   - Achievement badges
   - Level-up animations
   - Goal completion celebrations

### Phase 5: Reports & UX Polish (Week 5-6)
1. **Reporting System**
   - Monthly financial reports
   - Goal progress reports
   - Exportable PDF reports

2. **UX Enhancements**
   - Responsive design optimization
   - Loading states and animations
   - Error handling and validation
   - Performance optimization

---

## 🧮 Core Calculation Logic

### Key Financial Formulas to Implement

```typescript
// Monthly savings required for goal
const calculateMonthlySavings = (
  targetAmount: number,
  currentAmount: number,
  monthsRemaining: number
): number => {
  return (targetAmount - currentAmount) / monthsRemaining;
};

// Goal completion timeline
const calculateGoalTimeline = (
  targetAmount: number,
  currentAmount: number,
  monthlySavings: number
): number => {
  return Math.ceil((targetAmount - currentAmount) / monthlySavings);
};

// Burn rate calculation
const calculateBurnRate = (
  totalExpenses: number,
  totalIncome: number
): number => {
  return (totalExpenses / totalIncome) * 100;
};

// Financial health score
const calculateHealthScore = (
  burnRate: number,
  savingsRate: number,
  debtToIncomeRatio: number
): number => {
  // Custom scoring algorithm based on financial health indicators
  const burnScore = burnRate < 50 ? 40 : burnRate < 70 ? 30 : 10;
  const savingsScore = savingsRate > 20 ? 40 : savingsRate > 10 ? 30 : 10;
  const debtScore = debtToIncomeRatio < 20 ? 20 : debtToIncomeRatio < 40 ? 15 : 5;
  
  return burnScore + savingsScore + debtScore;
};

// Required income increase for goal
const calculateIncomeIncrease = (
  currentIncome: number,
  currentExpenses: number,
  goalMonthlySavings: number
): number => {
  const currentSavings = currentIncome - currentExpenses;
  const additionalSavingsNeeded = goalMonthlySavings - currentSavings;
  return Math.max(0, additionalSavingsNeeded);
};
```

---

## 🎨 UI/UX Design Requirements

### Design System
- **Color Palette**: Modern dark theme with accent colors for progress
- **Typography**: Clean, readable fonts (Inter or similar)
- **Components**: Consistent button styles, form inputs, cards
- **Icons**: Lucide React or similar icon library

### Key UI Components to Build

1. **Dashboard Cards**
   - Income summary card
   - Expense burn rate card
   - Goal progress cards
   - Net worth card

2. **Charts & Visualizations**
   - Income vs expenses line chart
   - Goal progress bars
   - Expense category pie chart
   - Net worth growth chart

3. **Forms**
   - Income stream creation/edit
   - Expense tracking forms
   - Goal creation wizard
   - Monthly budget entry

4. **Gamification Elements**
   - Progress bars with animations
   - Achievement badges
   - Level indicators
   - Celebration modals

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop dashboard layout

---

## 🧪 Testing Strategy

### Unit Tests
- Financial calculation functions
- Database operations
- Validation schemas

### Integration Tests
- API routes
- Database interactions
- Authentication flows

### E2E Tests
- User journey flows
- Goal creation and tracking
- Report generation

---

## 📊 Performance Requirements

### Core Metrics
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds
- Database queries: Optimized with indexes
- Real-time updates: WebSocket or polling for live data

### Optimization Strategies
- Image optimization
- Code splitting
- Database query optimization
- Caching strategy

---

## 🚀 Deployment & DevOps

### Environment Setup
- Development environment with local PostgreSQL
- Staging environment on Vercel
- Production environment with monitoring

### CI/CD Pipeline
- GitHub Actions for automated testing
- Automatic deployment to Vercel
- Database migration handling

---

## 📈 Success Metrics

### User Engagement
- Daily active users
- Goal completion rate
- Feature usage analytics

### Financial Impact
- Average savings increase
- Goal achievement time reduction
- User-reported financial confidence improvement

---

## 🔄 Implementation Instructions for Cursor

### Step-by-Step Execution Plan

1. **Initialize Project Structure**
   ```bash
   npx create-next-app@latest wealthify --typescript --tailwind --eslint --app
   cd wealthify
   npm install @prisma/client prisma @next-auth/prisma-adapter next-auth
   npm install @hookform/resolvers react-hook-form zod zustand
   npm install @radix-ui/react-* recharts lucide-react
   npx shadcn-ui@latest init
   ```

2. **Set Up Database Schema**
   - Create `prisma/schema.prisma` with the provided schema
   - Set up database connection
   - Run initial migration

3. **Build Authentication System**
   - Configure NextAuth.js
   - Create login/register pages
   - Set up protected route middleware

4. **Implement Core Features in Order**
   - Income stream management
   - Expense tracking
   - Goal management
   - Dashboard creation
   - Calculator utilities
   - Reports generation

5. **Add Gamification Layer**
   - Progress visualizations
   - Achievement system
   - Level-up animations

6. **Polish and Deploy**
   - Responsive design
   - Performance optimization
   - Production deployment

### Development Best Practices
- Use TypeScript strictly
- Implement proper error handling
- Add loading states for all async operations
- Follow Next.js 14 best practices
- Maintain clean, documented code
- Test core financial calculations thoroughly

---

**Ready to implement? Start with Phase 1 and proceed step by step. Each phase builds upon the previous one, ensuring a solid foundation for the Wealthify Smart Finance Goal Engine.** 