# 🚀 Wealthify Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- NeonDB account (free tier available)
- Google Cloud Console account (for OAuth)

## 🗄️ Database Setup (NeonDB)

### 1. Create NeonDB Database

1. Go to [NeonDB Console](https://console.neon.tech/)
2. Create a new project: **wealthify**
3. Copy the connection string from your dashboard
4. It should look like: `postgresql://username:password@ep-example-12345.us-east-1.postgres.neon.tech/neondb?sslmode=require`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@ep-example-12345.us-east-1.postgres.neon.tech/neondb?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Generate NextAuth Secret

```bash
# Generate a secure random string
openssl rand -base64 32
```

## 🔐 Google OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **+ Create Credentials > OAuth client ID**
5. Configure consent screen if prompted
6. Choose **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### 2. Copy Credentials

Copy the **Client ID** and **Client Secret** to your `.env.local` file.

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration

```bash
# Push the schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Seed Database (Optional)

```bash
# Create sample data for development
npx prisma db seed
```

## 🚀 Running the Application

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` and click "Open App" to sign in with Google.

### Production Build

```bash
npm run build
npm start
```

## 🔧 Database Management

### Prisma Studio

```bash
# Open database browser
npx prisma studio
```

### Reset Database

```bash
# Reset and reseed database
npx prisma migrate reset
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy to production
npx prisma migrate deploy
```

## 📊 Features Available

After setup, you'll have access to:

### ✅ **Authentication**
- Google OAuth sign-in
- Session management
- Protected routes

### ✅ **Dashboard**
- **Monthly Income**: RM 10,950 (from 3 streams)
- **Monthly Expenses**: RM 4,800 (including startup burn)
- **Monthly Savings**: RM 6,150 (56.2% savings rate)
- **Financial Health**: 85/100 (Excellent)

### ✅ **Gamified Goals**
- 🚗 Toyota GT86: 35.6% complete (Level 2)
- 🆘 Emergency Fund: 83.3% complete (Level 4)
- 🏠 Property Down Payment: 22.9% complete (Level 1)

### ✅ **Navigation**
- Sidebar with all sections
- User profile integration
- Sign out functionality

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Schema Sync Issues

```bash
# Regenerate client
npx prisma generate

# Push schema changes
npx prisma db push
```

### Google OAuth Issues

1. Check redirect URIs match exactly
2. Ensure OAuth consent screen is configured
3. Verify client ID/secret are correct

## 🔄 Next Steps

1. **Start the dev server**: `npm run dev`
2. **Sign in with Google**
3. **Explore the dashboard**
4. **Add your real financial data**
5. **Set up your goals**

## 📚 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI**: Shadcn/ui components + Recharts
- **Database**: PostgreSQL (NeonDB) + Prisma ORM
- **Auth**: NextAuth.js with Google OAuth
- **State**: Zustand stores
- **Deployment**: Ready for Vercel

## 🎯 Malaysian-Focused Features

- **Currency**: Ringgit Malaysia (RM) formatting
- **Income Examples**: 
  - Software Engineer Salary: RM 8,000
  - Freelance Projects: RM 2,500
  - Investment Dividends: RM 450
- **Goal Examples**:
  - Toyota GT86: RM 90,000
  - Property Down Payment: RM 35,000
  - Emergency Fund: RM 18,000

Happy wealth building! 🎉 