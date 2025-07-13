-- Drop the existing foreign key constraint
ALTER TABLE "goal_contributions" DROP CONSTRAINT "goal_contributions_goalId_fkey";
 
-- Add the new foreign key constraint with CASCADE delete
ALTER TABLE "goal_contributions" ADD CONSTRAINT "goal_contributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE; 