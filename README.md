# 🚀 Wealthify - Smart Finance Goal Engine

Transform your financial dreams into achievable milestones with gamified tracking and smart goal planning.

## 🎯 Core Concept

A personal finance gamified dashboard that:
- **Tracks multiple income sources** (salary, side hustles, startup revenue)
- **Logs fixed & flexible expenses** (startup burn, rent, subscriptions)
- **Creates wealth goals** (GT86, house down payment, emergency fund)
- **Auto-calculates** required monthly savings, income boosts, or cutbacks
- **Visualizes progress** like an RPG: XP bars, % unlocked, "Next Level" milestones

## ✅ Current Implementation Status

### 🔥 **Phase 1-3 Complete - Full Foundation**

#### **🧮 Core Business Logic**
- ✅ Financial calculation engine with 15+ functions
- ✅ Goal timeline & affordability analysis
- ✅ Burn rate & health score algorithms
- ✅ Malaysian Ringgit (RM) formatting

#### **🎨 UI Components & Design**
- ✅ Modern dashboard with 4 key metric cards
- ✅ Gamified goal progress cards with XP-style bars
- ✅ 25%, 50%, 75%, 100% milestone achievements
- ✅ Level badges and trophy animations
- ✅ Responsive design with Tailwind CSS

#### **🏪 State Management**
- ✅ Zustand stores with real-time calculations
- ✅ Automatic health score updates
- ✅ CRUD operations for all entities

#### **🔐 Authentication & Database**
- ✅ NextAuth.js with Google OAuth
- ✅ Prisma ORM with PostgreSQL (NeonDB)
- ✅ User sessions and protected routes
- ✅ Complete database schema

#### **🧭 Navigation**
- ✅ Modern sidebar with 8 main sections
- ✅ User profile integration
- ✅ Authentication-aware routing

## 📊 Live Demo Data

**Monthly Financial Overview:**
- **Income**: RM 10,950 (3 streams)
  - Software Engineer: RM 8,000
  - Freelance: RM 2,500  
  - Investments: RM 450
- **Expenses**: RM 4,800 (including RM 1,500 startup burn)
- **Savings**: RM 6,150 (56.2% savings rate)
- **Health Score**: 85/100 (Excellent)

**Active Goals:**
- 🚗 **Toyota GT86**: RM 32,000 / RM 90,000 (35.6% - Level 2)
- 🆘 **Emergency Fund**: RM 15,000 / RM 18,000 (83.3% - Level 4)
- 🏠 **Property DP**: RM 8,000 / RM 35,000 (22.9% - Level 1)

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd wealthify
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Visit `http://localhost:3000`** and sign in with Google!

## 📚 Setup Guide

For detailed setup instructions including NeonDB and Google OAuth configuration, see **[SETUP.md](SETUP.md)**.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI**: Shadcn/ui + Recharts for data visualization  
- **Database**: PostgreSQL (NeonDB) + Prisma ORM
- **Auth**: NextAuth.js with Google OAuth
- **State**: Zustand stores
- **Deployment**: Vercel-ready

## 🎮 Features

### ✅ **Implemented**
- [x] **Multi-Stream Income Tracking**
- [x] **Smart Expense Categories** (Fixed, Variable, Startup Burn)
- [x] **Gamified Goal System** with XP bars and milestones
- [x] **Financial Health Scoring** (burn rate, savings rate)
- [x] **Real-time Calculations** and dashboard updates
- [x] **Authentication & User Management**
- [x] **Database Integration** with NeonDB

### 🚧 **Next Up (Phase 4)**
- [ ] **Interactive Forms** (Add/Edit Income, Expenses, Goals)
- [ ] **Goal Contribution System**
- [ ] **Affordability Simulator**
- [ ] **Charts & Analytics** with Recharts
- [ ] **Reports Generation**

### 💡 **Future Features**
- [ ] **Mobile App** (React Native)
- [ ] **Expense Import** from bank statements
- [ ] **Investment Tracking**
- [ ] **Debt Payoff Planner**
- [ ] **Team Goals** (family finances)

## 📱 Screenshots

### Dashboard Overview
Beautiful financial overview with gamified progress tracking and real-time calculations.

### Goal Progress Cards  
XP-style progress bars with milestone achievements and level badges.

### Authentication
Secure Google OAuth integration with modern sign-in flow.

## 🇲🇾 Malaysian Focus

Built specifically for Malaysian financial management:
- **Ringgit Malaysia (RM)** currency formatting
- **Local income examples** (software engineer, freelancer, entrepreneur)
- **Malaysian goal examples** (property down payments, car purchases)
- **Startup-friendly** expense tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with modern React patterns and best practices
- Inspired by gamification principles in fintech
- Designed for the Malaysian entrepreneur ecosystem

---

**Ready to turn every ringgit into a milestone?** 🎯

Start your financial journey: `npm run dev`
