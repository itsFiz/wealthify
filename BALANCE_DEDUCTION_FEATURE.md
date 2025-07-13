# Balance Deduction Feature for Goal Contributions

## Overview

This feature implements realistic financial modeling by deducting goal contributions from the user's current balance, providing a more accurate representation of their actual financial position.

## Key Changes

### 1. API Changes

#### Contribution Creation (`/api/goals/[id]/contributions`)
- **Balance Validation**: Checks if user has sufficient balance before allowing contribution
- **Balance Deduction**: Deducts contribution amount from user's current balance
- **Balance Entry Tracking**: Creates a `BalanceEntry` record with type `GOAL_CONTRIBUTION`
- **Transaction Safety**: Uses database transactions to ensure data consistency

#### Contribution Deletion (`/api/goals/[id]/contributions/[contributionId]`)
- **Balance Restoration**: Adds the contribution amount back to user's current balance
- **Balance Entry Tracking**: Creates a reversal entry for audit trail
- **Transaction Safety**: Uses database transactions to ensure data consistency

### 2. Balance Calculation Updates

#### Enhanced `calculateAccumulatedBalance()` Function
- **Goal Contributions Parameter**: Now accepts goal contributions as a separate parameter
- **Monthly Breakdown**: Includes goal contributions in monthly financial calculations
- **Accurate Balance**: Provides more realistic balance projections

### 3. Frontend Updates

#### Dashboard
- **Goal Contributions Fetching**: Fetches all goal contributions for balance calculations
- **Real-time Balance Updates**: Updates balance immediately after contributions
- **Enhanced Error Handling**: Shows specific error messages for insufficient balance

#### Contribution Form
- **Balance Validation**: Prevents contributions exceeding available balance
- **Balance Impact Display**: Shows how contribution will affect current balance
- **Real-time Feedback**: Updates balance impact as user types

#### Contribution Modal
- **Balance Integration**: Passes current balance to contribution form
- **Enhanced UX**: Provides immediate feedback on balance impact

### 4. Migration Script

#### `scripts/adjust-balances-for-contributions.js`
- **Historical Balance Adjustment**: Adjusts existing user balances for historical contributions
- **Balance Entry Creation**: Creates audit trail for balance adjustments
- **Safe Migration**: Uses transactions and proper error handling

## Database Schema

### BalanceEntry Model
```prisma
model BalanceEntry {
  id            String   @id @default(cuid())
  userId        String
  amount        Decimal  // New balance amount
  previousAmount Decimal @default(0) // Previous balance for tracking
  changeAmount  Decimal  @default(0) // Change from previous
  entryType     BalanceEntryType @default(MANUAL_UPDATE)
  notes         String?
  entryDate     DateTime @default(now())
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@map("balance_entries")
}
```

### BalanceEntryType Enum
```prisma
enum BalanceEntryType {
  MANUAL_UPDATE      // User manually updated balance
  AUTOMATIC_SYNC     // Synced from bank/financial institution
  GOAL_CONTRIBUTION  // Balance change from goal contribution
  INCOME_RECEIVED    // Balance increase from income
  EXPENSE_PAID       // Balance decrease from expense
  CORRECTION         // Manual correction/adjustment
}
```

## Usage

### For New Users
The feature works automatically - all new contributions will be deducted from balance.

### For Existing Users
Run the migration script to adjust balances for historical contributions:

```bash
npm run db:adjust-balances
```

### API Responses

#### Successful Contribution Creation
```json
{
  "contribution": { ... },
  "goal": { ... },
  "balanceEntry": { ... },
  "newBalance": 5000.00
}
```

#### Insufficient Balance Error
```json
{
  "error": "Insufficient balance",
  "details": {
    "required": 1000.00,
    "available": 500.00,
    "shortfall": 500.00
  }
}
```

## Benefits

1. **Realistic Financial Modeling**: Balance reflects actual money movement
2. **Better Financial Planning**: Users can't over-commit to goals
3. **Improved Decision Making**: Clear visibility of balance impact
4. **Audit Trail**: Complete tracking of balance changes
5. **Data Consistency**: Transaction-based operations prevent inconsistencies

## Considerations

1. **Backward Compatibility**: Existing users need balance adjustment
2. **User Education**: Users may need to understand the new behavior
3. **Balance Accuracy**: Requires accurate starting balance setup
4. **Performance**: Additional API calls for balance calculations

## Future Enhancements

1. **Balance Notifications**: Alert users when balance is low
2. **Contribution Limits**: Set maximum contribution amounts
3. **Balance Projections**: Show future balance based on planned contributions
4. **Goal Prioritization**: Suggest contribution amounts based on balance
5. **Integration**: Connect with actual bank accounts for real-time balance 